#!/usr/bin/env node
/**
 * سكربت تحديث المدونة تلقائياً عبر Gemini API مع البحث المباشر في الويب (Google Search Grounding).
 *
 * الاستخدام:
 *   GEMINI_API_KEY="your_key" node scripts/update-blog.mjs
 *   GEMINI_API_KEY="your_key" node scripts/update-blog.mjs --dry-run
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DATA_PATH = path.resolve(__dirname, '..', 'blog-data.json');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const IS_DRY_RUN = process.argv.includes('--dry-run');

const CATEGORY_LABELS = {
  standards: 'معايير W3C',
  ai: 'الذكاء الاصطناعي',
  research: 'أبحاث وتقنيات',
};

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function getCurrentArabicMonthYear() {
  const now = new Date();
  return `${ARABIC_MONTHS[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
}

function slugify(raw, fallbackDate) {
  const cleaned = String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `a11y-article-${fallbackDate}`;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('لم يتم العثور على كائن JSON صالح في استجابة Gemini.');
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}

function extractGroundingSources(apiResponse) {
  const chunks =
    apiResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const seen = new Set();
  const sources = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title;
    if (uri && /^https?:\/\//i.test(uri) && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        title: title || uri,
        url: uri,
      });
    }
    if (sources.length >= 4) break;
  }

  return sources;
}

function validateArticle(article, existingSlugs) {
  const requiredStrings = [
    'title',
    'excerpt',
    'calloutTitle',
    'calloutText',
    'takeawayTitle',
    'takeawayText',
  ];

  for (const field of requiredStrings) {
    if (typeof article[field] !== 'string' || article[field].trim().length < 6) {
      throw new Error(`الحقل المطلوب غير مكتمل أو غير صالح: ${field}`);
    }
  }

  const category = CATEGORY_LABELS[article.category] ? article.category : 'research';
  const dateTag = new Date().toISOString().slice(0, 10);
  let slug = slugify(article.slug, dateTag);

  if (existingSlugs.has(slug)) {
    slug = `${slug}-${dateTag}`;
  }

  if (!Array.isArray(article.sections) || article.sections.length === 0) {
    throw new Error('المقال لا يحتوي على أقسام (sections) صالحة.');
  }

  const normalizedSections = article.sections
    .filter((sec) => sec && typeof sec.heading === 'string' && sec.heading.trim())
    .map((sec) => {
      const normalized = {
        heading: sec.heading.trim(),
        paragraphs: Array.isArray(sec.paragraphs)
          ? sec.paragraphs.map((p) => String(p).trim()).filter(Boolean)
          : [],
      };
      if (Array.isArray(sec.points) && sec.points.length > 0) {
        normalized.points = sec.points
          .filter((pt) => pt && pt.label && pt.text)
          .map((pt) => ({
            label: String(pt.label).trim(),
            text: String(pt.text).trim(),
          }));
      }
      return normalized;
    });

  if (normalizedSections.length === 0) {
    throw new Error('أقسام المقال فارغة بعد التحقق.');
  }

  return {
    slug,
    featured: false,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    date: getCurrentArabicMonthYear(),
    readTime:
      typeof article.readTime === 'string' && article.readTime.trim()
        ? article.readTime.trim()
        : '4 دقائق قراءة',
    title: article.title.trim(),
    excerpt: article.excerpt.trim(),
    calloutTitle: article.calloutTitle.trim(),
    calloutText: article.calloutText.trim(),
    sections: normalizedSections,
    takeawayTitle: article.takeawayTitle.trim(),
    takeawayText: article.takeawayText.trim(),
  };
}

async function generateNewArticle(existingArticles) {
  const existingTitles = existingArticles
    .map((a, i) => `${i + 1}. ${a.title} (${a.slug})`)
    .join('\n');

  const prompt = `
أنت باحث ومحرر تقني متخصص في الوصولية الرقمية (Digital Accessibility) ومعايير W3C.
ابحث في الويب عن أحدث خبر علمي أو دراسة حديثة أو تطور جديد في أحد هذه المجالات:
- تحديثات معايير W3C / WCAG 2.2 / WCAG 3.0 أو ARIA
- أبحاث وتقنيات الذكاء الاصطناعي في الوصولية الرقمية
- أحدث التقنيات المساعدة (Screen Readers، التفاعل الصوتي، الوصولية الإدراكية، تصميم الواجهات الشاملة)

العناوين الموجودة حالياً في المدونة (يُمنع تكرار أي موضوع منها):
${existingTitles}

المطلوب:
اكتب مقالاً عربياً أصيلاً، موثّقاً، واضحاً، وسهل القراءة (مناسب لمصممي ومطوري الويب العرب)، وأرجع النتيجة ككائن JSON واحد فقط (بدون أي شرح قبله أو بعده) وفق البنية التالية بالضبط:
{
  "slug": "short-english-kebab-case-slug",
  "category": "standards | ai | research",
  "readTime": "4 دقائق قراءة",
  "title": "عنوان عربي جذاب ودقيق",
  "excerpt": "ملخص من جملتين يوضح أهمية الموضوع",
  "calloutTitle": "عنوان صندوق معلومة بارزة",
  "calloutText": "معلومة محورية موجزة وموثّقة",
  "sections": [
    {
      "heading": "عنوان القسم الأول",
      "paragraphs": ["فقرة واضحة", "فقرة ثانية عند الحاجة"],
      "points": [
        { "label": "نقطة رئيسية:", "text": "شرح موجز ودقيق" }
      ]
    },
    {
      "heading": "عنوان القسم الثاني",
      "paragraphs": ["فقرة عملية تشرح كيف يستفيد المصمم والمطور من هذا التطور"]
    }
  ],
  "takeawayTitle": "الخلاصة العملية",
  "takeawayText": "نصيحة تطبيقية مركّزة في سطرين"
}
`.trim();

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    MODEL
  )}:generateContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.6,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`فشل الاتصال بـ Gemini API (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || '')
    .join('\n')
    .trim();

  if (!rawText) {
    throw new Error('أعاد Gemini API استجابة نصية فارغة.');
  }

  const parsed = extractJsonObject(rawText);
  const existingSlugs = new Set(existingArticles.map((a) => a.slug));
  const validated = validateArticle(parsed, existingSlugs);
  const groundingSources = extractGroundingSources(data);

  return {
    ...validated,
    sources: groundingSources,
  };
}

async function main() {
  if (!API_KEY) {
    console.error('خطأ: المتغير البيئي GEMINI_API_KEY غير مضبوط.');
    process.exit(1);
  }

  const rawFile = await readFile(BLOG_DATA_PATH, 'utf8');
  const existingArticles = JSON.parse(rawFile);

  if (!Array.isArray(existingArticles)) {
    throw new Error('ملف blog-data.json يجب أن يحتوي على مصفوفة JSON.');
  }

  console.log(`جاري البحث وتوليد مقال جديد عبر ${MODEL}...`);
  const newArticle = await generateNewArticle(existingArticles);

  if (IS_DRY_RUN) {
    console.log('وضع التجربة (--dry-run) — لم يتم تعديل blog-data.json:');
    console.log(JSON.stringify(newArticle, null, 2));
    return;
  }

  // إبقاء المقال المميز في المقدمة وإدراج المقال الأحدث بعده مباشرة
  const featured = existingArticles.filter((a) => a.featured);
  const regular = existingArticles.filter((a) => !a.featured);
  const updatedArticles = [...featured, newArticle, ...regular];

  await writeFile(
    BLOG_DATA_PATH,
    `${JSON.stringify(updatedArticles, null, 2)}\n`,
    'utf8'
  );

  console.log(`تمت إضافة المقال بنجاح: "${newArticle.title}" (${newArticle.slug})`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
