#!/usr/bin/env node
/**
 * خادم Node.js خفيف ومهيأ للنشر على Railway بدون أي مكتبات خارجية.
 * - يقدّم ملفات الموقع الساكنة ومجلدات الصور بأمان.
 * - يدير قاعدة بيانات SQLite (node:sqlite) للوحة الصدارة في مجلد التخزين الدائم (DATA_DIR أو /data).
 * - يرتّب لوحة الصدارة حسب: عدد المحاور المكتملة (الأكثر أفضل) ثم معدل الوقت المستغرق (الأقصر أفضل)،
 *   ويحسب «المحور الأبرز» لكل لاعب باعتباره المحور الأقل أخطاءً والأسرع إتماماً.
 */

import http from 'node:http';
import { existsSync, mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8000;
const HOST = '0.0.0.0';

/* مسار التخزين الدائم: يستخدم /data تلقائياً عند ربط Railway Volume وإلا ./data محلياً */
const DATA_DIR =
  process.env.DATA_DIR ||
  (existsSync('/data') ? '/data' : path.join(__dirname, 'data'));

mkdirSync(DATA_DIR, { recursive: true });

const SEED_BLOG_PATH = path.join(__dirname, 'blog-data.json');
const RUNTIME_BLOG_PATH = path.join(DATA_DIR, 'blog-data.json');
const DB_PATH = path.join(DATA_DIR, 'leaderboard.sqlite');

if (!existsSync(RUNTIME_BLOG_PATH) && existsSync(SEED_BLOG_PATH)) {
  copyFileSync(SEED_BLOG_PATH, RUNTIME_BLOG_PATH);
}

/* تهيئة وترقية قاعدة بيانات SQLite للوحة الصدارة دون فقدان أي بيانات سابقة */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    topic_id TEXT NOT NULL DEFAULT '',
    topic TEXT NOT NULL,
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    errors INTEGER NOT NULL DEFAULT 0 CHECK (errors >= 0 AND errors <= 100),
    duration_seconds INTEGER NOT NULL DEFAULT 90 CHECK (duration_seconds >= 1 AND duration_seconds <= 7200),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 10000),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const columns = new Set(
  db.prepare('PRAGMA table_info(scores)').all().map((col) => col.name)
);

if (!columns.has('topic_id')) {
  db.exec(`ALTER TABLE scores ADD COLUMN topic_id TEXT NOT NULL DEFAULT ''`);
}
if (!columns.has('errors')) {
  db.exec(`ALTER TABLE scores ADD COLUMN errors INTEGER NOT NULL DEFAULT 0`);
}
if (!columns.has('duration_seconds')) {
  db.exec(`ALTER TABLE scores ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 90`);
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_scores_player ON scores (name, topic);
`);

const SEED_ATTEMPTS = [
  /* سارة العتيبي — 4 محاور مكتملة، الأبرز: الألوان والمظهر (0 أخطاء، 48 ث) */
  { name: 'سارة العتيبي', topicId: 'color-appearance', topic: 'الألوان والمظهر', accuracy: 100, errors: 0, durationSeconds: 48, score: 440, daysAgo: 1 },
  { name: 'سارة العتيبي', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 100, errors: 0, durationSeconds: 92, score: 1040, daysAgo: 1 },
  { name: 'سارة العتيبي', topicId: 'interactive-focus', topic: 'التركيز التفاعلي', accuracy: 86, errors: 1, durationSeconds: 84, score: 660, daysAgo: 2 },
  { name: 'سارة العتيبي', topicId: 'touch-targets', topic: 'اللمس وأحجام الأهداف', accuracy: 100, errors: 0, durationSeconds: 56, score: 220, daysAgo: 2 },

  /* خالد الحربي — 3 محاور مكتملة، الأبرز: التركيز التفاعلي (0 أخطاء، 62 ث) */
  { name: 'خالد الحربي', topicId: 'interactive-focus', topic: 'التركيز التفاعلي', accuracy: 100, errors: 0, durationSeconds: 62, score: 800, daysAgo: 2 },
  { name: 'خالد الحربي', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 88, score: 900, daysAgo: 2 },
  { name: 'خالد الحربي', topicId: 'forms-friction', topic: 'النماذج وتقليل العوائق', accuracy: 100, errors: 0, durationSeconds: 72, score: 680, daysAgo: 3 },

  /* نورة القحطاني — 3 محاور مكتملة، وقت أطول قليلاً من خالد */
  { name: 'نورة القحطاني', topicId: 'forms-friction', topic: 'النماذج وتقليل العوائق', accuracy: 100, errors: 0, durationSeconds: 70, score: 680, daysAgo: 9 },
  { name: 'نورة القحطاني', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 104, score: 880, daysAgo: 9 },
  { name: 'نورة القحطاني', topicId: 'typography-reading', topic: 'الطباعة والقراءة', accuracy: 100, errors: 0, durationSeconds: 82, score: 440, daysAgo: 10 },

  /* عبدالله الشمري — محوران */
  { name: 'عبدالله الشمري', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 78, score: 900, daysAgo: 3 },
  { name: 'عبدالله الشمري', topicId: 'layout-structure', topic: 'التخطيط والبنية', accuracy: 100, errors: 0, durationSeconds: 54, score: 340, daysAgo: 3 },

  /* ريم الدوسري — محوران */
  { name: 'ريم الدوسري', topicId: 'typography-reading', topic: 'الطباعة والقراءة', accuracy: 100, errors: 0, durationSeconds: 68, score: 440, daysAgo: 11 },
  { name: 'ريم الدوسري', topicId: 'media-images', topic: 'الوسائط والصور', accuracy: 67, errors: 1, durationSeconds: 96, score: 200, daysAgo: 12 },

  /* فيصل الزهراني — محور واحد */
  { name: 'فيصل الزهراني', topicId: 'layout-structure', topic: 'التخطيط والبنية', accuracy: 100, errors: 0, durationSeconds: 58, score: 340, daysAgo: 4 },
];

const existingCount = db.prepare('SELECT COUNT(*) AS count FROM scores').get().count;
if (existingCount === 0) {
  const insertSeed = db.prepare(
    `INSERT INTO scores (name, topic_id, topic, accuracy, errors, duration_seconds, score, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
  );
  for (const row of SEED_ATTEMPTS) {
    insertSeed.run(
      row.name,
      row.topicId,
      row.topic,
      row.accuracy,
      row.errors,
      row.durationSeconds,
      row.score,
      `-${row.daysAgo} days`
    );
  }
}

