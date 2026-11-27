#!/usr/bin/env node
/**
 * خادم Node.js خفيف ومهيأ للنشر على Railway بدون أي مكتبات خارجية.
 * - يقدّم ملفات الموقع الساكنة ومجلدات الصور بأمان.
 * - يدير المصادقة الحقيقية عبر Google و LinkedIn (OAuth 2.0 / OpenID Connect) مع جلسات موقّعة بـ HMAC-SHA256.
 * - يدير قاعدة بيانات SQLite (node:sqlite) للمستخدمين ولوحة الصدارة في مجلد التخزين الدائم (DATA_DIR أو /data).
 * - يرتّب لوحة الصدارة حسب: عدد المحاور المكتملة (الأكثر أفضل) ثم معدل الوقت المستغرق (الأقصر أفضل)،
 *   ويحسب «المحور الأبرز» لكل لاعب باعتباره المحور الأقل أخطاءً والأسرع إتماماً.
 */

import http from 'node:http';
import crypto from 'node:crypto';
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
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
const SECRET_PATH = path.join(DATA_DIR, '.session-secret');

if (!existsSync(RUNTIME_BLOG_PATH) && existsSync(SEED_BLOG_PATH)) {
  copyFileSync(SEED_BLOG_PATH, RUNTIME_BLOG_PATH);
}

/* سر توقيع الجلسات: يُقرأ من المتغير البيئي أو يُولَّد ويُحفظ محلياً في DATA_DIR */
function loadOrCreateSessionSecret() {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16) {
    return process.env.SESSION_SECRET.trim();
  }
  if (existsSync(SECRET_PATH)) {
    const saved = readFileSync(SECRET_PATH, 'utf8').trim();
    if (saved.length >= 16) return saved;
  }
  const generated = crypto.randomBytes(32).toString('hex');
  writeFileSync(SECRET_PATH, generated, { mode: 0o600 });
  return generated;
}

const SESSION_SECRET = loadOrCreateSessionSecret();
const SESSION_COOKIE = 'a11y_session';
const OAUTH_STATE_COOKIE = 'a11y_oauth_state';
const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60; /* 30 يوماً */

/* تحميل ملف .env.local محلياً فقط عند التطوير (دون الكتابة فوق متغيرات Railway) */
for (const envName of ['.env.local', '.env']) {
  const envPath = path.join(__dirname, envName);
  if (!existsSync(envPath)) continue;
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const LINKEDIN_CLIENT_ID = (process.env.LINKEDIN_CLIENT_ID || '').trim();
const LINKEDIN_CLIENT_SECRET = (process.env.LINKEDIN_CLIENT_SECRET || '').trim();
const ADMIN_RESET_KEY = (process.env.ADMIN_RESET_KEY || '').trim();

const hasGoogleAuth = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
const hasLinkedInAuth = Boolean(LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET);

/* تهيئة وترقية قاعدة بيانات SQLite (المستخدمون + لوحة الصدارة) دون فقدان أي بيانات سابقة */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'linkedin')),
    provider_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (provider, provider_id)
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    topic_id TEXT NOT NULL DEFAULT '',
    topic TEXT NOT NULL,
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    errors INTEGER NOT NULL DEFAULT 0 CHECK (errors >= 0 AND errors <= 100),
    duration_seconds INTEGER NOT NULL DEFAULT 90 CHECK (duration_seconds >= 1 AND duration_seconds <= 7200),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 10000),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    activity_type TEXT NOT NULL CHECK (activity_type IN ('article', 'event')),
    item_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, activity_type, item_id)
  );
`);

const scoreColumns = new Set(
  db.prepare('PRAGMA table_info(scores)').all().map((col) => col.name)
);

if (!scoreColumns.has('user_id')) {
  db.exec(`ALTER TABLE scores ADD COLUMN user_id INTEGER REFERENCES users(id)`);
}
if (!scoreColumns.has('topic_id')) {
  db.exec(`ALTER TABLE scores ADD COLUMN topic_id TEXT NOT NULL DEFAULT ''`);
}
if (!scoreColumns.has('errors')) {
  db.exec(`ALTER TABLE scores ADD COLUMN errors INTEGER NOT NULL DEFAULT 0`);
}
if (!scoreColumns.has('duration_seconds')) {
  db.exec(`ALTER TABLE scores ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 90`);
}
if (!scoreColumns.has('duration_ms')) {
  db.exec(`ALTER TABLE scores ADD COLUMN duration_ms INTEGER NOT NULL DEFAULT 0`);
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_scores_player ON scores (name, topic);
  CREATE INDEX IF NOT EXISTS idx_scores_user ON scores (user_id, topic_id);
`);

const SEED_ATTEMPTS = [
  { name: 'سارة العتيبي', topicId: 'color-appearance', topic: 'الألوان والمظهر', accuracy: 100, errors: 0, durationSeconds: 48, score: 440, daysAgo: 1 },
  { name: 'سارة العتيبي', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 100, errors: 0, durationSeconds: 92, score: 1040, daysAgo: 1 },
  { name: 'سارة العتيبي', topicId: 'interactive-focus', topic: 'التركيز التفاعلي', accuracy: 86, errors: 1, durationSeconds: 84, score: 660, daysAgo: 2 },
  { name: 'سارة العتيبي', topicId: 'touch-targets', topic: 'اللمس وأحجام الأهداف', accuracy: 100, errors: 0, durationSeconds: 56, score: 220, daysAgo: 2 },

  { name: 'خالد الحربي', topicId: 'interactive-focus', topic: 'التركيز التفاعلي', accuracy: 100, errors: 0, durationSeconds: 62, score: 800, daysAgo: 2 },
  { name: 'خالد الحربي', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 88, score: 900, daysAgo: 2 },
  { name: 'خالد الحربي', topicId: 'forms-friction', topic: 'النماذج وتقليل العوائق', accuracy: 100, errors: 0, durationSeconds: 72, score: 680, daysAgo: 3 },

  { name: 'نورة القحطاني', topicId: 'forms-friction', topic: 'النماذج وتقليل العوائق', accuracy: 100, errors: 0, durationSeconds: 70, score: 680, daysAgo: 9 },
  { name: 'نورة القحطاني', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 104, score: 880, daysAgo: 9 },
  { name: 'نورة القحطاني', topicId: 'typography-reading', topic: 'الطباعة والقراءة', accuracy: 100, errors: 0, durationSeconds: 82, score: 440, daysAgo: 10 },

  { name: 'عبدالله الشمري', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 78, score: 900, daysAgo: 3 },
  { name: 'عبدالله الشمري', topicId: 'layout-structure', topic: 'التخطيط والبنية', accuracy: 100, errors: 0, durationSeconds: 54, score: 340, daysAgo: 3 },

  { name: 'ريم الدوسري', topicId: 'typography-reading', topic: 'الطباعة والقراءة', accuracy: 100, errors: 0, durationSeconds: 68, score: 440, daysAgo: 11 },
  { name: 'ريم الدوسري', topicId: 'media-images', topic: 'الوسائط والصور', accuracy: 67, errors: 1, durationSeconds: 96, score: 200, daysAgo: 12 },

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

/* أدوات الكوكيز والجلسات الموقّعة */
function parseCookies(req) {
  const header = req.headers.cookie || '';
  const map = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        map[key] = decodeURIComponent(val);
      } catch {
        map[key] = val;
      }
    }
  }
  return map;
}

