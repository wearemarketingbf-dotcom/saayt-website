// Industry pages copy (AR/EN). Review examples are illustrative and clearly labelled as examples on the page
export type IndustrySlug = 'clinics' | 'salons' | 'auto-service' | 'optics' | 'perfume' | 'gold-jewelry';
type Item = { t: string; d: string };
export type IndustryPage = {
  seo: { title: string; description: string };
  h1: string; lead: string;
  pains: Item[];
  helps: { slug: string; d: string }[];
  example: { branch: string; stars: number; review: string; reply: string; note: string };
  seasons: string[];
  faq: { q: string; a: string }[];
};

export const INDUSTRY_PAGES: Record<'ar' | 'en', Record<IndustrySlug, IndustryPage>> = {
  ar: {
    clinics: {
      seo: { title: 'إدارة تقييمات العيادات على قوقل ماب | صيت', description: 'ردود مهنية على تقييمات المرضى في كل فروع عيادتك على Google بلا كشف لأي معلومة صحية مع أوقات دقيقة في رمضان والإجازات' },
      h1: 'كل فروع عيادتك بنفس الثقة على Google',
      lead: 'المريض يختار العيادة من تقييماتها ومواعيدها قبل ما يتصل وصيت يساعدك ترد بمهنية في كل فرع بدون ما تكشف أي معلومة صحية',
      pains: [
        { t: 'خصوصية المريض', d: 'الرد على تقييم مريض يحتاج حذر لأن أي تفصيل عن حالته ما ينكتب في رد عام' },
        { t: 'مواعيد الأطباء والمواسم', d: 'دوام رمضان والإجازات يختلف بين الفروع والمريض يحتاج يعرف قبل ما يحجز' },
        { t: 'شكاوى الانتظار', d: 'أغلب التقييمات السلبية عن الانتظار والاستقبال وتحتاج رد سريع وهادي' },
      ],
      helps: [
        { slug: 'reviews', d: 'ردود مهنية جاهزة تتجنب أي معلومة صحية ويعتمدها شخص من فريقك' },
        { slug: 'hours', d: 'مواعيد رمضان والإجازات لكل الفروع بقالب واحد' },
        { slug: 'alerts', d: 'تنبيه فوري لأي تقييم منخفض في أي فرع' },
        { slug: 'branch-score', d: 'مقارنة سرعة الرد بين الفروع' },
      ],
      example: { branch: 'فرع الملقا', stars: 2, review: 'الدكتورة ممتازة بس الانتظار طويل جدًا رغم إن عندي موعد', reply: 'نشكرك على ملاحظتك ونعتذر عن الانتظار رغم وجود موعد مسبق وصلت ملاحظتك لإدارة الفرع لمراجعة جدولة المواعيد ويسعدنا تواصلك معنا مباشرة لخدمتك بشكل أفضل', note: 'الرد ما يذكر أي تفاصيل عن الحالة أو العلاج' },
      seasons: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'الإجازات الرسمية'],
      faq: [
        { q: 'هل الردود تراعي خصوصية المرضى؟', a: 'نعم الردود المقترحة مصممة لتتجنب أي معلومة صحية وكل رد يراجعه شخص من فريقك قبل النشر' },
        { q: 'هل يناسب المجمعات اللي فيها تخصصات كثيرة؟', a: 'نعم كل فرع ملف مستقل وتقدر تنظم الصلاحيات حسب الفرع' },
      ],
    },
    salons: {
      seo: { title: 'إدارة فروع الصالونات على قوقل ماب | صيت', description: 'صور محدثة لكل فرع وأوقات المواسم والأعياد وردود سريعة على تقييمات العميلات على Google من لوحة واحدة لكل فروع الصالون' },
      h1: 'صالونك يلمع في كل فرع على Google',
      lead: 'العميلة تختار الصالون من الصور والتقييمات وقبل العيد يزيد البحث والحجز وصيت يخلي كل فرع جاهز بصور محدثة ومواعيد صحيحة وردود سريعة',
      pains: [
        { t: 'الصور تبيع', d: 'صور قديمة أو قليلة تخلي العميلة تروح لصالون ثاني' },
        { t: 'ضغط ما قبل العيد', d: 'مواعيد ممتدة قبل العيد وتغييرات سريعة لازم تكون صحيحة في كل فرع' },
        { t: 'التقييمات شخصية', d: 'تقييمات عن موظفة أو خدمة معينة تحتاج رد لطيف ومحترم' },
      ],
      helps: [
        { slug: 'photos-details', d: 'تذكير بالفروع اللي صورها قديمة' },
        { slug: 'hours', d: 'مواعيد ما قبل العيد لكل الفروع بتعديل واحد' },
        { slug: 'reviews', d: 'ردود دافية بنبرة صالونك' },
        { slug: 'alerts', d: 'تنبيه لأي تقييم منخفض في نفس اليوم' },
      ],
      example: { branch: 'فرع النرجس', stars: 5, review: 'تسلم يدين نورة على الصبغة طلعت أحلى من اللي تخيلته', reply: 'يا هلا فيك ويسعدنا إن الصبغة عجبتك بلغنا نورة بكلامك الحلو ونتمنى نشوفك قريب في فرع النرجس', note: 'رد بلهجة العميلة ونبرة الصالون' },
      seasons: ['قبل العيدين', 'موسم الأعراس', 'رمضان', 'نهاية السنة'],
      faq: [
        { q: 'هل أقدر أخلي نبرة الردود دافية وشخصية؟', a: 'نعم تحدد نبرة الصالون والكلمات اللي تحبها وصيت يلتزم فيها' },
        { q: 'هل يساعدني في الصور؟', a: 'يذكرك بالفروع اللي صورها قديمة وتقدر ترفع صور كل فرع من مكان واحد' },
      ],
    },
    'auto-service': {
      seo: { title: 'مراكز صيانة السيارات على قوقل ماب | صيت', description: 'تابع تقييمات كل مراكز الصيانة على Google ورد عليها بلهجة العميل وحدّث أوقات العمل والخدمات في كل الفروع دفعة واحدة' },
      h1: 'كل مراكز الصيانة بنفس السمعة',
      lead: 'صاحب السيارة يقرأ التقييمات قبل ما يسلمك سيارته وصيت يخليك ترد على كل تقييم في كل مركز وتحدث المواعيد والخدمات دفعة وحدة',
      pains: [
        { t: 'الثقة قبل كل شيء', d: 'تقييم عن سعر أو تأخير في التسليم يأثر على كل الفروع مو بس فرع واحد' },
        { t: 'مواعيد مختلفة', d: 'بعض المراكز تشتغل بالليل وبعضها تقفل الجمعة والعميل يحتاج يعرف' },
        { t: 'تقييمات تقنية', d: 'العميل يكتب عن قطعة أو خدمة معينة ويحتاج رد واضح' },
      ],
      helps: [
        { slug: 'reviews', d: 'ردود واضحة بلهجة العميل ويعتمدها مدير المركز' },
        { slug: 'hours', d: 'مواعيد كل مركز ومواعيد المواسم بقالب واحد' },
        { slug: 'photos-details', d: 'الخدمات والأرقام صحيحة في كل فرع' },
        { slug: 'branch-score', d: 'مقارنة أداء المراكز' },
      ],
      example: { branch: 'مركز السلي', stars: 3, review: 'الشغل نظيف بس قالوا السيارة تجهز الظهر واستلمتها المغرب', reply: 'حياك الله وشاكرين لك ثقتك فيما يخص التأخير في التسليم نعتذر لك ووصلنا الموضوع لمدير المركز عشان نضبط مواعيد التسليم ونتمنى نخدمك أفضل في زيارتك الجاية', note: 'اعتذار واضح بدون مبررات طويلة' },
      seasons: ['قبل السفر في الإجازات', 'الصيف', 'رمضان', 'العيدين'],
      faq: [
        { q: 'هل يدعم المراكز في مدن مختلفة؟', a: 'نعم تقدر تفلتر المراكز حسب المدينة وتطبق التعديلات على مدينة وحدة' },
        { q: 'هل أقدر أخلي مدير كل مركز يرد على مركزه؟', a: 'نعم الصلاحيات حسب الفرع ومدير العمليات يشوف الكل' },
      ],
    },
    optics: {
      seo: { title: 'فروع محلات البصريات على قوقل ماب | صيت', description: 'عملاؤك يبحثون عن محل بصريات قريب ومفتوح الآن فاجعل أوقات كل فرع وصوره وتقييماته على Google دقيقة ومحدثة دائماً' },
      h1: 'لما يبحث عن بصريات قريبة يلقى فرعك صح',
      lead: 'العميل غالبًا يبحث عن محل بصريات قريب ومفتوح الآن وصيت يخلي مواعيد كل فرع وصوره وتقييماته دقيقة عشان يجيك أنت',
      pains: [
        { t: 'قريب ومفتوح الآن', d: 'العميل يبي فرع مفتوح الحين وأي موعد غلط يضيعه' },
        { t: 'فروع المولات', d: 'مواعيد المول تختلف عن الفروع الخارجية وتتغير في المواسم' },
        { t: 'تقييمات عن الفحص والتسليم', d: 'تأخير النظارة أو خطأ في القياس يحتاج رد سريع ومسؤول' },
      ],
      helps: [
        { slug: 'hours', d: 'مواعيد المولات والفروع الخارجية بقوالب منفصلة' },
        { slug: 'photos-details', d: 'صور وبيانات صحيحة لكل فرع' },
        { slug: 'reviews', d: 'ردود مسؤولة ويعتمدها مدير الفرع' },
        { slug: 'alerts', d: 'تنبيه لما يتغير موعد أو رقم على Google' },
      ],
      example: { branch: 'فرع الرياض بارك', stars: 2, review: 'النظارة تأخرت أسبوع عن الموعد اللي قالوه', reply: 'حياك الله ونعتذر لك عن تأخر النظارة عن الموعد المتفق عليه بلغنا إدارة الفرع ونتمنى تتواصل معنا عشان نتابع طلبك بشكل مباشر', note: 'رد قصير يطلب التواصل المباشر' },
      seasons: ['العودة للمدارس', 'رمضان', 'العيدين', 'تخفيضات نهاية السنة'],
      faq: [
        { q: 'هل أقدر أفصل مواعيد فروع المولات عن الباقي؟', a: 'نعم تصنف الفروع وتطبق قالب مختلف لكل مجموعة' },
        { q: 'هل يساعدني أظهر في بحث قريب مني؟', a: 'ما نعد بترتيب معين لكن البيانات الدقيقة والمواعيد الصحيحة جزء من العوامل اللي تذكرها Google للظهور المحلي' },
      ],
    },
    perfume: {
      seo: { title: 'فروع محلات العطور على قوقل ماب | صيت', description: 'أوقات مواسم رمضان والعيد وصور المعرض وردود على تقييمات العملاء على Google لكل فروع العطور في المولات والمدن من مكان واحد' },
      h1: 'كل فروع العطور جاهزة لموسم العيد',
      lead: 'موسم رمضان والعيد أعلى أيام البيع والعميل يدور الفرع المفتوح وقت السحور وبعد التراويح وصيت يخلي مواعيد وصور كل فرع صحيحة',
      pains: [
        { t: 'المواسم هي كل شيء', d: 'دوام ممتد في رمضان وليالي العيد ويختلف بين المول والشارع' },
        { t: 'فروع كثيرة في مدن كثيرة', d: 'متابعة كل فرع لوحده تاخذ وقت ما عندك في الموسم' },
        { t: 'تجربة العميل في الفرع', d: 'تقييمات عن تعامل الموظف أو التغليف تحتاج رد يحفظ صورة البراند' },
      ],
      helps: [
        { slug: 'hours', d: 'مواعيد رمضان وليالي العيد لكل الفروع بقالب واحد' },
        { slug: 'photos-details', d: 'صور المعرض والإصدارات في كل فرع' },
        { slug: 'reviews', d: 'ردود فخمة بنبرة البراند' },
        { slug: 'branch-score', d: 'تعرف أي فرع يحتاج دعم قبل الموسم' },
      ],
      example: { branch: 'فرع جدة · طريق الملك', stars: 5, review: 'العود اللي نصحني فيه الموظف روعة وتغليف الهدية مرتب', reply: 'يا هلا فيك وشاكرين لك ذوقك الرفيع يسعدنا إن العود عجبك وإن الهدية وصلت بالشكل اللي يليق نتشرف بزيارتك دايم', note: 'نبرة فخمة تناسب البراند' },
      seasons: ['رمضان', 'ليالي العيد', 'اليوم الوطني', 'يوم التأسيس'],
      faq: [
        { q: 'هل أقدر أجهز مواعيد العيد من بداية رمضان؟', a: 'نعم تجهز القالب بتواريخه مسبقًا ويتطبق في وقته بعد موافقتك' },
        { q: 'هل يناسب الفروع داخل المولات؟', a: 'نعم تقدر تجمع فروع المولات بمواعيد خاصة فيها' },
      ],
    },
    'gold-jewelry': {
      seo: { title: 'فروع محلات الذهب على قوقل ماب | صيت', description: 'أوقات عمل دقيقة في رمضان والأعياد وصور وبيانات موحدة وتقييمات تحت السيطرة لكل فروع محلات الذهب والمجوهرات على Google' },
      h1: 'ثقة عملائك تبدأ من ملف فرعك',
      lead: 'شراء الذهب قرار ثقة والعميل يقرأ التقييمات ويشيك على الفرع قبل ما يزوره وصيت يخلي كل فرع بنفس المستوى',
      pains: [
        { t: 'الثقة قرار الشراء', d: 'تقييم سلبي واحد بدون رد يأثر على صورة كل الفروع' },
        { t: 'مواعيد الأسواق', d: 'أسواق الذهب لها مواعيد خاصة ووقت صلاة ومواسم أعراس وأعياد' },
        { t: 'بيانات موحدة', d: 'نفس الاسم والرقم والصور في كل فرع يبين إنك جهة وحدة موثوقة' },
      ],
      helps: [
        { slug: 'reviews', d: 'ردود رصينة تحفظ الثقة' },
        { slug: 'hours', d: 'مواعيد الأعياد ورمضان لكل الفروع' },
        { slug: 'photos-details', d: 'اسم وصور وبيانات موحدة' },
        { slug: 'alerts', d: 'تنبيه فوري لأي تقييم منخفض' },
      ],
      example: { branch: 'فرع سوق الذهب · الديرة بالرياض', stars: 4, review: 'تشكيلة حلوة والتعامل محترم بس الانتظار عند الدفع طويل', reply: 'حياك الله ونشكرك على ثقتك وكلامك الطيب عن التشكيلة والتعامل وملاحظتك عن الانتظار عند الدفع وصلت لإدارة الفرع ونعمل على تحسينها', note: 'رد رصين يشكر ويعترف بالملاحظة' },
      seasons: ['موسم الأعراس', 'العيدين', 'رمضان', 'اليوم الوطني'],
      faq: [
        { q: 'هل أقدر أوحد اسم كل الفروع؟', a: 'نعم بشرط الالتزام بإرشادات Google في اسم النشاط بدون كلمات زايدة' },
        { q: 'هل يدعم الفروع في أكثر من مدينة؟', a: 'نعم كل الفروع في لوحة وحدة مع فلترة حسب المدينة' },
      ],
    },
  },
  en: {
    clinics: {
      seo: { title: 'Google Reviews & Hours for Clinic Groups | SAAYT', description: 'Professional replies to patient reviews across every clinic branch on Google without exposing health details plus accurate holiday hours' },
      h1: 'Every clinic branch earns the same trust on Google',
      lead: 'Patients choose a clinic from its reviews and hours before they call. SAAYT helps you reply professionally in every branch without revealing any health information',
      pains: [
        { t: 'Patient privacy', d: 'Replying to a patient needs care because details about their condition never belong in a public reply' },
        { t: 'Doctor schedules and seasons', d: 'Ramadan and holiday hours differ by branch and patients need to know before booking' },
        { t: 'Waiting-time complaints', d: 'Most negative reviews are about waiting and reception and need a quick calm reply' },
      ],
      helps: [
        { slug: 'reviews', d: 'Professional drafts that avoid health details and are approved by your team' },
        { slug: 'hours', d: 'Ramadan and holiday hours for every branch from one template' },
        { slug: 'alerts', d: 'Instant alerts for low ratings in any branch' },
        { slug: 'branch-score', d: 'Compare reply speed between branches' },
      ],
      example: { branch: 'Malqa branch', stars: 2, review: 'The doctor was great but the wait was very long even with an appointment', reply: 'Thank you for your feedback and we apologise for the wait despite your booked appointment. Your note has reached the branch management to review scheduling and we would be glad to hear from you directly so we can serve you better', note: 'The reply mentions no details about the visit or treatment' },
      seasons: ['Ramadan', 'Eid al-Fitr', 'Eid al-Adha', 'Public holidays'],
      faq: [
        { q: 'Do replies respect patient privacy?', a: 'Yes. Drafts are designed to avoid health information and every reply is reviewed by someone on your team before it posts' },
        { q: 'Does it suit multi-specialty groups?', a: 'Yes. Each branch is its own profile and permissions can be set per branch' },
      ],
    },
    salons: {
      seo: { title: 'Google Maps Management for Salon Chains | SAAYT', description: 'Fresh photos per branch · Eid and season hours and fast replies to client reviews on Google for every salon location from one dashboard' },
      h1: 'Your salon shines in every branch on Google',
      lead: 'Clients choose a salon from photos and reviews and demand peaks before Eid. SAAYT keeps every branch ready with fresh photos, correct hours and quick replies',
      pains: [
        { t: 'Photos sell', d: 'Old or few photos send clients to another salon' },
        { t: 'Pre-Eid rush', d: 'Extended hours before Eid and quick changes must be right in every branch' },
        { t: 'Personal reviews', d: 'Reviews about a stylist or service need a warm respectful reply' },
      ],
      helps: [
        { slug: 'photos-details', d: 'Reminders for branches with outdated photos' },
        { slug: 'hours', d: 'Pre-Eid hours for every branch in one edit' },
        { slug: 'reviews', d: 'Warm replies in your salon’s voice' },
        { slug: 'alerts', d: 'Same-day alerts for low ratings' },
      ],
      example: { branch: 'Narjis branch', stars: 5, review: 'Noura did my colour and it came out even better than I imagined', reply: 'Thank you so much and we are delighted you love your colour. We have passed your kind words to Noura and hope to see you again soon at our Narjis branch', note: 'A warm reply in the salon’s voice' },
      seasons: ['Before both Eids', 'Wedding season', 'Ramadan', 'Year end'],
      faq: [
        { q: 'Can replies sound warm and personal?', a: 'Yes. Set your salon’s tone and favourite phrases and SAAYT follows them' },
        { q: 'Does it help with photos?', a: 'It reminds you which branches have outdated photos and you can upload for every branch from one place' },
      ],
    },
    'auto-service': {
      seo: { title: 'Google Reviews for Auto Service Centers | SAAYT', description: 'Track and answer Google reviews for every service center in the customer’s dialect and update hours and services across branches at once' },
      h1: 'Every service centre with the same reputation',
      lead: 'Car owners read reviews before handing over their keys. SAAYT lets you answer every review in every centre and update hours and services in one go',
      pains: [
        { t: 'Trust comes first', d: 'A review about price or a late handover affects every branch not just one' },
        { t: 'Different hours', d: 'Some centres work late and some close on Fridays and customers need to know' },
        { t: 'Technical reviews', d: 'Customers write about a specific part or service and need a clear answer' },
      ],
      helps: [
        { slug: 'reviews', d: 'Clear replies in the customer’s dialect approved by the centre manager' },
        { slug: 'hours', d: 'Hours and season hours for every centre from one template' },
        { slug: 'photos-details', d: 'Services and numbers right in every branch' },
        { slug: 'branch-score', d: 'Compare centre performance' },
      ],
      example: { branch: 'Sulay centre', stars: 3, review: 'Clean work but they said the car would be ready at noon and I got it at sunset', reply: 'Thank you for trusting us. We apologise for the late handover and have raised it with the centre manager to tighten delivery times. We hope to serve you better on your next visit', note: 'A clear apology without long excuses' },
      seasons: ['Before holiday travel', 'Summer', 'Ramadan', 'Both Eids'],
      faq: [
        { q: 'Does it support centres in different cities?', a: 'Yes. Filter centres by city and apply changes to one city only' },
        { q: 'Can each centre manager reply for their centre?', a: 'Yes. Permissions are per branch and operations sees everything' },
      ],
    },
    optics: {
      seo: { title: 'Google Maps for Optical Store Chains | SAAYT', description: 'Customers search for an optical store near me open now — keep hours · photos and reviews accurate for every branch on Google' },
      h1: 'When they search for optics nearby they find your branch right',
      lead: 'Customers often search for an optical store near them that is open now. SAAYT keeps every branch’s hours, photos and reviews accurate so they come to you',
      pains: [
        { t: 'Near me and open now', d: 'Customers want a branch that is open right now and a wrong time loses them' },
        { t: 'Mall branches', d: 'Mall hours differ from street branches and change with the seasons' },
        { t: 'Reviews about eye tests and delivery', d: 'A late pair of glasses or a wrong prescription needs a quick responsible reply' },
      ],
      helps: [
        { slug: 'hours', d: 'Separate templates for mall and street branches' },
        { slug: 'photos-details', d: 'Correct photos and details for every branch' },
        { slug: 'reviews', d: 'Responsible replies approved by the branch manager' },
        { slug: 'alerts', d: 'Alerts when hours or numbers change on Google' },
      ],
      example: { branch: 'Riyadh Park branch', stars: 2, review: 'My glasses were a week late from the date they gave me', reply: 'Welcome and we apologise that your glasses were later than agreed. We have informed the branch management and would appreciate you contacting us so we can follow up on your order directly', note: 'A short reply that invites direct contact' },
      seasons: ['Back to school', 'Ramadan', 'Both Eids', 'Year-end sales'],
      faq: [
        { q: 'Can mall branches have separate hours?', a: 'Yes. Group your branches and apply a different template to each group' },
        { q: 'Will it help me show up for near me searches?', a: 'We never promise rankings but accurate details and correct hours are among the factors Google mentions for local results' },
      ],
    },
    perfume: {
      seo: { title: 'Google Maps for Perfume Retail Chains | SAAYT', description: 'Ramadan and Eid season hours · storefront photos and review replies on Google for every perfume branch across malls and cities' },
      h1: 'Every perfume branch ready for Eid season',
      lead: 'Ramadan and Eid are the busiest selling days and customers look for a branch open late at night. SAAYT keeps every branch’s hours and photos right',
      pains: [
        { t: 'Seasons are everything', d: 'Extended Ramadan and Eid-night hours differ between mall and street' },
        { t: 'Many branches in many cities', d: 'Checking each branch one by one takes time you do not have in season' },
        { t: 'In-store experience', d: 'Reviews about staff or gift wrapping need a reply that protects the brand' },
      ],
      helps: [
        { slug: 'hours', d: 'Ramadan and Eid-night hours for every branch from one template' },
        { slug: 'photos-details', d: 'Showroom and new-release photos in every branch' },
        { slug: 'reviews', d: 'Refined replies in your brand voice' },
        { slug: 'branch-score', d: 'Spot which branch needs support before the season' },
      ],
      example: { branch: 'Jeddah · King Road', stars: 5, review: 'The oud the staff recommended is amazing and the gift wrapping was perfect', reply: 'Thank you for your refined taste. We are delighted you loved the oud and that the gift was presented as it deserves. It is always an honour to welcome you', note: 'A refined tone that fits the brand' },
      seasons: ['Ramadan', 'Eid nights', 'National Day', 'Founding Day'],
      faq: [
        { q: 'Can I prepare Eid hours at the start of Ramadan?', a: 'Yes. Prepare the template with its dates in advance and it applies on time after your approval' },
        { q: 'Does it suit mall branches?', a: 'Yes. Group mall branches with their own hours' },
      ],
    },
    'gold-jewelry': {
      seo: { title: 'Google Maps for Gold & Jewelry Chains | SAAYT', description: 'Accurate Ramadan and holiday hours · consistent photos and details and organized review replies for every jewelry branch on Google' },
      h1: 'Customer trust starts with your branch profile',
      lead: 'Buying gold is a decision of trust. Customers read reviews and check the branch before visiting and SAAYT keeps every branch at the same standard',
      pains: [
        { t: 'Trust drives the purchase', d: 'One unanswered negative review affects the image of every branch' },
        { t: 'Market hours', d: 'Gold markets have their own hours, prayer breaks and wedding and Eid seasons' },
        { t: 'Consistent details', d: 'The same name, number and photos everywhere show you are one trusted business' },
      ],
      helps: [
        { slug: 'reviews', d: 'Composed replies that protect trust' },
        { slug: 'hours', d: 'Eid and Ramadan hours for every branch' },
        { slug: 'photos-details', d: 'Consistent name, photos and details' },
        { slug: 'alerts', d: 'Instant alerts for any low rating' },
      ],
      example: { branch: 'Al-Dirah gold souk · Riyadh', stars: 4, review: 'Lovely collection and respectful staff but the wait at checkout was long', reply: 'Welcome and thank you for your trust and kind words about our collection and team. Your note about the checkout wait has reached the branch management and we are working to improve it', note: 'A composed reply that thanks and acknowledges' },
      seasons: ['Wedding season', 'Both Eids', 'Ramadan', 'National Day'],
      faq: [
        { q: 'Can I make every branch name consistent?', a: 'Yes as long as names follow Google’s guidelines with no extra words' },
        { q: 'Does it support branches in several cities?', a: 'Yes. All branches in one dashboard with city filters' },
      ],
    },
  },
};
