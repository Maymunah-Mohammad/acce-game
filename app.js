(() => {
  'use strict';

  /* محاور الوصولية العشرة في المشروع */
  const WCAG_TOPICS = [
    {
      ar: 'التنقل وقابلية التنبؤ',
      en: 'Navigation & Predictability',
      count: 9,
      desc: 'اتساق القوائم ووضوح الروابط والعناوين وتوقع سلوك الواجهة.',
    },
    {
      ar: 'التركيز التفاعلي',
      en: 'Interactive Focus',
      count: 7,
      desc: 'وضوح مؤشر التركيز وترتيبه ودعم لوحة المفاتيح دون فخاخ.',
    },
    {
      ar: 'النماذج وتقليل العوائق',
      en: 'Forms & Friction',
      count: 6,
      desc: 'وضوح التسميات ومنع الأخطاء وتسهيل تسجيل الدخول وإدخال البيانات.',
    },
    {
      ar: 'الألوان والمظهر',
      en: 'Color & Appearance',
      count: 4,
      desc: 'تباين النصوص وعناصر الواجهة وعدم الاعتماد على اللون وحده.',
    },
    {
      ar: 'الطباعة والقراءة',
      en: 'Typography & Reading',
      count: 4,
      desc: 'تباعد النصوص وتكبير الخط وتجنب النصوص المدمجة في الصور.',
    },
    {
      ar: 'الحركة والرسوم المتحركة',
      en: 'Animation & Motion',
      count: 4,
      desc: 'تجنب الوميض وإتاحة الإيقاف المؤقت والتحكم في التوقيت.',
    },
    {
      ar: 'التخطيط والبنية',
      en: 'Layout & Structure',
      count: 3,
      desc: 'التسلسل المنطقي للمحتوى وإعادة التدفق ودعم اتجاهات الشاشة.',
    },
    {
      ar: 'الوسائط والصور',
      en: 'Media & Images',
      count: 3,
      desc: 'النصوص البديلة للصور والترجمة النصية والتحكم بالصوت.',
    },
    {
      ar: 'الإدخال والإيماءات',
      en: 'Input & Gestures',
      count: 3,
      desc: 'بدائل بسيطة لإيماءات السحب والحركة دون تعقيد.',
    },
    {
      ar: 'اللمس وأحجام الأهداف',
      en: 'Touch & Targets',
      count: 2,
      desc: 'أحجام الأزرار ومساحات اللمس الكافية لتجنب النقرات الخاطئة.',
    },
  ];

  /* بيانات افتراضية للوحة الصدارة (قابلة للتوسع بنتائج اللاعبين لاحقاً من localStorage) */
  const DEFAULT_LEADERBOARD = [
    { name: 'سارة العتيبي', topic: 'الألوان والمظهر', accuracy: 98, score: 4250, period: 'week' },
    { name: 'خالد الحربي', topic: 'التركيز التفاعلي', accuracy: 96, score: 3980, period: 'week' },
    { name: 'نورة القحطاني', topic: 'النماذج وتقليل العوائق', accuracy: 95, score: 3820, period: 'all' },
    { name: 'عبدالله الشمري', topic: 'التنقل وقابلية التنبؤ', accuracy: 92, score: 3610, period: 'week' },
    { name: 'ريم الدوسري', topic: 'الطباعة والقراءة', accuracy: 90, score: 3440, period: 'all' },
    { name: 'فيصل الزهراني', topic: 'التخطيط والبنية', accuracy: 88, score: 3190, period: 'week' },
  ];

  const STORAGE_KEY = 'accessibility_game_leaderboard_v1';
  const VIEW_LABELS = {
    home: 'الصفحة الرئيسية',
    challenges: 'صفحة التحديات',
    blog: 'المدونة',
    leaderboard: 'لوحة الصدارة',
  };

  /* مقالات المدونة الافتراضية (تُحدَّث ديناميكياً من ملف blog-data.json) */
  const FALLBACK_BLOG_ARTICLES = [
    {
      slug: 'wcag-3',
      featured: true,
      category: 'standards',
      categoryLabel: 'معايير W3C',
      date: 'نوفمبر 2026',
      readTime: '5 دقائق قراءة',
      title: 'متى يصدر معيار WCAG 3.0؟ وما أبرز التغييرات الجذرية فيه؟',
      excerpt:
        'دليل شامل حول الجدول الزمني المتوقع لإصدار WCAG 3.0، وآخر تحديثات مسودة W3C، وكيف ينتقل بنا من قواعد «نجاح/فشل» التقليدية إلى نموذج النتائج وقياس التباين الحديث APCA.',
      calloutTitle: 'الخلاصة السريعة حول موعد الإصدار',
      calloutText:
        'لا يزال معيار WCAG 3.0 في مرحلة مسودة العمل (W3C Working Draft) مع أحدث تحديث رئيسي نُشر في سبتمبر 2026، وتُقدَّر التوصية الرسمية النهائية (W3C Recommendation) حول عام 2028 أو ما بعده. وحتى صدوره، يظل WCAG 2.2 AA هو المعيار العملي والقانوني المعتمد.',
      sections: [
        {
          heading: 'متى يتم إصدار WCAG 3.0 رسمياً؟',
          paragraphs: [
            'تعمل مجموعة إرشادات الوصولية (AGWG) في اتحاد الويب العالمي W3C على تطوير معيار WCAG 3.0 ليكون الجيل القادم الذي يخلف سلسلة WCAG 2.x تدريجياً.',
            'شهد عام 2026 تحديثين بارزين لمسودة العمل (في مارس ثم سبتمبر 2026)، لكن المعيار لم يصل بعد إلى مرحلة الاعتماد النهائي. وتشير تقديرات خبراء الوصولية إلى أن الاعتماد الرسمي النهائي متوقع قرابة عام 2028 أو لاحقاً، ولذلك لا يُعدّ حالياً متطلباً قانونياً ملزماً في أي دولة.',
          ],
        },
        {
          heading: 'أبرز التغييرات والمزايا الجديدة في WCAG 3.0',
          paragraphs: [
            'لا يقتصر WCAG 3.0 على إضافة معايير جديدة فحسب، بل يُعيد تصميم فلسفة قياس الوصولية الرقمية بالكامل لتكون أكثر واقعية وشمولاً:',
          ],
          points: [
            {
              label: 'التحوّل إلى «النتائج والمتطلبات» (Outcomes & Requirements):',
              text: 'بدلاً من معايير النجاح الثنائية الصارمة (ناجح/فاشل)، يركّز المعيار على النتيجة التي يختبرها المستخدم فعلياً، ويقسّم البنود إلى متطلبات أساسية (Core) وأخرى إضافية (Supplemental) مع طرق تطبيق مخصصة لكل تقنية.',
            },
            {
              label: 'وسوم شدّة الأثر (Severity Tags):',
              text: 'تصنيف تأثير العوائق على المستخدم إلى درجات واضحة: الضرر الجسدي (Physical Harm)، والمخاطرة (Risk)، والعائق الكامل (Barrier)، والاحتكاك (Friction) لمساعدة الفرق على ترتيب أولويات الإصلاح.',
            },
            {
              label: 'نموذج امتثال وتقارير أكثر مرونة:',
              text: 'طوّرت مسودات 2026 النموذج ليعتمد خط أساس موحّداً للامتثال عند استيفاء المتطلبات الأساسية، مع استخدام مستويات (برونزي / فضي / ذهبي) كإطار للإفصاح عن التقدّم، وإضافة «التأكيدات» (Assertions) لتوثيق اختبارات المستخدمين والعمليات الداخلية.',
            },
            {
              label: 'نطاق أوسع يتجاوز صفحات الويب التقليدية:',
              text: 'صُمِّم ليشمل تطبيقات الويب، وتطبيقات الهواتف الذكية، وأدوات التأليف، والواقع الافتراضي والمعزّز (VR/AR)، وتقنيات إنترنت الأشياء.',
            },
            {
              label: 'ثورة في قياس التباين (APCA) والوصولية الإدراكية:',
              text: 'يوسّع المعيار التغطية للصعوبات الإدراكية والتعلمية وضعف البصر، ويستكشف نماذج تباين حديثة مثل APCA التي تأخذ في الاعتبار حجم الخط وسماكته وإدراك العين البشرية الحقيقي.',
            },
          ],
        },
        {
          heading: 'ماذا تفعل الفرق الرقمية اليوم؟',
          paragraphs: [
            'ينصح خبراء W3C بعدم الانتظار حتى صدور WCAG 3.0؛ فالالتزام الكامل بمعيار WCAG 2.2 (المستوى AA) وتطبيق البنية الدلالية السليمة اليوم هو أفضل أساس يضمن انتقالاً سلساً وسريعاً للمعيار الجديد عند اعتماده.',
          ],
        },
      ],
      takeawayTitle: 'كيف ترتبط لعبتنا بهذا المستقبل؟',
      takeawayText:
        'تغطي التحديات العشرة في «تحدّي الوصولية» الركائز الجوهرية في WCAG 2.2 التي تشكّل حجر الأساس للمتطلبات الأساسية في WCAG 3.0 — خصوصاً التركيز التفاعلي، وتقليل العوائق في النماذج، وتباين النصوص.',
    },
    {
      slug: 'ai-and-accessibility',
      featured: false,
      category: 'ai',
      categoryLabel: 'الذكاء الاصطناعي',
      date: 'نوفمبر 2026',
      readTime: '4 دقائق قراءة',
      title: 'كيف يُعيد الذكاء الاصطناعي التوليدي تشكيل الوصولية الرقمية؟',
      excerpt:
        'نظرة على أحدث مسودات W3C حول وصولية الذكاء الاصطناعي وتعلّم الآلة، ودور نماذج الرؤية واللغة (VLMs) في وصف الرسوم البيانية، والفرق الجوهري بين أدوات المطورين الذكية والإضافات السطحية.',
      calloutTitle: 'الذكاء الاصطناعي كشريك لا كبديل',
      calloutText:
        'في عام الذكاء الاصطناعي 2026، يتجه البحث العلمي نحو دمج الذكاء الاصطناعي داخل بيئة التطوير والتأليف (Shift-Left) لإنتاج شيفرة متاحة من البداية، بدلاً من محاولة ترقيع المواقع بعد نشرها.',
      sections: [
        {
          heading: 'أبرز الاختراقات العلمية الحديثة',
          paragraphs: [
            'تجاوزت تطبيقات الذكاء الاصطناعي في الوصولية مجرد التحقق الآلي من وجود النص البديل، لتدخل مجالات أكثر عمقاً وتأثيراً:',
          ],
          points: [
            {
              label: 'النماذج متعددة الوسائط (VLMs) للرسوم البيانية المعقّدة:',
              text: 'أصبحت قادرة على توليد وصف سياقي دقيق للخرائط والمخططات والصور التعليمية، مع أبحاث متقدمة لمنع الهلوسة وضمان إيجاز الوصف لقارئات الشاشة.',
            },
            {
              label: 'التفاعل المبني على القصد (Intent-Based Navigation):',
              text: 'بدلاً من إجبار ذوي الإعاقات الحركية على التنقل عبر عشرات العناصر البرمجية، تتيح النماذج الحديثة تنفيذ أوامر طبيعية مباشرة مع احترام واجهات الوصولية البرمجية.',
            },
            {
              label: 'تحذير W3C من «الإضافات السطحية» (AI Overlays):',
              text: 'يؤكد الباحثون أن أدوات الترقيع التلقائية فوق المواقع غير المتاحة لا تحقق الامتثال الحقيقي، وأن القيمة الكبرى تكمن في دمج الذكاء الاصطناعي في أدوات التصميم وأنظمة إدارة المحتوى.',
            },
          ],
        },
      ],
      takeawayTitle: 'خلاصة بحثية',
      takeawayText:
        'أقوى استخدام للذكاء الاصطناعي في الوصولية هو تمكين المصممين والمطورين من اكتشاف العوائق وإصلاحها أثناء البناء، مع إبقاء الإنسان وتجارب المستخدمين الحقيقيين في قلب التقييم.',
    },
    {
      slug: 'apca-contrast-science',
      featured: false,
      category: 'research',
      categoryLabel: 'أبحاث وتقنيات',
      date: 'أكتوبر 2026',
      readTime: '4 دقائق قراءة',
      title: 'خوارزمية APCA وعلم تباين الألوان: لماذا لا تكفي نسبة 4.5:1 وحدها؟',
      excerpt:
        'كيف طوّر علماء البصريات نموذجاً إدراكياً جديداً يحسب قابلية القراءة بناءً على سماكة الخط وحجمه وقطبية الخلفية (الوضع الفاتح مقابل الداكن).',
      calloutTitle: 'ما هي APCA؟',
      calloutText:
        'اختصاراً لـ Accessible Perceptual Contrast Algorithm، وهي خوارزمية حديثة قيد الدراسة ضمن جهود WCAG 3.0 لتجاوز القيود الرياضية في معادلة التباين القديمة.',
      sections: [
        {
          heading: 'لماذا احتاج العلم إلى معادلة تباين جديدة؟',
          paragraphs: [
            'اعتمدت معايير WCAG 2.x على نسبة تباين ثابتة (مثل 4.5:1 للنص العادي) لا تفرّق بين نص أبيض على خلفية داكنة أو نص داكن على خلفية فاتحة، ولا تأخذ سماكة الخط بالحسبان بشكل دقيق.',
            'أثبتت الأبحاث البصرية الحديثة أن العين البشرية تدرك التباين بصورة مختلفة تبعاً لثلاثة عوامل مجتمعة: سطوع الخلفية مقابل النص (Polarity)، ووزن الخط (Font Weight)، وحجم الحروف.',
          ],
          points: [
            {
              label: 'التمييز بين الوضع الفاتح والداكن:',
              text: 'تراعي APCA أن التوهج البصري (Halation) في الوضع الداكن يجعل بعض الألوان تبدو أصعب قراءة مما توحي به المعادلة القديمة.',
            },
            {
              label: 'تقييم متدرّج لقيمة Lc:',
              text: 'تُعبّر الخوارزمية عن النتيجة بقيمة تباين إدراكي (مثل Lc 60 أو Lc 75) مرتبطة مباشرة بجدول مقاس وسماكة الخط.',
            },
          ],
        },
      ],
      takeawayTitle: 'تطبيق عملي اليوم',
      takeawayText:
        'يمكنك التحقق من التباين بمعيار WCAG 2.2 (للامتثال الرسمي) مع استخدام حاسبات APCA كفحص إضافي لضمان راحة العين خاصة في الوضع الداكن والخطوط الرفيعة.',
    },
    {
      slug: 'cognitive-and-xr-accessibility',
      featured: false,
      category: 'research',
      categoryLabel: 'أبحاث وتقنيات',
      date: 'أكتوبر 2026',
      readTime: '3 دقائق قراءة',
      title: 'الوصولية الإدراكية والواقع الممتد (XR): آفاق الأبحاث الحديثة',
      excerpt:
        'كيف تساعد تقنيات التكيّف الشخصي (WAI-Adapt) وتبسيط الواجهات وخرائط الفضاء ثلاثي الأبعاد في جعل المستقبل الرقمي متاحاً للجميع.',
      calloutTitle: 'الوصولية ليست بصرية وحركية فقط',
      calloutText:
        'تشير أحدث أوراق W3C إلى أن تخفيف العبء الإدراكي وتخصيص واجهة القراءة يُعدّ من أسرع مجالات أبحاث الوصولية نمواً وتأثيراً.',
      sections: [
        {
          heading: 'اتجاهان يقودان أبحاث المستقبل',
          paragraphs: [
            'تركّز المختبرات البحثية ومجموعات العمل العالمية حالياً على فتح آفاق جديدة لفئتين طالما واجهتا عوائق رقمية صامتة:',
          ],
          points: [
            {
              label: 'التخصيص الإدراكي وتبسيط اللغة (WAI-Adapt):',
              text: 'إتاحة أدوات متصفح ذكية تسمح للمستخدم بتقليل المشتتات، أو إظهار رموز مساعدة مألوفة بجانب الأزرار، أو تلخيص النصوص المعقّدة دون فقدان المعنى.',
            },
            {
              label: 'تمثيل دلالي لبيئات الواقع الممتد (XR):',
              text: 'تحويل الكائنات ثلاثية الأبعاد والصوت المكاني إلى عقد دلالية مفهومة لقارئات الشاشة وأجهزة الإدخال البديلة حتى لا يُستبعد أحد من تجارب الحوسبة المكانية.',
            },
          ],
        },
      ],
      takeawayTitle: 'قاعدة ذهبية في التصميم الشامل',
      takeawayText:
        'الوضوح، وتقليل التشتيت، واللغة البسيطة، والاتساق في التنقل ليست مجرد مزايا لذوي الصعوبات الإدراكية — بل ترفع جودة التجربة لكل مستخدم.',
    },
  ];

  /* عناصر DOM */
  const viewSections = document.querySelectorAll('[data-view]');
  const viewLinks = document.querySelectorAll('[data-view-link]');
  const liveAnnouncer = document.getElementById('live-announcer');

  const menuToggleBtn = document.getElementById('menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  const topicsGrid = document.getElementById('topics-grid');
  const challengesGrid = document.getElementById('challenges-grid');

  const blogListContainer = document.getElementById('blog-list-container');
  const blogGrid = document.getElementById('blog-grid');
  const blogCount = document.getElementById('blog-count');
  const blogFilterButtons = document.querySelectorAll('[data-blog-filter]');
  const blogReader = document.getElementById('blog-reader');
  const blogArticleContent = document.getElementById('blog-article-content');
  const blogBackBtn = document.getElementById('blog-back-btn');

  const leaderboardBody = document.getElementById('leaderboard-body');
  const leaderboardCount = document.getElementById('leaderboard-count');
  const filterButtons = document.querySelectorAll('[data-filter]');

  const dialogBackdrop = document.getElementById('start-dialog-backdrop');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogDesc = document.getElementById('dialog-desc');
  const dialogCloseBtn = document.getElementById('dialog-close-btn');
  const dialogConfirmBtn = document.getElementById('dialog-confirm-btn');
  const dialogLeaderboardBtn = document.getElementById('dialog-leaderboard-btn');

  let blogArticles = FALLBACK_BLOG_ARTICLES;
  let activeFilter = 'all';
  let activeBlogFilter = 'all';
  let lastFocusedBeforeDialog = null;
  let lastFocusedArticleTrigger = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isSafeHttpUrl(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  }

  function formatChallengeCount(count) {
    return count === 2 ? 'تحدّيان' : `${count} تحديات`;
  }

  /* الإعلان لقارئات الشاشة */
  function announce(message) {
    if (!liveAnnouncer) return;
    liveAnnouncer.textContent = '';
    window.requestAnimationFrame(() => {
      liveAnnouncer.textContent = message;
    });
  }

  /* التنقل بين الصفحات (الرئيسية / التحديات / المدونة / لوحة الصدارة) */
  function setActiveView(viewName, { updateHash = true, moveFocus = false, articleSlug = null } = {}) {
    const validViews = ['home', 'challenges', 'blog', 'leaderboard'];
    const targetView = validViews.includes(viewName) ? viewName : 'home';

    viewSections.forEach((section) => {
      const isMatch = section.dataset.view === targetView;
      section.hidden = !isMatch;
    });

    viewLinks.forEach((link) => {
      const isNavLink = link.classList.contains('nav-link');
      const isMatch = link.dataset.viewLink === targetView;
      if (isNavLink) {
        link.classList.toggle('is-active', isMatch);
        if (isMatch) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    });

    if (targetView === 'blog') {
      if (articleSlug) {
        showBlogArticle(articleSlug, { updateHash: false, moveFocus });
      } else {
        showBlogList({ updateHash: false, moveFocus: false });
      }
    }

    if (updateHash) {
      const nextHash = targetView === 'blog' && articleSlug ? `#blog/${articleSlug}` : `#${targetView}`;
      if (window.location.hash !== nextHash) {
        history.pushState(null, '', nextHash);
      }
    }

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (moveFocus && !(targetView === 'blog' && articleSlug)) {
      const heading = document.querySelector(`[data-view="${targetView}"] h1`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }

    if (!(targetView === 'blog' && articleSlug)) {
      announce(`تم الانتقال إلى ${VIEW_LABELS[targetView]}`);
    }
  }

  function syncViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'challenges') {
      setActiveView('challenges', { updateHash: false });
    } else if (hash === 'blog') {
      setActiveView('blog', { updateHash: false });
    } else if (hash.startsWith('blog/')) {
      const slug = hash.slice('blog/'.length);
      const exists = blogArticles.some((article) => article.slug === slug);
      setActiveView('blog', { updateHash: false, articleSlug: exists ? slug : null });
    } else if (hash === 'leaderboard') {
      setActiveView('leaderboard', { updateHash: false });
    } else {
      setActiveView('home', { updateHash: false });
    }
  }

  /* قائمة الجوال */
  function closeMobileMenu() {
    if (!menuToggleBtn || !primaryNav) return;
    primaryNav.classList.remove('is-open');
    menuToggleBtn.setAttribute('aria-expanded', 'false');
    menuToggleBtn.setAttribute('aria-label', 'فتح قائمة التنقل');
  }

  function toggleMobileMenu() {
    if (!menuToggleBtn || !primaryNav) return;
    const isOpen = primaryNav.classList.toggle('is-open');
    menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
    menuToggleBtn.setAttribute('aria-label', isOpen ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل');
  }

  /* بناء بطاقات المحاور العشرة في الصفحة الرئيسية */
  function renderTopics() {
    if (!topicsGrid) return;
    const fragment = document.createDocumentFragment();

    WCAG_TOPICS.forEach((topic) => {
      const countLabel = formatChallengeCount(topic.count);
      const li = document.createElement('li');
      li.className = 'topic-card';
      li.innerHTML = `
        <div class="topic-card-top">
          <h3 class="topic-name">${topic.ar}</h3>
          <span class="topic-count">${countLabel}</span>
        </div>
        <p class="topic-en">${topic.en}</p>
      `;
      fragment.appendChild(li);
    });

    topicsGrid.appendChild(fragment);
  }

  /* بناء بطاقات صفحة التحديات */
  function renderChallenges() {
    if (!challengesGrid) return;
    const fragment = document.createDocumentFragment();

    WCAG_TOPICS.forEach((topic) => {
      const countLabel = formatChallengeCount(topic.count);
      const li = document.createElement('li');
      li.className = 'challenge-card';
      li.innerHTML = `
        <div class="challenge-card-head">
          <div class="topic-card-top">
            <h2 class="challenge-card-title">${topic.ar}</h2>
            <span class="topic-count">${countLabel}</span>
          </div>
          <p class="topic-en">${topic.en}</p>
          <p class="challenge-card-desc">${topic.desc}</p>
        </div>
        <button type="button" class="challenge-card-btn">ابدأ المحور</button>
      `;

      const startBtn = li.querySelector('.challenge-card-btn');
      startBtn.addEventListener('click', () => openTopicDialog(topic));

      fragment.appendChild(li);
    });

    challengesGrid.appendChild(fragment);
  }

  /* قراءة وعرض لوحة الصدارة */
  function getLeaderboardData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      /* تجاهل أخطاء التخزين في الوضع الخاص */
    }
    return DEFAULT_LEADERBOARD;
  }

  function renderLeaderboard(filter = 'all') {
    if (!leaderboardBody) return;
    activeFilter = filter;

    const allEntries = getLeaderboardData().slice().sort((a, b) => b.score - a.score);
    const filtered = allEntries.filter((entry) => {
      if (filter === 'week') return entry.period === 'week';
      if (filter === 'perfect') return entry.accuracy >= 95;
      return true;
    });

    leaderboardBody.innerHTML = '';

    filtered.forEach((entry, index) => {
      const rank = index + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="rank-badge ${rankClass}">${rank}</span></td>
        <td class="player-name">${entry.name}</td>
        <td>${entry.topic}</td>
        <td><span class="accuracy-pill">${entry.accuracy}%</span></td>
        <td class="score-cell">${entry.score.toLocaleString('ar-SA')} نقطة</td>
      `;
      leaderboardBody.appendChild(tr);
    });

    if (leaderboardCount) {
      leaderboardCount.textContent = `عرض ${filtered.length} من ${allEntries.length} لاعبين`;
    }
  }

  const POLICY_CONTENT = {
    terms: {
      title: 'شروط الاستخدام',
      desc: 'لعبة «تحدّي الوصولية» مبادرة تعليمية تفاعلية تهدف إلى نشر الوعي بمعايير الوصولية الرقمية WCAG 2.2 ضمن فعاليات #عام_الذكاء_الاصطناعي. يُسمح باستخدام المحتوى لأغراض التعلّم والتدريب غير التجاري مع احترام حقوق الملكية الفكرية.',
    },
    privacy: {
      title: 'سياسة الخصوصية',
      desc: 'نحترم خصوصيتك بالكامل؛ لا تجمع هذه اللعبة أي بيانات شخصية حساسة ولا تُرسل معلوماتك لخوادم خارجية. تُحفظ نتائجك ونقاطك في لوحة الصدارة محلياً على متصفحك فقط ويمكنك مسحها في أي وقت.',
    },
    accessibility: {
      title: 'بيان الوصولية',
      desc: 'صُمّمت هذه الصفحة وفق معايير WCAG 2.2 (AA / AAA): تباين لوني مرتفع، تنقل كامل بلوحة المفاتيح، أحجام أزرار مريحة لا تقل عن 44 بكسل، دعم قارئات الشاشة، واحترام تفضيل تقليل الحركة.',
    },
    contact: {
      title: 'تواصل معنا',
      desc: 'يسعدنا استقبال ملاحظاتكم ومقترحاتكم لتطوير التحديات وتحسين تجربة الوصولية الرقمية في اللعبة ضمن مبادرات #عام_الذكاء_الاصطناعي.',
    },
  };

  /* النافذة الحوارية المتوافقة مع الوصولية (Focus Trap + Escape) */
  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function openDialog({ title, desc, showLeaderboardAction = true } = {}) {
    if (!dialogBackdrop) return;
    lastFocusedBeforeDialog = document.activeElement;

    if (dialogTitle && title) {
      dialogTitle.textContent = title;
    }
    if (dialogDesc && desc) {
      dialogDesc.textContent = desc;
    }
    if (dialogLeaderboardBtn) {
      dialogLeaderboardBtn.hidden = !showLeaderboardAction;
    }

    dialogBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    dialogConfirmBtn.focus();
  }

  function openTopicDialog(topic) {
    const countLabel = formatChallengeCount(topic.count);
    openDialog({
      title: `محور ${topic.ar}`,
      desc: `يحتوي هذا المحور على ${countLabel} في معايير الوصولية (${topic.en}). في الخطوة القادمة سنبني شاشة اللعب الفعلية لخوض التحديات واحتساب النقاط.`,
      showLeaderboardAction: true,
    });
  }

  function closeDialog() {
    if (!dialogBackdrop || dialogBackdrop.hidden) return;
    dialogBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedBeforeDialog && typeof lastFocusedBeforeDialog.focus === 'function') {
      lastFocusedBeforeDialog.focus();
    }
  }

  function handleDialogKeydown(event) {
    if (dialogBackdrop.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusableElements(dialogBackdrop);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /* ربط الأحداث */
  viewLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setActiveView(link.dataset.viewLink, { updateHash: true, moveFocus: true });
    });
  });

  window.addEventListener('hashchange', syncViewFromHash);

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', toggleMobileMenu);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && primaryNav && primaryNav.classList.contains('is-open')) {
      closeMobileMenu();
      menuToggleBtn.focus();
    }
    handleDialogKeydown(event);
  });

  /* تحميل مقالات المدونة من blog-data.json */
  async function loadBlogArticles() {
    try {
      const response = await fetch('./blog-data.json', { cache: 'no-cache' });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        blogArticles = data;
        renderBlogList(activeBlogFilter);
        if (window.location.hash.startsWith('#blog/')) {
          syncViewFromHash();
        }
      }
    } catch {
      /* استخدام المقالات المضمنة كاحتياطي عند الفتح المباشر بدون خادم */
    }
  }

  /* بناء قائمة مقالات المدونة وقارئ المقال */
  function renderBlogList(filter = 'all') {
    if (!blogGrid) return;
    activeBlogFilter = filter;

    const filtered = blogArticles.filter((article) => {
      if (filter === 'all') return true;
      return article.category === filter;
    });

    blogGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filtered.forEach((article) => {
      const safeCategory = ['standards', 'ai', 'research'].includes(article.category)
        ? article.category
        : 'research';
      const card = document.createElement('article');
      card.className = `blog-card${article.featured && filter === 'all' ? ' is-featured' : ''}`;
      card.innerHTML = `
        <div>
          <div class="blog-card-meta">
            ${article.featured ? '<span class="blog-featured-badge">مقال مميز</span>' : ''}
            <span class="blog-tag tag-${safeCategory}">${escapeHtml(article.categoryLabel)}</span>
            <span class="blog-date">${escapeHtml(article.date)}</span>
          </div>
          <h2 class="blog-card-title">${escapeHtml(article.title)}</h2>
          <p class="blog-card-excerpt">${escapeHtml(article.excerpt)}</p>
        </div>
        <div class="blog-card-footer">
          <span class="blog-read-time">${escapeHtml(article.readTime)}</span>
          <button type="button" class="blog-read-btn" data-article-slug="${escapeHtml(article.slug)}">
            <span>اقرأ المقال</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      `;

      const readBtn = card.querySelector('.blog-read-btn');
      readBtn.addEventListener('click', () => {
        lastFocusedArticleTrigger = readBtn;
        showBlogArticle(article.slug, { updateHash: true, moveFocus: true });
      });

      fragment.appendChild(card);
    });

    blogGrid.appendChild(fragment);

    if (blogCount) {
      blogCount.textContent = `عرض ${filtered.length} من ${blogArticles.length} مقالات`;
    }
  }

  function showBlogArticle(slug, { updateHash = true, moveFocus = true } = {}) {
    if (!blogListContainer || !blogReader || !blogArticleContent) return;
    const article = blogArticles.find((item) => item.slug === slug);
    if (!article) {
      showBlogList({ updateHash, moveFocus });
      return;
    }

    const safeCategory = ['standards', 'ai', 'research'].includes(article.category)
      ? article.category
      : 'research';

    const sectionsHtml = (article.sections || [])
      .map((section) => {
        const paragraphsHtml = (section.paragraphs || [])
          .map((p) => `<p>${escapeHtml(p)}</p>`)
          .join('');
        const pointsHtml = section.points
          ? `<ul class="article-points">${section.points
              .map(
                (pt) =>
                  `<li><strong>${escapeHtml(pt.label)}</strong> ${escapeHtml(pt.text)}</li>`
              )
              .join('')}</ul>`
          : '';
        return `
          <section class="article-section">
            <h2>${escapeHtml(section.heading)}</h2>
            ${paragraphsHtml}
            ${pointsHtml}
          </section>
        `;
      })
      .join('');

    const validSources = Array.isArray(article.sources)
      ? article.sources.filter((src) => src && isSafeHttpUrl(src.url))
      : [];

    const sourcesHtml =
      validSources.length > 0
        ? `
          <section class="article-sources" aria-label="المصادر والمراجع">
            <h2>المصادر والمراجع</h2>
            <ul class="sources-list">
              ${validSources
                .map(
                  (src) => `
                    <li>
                      <a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(src.title || src.url)}
                      </a>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </section>
        `
        : '';

    blogArticleContent.innerHTML = `
      <div class="blog-card-meta">
        ${article.featured ? '<span class="blog-featured-badge">مقال مميز</span>' : ''}
        <span class="blog-tag tag-${safeCategory}">${escapeHtml(article.categoryLabel)}</span>
        <span class="blog-date">${escapeHtml(article.date)}</span>
        <span class="blog-read-time">• ${escapeHtml(article.readTime)}</span>
      </div>
      <h1 class="article-title">${escapeHtml(article.title)}</h1>
      <p class="article-lead">${escapeHtml(article.excerpt)}</p>
      <div class="article-callout">
        <strong>${escapeHtml(article.calloutTitle)}</strong>
        <p>${escapeHtml(article.calloutText)}</p>
      </div>
      ${sectionsHtml}
      <div class="article-takeaway">
        <strong>${escapeHtml(article.takeawayTitle)}</strong>
        <p>${escapeHtml(article.takeawayText)}</p>
      </div>
      ${sourcesHtml}
    `;

    blogListContainer.hidden = true;
    blogReader.hidden = false;

    if (updateHash) {
      const nextHash = `#blog/${article.slug}`;
      if (window.location.hash !== nextHash) {
        history.pushState(null, '', nextHash);
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' });

    if (moveFocus) {
      const titleEl = blogArticleContent.querySelector('.article-title');
      if (titleEl) {
        titleEl.setAttribute('tabindex', '-1');
        titleEl.focus();
      }
    }

    announce(`تم فتح مقال: ${article.title}`);
  }

  function showBlogList({ updateHash = true, moveFocus = true } = {}) {
    if (!blogListContainer || !blogReader) return;
    blogReader.hidden = true;
    blogListContainer.hidden = false;

    if (updateHash) {
      if (window.location.hash !== '#blog') {
        history.pushState(null, '', '#blog');
      }
    }

    if (moveFocus) {
      if (lastFocusedArticleTrigger && document.contains(lastFocusedArticleTrigger)) {
        lastFocusedArticleTrigger.focus();
      } else {
        const heading = document.getElementById('blog-heading');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      }
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((other) => {
        const isCurrent = other === btn;
        other.classList.toggle('is-active', isCurrent);
        other.setAttribute('aria-pressed', String(isCurrent));
      });
      renderLeaderboard(filter);
    });
  });

  blogFilterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.blogFilter;
      blogFilterButtons.forEach((other) => {
        const isCurrent = other === btn;
        other.classList.toggle('is-active', isCurrent);
        other.setAttribute('aria-pressed', String(isCurrent));
      });
      renderBlogList(filter);
    });
  });

  if (blogBackBtn) {
    blogBackBtn.addEventListener('click', () => {
      showBlogList({ updateHash: true, moveFocus: true });
      announce('تمت العودة إلى قائمة مقالات المدونة');
    });
  }

  document.querySelectorAll('[data-policy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const policy = POLICY_CONTENT[btn.dataset.policy];
      if (!policy) return;
      openDialog({
        title: policy.title,
        desc: policy.desc,
        showLeaderboardAction: false,
      });
    });
  });

  if (dialogCloseBtn) {
    dialogCloseBtn.addEventListener('click', closeDialog);
  }

  if (dialogConfirmBtn) {
    dialogConfirmBtn.addEventListener('click', closeDialog);
  }

  if (dialogLeaderboardBtn) {
    dialogLeaderboardBtn.addEventListener('click', () => {
      closeDialog();
      setActiveView('leaderboard', { updateHash: true, moveFocus: true });
    });
  }

  if (dialogBackdrop) {
    dialogBackdrop.addEventListener('click', (event) => {
      if (event.target === dialogBackdrop) {
        closeDialog();
      }
    });
  }

  /* التهيئة الأولية */
  renderTopics();
  renderChallenges();
  renderBlogList(activeBlogFilter);
  renderLeaderboard(activeFilter);
  syncViewFromHash();
  loadBlogArticles();
})();
