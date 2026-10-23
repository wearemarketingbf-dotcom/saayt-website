// Feature pages copy (AR/EN). House style: no full stop at line ends, no commas in headlines and buttons
export type FeatureSlug = 'hours' | 'reviews' | 'alerts' | 'photos-details' | 'branch-score';
type Item = { t: string; d: string };
type FAQ = { q: string; a: string };
export type FeaturePage = {
  seo: { title: string; description: string };
  eyebrow: string; h1: string; lead: string;
  why: { h2: string; items: Item[] };
  caps: { h2: string; items: (Item & { icon: string })[] };
  flow: { h2: string; steps: Item[] };
  guard: { t: string; d: string };
  faq: FAQ[];
};

export const FEATURE_PAGES: Record<'ar' | 'en', Record<FeatureSlug, FeaturePage>> = {
  ar: {
    hours: {
      seo: { title: 'أوقات العمل وساعات رمضان والعيد لكل الفروع | صيت', description: 'عدّل أوقات الدوام لكل فروعك على قوقل ماب مرة واحدة وجهّز ساعات رمضان والعيد بقوالب جاهزة حتى لا يصل عميل إلى فرع مغلق' },
      eyebrow: 'المواعيد والمواسم', h1: 'مواعيد كل فروعك صحيحة في كل موسم',
      lead: 'جهّز مواعيد رمضان والعيد والإجازات مرة وحدة وطبقها على الفروع اللي تختارها وصيت ينبهك لأي فرع ناقص قبل ما يوصل له عميل وهو مقفل',
      why: { h2: 'ليش المواعيد أهم مما تتوقع', items: [
        { t: 'العميل يشيك قبل ما يطلع', d: 'كثير من العملاء يبحثون عن الفرع ويشوفون هل هو مفتوح الآن قبل ما يتحركون' },
        { t: 'رمضان يقلب الجدول', d: 'دوام بعد التراويح وفترتين في اليوم وكل فرع له ظرفه وهنا تصير أغلب الأخطاء' },
        { t: 'فرع مقفل يعني تقييم سلبي', d: 'عميل وصل والفرع مقفل غالبًا يكتب تجربته على Google في نفس اليوم' },
      ] },
      caps: { h2: 'وش تقدر تسوي', items: [
        { icon: 'calendar', t: 'قوالب المواسم', d: 'رمضان والعيدين واليوم الوطني ويوم التأسيس قوالب جاهزة تعدلها مرة وتستخدمها كل سنة' },
        { icon: 'layers', t: 'تطبيق جماعي', d: 'اختر الفروع حسب المدينة أو النوع وطبق المواعيد عليها كلها بخطوة وحدة' },
        { icon: 'clock', t: 'فترتين في اليوم', d: 'فترة صباحية وفترة بعد العصر أو بعد التراويح لكل فرع بدون لخبطة' },
        { icon: 'bell', t: 'تنبيه الفروع الناقصة', d: 'قبل الموسم يوريك صيت الفروع اللي ما عندها مواعيد خاصة بعد' },
        { icon: 'check', t: 'معاينة قبل النشر', d: 'تشوف المواعيد الجديدة لكل فرع وتعتمدها قبل ما توصل لـ Google' },
        { icon: 'spark', t: 'رجوع تلقائي', d: 'المواعيد الخاصة لها تاريخ بداية ونهاية وبعدها يرجع كل فرع لدوامه العادي' },
      ] },
      flow: { h2: 'من القالب إلى كل الفروع', steps: [
        { t: 'جهّز القالب', d: 'حدد مواعيد الموسم وتاريخ البداية والنهاية' },
        { t: 'اختر الفروع', d: 'كل الفروع أو مدينة معينة أو فروع المولات فقط' },
        { t: 'راجع واعتمد', d: 'تشوف النتيجة لكل فرع وتعتمد ويتطبق على Google' },
      ] },
      guard: { t: 'أنت اللي تعتمد', d: 'ولا تعديل يوصل لملف أي فرع على Google قبل موافقة شخص مخوّل من فريقك' },
      faq: [
        { q: 'هل أقدر أخلي فرع بمواعيد مختلفة عن الباقي؟', a: 'نعم القالب نقطة بداية وتقدر تعدل أي فرع لوحده قبل الاعتماد' },
        { q: 'وش يصير بعد ما يخلص رمضان؟', a: 'المواعيد الخاصة مربوطة بتاريخ نهاية وبعدها يرجع الفرع لمواعيده العادية بدون ما تسوي شيء' },
        { q: 'هل يدعم الفروع المفتوحة 24 ساعة؟', a: 'نعم تقدر تحدد فرع مفتوح طول اليوم أو مغلق في يوم معين مثل يوم العيد الأول' },
      ],
    },
    reviews: {
      seo: { title: 'الرد على تقييمات قوقل لكل الفروع | صيت', description: 'كل تقييمات فروعك على Google في صندوق واحد مع رد مقترح بلهجة العميل يراجعه موظف ويعتمده قبل النشر فلا يبقى تقييم بلا رد' },
      eyebrow: 'الردود على التقييمات', h1: 'ولا تقييم يبات بدون رد',
      lead: 'كل تقييمات فروعك في صندوق واحد ومع كل تقييم رد مقترح بلهجة العميل يراجعه فريقك ويعدله إذا احتاج ثم يعتمده بضغطة',
      why: { h2: 'الرد يقرأه أكثر من شخص', items: [
        { t: 'العميل الجاي يقرأ ردك', d: 'التقييم ورده يقرؤهم كل شخص يفكر يزور الفرع وليس صاحب التقييم بس' },
        { t: 'Google توصي بالرد', d: 'Google توصي أصحاب الأنشطة بالرد على التقييمات وتقول إن الرد يبين إنك تقدّر عملاءك' },
        { t: 'التأخير يكبّر المشكلة', d: 'تقييم سلبي بدون رد لأيام يعطي انطباع إن ما أحد يسمع' },
      ] },
      caps: { h2: 'وش تقدر تسوي', items: [
        { icon: 'reply', t: 'صندوق واحد لكل الفروع', d: 'فلترة حسب الفرع والنجوم والتقييمات اللي بدون رد' },
        { icon: 'spark', t: 'رد مقترح بلهجة العميل', d: 'إذا كتب بالعامية يجيه رد قريب من لهجته وإذا كتب بالإنجليزي يجيه رد بالإنجليزي' },
        { icon: 'user', t: 'موافقة بشرية', d: 'الرد يبقى مسودة لين يعتمده شخص من فريقك وتقدر تعدله أو ترفضه' },
        { icon: 'globe', t: 'نبرة علامتك', d: 'تحدد أسلوب الترحيب والاعتذار والكلمات الممنوعة ويلتزم فيها كل رد' },
        { icon: 'team', t: 'صلاحيات للفريق', d: 'مدير الفرع يشوف فرعه بس ومدير العمليات يشوف الكل' },
        { icon: 'chart', t: 'سرعة الرد لكل فرع', d: 'تعرف أي فرع يرد بسرعة وأي فرع يحتاج متابعة' },
      ] },
      flow: { h2: 'من التقييم إلى الرد المنشور', steps: [
        { t: 'يوصل التقييم', d: 'يظهر في الصندوق ومعه اسم الفرع والنجوم' },
        { t: 'يجهز الرد', d: 'صيت يقترح ردًا بلهجة العميل ونبرة علامتك' },
        { t: 'فريقك يعتمد', d: 'يراجع ويعدل ويعتمد والرد ينشر على Google' },
      ] },
      guard: { t: 'ما نعد بتقييمات أكثر', d: 'صيت ما يشتري تقييمات وما يحذف تقييمات ولا يكتب تقييمات وهمية ونلتزم بسياسات Google' },
      faq: [
        { q: 'هل الرد ينشر تلقائيًا؟', a: 'لا كل رد يبقى بانتظار موافقة شخص من فريقك قبل النشر' },
        { q: 'هل تقدرون تحذفون تقييم سلبي؟', a: 'لا الحذف قرار Google وحدها وتقدر تبلغ عن تقييم يخالف سياساتها وصيت يساعدك ترد عليه بشكل مهني' },
        { q: 'هل الرد يكون بالعامية دائمًا؟', a: 'تقدر تختار: قريب من لهجة العميل أو فصحى بسيطة أو إنجليزي حسب لغة التقييم' },
      ],
    },
    alerts: {
      seo: { title: 'تنبيهات فورية للفرع الذي يحتاج متابعة | صيت', description: 'تنبيه عند تقييم منخفض أو تقييم بلا رد أو تغيير في بيانات الفرع على Google حتى تعرف أين تتدخل أولاً' },
      eyebrow: 'تنبيهات الفروع', h1: 'اعرف الفرع اللي يحتاجك قبل ما تكبر المشكلة',
      lead: 'بدال ما تفتح كل فرع وتدور صيت يرتب لك اللي يحتاج تدخل اليوم: تقييم منخفض أو تقييم بدون رد أو بيانات تغيّرت على Google',
      why: { h2: 'المشاكل الصغيرة تختفي بين الفروع', items: [
        { t: 'عشرة فروع يعني عشرة ملفات', d: 'متابعة كل ملف يوميًا شغل ما أحد يلحق عليه' },
        { t: 'أي شخص يقدر يقترح تعديل', d: 'على Google يقدر أي مستخدم يقترح تعديل على بيانات النشاط وأحيانًا يتغير شيء بدون ما تنتبه' },
        { t: 'التوقيت يفرق', d: 'تنبيه في نفس اليوم أفضل من اكتشاف المشكلة بعد أسبوع' },
      ] },
      caps: { h2: 'وش تقدر تسوي', items: [
        { icon: 'bell', t: 'تنبيه التقييم المنخفض', d: 'نجمة أو نجمتين يوصلك تنبيه مع اسم الفرع' },
        { icon: 'reply', t: 'تقييمات بدون رد', d: 'تذكير بعد مدة تحددها أنت إذا ما أحد رد' },
        { icon: 'pin', t: 'تغيّر البيانات', d: 'تنبيه لما يتغير الرقم أو العنوان أو المواعيد على ملف الفرع' },
        { icon: 'layers', t: 'ترتيب حسب الأهمية', d: 'الأهم أول عشان تعرف من وين تبدأ' },
        { icon: 'team', t: 'التنبيه للشخص الصح', d: 'تنبيه الفرع يوصل لمدير الفرع وملخص الكل يوصل للإدارة' },
        { icon: 'mail', t: 'ملخص أسبوعي', d: 'وضع كل الفروع في رسالة وحدة كل أسبوع' },
      ] },
      flow: { h2: 'كيف يشتغل', steps: [
        { t: 'صيت يراقب', d: 'التقييمات وبيانات الفروع المرتبطة' },
        { t: 'يرتب ويرسل', d: 'تنبيه واضح للشخص المسؤول' },
        { t: 'تتصرف من نفس المكان', d: 'ترد أو تصحح البيانات بضغطة' },
      ] },
      guard: { t: 'تنبيهات بدون إزعاج', d: 'تختار وش يوصلك ومتى وتقدر توقف أي نوع تنبيه' },
      faq: [
        { q: 'وين توصلني التنبيهات؟', a: 'داخل لوحة صيت وعلى البريد الإلكتروني وتقدر تحدد مين يستقبل كل نوع' },
        { q: 'هل أقدر أغير متى يعتبر التقييم بدون رد متأخر؟', a: 'نعم تحدد المدة المناسبة لفريقك' },
        { q: 'هل صيت يصحح البيانات تلقائيًا؟', a: 'لا صيت ينبهك وأنت تقرر التصحيح وتعتمده' },
      ],
    },
    'photos-details': {
      seo: { title: 'صور وبيانات الفروع على قوقل ماب | صيت', description: 'وحّد الاسم والتصنيف وأرقام التواصل والصور لكل فروعك على Google وتأكد أن ما يراه العميل صحيح ومحدّث في كل فرع' },
      eyebrow: 'البيانات والصور', h1: 'اللي يشوفه عميلك عن كل فرع صحيح',
      lead: 'الاسم والتصنيف والرقم والعنوان والصور موحدة في كل الفروع وتحدثها دفعة وحدة بدال ما تدخل كل ملف لوحده',
      why: { h2: 'التفاصيل الصغيرة تبني الثقة', items: [
        { t: 'رقم قديم يعني مكالمة ضايعة', d: 'العميل يتصل من الخريطة مباشرة وإذا الرقم غلط راح لغيرك' },
        { t: 'Google تقيس الاكتمال', d: 'Google تقول إن الملفات الكاملة والدقيقة أسهل في الظهور لعمليات البحث المناسبة' },
        { t: 'الصور أول انطباع', d: 'صورة واجهة قديمة أو لا تشبه الفرع تخلي العميل يتردد' },
      ] },
      caps: { h2: 'وش تقدر تسوي', items: [
        { icon: 'layers', t: 'تحديث جماعي', d: 'غيّر وصف أو رابط أو تصنيف لكل الفروع بخطوة' },
        { icon: 'check', t: 'فحص الاكتمال', d: 'قائمة بالحقول الناقصة في كل فرع' },
        { icon: 'photo', t: 'تذكير الصور', d: 'يوريك الفروع اللي صورها قديمة' },
        { icon: 'store', t: 'توحيد الاسم', d: 'نفس صيغة الاسم في كل الفروع بدون كلمات زايدة' },
        { icon: 'pin', t: 'متابعة التغييرات', d: 'سجل بكل تعديل صار على ملف الفرع ومن سواه' },
        { icon: 'phone', t: 'أرقام وروابط', d: 'الجوال والموقع ورابط الحجز صحيحة في كل فرع' },
      ] },
      flow: { h2: 'من الفوضى إلى معيار واحد', steps: [
        { t: 'فحص أولي', d: 'صيت يوريك الفروق بين فروعك' },
        { t: 'حدد المعيار', d: 'الصيغة الصحيحة للاسم والوصف والروابط' },
        { t: 'طبق واعتمد', d: 'التعديل يوصل للفروع المختارة بعد موافقتك' },
      ] },
      guard: { t: 'بدون كلمات حشو', d: 'نلتزم بإرشادات Google في اسم النشاط وما نضيف كلمات مفتاحية للاسم لأنها تخالف السياسة' },
      faq: [
        { q: 'هل أقدر أرفع صور لكل الفروع من مكان واحد؟', a: 'نعم تختار الفرع وترفع الصور ويوريك صيت آخر تحديث لكل فرع' },
        { q: 'هل تغيير الاسم يأثر على الفرع؟', a: 'تغيير الاسم قد يخضع لمراجعة Google لذلك ننصح بتعديله فقط لما يكون فيه خطأ فعلي' },
        { q: 'هل صيت يكتب الوصف عني؟', a: 'يقترح وصف بنبرة علامتك وأنت تعدله وتعتمده' },
      ],
    },
    'branch-score': {
      seo: { title: 'مؤشر أداء كل فرع على قوقل ماب | صيت', description: 'درجة واضحة لكل فرع تجمع اكتمال البيانات وسرعة الرد على التقييمات ودقة أوقات العمل لتقارن فروعك وتعرف من يحتاج دعماً' },
      eyebrow: 'مؤشر الفرع', h1: 'درجة وحدة توريك وين كل فرع',
      lead: 'مؤشر من 100 لكل فرع يجمع اكتمال البيانات وسرعة الرد ودقة المواعيد وتعرف منه مين يحتاج دعم ومين يستاهل شكر',
      why: { h2: 'ليش رقم واحد', items: [
        { t: 'مقارنة عادلة', d: 'نفس المعايير لكل الفروع في كل المدن' },
        { t: 'نقاش أوضح مع المدراء', d: 'بدال الانطباعات عندك رقم وسبب واضح' },
        { t: 'تحسن تشوفه', d: 'تتابع الفرع أسبوع بعد أسبوع' },
      ] },
      caps: { h2: 'وش يدخل في المؤشر', items: [
        { icon: 'check', t: 'اكتمال البيانات', d: 'الحقول الأساسية والصور والروابط' },
        { icon: 'reply', t: 'سرعة الرد', d: 'متوسط الوقت للرد على التقييمات' },
        { icon: 'clock', t: 'دقة المواعيد', d: 'المواعيد العادية ومواعيد المواسم' },
        { icon: 'chart', t: 'شفافية كاملة', d: 'كل نقطة لها سبب مكتوب وطريقة الحساب واضحة' },
        { icon: 'layers', t: 'ترتيب الفروع', d: 'من الأعلى للأقل مع فلترة حسب المدينة' },
        { icon: 'mail', t: 'تقرير دوري', d: 'ملخص يوصل للإدارة' },
      ] },
      flow: { h2: 'كيف تستخدمه', steps: [
        { t: 'شوف الترتيب', d: 'أقل الفروع درجة في الأعلى' },
        { t: 'افتح السبب', d: 'وش اللي نقص الدرجة بالضبط' },
        { t: 'صحح وتابع', d: 'الدرجة تتحدث بعد التصحيح' },
      ] },
      guard: { t: 'المؤشر ليس ترتيب Google', d: 'المؤشر أداة داخلية تقيس جاهزية الفرع وما يمثل ترتيبك في نتائج Google ولا نعد بترتيب معين' },
      faq: [
        { q: 'هل المؤشر يرفع ترتيبي في Google؟', a: 'لا نعد بأي ترتيب المؤشر يقيس أشياء بيدك مثل الاكتمال وسرعة الرد' },
        { q: 'هل أقدر أغير أوزان المؤشر؟', a: 'الأوزان معروضة بوضوح ونراجعها معك حسب أولويات نشاطك' },
        { q: 'هل يشمل عدد النجوم؟', a: 'المؤشر يركز على اللي تقدر تتحكم فيه ويعرض متوسط التقييم جنبه كمعلومة' },
      ],
    },
  },
  en: {
    hours: {
      seo: { title: 'Bulk & Ramadan Hours for All Branches | SAAYT', description: 'Change opening hours across every branch on Google Maps in one step and schedule Ramadan and Eid hours from ready templates before the season starts' },
      eyebrow: 'Hours and seasons', h1: 'Every branch shows the right hours in every season',
      lead: 'Set Ramadan, Eid and holiday hours once and apply them to the branches you choose. SAAYT flags any branch that is missing its season hours before a customer arrives at a closed door',
      why: { h2: 'Why hours matter more than you think', items: [
        { t: 'Customers check before they leave', d: 'Many people look up a branch and check whether it is open now before heading out' },
        { t: 'Ramadan flips the schedule', d: 'Late-night opening and split shifts differ by branch and that is where most mistakes happen' },
        { t: 'A closed branch means a bad review', d: 'A customer who finds the door locked often writes about it on Google the same day' },
      ] },
      caps: { h2: 'What you can do', items: [
        { icon: 'calendar', t: 'Season templates', d: 'Ramadan, both Eids, National Day and Founding Day templates you edit once and reuse every year' },
        { icon: 'layers', t: 'Bulk apply', d: 'Pick branches by city or type and apply hours to all of them in one step' },
        { icon: 'clock', t: 'Split shifts', d: 'A morning shift and an evening or post-Taraweeh shift for every branch' },
        { icon: 'bell', t: 'Missing-hours alert', d: 'Before the season SAAYT shows which branches still have no special hours' },
        { icon: 'check', t: 'Preview before publishing', d: 'See the new hours per branch and approve them before they reach Google' },
        { icon: 'spark', t: 'Automatic return', d: 'Special hours have a start and end date and then each branch returns to its regular hours' },
      ] },
      flow: { h2: 'From template to every branch', steps: [
        { t: 'Set the template', d: 'Choose the season hours and the start and end dates' },
        { t: 'Pick branches', d: 'All branches, one city or only mall branches' },
        { t: 'Review and approve', d: 'Check each branch, approve and it goes to Google' },
      ] },
      guard: { t: 'You approve every change', d: 'Nothing reaches a branch profile on Google until an authorised person on your team approves it' },
      faq: [
        { q: 'Can one branch keep different hours?', a: 'Yes. The template is a starting point and you can adjust any branch before approving' },
        { q: 'What happens when Ramadan ends?', a: 'Special hours carry an end date and each branch returns to its regular hours automatically' },
        { q: 'Does it support 24-hour branches?', a: 'Yes. Mark a branch as open all day or closed on a specific day such as the first day of Eid' },
      ],
    },
    reviews: {
      seo: { title: 'Reply to Google Reviews Across Branches | SAAYT', description: 'All branch reviews in one inbox with suggested replies in the customer’s dialect — a person on your team reviews and approves every reply before it posts' },
      eyebrow: 'Review replies', h1: 'No review left without a reply',
      lead: 'Every review from every branch lands in one inbox with a suggested reply in the customer’s own dialect. Your team edits if needed and approves in one tap',
      why: { h2: 'More people read your reply than you think', items: [
        { t: 'The next customer reads it', d: 'A review and its reply are read by everyone deciding whether to visit, not only the reviewer' },
        { t: 'Google recommends replying', d: 'Google advises businesses to reply to reviews and says replies show you value your customers' },
        { t: 'Delay makes it worse', d: 'A negative review left for days suggests nobody is listening' },
      ] },
      caps: { h2: 'What you can do', items: [
        { icon: 'reply', t: 'One inbox for all branches', d: 'Filter by branch, rating and unanswered reviews' },
        { icon: 'spark', t: 'Dialect-aware drafts', d: 'A review in Saudi dialect gets a reply close to that dialect and an English review gets an English reply' },
        { icon: 'user', t: 'Human approval', d: 'Every reply stays a draft until someone on your team approves, edits or rejects it' },
        { icon: 'globe', t: 'Your brand voice', d: 'Set greetings, apology style and banned words and every draft follows them' },
        { icon: 'team', t: 'Team permissions', d: 'Branch managers see their branch and operations sees everything' },
        { icon: 'chart', t: 'Reply speed per branch', d: 'See which branches reply fast and which need follow-up' },
      ] },
      flow: { h2: 'From review to published reply', steps: [
        { t: 'A review arrives', d: 'It appears in the inbox with the branch and rating' },
        { t: 'A draft is ready', d: 'SAAYT suggests a reply in the customer’s dialect and your voice' },
        { t: 'Your team approves', d: 'Review, edit, approve and it posts to Google' },
      ] },
      guard: { t: 'No promises of more reviews', d: 'SAAYT never buys, removes or writes fake reviews and follows Google’s policies' },
      faq: [
        { q: 'Are replies posted automatically?', a: 'No. Every reply waits for approval from someone on your team' },
        { q: 'Can you remove a negative review?', a: 'No. Removal is Google’s decision. You can report reviews that break its policies and SAAYT helps you reply professionally' },
        { q: 'Is every reply in dialect?', a: 'You choose: close to the customer’s dialect, simple Modern Standard Arabic or English based on the review language' },
      ],
    },
    alerts: {
      seo: { title: 'Alerts for the Branch That Needs Attention | SAAYT', description: 'Get alerted to low ratings · unanswered reviews or changed branch details on Google so you know exactly where to step in first' },
      eyebrow: 'Branch alerts', h1: 'Know which branch needs you before it grows',
      lead: 'Instead of opening every branch to check, SAAYT lines up what needs attention today: a low rating, an unanswered review or details that changed on Google',
      why: { h2: 'Small problems hide between branches', items: [
        { t: 'Ten branches means ten profiles', d: 'Checking each one every day is work nobody keeps up with' },
        { t: 'Anyone can suggest an edit', d: 'On Google any user can suggest changes to business details and sometimes something changes without you noticing' },
        { t: 'Timing matters', d: 'An alert the same day beats finding the problem a week later' },
      ] },
      caps: { h2: 'What you can do', items: [
        { icon: 'bell', t: 'Low-rating alerts', d: 'One or two stars and you get an alert with the branch name' },
        { icon: 'reply', t: 'Unanswered reviews', d: 'A reminder after a time you set if nobody has replied' },
        { icon: 'pin', t: 'Changed details', d: 'An alert when the phone, address or hours change on a branch profile' },
        { icon: 'layers', t: 'Sorted by priority', d: 'The most important first so you know where to start' },
        { icon: 'team', t: 'The right person', d: 'Branch alerts go to the branch manager and the summary goes to management' },
        { icon: 'mail', t: 'Weekly summary', d: 'The status of every branch in one message each week' },
      ] },
      flow: { h2: 'How it works', steps: [
        { t: 'SAAYT watches', d: 'Reviews and details of connected branches' },
        { t: 'Sorts and sends', d: 'A clear alert to the person responsible' },
        { t: 'Act in the same place', d: 'Reply or correct details in one tap' },
      ] },
      guard: { t: 'Alerts without noise', d: 'Choose what reaches you and when and switch off any alert type' },
      faq: [
        { q: 'Where do alerts arrive?', a: 'Inside the SAAYT dashboard and by email and you decide who receives each type' },
        { q: 'Can I change when a review counts as overdue?', a: 'Yes. Set the time that suits your team' },
        { q: 'Does SAAYT fix details automatically?', a: 'No. SAAYT alerts you and you decide and approve the fix' },
      ],
    },
    'photos-details': {
      seo: { title: 'Branch Photos & Details on Google Maps | SAAYT', description: 'Keep names · categories · phone numbers and photos consistent across every branch profile on Google so customers always see current information' },
      eyebrow: 'Details and photos', h1: 'What customers see about every branch is right',
      lead: 'Name, category, phone, address and photos stay consistent across branches and you update them in one go instead of opening each profile',
      why: { h2: 'Small details build trust', items: [
        { t: 'An old number is a lost call', d: 'Customers call straight from the map and a wrong number sends them elsewhere' },
        { t: 'Google values completeness', d: 'Google says complete and accurate profiles are easier to match with relevant searches' },
        { t: 'Photos are the first impression', d: 'An outdated storefront photo makes customers hesitate' },
      ] },
      caps: { h2: 'What you can do', items: [
        { icon: 'layers', t: 'Bulk updates', d: 'Change a description, link or category for all branches in one step' },
        { icon: 'check', t: 'Completeness check', d: 'A list of missing fields for each branch' },
        { icon: 'photo', t: 'Photo reminders', d: 'See which branches have outdated photos' },
        { icon: 'store', t: 'Consistent names', d: 'The same name format in every branch with no extra words' },
        { icon: 'pin', t: 'Change history', d: 'A log of every edit to a branch profile and who made it' },
        { icon: 'phone', t: 'Numbers and links', d: 'Phone, website and booking link correct in every branch' },
      ] },
      flow: { h2: 'From mess to one standard', steps: [
        { t: 'First scan', d: 'SAAYT shows the differences between branches' },
        { t: 'Set the standard', d: 'The right format for name, description and links' },
        { t: 'Apply and approve', d: 'Changes reach chosen branches after your approval' },
      ] },
      guard: { t: 'No keyword stuffing', d: 'We follow Google’s naming guidelines and never add keywords to business names because that breaks policy' },
      faq: [
        { q: 'Can I upload photos for all branches in one place?', a: 'Yes. Pick a branch, upload photos and SAAYT shows the last update for each branch' },
        { q: 'Does renaming affect a branch?', a: 'Name changes may go through Google review so we recommend changing names only to fix real errors' },
        { q: 'Does SAAYT write descriptions?', a: 'It suggests one in your brand voice and you edit and approve it' },
      ],
    },
    'branch-score': {
      seo: { title: 'A Clear Google Presence Score per Branch | SAAYT', description: 'One score per branch built from profile completeness · review response time and hours accuracy so you can compare branches at a glance' },
      eyebrow: 'Branch score', h1: 'One score that shows where every branch stands',
      lead: 'A score out of 100 for each branch combining profile completeness, reply speed and hours accuracy so you know who needs support and who deserves thanks',
      why: { h2: 'Why one number', items: [
        { t: 'Fair comparison', d: 'The same criteria for every branch in every city' },
        { t: 'Clearer manager reviews', d: 'A number with a clear reason instead of impressions' },
        { t: 'Progress you can see', d: 'Track each branch week after week' },
      ] },
      caps: { h2: 'What goes into the score', items: [
        { icon: 'check', t: 'Profile completeness', d: 'Core fields, photos and links' },
        { icon: 'reply', t: 'Reply speed', d: 'Average time to reply to reviews' },
        { icon: 'clock', t: 'Hours accuracy', d: 'Regular and season hours' },
        { icon: 'chart', t: 'Full transparency', d: 'Every point has a written reason and the method is visible' },
        { icon: 'layers', t: 'Branch ranking', d: 'Highest to lowest with city filters' },
        { icon: 'mail', t: 'Regular report', d: 'A summary for management' },
      ] },
      flow: { h2: 'How to use it', steps: [
        { t: 'See the ranking', d: 'Lowest-scoring branches on top' },
        { t: 'Open the reason', d: 'Exactly what lowered the score' },
        { t: 'Fix and follow up', d: 'The score updates after the fix' },
      ] },
      guard: { t: 'Not a Google ranking', d: 'The score is an internal readiness measure. It does not represent your position in Google results and we never promise rankings' },
      faq: [
        { q: 'Will the score raise my Google ranking?', a: 'We never promise rankings. The score measures things you control such as completeness and reply speed' },
        { q: 'Can I change the weights?', a: 'The weights are shown clearly and we review them with you based on your priorities' },
        { q: 'Does it include star ratings?', a: 'The score focuses on what you control and shows the average rating beside it for context' },
      ],
    },
  },
};