function signPayload(payloadObj) {
  const encoded = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySignedToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getRequestOrigin(req) {
  if (process.env.APP_ORIGIN && /^https?:\/\//i.test(process.env.APP_ORIGIN)) {
    return process.env.APP_ORIGIN.replace(/\/+$/, '');
  }
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto =
    typeof protoHeader === 'string' && protoHeader.length > 0
      ? protoHeader.split(',')[0].trim()
      : 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function isSecureRequest(req) {
  const origin = getRequestOrigin(req);
  return origin.startsWith('https://');
}

function serializeCookie(name, value, { maxAge, secure, httpOnly = true, sameSite = 'Lax', path: cookiePath = '/' } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${cookiePath}`, `SameSite=${sameSite}`];
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  if (typeof maxAge === 'number') parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

function getSessionUser(req) {
  const cookies = parseCookies(req);
  const data = verifySignedToken(cookies[SESSION_COOKIE]);
  if (!data || !data.uid) return null;
  const user = db
    .prepare('SELECT id, provider, name, email, avatar_url FROM users WHERE id = ?')
    .get(Number(data.uid));
  if (!user) return null;
  return {
    id: user.id,
    provider: user.provider,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
  };
}

function upsertOAuthUser({ provider, providerId, name, email, avatarUrl }) {
  const cleanName = String(name || email?.split('@')[0] || 'لاعب الوصولية').trim().slice(0, 40);
  const cleanEmail = String(email || '').trim().slice(0, 120);
  const cleanAvatar = typeof avatarUrl === 'string' && /^https?:\/\//i.test(avatarUrl) ? avatarUrl.slice(0, 400) : '';

  const existing = db
    .prepare('SELECT id FROM users WHERE provider = ? AND provider_id = ?')
    .get(provider, providerId);

  if (existing) {
    db.prepare(
      `UPDATE users SET name = ?, email = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(cleanName, cleanEmail, cleanAvatar, existing.id);
    return {
      id: existing.id,
      provider,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: cleanAvatar,
    };
  }

  const inserted = db
    .prepare(
      `INSERT INTO users (provider, provider_id, name, email, avatar_url)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(provider, providerId, cleanName, cleanEmail, cleanAvatar);

  return {
    id: Number(inserted.lastInsertRowid),
    provider,
    name: cleanName,
    email: cleanEmail,
    avatarUrl: cleanAvatar,
  };
}

function sanitizeReturnHash(raw) {
  if (typeof raw !== 'string') return '#challenges';
  const trimmed = raw.trim();
  if (/^#[a-z0-9/_-]+$/i.test(trimmed)) return trimmed;
  return '#challenges';
}

/* حد بسيط لطلبات الإرسال لكل عنوان IP لمنع الإغراق */
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 20;
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

function redirect(res, location, cookies = []) {
  const headers = { Location: location, 'Cache-Control': 'no-store' };
  if (cookies.length > 0) {
    headers['Set-Cookie'] = cookies;
  }
  res.writeHead(302, headers);
  res.end();
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

function getRowDurationMs(row) {
  if (!row) return 60_000;
  const ms = Number(row.duration_ms || 0);
  if (Number.isFinite(ms) && ms > 0) return ms;
  const sec = Number(row.duration_seconds ?? row.durationSeconds ?? 60);
  return Math.max(50, Math.round(sec * 1000));
}

function isBetterAttempt(candidate, currentBest) {
  if (!currentBest) return true;
  if (candidate.errors !== currentBest.errors) {
    return candidate.errors < currentBest.errors;
  }
  const candMs = getRowDurationMs(candidate);
  const bestMs = getRowDurationMs(currentBest);
  if (candMs !== bestMs) {
    return candMs < bestMs;
  }
  return candidate.accuracy > currentBest.accuracy;
}

function getAggregatedLeaderboard(filter = 'all') {
  const rows = db
    .prepare(
      `SELECT
         user_id,
         name,
         topic_id,
         topic,
         accuracy,
         errors,
         duration_seconds,
         duration_ms,
         score,
         created_at,
         CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 ELSE 0 END AS is_recent_week
       FROM scores`
    )
    .all();

  const playersMap = new Map();

  for (const row of rows) {
    const playerKey = row.user_id
      ? `uid:${row.user_id}`
      : `name:${String(row.name || '').trim().toLowerCase()}`;
    if (!row.name || !String(row.name).trim()) continue;

    if (!playersMap.has(playerKey)) {
      playersMap.set(playerKey, {
        userId: row.user_id ? Number(row.user_id) : null,
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
    const avgDurationMs = Math.round(
      bestAttempts.reduce((sum, a) => sum + getRowDurationMs(a), 0) / topicsCompleted
    );
    const avgDurationSeconds = Number((avgDurationMs / 1000).toFixed(2));
    const avgAccuracy = Math.round(
      bestAttempts.reduce((sum, a) => sum + Number(a.accuracy || 0), 0) /
        topicsCompleted
    );

    let standout = bestAttempts[0];
    for (const attempt of bestAttempts) {
      if (isBetterAttempt(attempt, standout)) {
        standout = attempt;
      }
    }

    const standoutMs = getRowDurationMs(standout);

    allPlayers.push({
      userId: player.userId,
      name: player.name,
      topicsCompleted,
      avgDurationMs,
      avgDurationSeconds,
      avgAccuracy,
      bestTopic: standout.topic,
      bestTopicErrors: Number(standout.errors || 0),
      bestTopicDurationMs: standoutMs,
      bestTopicDurationSeconds: Number((standoutMs / 1000).toFixed(2)),
      period: player.isRecentWeek ? 'week' : 'all',
      latestAt: player.latestAt,
    });
  }

  allPlayers.sort((a, b) => {
    if (b.topicsCompleted !== a.topicsCompleted) {
      return b.topicsCompleted - a.topicsCompleted;
    }
    if (a.avgDurationMs !== b.avgDurationMs) {
      return a.avgDurationMs - b.avgDurationMs;
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
  const s = Math.max(0.05, Math.min(7200, Number(sec) || 60));
  const m = Math.floor(s / 60);
  const r = Number((s - m * 60).toFixed(2));
  const rStr = r.toFixed(2);
  if (m === 0) return `${rStr} ث`;
  return `${m} د ${rStr} ث`;
}

/* تجميع بيانات الملف الشخصي (الخاص أو العام القابل للمشاركة) */
function buildUserProfilePayload(userId, { includePrivate = false } = {}) {
  const userRow = db
    .prepare('SELECT id, provider, name, email, avatar_url, created_at FROM users WHERE id = ?')
    .get(Number(userId));
  if (!userRow) return null;

  const scoreRows = db
    .prepare(
      `SELECT topic_id, topic, accuracy, errors, duration_seconds, duration_ms, score, created_at
       FROM scores
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC`
    )
    .all(userRow.id);

  const bestByTopic = {};
  for (const row of scoreRows) {
    const key = (row.topic_id && row.topic_id.trim()) || String(row.topic || '').trim();
    if (!key) continue;
    if (isBetterAttempt(row, bestByTopic[key])) {
      const rowMs = getRowDurationMs(row);
      bestByTopic[key] = {
        topicId: key,
        topic: row.topic,
        accuracy: Number(row.accuracy || 0),
        errors: Number(row.errors || 0),
        duration_ms: rowMs,
        durationSeconds: Number((rowMs / 1000).toFixed(2)),
        score: Number(row.score || 0),
        completedAt: row.created_at,
      };
    }
  }

  const lb = getAggregatedLeaderboard('all');
  const rankIdx = lb.entries.findIndex((entry) => entry.userId === userRow.id);
  const lbEntry = rankIdx >= 0 ? lb.entries[rankIdx] : null;
  const bestList = Object.values(bestByTopic);

  const stats = {
    rank: rankIdx >= 0 ? rankIdx + 1 : null,
    totalPlayers: lb.total,
    topicsCompleted: lbEntry ? lbEntry.topicsCompleted : bestList.length,
    avgAccuracy: lbEntry
      ? lbEntry.avgAccuracy
      : bestList.length > 0
        ? Math.round(bestList.reduce((s, r) => s + r.accuracy, 0) / bestList.length)
        : 0,
    avgDurationSeconds: lbEntry
      ? lbEntry.avgDurationSeconds
      : bestList.length > 0
        ? Math.round(bestList.reduce((s, r) => s + r.durationSeconds, 0) / bestList.length)
        : 0,
    bestTopic: lbEntry ? lbEntry.bestTopic : '',
    bestTopicErrors: lbEntry ? lbEntry.bestTopicErrors : 0,
    bestTopicDurationSeconds: lbEntry ? lbEntry.bestTopicDurationSeconds : 0,
  };

  const payload = {
    user: {
      id: userRow.id,
      name: userRow.name,
      provider: userRow.provider,
      avatarUrl: userRow.avatar_url || '',
      memberSince: userRow.created_at || '',
      ...(includePrivate ? { email: userRow.email || '' } : {}),
    },
    stats,
    topicScores: bestByTopic,
  };

  if (includePrivate) {
    const activities = db
      .prepare('SELECT activity_type, item_id FROM user_activity WHERE user_id = ?')
      .all(userRow.id);
    payload.readArticles = activities
      .filter((a) => a.activity_type === 'article')
      .map((a) => a.item_id);
    payload.triedEvents = activities
      .filter((a) => a.activity_type === 'event')
      .map((a) => a.item_id);
  }

  return payload;
}

/* =========================================================================
   محرّك غرف الفعاليات الجماعية الحية (بأسلوب Kahoot & Slido عبر SSE)
   ========================================================================= */

const EVENT_ROOMS = new Map();
const EVENT_ROOM_TTL_MS = 3 * 60 * 60 * 1000; /* 3 ساعات */
const VALID_EVENT_GAMES = new Set(['right-or-left', 'ten-in-a-row', 'speed-blitz']);

function cleanupExpiredEventRooms() {
  const now = Date.now();
  for (const [code, room] of EVENT_ROOMS.entries()) {
    if (now - room.updatedAt > EVENT_ROOM_TTL_MS) {
      for (const client of room.clients) {
        try {
          client.end();
        } catch {
          /* تجاهل */
        }
      }
      EVENT_ROOMS.delete(code);
    }
  }
}

setInterval(cleanupExpiredEventRooms, 15 * 60 * 1000).unref();

function generateRoomCode() {
  for (let i = 0; i < 30; i += 1) {
    const code = String(crypto.randomInt(100000, 999999));
    if (!EVENT_ROOMS.has(code)) return code;
  }
  return String(crypto.randomInt(100000, 999999));
}

function sanitizeEventDeck(rawDeck) {
  if (!Array.isArray(rawDeck)) return [];
  const cleaned = [];
  const seenIds = new Set();
  for (const item of rawDeck.slice(0, 60)) {
    if (!item || typeof item.challengeId !== 'string') continue;
    const challengeId = item.challengeId.trim().slice(0, 80);
    if (!challengeId || seenIds.has(challengeId)) continue;
    seenIds.add(challengeId);
    const goodSide = item.goodSide === 'left' ? 'left' : 'right';
    cleaned.push({ challengeId, goodSide });
  }
  return cleaned;
}

function serializeEventRoom(room) {
  const currentCard = room.deck[room.roundIndex] || null;
  const playersList = Array.from(room.players.values())
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      correctCount: p.correctCount,
      streak: p.streak,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.name.localeCompare(b.name, 'ar');
    });

  let rightVotes = 0;
  let leftVotes = 0;
  for (const vote of room.votes.values()) {
    if (vote.side === 'right') rightVotes += 1;
    else if (vote.side === 'left') leftVotes += 1;
  }
  const totalVotes = rightVotes + leftVotes;

  return {
    code: room.code,
    gameType: room.gameType,
    status: room.status,
    roundIndex: room.roundIndex,
    totalRounds: room.totalRounds,
    streak: room.streak,
    bestStreak: room.bestStreak,
    attemptNumber: room.attemptNumber,
    streakFailed: room.streakFailed,
    won: room.won,
    timerSeconds: room.timerSeconds,
    roundStartedAt: room.roundStartedAt,
    blitzEndsAt: room.blitzEndsAt,
    serverNow: Date.now(),
    currentCard,
    playerCount: room.players.size,
    players: playersList,
    votesCount: totalVotes,
    votes:
      room.status === 'revealed' || room.status === 'finished'
        ? {
            right: rightVotes,
            left: leftVotes,
            total: totalVotes,
            rightPct: totalVotes > 0 ? Math.round((rightVotes / totalVotes) * 100) : 0,
            leftPct: totalVotes > 0 ? Math.round((leftVotes / totalVotes) * 100) : 0,
          }
        : {
            total: totalVotes,
          },
    lastOutcome: room.lastOutcome,
    groupCorrectTotal: room.groupCorrectTotal,
  };
}

function broadcastEventRoom(room) {
  room.updatedAt = Date.now();
  const payload = `data: ${JSON.stringify(serializeEventRoom(room))}\n\n`;
  for (const client of room.clients) {
    try {
      client.write(payload);
    } catch {
      room.clients.delete(client);
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const origin = getRequestOrigin(req);
    const secure = isSecureRequest(req);
    const reqUrl = new URL(req.url || '/', origin);
    const pathname = reqUrl.pathname;

    /* robots.txt للسماح لبوتات المعاينة مثل LinkedInBot بدون 404 */
    if (pathname === '/robots.txt' && (req.method === 'GET' || req.method === 'HEAD')) {
      const robotsTxt = 'User-agent: *\nAllow: /\n';
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      });
      return res.end(req.method === 'HEAD' ? undefined : robotsTxt);
    }

    /* صفحة مشاركة الملف العام للمستخدم مع بطاقة Open Graph مخصّصة لـ LinkedIn */
    const publicProfilePageMatch = pathname.match(/^\/u\/(\d+)$/);
    if (publicProfilePageMatch && (req.method === 'GET' || req.method === 'HEAD')) {
      const targetUid = Number(publicProfilePageMatch[1]);
      const profile = buildUserProfilePayload(targetUid, { includePrivate: false });
      const baseOrigin = 'https://accessibility-game.up.railway.app';
      const canonicalUrl = `${baseOrigin}/u/${targetUid}`;
      const ogTitle = profile
        ? `ملف إنجازات ${profile.user.name} في تحدّي الوصولية (WCAG 2.2)`
        : 'تحدّي الوصولية — اختبر مهاراتك في معايير WCAG 2.2';
      const ogDesc = profile
        ? `أتمّ ${profile.stats.topicsCompleted} من 10 محاور${profile.stats.avgAccuracy ? ` بمتوسط دقة ${profile.stats.avgAccuracy}%` : ''}${profile.stats.rank ? ` • المركز #${profile.stats.rank} في لوحة الصدارة` : ''} — استعرض خريطة المهارات والإنجازات الآن!`
        : 'لعبة تعليمية تفاعلية لمعايير الوصولية الرقمية WCAG 2.2 ضمن مبادرات #عام_الذكاء_الاصطناعي.';

      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtmlAttr(ogTitle)}</title>
  <meta name="description" content="${escapeHtmlAttr(ogDesc)}">
  <meta property="og:type" content="profile">
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
</head>
<body>
  <main>
    <h1>${escapeHtmlAttr(ogTitle)}</h1>
    <p>${escapeHtmlAttr(ogDesc)}</p>
    <p><a href="${baseOrigin}/#u/${targetUid}">عرض ملف الإنجازات التفاعلي</a></p>
  </main>
  <script>window.location.replace('${baseOrigin}/#u/${targetUid}');</script>
</body>
</html>`;

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=180',
      });
      return res.end(req.method === 'HEAD' ? undefined : html);
    }

    /* صفحة مشاركة مخصّصة لـ LinkedIn Open Graph */
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
  <meta property="og:image:alt" content="بطاقة تعريف لعبة تحدّي الوصولية الرقمية WCAG 2.2">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtmlAttr(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtmlAttr(ogDesc)}">
  <meta name="twitter:image" content="${baseOrigin}/og-share-card.png">
