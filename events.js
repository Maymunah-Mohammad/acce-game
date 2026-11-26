/* ==========================================================================
   قسم الفعاليات الجماعية — تحدّي الوصولية (WCAG 2.2)
   نظام ألعاب جماعية بأسلوب Kahoot و Slido:
   1) يمين أو يسار؟ (مقارنة واجهتين + سبب مختصر جداً أعلى الخيارين + تصويت حي ومنصة فائزين)
   2) عشرة مرة وحدة ! (10 إجابات صحيحة متتالية بدون خطأ — أي خطأ يعيد من الصفر، محاولات غير محدودة)
   3) سباق الدقيقة الجماعي (60 ثانية حماس وسرعة جماعية)
   ملاحظة: الصور تُقرأ مباشرة من مجلداتها الأصلية دون أي تعديل عليها.
   ========================================================================== */

(function () {
  'use strict';

  /* بنك 27 مقارنة بصرية عربية موثّقة ونظيفة من مجلدات المشروع الأصلية */
  const EVENTS_CHALLENGE_BANK = [
    /* --- التنقل وقابلية التنبؤ (9) --- */
    {
      id: 'ev-consistent-nav',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '3.2.3',
      criterionAr: 'التنقل المتّسق',
      image: 'Navigation & Predictability/Consistent Navigation_1.jpeg',
      prompt: 'أيّ الواجهتين تحافظ على تنقّل متّسق بين الصفحات؟',
      shortReason: 'ثبات ترتيب عناصر القائمة في كل الصفحات يسهّل التنبؤ والوصول السريع.',
      goodAlt: 'شريط تنقل بترتيب ثابت في كل الصفحات: الرئيسية، المنتجات، المدونة، تواصل معنا.',
      badAlt: 'شريط تنقل يتغير ترتيب روابطه عشوائياً عند الانتقال من صفحة لأخرى.',
    },
    {
      id: 'ev-consistent-id',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '3.2.4',
      criterionAr: 'التعريف المتّسق',
      image: 'Navigation & Predictability/Consistent Identification_1.jpeg',
      prompt: 'أيّ الواجهتين تستخدم تسمية وأيقونة متّسقة لنفس الوظيفة؟',
      shortReason: 'توحيد الأيقونة والتسمية («حذف») لنفس الإجراء يمنع تشتيت المستخدم.',
      goodAlt: 'ملفان بجانب كل منهما نفس أيقونة السلة وكلمة حذف.',
      badAlt: 'ملف بأيقونة سلة وكلمة حذف، وآخر بعلامة إكس وكلمة إزالة لنفس الوظيفة.',
    },
    {
      id: 'ev-consistent-help',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '3.2.6',
      criterionAr: 'المساعدة المتّسقة',
      image: 'Navigation & Predictability/Consistent Help_1.jpeg',
      prompt: 'أيّ الواجهتين تلتزم بثبات مكان زر المساعدة (?)؟',
      shortReason: 'بقاء زر المساعدة في نفس الموضع عبر كل الصفحات يتيح العثور عليه فوراً.',
      goodAlt: 'زر المساعدة في نفس الزاوية السفلية في جميع الصفحات.',
      badAlt: 'زر المساعدة ينتقل فجأة من أسفل الصفحة إلى أعلاها عند تغيير الصفحة.',
    },
    {
      id: 'ev-headings-labels',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '2.4.6',
      criterionAr: 'العناوين والتسميات الواضحة',
      image: 'Navigation & Predictability/Headings and Labels_1.jpeg',
      prompt: 'أيّ النموذجين يقدّم عناوين وتسميات أوضح للمستخدم؟',
      shortReason: 'العناوين والتسميات الوصفية توضح المطلوب بدقة دون تخمين.',
      goodAlt: 'نموذج بعنوان تواصل مع الدعم الفني وحقل البريد الإلكتروني للتواصل وزر إرسال الرسالة.',
      badAlt: 'نموذج بتسميات عامة مختصرة مثل الدعم والبريد وإرسال.',
    },
    {
      id: 'ev-link-purpose',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '2.4.4',
      criterionAr: 'غرض الرابط',
      image: 'Navigation & Predictability/Link Purpose_1.jpeg',
      prompt: 'أيّ الواجهتين تكتب نص الرابط بطريقة متاحة وواضحة؟',
      shortReason: 'النص الوصفي «تحميل التقرير (PDF)» يوضح الوجهة، بخلاف «اضغط هنا» الغامضة.',
      goodAlt: 'بطاقة تقرير تحتوي على رابط واضح: تحميل تقرير إمكانية الوصول (PDF).',
      badAlt: 'بطاقة تقرير تحتوي على رابط غامض: اضغط هنا.',
    },
    {
      id: 'ev-location',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '2.4.8',
      criterionAr: 'تحديد الموقع الحالي',
      image: 'Navigation & Predictability/Location_1.jpeg',
      prompt: 'أيّ الواجهتين توضّح للمستخدم موقعه الحالي في الموقع؟',
      shortReason: 'مسار التنقل (Breadcrumbs) وتمييز الصفحة النشطة يمنعان الضياع داخل الموقع.',
      goodAlt: 'صفحة تعرض مسار التنقل وتميّز القسم النشط في شريط التنقل.',
      badAlt: 'صفحة بدون مسار تنقل وبدون تمييز للصفحة الحالية.',
    },
    {
      id: 'ev-multiple-ways',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '2.4.5',
      criterionAr: 'طرق متعدّدة للوصول',
      image: 'Navigation & Predictability/Multiple Ways_1.jpeg',
      prompt: 'أيّ الواجهتين توفّر أكثر من طريقة للوصول للمحتوى؟',
      shortReason: 'الجمع بين القائمة وشريط البحث وخريطة الموقع يناسب مختلف أساليب التصفّح.',
      goodAlt: 'واجهة تضم قائمة رئيسية ومربع بحث وخريطة موقع في الذيل.',
      badAlt: 'واجهة تقتصر على رابطين فقط بدون بحث أو خريطة موقع.',
    },
    {
      id: 'ev-on-focus',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '3.2.1',
      criterionAr: 'عدم تغيّر السياق عند التركيز',
      image: 'Navigation & Predictability/On Focus_1.jpeg',
      prompt: 'أيّ الواجهتين تتصرّف بشكل سليم عند الانتقال للحقل بمفتاح Tab؟',
      shortReason: 'التركيز على حقل لا يجب أن ينقل المستخدم فجأة لصفحة أخرى بدون رغبته.',
      goodAlt: 'حقل يظهر عليه إطار التركيز بهدوء بانتظار الإدخال دون تحويل الصفحة.',
      badAlt: 'حقل يُطلق تحويل صفحة مفاجئاً بمجرد انتقال التركيز إليه.',
    },
    {
      id: 'ev-on-input',
      topicAr: 'التنقل وقابلية التنبؤ',
      wcagCode: '3.2.2',
      criterionAr: 'عدم الإرسال المفاجئ عند الإدخال',
      image: 'Navigation & Predictability/On Input_1.jpeg',
      prompt: 'أيّ النموذجين يمنح المستخدم تحكّماً آمناً عند اختيار الدولة؟',
      shortReason: 'تغيير خيار في قائمة يجب أن ينتظر زر «حفظ» ولا يُرسل النموذج تلقائياً.',
      goodAlt: 'نموذج يسمح باختيار الدولة ثم التأكيد بزر حفظ.',
      badAlt: 'نموذج يُرسل البيانات تلقائياً بمجرد تغيير القائمة المنسدلة.',
    },

    /* --- النماذج وتقليل العوائق (5) --- */
    {
      id: 'ev-error-id',
      topicAr: 'النماذج وتقليل العوائق',
      wcagCode: '3.3.1',
      criterionAr: 'تحديد الخطأ نصياً',
      image: 'Forms & Friction/Error Identification_1.jpeg',
      prompt: 'أيّ النموذجين يوضّح خطأ البريد الإلكتروني بطريقة متاحة؟',
      shortReason: 'إظهار رسالة نصية وأيقونة بجانب الإطار الأحمر يوضح الخطأ للجميع، وليس باللون فقط.',
      goodAlt: 'حقل بريد إلكتروني بإطار أحمر مع رسالة خطأ نصية واضحة وأيقونة تنبيه.',
      badAlt: 'حقل بريد إلكتروني بإطار أحمر فقط دون أي رسالة تشرح سبب الخطأ.',
    },
    {
      id: 'ev-labels-instructions',
      topicAr: 'النماذج وتقليل العوائق',
      wcagCode: '3.3.2',
      criterionAr: 'التسميات الدائمة للحقول',
      image: 'Forms & Friction/Labels or Instructions_1.jpeg',
      prompt: 'أيّ النموذجين يعرض تسميات الحقول بشكل صحيح ومتاح؟',
      shortReason: 'التسمية الثابتة فوق الحقل تبقى ظاهرة أثناء الكتابة، بخلاف النص المؤقت الذي يختفي.',
      goodAlt: 'نموذج بتسميات واضحة وثابتة فوق كل حقل: الاسم كامل والبريد الإلكتروني.',
      badAlt: 'نموذج يعتمد على نص مؤقت باهت داخل الحقل فقط بدون تسميات خارجية.',
    },
    {
      id: 'ev-error-suggestion',
      topicAr: 'النماذج وتقليل العوائق',
      wcagCode: '3.3.3',
      criterionAr: 'اقتراح تصحيح الخطأ',
      image: 'Forms & Friction/Error Suggestion_1.jpeg',
      prompt: 'أيّ النموذجين يساعد المستخدم فعلياً على إصلاح كلمة المرور؟',
      shortReason: 'تقديم اقتراح واضح ومثال للتصحيح يوفّر الوقت ويمنع الإحباط عند الخطأ.',
      goodAlt: 'رسالة خطأ تقترح استخدام 8 خانات تشمل حروفاً وأرقاماً مع مثال توضيحي.',
      badAlt: 'رسالة غامضة تكتفي بقول خطأ في الإدخال وكلمة المرور غير صالحة.',
    },
    {
      id: 'ev-redundant-entry',
      topicAr: 'النماذج وتقليل العوائق',
      wcagCode: '3.3.7',
      criterionAr: 'منع الإدخال المكرّر',
      image: 'Forms & Friction/Redundant Entry_1.jpeg',
      prompt: 'أيّ النموذجين يقلّل العوائق وفق معيار WCAG 2.2؟',
      shortReason: 'خيار «نفس عنوان الشحن» يغني المستخدم عن إعادة كتابة نفس البيانات مرتين.',
      goodAlt: 'نموذج يتيح مربع اختيار لنسخ عنوان الشحن تلقائياً إلى عنوان الفواتير.',
      badAlt: 'نموذج يجبر المستخدم على إعادة كتابة العنوان يدوياً في حقل الفواتير.',
    },
    {
      id: 'ev-accessible-auth',
      topicAr: 'النماذج وتقليل العوائق',
      wcagCode: '3.3.8',
      criterionAr: 'المصادقة المتاحة',
      image: 'Forms & Friction/Accessible Auth_1.jpeg',
      prompt: 'أيّ شاشتي تسجيل الدخول أكثر إتاحة وسهولة؟',
      shortReason: 'السماح باللصق والتعبئة التلقائية والدخول السريع يزيل العوائق الذهنية والاختبارات المعقّدة.',
      goodAlt: 'شاشة دخول تدعم اللصق والتعبئة التلقائية وتسجيل الدخول عبر Google أو رمز الهاتف.',
      badAlt: 'شاشة دخول تمنع اللصق وتفرض حل مسألة رياضية صعبة لإتمام الدخول.',
    },

    /* --- اللمس وأحجام الأهداف (2) --- */
    {
      id: 'ev-target-min',
      topicAr: 'اللمس وأحجام الأهداف',
      wcagCode: '2.5.8',
      criterionAr: 'الحد الأدنى لحجم الهدف',
      image: 'Touch & Targets/Target Size (Minimum)_1.jpeg',
      prompt: 'أيّ التصميمين يلتزم بالحد الأدنى لحجم أزرار اللمس في WCAG 2.2؟',
      shortReason: 'مقاس 24×24 بكسل على الأقل يقلّل النقرات الخاطئة مقارنة بالأزرار الصغيرة (12px).',
      goodAlt: 'قائمة إعدادات بأزرار لمس مقاسها 24 بكسل مريحة وواضحة.',
      badAlt: 'قائمة إعدادات بأيقونات دقيقة جداً مقاسها 12 بكسل يصعب لمسها.',
    },
    {
      id: 'ev-target-enhanced',
      topicAr: 'اللمس وأحجام الأهداف',
      wcagCode: '2.5.5',
      criterionAr: 'الحجم المعزّز للّمس (AAA)',
      image: 'Touch & Targets/Target Size (Enhanced)_1.jpeg',
      prompt: 'أيّ التصميمين يحقّق مستوى الراحة المعزّز (AAA) للمس؟',
      shortReason: 'مقاس 44×44 بكسل هو الحجم الذهبي المريح للأصابع ولذوي الصعوبات الحركية.',
      goodAlt: 'أزرار لمس رحبة بمقاس 44×44 بكسل سهلة النقر.',
      badAlt: 'أزرار أصغر بمقاس 24×24 بكسل.',
    },

    /* --- التركيز التفاعلي (4) --- */
    {
      id: 'ev-focus-visible',
      topicAr: 'التركيز التفاعلي',
      wcagCode: '2.4.7',
      criterionAr: 'وضوح مؤشّر التركيز',
      image: 'Interactive Focus/Focus Visible_1.jpeg',
      prompt: 'أيّ الواجهتين تُظهر بوضوح أين يقف مستخدم لوحة المفاتيح؟',
      shortReason: 'مؤشّر التركيز الظاهر على زر «اشترك الآن» ضروري لمعرفة العنصر النشط بلوحة المفاتيح.',
      goodAlt: 'زر اشترك الآن يحيط به إطار تركيز بارز وواضح عند التنقل بمفتاح Tab.',
      badAlt: 'زر اشترك الآن بلا أي مؤشّر بصري يوضح أنه في حالة تركيز.',
    },
    {
      id: 'ev-focus-appearance',
      topicAr: 'التركيز التفاعلي',
      wcagCode: '2.4.13',
      criterionAr: 'تباين وسماكة إطار التركيز',
      image: 'Interactive Focus/Focus Appearance_1.jpeg',
      prompt: 'أيّ الحقلين يقدّم مظهر تركيز واضحاً وسهل التمييز؟',
      shortReason: 'إطار التركيز السميك عالي التباين يسهل رؤيته فوراً لضعاف البصر ومستخدمي لوحة المفاتيح.',
      goodAlt: 'حقل الاسم الكامل بإطار تركيز داكن وسميك واضح جداً.',
      badAlt: 'حقل الاسم الكامل بإطار باهت بالكاد يُرى عند التركيز.',
    },
    {
      id: 'ev-focus-not-obscured',
      topicAr: 'التركيز التفاعلي',
      wcagCode: '2.4.11',
      criterionAr: 'عدم حجب العنصر المركّز عليه',
      image: 'Interactive Focus/Focus Not Obscured_1.jpeg',
      prompt: 'أيّ الواجهتين تحافظ على ظهور الزر عند التركيز عليه؟',
      shortReason: 'شريط ملفات تعريف الارتباط لا يجب أن يغطي زر «إرسال الطلب» أثناء التركيز عليه.',
      goodAlt: 'زر إرسال الطلب ظاهر بالكامل فوق شريط ملفات تعريف الارتباط.',
      badAlt: 'شريط ملفات تعريف الارتباط يغطي جزءاً من زر إرسال الطلب المركّز عليه.',
    },
    {
      id: 'ev-focus-order',
      topicAr: 'التركيز التفاعلي',
      wcagCode: '2.4.3',
      criterionAr: 'ترتيب التركيز المنطقي',
      image: 'Interactive Focus/Focus Order_1.jpeg',
      prompt: 'أيّ النموذجين يتّبع ترتيباً منطقياً عند التنقل بمفتاح Tab؟',
      shortReason: 'الانتقال بالترتيب الطبيعي (الاسم الأول ← العائلة ← البريد ← إرسال) يمنع إرباك المستخدم.',
      goodAlt: 'ترتيب تركيز متسلسل منطقياً من 1 إلى 4 حسب القراءة العربية.',
      badAlt: 'ترتيب تركيز عشوائي يقفز من اسم العائلة إلى زر الإرسال ثم يعود للأعلى.',
    },

    /* --- الطباعة والقراءة (2) --- */
    {
      id: 'ev-resize-text',
      topicAr: 'الطباعة والقراءة',
      wcagCode: '1.4.4',
      criterionAr: 'تكبير النص 200%',
      image: 'Typography & Reading/Resize Text_1.jpeg',
      prompt: 'أيّ البطاقتين تحافظ على وضوح القراءة عند تكبير النص 200%؟',
      shortReason: 'عند تكبير النص إلى 200% يجب أن تتمدد العناصر بمرونة دون تداخل أو اختفاء.',
      goodAlt: 'بطاقة بنص مكبّر 200% واضح ومتباعد دون أي تداخل مع زر تفاصيل.',
      badAlt: 'بطاقة يتداخل فيها النص المكبّر مع زر تفاصيل ويخرج عن الحدود.',
    },
    {
      id: 'ev-sensory-char',
      topicAr: 'الطباعة والقراءة',
      wcagCode: '1.3.3',
      criterionAr: 'الخصائص الحسية في التعليمات',
      image: 'Typography & Reading/Sensory Characteristics_1.jpeg',
      prompt: 'أيّ التعليمات التالية مفهومة حتى بدون رؤية شكل الزر؟',
      shortReason: 'الإشارة لاسم الزر («إرسال») واضحة للجميع، بخلاف الاعتماد على الشكل («البيضاوي») وحده.',
      goodAlt: 'تعليمة واضحة تقول: اضغط على زر إرسال أدناه.',
      badAlt: 'تعليمة تعتمد على الشكل البصري فقط: اضغط على الزر البيضاوي أدناه.',
    },

    /* --- التخطيط والبنية (1) --- */
    {
      id: 'ev-reflow',
      topicAr: 'التخطيط والبنية',
      wcagCode: '1.4.10',
      criterionAr: 'إعادة التدفق (Reflow)',
      image: 'Layout & Structure/Reflow.jpeg',
      prompt: 'أيّ التصميمين يتكيّف بمرونة مع شاشة عرضها 320 بكسل؟',
      shortReason: 'تراص العناصر عمودياً يمنع التمرير الأفقي المزعج وقصّ الأزرار على الشاشات الضيقة.',
      goodAlt: 'شاشة جوال تترتب فيها الأزرار والنصوص عمودياً بالكامل بدون تمرير أفقي.',
      badAlt: 'شاشة جوال تنقص فيها الأزرار وتفرض شريط تمرير أفقي.',
    },

    /* --- الوسائط والصور (1) --- */
    {
      id: 'ev-captions',
      topicAr: 'الوسائط والصور',
      wcagCode: '1.2.2',
      criterionAr: 'الترجمة النصية للفيديو (Captions)',
      image: 'Media & Images/Captions_1.jpeg',
      prompt: 'أيّ مشغّل فيديو أكثر إتاحة للصم وضعاف السمع؟',
      shortReason: 'توفير ترجمة نصية متزامنة (CC) يمكّن الجميع من متابعة الفيديو حتى بدون صوت.',
      goodAlt: 'مشغّل فيديو يعرض ترجمة نصية واضحة وزر CC مفعّل.',
      badAlt: 'مشغّل فيديو بدون ترجمة نصية مع زر CC معطّل ومشطوب.',
    },

    /* --- الإدخال والإيماءات (2) --- */
    {
      id: 'ev-dragging',
      topicAr: 'الإدخال والإيماءات',
      wcagCode: '2.5.7',
      criterionAr: 'بدائل السحب والإفلات',
      image: 'Input & Gestures/Dragging Movements_1.jpeg',
      prompt: 'أيّ القائمتين تتيح إعادة ترتيب المهام بطريقة متاحة للجميع؟',
      shortReason: 'أزرار الصعود والهبوط تتيح الترتيب بنقرة واحدة لمن يواجه صعوبة في السحب المستمر.',
      goodAlt: 'قائمة مهام مزوّدة بأسهم صعود وهبوط للترتيب بنقرة واحدة.',
      badAlt: 'قائمة مهام تعتمد حصراً على السحب والإفلات دون أي أزرار بديلة.',
    },
    {
      id: 'ev-pointer-gestures',
      topicAr: 'الإدخال والإيماءات',
      wcagCode: '2.5.1',
      criterionAr: 'بدائل إيماءات الأصابع المتعددة',
      image: 'Input & Gestures/Pointer Gestures_1.jpeg',
      prompt: 'أيّ الخريطتين توفر تحكّماً متاحاً بالتكبير والتنقل؟',
      shortReason: 'أزرار (+ / - / نقل / تدوير) تتيح التحكّم بنقرة بسيطة بدلاً من حصره بإصبعين.',
      goodAlt: 'خريطة تحتوي على أزرار تكبير وتصغير ونقل وتدوير بنقرة واحدة.',
      badAlt: 'خريطة تفرض التكبير بإصبعين فقط دون أزرار مساعدة.',
    },

    /* --- الحركة والرسوم المتحركة (4) --- */
    {
      id: 'ev-pause-stop-hide',
      topicAr: 'الحركة والرسوم المتحركة',
      wcagCode: '2.2.2',
      criterionAr: 'إيقاف الحركة التلقائية',
      image: 'Animation & Motion/Pause Stop Hide_1.jpeg',
      prompt: 'أيّ لافتتي العروض المتحركة تمنح المستخدم تحكّماً أفضل؟',
      shortReason: 'وجود زر إيقاف مؤقت (❚❚) يمنع التشتيت ويتيح القراءة بهدوء لمن يتأثرون بالحركة.',
      goodAlt: 'لافتة عروض متحركة تحتوي على زر إيقاف مؤقت واضح.',
      badAlt: 'لافتة عروض تتحرك تلقائياً بشكل مستمر دون زر لإيقافها.',
    },
    {
      id: 'ev-animation-interactions',
      topicAr: 'الحركة والرسوم المتحركة',
      wcagCode: '2.3.3',
      criterionAr: 'تقليل الحركة من التفاعلات',
      image: 'Animation & Motion/Animation from Interactions_1.jpeg',
      prompt: 'أيّ الواجهتين تحترم تفضيل المستخدم في تقليل الحركة؟',
      shortReason: 'تفعيل خيار «تقليل الحركة» يوقف الرسوم الدوّارة التي قد تسبب دواراً لبعض المستخدمين.',
      goodAlt: 'إعدادات عرض تتضمن زر تقليل الحركة ومعاينة ثابتة هادئة للصفحة.',
      badAlt: 'إعدادات عرض بدون خيار تقليل الحركة مع معاينة فيها حركات دوران مستمرة.',
    },
    {
      id: 'ev-three-flashes',
      topicAr: 'الحركة والرسوم المتحركة',
      wcagCode: '2.3.1',
      criterionAr: 'تجنّب الوميض السريع',
      image: 'Animation & Motion/Three Flashes_1.jpeg',
      prompt: 'أيّ مقطعي الفيديو آمن لسلامة المستخدمين ضد الوميض السريع؟',
      shortReason: 'تجاوز 3 ومضات في الثانية قد يثير نوبات صرع حسّاس للضوء؛ الهدوء البصري ضروري.',
      goodAlt: 'فيديو هادئ بنبضة واحدة أو أقل من 3 ومضات في الثانية.',
      badAlt: 'فيديو يحتوي على 6 ومضات ساطعة في الثانية الواحدة.',
    },
    {
      id: 'ev-timing-adjustable',
      topicAr: 'الحركة والرسوم المتحركة',
      wcagCode: '2.2.1',
      criterionAr: 'إتاحة تعديل الوقت',
      image: 'Animation & Motion/Timing Adjustable_1.jpeg',
      prompt: 'أيّ رسالتي انتهاء الجلسة تراعي اختلاف سرعة المستخدمين؟',
      shortReason: 'إتاحة زري «تمديد الوقت» أو «إيقاف المؤقّت» تمنع فقدان بيانات من يحتاجون وقتاً أطول.',
      goodAlt: 'تنبيه انتهاء الجلسة يتضمن زري تمديد الوقت وإيقاف المؤقّت.',
      badAlt: 'تنبيه انتهاء الجلسة بعدّاد تنازلي فقط دون أي خيار لتمديد الوقت.',
    },

    /* --- إضافات النماذج والإدخال والتركيز والتخطيط والوسائط والألوان (10) --- */
    {
      id: 'ev-error-prevention',
      topicAr: 'النماذج وتقليل العوائق',
      wcagCode: '3.3.4',
      criterionAr: 'منع الأخطاء الخطيرة',
      image: 'Forms & Friction/Error Prevention_1.jpeg',
      prompt: 'أيّ واجهتي حذف الحساب تحمي المستخدم من الحذف غير المقصود؟',
      shortReason: 'إظهار رسالة تأكيد مع زر «إلغاء وتراجع» يحمي من الإجراءات الحساسة غير القابلة للتراجع.',
      goodAlt: 'نافذة تأكيد تسأل هل أنت متأكد من حذف حسابك مع زر إلغاء وتراجع.',
      badAlt: 'زر حذف الحساب مباشرة دون أي خطوة تأكيد أو تراجع.',
    },
    {
      id: 'ev-motion-actuation',
      topicAr: 'الإدخال والإيماءات',
      wcagCode: '2.5.4',
      criterionAr: 'بدائل التفعيل بالحركة',
      image: 'Input & Gestures/Motion Actuation_1.jpeg',
      prompt: 'أيّ الواجهتين توفر طريقة متاحة للتراجع بعد حذف ملاحظة؟',
      shortReason: 'توفير زر «تراجع» على الشاشة ضروري لمن لا يستطيعون هزّ الهاتف أو يستخدمونه مثبّتاً.',
      goodAlt: 'إشعار تم حذف الملاحظة يظهر معه زر تراجع واضح قابل للنقر.',
      badAlt: 'إشعار يطلب هزّ الهاتف فقط للتراجع بدون زر بديل على الشاشة.',
    },
    {
      id: 'ev-content-hover-focus',
      topicAr: 'التركيز التفاعلي',
      wcagCode: '1.4.13',
      criterionAr: 'المحتوى عند التمرير أو التركيز',
      image: 'Interactive Focus/Content on Hover or Focus_1.jpeg',
      prompt: 'أيّ تلميح المعلومات (Tooltip) يلتزم بمعايير الوصولية؟',
      shortReason: 'التلميح المتاح يظهر كاملاً دون قصّ ويمكن إغلاقه بزر × أو بمفتاح Esc بسهولة.',
      goodAlt: 'تلميح معلومات واضح يعرض النص كاملاً مع زر إغلاق وخيار Esc للإغلاق.',
      badAlt: 'تلميح معلومات مقصوص من الحافة ولا يتيح إغلاقه بلوحة المفاتيح.',
    },
    {
      id: 'ev-keyboard-access',
      topicAr: 'التركيز التفاعلي',
      wcagCode: '2.1.1',
      criterionAr: 'الوصول الكامل بلوحة المفاتيح',
      image: 'Interactive Focus/Keyboard_1.jpeg',
      prompt: 'أيّ واجهتي اختيار التاريخ تدعم الاستخدام الكامل بلوحة المفاتيح؟',
      shortReason: 'تمكين الوصول للحقل والزر بمفاتيح Tab و Enter يضمن عدم حصر الوظيفة بالفأرة فقط.',
      goodAlt: 'حقل تاريخ وزر تأكيد قابلان للتركيز والتفعيل بلوحة المفاتيح عبر Tab و Enter.',
      badAlt: 'حقل تاريخ يعتمد على مؤشّر الفأرة فقط دون إمكانية الوصول بلوحة المفاتيح.',
    },
    {
      id: 'ev-no-keyboard-trap',
      topicAr: 'التركيز التفاعلي',
      wcagCode: '2.1.2',
      criterionAr: 'عدم وجود فخّ للوحة المفاتيح',
      image: 'Interactive Focus/No Keyboard Trap_1.jpeg',
      prompt: 'أيّ نافذتي «تعديل الاسم» تسمح للمستخدم بالخروج بأمان؟',
      shortReason: 'وجود زر «إلغاء» وزر إغلاق ودعم مفتاح Esc يمنع احتجاز مستخدم لوحة المفاتيح داخل النافذة.',
      goodAlt: 'نافذة تعديل الاسم تحتوي على زر إغلاق وزر إلغاء ودعم مفتاح Esc للخروج.',
      badAlt: 'نافذة تعديل الاسم تحصر التركيز داخل الحقل بدون زر إلغاء أو إغلاق.',
    },
    {
      id: 'ev-meaningful-sequence',
      topicAr: 'التخطيط والبنية',
      wcagCode: '1.3.2',
      criterionAr: 'التسلسل المنطقي للمحتوى',
      image: 'Layout & Structure/Meaningful Sequence_1.jpeg',
      prompt: 'أيّ الصفحتين ترتّب القراءة بتسلسل منطقي ومفهوم؟',
      shortReason: 'ترتيب العنوان ثم نص القصة ثم «اقرأ المزيد» قبل الإعلان يحافظ على تسلسل القراءة الطبيعي.',
      goodAlt: 'صفحة مرتّبة بتسلسل واضح: العنوان ثم فقرة القصة ثم اقرأ المزيد ثم بطاقة العروض.',
      badAlt: 'صفحة يقطع فيها شريط العروض والاعلان سياق القراءة بين العنوان وبداية القصة.',
    },
    {
      id: 'ev-orientation',
      topicAr: 'التخطيط والبنية',
      wcagCode: '1.3.4',
      criterionAr: 'دعم اتجاهَي الشاشة',
      image: 'Layout & Structure/Orientation.jpeg',
      prompt: 'أيّ التطبيقين يلتزم بمرونة اتجاه الشاشة (عمودي وأفقي)؟',
      shortReason: 'السماح بالعرض الأفقي والعمودي أساسي لمن يثبّتون أجهزتهم على حامل أو كرسي متحرك.',
      goodAlt: 'تطبيق لوحة تحكم يتكيّف بسلاسة عند تدوير الهاتف للوضع الأفقي.',
      badAlt: 'تطبيق يقفل الشاشة قسراً ويطلب من المستخدم تدوير الهاتف.',
    },
    {
      id: 'ev-audio-control',
      topicAr: 'الوسائط والصور',
      wcagCode: '1.4.2',
      criterionAr: 'التحكّم بالصوت التلقائي',
      image: 'Media & Images/Audio Control_1.jpeg',
      prompt: 'أيّ الواجهتين تتعامل بطريقة متاحة مع موسيقى الخلفية؟',
      shortReason: 'أي صوت تلقائي يتجاوز 3 ثوانٍ يجب أن يوفّر زر إيقاف أو كتم فوري حتى لا يشوّش على قارئ الشاشة.',
      goodAlt: 'شريط موسيقى خلفية يحتوي على زر إيقاف مؤقت واضح وسهل الوصول.',
      badAlt: 'موسيقى خلفية تعمل تلقائياً لأكثر من 3 ثوانٍ دون أي زر للإيقاف.',
    },
    {
      id: 'ev-non-text-content',
      topicAr: 'الوسائط والصور',
      wcagCode: '1.1.1',
      criterionAr: 'النص البديل للصور (Alt Text)',
      image: 'Media & Images/Non-text Content_1.jpeg',
      prompt: 'أيّ البطاقتين تكتب سمة النص البديل (alt) بالطريقة الصحيحة؟',
      shortReason: 'الصورة المعلوماتية تحتاج وصفاً واضحاً («جبل مغطى بالثلوج»)، بينما الزخرفية تُترك فارغة alt="".',
      goodAlt: 'بطاقة تضع نصاً بديلاً وصفياً لصورة الجبل وسمة alt فارغة للخط الزخرفي.',
      badAlt: 'بطاقة تترك صورة الجبل بلا وصف وتصف الخط الزخرفي بنص طويل غير مفيد.',
    },
    {
      id: 'ev-contrast-enhanced',
      topicAr: 'الألوان والمظهر',
      wcagCode: '1.4.6',
      criterionAr: 'تباين النصوص العالي',
      image: 'Color & Appearance/Contrast (Enhanced)_1.jpeg',
      prompt: 'أيّ البطاقتين تحقق تبايناً لونياً مريحاً وسهل القراءة؟',
      shortReason: 'التباين المرتفع بين النص والخلفية يمكّن ضعاف البصر والجميع من القراءة بوضوح دون إجهاد.',
      goodAlt: 'بطاقة بنص أسود داكن واضح وتباين عالٍ على خلفية بيضاء.',
      badAlt: 'بطاقة بنص رمادي باهت جداً يصعب تمييزه على الخلفية البيضاء.',
    },
  ];

  const BANK_BY_ID = new Map(EVENTS_CHALLENGE_BANK.map((c) => [c.id, c]));

  const EVENT_GAMES = [
    {
      id: 'right-or-left',
      title: 'يمين أو يسار؟',
      badge: 'تصويت جماعي حي أو شاشة واحدة',
      accent: 'purple',
      summary:
        'تُعرض واجهتان متجاورتان (يمين ويسار) وتختار المجموعة الأصح وصولياً، مع كشف النتيجة وذكر السبب باختصار شديد أعلى الخيارين ومنصة فائزين بأسلوب Kahoot و Slido.',
      highlights: ['10 جولات متجددة', 'سبب مختصر أعلى الخيارين', 'تصويت بجوالات الجمهور + منصة فائزين'],
    },
    {
      id: 'ten-in-a-row',
      title: 'عشرة مرة وحدة !',
      badge: 'تحدّي السلسلة • محاولات غير محدودة',
      accent: 'pink',
      summary:
        'لازم تجيب المجموعة 10 إجابات صحيحة متتالية (ورى بعض)! لو أخطأتم في أي مرحلة — الأولى أو الثانية أو حتى التاسعة — تعيدون اللعبة من البداية ببطاقات جديدة ومحاولات غير محدودة.',
      highlights: ['10 إجابات متتالية بدون خطأ', 'إعادة فورية من الصفر عند الخطأ', 'عدد المحاولات غير محدود'],
    },
    {
      id: 'speed-blitz',
      title: 'سباق الدقيقة الجماعي',
      badge: '60 ثانية من الحماس والسرعة',
      accent: 'peach',
      summary:
        'تحدّي سرعة جماعي لمدة 60 ثانية! كم واجهة متاحة تستطيع المجموعة اصطيادها يميناً أو يساراً قبل انتهاء المؤقّت مع ظهور السبب المختصر الفوري أعلى الخيارين؟',
      highlights: ['مؤقّت 60 ثانية حي', 'سرعة وتركيز جماعي', 'إحصاء فوري للإجابات الصحيحة'],
    },
  ];

  function escapeHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const SESSION_SEEN_KEY = 'a11y_events_seen_ids_v1';
  let lastShownCardId = '';

  function loadSessionSeenIds() {
    try {
      const raw = sessionStorage.getItem(SESSION_SEEN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      /* تجاهل */
    }
    return new Set();
  }

  let sessionSeenIds = loadSessionSeenIds();

  function saveSessionSeenIds() {
    try {
      sessionStorage.setItem(SESSION_SEEN_KEY, JSON.stringify(Array.from(sessionSeenIds)));
    } catch {
      /* تجاهل */
    }
  }

  function markCardSeen(challengeId) {
    if (!challengeId || !BANK_BY_ID.has(challengeId)) return;
    lastShownCardId = challengeId;
    sessionSeenIds.add(challengeId);
    if (sessionSeenIds.size >= EVENTS_CHALLENGE_BANK.length) {
      /* تم استعراض كامل بنك الـ 40 صورة في هذه الجلسة — إعادة التدوير مع استثناء آخر بطاقة */
      sessionSeenIds = new Set([challengeId]);
    }
    saveSessionSeenIds();
  }

  function buildRandomDeck(count = EVENTS_CHALLENGE_BANK.length) {
    const targetCount = Math.min(count, EVENTS_CHALLENGE_BANK.length);
    const unseen = shuffleArray(
      EVENTS_CHALLENGE_BANK.filter((item) => !sessionSeenIds.has(item.id))
    );
    const seen = shuffleArray(
      EVENTS_CHALLENGE_BANK.filter((item) => sessionSeenIds.has(item.id))
    );

    /* نضع جميع البطاقات غير المشاهَدة أولاً لمنع أي تكرار داخل الجلسة */
    const ordered = unseen.concat(seen);
    if (ordered.length > 1 && ordered[0].id === lastShownCardId) {
      ordered.push(ordered.shift());
    }

    const picked = ordered.slice(0, targetCount);
    return picked.map((item) => ({
      challengeId: item.id,
      goodSide: Math.random() < 0.5 ? 'right' : 'left',
    }));
  }

  function getGameMeta(gameId) {
    return EVENT_GAMES.find((g) => g.id === gameId) || EVENT_GAMES[0];
  }

  function buildJoinUrl(code) {
    const origin = window.location.origin;
    const basePath = window.location.pathname || '/';
    return `${origin}${basePath}#events/join/${code}`;
  }

  function buildQrMarkup(url, sizePx = 200) {
    if (!window.QrSvg || typeof window.QrSvg.renderSvg !== 'function') return '';
    try {
      return window.QrSvg.renderSvg(url, {
        sizePx,
        quietZone: 4,
        darkColor: '#231F29',
        lightColor: '#FFFFFF',
        ariaLabel: `رمز الاستجابة السريعة QR للانضمام للغرفة عبر الرابط ${escapeHtml(url)}`,
      });
    } catch {
      return '';
    }
  }

  /* ========================================================================
     الحالة الداخلية لوحدة الفعاليات
     ======================================================================== */
  let rootEl = null;
  let announceFn = () => {};
  let setBreadcrumbsFn = () => {};
  let activeMode = 'hub'; /* 'hub' | 'stage' | 'host' | 'join' */
  let sseSource = null;
  let pollIntervalId = null;
  let countdownIntervalId = null;
  let keydownBound = false;

  /* حالة وضع الشاشة الواحدة (Stage) */
  let stageState = null;

  /* حالة وضع الغرفة الحية (Host / Participant) */
  let liveHostState = null; /* { code, hostToken, room, selectedTimer } */
  let livePlayerState = null; /* { code, playerId, name, room, myVote, myVoteRound, showImagesOnPhone } */

  function clearLiveTimersAndStreams() {
    if (sseSource) {
      try {
        sseSource.close();
      } catch {
        /* تجاهل */
      }
      sseSource = null;
    }
    if (pollIntervalId !== null) {
      window.clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    if (countdownIntervalId !== null) {
      window.clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }
  }

  function clearStageTimers() {
    if (countdownIntervalId !== null) {
      window.clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }
  }

  function updateHashQuietly(hash) {
    if (window.location.hash !== hash) {
      history.pushState(null, '', hash);
    }
  }

  /* ========================================================================
     مكوّن مشترك: رسم بطاقتي اليمين واليسار (في RTL: العمود 1 يمين، العمود 2 يسار)
     ======================================================================== */
  function buildRightLeftCardsHtml({
    challenge,
    goodSide,
    revealed,
    chosenSide,
    interactive,
    votesInfo,
  }) {
    const encodedImg = encodeURI(challenge.image);
    const sides = [
      {
        side: 'right',
        label: 'يمين',
        arrow: '➡',
        shortcut: 'سهم يمين',
        isGood: goodSide === 'right',
        pct: votesInfo ? votesInfo.rightPct : null,
        count: votesInfo ? votesInfo.right : null,
      },
      {
        side: 'left',
        label: 'يسار',
        arrow: '⬅',
        shortcut: 'سهم يسار',
        isGood: goodSide === 'left',
        pct: votesInfo ? votesInfo.leftPct : null,
        count: votesInfo ? votesInfo.left : null,
      },
    ];

    return `
      <div class="event-choice-grid" role="group" aria-label="اختر الواجهة المتاحة: يمين أم يسار">
        ${sides
          .map((item) => {
            const cropClass = item.isGood ? 'crop-top-left' : 'crop-top-right';
            const altText = item.isGood ? challenge.goodAlt : challenge.badAlt;
            let stateClass = '';
            let verdictPill = '';

            if (revealed) {
              if (item.isGood) {
                stateClass = ' is-correct-choice';
                verdictPill = '<span class="event-card-verdict is-good">الخيار المتاح ✓</span>';
              } else if (chosenSide === item.side) {
                stateClass = ' is-wrong-choice';
                verdictPill = '<span class="event-card-verdict is-bad">اختيار غير متاح ✕</span>';
              } else {
                stateClass = ' is-muted-choice';
                verdictPill = '<span class="event-card-verdict is-bad">غير متاح ✕</span>';
              }
            }

            const voteBarHtml =
              revealed && votesInfo && votesInfo.total > 0
                ? `
                  <div class="event-vote-bar-wrap" aria-label="نسبة التصويت لجهة ${item.label}: ${item.pct}% (${item.count} صوت)">
                    <div class="event-vote-bar-meta">
                      <span>تصويت الجمهور</span>
                      <strong>${item.pct}% (${item.count})</strong>
                    </div>
                    <div class="event-vote-bar-track">
                      <div class="event-vote-bar-fill ${item.isGood ? 'is-good' : 'is-other'}" style="width: ${item.pct}%"></div>
                    </div>
                  </div>
                `
                : '';

            const tag = interactive ? 'button' : 'div';
            const attrs = interactive
              ? `type="button" data-pick-side="${item.side}" ${revealed ? 'disabled' : ''}`
              : '';

            return `
              <${tag} class="event-side-card event-side-${item.side}${stateClass}" ${attrs}>
                <div class="event-side-head">
                  <span class="event-side-pill pill-${item.side}">
                    <span class="event-side-arrow" aria-hidden="true">${item.arrow}</span>
                    <span>${item.label}</span>
                  </span>
                  ${verdictPill || (interactive ? `<span class="event-key-hint" aria-hidden="true">${item.shortcut}</span>` : '')}
                </div>
                <div class="choice-crop-frame event-crop-frame">
                  <img
                    src="${encodedImg}"
                    alt="${escapeHtml(altText)}"
                    class="choice-crop-img ${cropClass}"
                    loading="eager"
                    decoding="async"
                  >
                </div>
                ${voteBarHtml}
              </${tag}>
            `;
          })
          .join('')}
      </div>
    `;
  }

  /* مكوّن مشترك: شريط التقدّم 1..10 للعبة «عشرة مرة وحدة !» */
  function buildTenStreakTrackHtml(streak, failedAtStep) {
    const dots = [];
    for (let i = 1; i <= 10; i += 1) {
      let cls = 'ten-step';
      let label = String(i);
      if (i <= streak) {
        cls += ' is-done';
        label = '✓';
      } else if (failedAtStep && i === streak + 1) {
        cls += ' is-failed';
        label = '✕';
      } else if (!failedAtStep && i === streak + 1) {
        cls += ' is-current';
      }
      dots.push(`<span class="${cls}" aria-label="المرحلة ${i}">${label}</span>`);
    }
    return `
      <div class="ten-streak-track" role="region" aria-label="سلسلة التقدم: ${streak} من 10 إجابات متتالية">
        <div class="ten-streak-label">
          <strong>السلسلة المتتالية: ${streak} / 10</strong>
          <span>لا مجال للخطأ — 10 إجابات صح ورى بعض!</span>
        </div>
        <div class="ten-steps-row">${dots.join('')}</div>
      </div>
    `;
  }

  /* ========================================================================
     1) شاشة بوابة الفعاليات (Events Hub)
     ======================================================================== */
  function renderHub({ pushHash = false } = {}) {
    clearLiveTimersAndStreams();
    activeMode = 'hub';
    stageState = null;
    liveHostState = null;
    livePlayerState = null;

    if (pushHash) updateHashQuietly('#events');
    setBreadcrumbsFn([
      { label: 'الرئيسية', view: 'home', href: '#home' },
      { label: 'الفعاليات' },
    ]);

    const gamesHtml = EVENT_GAMES.map((game) => {
      const chips = game.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('');
      return `
        <article class="event-game-card event-accent-${game.accent}">
          <div class="event-game-card-top">
            <span class="event-game-badge">${escapeHtml(game.badge)}</span>
            <h2 class="event-game-title">${escapeHtml(game.title)}</h2>
            <p class="event-game-summary">${escapeHtml(game.summary)}</p>
            <ul class="event-game-highlights">${chips}</ul>
          </div>
          <div class="event-game-actions">
            <button type="button" class="btn btn-primary" data-launch-stage="${game.id}">
              <span>تشغيل مباشر على الشاشة</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button type="button" class="btn btn-secondary" data-launch-host="${game.id}">
              <span>إنشاء غرفة جماعية (بجوالات الجمهور)</span>
            </button>
          </div>
        </article>
      `;
    }).join('');

    rootEl.innerHTML = `
      <div class="events-hub">
        <div class="section-header">
          <div>
            <div class="eyebrow">
              <span class="eyebrow-dot" aria-hidden="true"></span>
              <span>ألعاب جماعية حية بأسلوب Kahoot و Slido</span>
            </div>
            <h1 id="events-heading" class="section-title">الفعاليات</h1>
            <p class="section-subtitle">
              ألعاب تفاعلية مصمّمة لورش العمل والملتقيات والمسارح: العبها مباشرة على شاشة العرض أو أنشئ غرفة حية برمز دخول يصوّت فيها الجمهور من جوالاتهم لحظياً.
            </p>
          </div>
          <a href="#home" class="btn btn-secondary" data-events-home-link>
            <span>العودة للرئيسية</span>
          </a>
        </div>

        <!-- شريط الانضمام السريع لغرفة فعالية (Slido / Kahoot PIN) -->
        <section class="event-join-banner" aria-labelledby="quick-join-heading">
          <div class="event-join-copy">
            <span class="event-join-tag">انضمام فوري للجمهور</span>
            <h2 id="quick-join-heading" class="event-join-title">عندك رمز غرفة فعالية؟ انضم الآن من جوالك!</h2>
            <p>أدخل رمز الغرفة المكوّن من 6 أرقام واسمك (أو اسم فريقك) للمشاركة في التصويت المباشر.</p>
          </div>
          <form id="quick-join-form" class="event-join-form" novalidate>
            <div class="event-join-fields">
              <div class="event-field">
                <label for="quick-join-code">رمز الغرفة (6 أرقام)</label>
                <input
                  type="text"
                  id="quick-join-code"
                  name="code"
                  inputmode="numeric"
                  pattern="[0-9]{6}"
                  maxlength="6"
                  placeholder="مثال: 482915"
                  autocomplete="off"
                  required
                >
              </div>
              <div class="event-field">
                <label for="quick-join-name">اسمك أو اسم الفريق</label>
                <input
                  type="text"
                  id="quick-join-name"
                  name="name"
                  minlength="2"
                  maxlength="26"
                  placeholder="مثال: فريق الإتاحة"
                  autocomplete="name"
                  required
                >
              </div>
              <button type="submit" class="btn btn-primary event-join-submit">انضم للفعالية</button>
            </div>
            <p id="quick-join-error" class="event-inline-error" role="alert" hidden></p>
          </form>
        </section>

        <!-- بطاقات الألعاب الجماعية -->
        <div class="event-games-grid" aria-label="ألعاب الفعاليات الجماعية">
          ${gamesHtml}
        </div>
      </div>
    `;

    rootEl.querySelectorAll('[data-launch-stage]').forEach((btn) => {
      btn.addEventListener('click', () => startStageGame(btn.dataset.launchStage, { pushHash: true }));
    });

    rootEl.querySelectorAll('[data-launch-host]').forEach((btn) => {
      btn.addEventListener('click', () => createAndOpenHostRoom(btn.dataset.launchHost));
    });

    const homeLink = rootEl.querySelector('[data-events-home-link]');
    if (homeLink) {
      homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#home';
      });
    }

    const joinForm = rootEl.querySelector('#quick-join-form');
    const codeInput = rootEl.querySelector('#quick-join-code');
    const nameInput = rootEl.querySelector('#quick-join-name');
    const errEl = rootEl.querySelector('#quick-join-error');
    if (joinForm) {
      joinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = (codeInput.value || '').replace(/\D/g, '').slice(0, 6);
        const name = (nameInput.value || '').trim();
        errEl.hidden = true;
        if (code.length !== 6) {
          errEl.textContent = 'يرجى إدخال رمز غرفة صحيح مكوّن من 6 أرقام.';
          errEl.hidden = false;
          codeInput.focus();
          return;
        }
        if (name.length < 2) {
          errEl.textContent = 'يرجى كتابة اسمك أو اسم الفريق (حرفان على الأقل).';
          errEl.hidden = false;
          nameInput.focus();
          return;
        }
        await joinLiveRoom(code, name, errEl);
      });
    }
  }

  /* ========================================================================
     2) وضع الشاشة الواحدة المباشر (Stage Mode — بدون جوالات)
     ======================================================================== */
  function startStageGame(gameId, { pushHash = true, totalRounds = 10 } = {}) {
    clearLiveTimersAndStreams();
    activeMode = 'stage';
    const meta = getGameMeta(gameId);
    const deck = buildRandomDeck(EVENTS_CHALLENGE_BANK.length);

    stageState = {
      gameId: meta.id,
      deck,
      roundIndex: 0,
      totalRounds:
        meta.id === 'ten-in-a-row'
          ? 10
          : meta.id === 'speed-blitz'
            ? EVENTS_CHALLENGE_BANK.length
            : totalRounds,
      correctCount: 0,
      wrongCount: 0,
      streak: 0,
      bestStreak: 0,
      attemptNumber: 1,
      revealed: false,
      chosenSide: null,
      lastCorrect: false,
      streakFailed: false,
      finished: false,
      wonTen: false,
      startedAt: Date.now(),
      blitzRemaining: 60,
    };

    if (pushHash) updateHashQuietly(`#events/stage/${meta.id}`);
    setBreadcrumbsFn([
      { label: 'الرئيسية', view: 'home', href: '#home' },
      { label: 'الفعاليات', view: 'events', href: '#events' },
      { label: meta.title },
    ]);

    if (meta.id === 'speed-blitz') {
      startStageBlitzTimer();
    }

    renderStageView();
    announceFn(`بدأت لعبة ${meta.title}`);
  }

  function startStageBlitzTimer() {
    clearStageTimers();
    countdownIntervalId = window.setInterval(() => {
      if (!stageState || activeMode !== 'stage' || stageState.gameId !== 'speed-blitz' || stageState.finished) {
        clearStageTimers();
        return;
      }
      stageState.blitzRemaining = Math.max(0, stageState.blitzRemaining - 1);
      const timerEl = rootEl && rootEl.querySelector('#stage-blitz-timer');
      if (timerEl) {
        timerEl.textContent = `${stageState.blitzRemaining} ث`;
        timerEl.classList.toggle('is-urgent', stageState.blitzRemaining <= 10);
      }
      if (stageState.blitzRemaining <= 0) {
        clearStageTimers();
        stageState.finished = true;
        renderStageView();
      }
    }, 1000);
  }

  function handleStagePick(side) {
    if (!stageState || stageState.revealed || stageState.finished) return;
    const card = stageState.deck[stageState.roundIndex];
    if (!card) return;

    const isCorrect = side === card.goodSide;
    stageState.revealed = true;
    stageState.chosenSide = side;
    stageState.lastCorrect = isCorrect;

    if (isCorrect) {
      stageState.correctCount += 1;
      stageState.streak += 1;
      if (stageState.streak > stageState.bestStreak) {
        stageState.bestStreak = stageState.streak;
      }
      stageState.streakFailed = false;
      if (stageState.gameId === 'ten-in-a-row' && stageState.streak >= 10) {
        stageState.wonTen = true;
        stageState.finished = true;
      }
    } else {
      stageState.wrongCount += 1;
      if (stageState.gameId === 'ten-in-a-row') {
        stageState.streakFailed = true;
      } else {
        stageState.streak = 0;
      }
    }

    renderStageView();
    const challenge = BANK_BY_ID.get(card.challengeId);
    announceFn(
      `${isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة.'} ${challenge ? challenge.shortReason : ''}`
    );
  }

  function advanceStageRound() {
    if (!stageState) return;
    if (stageState.gameId === 'ten-in-a-row' && stageState.streakFailed) {
      /* إعادة السلسلة من البداية بمحاولات غير محدودة وبطاقات جديدة */
      stageState.attemptNumber += 1;
      stageState.streak = 0;
      stageState.streakFailed = false;
      stageState.roundIndex = 0;
      stageState.deck = buildRandomDeck(EVENTS_CHALLENGE_BANK.length);
      stageState.revealed = false;
      stageState.chosenSide = null;
      renderStageView();
      announceFn(`بدأت المحاولة رقم ${stageState.attemptNumber} من الصفر!`);
      return;
    }

    const nextIdx = stageState.roundIndex + 1;
    if (nextIdx >= stageState.totalRounds || nextIdx >= stageState.deck.length) {
      if (stageState.gameId === 'speed-blitz' && stageState.blitzRemaining > 0) {
        stageState.deck = buildRandomDeck(EVENTS_CHALLENGE_BANK.length);
        stageState.roundIndex = 0;
      } else {
        stageState.finished = true;
        clearStageTimers();
      }
    } else {
      stageState.roundIndex = nextIdx;
    }
    stageState.revealed = false;
    stageState.chosenSide = null;
    renderStageView();
  }

  function renderStageView() {
    if (!stageState || !rootEl) return;
    const meta = getGameMeta(stageState.gameId);

    if (stageState.finished) {
      const elapsedSec = Math.max(1, Math.round((Date.now() - stageState.startedAt) / 1000));
      const totalAnswered = stageState.correctCount + stageState.wrongCount;
      const accuracy = totalAnswered > 0 ? Math.round((stageState.correctCount / totalAnswered) * 100) : 0;

      const headline =
        stageState.gameId === 'ten-in-a-row' && stageState.wonTen
          ? 'كفو! أتمّت المجموعة عشرة مرة وحدة بدون ولا خطأ!'
          : stageState.gameId === 'speed-blitz'
            ? `انتهى الوقت! اصطادت المجموعة ${stageState.correctCount} واجهة متاحة`
            : `انتهت جولات «${meta.title}»!`;

      rootEl.innerHTML = `
        <div class="event-stage-shell">
          <div class="event-stage-topbar">
            <div>
              <span class="event-mode-pill">وضع الشاشة الواحدة</span>
              <h1 id="events-heading" class="event-stage-title">${escapeHtml(meta.title)}</h1>
            </div>
            <button type="button" class="btn btn-secondary" id="stage-back-hub-btn">العودة للفعاليات</button>
          </div>

          <div class="event-finish-card">
            <div class="event-trophy-badge" aria-hidden="true">🏆</div>
            <h2 class="event-finish-title">${escapeHtml(headline)}</h2>
            <p class="event-finish-sub">
              ${
                stageState.gameId === 'ten-in-a-row'
                  ? `نجحتم في الوصول إلى 10 إجابات صحيحة متتالية في المحاولة رقم ${stageState.attemptNumber} خلال ${elapsedSec} ثانية.`
                  : `نتيجة جماعية رائعة تعزّز الوعي بمعايير الوصولية الرقمية WCAG 2.2.`
              }
            </p>

            <dl class="event-finish-stats">
              <div class="event-stat-box">
                <dt>${stageState.gameId === 'ten-in-a-row' ? 'السلسلة المكتملة' : 'الإجابات الصحيحة'}</dt>
                <dd>${stageState.gameId === 'ten-in-a-row' ? '10 / 10' : `${stageState.correctCount} / ${totalAnswered}`}</dd>
              </div>
              <div class="event-stat-box">
                <dt>${stageState.gameId === 'ten-in-a-row' ? 'عدد المحاولات' : 'نسبة الدقة'}</dt>
                <dd>${stageState.gameId === 'ten-in-a-row' ? stageState.attemptNumber : `${accuracy}%`}</dd>
              </div>
              <div class="event-stat-box">
                <dt>أطول سلسلة</dt>
                <dd>${stageState.bestStreak}</dd>
              </div>
            </dl>

            <div class="event-finish-actions">
              <button type="button" class="btn btn-primary" id="stage-replay-btn">لعب جولة جديدة ببطاقات مختلفة</button>
              <button type="button" class="btn btn-secondary" id="stage-switch-live-btn">تحويلها لغرفة جماعية (بجوالات الجمهور)</button>
              <button type="button" class="btn btn-secondary" id="stage-hub-btn-2">اختيار لعبة أخرى</button>
            </div>
          </div>
        </div>
      `;

      rootEl.querySelector('#stage-back-hub-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
      rootEl.querySelector('#stage-hub-btn-2')?.addEventListener('click', () => renderHub({ pushHash: true }));
      rootEl.querySelector('#stage-replay-btn')?.addEventListener('click', () =>
        startStageGame(stageState.gameId, { pushHash: false, totalRounds: stageState.totalRounds })
      );
      rootEl.querySelector('#stage-switch-live-btn')?.addEventListener('click', () =>
        createAndOpenHostRoom(stageState.gameId)
      );
      return;
    }

    const currentCard = stageState.deck[stageState.roundIndex];
    const challenge = BANK_BY_ID.get(currentCard.challengeId);
    markCardSeen(currentCard.challengeId);
    const correctSideAr = currentCard.goodSide === 'right' ? 'يمين' : 'يسار';

    /* صندوق النتيجة والسبب المختصر جداً — يظهر مباشرة أعلى الخيارين */
    let verdictBoxHtml = '';
    if (stageState.revealed) {
      const isTenFail = stageState.gameId === 'ten-in-a-row' && stageState.streakFailed;
      const nextBtnText = isTenFail
        ? `إعادة من البداية (محاولة رقم ${stageState.attemptNumber + 1}) ↻`
        : stageState.roundIndex + 1 >= stageState.totalRounds && stageState.gameId !== 'speed-blitz'
          ? 'عرض النتيجة النهائية'
          : 'الجولة التالية ←';

      verdictBoxHtml = `
        <div
          id="event-verdict-banner"
          class="event-verdict-banner ${stageState.lastCorrect ? 'is-correct' : 'is-wrong'}"
          role="status"
          aria-live="polite"
        >
          <div class="event-verdict-main">
            <div class="event-verdict-heading">
              <span class="event-verdict-icon" aria-hidden="true">${stageState.lastCorrect ? '✓' : '✕'}</span>
              <strong>
                ${
                  stageState.lastCorrect
                    ? `اختيار صحيح! «${correctSideAr}» هي الواجهة المتاحة`
                    : isTenFail
                      ? `اختيار خاطئ — انقطعت السلسلة عند ${stageState.streak}/10! الصحيح هو «${correctSideAr}»`
                      : `اختيار خاطئ — الواجهة المتاحة هي «${correctSideAr}»`
                }
              </strong>
            </div>
            <p class="event-verdict-reason">
              <span class="event-reason-tag">السبب:</span>
              ${escapeHtml(challenge.shortReason)}
            </p>
          </div>
          <button type="button" class="btn btn-primary event-next-btn" id="stage-next-btn">
            ${escapeHtml(nextBtnText)}
          </button>
        </div>
      `;
    }

    /* شريط المعلومات العلوي حسب نوع اللعبة */
    let hudPillsHtml = '';
    if (stageState.gameId === 'ten-in-a-row') {
      hudPillsHtml = `
        <span class="hud-pill hud-pill-step">المحاولة #${stageState.attemptNumber} (غير محدودة)</span>
        <span class="hud-pill hud-pill-streak">أفضل سلسلة: ${stageState.bestStreak} / 10</span>
      `;
    } else if (stageState.gameId === 'speed-blitz') {
      hudPillsHtml = `
        <span class="hud-pill hud-pill-timer ${stageState.blitzRemaining <= 10 ? 'is-urgent' : ''}" id="stage-blitz-timer">${stageState.blitzRemaining} ث</span>
        <span class="hud-pill hud-pill-score">صح: ${stageState.correctCount}</span>
        <span class="hud-pill hud-pill-streak">السلسلة: ${stageState.streak}</span>
      `;
    } else {
      hudPillsHtml = `
        <span class="hud-pill hud-pill-step">الجولة ${stageState.roundIndex + 1} من ${stageState.totalRounds}</span>
        <span class="hud-pill hud-pill-score">الصح: ${stageState.correctCount}</span>
        <span class="hud-pill hud-pill-streak">السلسلة: ${stageState.streak}</span>
      `;
    }

    const roundsPickerHtml =
      stageState.gameId === 'right-or-left' && stageState.roundIndex === 0 && !stageState.revealed
        ? `
          <div class="event-rounds-picker" role="group" aria-label="عدد الجولات">
            <span>عدد الجولات:</span>
            ${[8, 10, 15]
              .map(
                (n) => `
                  <button
                    type="button"
                    class="event-mini-chip ${stageState.totalRounds === n ? 'is-active' : ''}"
                    data-set-rounds="${n}"
                    aria-pressed="${stageState.totalRounds === n}"
                  >${n}</button>
                `
              )
              .join('')}
          </div>
        `
        : '';

    rootEl.innerHTML = `
      <div class="event-stage-shell">
        <div class="event-stage-topbar">
          <div>
            <div class="event-topbar-badges">
              <span class="event-mode-pill">وضع الشاشة الواحدة</span>
              <span class="event-topic-chip">${escapeHtml(challenge.topicAr)} • WCAG ${escapeHtml(challenge.wcagCode)}</span>
            </div>
            <h1 id="events-heading" class="event-stage-title">${escapeHtml(meta.title)}</h1>
          </div>
          <div class="event-topbar-actions">
            ${roundsPickerHtml}
            <button type="button" class="btn btn-secondary" id="stage-open-live-btn">تشغيل بغرفة جماعية</button>
            <button type="button" class="btn btn-secondary" id="stage-back-hub-btn">الفعاليات</button>
          </div>
        </div>

        <div class="event-arena-card">
          <div class="event-arena-hud">
            <div class="play-hud-pills">${hudPillsHtml}</div>
            <p class="event-kb-tip">يمكنك الاختيار بالنقر أو بسهمَي لوحة المفاتيح (يمين / يسار)</p>
          </div>

          ${
            stageState.gameId === 'ten-in-a-row'
              ? buildTenStreakTrackHtml(stageState.streak, stageState.streakFailed)
              : ''
          }

          <div class="event-question-head">
            <h2 class="event-question-prompt">${escapeHtml(challenge.prompt)}</h2>
          </div>

          ${verdictBoxHtml}

          ${buildRightLeftCardsHtml({
            challenge,
            goodSide: currentCard.goodSide,
            revealed: stageState.revealed,
            chosenSide: stageState.chosenSide,
            interactive: true,
            votesInfo: null,
          })}
        </div>
      </div>
    `;

    rootEl.querySelectorAll('[data-pick-side]').forEach((btn) => {
      btn.addEventListener('click', () => handleStagePick(btn.dataset.pickSide));
    });

    rootEl.querySelector('#stage-next-btn')?.addEventListener('click', advanceStageRound);
    rootEl.querySelector('#stage-back-hub-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
    rootEl.querySelector('#stage-open-live-btn')?.addEventListener('click', () =>
      createAndOpenHostRoom(stageState.gameId)
    );
    rootEl.querySelectorAll('[data-set-rounds]').forEach((btn) => {
      btn.addEventListener('click', () => {
        stageState.totalRounds = Number(btn.dataset.setRounds) || 10;
        renderStageView();
      });
    });

    if (stageState.revealed) {
      rootEl.querySelector('#stage-next-btn')?.focus();
    }
  }

  /* ========================================================================
     3) وضع الغرفة الجماعية الحية — شاشة المنسّق / العرض (Host Mode)
     ======================================================================== */
  async function createAndOpenHostRoom(gameId, { totalRounds = 10, timerSeconds = 20 } = {}) {
    clearLiveTimersAndStreams();
    activeMode = 'host';
    const meta = getGameMeta(gameId);
    const deck = buildRandomDeck(EVENTS_CHALLENGE_BANK.length);

    rootEl.innerHTML = `
      <div class="event-stage-shell">
        <div class="event-arena-card event-loading-card">
          <h1 id="events-heading" class="event-stage-title">جاري إنشاء غرفة «${escapeHtml(meta.title)}»...</h1>
          <p>نجهّز رمز الدخول والبث اللحظي لجوالات الجمهور.</p>
        </div>
      </div>
    `;

    try {
      const response = await fetch('/api/events/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: meta.id,
          totalRounds: meta.id === 'ten-in-a-row' ? 10 : totalRounds,
          timerSeconds: meta.id === 'speed-blitz' ? 60 : timerSeconds,
          deck,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'تعذّر إنشاء الغرفة.');
      }
      const data = await response.json();
      liveHostState = {
        code: data.code,
        hostToken: data.hostToken,
        room: data.room,
        showLiveQr: false,
      };
      try {
        sessionStorage.setItem(`event_host_${data.code}`, data.hostToken);
      } catch {
        /* تجاهل */
      }

      updateHashQuietly(`#events/host/${data.code}`);
      setBreadcrumbsFn([
        { label: 'الرئيسية', view: 'home', href: '#home' },
        { label: 'الفعاليات', view: 'events', href: '#events' },
        { label: `${meta.title} (غرفة ${data.code})` },
      ]);

      subscribeRoomStream(data.code, (room) => {
        if (!liveHostState || liveHostState.code !== room.code) return;
        liveHostState.room = room;
        renderHostView();
      });
      renderHostView();
      announceFn(`تم إنشاء غرفة فعالية برمز ${data.code}`);
    } catch (error) {
      rootEl.innerHTML = `
        <div class="event-stage-shell">
          <div class="event-arena-card event-loading-card">
            <h1 id="events-heading" class="event-stage-title">تعذّر إنشاء الغرفة الحية</h1>
            <p>${escapeHtml(error.message || 'تأكّد من تشغيل الخادم ثم أعد المحاولة.')}</p>
            <div class="event-finish-actions">
              <button type="button" class="btn btn-primary" id="fallback-stage-btn">تشغيل مباشر على الشاشة بدلاً من ذلك</button>
              <button type="button" class="btn btn-secondary" id="fallback-hub-btn">العودة للفعاليات</button>
            </div>
          </div>
        </div>
      `;
      rootEl.querySelector('#fallback-stage-btn')?.addEventListener('click', () => startStageGame(meta.id));
      rootEl.querySelector('#fallback-hub-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
    }
  }

  async function resumeHostRoom(code) {
    let savedToken = '';
    try {
      savedToken = sessionStorage.getItem(`event_host_${code}`) || '';
    } catch {
      /* تجاهل */
    }
    if (!savedToken) {
      openJoinPromptForCode(code);
      return;
    }

    clearLiveTimersAndStreams();
    activeMode = 'host';
    try {
      const response = await fetch(`/api/events/rooms/${code}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('الغرفة غير متوفرة');
      const data = await response.json();
      liveHostState = {
        code,
        hostToken: savedToken,
        room: data.room,
        showLiveQr: false,
      };
      const meta = getGameMeta(data.room.gameType);
      setBreadcrumbsFn([
        { label: 'الرئيسية', view: 'home', href: '#home' },
        { label: 'الفعاليات', view: 'events', href: '#events' },
        { label: `${meta.title} (غرفة ${code})` },
      ]);
      subscribeRoomStream(code, (room) => {
        if (!liveHostState || liveHostState.code !== room.code) return;
        liveHostState.room = room;
        renderHostView();
      });
      renderHostView();
    } catch {
      renderHub({ pushHash: true });
    }
  }

  function subscribeRoomStream(code, onUpdate) {
    if (sseSource) {
      try {
        sseSource.close();
      } catch {
        /* تجاهل */
      }
      sseSource = null;
    }
    if (pollIntervalId !== null) {
      window.clearInterval(pollIntervalId);
      pollIntervalId = null;
    }

    if (typeof window.EventSource === 'function') {
      const es = new EventSource(`/api/events/rooms/${code}/stream`);
      sseSource = es;
      es.onmessage = (event) => {
        try {
          const room = JSON.parse(event.data);
          onUpdate(room);
        } catch {
          /* تجاهل */
        }
      };
    }

    /* تحديث احتياطي دوري كل 4 ثوانٍ في حال انقطع البث مؤقتاً */
    pollIntervalId = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/events/rooms/${code}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.room) onUpdate(data.room);
        }
      } catch {
        /* تجاهل */
      }
    }, 4000);
  }

  async function sendHostAction(action, extra = {}) {
    if (!liveHostState) return;
    try {
      const response = await fetch(`/api/events/rooms/${liveHostState.code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostToken: liveHostState.hostToken,
          action,
          ...extra,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.room) {
          liveHostState.room = data.room;
          renderHostView();
        }
      }
    } catch {
      /* تجاهل */
    }
  }

  function startHostBlitzCountdownIfNeeded(room) {
    if (countdownIntervalId !== null) {
      window.clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }
    if (room.gameType !== 'speed-blitz' || !room.blitzEndsAt || room.status === 'finished' || room.status === 'lobby') {
      return;
    }
    const tick = () => {
      if (!liveHostState || activeMode !== 'host') return;
      const rem = Math.max(0, Math.ceil((room.blitzEndsAt - Date.now()) / 1000));
      const el = rootEl && rootEl.querySelector('#host-blitz-timer');
      if (el) {
        el.textContent = `${rem} ث`;
        el.classList.toggle('is-urgent', rem <= 10);
      }
      if (rem <= 0) {
        window.clearInterval(countdownIntervalId);
        countdownIntervalId = null;
        sendHostAction('finish');
      }
    };
    tick();
    countdownIntervalId = window.setInterval(tick, 1000);
  }

  function buildPodiumAndListHtml(players) {
    if (!players || players.length === 0) {
      return '<p class="event-empty-players">لم ينضم مشاركون بجوالاتهم في هذه الجلسة.</p>';
    }
    const top3 = players.slice(0, 3);
    const medals = ['😎', '😤', '😅'];
    const podiumHtml = `
      <div class="event-podium" aria-label="منصة الفائزين">
        ${top3
          .map(
            (p, idx) => `
              <div class="podium-card podium-rank-${idx + 1}">
                <span class="podium-medal" aria-hidden="true">${medals[idx]}</span>
                <strong class="podium-name">${escapeHtml(p.name)}</strong>
                <span class="podium-score">${p.score} نقطة</span>
                <span class="podium-meta">${p.correctCount} إجابة صح</span>
              </div>
            `
          )
          .join('')}
      </div>
    `;

    const restRows = players
      .map(
        (p, idx) => `
          <tr>
            <td class="cell-rank" data-label="المركز">#${idx + 1}</td>
            <td class="cell-player" data-label="المشارك / الفريق"><span class="player-name-wrap">${idx < 3 ? `<span class="player-medal" aria-hidden="true">${medals[idx]}</span>` : ''}<strong>${escapeHtml(p.name)}</strong></span></td>
            <td data-label="النقاط">${p.score}</td>
            <td data-label="إجابات صحيحة">${p.correctCount}</td>
          </tr>
        `
      )
      .join('');

    return `
      ${podiumHtml}
      <div class="table-responsive event-live-table-wrap">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th scope="col">المركز</th>
              <th scope="col">المشارك / الفريق</th>
              <th scope="col">النقاط</th>
              <th scope="col">إجابات صحيحة</th>
            </tr>
          </thead>
          <tbody>${restRows}</tbody>
        </table>
      </div>
    `;
  }

  function renderHostView() {
    if (!liveHostState || !rootEl) return;
    const room = liveHostState.room;
    const meta = getGameMeta(room.gameType);
    const joinUrl = buildJoinUrl(room.code);
    startHostBlitzCountdownIfNeeded(room);

    /* 1) غرفة الانتظار (Lobby) */
    if (room.status === 'lobby') {
      const playersChips =
        room.players.length > 0
          ? room.players
              .map((p) => `<li class="event-player-chip">${escapeHtml(p.name)}</li>`)
              .join('')
          : '<li class="event-player-empty">بانتظار انضمام المشاركين من جوالاتهم... (أو يمكنك البدء فوراً!)</li>';

      rootEl.innerHTML = `
        <div class="event-stage-shell">
          <div class="event-stage-topbar">
            <div>
              <span class="event-mode-pill is-live">غرفة جماعية حية • Kahoot / Slido</span>
              <h1 id="events-heading" class="event-stage-title">${escapeHtml(meta.title)}</h1>
            </div>
            <button type="button" class="btn btn-secondary" id="host-exit-btn">إنهاء والعودة للفعاليات</button>
          </div>

          <div class="event-lobby-card">
            <div class="event-lobby-grid">
              <div class="event-pin-box">
                <span class="event-pin-label">امسح رمز QR أو أدخل رمز الغرفة (PIN)</span>
                <div class="event-qr-pin-row">
                  <div class="event-qr-frame">
                    ${buildQrMarkup(joinUrl, 196)}
                    <span class="event-qr-caption">وجّه كاميرا الجوال للمسح</span>
                  </div>
                  <div class="event-pin-side">
                    <span class="event-pin-sub">رمز الغرفة (6 أرقام)</span>
                    <div class="event-pin-code" aria-label="رمز الغرفة ${room.code.split('').join(' ')}">${escapeHtml(room.code)}</div>
                    <p class="event-pin-hint">يمكن للجمهور المسح مباشرة أو الدخول لقسم <strong>الفعاليات</strong> وكتابة هذا الرمز.</p>
                  </div>
                </div>
                <div class="event-link-row">
                  <code class="event-join-url" dir="ltr">${escapeHtml(joinUrl)}</code>
                  <button type="button" class="btn btn-secondary" id="host-copy-link-btn">نسخ الرابط</button>
                </div>
                <p id="host-copy-status" class="event-copy-ok" aria-live="polite" hidden></p>
              </div>

              <div class="event-lobby-roster">
                <div class="event-roster-head">
                  <h2>المشاركون المنضمّون</h2>
                  <span class="hud-pill hud-pill-step">${room.playerCount} مشارك</span>
                </div>
                <ul class="event-players-list" aria-live="polite">${playersChips}</ul>
                <div class="event-lobby-cta">
                  <button type="button" class="btn btn-primary event-start-big-btn" id="host-start-btn">
                    <span>ابدأ الفعالية الآن!</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      rootEl.querySelector('#host-exit-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
      rootEl.querySelector('#host-start-btn')?.addEventListener('click', () => sendHostAction('start'));
      rootEl.querySelector('#host-copy-link-btn')?.addEventListener('click', async () => {
        const status = rootEl.querySelector('#host-copy-status');
        try {
          await navigator.clipboard.writeText(joinUrl);
          if (status) {
            status.textContent = 'تم نسخ رابط الانضمام المباشر ✓ شاركه مع الجمهور الآن.';
            status.hidden = false;
          }
        } catch {
          if (status) {
            status.textContent = `الرابط: ${joinUrl}`;
            status.hidden = false;
          }
        }
      });
      return;
    }

    /* 2) شاشة النهاية ومنصة الفائزين (Finished) */
    if (room.status === 'finished') {
      const headline =
        room.gameType === 'ten-in-a-row' && room.won
          ? 'إنجاز جماعي رائع! أتمّت المجموعة عشرة مرة وحدة!'
          : room.gameType === 'speed-blitz'
            ? `انتهت الـ 60 ثانية! أصابت المجموعة ${room.groupCorrectTotal} جولة`
            : `النتائج النهائية — ${meta.title}`;

      rootEl.innerHTML = `
        <div class="event-stage-shell">
          <div class="event-stage-topbar">
            <div>
              <span class="event-mode-pill is-live">غرفة ${escapeHtml(room.code)} • اكتملت</span>
              <h1 id="events-heading" class="event-stage-title">${escapeHtml(headline)}</h1>
            </div>
            <button type="button" class="btn btn-secondary" id="host-exit-btn">العودة للفعاليات</button>
          </div>

          <div class="event-finish-card">
            <div class="event-trophy-badge" aria-hidden="true">🏆</div>
            <p class="event-finish-sub">
              ${
                room.gameType === 'ten-in-a-row'
                  ? `وصلتم إلى 10/10 متتالية في المحاولة رقم ${room.attemptNumber} بمشاركة ${room.playerCount} مشارك.`
                  : `إجمالي إجابات الأغلبية الصحيحة: ${room.groupCorrectTotal} • عدد المشاركين: ${room.playerCount}`
              }
            </p>
            ${buildPodiumAndListHtml(room.players)}
            <div class="event-finish-actions">
              <button type="button" class="btn btn-primary" id="host-restart-btn">جولة جديدة بنفس الغرفة (${escapeHtml(room.code)})</button>
              <button type="button" class="btn btn-secondary" id="host-new-game-btn">اختيار لعبة أخرى</button>
            </div>
          </div>
        </div>
      `;

      rootEl.querySelector('#host-exit-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
      rootEl.querySelector('#host-new-game-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
      rootEl.querySelector('#host-restart-btn')?.addEventListener('click', () =>
        sendHostAction('restart', { deck: buildRandomDeck(EVENTS_CHALLENGE_BANK.length) })
      );
      return;
    }

    /* 3) شاشة الجولة الحية (Question / Revealed) */
    const currentCard = room.currentCard;
    const challenge = currentCard ? BANK_BY_ID.get(currentCard.challengeId) : null;
    if (!challenge) return;
    markCardSeen(currentCard.challengeId);

    const isRevealed = room.status === 'revealed';
    const outcome = room.lastOutcome;
    const correctSideAr = currentCard.goodSide === 'right' ? 'يمين' : 'يسار';

    let verdictBoxHtml = '';
    if (isRevealed && outcome) {
      const isTenFail = room.gameType === 'ten-in-a-row' && room.streakFailed;
      let statusLine = '';
      if (outcome.groupChoice === 'none') {
        statusLine = `لم تُسجّل أصوات — الواجهة المتاحة هي «${correctSideAr}»`;
      } else if (outcome.groupChoice === 'tie') {
        statusLine = `تعادل الأصوات! الواجهة المتاحة هي «${correctSideAr}»`;
      } else if (outcome.isGroupCorrect) {
        statusLine = `أحسنت المجموعة! اختيار الأغلبية («${correctSideAr}») صحيح ✓`;
      } else if (isTenFail) {
        statusLine = `انقطعت السلسلة عند ${room.streak}/10! الأغلبية اختارت خطأ — الصحيح هو «${correctSideAr}»`;
      } else {
        statusLine = `اختيار الأغلبية خاطئ ✕ — الواجهة المتاحة هي «${correctSideAr}»`;
      }

      const nextLabel = isTenFail
        ? `إعادة من البداية (محاولة رقم ${room.attemptNumber + 1}) ↻`
        : room.roundIndex + 1 >= room.totalRounds && room.gameType !== 'speed-blitz'
          ? 'عرض منصة الفائزين 🏆'
          : 'الجولة التالية ←';

      verdictBoxHtml = `
        <div
          id="event-verdict-banner"
          class="event-verdict-banner ${outcome.isGroupCorrect ? 'is-correct' : 'is-wrong'}"
          role="status"
          aria-live="polite"
        >
          <div class="event-verdict-main">
            <div class="event-verdict-heading">
              <span class="event-verdict-icon" aria-hidden="true">${outcome.isGroupCorrect ? '✓' : '✕'}</span>
              <strong>${escapeHtml(statusLine)}</strong>
            </div>
            <p class="event-verdict-reason">
              <span class="event-reason-tag">السبب:</span>
              ${escapeHtml(challenge.shortReason)}
            </p>
          </div>
          <button type="button" class="btn btn-primary event-next-btn" id="host-next-btn">
            ${escapeHtml(nextLabel)}
          </button>
        </div>
      `;
    }

    const blitzRem =
      room.gameType === 'speed-blitz' && room.blitzEndsAt
        ? Math.max(0, Math.ceil((room.blitzEndsAt - Date.now()) / 1000))
        : 60;

    let hudPillsHtml = `<span class="hud-pill hud-pill-pin">PIN: ${escapeHtml(room.code)}</span>`;
    if (room.gameType === 'ten-in-a-row') {
      hudPillsHtml += `
        <span class="hud-pill hud-pill-step">المحاولة #${room.attemptNumber} (غير محدودة)</span>
        <span class="hud-pill hud-pill-streak">أفضل سلسلة: ${room.bestStreak}/10</span>
      `;
    } else if (room.gameType === 'speed-blitz') {
      hudPillsHtml += `
        <span class="hud-pill hud-pill-timer" id="host-blitz-timer">${blitzRem} ث</span>
        <span class="hud-pill hud-pill-score">صح: ${room.groupCorrectTotal}</span>
      `;
    } else {
      hudPillsHtml += `
        <span class="hud-pill hud-pill-step">الجولة ${room.roundIndex + 1} من ${room.totalRounds}</span>
        <span class="hud-pill hud-pill-score">صح جماعي: ${room.groupCorrectTotal}</span>
      `;
    }
    hudPillsHtml += `<span class="hud-pill hud-pill-votes">الأصوات: ${room.votesCount} / ${room.playerCount}</span>`;

    rootEl.innerHTML = `
      <div class="event-stage-shell">
        <div class="event-stage-topbar">
          <div>
            <div class="event-topbar-badges">
              <span class="event-mode-pill is-live">غرفة حية • ${room.playerCount} مشارك</span>
              <span class="event-topic-chip">${escapeHtml(challenge.topicAr)} • WCAG ${escapeHtml(challenge.wcagCode)}</span>
            </div>
            <h1 id="events-heading" class="event-stage-title">${escapeHtml(meta.title)}</h1>
          </div>
          <div class="event-topbar-actions">
            <button
              type="button"
              class="btn btn-secondary"
              id="host-toggle-qr-btn"
              aria-expanded="${Boolean(liveHostState.showLiveQr)}"
              aria-controls="host-live-qr-panel"
            >
              ${liveHostState.showLiveQr ? 'إخفاء رمز QR' : 'رمز QR للانضمام'}
            </button>
            ${
              !isRevealed
                ? `<button type="button" class="btn btn-primary" id="host-reveal-btn">إظهار النتيجة والتصويت</button>`
                : ''
            }
            <button type="button" class="btn btn-secondary" id="host-finish-now-btn">إنهاء</button>
          </div>
        </div>

        <div id="host-live-qr-panel" class="event-live-qr-panel" ${liveHostState.showLiveQr ? '' : 'hidden'}>
          <div class="event-qr-frame is-compact">
            ${buildQrMarkup(joinUrl, 148)}
          </div>
          <div class="event-live-qr-info">
            <strong>انضم الآن في أي لحظة!</strong>
            <p>امسح رمز QR بكاميرا الجوال أو أدخل رمز الغرفة: <span class="event-inline-pin">${escapeHtml(room.code)}</span></p>
            <code class="event-join-url" dir="ltr">${escapeHtml(joinUrl)}</code>
          </div>
        </div>

        <div class="event-arena-card">
          <div class="event-arena-hud">
            <div class="play-hud-pills">${hudPillsHtml}</div>
            ${
              !isRevealed
                ? `<div class="event-host-manual-picks">
                     <span>أو اختر قرار القاعة مباشرة:</span>
                     <button type="button" class="event-mini-chip" data-host-manual="right">يمين ➡</button>
                     <button type="button" class="event-mini-chip" data-host-manual="left">⬅ يسار</button>
                   </div>`
                : ''
            }
          </div>

          ${
            room.gameType === 'ten-in-a-row'
              ? buildTenStreakTrackHtml(room.streak, room.streakFailed)
              : ''
          }

          <div class="event-question-head">
            <h2 class="event-question-prompt">${escapeHtml(challenge.prompt)}</h2>
          </div>

          ${verdictBoxHtml}

          ${buildRightLeftCardsHtml({
            challenge,
            goodSide: currentCard.goodSide,
            revealed: isRevealed,
            chosenSide: outcome ? outcome.groupChoice : null,
            interactive: false,
            votesInfo: isRevealed ? room.votes : null,
          })}
        </div>
      </div>
    `;

    rootEl.querySelector('#host-toggle-qr-btn')?.addEventListener('click', () => {
      liveHostState.showLiveQr = !liveHostState.showLiveQr;
      renderHostView();
    });
    rootEl.querySelector('#host-reveal-btn')?.addEventListener('click', () => sendHostAction('reveal'));
    rootEl.querySelectorAll('[data-host-manual]').forEach((btn) => {
      btn.addEventListener('click', () =>
        sendHostAction('reveal', { manualSide: btn.dataset.hostManual })
      );
    });
    rootEl.querySelector('#host-next-btn')?.addEventListener('click', () => {
      if (room.gameType === 'ten-in-a-row' && room.streakFailed) {
        sendHostAction('reset-streak', { deck: buildRandomDeck(EVENTS_CHALLENGE_BANK.length) });
      } else {
        sendHostAction('next');
      }
    });
    rootEl.querySelector('#host-finish-now-btn')?.addEventListener('click', () => sendHostAction('finish'));
  }

  /* ========================================================================
     4) شاشة المشارك من الجوال (Participant Mobile Controller)
     ======================================================================== */
  function openJoinPromptForCode(code) {
    clearLiveTimersAndStreams();
    activeMode = 'join';

    /* محاولة استعادة الجلسة إذا كان المشارك قد انضم سابقاً لنفس الغرفة */
    try {
      const saved = sessionStorage.getItem(`event_player_${code}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.playerId && parsed.name) {
          resumePlayerRoom(code, parsed.playerId, parsed.name);
          return;
        }
      }
    } catch {
      /* تجاهل */
    }

    setBreadcrumbsFn([
      { label: 'الرئيسية', view: 'home', href: '#home' },
      { label: 'الفعاليات', view: 'events', href: '#events' },
      { label: `الانضمام لغرفة ${code}` },
    ]);

    rootEl.innerHTML = `
      <div class="event-stage-shell event-player-shell">
        <div class="event-arena-card event-player-join-card">
          <span class="event-mode-pill is-live">غرفة فعالية • PIN ${escapeHtml(code)}</span>
          <h1 id="events-heading" class="event-stage-title">انضم للفعالية الجماعية</h1>
          <p class="section-subtitle">أدخل اسمك (أو اسم فريقك) للمشاركة الفورية في التصويت من جهازك.</p>
          <form id="direct-join-form" class="event-direct-join-form" novalidate>
            <div class="event-field">
              <label for="direct-join-name">الاسم الظاهر في الغرفة</label>
              <input
                type="text"
                id="direct-join-name"
                minlength="2"
                maxlength="26"
                placeholder="مثال: نورة أو فريق التميّز"
                autocomplete="name"
                required
              >
            </div>
            <p id="direct-join-err" class="event-inline-error" role="alert" hidden></p>
            <div class="event-finish-actions">
              <button type="submit" class="btn btn-primary">دخول الغرفة الآن</button>
              <button type="button" class="btn btn-secondary" id="direct-join-back">العودة للفعاليات</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = rootEl.querySelector('#direct-join-form');
    const nameInput = rootEl.querySelector('#direct-join-name');
    const errEl = rootEl.querySelector('#direct-join-err');
    nameInput?.focus();
    rootEl.querySelector('#direct-join-back')?.addEventListener('click', () => renderHub({ pushHash: true }));
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (nameInput.value || '').trim();
      errEl.hidden = true;
      if (name.length < 2) {
        errEl.textContent = 'يرجى كتابة اسم لا يقل عن حرفين.';
        errEl.hidden = false;
        return;
      }
      await joinLiveRoom(code, name, errEl);
    });
  }

  async function resumePlayerRoom(code, playerId, name) {
    try {
      const res = await fetch(`/api/events/rooms/${code}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const stillInRoom = data.room.players.some((p) => p.id === playerId);
      if (!stillInRoom) {
        await joinLiveRoom(code, name, null);
        return;
      }
      livePlayerState = {
        code,
        playerId,
        name,
        room: data.room,
        myVote: null,
        myVoteKey: '',
        showImagesOnPhone: false,
      };
      activeMode = 'join';
      subscribeRoomStream(code, (room) => {
        if (!livePlayerState || livePlayerState.code !== room.code) return;
        livePlayerState.room = room;
        renderPlayerView();
      });
      renderPlayerView();
    } catch {
      openJoinPromptForCode(code);
    }
  }

  async function joinLiveRoom(code, name, errEl) {
    try {
      const response = await fetch(`/api/events/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (errEl) {
          errEl.textContent = data.error || 'تعذّر الانضمام للغرفة — تأكّد من رمز الغرفة.';
          errEl.hidden = false;
        }
        return;
      }

      livePlayerState = {
        code,
        playerId: data.playerId,
        name: data.name,
        room: data.room,
        myVote: null,
        myVoteKey: '',
        showImagesOnPhone: false,
      };
      activeMode = 'join';
      try {
        sessionStorage.setItem(
          `event_player_${code}`,
          JSON.stringify({ playerId: data.playerId, name: data.name })
        );
      } catch {
        /* تجاهل */
      }

      updateHashQuietly(`#events/join/${code}`);
      const meta = getGameMeta(data.room.gameType);
      setBreadcrumbsFn([
        { label: 'الرئيسية', view: 'home', href: '#home' },
        { label: 'الفعاليات', view: 'events', href: '#events' },
        { label: `${meta.title} (مشارك)` },
      ]);

      subscribeRoomStream(code, (room) => {
        if (!livePlayerState || livePlayerState.code !== room.code) return;
        livePlayerState.room = room;
        renderPlayerView();
      });
      renderPlayerView();
      announceFn(`تم انضمامك لغرفة ${meta.title} بنجاح`);
    } catch {
      if (errEl) {
        errEl.textContent = 'تعذّر الاتصال بالخادم حالياً.';
        errEl.hidden = false;
      }
    }
  }

  async function submitPlayerVote(side) {
    if (!livePlayerState) return;
    const room = livePlayerState.room;
    if (room.status !== 'question') return;
    const voteKey = `${room.attemptNumber}-${room.roundIndex}`;
    livePlayerState.myVote = side;
    livePlayerState.myVoteKey = voteKey;
    renderPlayerView();

    try {
      await fetch(`/api/events/rooms/${livePlayerState.code}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: livePlayerState.playerId,
          side,
        }),
      });
      announceFn(`تم تسجيل تصويتك: ${side === 'right' ? 'يمين' : 'يسار'}`);
    } catch {
      /* تجاهل */
    }
  }

  function renderPlayerView() {
    if (!livePlayerState || !rootEl) return;
    const room = livePlayerState.room;
    const meta = getGameMeta(room.gameType);
    const me = room.players.find((p) => p.id === livePlayerState.playerId);
    const myRank = me ? room.players.findIndex((p) => p.id === me.id) + 1 : '-';
    const currentVoteKey = `${room.attemptNumber}-${room.roundIndex}`;
    const myVoteForRound = livePlayerState.myVoteKey === currentVoteKey ? livePlayerState.myVote : null;

    if (room.status === 'lobby') {
      rootEl.innerHTML = `
        <div class="event-stage-shell event-player-shell">
          <div class="event-arena-card event-player-wait-card">
            <span class="event-mode-pill is-live">متصل بالغرفة • PIN ${escapeHtml(room.code)}</span>
            <h1 id="events-heading" class="event-stage-title">أهلاً بك يا ${escapeHtml(livePlayerState.name)}!</h1>
            <p class="section-subtitle">أنت الآن داخل لعبة <strong>«${escapeHtml(meta.title)}»</strong> — بانتظار المنسّق ليبدأ الجولة الأولى.</p>
            <div class="play-hud-pills">
              <span class="hud-pill hud-pill-step">المشاركون حالياً: ${room.playerCount}</span>
            </div>
            <button type="button" class="btn btn-secondary" id="player-leave-btn">مغادرة الغرفة</button>
          </div>
        </div>
      `;
      rootEl.querySelector('#player-leave-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
      return;
    }

    if (room.status === 'finished') {
      rootEl.innerHTML = `
        <div class="event-stage-shell event-player-shell">
          <div class="event-finish-card">
            <div class="event-trophy-badge" aria-hidden="true">🎉</div>
            <h1 id="events-heading" class="event-finish-title">انتهت الفعالية — ${escapeHtml(meta.title)}</h1>
            <p class="event-finish-sub">
              مركزك: <strong>#${myRank}</strong> • نقاطك: <strong>${me ? me.score : 0}</strong> • إجاباتك الصحيحة: <strong>${me ? me.correctCount : 0}</strong>
            </p>
            ${buildPodiumAndListHtml(room.players)}
            <div class="event-finish-actions">
              <button type="button" class="btn btn-secondary" id="player-leave-btn">العودة للفعاليات</button>
            </div>
          </div>
        </div>
      `;
      rootEl.querySelector('#player-leave-btn')?.addEventListener('click', () => renderHub({ pushHash: true }));
      return;
    }

    const currentCard = room.currentCard;
    const challenge = currentCard ? BANK_BY_ID.get(currentCard.challengeId) : null;
    if (!challenge) return;
    markCardSeen(currentCard.challengeId);
    const isRevealed = room.status === 'revealed';
    const didIGetRight = isRevealed && myVoteForRound === currentCard.goodSide;
    const correctSideAr = currentCard.goodSide === 'right' ? 'يمين' : 'يسار';

    let playerFeedbackHtml = '';
    if (isRevealed) {
      playerFeedbackHtml = `
        <div class="event-verdict-banner ${didIGetRight ? 'is-correct' : 'is-wrong'}" role="status" aria-live="polite">
          <div class="event-verdict-main">
            <div class="event-verdict-heading">
              <span class="event-verdict-icon" aria-hidden="true">${didIGetRight ? '✓' : '✕'}</span>
              <strong>
                ${
                  !myVoteForRound
                    ? `لم تصوّت في هذه الجولة — الصحيح هو «${correctSideAr}»`
                    : didIGetRight
                      ? `إجابتك صحيحة! «${correctSideAr}» هي المتاحة`
                      : `إجابتك خاطئة — المتاحة هي «${correctSideAr}»`
                }
              </strong>
            </div>
            <p class="event-verdict-reason">
              <span class="event-reason-tag">السبب:</span>
              ${escapeHtml(challenge.shortReason)}
            </p>
          </div>
        </div>
      `;
    }

    rootEl.innerHTML = `
      <div class="event-stage-shell event-player-shell">
        <div class="event-arena-card">
          <div class="event-arena-hud">
            <div class="play-hud-pills">
              <span class="hud-pill hud-pill-step">${escapeHtml(livePlayerState.name)}</span>
              <span class="hud-pill hud-pill-score">نقاطك: ${me ? me.score : 0}</span>
              <span class="hud-pill hud-pill-streak">مركزك: #${myRank}</span>
            </div>
            <button type="button" class="event-mini-chip ${livePlayerState.showImagesOnPhone ? 'is-active' : ''}" id="toggle-phone-images">
              ${livePlayerState.showImagesOnPhone ? 'إخفاء الواجهتين' : 'عرض الواجهتين على جوالي'}
            </button>
          </div>

          ${
            room.gameType === 'ten-in-a-row'
              ? buildTenStreakTrackHtml(room.streak, room.streakFailed)
              : ''
          }

          <h1 id="events-heading" class="event-question-prompt">${escapeHtml(challenge.prompt)}</h1>

          ${playerFeedbackHtml}

          ${
            !isRevealed
              ? `
                <div class="event-mobile-vote-grid" role="group" aria-label="اختر يمين أو يسار">
                  <button
                    type="button"
                    class="event-vote-big-btn is-right ${myVoteForRound === 'right' ? 'is-selected' : ''}"
                    data-vote-side="right"
                    aria-pressed="${myVoteForRound === 'right'}"
                  >
                    <span class="vote-big-arrow" aria-hidden="true">➡</span>
                    <span>يمين</span>
                  </button>
                  <button
                    type="button"
                    class="event-vote-big-btn is-left ${myVoteForRound === 'left' ? 'is-selected' : ''}"
                    data-vote-side="left"
                    aria-pressed="${myVoteForRound === 'left'}"
                  >
                    <span class="vote-big-arrow" aria-hidden="true">⬅</span>
                    <span>يسار</span>
                  </button>
                </div>
                <p class="event-vote-status" aria-live="polite">
                  ${
                    myVoteForRound
                      ? `تم تسجيل اختيارك: «${myVoteForRound === 'right' ? 'يمين' : 'يسار'}» ✓ بانتظار المنسّق لإظهار النتيجة...`
                      : 'اضغط على «يمين» أو «يسار» للتصويت الآن!'
                  }
                </p>
              `
              : `<p class="event-vote-status">بانتظار انتقال المنسّق للجولة التالية...</p>`
          }

          ${
            livePlayerState.showImagesOnPhone
              ? buildRightLeftCardsHtml({
                  challenge,
                  goodSide: currentCard.goodSide,
                  revealed: isRevealed,
                  chosenSide: myVoteForRound,
                  interactive: false,
                  votesInfo: isRevealed ? room.votes : null,
                })
              : ''
          }
        </div>
      </div>
    `;

    rootEl.querySelectorAll('[data-vote-side]').forEach((btn) => {
      btn.addEventListener('click', () => submitPlayerVote(btn.dataset.voteSide));
    });
    rootEl.querySelector('#toggle-phone-images')?.addEventListener('click', () => {
      livePlayerState.showImagesOnPhone = !livePlayerState.showImagesOnPhone;
      renderPlayerView();
    });
  }

  /* دعم اختصارات لوحة المفاتيح لوضع الشاشة الواحدة (سهم يمين / سهم يسار / Enter) */
  function bindGlobalKeyboardShortcuts() {
    if (keydownBound) return;
    keydownBound = true;
    document.addEventListener('keydown', (event) => {
      const eventsSection = document.getElementById('events-view');
      if (!eventsSection || eventsSection.hidden) return;
      if (activeMode !== 'stage' || !stageState || stageState.finished) return;
      const tag = (event.target && event.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (!stageState.revealed) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleStagePick('right');
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handleStagePick('left');
        }
      } else if (event.key === 'Enter') {
        if (tag !== 'BUTTON') {
          event.preventDefault();
          advanceStageRound();
        }
      }
    });
  }

  /* واجهة الربط مع app.js */
  window.EventsModule = {
    init({ container, announce, renderBreadcrumbs }) {
      rootEl = container;
      if (typeof announce === 'function') announceFn = announce;
      if (typeof renderBreadcrumbs === 'function') setBreadcrumbsFn = renderBreadcrumbs;
      bindGlobalKeyboardShortcuts();
    },
    openRoute(subPath = '') {
      if (!rootEl) return;
      const clean = String(subPath || '').replace(/^\/+/, '');
      if (clean.startsWith('stage/')) {
        const gameId = clean.slice('stage/'.length);
        startStageGame(gameId, { pushHash: false });
        return;
      }
      if (clean.startsWith('host/')) {
        const code = clean.slice('host/'.length).replace(/\D/g, '').slice(0, 6);
        if (code.length === 6) {
          resumeHostRoom(code);
          return;
        }
      }
      if (clean.startsWith('join/')) {
        const code = clean.slice('join/'.length).replace(/\D/g, '').slice(0, 6);
        if (code.length === 6) {
          openJoinPromptForCode(code);
          return;
        }
      }
      renderHub({ pushHash: false });
    },
    cleanup() {
      clearLiveTimersAndStreams();
    },
  };
})();
