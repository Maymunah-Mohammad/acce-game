#!/usr/bin/env node
/**
 * خادم Node.js خفيف ومهيأ للنشر على Railway بدون أي مكتبات خارجية.
 * - يقدّم ملفات الموقع الساكنة ومجلدات الصور بأمان.
 * - يدير قاعدة بيانات SQLite (node:sqlite) للوحة الصدارة في مجلد التخزين الدائم (DATA_DIR أو /data).
 * - يقدّم واجهة API للمقالات (/api/blog) ولوحة الصدارة (/api/leaderboard) وفحص الصحة (/api/health).
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

/* تهيئة قاعدة بيانات SQLite للوحة الصدارة */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    topic TEXT NOT NULL,
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores (score DESC, accuracy DESC, created_at ASC);
`);

const SEED_SCORES = [
  { name: 'سارة العتيبي', topic: 'الألوان والمظهر', accuracy: 98, score: 4250, daysAgo: 1 },
  { name: 'خالد الحربي', topic: 'التركيز التفاعلي', accuracy: 96, score: 3980, daysAgo: 2 },
  { name: 'نورة القحطاني', topic: 'النماذج وتقليل العوائق', accuracy: 95, score: 3820, daysAgo: 10 },
  { name: 'عبدالله الشمري', topic: 'التنقل وقابلية التنبؤ', accuracy: 92, score: 3610, daysAgo: 3 },
  { name: 'ريم الدوسري', topic: 'الطباعة والقراءة', accuracy: 90, score: 3440, daysAgo: 12 },
  { name: 'فيصل الزهراني', topic: 'التخطيط والبنية', accuracy: 88, score: 3190, daysAgo: 4 },
];

const existingCount = db.prepare('SELECT COUNT(*) AS count FROM scores').get().count;
if (existingCount === 0) {
  const insertSeed = db.prepare(
    `INSERT INTO scores (name, topic, accuracy, score, created_at)
     VALUES (?, ?, ?, ?, datetime('now', ?))`
  );
  for (const row of SEED_SCORES) {
    insertSeed.run(row.name, row.topic, row.accuracy, row.score, `-${row.daysAgo} days`);
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

function getLeaderboardRows(filter) {
  let sql = `
    SELECT
      id,
      name,
      topic,
      accuracy,
      score,
      created_at,
      CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 'week' ELSE 'all' END AS period
    FROM scores
  `;

  if (filter === 'week') {
    sql += ` WHERE datetime(created_at) >= datetime('now', '-7 days')`;
  } else if (filter === 'perfect') {
    sql += ` WHERE accuracy >= 95`;
  }

  sql += ` ORDER BY score DESC, accuracy DESC, created_at ASC LIMIT 50`;
  return db.prepare(sql).all();
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

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

    /* 3. واجهة لوحة الصدارة (قراءة) */
    if (pathname === '/api/leaderboard' && req.method === 'GET') {
      const filter = reqUrl.searchParams.get('filter') || 'all';
      const rows = getLeaderboardRows(filter);
      const total = db.prepare('SELECT COUNT(*) AS count FROM scores').get().count;
      return sendJson(res, 200, { entries: rows, total });
    }

    /* 4. واجهة لوحة الصدارة (إضافة نتيجة لاعب) */
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
      const topic = typeof body.topic === 'string' ? body.topic.trim() : 'تحدّي شامل';
      const accuracy = Math.round(Number(body.accuracy));
      const score = Math.round(Number(body.score));

      if (name.length < 2 || name.length > 30) {
        return sendJson(res, 400, { error: 'يجب أن يكون الاسم بين حرفين و30 حرفاً.' });
      }
      if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
        return sendJson(res, 400, { error: 'قيمة الدقة غير صالحة.' });
      }
      if (!Number.isFinite(score) || score < 0 || score > 10000) {
        return sendJson(res, 400, { error: 'قيمة النقاط غير صالحة.' });
      }

      const insert = db.prepare(
        'INSERT INTO scores (name, topic, accuracy, score) VALUES (?, ?, ?, ?)'
      );
      const result = insert.run(name, topic.slice(0, 60), accuracy, score);

      return sendJson(res, 201, {
        id: Number(result.lastInsertRowid),
        name,
        topic: topic.slice(0, 60),
        accuracy,
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