</head>
<body>
  <main>
    <h1>${escapeHtmlAttr(ogTitle)}</h1>
    <p>${escapeHtmlAttr(ogDesc)}</p>
    <p><a href="${baseOrigin}/">انتقل إلى لعبة تحدّي الوصولية</a></p>
  </main>
  <script>window.location.replace('${baseOrigin}/');</script>
</body>
</html>`;

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(req.method === 'HEAD' ? undefined : html);
    }

    /* =====================================================================
       مسارات المصادقة (Google OAuth 2.0 + LinkedIn OpenID Connect)
       ===================================================================== */

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = getSessionUser(req);
      return sendJson(res, 200, {
        user,
        providers: {
          google: hasGoogleAuth,
          linkedin: hasLinkedInAuth,
        },
        callbackUrls: {
          google: `${origin}/auth/google/callback`,
          linkedin: `${origin}/auth/linkedin/callback`,
        },
      });
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const clearCookie = serializeCookie(SESSION_COOKIE, '', { maxAge: 0, secure });
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearCookie });
    }

    /* مسح بيانات التجربة للمالك فقط عبر مفتاح سري في متغيرات Railway */
    if (pathname === '/api/admin/reset' && req.method === 'POST') {
      if (!ADMIN_RESET_KEY || ADMIN_RESET_KEY.length < 8) {
        return sendJson(res, 403, { error: 'إعادة الضبط غير مفعّلة.' });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { error: 'طلب غير صالح.' });
      }
      const provided = typeof body.key === 'string' ? body.key.trim() : '';
      const a = Buffer.from(provided);
      const b = Buffer.from(ADMIN_RESET_KEY);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return sendJson(res, 403, { error: 'مفتاح إعادة الضبط غير صحيح.' });
      }

      const seedNames = Array.from(new Set(SEED_ATTEMPTS.map((r) => r.name)));
      const placeholders = seedNames.map(() => '?').join(', ');
      const del = db
        .prepare(`DELETE FROM scores WHERE user_id IS NOT NULL OR name NOT IN (${placeholders})`)
        .run(...seedNames);

      return sendJson(res, 200, {
        ok: true,
        deletedRows: Number(del.changes || 0),
      });
    }

    /* واجهات ملف المستخدم الشخصي والملف العام ونشاط القراءة والفعاليات */
    if (pathname === '/api/profile/me' && req.method === 'GET') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser) {
        return sendJson(res, 401, { error: 'يرجى تسجيل الدخول أولاً.' });
      }
      const profile = buildUserProfilePayload(sessionUser.id, { includePrivate: true });
      return sendJson(res, 200, profile);
    }

    if (pathname === '/api/profile/activity' && req.method === 'POST') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser) {
        return sendJson(res, 200, { ok: false, skipped: true });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { error: 'بيانات النشاط غير صالحة.' });
      }
      const type = body.type === 'article' || body.type === 'event' ? body.type : null;
      const itemId = typeof body.itemId === 'string' ? body.itemId.trim().slice(0, 80) : '';
      if (!type || !itemId) {
        return sendJson(res, 400, { error: 'نوع أو معرّف النشاط غير صالح.' });
      }
      db.prepare(
        `INSERT OR IGNORE INTO user_activity (user_id, activity_type, item_id) VALUES (?, ?, ?)`
      ).run(sessionUser.id, type, itemId);
      return sendJson(res, 200, { ok: true, type, itemId });
    }

    const publicProfileApiMatch = pathname.match(/^\/api\/profile\/public\/(\d+)$/);
    if (publicProfileApiMatch && req.method === 'GET') {
      const targetUid = Number(publicProfileApiMatch[1]);
      const profile = buildUserProfilePayload(targetUid, { includePrivate: false });
      if (!profile) {
        return sendJson(res, 404, { error: 'لم يتم العثور على هذا الملف العام.' });
      }
      return sendJson(res, 200, profile);
    }

    /* بدء تسجيل الدخول عبر Google */
    if (pathname === '/auth/google' && req.method === 'GET') {
      const returnHash = sanitizeReturnHash(reqUrl.searchParams.get('returnTo'));
      if (!hasGoogleAuth) {
        return redirect(res, `/?authError=google_not_configured${returnHash}`);
      }
      const nonce = crypto.randomBytes(16).toString('hex');
      const stateToken = signPayload({
        provider: 'google',
        nonce,
        returnHash,
        exp: Date.now() + 10 * 60 * 1000,
      });
      const stateCookie = serializeCookie(OAUTH_STATE_COOKIE, stateToken, {
        maxAge: 600,
        secure,
      });
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${origin}/auth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        state: nonce,
        prompt: 'select_account',
      });
      return redirect(
        res,
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        [stateCookie]
      );
    }

    /* استقبال رد Google OAuth */
    if (pathname === '/auth/google/callback' && req.method === 'GET') {
      const cookies = parseCookies(req);
      const savedState = verifySignedToken(cookies[OAUTH_STATE_COOKIE]);
      const clearState = serializeCookie(OAUTH_STATE_COOKIE, '', { maxAge: 0, secure });
      const returnHash = sanitizeReturnHash(savedState?.returnHash);

      const code = reqUrl.searchParams.get('code');
      const stateParam = reqUrl.searchParams.get('state');
      if (!hasGoogleAuth || !code || !savedState || savedState.provider !== 'google' || savedState.nonce !== stateParam) {
        return redirect(res, `/?authError=google_failed${returnHash}`, [clearState]);
      }

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${origin}/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        console.error('Google token exchange failed:', await tokenRes.text());
        return redirect(res, `/?authError=google_failed${returnHash}`, [clearState]);
      }

      const tokenData = await tokenRes.json();
      const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        console.error('Google userinfo failed:', await userInfoRes.text());
        return redirect(res, `/?authError=google_failed${returnHash}`, [clearState]);
      }

      const profile = await userInfoRes.json();
      const user = upsertOAuthUser({
        provider: 'google',
        providerId: String(profile.sub),
        name: profile.name || profile.given_name || profile.email,
        email: profile.email || '',
        avatarUrl: profile.picture || '',
      });

      const sessionToken = signPayload({
        uid: user.id,
        exp: Date.now() + SESSION_MAX_AGE_SEC * 1000,
      });
      const sessionCookie = serializeCookie(SESSION_COOKIE, sessionToken, {
        maxAge: SESSION_MAX_AGE_SEC,
        secure,
      });

      return redirect(res, `/${returnHash}`, [clearState, sessionCookie]);
    }

    /* بدء تسجيل الدخول عبر LinkedIn (OpenID Connect) */
    if (pathname === '/auth/linkedin' && req.method === 'GET') {
      const returnHash = sanitizeReturnHash(reqUrl.searchParams.get('returnTo'));
      if (!hasLinkedInAuth) {
        return redirect(res, `/?authError=linkedin_not_configured${returnHash}`);
      }
      const nonce = crypto.randomBytes(16).toString('hex');
      const stateToken = signPayload({
        provider: 'linkedin',
        nonce,
        returnHash,
        exp: Date.now() + 10 * 60 * 1000,
      });
      const stateCookie = serializeCookie(OAUTH_STATE_COOKIE, stateToken, {
        maxAge: 600,
        secure,
      });
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: `${origin}/auth/linkedin/callback`,
        scope: 'openid profile email',
        state: nonce,
      });
      return redirect(
        res,
        `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
        [stateCookie]
      );
    }

    /* استقبال رد LinkedIn OAuth */
    if (pathname === '/auth/linkedin/callback' && req.method === 'GET') {
      const cookies = parseCookies(req);
      const savedState = verifySignedToken(cookies[OAUTH_STATE_COOKIE]);
      const clearState = serializeCookie(OAUTH_STATE_COOKIE, '', { maxAge: 0, secure });
      const returnHash = sanitizeReturnHash(savedState?.returnHash);

      const code = reqUrl.searchParams.get('code');
      const stateParam = reqUrl.searchParams.get('state');
      if (!hasLinkedInAuth || !code || !savedState || savedState.provider !== 'linkedin' || savedState.nonce !== stateParam) {
        return redirect(res, `/?authError=linkedin_failed${returnHash}`, [clearState]);
      }

      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${origin}/auth/linkedin/callback`,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
      });

      if (!tokenRes.ok) {
        console.error('LinkedIn token exchange failed:', await tokenRes.text());
        return redirect(res, `/?authError=linkedin_failed${returnHash}`, [clearState]);
      }

      const tokenData = await tokenRes.json();
      const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        console.error('LinkedIn userinfo failed:', await userInfoRes.text());
        return redirect(res, `/?authError=linkedin_failed${returnHash}`, [clearState]);
      }

      const profile = await userInfoRes.json();
      const fullName =
        profile.name ||
        [profile.given_name, profile.family_name].filter(Boolean).join(' ') ||
        profile.email;

      const user = upsertOAuthUser({
        provider: 'linkedin',
        providerId: String(profile.sub),
        name: fullName,
        email: profile.email || '',
        avatarUrl: profile.picture || '',
      });

      const sessionToken = signPayload({
        uid: user.id,
        exp: Date.now() + SESSION_MAX_AGE_SEC * 1000,
      });
      const sessionCookie = serializeCookie(SESSION_COOKIE, sessionToken, {
        maxAge: SESSION_MAX_AGE_SEC,
        secure,
      });

      return redirect(res, `/${returnHash}`, [clearState, sessionCookie]);
    }

    /* 1. فحص الصحة لـ Railway */
    if (pathname === '/api/health' && req.method === 'GET') {
      const totalScores = db.prepare('SELECT COUNT(*) AS count FROM scores').get().count;
      return sendJson(res, 200, {
        ok: true,
        service: 'accessibility-game',
        scoresCount: totalScores,
        providers: { google: hasGoogleAuth, linkedin: hasLinkedInAuth },
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

    /* 4. واجهة لوحة الصدارة (إضافة نتيجة محور للاعب المسجّل عبر Google أو LinkedIn) */
    if (pathname === '/api/leaderboard' && req.method === 'POST') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser) {
        return sendJson(res, 401, {
          error: 'يجب تسجيل الدخول عبر LinkedIn أو Google أولاً لحفظ نتيجتك في لوحة الصدارة.',
        });
      }

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

      const topicId = typeof body.topicId === 'string' ? body.topicId.trim().slice(0, 60) : '';
      const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 60) : 'تحدّي شامل';
      const accuracy = Math.round(Number(body.accuracy));
      const errors = Math.round(Number(body.errors ?? 0));
      const rawMs = Number(body.durationMs);
      const rawSec = Number(body.durationSeconds ?? 60);
      const durationMs =
        Number.isFinite(rawMs) && rawMs > 0
          ? Math.round(rawMs)
          : Number.isFinite(rawSec)
            ? Math.round(rawSec * 1000)
            : NaN;
      const durationSecondsLegacy = Math.max(1, Math.min(7200, Math.round(durationMs / 1000)));
      const score = Math.round(Number(body.score ?? 0));

      if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
        return sendJson(res, 400, { error: 'قيمة الدقة غير صالحة.' });
      }
      if (!Number.isFinite(errors) || errors < 0 || errors > 100) {
        return sendJson(res, 400, { error: 'قيمة الأخطاء غير صالحة.' });
      }
      if (!Number.isFinite(durationMs) || durationMs < 50 || durationMs > 7_200_000) {
        return sendJson(res, 400, { error: 'قيمة الوقت غير صالحة.' });
      }
      if (!Number.isFinite(score) || score < 0 || score > 10000) {
        return sendJson(res, 400, { error: 'قيمة النقاط غير صالحة.' });
      }

      /* منع التكرار لنفس المستخدم ونفس المحور خلال آخر 30 يوماً */
      const recentSameTopic = db
        .prepare(
          `SELECT id FROM scores
           WHERE user_id = ? AND topic_id = ? AND datetime(created_at) >= datetime('now', '-30 days')
           LIMIT 1`
        )
        .get(sessionUser.id, topicId);

      if (recentSameTopic) {
        return sendJson(res, 200, {
          id: recentSameTopic.id,
          name: sessionUser.name,
          topicId,
          topic,
          alreadySaved: true,
        });
      }

      const insert = db.prepare(
        `INSERT INTO scores (user_id, name, topic_id, topic, accuracy, errors, duration_seconds, duration_ms, score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const result = insert.run(
        sessionUser.id,
        sessionUser.name,
        topicId,
        topic,
        accuracy,
        errors,
        durationSecondsLegacy,
        durationMs,
        score
      );

      return sendJson(res, 201, {
        id: Number(result.lastInsertRowid),
        name: sessionUser.name,
        topicId,
        topic,
        accuracy,
        errors,
        durationMs,
        durationSeconds: Number((durationMs / 1000).toFixed(2)),
        score,
        period: 'week',
      });
    }

    /* =====================================================================
       5. واجهة غرف الفعاليات الجماعية (Kahoot / Slido Live Rooms)
       ===================================================================== */

    if (pathname === '/api/events/rooms' && req.method === 'POST') {
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { error: 'بيانات إنشاء الغرفة غير صالحة.' });
      }

      const gameType = VALID_EVENT_GAMES.has(body.gameType) ? body.gameType : 'right-or-left';
      const deck = sanitizeEventDeck(body.deck);
      if (deck.length < 2) {
        return sendJson(res, 400, { error: 'قائمة جولات الفعالية غير مكتملة.' });
      }

      const requestedRounds = Math.round(Number(body.totalRounds) || 10);
      const totalRounds =
        gameType === 'ten-in-a-row'
          ? 10
          : gameType === 'speed-blitz'
            ? deck.length
            : Math.max(3, Math.min(deck.length, requestedRounds));
      const timerSeconds = Math.max(0, Math.min(120, Math.round(Number(body.timerSeconds) || 0)));

      const code = generateRoomCode();
      const hostToken = crypto.randomBytes(18).toString('hex');
      const now = Date.now();
      const room = {
        code,
        hostToken,
        gameType,
        status: 'lobby',
        roundIndex: 0,
        totalRounds,
        streak: 0,
        bestStreak: 0,
        attemptNumber: 1,
        streakFailed: false,
        won: false,
        timerSeconds,
        roundStartedAt: null,
        blitzEndsAt: null,
        deck,
        players: new Map(),
        votes: new Map(),
        lastOutcome: null,
        groupCorrectTotal: 0,
        clients: new Set(),
        createdAt: now,
        updatedAt: now,
      };

      EVENT_ROOMS.set(code, room);
      return sendJson(res, 201, {
        code,
        hostToken,
        room: serializeEventRoom(room),
      });
    }

    const eventRoomMatch = pathname.match(/^\/api\/events\/rooms\/(\d{6})(?:\/(stream|join|vote|action))?$/);
    if (eventRoomMatch) {
      const [, roomCode, subAction] = eventRoomMatch;
      const room = EVENT_ROOMS.get(roomCode);
      if (!room) {
        return sendJson(res, 404, { error: 'لم يتم العثور على غرفة بهذا الرمز أو انتهت الجلسة.' });
      }

      /* قراءة حالة الغرفة */
      if (!subAction && req.method === 'GET') {
        return sendJson(res, 200, { room: serializeEventRoom(room) });
      }

      /* البث المباشر SSE */
      if (subAction === 'stream' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        });
        res.write(`data: ${JSON.stringify(serializeEventRoom(room))}\n\n`);
        room.clients.add(res);

        const pingTimer = setInterval(() => {
          try {
            res.write(': ping\n\n');
          } catch {
            clearInterval(pingTimer);
            room.clients.delete(res);
          }
        }, 25000);

        req.on('close', () => {
          clearInterval(pingTimer);
          room.clients.delete(res);
        });
        return;
      }

      /* انضمام مشارك جديد للغرفة */
      if (subAction === 'join' && req.method === 'POST') {
        let body;
        try {
          body = await readJsonBody(req);
        } catch {
          return sendJson(res, 400, { error: 'بيانات الانضمام غير صالحة.' });
        }
        const rawName = typeof body.name === 'string' ? body.name.trim() : '';
        if (rawName.length < 2 || rawName.length > 26) {
          return sendJson(res, 400, { error: 'يرجى إدخال اسم من حرفين إلى 26 حرفاً.' });
        }
        if (room.players.size >= 250) {
          return sendJson(res, 400, { error: 'الغرفة وصلت إلى الحد الأقصى من المشاركين.' });
        }

        const playerId = crypto.randomBytes(8).toString('hex');
        room.players.set(playerId, {
          id: playerId,
          name: rawName,
          score: 0,
          correctCount: 0,
          streak: 0,
          joinedAt: Date.now(),
        });
        broadcastEventRoom(room);
        return sendJson(res, 201, {
          playerId,
          name: rawName,
          room: serializeEventRoom(room),
        });
      }

      /* تسجيل تصويت مشارك (يمين / يسار) */
      if (subAction === 'vote' && req.method === 'POST') {
        let body;
        try {
          body = await readJsonBody(req);
        } catch {
          return sendJson(res, 400, { error: 'بيانات التصويت غير صالحة.' });
        }
        const playerId = typeof body.playerId === 'string' ? body.playerId : '';
        const side = body.side === 'right' || body.side === 'left' ? body.side : null;
        if (!side || !room.players.has(playerId)) {
          return sendJson(res, 400, { error: 'تعذّر تسجيل الصوت — تأكد من انضمامك للغرفة.' });
        }
        if (room.status !== 'question') {
          return sendJson(res, 409, { error: 'التصويت مغلق حالياً في هذه الجولة.' });
        }

        room.votes.set(playerId, { side, answeredAt: Date.now() });
        broadcastEventRoom(room);
        return sendJson(res, 200, { ok: true, side, votesCount: room.votes.size });
      }

      /* أوامر المنسّق (Host Controls) */
      if (subAction === 'action' && req.method === 'POST') {
        let body;
        try {
          body = await readJsonBody(req);
        } catch {
          return sendJson(res, 400, { error: 'طلب غير صالح.' });
        }
        if (!body.hostToken || body.hostToken !== room.hostToken) {
          return sendJson(res, 403, { error: 'هذا الإجراء متاح لمنسّق الغرفة فقط.' });
        }

        const action = body.action;
        const now = Date.now();

        if (action === 'start') {
          room.status = 'question';
          room.roundIndex = 0;
          room.streak = 0;
          room.streakFailed = false;
          room.won = false;
          room.lastOutcome = null;
          room.votes.clear();
          room.roundStartedAt = now;
          if (room.gameType === 'speed-blitz') {
            room.blitzEndsAt = now + 60 * 1000;
          }
          broadcastEventRoom(room);
          return sendJson(res, 200, { room: serializeEventRoom(room) });
        }

        if (action === 'reveal') {
          if (room.status !== 'question') {
            return sendJson(res, 200, { room: serializeEventRoom(room) });
          }
          const currentCard = room.deck[room.roundIndex];
          if (!currentCard) {
            room.status = 'finished';
            broadcastEventRoom(room);
            return sendJson(res, 200, { room: serializeEventRoom(room) });
          }

          let rightVotes = 0;
          let leftVotes = 0;
          for (const v of room.votes.values()) {
            if (v.side === 'right') rightVotes += 1;
            else if (v.side === 'left') leftVotes += 1;
          }
          const totalVotes = rightVotes + leftVotes;
          const manualSide = body.manualSide === 'right' || body.manualSide === 'left' ? body.manualSide : null;

          let groupChoice = 'none';
          if (manualSide && totalVotes === 0) {
            groupChoice = manualSide;
          } else if (totalVotes > 0) {
            if (rightVotes > leftVotes) groupChoice = 'right';
            else if (leftVotes > rightVotes) groupChoice = 'left';
            else groupChoice = manualSide || 'tie';
          }

          const isGroupCorrect = groupChoice === currentCard.goodSide;
          const roundDurationWindow = Math.max(10, room.timerSeconds || 20) * 1000;

          /* احتساب نقاط كاهوت لكل لاعب أصاب */
          for (const [pid, player] of room.players.entries()) {
            const vote = room.votes.get(pid);
            if (vote && vote.side === currentCard.goodSide) {
              const elapsed = Math.max(0, vote.answeredAt - (room.roundStartedAt || now));
              const speedRatio = Math.max(0, Math.min(1, 1 - elapsed / roundDurationWindow));
              const gained = 100 + Math.round(speedRatio * 100) + player.streak * 20;
              player.score += gained;
              player.correctCount += 1;
              player.streak += 1;
            } else {
              player.streak = 0;
            }
          }

          if (isGroupCorrect) {
            room.groupCorrectTotal += 1;
            room.streak += 1;
            if (room.streak > room.bestStreak) room.bestStreak = room.streak;
            room.streakFailed = false;
          } else {
            if (room.gameType === 'ten-in-a-row') {
              room.streakFailed = true;
            } else {
              room.streak = 0;
            }
          }

          room.lastOutcome = {
            groupChoice,
            goodSide: currentCard.goodSide,
            isGroupCorrect,
            rightVotes,
            leftVotes,
            totalVotes,
            rightPct: totalVotes > 0 ? Math.round((rightVotes / totalVotes) * 100) : 0,
            leftPct: totalVotes > 0 ? Math.round((leftVotes / totalVotes) * 100) : 0,
          };

          if (room.gameType === 'ten-in-a-row' && isGroupCorrect && room.streak >= 10) {
            room.won = true;
            room.status = 'finished';
          } else {
            room.status = 'revealed';
          }

          broadcastEventRoom(room);
          return sendJson(res, 200, { room: serializeEventRoom(room) });
        }

        if (action === 'next') {
          if (room.gameType === 'speed-blitz' && room.blitzEndsAt && now >= room.blitzEndsAt) {
            room.status = 'finished';
            broadcastEventRoom(room);
            return sendJson(res, 200, { room: serializeEventRoom(room) });
          }

          const nextIdx = room.roundIndex + 1;
          if (nextIdx >= room.totalRounds || nextIdx >= room.deck.length) {
            room.status = 'finished';
          } else {
            room.roundIndex = nextIdx;
            room.status = 'question';
            room.votes.clear();
            room.lastOutcome = null;
            room.roundStartedAt = now;
          }
          broadcastEventRoom(room);
          return sendJson(res, 200, { room: serializeEventRoom(room) });
        }

        if (action === 'reset-streak') {
          const freshDeck = sanitizeEventDeck(body.deck);
          if (freshDeck.length >= 10) {
            room.deck = freshDeck;
          }
          room.attemptNumber += 1;
          room.streak = 0;
          room.streakFailed = false;
          room.won = false;
          room.roundIndex = 0;
          room.votes.clear();
          room.lastOutcome = null;
          room.status = 'question';
          room.roundStartedAt = now;
          broadcastEventRoom(room);
          return sendJson(res, 200, { room: serializeEventRoom(room) });
        }

        if (action === 'finish') {
          room.status = 'finished';
          broadcastEventRoom(room);
          return sendJson(res, 200, { room: serializeEventRoom(room) });
        }

        if (action === 'restart') {
          const freshDeck = sanitizeEventDeck(body.deck);
          if (freshDeck.length >= 2) {
            room.deck = freshDeck;
          }
          room.roundIndex = 0;
          room.streak = 0;
          room.streakFailed = false;
          room.won = false;
          room.groupCorrectTotal = 0;
          room.attemptNumber = 1;
          room.votes.clear();
          room.lastOutcome = null;
          room.blitzEndsAt = null;
          for (const p of room.players.values()) {
            p.score = 0;
            p.correctCount = 0;
            p.streak = 0;
          }
          room.status = 'question';
          room.roundStartedAt = now;
          if (room.gameType === 'speed-blitz') {
            room.blitzEndsAt = now + 60 * 1000;
          }
          broadcastEventRoom(room);
          return sendJson(res, 200, { room: serializeEventRoom(room) });
        }

        return sendJson(res, 400, { error: 'إجراء غير معروف.' });
      }

      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    /* 6. تقديم الملفات الساكنة بأمان */
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
      segments.some((seg) => seg === '..' || seg.startsWith('.') || /^client_secret/i.test(seg)) ||
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
  console.log(`OAuth providers configured -> Google: ${hasGoogleAuth}, LinkedIn: ${hasLinkedInAuth}`);
});