/* حد بسيط لطلبات الإرسال لكل عنوان IP لمنع الإغراق */
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 15;
  const recent = (rateLimitMap.get(ip) || []).filter((ts) => now - ts < windowMs);
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return recent.length > maxRequests;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const BLOCKED_TOP_LEVEL = new Set([
  'data',
  'scripts',
  'server.mjs',
  'package.json',
  'railway.json',
]);

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(body);
}

async function readJsonBody(req, maxBytes = 8192) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function isBetterAttempt(candidate, currentBest) {
  if (!currentBest) return true;
  if (candidate.errors !== currentBest.errors) {
    return candidate.errors < currentBest.errors;
  }
  if (candidate.duration_seconds !== currentBest.duration_seconds) {
    return candidate.duration_seconds < currentBest.duration_seconds;
  }
  return candidate.accuracy > currentBest.accuracy;
}

function getAggregatedLeaderboard(filter = 'all') {
  const rows = db
    .prepare(
      `SELECT
         name,
         topic_id,
         topic,
         accuracy,
         errors,
         duration_seconds,
         score,
         created_at,
         CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 ELSE 0 END AS is_recent_week
       FROM scores`
    )
    .all();

  const playersMap = new Map();

  for (const row of rows) {
    const playerKey = String(row.name || '').trim().toLowerCase();
    if (!playerKey) continue;

    if (!playersMap.has(playerKey)) {
      playersMap.set(playerKey, {
        name: String(row.name).trim(),
        topicsMap: new Map(),
        isRecentWeek: false,
        latestAt: row.created_at || '',
      });
    }

    const player = playersMap.get(playerKey);
    if (row.is_recent_week) player.isRecentWeek = true;
    if ((row.created_at || '') > player.latestAt) {
      player.latestAt = row.created_at || '';
      player.name = String(row.name).trim();
    }

    const topicKey = (row.topic_id && row.topic_id.trim()) || String(row.topic || '').trim();
    const existingBest = player.topicsMap.get(topicKey);
    if (isBetterAttempt(row, existingBest)) {
      player.topicsMap.set(topicKey, row);
    }
  }

  const allPlayers = [];
  for (const player of playersMap.values()) {
    const bestAttempts = Array.from(player.topicsMap.values());
    if (bestAttempts.length === 0) continue;

    const topicsCompleted = bestAttempts.length;
    const avgDurationSeconds = Math.round(
      bestAttempts.reduce((sum, a) => sum + Number(a.duration_seconds || 0), 0) /
        topicsCompleted
    );
    const avgAccuracy = Math.round(
      bestAttempts.reduce((sum, a) => sum + Number(a.accuracy || 0), 0) /
        topicsCompleted
    );

    /* المحور الأبرز: الأقل أخطاءً ثم الأقل وقتاً لإتمامه */
    let standout = bestAttempts[0];
    for (const attempt of bestAttempts) {
      if (isBetterAttempt(attempt, standout)) {
        standout = attempt;
      }
    }

    allPlayers.push({
      name: player.name,
      topicsCompleted,
      avgDurationSeconds,
      avgAccuracy,
      bestTopic: standout.topic,
      bestTopicErrors: Number(standout.errors || 0),
      bestTopicDurationSeconds: Number(standout.duration_seconds || 0),
      period: player.isRecentWeek ? 'week' : 'all',
      latestAt: player.latestAt,
    });
  }

  /* الترتيب: الأكثر محاور أولاً، ثم الأقصر في معدل الوقت، ثم الأعلى دقة */
  allPlayers.sort((a, b) => {
    if (b.topicsCompleted !== a.topicsCompleted) {
      return b.topicsCompleted - a.topicsCompleted;
    }
    if (a.avgDurationSeconds !== b.avgDurationSeconds) {
      return a.avgDurationSeconds - b.avgDurationSeconds;
    }
    if (b.avgAccuracy !== a.avgAccuracy) {
      return b.avgAccuracy - a.avgAccuracy;
    }
    return a.latestAt.localeCompare(b.latestAt);
  });

  const filtered = allPlayers
    .filter((entry) => {
      if (filter === 'week') return entry.period === 'week';
      if (filter === 'perfect') return entry.avgAccuracy >= 95;
      return true;
    })
    .slice(0, 50);

  return { entries: filtered, total: allPlayers.length };
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

const SHARE_TOPIC_NAMES = {
  'navigation-predictability': 'التنقل وقابلية التنبؤ',
  'interactive-focus': 'التركيز التفاعلي',
  'forms-friction': 'النماذج وتقليل العوائق',
  'color-appearance': 'الألوان والمظهر',
  'typography-reading': 'الطباعة والقراءة',
  'animation-motion': 'الحركة والرسوم المتحركة',
  'layout-structure': 'التخطيط والبنية',
  'media-images': 'الوسائط والصور',
  'input-gestures': 'الإدخال والإيماءات',
  'touch-targets': 'اللمس وأحجام الأهداف',
};

function escapeHtmlAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatShareDuration(sec) {
  const s = Math.max(1, Math.min(7200, Math.round(Number(sec) || 60)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} ث`;
  if (r === 0) return `${m} د`;
  return `${m} د ${r} ث`;
}

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

    /* 0. صفحة مشاركة مخصّصة لـ LinkedIn Open Graph (تُظهر صورة الموقع ونتيجة المحور في البوست) */
    if (pathname === '/share' && (req.method === 'GET' || req.method === 'HEAD')) {
      const topicId = reqUrl.searchParams.get('topic') || '';
      const topicAr = SHARE_TOPIC_NAMES[topicId];
      const correct = Math.max(0, Math.min(50, Math.round(Number(reqUrl.searchParams.get('correct') || 0))));
      const total = Math.max(1, Math.min(50, Math.round(Number(reqUrl.searchParams.get('total') || 9))));
      const acc = Math.max(0, Math.min(100, Math.round(Number(reqUrl.searchParams.get('acc') || 100))));
      const sec = reqUrl.searchParams.get('sec');

      const baseOrigin = 'https://accessibility-game.up.railway.app';
      const canonicalUrl = `${baseOrigin}${reqUrl.pathname}${reqUrl.search}`;
      const ogTitle = topicAr
        ? `أتممت محور «${topicAr}» بدقة ${acc}% في تحدّي الوصولية!`
        : 'تحدّي الوصولية — اختبر مهاراتك في معايير WCAG 2.2';
      const ogDesc = topicAr
        ? `${correct} من ${total} تحديات صحيحة${sec ? ` خلال ${formatShareDuration(sec)}` : ''} وفق معايير WCAG 2.2 — جرّب اختبار مهاراتك في الوصولية الرقمية الآن!`
        : 'لعبة تعليمية تفاعلية لاكتشاف أخطاء الوصولية الرقمية عبر 10 محاور و45 تحدياً بصرياً ضمن مبادرات #عام_الذكاء_الاصطناعي.';

      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtmlAttr(ogTitle)}</title>
  <meta name="description" content="${escapeHtmlAttr(ogDesc)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:site_name" content="تحدّي الوصولية">
  <meta property="og:title" content="${escapeHtmlAttr(ogTitle)}">
  <meta property="og:description" content="${escapeHtmlAttr(ogDesc)}">
  <meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}">
  <meta property="og:image" content="${baseOrigin}/og-share-card.png">
  <meta property="og:image:secure_url" content="${baseOrigin}/og-share-card.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtmlAttr(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtmlAttr(ogDesc)}">
  <meta name="twitter:image" content="${baseOrigin}/og-share-card.png">
  <meta http-equiv="refresh" content="0;url=${baseOrigin}/">
</head>
<body>
  <p>جاري تحويلك إلى <a href="${baseOrigin}/">تحدّي الوصولية</a>...</p>
  <script>window.location.replace('${baseOrigin}/');</script>
</body>
</html>`;

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(req.method === 'HEAD' ? undefined : html);
    }

    /* 1. فحص الصحة لـ Railway */
    if (pathname === '/api/health' && req.method === 'GET') {
      const totalScores = db.prepare('SELECT COUNT(*) AS count FROM scores').get().count;
      return sendJson(res, 200, {
        ok: true,
        service: 'accessibility-game',
        scoresCount: totalScores,
      });
    }

    /* 2. واجهة المقالات */
    if (pathname === '/api/blog' && req.method === 'GET') {
      const targetBlogPath = existsSync(RUNTIME_BLOG_PATH)
        ? RUNTIME_BLOG_PATH
        : SEED_BLOG_PATH;
      const articles = JSON.parse(readFileSync(targetBlogPath, 'utf8'));
      return sendJson(res, 200, articles);
    }

    /* 3. واجهة لوحة الصدارة (قراءة مجمّعة لكل لاعب) */
    if (pathname === '/api/leaderboard' && req.method === 'GET') {
      const filter = reqUrl.searchParams.get('filter') || 'all';
      const result = getAggregatedLeaderboard(filter);
      return sendJson(res, 200, result);
    }

    /* 4. واجهة لوحة الصدارة (إضافة نتيجة محور للاعب) */
    if (pathname === '/api/leaderboard' && req.method === 'POST') {
      const ip = getClientIp(req);
      if (isRateLimited(ip)) {
        return sendJson(res, 429, { error: 'تم تجاوز الحد المسموح مؤقتاً، حاول بعد دقيقة.' });
      }

      let body;
      try {
        body = await readJsonBody(req);
      } catch (err) {
        const status = err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
        return sendJson(res, status, { error: 'بيانات الطلب غير صالحة.' });
      }

      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const topicId = typeof body.topicId === 'string' ? body.topicId.trim().slice(0, 60) : '';
      const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 60) : 'تحدّي شامل';
      const accuracy = Math.round(Number(body.accuracy));
      const errors = Math.round(Number(body.errors ?? 0));
      const durationSeconds = Math.round(Number(body.durationSeconds ?? 60));
      const score = Math.round(Number(body.score ?? 0));

      if (name.length < 2 || name.length > 30) {
        return sendJson(res, 400, { error: 'يجب أن يكون الاسم بين حرفين و30 حرفاً.' });
      }
      if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
        return sendJson(res, 400, { error: 'قيمة الدقة غير صالحة.' });
      }
      if (!Number.isFinite(errors) || errors < 0 || errors > 100) {
        return sendJson(res, 400, { error: 'قيمة الأخطاء غير صالحة.' });
      }
      if (!Number.isFinite(durationSeconds) || durationSeconds < 1 || durationSeconds > 7200) {
        return sendJson(res, 400, { error: 'قيمة الوقت غير صالحة.' });
      }
      if (!Number.isFinite(score) || score < 0 || score > 10000) {
        return sendJson(res, 400, { error: 'قيمة النقاط غير صالحة.' });
      }

      const insert = db.prepare(
        `INSERT INTO scores (name, topic_id, topic, accuracy, errors, duration_seconds, score)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      const result = insert.run(
        name,
        topicId,
        topic,
        accuracy,
        errors,
        durationSeconds,
        score
      );

      return sendJson(res, 201, {
        id: Number(result.lastInsertRowid),
        name,
        topicId,
        topic,
        accuracy,
        errors,
        durationSeconds,
        score,
        period: 'week',
      });
    }

    /* 5. تقديم الملفات الساكنة بأمان */
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Method Not Allowed');
    }

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Bad Request');
    }

    const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
    const segments = relativePath.split('/').filter(Boolean);

    if (
      segments.some((seg) => seg === '..' || seg.startsWith('.')) ||
      (segments.length > 0 && BLOCKED_TOP_LEVEL.has(segments[0]))
    ) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }

    const filePath = path.resolve(__dirname, relativePath);
    if (!filePath.startsWith(__dirname + path.sep) && filePath !== path.join(__dirname, 'index.html')) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }

    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isHtmlOrJson = ext === '.html' || ext === '.json';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isHtmlOrJson ? 'no-cache' : 'public, max-age=3600',
    });

    if (req.method === 'HEAD') {
      return res.end();
    }

    const content = await readFile(filePath);
    res.end(content);
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'حدث خطأ داخلي في الخادم.' });
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Accessibility Game server listening on http://${HOST}:${PORT}`);
  console.log(`Persistent storage directory: ${DATA_DIR}`);
});
