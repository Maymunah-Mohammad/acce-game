/* ==========================================================================
   صفحة ملفي وإنجازاتي + الملف العام القابل للمشاركة (Star Plot + Checklist)
   متوافقة بالكامل مع معايير WCAG 2.2 (AA / AAA) ولوحة الألوان الخماسية المعتمدة
   ========================================================================== */

(function () {
  'use strict';

  const READ_ARTICLES_KEY = 'accessibility_game_read_articles_v1';
  const TRIED_EVENTS_KEY = 'accessibility_game_tried_events_v1';
  const PUBLIC_ORIGIN = 'https://accessibility-game.up.railway.app';

  const SHORT_TOPIC_LABELS = {
    'navigation-predictability': 'التنقل',
    'interactive-focus': 'التركيز',
    'forms-friction': 'النماذج',
    'color-appearance': 'الألوان',
    'typography-reading': 'الطباعة',
    'animation-motion': 'الحركة',
    'layout-structure': 'التخطيط',
    'media-images': 'الوسائط',
    'input-gestures': 'الإدخال',
    'touch-targets': 'اللمس',
  };

  const EVENT_CHECKLIST_ITEMS = [
    {
      id: 'right-or-left',
      title: 'فعالية: يمين أو يسار؟',
      desc: 'لعبة جماعية سريعة لمقارنة واجهتين مع سبب مختصر وتصويت حي.',
      hash: '#events/stage/right-or-left',
      isNew: true,
    },
    {
      id: 'ten-in-a-row',
      title: 'فعالية: عشرة مرة وحدة !',
      desc: 'تحدّي 10 إجابات صحيحة متتالية بدون خطأ مع محاولات غير محدودة.',
      hash: '#events/stage/ten-in-a-row',
      isNew: true,
    },
    {
      id: 'speed-blitz',
      title: 'فعالية: سباق الدقيقة الجماعي',
      desc: '60 ثانية من الحماس الجماعي لاصطياد أكبر عدد من الواجهات المتاحة.',
      hash: '#events/stage/speed-blitz',
      isNew: true,
    },
  ];

  let rootEl = null;
  let deps = null;
  let activeChecklistFilter = 'all'; /* 'all' | 'todo' | 'done' */

  function escapeHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isSafeHttpUrl(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  }

  function formatDurationAr(totalSeconds) {
    const secs = Math.max(0, Math.round(Number(totalSeconds) || 0));
    if (secs === 0) return '—';
    const minutes = Math.floor(secs / 60);
    const rem = secs % 60;
    if (minutes === 0) return `${rem} ث`;
    if (rem === 0) return `${minutes} د`;
    return `${minutes} د ${rem} ث`;
  }

  function readStoredList(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      /* تجاهل */
    }
    return [];
  }

  function writeStoredList(key, items) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(new Set(items))));
    } catch {
      /* تجاهل */
    }
  }

  function recordActivity(type, itemId) {
    if (!itemId) return;
    const key = type === 'article' ? READ_ARTICLES_KEY : TRIED_EVENTS_KEY;
    const current = readStoredList(key);
    if (!current.includes(itemId)) {
      current.push(itemId);
      writeStoredList(key, current);
    }
    fetch('/api/profile/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, itemId }),
    }).catch(() => {});
  }

  function getLevelBadge(topicsDone, articlesRead, eventsTried) {
    const score = topicsDone * 3 + articlesRead + eventsTried;
    if (topicsDone >= 8 || score >= 28) {
      return { title: 'سفير الوصولية الرقمية', icon: '👑', tone: 'purple' };
    }
    if (topicsDone >= 4 || score >= 14) {
      return { title: 'خبير إتاحة WCAG', icon: '🌟', tone: 'sky' };
    }
    if (topicsDone >= 1 || score >= 4) {
      return { title: 'ممارس الوصولية', icon: '🚀', tone: 'peach' };
    }
    return { title: 'مستكشف الوصولية', icon: '🧭', tone: 'yellow' };
  }

  /* ========================================================================
     رسم مخطّط النجمة / الرادار (10-Axis Star Plot — Pure SVG + Accessibility)
     ======================================================================== */
  function buildStarPlotSvg(topics, masteryByTopicId) {
    const cx = 280;
    const cy = 225;
    const maxR = 132;
    const count = topics.length;
    const rings = [25, 50, 75, 100];

    const pointAt = (index, pct) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
      const r = (maxR * pct) / 100;
      return {
        x: Number((cx + r * Math.cos(angle)).toFixed(1)),
        y: Number((cy + r * Math.sin(angle)).toFixed(1)),
        angle,
      };
    };

    /* الشبكة الخماسية المتدرجة (25%, 50%, 75%, 100%) */
    const ringsHtml = rings
      .map((pct) => {
        const pts = topics
          .map((_, idx) => {
            const p = pointAt(idx, pct);
            return `${p.x},${p.y}`;
          })
          .join(' ');
        const labelPt = pointAt(0, pct);
        return `
          <polygon points="${pts}" class="star-ring star-ring-${pct}" />
          <text x="${labelPt.x + 8}" y="${labelPt.y + 4}" class="star-ring-label">${pct}%</text>
        `;
      })
      .join('');

    /* المحاور الشعاعية العشرة + تسميات المحاور */
    const spokesHtml = topics
      .map((topic, idx) => {
        const outer = pointAt(idx, 100);
        const labelPos = pointAt(idx, 126);
        const shortName = SHORT_TOPIC_LABELS[topic.id] || topic.ar;
        const info = masteryByTopicId[topic.id];
        const value = info ? info.accuracy : 0;
        const anchor =
          Math.abs(labelPos.x - cx) < 18
            ? 'middle'
            : labelPos.x > cx
              ? 'start'
              : 'end';
        const dy = labelPos.y < cy - maxR * 0.9 ? -4 : labelPos.y > cy + maxR * 0.9 ? 14 : 5;

        return `
          <line x1="${cx}" y1="${cy}" x2="${outer.x}" y2="${outer.y}" class="star-spoke" />
          <g class="star-axis-label-group" data-star-topic="${escapeHtml(topic.id)}" tabindex="0" role="button" aria-label="${escapeHtml(topic.ar)}: ${info ? `${value}%` : 'لم يُنجز بعد'}">
            <text x="${labelPos.x}" y="${labelPos.y + dy}" text-anchor="${anchor}" class="star-axis-label ${info ? 'is-completed' : ''}">
              ${escapeHtml(shortName)}
            </text>
            ${
              info
                ? `<text x="${labelPos.x}" y="${labelPos.y + dy + 15}" text-anchor="${anchor}" class="star-axis-pct">${value}%</text>`
                : ''
            }
          </g>
        `;
      })
      .join('');

    /* مضلّع أداء المستخدم */
    const dataPoints = topics.map((topic, idx) => {
      const info = masteryByTopicId[topic.id];
      const val = info ? Math.max(8, info.accuracy) : 6; /* حد بصري لطيف حتى يظهر شكل النجمة */
      return {
        ...pointAt(idx, val),
        topic,
        info,
        rawVal: info ? info.accuracy : 0,
      };
    });

    const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
    const dotsHtml = dataPoints
      .map((p) => {
        let dotClass = 'star-dot is-unplayed';
        if (p.info) {
          dotClass = p.rawVal >= 85 ? 'star-dot is-strong' : 'star-dot is-grow';
        }
        return `
          <circle
            cx="${p.x}"
            cy="${p.y}"
            r="${p.info ? 6 : 4.2}"
            class="${dotClass}"
            data-star-topic="${escapeHtml(p.topic.id)}"
          >
            <title>${escapeHtml(p.topic.ar)}: ${p.info ? `${p.rawVal}%` : 'لم يبدأ بعد'}</title>
          </circle>
        `;
      })
      .join('');

    const completedCount = Object.keys(masteryByTopicId).length;
    const summaryText =
      completedCount > 0
        ? `مخطّط نجمة يوضح مستواك عبر 10 محاور للوصولية الرقمية، أتممت منها ${completedCount} محاور.`
        : 'مخطّط نجمة لـ 10 محاور للوصولية الرقمية؛ ابدأ أول تحدّي ليمتلئ المخطّط بنتائجك.';

    return `
      <svg
        class="star-plot-svg"
        viewBox="0 0 560 455"
        role="img"
        aria-label="${escapeHtml(summaryText)}"
      >
        <defs>
          <radialGradient id="star-poly-grad" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stop-color="#A855F7" stop-opacity="0.34"/>
            <stop offset="100%" stop-color="#6D28D9" stop-opacity="0.16"/>
          </radialGradient>
        </defs>
        ${ringsHtml}
        ${spokesHtml}
        <polygon points="${polygonPoints}" class="star-data-poly" />
        ${dotsHtml}
      </svg>
    `;
  }

  /* ========================================================================
     تجميع حالة الإتقان للمستخدم الحالي (الدمج بين الخادم والمتصفح)
     ======================================================================== */
  function mergeTopicMastery(topics, serverTopicScores, localProgress) {
    const mastery = {};
    topics.forEach((topic) => {
      const srv = serverTopicScores && serverTopicScores[topic.id];
      const loc = localProgress && localProgress[topic.id];
      const playableList =
        (window.ACCESSIBILITY_CHALLENGES && window.ACCESSIBILITY_CHALLENGES[topic.id]) || [];

      if (srv) {
        mastery[topic.id] = {
          topicId: topic.id,
          topicAr: topic.ar,
          accuracy: Number(srv.accuracy || 0),
          errors: Number(srv.errors || 0),
          durationSeconds: Number(srv.durationSeconds || 60),
          score: Number(srv.score || 0),
          completedAt: srv.completedAt || (loc && loc.completedAt) || null,
          source: 'server',
        };
      } else if (loc && loc.finished) {
        const total = playableList.length || topic.count || 1;
        const correct = Number(loc.correctCount || 0);
        const accuracy = Math.round((correct / total) * 100);
        mastery[topic.id] = {
          topicId: topic.id,
          topicAr: topic.ar,
          accuracy,
          errors: Math.max(0, total - correct),
          durationSeconds: Math.max(1, Math.round((loc.elapsedMs || 60000) / 1000)),
          score: Number(loc.score || 0),
          completedAt: loc.completedAt || null,
          source: 'local',
        };
      }
    });
    return mastery;
  }

  /* ========================================================================
     1) عرض لوحة «ملفي وإنجازاتي» الخاصة بالمستخدم (#profile)
     ======================================================================== */
  async function renderMyProfile() {
    if (!rootEl || !deps) return;
    const topics = deps.getTopics();
    const articles = deps.getArticles();
    const currentUser = deps.getCurrentUser();
    const localProgress = deps.loadTopicProgress();

    deps.renderBreadcrumbs([
      { label: 'الرئيسية', view: 'home', href: '#home' },
      { label: 'ملفي وإنجازاتي' },
    ]);

    let serverData = null;
    if (currentUser) {
      try {
        const res = await fetch('/api/profile/me', { cache: 'no-store' });
        if (res.ok) serverData = await res.json();
      } catch {
        /* احتياطي محلي */
      }
    }

    const mastery = mergeTopicMastery(topics, serverData && serverData.topicScores, localProgress);
    const completedTopics = Object.values(mastery);
    const completedCount = completedTopics.length;

    const readArticlesSet = new Set([
      ...readStoredList(READ_ARTICLES_KEY),
      ...((serverData && serverData.readArticles) || []),
    ]);
    const triedEventsSet = new Set([
      ...readStoredList(TRIED_EVENTS_KEY),
      ...((serverData && serverData.triedEvents) || []),
    ]);

    const avgAccuracy =
      serverData && serverData.stats && serverData.stats.avgAccuracy
        ? serverData.stats.avgAccuracy
        : completedCount > 0
          ? Math.round(
              completedTopics.reduce((s, item) => s + item.accuracy, 0) / completedCount
            )
          : 0;

    const avgDuration =
      serverData && serverData.stats && serverData.stats.avgDurationSeconds
        ? serverData.stats.avgDurationSeconds
        : completedCount > 0
          ? Math.round(
              completedTopics.reduce((s, item) => s + item.durationSeconds, 0) / completedCount
            )
          : 0;

    const rank = serverData && serverData.stats ? serverData.stats.rank : null;
    const totalPlayers = serverData && serverData.stats ? serverData.stats.totalPlayers : null;

    /* حساب نقاط القوة والمحاور التي تحتاج تحسيناً */
    const strongTopics = completedTopics
      .filter((t) => t.accuracy >= 85)
      .sort((a, b) => b.accuracy - a.accuracy || a.durationSeconds - b.durationSeconds);

    const improveTopics = completedTopics
      .filter((t) => t.accuracy < 85)
      .sort((a, b) => a.accuracy - b.accuracy);

    const standoutTopicName =
      (serverData && serverData.stats && serverData.stats.bestTopic) ||
      (strongTopics[0] && strongTopics[0].topicAr) ||
      (completedTopics[0] && completedTopics[0].topicAr) ||
      'لم يتحدّد بعد';

    const level = getLevelBadge(completedCount, readArticlesSet.size, triedEventsSet.size);

    /* قائمة الاستكشاف التفاعلية (الجديد وما لم تجرّبه بعد) */
    const checklistItems = [
      {
        id: 'chk-topic-nav',
        category: 'تحدّي تفاعلي',
        title: 'إتمام محور «التنقل وقابلية التنبؤ» (9 تحديات)',
        desc: 'اختبر قدرتك على اكتشاف أخطاء التنقل والتركيز والتوقّع.',
        done: Boolean(mastery['navigation-predictability']),
        isNew: !mastery['navigation-predictability'],
        actionLabel: mastery['navigation-predictability'] ? 'مراجعة الأجوبة' : 'ابدأ التحدّي',
        hash: '#play/navigation-predictability',
      },
      ...EVENT_CHECKLIST_ITEMS.map((ev) => ({
        id: `chk-ev-${ev.id}`,
        category: 'فعالية جماعية',
        title: ev.title,
        desc: ev.desc,
        done: triedEventsSet.has(ev.id),
        isNew: !triedEventsSet.has(ev.id),
        actionLabel: triedEventsSet.has(ev.id) ? 'العب مجدداً' : 'جرّب الآن',
        hash: ev.hash,
      })),
      ...articles.map((art) => ({
        id: `chk-art-${art.slug}`,
        category: 'مقال معرفي',
        title: art.title,
        desc: art.excerpt,
        done: readArticlesSet.has(art.slug),
        isNew: !readArticlesSet.has(art.slug),
        actionLabel: readArticlesSet.has(art.slug) ? 'إعادة القراءة' : 'اقرأ المقال',
        hash: `#blog/${art.slug}`,
      })),
      {
        id: 'chk-auth',
        category: 'الحساب والمشاركة',
        title: 'توثيق حسابك عبر Google أو LinkedIn',
        desc: 'لحفظ إنجازاتك وإدراج اسمك في لوحة الصدارة وتفعيل رابط ملفك العام.',
        done: Boolean(currentUser),
        isNew: !currentUser,
        actionLabel: currentUser ? 'موثّق ✓' : 'تسجيل الدخول',
        actionType: 'signin',
      },
    ];

    const checklistDoneCount = checklistItems.filter((c) => c.done).length;
    const siteProgressPct =
      checklistItems.length > 0
        ? Math.round((checklistDoneCount / checklistItems.length) * 100)
        : 0;

    const filteredChecklist = checklistItems.filter((item) => {
      if (activeChecklistFilter === 'todo') return !item.done;
      if (activeChecklistFilter === 'done') return item.done;
      return true;
    });

    /* المقالات المقروءة وغير المقروءة */
    const unreadArticles = articles.filter((a) => !readArticlesSet.has(a.slug));
    const readArticles = articles.filter((a) => readArticlesSet.has(a.slug));

    /* رابط المشاركة العام ورابط LinkedIn */
    const publicProfileUrl = currentUser ? `${PUBLIC_ORIGIN}/u/${currentUser.id}` : '';
    const linkedInShareText = currentUser
      ? [
          `📊 استعرض مستواي في لعبة «تحدّي الوصولية» لمعايير WCAG 2.2!`,
          `🏅 المستوى: ${level.title} (${completedCount} من 10 محاور مكتملة${avgAccuracy ? ` • متوسط الدقة ${avgAccuracy}%` : ''}${rank ? ` • المركز #${rank} في لوحة الصدارة` : ''})`,
          `🧭 المحور الأبرز: ${standoutTopicName}`,
          `شاهد خريطة مهاراتي أو اختبر نفسك الآن:`,
          publicProfileUrl,
          `#عام_الذكاء_الاصطناعي #الوصولية_الرقمية #WCAG22 #Accessibility`,
        ].join('\n')
      : '';
    const linkedInShareHref = currentUser
      ? `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedInShareText)}`
      : '#';

    const avatarHtml = currentUser
      ? currentUser.avatarUrl && isSafeHttpUrl(currentUser.avatarUrl)
        ? `<img src="${escapeHtml(currentUser.avatarUrl)}" alt="" class="profile-avatar-img" referrerpolicy="no-referrer">`
        : `<span class="profile-avatar-fallback" aria-hidden="true">${escapeHtml((currentUser.name || 'م').charAt(0))}</span>`
      : `<span class="profile-avatar-fallback" aria-hidden="true">🧭</span>`;

    const providerBadge = currentUser
      ? currentUser.provider === 'linkedin'
        ? 'حساب LinkedIn موثّق ✓'
        : 'حساب Google موثّق ✓'
      : 'وضع الضيف (محفوظ محلياً)';

    const shareBlockHtml = currentUser
      ? `
        <div class="profile-share-bar">
          <div class="profile-share-copy">
            <strong>شارك مستواك وإنجازاتك مع شبكتك</strong>
            <p>يُظهر الرابط العام فقط مستواك، مخطّط النجمة للمحاور المكتملة، وترتيبك — دون بريدك أو قائمتك الخاصة.</p>
          </div>
          <div class="profile-share-actions">
            <a
              href="${linkedInShareHref}"
              target="_blank"
              rel="noopener noreferrer"
              class="oauth-btn oauth-btn-linkedin profile-linkedin-btn"
              id="profile-share-linkedin"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>مشاركة مستواي على LinkedIn</span>
            </a>
            <button type="button" class="btn btn-secondary" id="profile-copy-public-btn">نسخ رابط ملفي العام</button>
            <a href="#u/${currentUser.id}" class="btn btn-secondary" id="profile-preview-public-btn">معاينة كزائر</a>
          </div>
          <p id="profile-share-status" class="event-copy-ok" aria-live="polite" hidden></p>
        </div>
      `
      : `
        <div class="profile-guest-banner">
          <div>
            <strong>سجّل دخولك لتفعيل رابط ملفك العام ومشاركة مستواك على LinkedIn</strong>
            <p>عند تسجيل الدخول عبر Google أو LinkedIn تُحفظ إحصائياتك ومقالاتك المقروءة تلقائياً ويُفتح لك رابط ملف إنجازات عام.</p>
          </div>
          ${deps.buildOAuthButtonsHtml('#profile')}
        </div>
      `;

    /* بطاقات تفاصيل المحاور العشرة */
    const topicsCardsHtml = topics
      .map((topic) => {
        const info = mastery[topic.id];
        const loc = localProgress[topic.id];
        const isPlayable = Boolean(
          window.ACCESSIBILITY_CHALLENGES && window.ACCESSIBILITY_CHALLENGES[topic.id]
        );
        let statusPill = '<span class="p-topic-status is-todo">لم يبدأ بعد</span>';
        let pct = 0;
        let actionText = isPlayable ? 'ابدأ المحور' : 'استعراض المحور';
        if (info) {
          pct = info.accuracy;
          statusPill = `<span class="p-topic-status is-done">مكتمل • ${info.accuracy}%</span>`;
          actionText = 'عرض النتيجة والمراجعة';
        } else if (loc && loc.started) {
          pct = Math.round(((loc.completed || 0) / Math.max(1, topic.count)) * 100);
          statusPill = `<span class="p-topic-status is-progress">قيد التقدّم (${pct}%)</span>`;
          actionText = 'استمرار';
        }

        return `
          <li class="p-topic-item">
            <div class="p-topic-top">
              <strong>${escapeHtml(topic.ar)}</strong>
              ${statusPill}
            </div>
            <div class="p-topic-bar" aria-hidden="true">
              <div class="p-topic-fill ${info && info.accuracy >= 85 ? 'is-strong' : ''}" style="width: ${pct}%"></div>
            </div>
            <div class="p-topic-foot">
              <span>${info ? `${formatDurationAr(info.durationSeconds)} • ${info.errors === 0 ? 'بلا أخطاء' : `${info.errors} أخطاء`}` : `${topic.count} تحديات`}</span>
              <a href="#play/${escapeHtml(topic.id)}" class="p-mini-link" data-profile-nav="play/${escapeHtml(topic.id)}">${actionText} ←</a>
            </div>
          </li>
        `;
      })
      .join('');

    rootEl.innerHTML = `
      <div class="profile-page">
        <!-- بطاقة الترحيب والمستوى -->
        <section class="profile-hero-card" aria-labelledby="profile-heading">
          <div class="profile-hero-top">
            <div class="profile-identity">
              ${avatarHtml}
              <div class="profile-id-text">
                <div class="profile-badges-row">
                  <span class="profile-level-pill tone-${level.tone}">
                    <span aria-hidden="true">${level.icon}</span>
                    <span>${escapeHtml(level.title)}</span>
                  </span>
                  <span class="profile-provider-pill">${escapeHtml(providerBadge)}</span>
                </div>
                <h1 id="profile-heading" class="profile-name">
                  ${currentUser ? escapeHtml(currentUser.name) : 'ملفي وإنجازاتي'}
                </h1>
                <p class="profile-sub">
                  لوحة متابعة شاملة لنقاط قوتك في معايير WCAG 2.2، والمحاور والمقالات والفعاليات التي لم تجرّبها بعد.
                </p>
              </div>
            </div>

            <div class="profile-overall-ring">
              <span class="profile-ring-label">اكتمال استكشاف الموقع</span>
              <strong class="profile-ring-value">${siteProgressPct}%</strong>
              <div class="play-progress-bar" role="progressbar" aria-valuenow="${siteProgressPct}" aria-valuemin="0" aria-valuemax="100" aria-label="نسبة اكتمال استكشاف الموقع">
                <div class="play-progress-fill" style="width: ${siteProgressPct}%"></div>
              </div>
              <span class="profile-ring-meta">${checklistDoneCount} من ${checklistItems.length} عناصر مكتملة</span>
            </div>
          </div>

          <!-- مؤشرات الأداء الأربعة -->
          <dl class="profile-kpis" aria-label="إحصائياتك الأساسية">
            <div class="profile-kpi">
              <dt>المحاور المكتملة</dt>
              <dd>${completedCount} <span>من 10</span></dd>
            </div>
            <div class="profile-kpi">
              <dt>ترتيبك في الصدارة</dt>
              <dd>${rank ? `#${rank}` : '—'} <span>${rank && totalPlayers ? `من ${totalPlayers}` : 'أتمّ محوراً للانضمام'}</span></dd>
            </div>
            <div class="profile-kpi">
              <dt>متوسط الدقة</dt>
              <dd>${completedCount > 0 ? `${avgAccuracy}%` : '—'} <span>${completedCount > 0 ? `الوقت: ${formatDurationAr(avgDuration)}` : 'بانتظار أول تحدّي'}</span></dd>
            </div>
            <div class="profile-kpi">
              <dt>المحور الأبرز</dt>
              <dd class="is-topic-dd">${escapeHtml(standoutTopicName)}</dd>
            </div>
          </dl>

          ${shareBlockHtml}
        </section>

        <!-- مخطّط النجمة + تحليل نقاط القوة والتحسين -->
        <section class="profile-radar-grid" aria-labelledby="star-plot-heading">
          <div class="profile-card profile-star-card">
            <div class="profile-card-head">
              <div>
                <h2 id="star-plot-heading" class="profile-card-title">خريطة مهاراتك (Star Plot)</h2>
                <p class="profile-card-sub">توزيع مستواك عبر محاور الوصولية العشرة — اضغط على أي محور لعرض تفاصيله.</p>
              </div>
              <div class="star-legend" aria-hidden="true">
                <span class="legend-dot is-strong">قوي (85%+)</span>
                <span class="legend-dot is-grow">يحتاج تحسيناً</span>
                <span class="legend-dot is-unplayed">لم يُجرَّب</span>
              </div>
            </div>
            <div class="star-plot-wrap">
              ${buildStarPlotSvg(topics, mastery)}
            </div>
            <div id="star-selected-detail" class="star-selected-detail" aria-live="polite">
              اختر أي محور على مخطّط النجمة لعرض دقتك وتفاصيلك فيه.
            </div>
          </div>

          <div class="profile-card profile-insights-card">
            <h2 class="profile-card-title">تحليل نقاط القوة والتحسين</h2>

            <div class="insight-block is-strength">
              <h3>🌟 محاور تتميّز بها</h3>
              ${
                strongTopics.length > 0
                  ? `<ul class="insight-list">${strongTopics
                      .map(
                        (t) =>
                          `<li><strong>${escapeHtml(t.topicAr)}</strong><span>دقة ${t.accuracy}% • ${formatDurationAr(t.durationSeconds)}</span></li>`
                      )
                      .join('')}</ul>`
                  : `<p class="insight-empty">أتمّ أول محور بدقة 85% أو أعلى لتظهر هنا نقاط قوتك المميزة!</p>`
              }
            </div>

            <div class="insight-block is-improve">
              <h3>🎯 محاور تحتاج تحسيناً</h3>
              ${
                improveTopics.length > 0
                  ? `<ul class="insight-list">${improveTopics
                      .map(
                        (t) =>
                          `<li><strong>${escapeHtml(t.topicAr)}</strong><span>دقة ${t.accuracy}% — <a href="#play/${escapeHtml(t.topicId)}" data-profile-nav="play/${escapeHtml(t.topicId)}">راجع الأجوبة</a></span></li>`
                      )
                      .join('')}</ul>`
                  : `<p class="insight-empty">${
                      completedCount > 0
                        ? 'ممتاز! جميع المحاور التي أتممتها بأداء قوي (85%+).'
                        : 'لم تُسجّل بعد أي محاور تحتاج تحسيناً — ابدأ بالتجربة الآن!'
                    }</p>`
              }
            </div>

            <div class="insight-block is-next">
              <h3>✨ خطوتك المقترحة الآن</h3>
              <p class="insight-next-text">
                ${
                  !mastery['navigation-predictability']
                    ? 'ابدأ بمحور «التنقل وقابلية التنبؤ» (9 تحديات بصرية تفاعلية) لترسم أول نقطة في خريطة مهاراتك!'
                    : unreadArticles.length > 0
                      ? `اقرأ مقال «${escapeHtml(unreadArticles[0].title)}» لتحديث معلوماتك في معايير الوصولية.`
                      : triedEventsSet.size < EVENT_CHECKLIST_ITEMS.length
                        ? 'جرّب ألعاب الفعاليات الجماعية مثل «عشرة مرة وحدة !» أو «يمين أو يسار؟».'
                        : 'أنت مواكب لكل جديد في الموقع! شارك ملف إنجازاتك على LinkedIn.'
                }
              </p>
              <a
                href="${
                  !mastery['navigation-predictability']
                    ? '#play/navigation-predictability'
                    : unreadArticles.length > 0
                      ? `#blog/${escapeHtml(unreadArticles[0].slug)}`
                      : '#events'
                }"
                class="btn btn-primary"
                id="profile-next-cta"
              >
                ${
                  !mastery['navigation-predictability']
                    ? 'ابدأ محور التنقل الآن ←'
                    : unreadArticles.length > 0
                      ? 'اقرأ المقال المقترح ←'
                      : 'اكتشف الفعاليات الجماعية ←'
                }
              </a>
            </div>
          </div>
        </section>

        <!-- قائمة الجديد وما لم تجرّبه بعد (Discovery Checklist) -->
        <section class="profile-card" aria-labelledby="checklist-heading">
          <div class="profile-card-head">
            <div>
              <h2 id="checklist-heading" class="profile-card-title">الجديد وما لم تجرّبه بعد (Checklist)</h2>
              <p class="profile-card-sub">قائمة ذكية بكل التحديات والفعاليات والمقالات الموجودة في الموقع لمعرفة ما تبقّى لك.</p>
            </div>
            <div class="filter-group" role="group" aria-label="تصفية قائمة المهام">
              <button type="button" class="filter-btn ${activeChecklistFilter === 'all' ? 'is-active' : ''}" data-chk-filter="all" aria-pressed="${activeChecklistFilter === 'all'}">الكل (${checklistItems.length})</button>
              <button type="button" class="filter-btn ${activeChecklistFilter === 'todo' ? 'is-active' : ''}" data-chk-filter="todo" aria-pressed="${activeChecklistFilter === 'todo'}">لم أجرّبه (${checklistItems.length - checklistDoneCount})</button>
              <button type="button" class="filter-btn ${activeChecklistFilter === 'done' ? 'is-active' : ''}" data-chk-filter="done" aria-pressed="${activeChecklistFilter === 'done'}">مكتمل (${checklistDoneCount})</button>
            </div>
          </div>

          <ul class="profile-checklist">
            ${
              filteredChecklist.length > 0
                ? filteredChecklist
                    .map(
                      (item) => `
                        <li class="checklist-row ${item.done ? 'is-done' : 'is-todo'}">
                          <span class="checklist-check" aria-hidden="true">${item.done ? '✓' : '○'}</span>
                          <div class="checklist-body">
                            <div class="checklist-meta">
                              <span class="checklist-cat">${escapeHtml(item.category)}</span>
                              ${item.isNew ? '<span class="checklist-new-pill">جديد • لم يُجرَّب</span>' : '<span class="checklist-done-pill">مكتمل</span>'}
                            </div>
                            <strong class="checklist-title">${escapeHtml(item.title)}</strong>
                            <p class="checklist-desc">${escapeHtml(item.desc)}</p>
                          </div>
                          ${
                            item.actionType === 'signin'
                              ? item.done
                                ? '<span class="checklist-done-mark">موثّق ✓</span>'
                                : '<button type="button" class="btn btn-secondary checklist-btn" data-trigger-signin>تسجيل الدخول</button>'
                              : `<a href="${escapeHtml(item.hash)}" class="btn ${item.done ? 'btn-secondary' : 'btn-primary'} checklist-btn">${escapeHtml(item.actionLabel)}</a>`
                          }
                        </li>
                      `
                    )
                    .join('')
                : '<li class="checklist-empty">رائع! لا توجد عناصر في هذا التصنيف حالياً.</li>'
            }
          </ul>
        </section>

        <!-- المقالات المقروءة وغير المقروءة -->
        <section class="profile-card" aria-labelledby="articles-tracker-heading">
          <div class="profile-card-head">
            <div>
              <h2 id="articles-tracker-heading" class="profile-card-title">سجل قراءة المقالات</h2>
              <p class="profile-card-sub">قرأت ${readArticles.length} من أصل ${articles.length} مقالات علمية في الموقع.</p>
            </div>
            <span class="hud-pill hud-pill-step">${Math.round((readArticles.length / Math.max(1, articles.length)) * 100)}% مقروء</span>
          </div>

          <div class="profile-articles-split">
            <div class="articles-col">
              <h3 class="articles-col-title">📖 مقالات لم تقرأها بعد (${unreadArticles.length})</h3>
              ${
                unreadArticles.length > 0
                  ? `<ul class="profile-articles-list">${unreadArticles
                      .map(
                        (art) => `
                          <li class="p-article-card is-unread">
                            <div>
                              <span class="p-article-tag">${escapeHtml(art.categoryLabel || 'مقال')} • ${escapeHtml(art.readTime || '')}</span>
                              <strong>${escapeHtml(art.title)}</strong>
                            </div>
                            <a href="#blog/${escapeHtml(art.slug)}" class="btn btn-secondary p-article-btn">اقرأ الآن ←</a>
                          </li>
                        `
                      )
                      .join('')}</ul>`
                  : '<p class="insight-empty">أحسنت! قرأت جميع المقالات المنشورة حتى الآن 🎉</p>'
              }
            </div>

            <div class="articles-col">
              <h3 class="articles-col-title">✅ مقالات أتممت قراءتها (${readArticles.length})</h3>
              ${
                readArticles.length > 0
                  ? `<ul class="profile-articles-list">${readArticles
                      .map(
                        (art) => `
                          <li class="p-article-card is-read">
                            <div>
                              <span class="p-article-tag">${escapeHtml(art.categoryLabel || 'مقال')} • مقروء ✓</span>
                              <strong>${escapeHtml(art.title)}</strong>
                            </div>
                            <a href="#blog/${escapeHtml(art.slug)}" class="p-mini-link">تصفّح مجدداً</a>
                          </li>
                        `
                      )
                      .join('')}</ul>`
                  : '<p class="insight-empty">لم تقرأ أي مقال بعد — افتح أي مقال من المدونة ليُسجَّل هنا تلقائياً.</p>'
              }
            </div>
          </div>
        </section>

        <!-- حالة جميع المحاور العشرة -->
        <section class="profile-card" aria-labelledby="topics-mastery-heading">
          <div class="profile-card-head">
            <div>
              <h2 id="topics-mastery-heading" class="profile-card-title">تقدّمك في المحاور العشرة</h2>
              <p class="profile-card-sub">نظرة سريعة على حالة كل محور من محاور WCAG 2.2.</p>
            </div>
            <a href="#challenges" class="btn btn-secondary">كل التحديات</a>
          </div>
          <ul class="p-topics-grid">${topicsCardsHtml}</ul>
        </section>
      </div>
    `;

    /* تفاعل النقر / التركيز على محاور مخطّط النجمة */
    const detailBox = rootEl.querySelector('#star-selected-detail');
    const selectStarTopic = (topicId) => {
      const topic = topics.find((t) => t.id === topicId);
      if (!topic || !detailBox) return;
      const info = mastery[topic.id];
      detailBox.innerHTML = info
        ? `<strong>${escapeHtml(topic.ar)} (${escapeHtml(topic.en)}):</strong> دقة <strong>${info.accuracy}%</strong> • ${info.errors === 0 ? 'بلا أخطاء' : `${info.errors} أخطاء`} • الوقت ${formatDurationAr(info.durationSeconds)}.`
        : `<strong>${escapeHtml(topic.ar)} (${escapeHtml(topic.en)}):</strong> لم يُنجز هذا المحور بعد — <a href="#play/${escapeHtml(topic.id)}">استعرض المحور الآن ←</a>`;
    };

    rootEl.querySelectorAll('[data-star-topic]').forEach((el) => {
      el.addEventListener('click', () => selectStarTopic(el.dataset.starTopic));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectStarTopic(el.dataset.starTopic);
        }
      });
    });

    /* تصفية قائمة Checklist */
    rootEl.querySelectorAll('[data-chk-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeChecklistFilter = btn.dataset.chkFilter || 'all';
        renderMyProfile();
      });
    });

    /* زر نسخ رابط الملف العام */
    const copyBtn = rootEl.querySelector('#profile-copy-public-btn');
    const shareStatus = rootEl.querySelector('#profile-share-status');
    if (copyBtn && publicProfileUrl) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(publicProfileUrl);
          if (shareStatus) {
            shareStatus.textContent = `تم نسخ رابط ملفك العام بنجاح ✓ (${publicProfileUrl})`;
            shareStatus.hidden = false;
          }
          deps.announce('تم نسخ رابط ملفك العام بنجاح');
        } catch {
          if (shareStatus) {
            shareStatus.textContent = `رابط ملفك العام: ${publicProfileUrl}`;
            shareStatus.hidden = false;
          }
        }
      });
    }

    rootEl.querySelectorAll('[data-trigger-signin]').forEach((btn) => {
      btn.addEventListener('click', () => deps.openSignInDialog('#profile'));
    });
  }

  /* ========================================================================
     2) عرض الملف العام القابل للمشاركة (#u/<userId>) — بيانات قابلة للمشاركة فقط
     ======================================================================== */
  async function renderPublicProfile(userId) {
    if (!rootEl || !deps) return;
    const topics = deps.getTopics();

    deps.renderBreadcrumbs([
      { label: 'الرئيسية', view: 'home', href: '#home' },
      { label: 'لوحة الصدارة', view: 'leaderboard', href: '#leaderboard' },
      { label: 'ملف الإنجازات العام' },
    ]);

    rootEl.innerHTML = `
      <div class="profile-card event-loading-card">
        <h1 id="profile-heading" class="profile-name">جاري تحميل ملف الإنجازات...</h1>
      </div>
    `;

    let data = null;
    try {
      const res = await fetch(`/api/profile/public/${encodeURIComponent(userId)}`, {
        cache: 'no-store',
      });
      if (res.ok) data = await res.json();
    } catch {
      /* تجاهل */
    }

    if (!data || !data.user) {
      rootEl.innerHTML = `
        <div class="profile-card event-loading-card">
          <h1 id="profile-heading" class="profile-name">لم يتم العثور على ملف الإنجازات</h1>
          <p class="section-subtitle">تأكد من صحة الرابط أو ابدأ تحدياتك الخاصة في الوصولية الرقمية.</p>
          <a href="#challenges" class="btn btn-primary">ابدأ التحدّي الآن ←</a>
        </div>
      `;
      return;
    }

    const mastery = mergeTopicMastery(topics, data.topicScores, {});
    const completedTopics = Object.values(mastery);
    const level = getLevelBadge(data.stats.topicsCompleted, 0, 0);
    const avatarHtml =
      data.user.avatarUrl && isSafeHttpUrl(data.user.avatarUrl)
        ? `<img src="${escapeHtml(data.user.avatarUrl)}" alt="" class="profile-avatar-img" referrerpolicy="no-referrer">`
        : `<span class="profile-avatar-fallback" aria-hidden="true">${escapeHtml((data.user.name || 'م').charAt(0))}</span>`;

    const currentUser = deps.getCurrentUser();
    const isOwner = currentUser && Number(currentUser.id) === Number(data.user.id);

    rootEl.innerHTML = `
      <div class="profile-page">
        <section class="profile-hero-card" aria-labelledby="profile-heading">
          <div class="profile-hero-top">
            <div class="profile-identity">
              ${avatarHtml}
              <div class="profile-id-text">
                <div class="profile-badges-row">
                  <span class="profile-level-pill tone-${level.tone}">
                    <span aria-hidden="true">${level.icon}</span>
                    <span>${escapeHtml(level.title)}</span>
                  </span>
                  <span class="profile-provider-pill">بطاقة إنجازات عامة • WCAG 2.2</span>
                </div>
                <h1 id="profile-heading" class="profile-name">${escapeHtml(data.user.name)}</h1>
                <p class="profile-sub">
                  مستوى الإتقان والإنجازات العلنية في لعبة «تحدّي الوصولية الرقمية».
                </p>
              </div>
            </div>

            <div class="profile-public-cta">
              ${
                isOwner
                  ? '<a href="#profile" class="btn btn-secondary">العودة للوحة تحكمي الخاصة</a>'
                  : '<a href="#challenges" class="btn btn-primary">نافس هذه النتيجة وابدأ التحدّي ←</a>'
              }
            </div>
          </div>

          <dl class="profile-kpis" aria-label="الإنجازات العامة">
            <div class="profile-kpi">
              <dt>المحاور المكتملة</dt>
              <dd>${data.stats.topicsCompleted} <span>من 10</span></dd>
            </div>
            <div class="profile-kpi">
              <dt>المركز في الصدارة</dt>
              <dd>${data.stats.rank ? `#${data.stats.rank}` : '—'} <span>${data.stats.rank ? `من ${data.stats.totalPlayers}` : ''}</span></dd>
            </div>
            <div class="profile-kpi">
              <dt>متوسط الدقة</dt>
              <dd>${data.stats.topicsCompleted > 0 ? `${data.stats.avgAccuracy}%` : '—'} <span>${data.stats.topicsCompleted > 0 ? `الوقت: ${formatDurationAr(data.stats.avgDurationSeconds)}` : ''}</span></dd>
            </div>
            <div class="profile-kpi">
              <dt>المحور الأبرز</dt>
              <dd class="is-topic-dd">${escapeHtml(data.stats.bestTopic || 'قريباً')}</dd>
            </div>
          </dl>
        </section>

        <section class="profile-radar-grid">
          <div class="profile-card profile-star-card">
            <h2 class="profile-card-title">خريطة مهارات ${escapeHtml(data.user.name)} (Star Plot)</h2>
            <div class="star-plot-wrap">
              ${buildStarPlotSvg(topics, mastery)}
            </div>
          </div>

          <div class="profile-card profile-insights-card">
            <h2 class="profile-card-title">المحاور المُنجزة</h2>
            ${
              completedTopics.length > 0
                ? `<ul class="insight-list">${completedTopics
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .map(
                      (t) =>
                        `<li><strong>${escapeHtml(t.topicAr)}</strong><span>دقة ${t.accuracy}% • ${formatDurationAr(t.durationSeconds)}</span></li>`
                    )
                    .join('')}</ul>`
                : '<p class="insight-empty">لم يُتمّ هذا اللاعب أي محور بعد.</p>'
            }
            <div class="insight-block is-next">
              <h3>🎯 هل تستطيع التفوّق على هذه النتيجة؟</h3>
              <p class="insight-next-text">اختبر مهارتك في اكتشاف أخطاء الوصولية الرقمية WCAG 2.2 وأنشئ بطاقة مهاراتك الخاصة!</p>
              <a href="#challenges" class="btn btn-primary">ابدأ تحدّي الوصولية الآن ←</a>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  window.ProfileModule = {
    init(options) {
      rootEl = options.container;
      deps = options;
    },
    renderMyProfile,
    renderPublicProfile,
    recordArticleRead(slug) {
      recordActivity('article', slug);
    },
    recordEventPlayed(gameId) {
      recordActivity('event', gameId);
    },
  };
})();
