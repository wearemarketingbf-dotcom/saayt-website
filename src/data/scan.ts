// Free self-check. Weights are shown on the page. Answers stay in the browser
export type ScanQ = { id: string; area: 'hours' | 'details' | 'photos' | 'reviews'; w: number; q: string; fix: string; feat: string };
type Pack = { areas: Record<ScanQ['area'], string>; qs: ScanQ[] };
export const SCAN: Record<'ar' | 'en', Pack> = {
  ar: {
    areas: { hours: 'المواعيد', details: 'البيانات', photos: 'الصور', reviews: 'التقييمات' },
    qs: [
      { id: 'h1', area: 'hours', w: 10, q: 'مواعيد الدوام العادية صحيحة في كل الفروع؟', fix: 'راجع مواعيد كل فرع وصحح المختلف عن الواقع', feat: 'hours' },
      { id: 'h2', area: 'hours', w: 10, q: 'مواعيد رمضان والعيد تنضاف لكل الفروع قبل الموسم؟', fix: 'جهز قالب مواعيد للموسم وطبقه على كل الفروع قبل بدايته', feat: 'hours' },
      { id: 'h3', area: 'hours', w: 6, q: 'الإجازات الرسمية مثل اليوم الوطني ويوم التأسيس مضافة؟', fix: 'أضف المواعيد الخاصة للإجازات الرسمية قبلها بأسبوع', feat: 'hours' },
      { id: 'd1', area: 'details', w: 10, q: 'أرقام التواصل صحيحة وترد في كل الفروع؟', fix: 'اتصل على رقم كل فرع من الخريطة وتأكد إنه يرد', feat: 'photos-details' },
      { id: 'd2', area: 'details', w: 8, q: 'اسم النشاط بنفس الصيغة في كل الفروع وبدون كلمات زايدة؟', fix: 'وحد صيغة الاسم واحذف الكلمات الزايدة لأنها تخالف إرشادات Google', feat: 'photos-details' },
      { id: 'd3', area: 'details', w: 6, q: 'التصنيف الرئيسي والموقع الإلكتروني صحيحين في كل فرع؟', fix: 'راجع التصنيف الرئيسي ورابط الموقع لكل فرع', feat: 'photos-details' },
      { id: 'p1', area: 'photos', w: 8, q: 'كل فرع عنده صور واجهة وداخل حديثة؟', fix: 'أضف صور واجهة وداخل حديثة لكل فرع', feat: 'photos-details' },
      { id: 'p2', area: 'photos', w: 4, q: 'تضيفون صور جديدة على الأقل كل كم شهر؟', fix: 'حط تذكير دوري لتحديث صور الفروع', feat: 'photos-details' },
      { id: 'r1', area: 'reviews', w: 12, q: 'كل التقييمات الجديدة يتم الرد عليها؟', fix: 'رد على التقييمات المتراكمة وابدأ بالسلبية', feat: 'reviews' },
      { id: 'r2', area: 'reviews', w: 10, q: 'الرد على التقييم السلبي يصير خلال يوم أو يومين؟', fix: 'حدد شخص مسؤول وتنبيه للتقييمات المنخفضة', feat: 'alerts' },
      { id: 'r3', area: 'reviews', w: 8, q: 'الردود بنبرة وحدة تشبه علامتكم في كل الفروع؟', fix: 'اكتب دليل نبرة قصير للردود وشاركه مع الفروع', feat: 'reviews' },
      { id: 'r4', area: 'reviews', w: 8, q: 'تعرفون أي فرع أضعف في التقييمات وسرعة الرد؟', fix: 'قارن الفروع بمؤشر واحد كل أسبوع', feat: 'branch-score' },
    ],
  },
  en: {
    areas: { hours: 'Hours', details: 'Details', photos: 'Photos', reviews: 'Reviews' },
    qs: [
      { id: 'h1', area: 'hours', w: 10, q: 'Are regular opening hours correct in every branch?', fix: 'Check each branch’s hours and fix any that differ from reality', feat: 'hours' },
      { id: 'h2', area: 'hours', w: 10, q: 'Are Ramadan and Eid hours added to every branch before the season?', fix: 'Prepare a season template and apply it to all branches before it starts', feat: 'hours' },
      { id: 'h3', area: 'hours', w: 6, q: 'Are public holidays such as National Day and Founding Day added?', fix: 'Add special hours for public holidays a week ahead', feat: 'hours' },
      { id: 'd1', area: 'details', w: 10, q: 'Are phone numbers correct and answered in every branch?', fix: 'Call each branch from the map and make sure someone answers', feat: 'photos-details' },
      { id: 'd2', area: 'details', w: 8, q: 'Is the business name in the same format everywhere with no extra words?', fix: 'Make the name consistent and remove extra words because they break Google’s guidelines', feat: 'photos-details' },
      { id: 'd3', area: 'details', w: 6, q: 'Are the primary category and website correct in every branch?', fix: 'Review the primary category and website link for each branch', feat: 'photos-details' },
      { id: 'p1', area: 'photos', w: 8, q: 'Does every branch have recent storefront and interior photos?', fix: 'Add recent storefront and interior photos to every branch', feat: 'photos-details' },
      { id: 'p2', area: 'photos', w: 4, q: 'Do you add new photos at least every few months?', fix: 'Set a recurring reminder to refresh branch photos', feat: 'photos-details' },
      { id: 'r1', area: 'reviews', w: 12, q: 'Does every new review get a reply?', fix: 'Reply to the backlog starting with negative reviews', feat: 'reviews' },
      { id: 'r2', area: 'reviews', w: 10, q: 'Are negative reviews answered within a day or two?', fix: 'Assign an owner and an alert for low ratings', feat: 'alerts' },
      { id: 'r3', area: 'reviews', w: 8, q: 'Do replies share one brand tone across branches?', fix: 'Write a short tone guide for replies and share it with branches', feat: 'reviews' },
      { id: 'r4', area: 'reviews', w: 8, q: 'Do you know which branch is weakest on reviews and reply speed?', fix: 'Compare branches with one score every week', feat: 'branch-score' },
    ],
  },
};
