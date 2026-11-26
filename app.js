(() => {
  'use strict';

  /* محاور الوصولية العشرة في المشروع مع التعريف ونقاط التركيز والمخرجات */
  const WCAG_TOPICS = [
    {
      id: 'navigation-predictability',
      ar: 'التنقل وقابلية التنبؤ',
      en: 'Navigation & Predictability',
      count: 9,
      duration: '5 دقائق',
      desc: 'اتساق القوائم ووضوح الروابط والعناوين وتوقع سلوك الواجهة.',
      definition:
        'يتناول هذا المحور قدرة المستخدم على التنقّل داخل الموقع بسلاسة وفهم مكانه الحالي وتوقّع ما سيحدث عند النقر أو التركيز على أي عنصر دون مفاجآت مربكة.',
      focusAreas: [
        'غرض الروابط الواضح (Link Purpose)',
        'اتساق قوائم التنقل والتعريف',
        'وضوح العناوين والتسميات',
        'تعدّد طرق الوصول وتحديد الموقع',
        'ثبات موضع المساعدة (Consistent Help)',
        'السلوك المتوقع عند التركيز والإدخال',
      ],
      outcomes: [
        'تمييز الروابط الغامضة مثل «اضغط هنا» واستبدالها بوصف واضح لوجهتها.',
        'اكتشاف تغيّر السياق المفاجئ عند التركيز أو الإدخال الذي يربك قارئات الشاشة.',
        'تصميم هيكل تنقل متّسق يمكّن المستخدم من معرفة موقعه والوصول لهدفه بأكثر من طريقة.',
      ],
    },
    {
      id: 'interactive-focus',
      ar: 'التركيز التفاعلي',
      en: 'Interactive Focus',
      count: 7,
      duration: '4 دقائق',
      desc: 'وضوح مؤشر التركيز وترتيبه ودعم لوحة المفاتيح دون فخاخ.',
      definition:
        'يركّز هذا المحور على تجربة مستخدمي لوحة المفاتيح وأدوات الإدخال البديلة، لضمان إمكانية الوصول لكل عنصر تفاعلي مع مؤشر تركيز واضح ومرتب وغير محجوب.',
      focusAreas: [
        'التحكّم الكامل بلوحة المفاتيح (Keyboard)',
        'منع فخاخ لوحة المفاتيح (No Keyboard Trap)',
        'وضوح ومظهر مؤشر التركيز',
        'عدم حجب عنصر التركيز (Focus Not Obscured)',
        'الترتيب المنطقي للتنقل بـ Tab',
        'المحتوى الظاهر عند التمرير أو التركيز',
      ],
      outcomes: [
        'رصد العناصر التي لا يمكن الوصول إليها أو الخروج منها عبر لوحة المفاتيح.',
        'التحقق من وضوح حلقة التركيز وعدم اختفائها خلف الشريط العلوي أو النوافذ المنبثقة.',
        'تقييم التسلسل المنطقي للتنقل وسلوك القوائم الظاهرة عند التمرير أو التركيز.',
      ],
    },
    {
      id: 'forms-friction',
      ar: 'النماذج وتقليل العوائق',
      en: 'Forms & Friction',
      count: 6,
      duration: '4 دقائق',
      desc: 'وضوح التسميات ومنع الأخطاء وتسهيل تسجيل الدخول وإدخال البيانات.',
      definition:
        'يهدف هذا المحور إلى جعل تعبئة النماذج وتسجيل الدخول تجربة ميسّرة خالية من الإحباط عبر تسميات واضحة ورسائل خطأ مفيدة وتقليل التكرار والعبء الذهني.',
      focusAreas: [
        'التسميات والتعليمات الواضحة للحقول',
        'تحديد الأخطاء واقتراح تصحيحها',
        'منع الأخطاء في العمليات الحساسة',
        'تجنّب تكرار إدخال البيانات (Redundant Entry)',
        'المصادقة الميسّرة (Accessible Auth)',
      ],
      outcomes: [
        'التمييز بين التسمية الدائمة الواضحة والنص المؤقت (Placeholder) الذي يختفي عند الكتابة.',
        'صياغة رسائل خطأ دقيقة تشرح المشكلة وتقترح الحل بدلاً من الاكتفاء بلون أحمر.',
        'اكتشاف عوائق تسجيل الدخول المعقّدة والخطوات المكررة التي ترهق المستخدم.',
      ],
    },
    {
      id: 'color-appearance',
      ar: 'الألوان والمظهر',
      en: 'Color & Appearance',
      count: 4,
      duration: '3 دقائق',
      desc: 'تباين النصوص وعناصر الواجهة وعدم الاعتماد على اللون وحده.',
      definition:
        'يهتم هذا المحور بوضوح الرؤية البصرية لضعاف البصر وذوي عمى الألوان، عبر تحقيق نسب تباين كافية للنصوص والمكوّنات وتقديم إشارات بصرية إضافية بجانب اللون.',
      focusAreas: [
        'تباين النصوص الأساسي (AA — 4.5:1)',
        'تباين النصوص المعزّز (AAA — 7:1)',
        'تباين مكونات الواجهة والأيقونات (3:1)',
        'عدم الاعتماد على اللون وحده (Use of Color)',
      ],
      outcomes: [
        'اكتشاف النصوص الباهتة وحدود الحقول والأزرار ذات التباين غير الكافي.',
        'التأكد من وجود أيقونات أو نصوص أو أنماط مرافقة للون في التنبيهات والرسوم البيانية.',
        'الموازنة بين جمال لوحة الألوان وسهولة القراءة في مختلف ظروف الإضاءة.',
      ],
    },
    {
      id: 'typography-reading',
      ar: 'الطباعة والقراءة',
      en: 'Typography & Reading',
      count: 4,
      duration: '3 دقائق',
      desc: 'تباعد النصوص وتكبير الخط وتجنب النصوص المدمجة في الصور.',
      definition:
        'يركّز هذا المحور على راحة القراءة ومرونة النصوص، بحيث يستطيع المستخدم تكبير الخط أو تعديل التباعد دون تداخل أو انقطاع، مع تعليمات مفهومة للجميع.',
      focusAreas: [
        'مرونة تباعد الأسطر والفقرات (Text Spacing)',
        'تكبير النص حتى 200% دون فقدان المحتوى',
        'تجنّب النصوص المدمجة داخل الصور',
        'تجنّب التعليمات الحسية وحدها (الشكل/الموقع)',
      ],
      outcomes: [
        'التفريق بين النصوص الحقيقية القابلة للتكبير والبحث وبين صور النصوص الثابتة.',
        'رصد انكسار التصميم أو تداخل الجمل عند تكبير الخط أو زيادة تباعد السطور.',
        'كتابة إرشادات واضحة لا تعتمد على «الزر الأخضر على اليسار» فقط.',
      ],
    },
    {
      id: 'animation-motion',
      ar: 'الحركة والرسوم المتحركة',
      en: 'Animation & Motion',
      count: 4,
      duration: '3 دقائق',
      desc: 'تجنب الوميض وإتاحة الإيقاف المؤقت والتحكم في التوقيت.',
      definition:
        'يعالج هذا المحور سلامة المستخدمين الذين يعانون من الحساسية البصرية أو الدوار الحركي أو يحتاجون وقتاً إضافياً لقراءة المحتوى المتحرك والتفاعل معه.',
      focusAreas: [
        'تجنّب الوميض السريع (Three Flashes)',
        'إتاحة الإيقاف المؤقت أو الإخفاء',
        'التحكّم في المؤقتات والمهل الزمنية',
        'احترام تفضيل تقليل الحركة (Reduced Motion)',
      ],
      outcomes: [
        'تمييز المؤثرات الحركية والوميض الذي قد يسبّب إجهاداً بصرياً أو نوبات صحية.',
        'التأكد من وجود أدوات إيقاف للمحتوى المتجدد تلقائياً وخيارات تمديد الوقت.',
        'بناء حركات تفاعلية هادئة تحترم إعدادات تقليل الحركة في نظام المستخدم.',
      ],
    },
    {
      id: 'layout-structure',
      ar: 'التخطيط والبنية',
      en: 'Layout & Structure',
      count: 3,
      duration: 'دقيقتان',
      desc: 'التسلسل المنطقي للمحتوى وإعادة التدفق ودعم اتجاهات الشاشة.',
      definition:
        'يركّز هذا المحور على متانة البنية التخطيطية للصفحة بحيث تتكيّف بسلاسة مع مختلف المقاسات والاتجاهات وتحافظ على ترتيب قراءة منطقي بصرياً وبرمجياً.',
      focusAreas: [
        'إعادة التدفق دون تمرير أفقي (Reflow)',
        'دعم الاتجاه الطولي والعرضي (Orientation)',
        'التسلسل المنطقي للمحتوى (Meaningful Sequence)',
      ],
      outcomes: [
        'اكتشاف الصفحات التي تجبر المستخدم على التمرير الأفقي عند التكبير أو على الجوال.',
        'تجنّب قفل الشاشة على اتجاه واحد يعيق مستخدمي الحوامل المثبّتة.',
        'ضمان تطابق ترتيب القراءة في قارئ الشاشة مع التسلسل البصري الصحيح.',
      ],
    },
    {
      id: 'media-images',
      ar: 'الوسائط والصور',
      en: 'Media & Images',
      count: 3,
      duration: 'دقيقتان',
      desc: 'النصوص البديلة للصور والترجمة النصية والتحكم بالصوت.',
      definition:
        'يتناول هذا المحور إتاحة الصور والفيديوهات والمقاطع الصوتية عبر بدائل نصية دقيقة وترجمة واضحة وتحكّم مباشر بالصوت التلقائي.',
      focusAreas: [
        'النصوص البديلة للمحتوى غير النصي (Alt Text)',
        'الترجمة النصية المتزامنة للفيديو (Captions)',
        'التحكّم بالصوت التلقائي (Audio Control)',
      ],
      outcomes: [
        'التمييز بين الصور المعلوماتية التي تحتاج نصاً بديلاً والزخرفية التي تُخفى عن قارئ الشاشة.',
        'اكتشاف الفيديوهات المفتقرة للترجمة النصية التي تحرم ضعاف السمع من المحتوى.',
        'التأكد من إمكانية إيقاف أو خفض أي صوت يعمل تلقائياً دون التشويش على قارئ الشاشة.',
      ],
    },
    {
      id: 'input-gestures',
      ar: 'الإدخال والإيماءات',
      en: 'Input & Gestures',
      count: 3,
      duration: 'دقيقتان',
      desc: 'بدائل بسيطة لإيماءات السحب والحركة دون تعقيد.',
      definition:
        'يركّز هذا المحور على تمكين المستخدمين الذين يواجهون صعوبة في الإيماءات المعقّدة أو السحب المستمر أو تحريك الجهاز من تنفيذ كل المهام بنقرة بسيطة.',
      focusAreas: [
        'بدائل إيماءات المؤشر متعددة الأصابع',
        'بدائل حركات السحب والإفلات (Dragging)',
        'بدائل التفعيل بهزّ أو إمالة الجهاز (Motion Actuation)',
      ],
      outcomes: [
        'رصد التفاعلات التي تعتمد حصراً على السحب أو التكبير بإصبعين دون أزرار بديلة.',
        'توفير أزرار نقرة واحدة للتحريك أو الترتيب أو التكبير لسهولة الاستخدام الحركي.',
        'تجنّب تفعيل إجراءات غير مقصودة بسبب حركة الجهاز مع إتاحة تعطيلها.',
      ],
    },
    {
      id: 'touch-targets',
      ar: 'اللمس وأحجام الأهداف',
      en: 'Touch & Targets',
      count: 2,
      duration: 'دقيقتان',
      desc: 'أحجام الأزرار ومساحات اللمس الكافية لتجنب النقرات الخاطئة.',
      definition:
        'يهدف هذا المحور إلى جعل الأزرار والروابط سهلة النقر واللمس بدقة لذوي الصعوبات الحركية ومستخدمي الهواتف في الحركة، عبر مقاسات ومسافات مريحة.',
      focusAreas: [
        'الحد الأدنى لحجم الهدف (WCAG 2.2 AA — 24×24px)',
        'الحجم المعزّز المريح للّمس (AAA — 44×44px)',
        'المسافات الكافية بين الأزرار المتجاورة',
      ],
      outcomes: [
        'تمييز الأزرار الصغيرة والمتلاصقة التي تسبّب نقرات خاطئة متكررة.',
        'تطبيق الحد الأدنى المعتمد في WCAG 2.2 والوصول للمقاس المريح 44×44 بكسل.',
      ],
    },
  ];

  /* بيانات افتراضية للوحة الصدارة (تُستخدم كاحتياطي عند التشغيل بدون خادم) */
  const DEFAULT_LEADERBOARD = [
    { name: 'سارة العتيبي', topicId: 'color-appearance', topic: 'الألوان والمظهر', accuracy: 100, errors: 0, durationSeconds: 48, score: 440, period: 'week' },
    { name: 'سارة العتيبي', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 100, errors: 0, durationSeconds: 92, score: 1040, period: 'week' },
    { name: 'سارة العتيبي', topicId: 'interactive-focus', topic: 'التركيز التفاعلي', accuracy: 86, errors: 1, durationSeconds: 84, score: 660, period: 'week' },
    { name: 'سارة العتيبي', topicId: 'touch-targets', topic: 'اللمس وأحجام الأهداف', accuracy: 100, errors: 0, durationSeconds: 56, score: 220, period: 'week' },

    { name: 'خالد الحربي', topicId: 'interactive-focus', topic: 'التركيز التفاعلي', accuracy: 100, errors: 0, durationSeconds: 62, score: 800, period: 'week' },
    { name: 'خالد الحربي', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 88, score: 900, period: 'week' },
    { name: 'خالد الحربي', topicId: 'forms-friction', topic: 'النماذج وتقليل العوائق', accuracy: 100, errors: 0, durationSeconds: 72, score: 680, period: 'week' },

    { name: 'نورة القحطاني', topicId: 'forms-friction', topic: 'النماذج وتقليل العوائق', accuracy: 100, errors: 0, durationSeconds: 70, score: 680, period: 'all' },
    { name: 'نورة القحطاني', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 104, score: 880, period: 'all' },
    { name: 'نورة القحطاني', topicId: 'typography-reading', topic: 'الطباعة والقراءة', accuracy: 100, errors: 0, durationSeconds: 82, score: 440, period: 'all' },

    { name: 'عبدالله الشمري', topicId: 'navigation-predictability', topic: 'التنقل وقابلية التنبؤ', accuracy: 89, errors: 1, durationSeconds: 78, score: 900, period: 'week' },
    { name: 'عبدالله الشمري', topicId: 'layout-structure', topic: 'التخطيط والبنية', accuracy: 100, errors: 0, durationSeconds: 54, score: 340, period: 'week' },

    { name: 'ريم الدوسري', topicId: 'typography-reading', topic: 'الطباعة والقراءة', accuracy: 100, errors: 0, durationSeconds: 68, score: 440, period: 'all' },
    { name: 'ريم الدوسري', topicId: 'media-images', topic: 'الوسائط والصور', accuracy: 67, errors: 1, durationSeconds: 96, score: 200, period: 'all' },

    { name: 'فيصل الزهراني', topicId: 'layout-structure', topic: 'التخطيط والبنية', accuracy: 100, errors: 0, durationSeconds: 58, score: 340, period: 'week' },
  ];

  const STORAGE_KEY = 'accessibility_game_leaderboard_v2';
  const PROGRESS_STORAGE_KEY = 'accessibility_game_progress_v1';
  const PLAYER_NAME_STORAGE_KEY = 'accessibility_game_player_name_v1';
  const REPLAY_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; /* شهر واحد (30 يوماً) */
  const PUBLIC_GAME_URL = 'https://accessibility-game.up.railway.app';
  const VIEW_LABELS = {
    home: 'الصفحة الرئيسية',
    challenges: 'صفحة التحديات',
    play: 'ساحة التحدّي',
    blog: 'المقالات',
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

  const playTopicMeta = document.getElementById('play-topic-meta');
  const playHeading = document.getElementById('play-heading');
  const playSubtitle = document.getElementById('play-subtitle');
  const playShellCard = document.getElementById('play-shell-card');

  const dialogBackdrop = document.getElementById('start-dialog-backdrop');
  const dialogBox = document.getElementById('dialog-box');
  const dialogMeta = document.getElementById('dialog-meta');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogDesc = document.getElementById('dialog-desc');
  const dialogRichBody = document.getElementById('dialog-rich-body');
  const dialogStartTopicBtn = document.getElementById('dialog-start-topic-btn');
  const dialogStartTopicLabel = document.getElementById('dialog-start-topic-label');
  const dialogCloseBtn = document.getElementById('dialog-close-btn');
  const dialogConfirmBtn = document.getElementById('dialog-confirm-btn');
  const dialogLeaderboardBtn = document.getElementById('dialog-leaderboard-btn');
  const dialogExternalLink = document.getElementById('dialog-external-link');
  const dialogExternalLinkText = document.getElementById('dialog-external-link-text');

  let blogArticles = FALLBACK_BLOG_ARTICLES;
  let activeFilter = 'all';
  let activeBlogFilter = 'all';
  let activeTopicInDialog = null;
  let lastFocusedBeforeDialog = null;
  let lastFocusedArticleTrigger = null;
  let activeCooldownTimerId = null;

  function clearCooldownTimer() {
    if (activeCooldownTimerId !== null) {
      window.clearInterval(activeCooldownTimerId);
      activeCooldownTimerId = null;
    }
  }

  function getSavedPlayerName() {
    try {
      return localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  function savePlayerName(name) {
    try {
      localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name);
    } catch {
      /* تجاهل أخطاء التخزين */
    }
  }

  function loadTopicProgress() {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      /* تجاهل أخطاء التخزين في الوضع الخاص */
    }
    return {};
  }

  function saveTopicProgress(topicId, data) {
    const progress = loadTopicProgress();
    progress[topicId] = {
      started: true,
      currentIndex: 0,
      completed: 0,
      correctCount: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      elapsedMs: 0,
      answers: [],
      completedAt: null,
      finished: false,
      savedToLeaderboard: false,
      ...(progress[topicId] || {}),
      ...data,
    };
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* تجاهل أخطاء التخزين في الوضع الخاص */
    }
    return progress[topicId];
  }

  function markTopicStarted(topicId) {
    const existing = loadTopicProgress()[topicId];
    if (existing) return existing;
    return saveTopicProgress(topicId, { started: true, completed: 0, elapsedMs: 0, answers: [] });
  }

  function resetTopicProgress(topicId) {
    clearCooldownTimer();
    return saveTopicProgress(topicId, {
      started: true,
      currentIndex: 0,
      completed: 0,
      correctCount: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      elapsedMs: 0,
      answers: [],
      completedAt: null,
      finished: false,
      savedToLeaderboard: false,
      savedPlayerName: '',
    });
  }

  function formatDurationAr(totalSeconds) {
    const secs = Math.max(1, Math.round(Number(totalSeconds) || 0));
    const minutes = Math.floor(secs / 60);
    const rem = secs % 60;
    if (minutes === 0) return `${rem} ث`;
    if (rem === 0) return `${minutes} د`;
    return `${minutes} د ${rem} ث`;
  }

  function formatTopicsCompletedAr(count) {
    if (count === 1) return 'محور واحد';
    if (count === 2) return 'محوران';
    return `${count} محاور`;
  }

  function formatErrorsAr(errors) {
    const count = Math.max(0, Number(errors) || 0);
    if (count === 0) return 'بلا أخطاء';
    if (count === 1) return 'خطأ واحد';
    if (count === 2) return 'خطآن';
    return `${count} أخطاء`;
  }

  async function submitScoreToLeaderboard({
    name,
    topicId,
    topic,
    accuracy,
    errors,
    durationSeconds,
    score,
  }) {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          topicId,
          topic,
          accuracy,
          errors,
          durationSeconds,
          score,
        }),
      });
      if (response.ok) {
        const saved = await response.json();
        await renderLeaderboard(activeFilter);
        return { ok: true, mode: 'server', entry: saved };
      }
      const errData = await response.json().catch(() => ({}));
      if (response.status >= 400 && response.status < 500) {
        return { ok: false, error: errData.error || 'تعذّر حفظ النتيجة، تحقق من البيانات.' };
      }
    } catch {
      /* حفظ احتياطي محلي عند التشغيل بدون خادم */
    }

    const localEntries = getLocalLeaderboardData().slice();
    const newEntry = {
      name,
      topicId,
      topic,
      accuracy,
      errors,
      durationSeconds,
      score,
      period: 'week',
    };
    localEntries.push(newEntry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntries));
    } catch {
      /* تجاهل أخطاء التخزين */
    }
    await renderLeaderboard(activeFilter);
    return { ok: true, mode: 'local', entry: newEntry };
  }

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

  /* التنقل بين الصفحات (الرئيسية / التحديات / ساحة اللعب / المقالات / لوحة الصدارة) */
  function setActiveView(viewName, { updateHash = true, moveFocus = false, articleSlug = null, topicId = null } = {}) {
    clearCooldownTimer();
    const validViews = ['home', 'challenges', 'play', 'blog', 'leaderboard'];
    const targetView = validViews.includes(viewName) ? viewName : 'home';

    viewSections.forEach((section) => {
      const isMatch = section.dataset.view === targetView;
      section.hidden = !isMatch;
    });

    viewLinks.forEach((link) => {
      const isNavLink = link.classList.contains('nav-link');
      const navTarget = targetView === 'play' ? 'challenges' : targetView;
      const isMatch = link.dataset.viewLink === navTarget;
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

    if (targetView === 'play') {
      const topic = WCAG_TOPICS.find((t) => t.id === topicId) || WCAG_TOPICS[0];
      renderPlayArena(topic);
      topicId = topic.id;
    }

    if (updateHash) {
      let nextHash = `#${targetView}`;
      if (targetView === 'blog' && articleSlug) nextHash = `#blog/${articleSlug}`;
      if (targetView === 'play' && topicId) nextHash = `#play/${topicId}`;
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
    } else if (hash.startsWith('play/')) {
      const topicId = hash.slice('play/'.length);
      const exists = WCAG_TOPICS.some((t) => t.id === topicId);
      if (exists) {
        setActiveView('play', { updateHash: false, topicId });
      } else {
        setActiveView('challenges', { updateHash: false });
      }
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

  /* قراءة وعرض لوحة الصدارة (من الخادم /api/leaderboard مع احتياطي محلي) */
  function getLocalLeaderboardData() {
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

  function isBetterLocalAttempt(candidate, currentBest) {
    if (!currentBest) return true;
    const candErr = Number(candidate.errors ?? 0);
    const bestErr = Number(currentBest.errors ?? 0);
    if (candErr !== bestErr) return candErr < bestErr;
    const candDur = Number(candidate.durationSeconds ?? 90);
    const bestDur = Number(currentBest.durationSeconds ?? 90);
    if (candDur !== bestDur) return candDur < bestDur;
    return Number(candidate.accuracy ?? 0) > Number(currentBest.accuracy ?? 0);
  }

  function aggregateLocalLeaderboard(attempts, filter = 'all') {
    const playersMap = new Map();

    attempts.forEach((row) => {
      const playerKey = String(row.name || '').trim().toLowerCase();
      if (!playerKey) return;
      if (!playersMap.has(playerKey)) {
        playersMap.set(playerKey, {
          name: String(row.name).trim(),
          topicsMap: new Map(),
          isRecentWeek: false,
        });
      }
      const player = playersMap.get(playerKey);
      if (row.period === 'week') player.isRecentWeek = true;
      const topicKey = (row.topicId && row.topicId.trim()) || String(row.topic || '').trim();
      const prev = player.topicsMap.get(topicKey);
      if (isBetterLocalAttempt(row, prev)) {
        player.topicsMap.set(topicKey, row);
      }
    });

    const aggregated = [];
    playersMap.forEach((player) => {
      const bestAttempts = Array.from(player.topicsMap.values());
      if (bestAttempts.length === 0) return;

      const topicsCompleted = bestAttempts.length;
      const avgDurationSeconds = Math.round(
        bestAttempts.reduce((sum, a) => sum + Number(a.durationSeconds ?? 90), 0) /
          topicsCompleted
      );
      const avgAccuracy = Math.round(
        bestAttempts.reduce((sum, a) => sum + Number(a.accuracy ?? 0), 0) /
          topicsCompleted
      );

      let standout = bestAttempts[0];
      bestAttempts.forEach((attempt) => {
        if (isBetterLocalAttempt(attempt, standout)) {
          standout = attempt;
        }
      });

      aggregated.push({
        name: player.name,
        topicsCompleted,
        avgDurationSeconds,
        avgAccuracy,
        bestTopic: standout.topic,
        bestTopicErrors: Number(standout.errors ?? 0),
        bestTopicDurationSeconds: Number(standout.durationSeconds ?? 90),
        period: player.isRecentWeek ? 'week' : 'all',
      });
    });

    aggregated.sort((a, b) => {
      if (b.topicsCompleted !== a.topicsCompleted) {
        return b.topicsCompleted - a.topicsCompleted;
      }
      if (a.avgDurationSeconds !== b.avgDurationSeconds) {
        return a.avgDurationSeconds - b.avgDurationSeconds;
      }
      return b.avgAccuracy - a.avgAccuracy;
    });

    const filtered = aggregated.filter((entry) => {
      if (filter === 'week') return entry.period === 'week';
      if (filter === 'perfect') return entry.avgAccuracy >= 95;
      return true;
    });

    return { entries: filtered, total: aggregated.length };
  }

  function paintLeaderboardRows(entries, totalCount) {
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = '';

    entries.forEach((entry, index) => {
      const rank = index + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const topicsDone = Number(entry.topicsCompleted || 1);
      const avgTime = formatDurationAr(entry.avgDurationSeconds || 60);
      const bestTopicName = entry.bestTopic || entry.topic || '—';
      const bestMeta = `${formatErrorsAr(entry.bestTopicErrors)} • ${formatDurationAr(
        entry.bestTopicDurationSeconds || entry.avgDurationSeconds || 60
      )}`;
      const accuracyVal = Number(entry.avgAccuracy ?? entry.accuracy ?? 0);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="rank-badge ${rankClass}">${rank}</span></td>
        <td class="player-name">${escapeHtml(entry.name)}</td>
        <td><span class="topics-done-pill">${escapeHtml(formatTopicsCompletedAr(topicsDone))} من 10</span></td>
        <td class="time-cell">${escapeHtml(avgTime)}</td>
        <td>
          <div class="best-topic-cell">
            <span class="best-topic-name">${escapeHtml(bestTopicName)}</span>
            <span class="best-topic-meta">${escapeHtml(bestMeta)}</span>
          </div>
        </td>
        <td><span class="accuracy-pill">${accuracyVal}%</span></td>
      `;
      leaderboardBody.appendChild(tr);
    });

    if (leaderboardCount) {
      leaderboardCount.textContent = `عرض ${entries.length} من ${totalCount} لاعبين`;
    }
  }

  async function renderLeaderboard(filter = 'all') {
    if (!leaderboardBody) return;
    activeFilter = filter;

    try {
      const response = await fetch(`/api/leaderboard?filter=${encodeURIComponent(filter)}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.entries)) {
          paintLeaderboardRows(data.entries, Number(data.total ?? data.entries.length));
          return;
        }
      }
    } catch {
      /* استخدام البيانات المحلية عند التشغيل الساكن بدون خادم */
    }

    const localResult = aggregateLocalLeaderboard(getLocalLeaderboardData(), filter);
    paintLeaderboardRows(localResult.entries, localResult.total);
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
      desc: 'يسعدني استقبال ملاحظاتكم ومقترحاتكم لتطوير التحديات وتحسين تجربة الوصولية الرقمية في اللعبة عبر حسابي على LinkedIn.',
      actionLink: {
        label: 'التواصل عبر LinkedIn',
        url: 'https://www.linkedin.com/in/maymunah-aldeghaither-1a6700201',
      },
    },
  };

  /* النافذة الحوارية المتوافقة مع الوصولية (Focus Trap + Escape) */
  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hidden && el.offsetParent !== null);
  }

  function openDialog({
    title,
    desc,
    metaHtml = '',
    richHtml = '',
    topicForStart = null,
    showLeaderboardAction = false,
    actionLink = null,
  } = {}) {
    if (!dialogBackdrop) return;
    lastFocusedBeforeDialog = document.activeElement;
    activeTopicInDialog = topicForStart;

    if (dialogBox) {
      dialogBox.classList.toggle('is-topic-brief', Boolean(topicForStart));
      dialogBox.scrollTop = 0;
    }

    if (dialogMeta) {
      if (metaHtml) {
        dialogMeta.innerHTML = metaHtml;
        dialogMeta.hidden = false;
      } else {
        dialogMeta.innerHTML = '';
        dialogMeta.hidden = true;
      }
    }

    if (dialogTitle && title) {
      dialogTitle.textContent = title;
    }
    if (dialogDesc && desc) {
      dialogDesc.textContent = desc;
    }

    if (dialogRichBody) {
      if (richHtml) {
        dialogRichBody.innerHTML = richHtml;
        dialogRichBody.hidden = false;
      } else {
        dialogRichBody.innerHTML = '';
        dialogRichBody.hidden = true;
      }
    }

    if (dialogLeaderboardBtn) {
      dialogLeaderboardBtn.hidden = !showLeaderboardAction;
    }

    const hasStartTopic = Boolean(topicForStart);
    const hasExternalLink = Boolean(actionLink && isSafeHttpUrl(actionLink.url));

    if (dialogStartTopicBtn) {
      if (hasStartTopic) {
        const progress = loadTopicProgress()[topicForStart.id];
        if (dialogStartTopicLabel) {
          if (progress?.finished) {
            dialogStartTopicLabel.textContent = 'عرض نتيجتي';
          } else if (progress?.started) {
            dialogStartTopicLabel.textContent = 'استمرار';
          } else {
            dialogStartTopicLabel.textContent = 'بدء التحدّي';
          }
        }
        dialogStartTopicBtn.hidden = false;
      } else {
        dialogStartTopicBtn.hidden = true;
      }
    }

    if (dialogExternalLink) {
      if (hasExternalLink) {
        dialogExternalLink.href = actionLink.url;
        if (dialogExternalLinkText) {
          dialogExternalLinkText.textContent = actionLink.label;
        }
        dialogExternalLink.hidden = false;
      } else {
        dialogExternalLink.hidden = true;
        dialogExternalLink.removeAttribute('href');
      }
    }

    if (hasStartTopic || hasExternalLink) {
      dialogConfirmBtn.classList.remove('btn-primary');
      dialogConfirmBtn.classList.add('btn-secondary');
      dialogConfirmBtn.textContent = 'إغلاق';
    } else {
      dialogConfirmBtn.classList.add('btn-primary');
      dialogConfirmBtn.classList.remove('btn-secondary');
      dialogConfirmBtn.textContent = 'حسناً، فهمت';
    }

    dialogBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';

    if (dialogStartTopicBtn && !dialogStartTopicBtn.hidden) {
      dialogStartTopicBtn.focus();
    } else if (dialogExternalLink && !dialogExternalLink.hidden) {
      dialogExternalLink.focus();
    } else {
      dialogConfirmBtn.focus();
    }
  }

  function openTopicDialog(topic) {
    const countLabel = formatChallengeCount(topic.count);
    const progress = loadTopicProgress()[topic.id];
    const maxPoints = topic.count * 100;

    let statusPill = '';
    if (progress?.finished) {
      statusPill = `<span class="dialog-meta-status">مكتمل ✓ (${progress.correctCount || 0}/${topic.count})</span>`;
    } else if (progress?.started) {
      const done = progress.completed || 0;
      statusPill = `<span class="dialog-meta-status">${
        done > 0 ? `قيد التقدّم (${done} من ${topic.count})` : 'قيد التقدّم'
      }</span>`;
    }

    const metaHtml = `
      <span class="dialog-meta-pill">${escapeHtml(countLabel)}</span>
      ${statusPill}
      <span class="dialog-meta-en">${escapeHtml(topic.en)}</span>
    `;

    const focusItemsHtml = topic.focusAreas
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');

    const outcomesHtml = topic.outcomes
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');

    const richHtml = `
      <dl class="brief-stats" aria-label="ملخص المحور">
        <div class="brief-stat">
          <dt>عدد التحديات</dt>
          <dd>${escapeHtml(countLabel)}</dd>
        </div>
        <div class="brief-stat">
          <dt>الوقت التقريبي</dt>
          <dd>${escapeHtml(topic.duration)}</dd>
        </div>
        <div class="brief-stat">
          <dt>النقاط المتاحة</dt>
          <dd>حتى ${maxPoints.toLocaleString('ar-SA')}+ نقطة</dd>
        </div>
      </dl>

      <div class="brief-section">
        <h3 class="brief-heading">على ماذا يركّز هذا المحور؟</h3>
        <ul class="brief-focus-list">${focusItemsHtml}</ul>
      </div>

      <div class="brief-section">
        <h3 class="brief-heading">المخرجات وما ستتعلّمه</h3>
        <ul class="brief-outcomes-list">${outcomesHtml}</ul>
      </div>
    `;

    openDialog({
      title: `محور ${topic.ar}`,
      desc: topic.definition,
      metaHtml,
      richHtml,
      topicForStart: topic,
      showLeaderboardAction: false,
    });
  }

  function getPerformanceTitle(accuracy) {
    if (accuracy >= 95) return 'خبير وصولية متميّز';
    if (accuracy >= 80) return 'مصمم واعٍ بالوصولية';
    if (accuracy >= 60) return 'متعلّم واعد في الوصولية';
    return 'بداية رائعة نحو التصميم الشامل';
  }

  /* عرض جولة تحدّي تفاعلية داخل ساحة المحور */
  function renderChallengeRound(topic, challenges, state) {
    const index = Math.min(state.currentIndex || 0, challenges.length - 1);
    const challenge = challenges[index];
    const percent = Math.round((index / challenges.length) * 100);
    const encodedImage = encodeURI(challenge.image);

    /* ترتيب عشوائي للبطاقتين (أ / ب) حتى لا يكون التصميم الصحيح في نفس الجهة دائماً */
    const goodFirst = Math.random() < 0.5;
    const options = goodFirst
      ? [
          { letter: 'أ', isGood: true, cropClass: 'crop-top-left', alt: challenge.goodAlt },
          { letter: 'ب', isGood: false, cropClass: 'crop-top-right', alt: challenge.badAlt },
        ]
      : [
          { letter: 'أ', isGood: false, cropClass: 'crop-top-right', alt: challenge.badAlt },
          { letter: 'ب', isGood: true, cropClass: 'crop-top-left', alt: challenge.goodAlt },
        ];

    playShellCard.innerHTML = `
      <div class="play-hud">
        <div class="play-hud-pills">
          <span class="hud-pill hud-pill-step">تحدّي ${index + 1} من ${challenges.length}</span>
          <span class="hud-pill hud-pill-score">النقاط: ${(state.score || 0).toLocaleString('ar-SA')}</span>
          ${
            (state.streak || 0) >= 2
              ? `<span class="hud-pill hud-pill-streak">سلسلة ${state.streak} إجابات متتالية</span>`
              : ''
          }
        </div>
        <span class="topic-count">${percent}%</span>
      </div>

      <div
        class="play-progress-bar"
        role="progressbar"
        aria-valuenow="${percent}"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="نسبة التقدّم في محور ${escapeHtml(topic.ar)}"
      >
        <div class="play-progress-fill" style="width: ${percent}%"></div>
      </div>

      <div class="challenge-question-box">
        <h2 class="challenge-prompt">${escapeHtml(challenge.question)}</h2>
        <p class="challenge-hint">اختر التصميم المتوافق مع معايير الوصولية الرقمية WCAG 2.2:</p>
      </div>

      <div class="choice-grid" role="group" aria-label="خيارات المقارنة البصرية">
        ${options
          .map(
            (opt, optIdx) => `
              <button
                type="button"
                class="choice-card"
                data-option-index="${optIdx}"
                data-is-good="${opt.isGood}"
                aria-label="التصميم ${opt.letter}: ${escapeHtml(opt.alt)}"
              >
                <div class="choice-card-top">
                  <span class="choice-label">
                    <span class="choice-letter" aria-hidden="true">${opt.letter}</span>
                    <span>التصميم ${opt.letter}</span>
                  </span>
                  <span class="choice-verdict" hidden></span>
                </div>
                <div class="choice-crop-frame" aria-hidden="true">
                  <img
                    src="${encodedImage}"
                    alt=""
                    class="choice-crop-img ${opt.cropClass}"
                    loading="eager"
                  >
                </div>
              </button>
            `
          )
          .join('')}
      </div>

      <div id="challenge-feedback" class="feedback-panel" hidden aria-live="polite"></div>
    `;

    const choiceButtons = playShellCard.querySelectorAll('.choice-card');
    const feedbackEl = playShellCard.querySelector('#challenge-feedback');
    const roundStartedAt = Date.now();

    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const pickedGood = btn.dataset.isGood === 'true';
        const roundElapsedMs = Math.max(500, Math.min(Date.now() - roundStartedAt, 300_000));
        const nextElapsedMs = (state.elapsedMs || 0) + roundElapsedMs;
        const nextStreak = pickedGood ? (state.streak || 0) + 1 : 0;
        const streakBonus = pickedGood && nextStreak >= 2 ? 20 : 0;
        const earnedPoints = pickedGood ? 100 + streakBonus : 0;
        const nextScore = (state.score || 0) + earnedPoints;
        const nextCorrect = (state.correctCount || 0) + (pickedGood ? 1 : 0);
        const nextBestStreak = Math.max(state.bestStreak || 0, nextStreak);
        const nextIndex = index + 1;
        const isLast = nextIndex >= challenges.length;
        const nextAnswers = Array.isArray(state.answers) ? state.answers.slice() : [];
        nextAnswers.push({
          challengeId: challenge.id,
          pickedGood,
          earnedPoints,
        });

        const updatedState = saveTopicProgress(topic.id, {
          currentIndex: nextIndex,
          completed: nextIndex,
          correctCount: nextCorrect,
          score: nextScore,
          streak: nextStreak,
          bestStreak: nextBestStreak,
          elapsedMs: nextElapsedMs,
          answers: nextAnswers,
          finished: isLast,
          completedAt: isLast ? Date.now() : state.completedAt || null,
        });

        /* كشف الحالة البصرية والدلالية لكل بطاقة بدون الاعتماد على اللون وحده */
        choiceButtons.forEach((card) => {
          const isCardGood = card.dataset.isGood === 'true';
          const verdict = card.querySelector('.choice-verdict');
          card.disabled = true;

          if (isCardGood) {
            card.classList.add('is-correct-reveal');
            if (verdict) {
              verdict.textContent = '✓ التصميم المتوافق';
              verdict.classList.add('is-good');
              verdict.hidden = false;
            }
          } else if (card === btn) {
            card.classList.add('is-wrong-picked');
            if (verdict) {
              verdict.textContent = '✕ يحتوي على عائق وصولية';
              verdict.classList.add('is-bad');
              verdict.hidden = false;
            }
          } else {
            card.classList.add('is-muted-after');
            if (verdict) {
              verdict.textContent = '✕ يحتوي على عائق وصولية';
              verdict.classList.add('is-bad');
              verdict.hidden = false;
            }
          }
        });

        /* تحديث شريط النقاط والتقدّم فوراً */
        const scorePill = playShellCard.querySelector('.hud-pill-score');
        if (scorePill) {
          scorePill.textContent = `النقاط: ${updatedState.score.toLocaleString('ar-SA')}`;
        }
        const newPercent = Math.round((nextIndex / challenges.length) * 100);
        const progressBar = playShellCard.querySelector('.play-progress-bar');
        const progressFill = playShellCard.querySelector('.play-progress-fill');
        const percentText = playShellCard.querySelector('.topic-count');
        if (progressBar) progressBar.setAttribute('aria-valuenow', String(newPercent));
        if (progressFill) progressFill.style.width = `${newPercent}%`;
        if (percentText) percentText.textContent = `${newPercent}%`;

        /* عرض التغذية الراجعة التعليمية */
        feedbackEl.className = `feedback-panel ${pickedGood ? 'is-correct' : 'is-incorrect'}`;
        feedbackEl.innerHTML = `
          <div class="feedback-head">
            <h3 class="feedback-status">
              ${
                pickedGood
                  ? `إجابة صحيحة! أحسنت (+${earnedPoints} نقطة${streakBonus ? ' مع مكافأة السلسلة' : ''})`
                  : 'إجابة غير موفّقة — التصميم الآخر هو المتوافق مع الوصولية'
              }
            </h3>
            <span class="feedback-wcag-badge">
              WCAG ${escapeHtml(challenge.wcagCode)} (${escapeHtml(challenge.wcagLevel)}) • ${escapeHtml(challenge.criterionAr)}
            </span>
          </div>

          <div class="feedback-details">
            <div class="feedback-box">
              <strong>لماذا ينجح التصميم المتوافق؟</strong>
              <p>${escapeHtml(challenge.whyGood)}</p>
            </div>
            <div class="feedback-box">
              <strong>كيف نصلح العائق في التصميم الآخر؟</strong>
              <p>${escapeHtml(challenge.howToFix)}</p>
            </div>
          </div>

          <div class="feedback-actions">
            <span class="blog-read-time">${escapeHtml(challenge.criterionEn)}</span>
            <button type="button" class="btn btn-primary" id="next-challenge-btn">
              <span>${isLast ? 'عرض النتيجة النهائية' : 'التحدّي التالي'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        `;
        feedbackEl.hidden = false;

        announce(
          pickedGood
            ? `إجابة صحيحة! حصلت على ${earnedPoints} نقطة. معيار ${challenge.criterionAr}.`
            : `إجابة غير صحيحة. التصميم الآخر هو المتوافق وفق معيار ${challenge.criterionAr}.`
        );

        const nextBtn = feedbackEl.querySelector('#next-challenge-btn');
        if (nextBtn) {
          nextBtn.focus();
          nextBtn.addEventListener('click', () => {
            if (isLast) {
              renderTopicSummary(topic, challenges, updatedState);
            } else {
              renderChallengeRound(topic, challenges, updatedState);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          });
        }
      });
    });
  }

  function getCountdownParts(remainingMs) {
    const clamped = Math.max(0, remainingMs);
    const totalSeconds = Math.floor(clamped / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }

  function buildLinkedInShareText({ topic, correct, total, accuracy, errors, durationSeconds, rankTitle }) {
    return [
      `أتممت تحدّي «محور ${topic.ar}» في لعبة تحدّي الوصولية الرقمية!`,
      `• النتيجة: ${correct} من ${total} (${formatErrorsAr(errors)} • دقة ${accuracy}%)`,
      `• الوقت المستغرق: ${formatDurationAr(durationSeconds)}`,
      `• التقييم: ${rankTitle}`,
      '',
      `جرّبوا اختبار مهاراتكم في معايير WCAG 2.2 هنا:`,
      PUBLIC_GAME_URL,
      '',
      '#الوصولية_الرقمية #WCAG #عام_الذكاء_الاصطناعي #صنع_في_السعودية',
    ].join('\n');
  }

  /* شاشة إتمام المحور وحفظ النتيجة والعدّاد التنازلي ومراجعة الأجوبة ومشاركة LinkedIn */
  function renderTopicSummary(topic, challenges, rawState) {
    clearCooldownTimer();

    /* ضمان وجود وقت الإتمام لبدء عدّاد الشهر (30 يوماً) */
    const state = rawState.completedAt
      ? rawState
      : saveTopicProgress(topic.id, { completedAt: Date.now() });

    const total = challenges.length;
    const correct = state.correctCount || 0;
    const errors = Math.max(0, total - correct);
    const accuracy = Math.round((correct / total) * 100);
    const score = state.score || 0;
    const durationSeconds = Math.max(1, Math.round((state.elapsedMs || total * 12_000) / 1000));
    const rankTitle = getPerformanceTitle(accuracy);
    const rememberedName = state.savedPlayerName || getSavedPlayerName();

    const unlockAtMs = Number(state.completedAt) + REPLAY_COOLDOWN_MS;
    const initialRemainingMs = Math.max(0, unlockAtMs - Date.now());
    const isCooldownActive = initialRemainingMs > 0;
    const unlockDateFormatted = new Date(unlockAtMs).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const sharePageUrl = `${PUBLIC_GAME_URL}/share?topic=${encodeURIComponent(
      topic.id
    )}&correct=${correct}&total=${total}&acc=${accuracy}&sec=${durationSeconds}`;
    const shareText = buildLinkedInShareText({
      topic,
      correct,
      total,
      accuracy,
      errors,
      durationSeconds,
      rankTitle,
    });
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      sharePageUrl
    )}`;

    const leaderboardSectionHtml = state.savedToLeaderboard
      ? `
        <div class="play-ready-banner" role="status">
          <strong>تم حفظ نتيجتك في لوحة الصدارة ✓</strong>
          <p>
            ${
              rememberedName
                ? `تم تسجيل نتيجتك في هذا المحور باسم «${escapeHtml(rememberedName)}» مسبقاً — لا حاجة لإدخال اسمك مرة أخرى.`
                : 'تم تسجيل نتيجتك في هذا المحور مسبقاً — لا حاجة لإدخال اسمك مرة أخرى.'
            }
          </p>
        </div>
      `
      : `
        <form class="save-score-form" id="save-score-form">
          <label for="player-nickname" class="save-score-label">
            احفظ نتيجتك في لوحة الصدارة (اختياري):
          </label>
          <div class="save-score-row">
            <input
              type="text"
              id="player-nickname"
              name="nickname"
              class="save-score-input"
              placeholder="اكتب اسمك المستعار هنا..."
              value="${escapeHtml(rememberedName)}"
              minlength="2"
              maxlength="30"
              required
              autocomplete="nickname"
            >
            <button
              type="submit"
              class="btn btn-primary"
              id="save-score-submit"
            >
              حفظ النتيجة
            </button>
          </div>
          <p id="save-score-feedback" class="save-score-feedback" aria-live="polite"></p>
        </form>
      `;

    const initParts = getCountdownParts(initialRemainingMs);
    const cooldownCardHtml = isCooldownActive
      ? `
        <div class="cooldown-card" id="cooldown-card" aria-label="العدّاد التنازلي لإعادة اختبار المحور">
          <div class="cooldown-header">
            <h3 class="cooldown-title">يمكنك إعادة الإختبار بالمحور بعد :</h3>
            <p class="cooldown-note">متاح مجدداً بتاريخ ${escapeHtml(unlockDateFormatted)}</p>
          </div>
          <div class="countdown-grid" aria-hidden="true">
            <div class="countdown-unit">
              <span class="countdown-num" id="cd-days">${String(initParts.days).padStart(2, '0')}</span>
              <span class="countdown-label">يوم</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-num" id="cd-hours">${String(initParts.hours).padStart(2, '0')}</span>
              <span class="countdown-label">ساعة</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-num" id="cd-minutes">${String(initParts.minutes).padStart(2, '0')}</span>
              <span class="countdown-label">دقيقة</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-num" id="cd-seconds">${String(initParts.seconds).padStart(2, '0')}</span>
              <span class="countdown-label">ثانية</span>
            </div>
          </div>
          <p class="cooldown-note">يمكنك خلال هذه الفترة مراجعة جميع الأجوبة والشرح بالأسفل للاستفادة الكاملة.</p>
        </div>
      `
      : '';

    const answerMap = new Map(
      (Array.isArray(state.answers) ? state.answers : []).map((a) => [a.challengeId, a])
    );

    const reviewItemsHtml = challenges
      .map((ch, idx) => {
        const record = answerMap.get(ch.id);
        let statusBadge = '<span class="feedback-wcag-badge">مراجعة المعيار</span>';
        let itemStateClass = '';
        if (record) {
          if (record.pickedGood) {
            statusBadge = '<span class="choice-verdict is-good">✓ إجابتك كانت صحيحة</span>';
            itemStateClass = 'is-user-correct';
          } else {
            statusBadge = '<span class="choice-verdict is-bad">✕ أخطأت في هذا التحدّي</span>';
            itemStateClass = 'is-user-wrong';
          }
        }
        const encodedImg = encodeURI(ch.image);

        return `
          <article class="review-item ${itemStateClass}">
            <div class="review-item-head">
              <h3 class="review-item-title">${idx + 1}. ${escapeHtml(ch.criterionAr)} (WCAG ${escapeHtml(ch.wcagCode)} • ${escapeHtml(ch.wcagLevel)})</h3>
              ${statusBadge}
            </div>
            <p class="challenge-hint">${escapeHtml(ch.question)}</p>

            <div class="review-compare-grid">
              <div class="review-compare-card is-good-card">
                <span class="choice-verdict is-good">✓ التصميم المتوافق</span>
                <div class="choice-crop-frame">
                  <img src="${encodedImg}" alt="${escapeHtml(ch.goodAlt)}" class="choice-crop-img crop-top-left" loading="lazy">
                </div>
              </div>
              <div class="review-compare-card is-bad-card">
                <span class="choice-verdict is-bad">✕ يحتوي على عائق وصولية</span>
                <div class="choice-crop-frame">
                  <img src="${encodedImg}" alt="${escapeHtml(ch.badAlt)}" class="choice-crop-img crop-top-right" loading="lazy">
                </div>
              </div>
            </div>

            <div class="feedback-details">
              <div class="feedback-box">
                <strong>لماذا ينجح التصميم المتوافق؟</strong>
                <p>${escapeHtml(ch.whyGood)}</p>
              </div>
              <div class="feedback-box">
                <strong>كيف نصلح العائق في التصميم الآخر؟</strong>
                <p>${escapeHtml(ch.howToFix)}</p>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    playShellCard.innerHTML = `
      <div class="summary-panel">
        <div class="summary-hero">
          <span class="summary-rank-pill">${escapeHtml(rankTitle)}</span>
          <h2 class="summary-title">أتممت محور ${escapeHtml(topic.ar)}!</h2>
          <p class="summary-subtitle">
            أجبت بشكل صحيح على ${correct} من ${total} تحديات (${formatErrorsAr(errors)}) خلال ${formatDurationAr(durationSeconds)} بدقة ${accuracy}%.
          </p>
        </div>

        <dl class="brief-stats" aria-label="ملخص نتيجتك">
          <div class="brief-stat">
            <dt>الوقت المستغرق</dt>
            <dd>${escapeHtml(formatDurationAr(durationSeconds))}</dd>
          </div>
          <div class="brief-stat">
            <dt>الأخطاء والدقة</dt>
            <dd>${escapeHtml(formatErrorsAr(errors))} (${accuracy}%)</dd>
          </div>
          <div class="brief-stat">
            <dt>مجموع النقاط</dt>
            <dd>${score.toLocaleString('ar-SA')} نقطة</dd>
          </div>
        </dl>

        ${leaderboardSectionHtml}

        <div class="share-card">
          <div class="share-card-top">
            <div class="share-card-text">
              <strong>شارك إنجازك في الوصولية الرقمية</strong>
              <p>انشر نتيجتك على LinkedIn وستظهر بطاقة الموقع تلقائياً في المنشور.</p>
            </div>
            <div class="share-actions">
              <a
                href="${linkedInShareUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary"
                id="share-linkedin-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05c.53-1 1.83-2.05 3.77-2.05C21.65 8.6 22 11.1 22 14.35V21h-4v-5.85c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V21h-4V9Z"/>
                </svg>
                <span>مشاركة على LinkedIn</span>
              </a>
              <button type="button" class="btn btn-secondary" id="copy-share-text-btn">
                نسخ نص المشاركة
              </button>
            </div>
          </div>

          <p id="share-copy-status" class="share-copy-status" aria-live="polite" hidden></p>
        </div>

        ${cooldownCardHtml}

        <div class="summary-actions">
          <button
            type="button"
            class="btn btn-primary"
            id="replay-topic-btn"
            ${isCooldownActive ? 'disabled' : ''}
          >
            ${isCooldownActive ? 'إعادة الاختبار مغلقة لمدة شهر' : 'إعادة المحور من جديد'}
          </button>
          <a href="#leaderboard" class="btn btn-secondary" id="summary-leaderboard-btn">استعراض لوحة الصدارة</a>
          <a href="#challenges" class="btn btn-secondary" id="summary-challenges-btn">اختيار محور آخر</a>
        </div>

        <section class="review-section" aria-labelledby="review-section-heading">
          <div class="review-toggle-row">
            <h2 id="review-section-heading" class="brief-heading">مراجعة الأجوبة والشرح (${total} تحديات)</h2>
            <button
              type="button"
              class="btn btn-secondary"
              id="review-toggle-btn"
              aria-expanded="false"
              aria-controls="review-list"
            >
              عرض جميع الأجوبة والشرح
            </button>
          </div>
          <div id="review-list" class="review-list" hidden>
            ${reviewItemsHtml}
          </div>
        </section>
      </div>
    `;

    /* تحديث العدّاد التنازلي كل ثانية عند نشاط فترة الانتظار */
    if (isCooldownActive) {
      const daysEl = playShellCard.querySelector('#cd-days');
      const hoursEl = playShellCard.querySelector('#cd-hours');
      const minsEl = playShellCard.querySelector('#cd-minutes');
      const secsEl = playShellCard.querySelector('#cd-seconds');
      const cooldownCardEl = playShellCard.querySelector('#cooldown-card');
      const replayBtnEl = playShellCard.querySelector('#replay-topic-btn');

      activeCooldownTimerId = window.setInterval(() => {
        const remaining = unlockAtMs - Date.now();
        if (remaining <= 0) {
          clearCooldownTimer();
          if (cooldownCardEl) cooldownCardEl.hidden = true;
          if (replayBtnEl) {
            replayBtnEl.disabled = false;
            replayBtnEl.textContent = 'إعادة المحور من جديد';
          }
          announce('أصبحت إعادة اختبار المحور متاحة الآن');
          return;
        }
        const parts = getCountdownParts(remaining);
        if (daysEl) daysEl.textContent = String(parts.days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(parts.hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(parts.minutes).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(parts.seconds).padStart(2, '0');
      }, 1000);
    }

    const form = playShellCard.querySelector('#save-score-form');
    const nameInput = playShellCard.querySelector('#player-nickname');
    const submitBtn = playShellCard.querySelector('#save-score-submit');
    const formFeedback = playShellCard.querySelector('#save-score-feedback');

    if (form && !state.savedToLeaderboard) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nickname = nameInput.value.trim();
        if (nickname.length < 2) {
          formFeedback.textContent = 'يرجى كتابة اسم لا يقل عن حرفين.';
          formFeedback.classList.add('is-error');
          nameInput.focus();
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الحفظ...';
        formFeedback.classList.remove('is-error');

        const result = await submitScoreToLeaderboard({
          name: nickname,
          topicId: topic.id,
          topic: topic.ar,
          accuracy,
          errors,
          durationSeconds,
          score,
        });

        if (result.ok) {
          savePlayerName(nickname);
          const updatedState = saveTopicProgress(topic.id, {
            savedToLeaderboard: true,
            savedPlayerName: nickname,
          });
          renderTopicSummary(topic, challenges, updatedState);
          announce('تم حفظ نتيجتك في لوحة الصدارة بنجاح');
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'حفظ النتيجة';
          formFeedback.textContent = result.error;
          formFeedback.classList.add('is-error');
        }
      });
    }

    const shareLinkedInBtn = playShellCard.querySelector('#share-linkedin-btn');
    const copyBtn = playShellCard.querySelector('#copy-share-text-btn');
    const copyStatus = playShellCard.querySelector('#share-copy-status');

    if (shareLinkedInBtn) {
      shareLinkedInBtn.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareText).then(() => {
            if (copyStatus) {
              copyStatus.textContent =
                'تم فتح منشور LinkedIn بصورة الموقع ونتيجتك، ونُسخ نص المشاركة تلقائياً لتلصقيه داخل البوست (Cmd+V).';
              copyStatus.hidden = false;
            }
          }).catch(() => {});
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(shareText);
          if (copyStatus) {
            copyStatus.textContent = 'تم نسخ نص المشاركة بنجاح ✓ يمكنك لصقه مباشرة في LinkedIn.';
            copyStatus.hidden = false;
          }
          announce('تم نسخ نص المشاركة بنجاح');
        } catch {
          if (copyStatus) {
            copyStatus.textContent = 'تعذّر النسخ التلقائي — يمكنك استخدام زر «مشاركة على LinkedIn» مباشرة.';
            copyStatus.hidden = false;
          }
        }
      });
    }

    const reviewToggleBtn = playShellCard.querySelector('#review-toggle-btn');
    const reviewListEl = playShellCard.querySelector('#review-list');
    if (reviewToggleBtn && reviewListEl) {
      reviewToggleBtn.addEventListener('click', () => {
        const isExpanded = reviewToggleBtn.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !isExpanded;
        reviewToggleBtn.setAttribute('aria-expanded', String(nextExpanded));
        reviewListEl.hidden = !nextExpanded;
        reviewToggleBtn.textContent = nextExpanded
          ? 'إخفاء مراجعة الأجوبة'
          : 'عرض جميع الأجوبة والشرح';
        announce(nextExpanded ? 'تم عرض مراجعة جميع الأجوبة والشرح' : 'تم إخفاء مراجعة الأجوبة');
      });
    }

    const replayBtn = playShellCard.querySelector('#replay-topic-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (Date.now() < unlockAtMs) return;
        const freshState = resetTopicProgress(topic.id);
        renderChallengeRound(topic, challenges, freshState);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        announce(`تمت إعادة بدء محور ${topic.ar}`);
      });
    }

    const lbLink = playShellCard.querySelector('#summary-leaderboard-btn');
    if (lbLink) {
      lbLink.addEventListener('click', (event) => {
        event.preventDefault();
        setActiveView('leaderboard', { updateHash: true, moveFocus: true });
      });
    }

    const chLink = playShellCard.querySelector('#summary-challenges-btn');
    if (chLink) {
      chLink.addEventListener('click', (event) => {
        event.preventDefault();
        setActiveView('challenges', { updateHash: true, moveFocus: true });
      });
    }

    announce(`أحسنت! أتممت محور ${topic.ar} بنسبة دقة ${accuracy} بالمئة ومجموع ${score} نقطة.`);
  }

  /* عرض ساحة المحور بعد الضغط على بدء / استمرار */
  function renderPlayArena(topic) {
    if (!playShellCard || !topic) return;
    const progress = markTopicStarted(topic.id);
    const countLabel = formatChallengeCount(topic.count);

    if (playTopicMeta) {
      playTopicMeta.textContent = `${topic.en} • ${countLabel}`;
    }
    if (playHeading) {
      playHeading.textContent = `محور ${topic.ar}`;
    }
    if (playSubtitle) {
      playSubtitle.textContent = topic.definition;
    }

    const topicChallenges =
      (window.ACCESSIBILITY_CHALLENGES && window.ACCESSIBILITY_CHALLENGES[topic.id]) || null;

    if (Array.isArray(topicChallenges) && topicChallenges.length > 0) {
      if (progress.finished) {
        renderTopicSummary(topic, topicChallenges, progress);
      } else {
        renderChallengeRound(topic, topicChallenges, progress);
      }
      return;
    }

    const completed = Math.min(progress.completed || 0, topic.count);
    const percent = Math.round((completed / topic.count) * 100);
    const focusHtml = topic.focusAreas
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');

    playShellCard.innerHTML = `
      <div class="play-progress-row">
        <strong>تقدّمك في هذا المحور: ${completed} من ${topic.count}</strong>
        <span class="topic-count">${percent}%</span>
      </div>
      <div class="play-progress-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="نسبة إنجاز محور ${escapeHtml(topic.ar)}">
        <div class="play-progress-fill" style="width: ${percent}%"></div>
      </div>

      <div class="brief-section">
        <h2 class="brief-heading">موضوعات التحدّي في هذا المحور</h2>
        <ul class="brief-focus-list">${focusHtml}</ul>
      </div>

      <div class="play-ready-banner">
        <strong>ساحة التحدّي جاهزة لربط جولات اللعب!</strong>
        <p>تم حفظ بدئك لهذا المحور — عند عودتك لصفحة التحديات سيتحوّل زر النافذة تلقائياً إلى «استمرار». قريباً سنضيف جولات هذا المحور أيضاً.</p>
      </div>
    `;
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

  /* تحميل المقالات من /api/blog (على Railway) مع احتياطي blog-data.json */
  async function loadBlogArticles() {
    const endpoints = ['/api/blog', './blog-data.json'];
    for (const url of endpoints) {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) continue;
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          blogArticles = data;
          renderBlogList(activeBlogFilter);
          if (window.location.hash.startsWith('#blog/')) {
            syncViewFromHash();
          }
          return;
        }
      } catch {
        /* تجربة المصدر التالي */
      }
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
      announce('تمت العودة إلى قائمة المقالات');
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
        actionLink: policy.actionLink || null,
      });
    });
  });

  if (dialogStartTopicBtn) {
    dialogStartTopicBtn.addEventListener('click', () => {
      const chosenTopic = activeTopicInDialog;
      closeDialog();
      if (chosenTopic) {
        setActiveView('play', {
          updateHash: true,
          moveFocus: true,
          topicId: chosenTopic.id,
        });
      }
    });
  }

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
