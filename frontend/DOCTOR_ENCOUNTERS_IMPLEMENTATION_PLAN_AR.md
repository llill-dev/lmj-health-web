# خطة تنفيذ صفحة الزيارات الطبية للطبيب مرتبة بالأولوية

## الهدف
هذه الخطة تحول تقرير فجوات `encounters` إلى مراحل تنفيذ عملية، بحيث ننتقل من صفحة عرض أولية للزيارات الطبية إلى `Clinical Workflow` حقيقي مبني على قدرات الـ Backend الفعلية.

المرجع التحليلي الأساسي:

- [DOCTOR_ENCOUNTERS_API_GAP_ANALYSIS_AR.md](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/DOCTOR_ENCOUNTERS_API_GAP_ANALYSIS_AR.md:1)

---

## المبدأ العام
ترتيب الأولوية هنا يعتمد على 4 عوامل:

1. القيمة التشغيلية للطبيب
2. مدى جاهزية الـ Backend
3. تقليل الفجوة بين ما توحي به الواجهة وما تعمل به فعليًا
4. تقليل المخاطر المعمارية مبكرًا

---

## المرحلة 1: تفعيل دورة حياة الزيارة نفسها

### الهدف
تحويل صفحة الزيارات الطبية من قائمة عرض إلى صفحة تشغيل حقيقية للزيارة.

### العناصر

1. ربط `إنشاء زيارة طبية`
   - تفعيل:
     - `POST /api/doctors/:doctorId/patients/:patientId/encounters`
   - استبدال `toast` الحالي في زر `زيارة جديدة`
   - توفير اختيار المريض
   - دعم:
     - `appointmentId`
     - `origin`
     - `notes`

2. ربط `تفاصيل زيارة واحدة`
   - تفعيل:
     - `GET /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`
   - عند توسيع الكارد أو فتح صفحة التفاصيل
   - استبدال الاعتماد على summary-only payload

3. ربط `تعديل الزيارة`
   - تفعيل:
     - `PATCH /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`
   - دعم تعديل:
     - `origin`
     - `notes`

4. ربط `إغلاق الزيارة`
   - تفعيل:
     - `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/close`
   - عرض رسائل فشل واضحة عندما:
     - توجد draft prescriptions
     - توجد draft encounter orders

### النتيجة المتوقعة
- الصفحة تصبح قادرة على:
  - إنشاء زيارة
  - عرض التفاصيل الحقيقية
  - تعديلها
  - إغلاقها

### الأولوية
`حرجة جدًا`

---

## المرحلة 2: تحويل الزيارة إلى Workspace سريري

### الهدف
ربط الوصفات والطلبات المرتبطة بالزيارة نفسها، لأن هذا هو جوهر encounter workflow في الـ Backend.

### العناصر

1. ربط `Encounter Prescriptions`
   - list
   - create draft
   - update prescription
   - add/update/delete/duplicate item
   - finalize
   - preview

2. ربط `Encounter Orders`
   - list
   - create:
     - lab
     - imaging
     - procedures
     - referrals
   - update draft order
   - add/update/delete items
   - finalize
   - preview

3. إضافة `draft state awareness`
   - إظهار إن كانت الزيارة تحتوي مسودات نشطة
   - إظهار سبب منع الإغلاق داخل الواجهة

### النتيجة المتوقعة
- encounter تتحول من “عنصر قائمة” إلى “جلسة عمل سريرية” حقيقية

### الأولوية
`عالية جدًا`

---

## المرحلة 3: وثائق الزيارة والمخرجات الرسمية

### الهدف
ربط الوثائق الطبية الناتجة عن الزيارة، وربط ملفات المريض أو ملفات PDF مع encounter.

### العناصر

1. ربط `Encounter Documents List`
   - `GET /.../documents`

2. ربط `Link / Generate and Link`
   - `POST /.../documents/link`

3. ربط `Share with Patient`
   - `POST /.../documents/:documentId/share`

4. تجهيز واجهة معاينة حالة الوثيقة
   - linked
   - shared / not shared

### النتيجة المتوقعة
- ملفات الزيارة تصبح جزءًا من الـ workflow السريري بدل أن تبقى منفصلة

### الأولوية
`عالية`

---

## المرحلة 4: القوالب والمكتبة الطبية للطبيب

### الهدف
تسريع العمل اليومي للطبيب عبر الاستفادة من `doctor library` و`doctor templates`.

### العناصر

1. ربط `Doctor Library`
   - recent
   - list items
   - create
   - edit
   - delete
   - favorite

2. ربط `Doctor Templates`
   - list
   - create
   - edit
   - delete
   - apply

3. استخدام المكتبة والقوالب داخل encounter workflow
   - للوصفات
   - للطلبات
   - أو لمسودات الزيارة حسب نوع القالب

### النتيجة المتوقعة
- تقليل وقت إدخال البيانات
- رفع قابلية إعادة الاستخدام
- تحسين تجربة الطبيب المتكرر

### الأولوية
`متوسطة عالية`

---

## المرحلة 5: إصلاح المعمارية الحالية لصفحة الزيارات

### الهدف
معالجة المشكلة البنيوية الحالية في الصفحة: تجميع encounters عبر المرضى بدل وجود مصدر بيانات encounters موحد واضح.

### المشكلة الحالية
الصفحة اليوم:

- تجلب المرضى
- ثم ترسل طلب encounters لكل مريض
- ثم تدمج النتائج محليًا

وهذا يسبب:

- `N+1 requests`
- حمل زائد
- حدودًا غير دقيقة للنتائج
- محدودية بسبب:
  - `MAX_PATIENTS_FOR_ENCOUNTERS`
  - `limit: 20` لكل مريض

### المساران المحتملان

1. الأفضل:
   - طلب endpoint backend عام مثل:
   - `GET /api/doctors/:doctorId/encounters`

2. البديل:
   - تحسين aggregation الحالي
   - مع pagination/merging أوضح
   - ومعالجة أخطاء جزئية أفضل

### الأولوية
`متوسطة`

### ملاحظة مهنية
هذه المرحلة مهمة جدًا، لكن لا أوصي أن تكون أول مرحلة، لأن القيمة التشغيلية الفورية للطبيب تأتي أولًا من `create/detail/update/close`.

---

## المرحلة 6: توسيع UX للزيارة الطبية

### الهدف
جعل تجربة encounter أوضح وأقرب إلى أدوات العمل السريري الحديثة.

### العناصر

1. تحويل encounter من `expandable card` فقط إلى:
   - `details page`
   - أو `split workspace`

2. عرض `status timeline` للزيارة
   - draft
   - active
   - ready to close
   - closed

3. إظهار `blocking reasons`
   - cannot close because draft prescriptions exist
   - cannot close because draft orders exist

4. deep linking
   - URL مباشر للزيارة

### الأولوية
`متوسطة`

---

## المرحلة 7: تحسينات ثانوية لكنها مهمة

### العناصر

1. دعم بحث backend-aware إن توفر endpoint مناسب
2. تحسين الإحصاءات لتأتي من backend بدل الاشتقاق المحلي
3. تحسين التعامل مع partial failures في تجميع الزيارات
4. إلغاء البيانات التجريبية أو الـ demo fallback في صفحة الزيارات
5. توحيد ربط `openEncounters` أو حذفه إن لم يعد مطلوبًا

### الأولوية
`متوسطة إلى منخفضة`

---

## أفضل ترتيب تنفيذ عملي

## Sprint 1

1. create encounter
2. encounter detail
3. update encounter
4. close encounter

## Sprint 2

5. prescriptions داخل الزيارة
6. orders داخل الزيارة
7. close blockers UX

## Sprint 3

8. documents
9. preview/finalize polish
10. encounter detail workspace

## Sprint 4

11. doctor library
12. doctor templates

## Sprint 5

13. إصلاح المعمارية العامة لصفحة encounters

---

## ماذا أنصح أن نبدأ به الآن

أفضل بداية تنفيذية الآن هي:

1. `POST create encounter`
2. `GET encounter detail`
3. `POST close encounter`

السبب:

- هذه الخطوات تعطي الصفحة معنى فعليًا بسرعة
- وتحوّلها من واجهة استعراض إلى واجهة تشغيل
- كما أنها تمهّد لكل شيء لاحق:
  - prescriptions
  - orders
  - documents

---

## الخلاصة
إذا أردنا أعلى أثر بأقل تشتيت، فلا ينبغي أن نبدأ من المكتبة أو الوثائق أو التحسينات الثانوية. البداية الصحيحة هي:

- `Lifecycle الزيارة نفسها`

ثم:

- `Clinical payload داخل الزيارة`

ثم:

- `Documents / Templates / Architecture polish`

وهذا هو الترتيب الأكثر أمانًا ومنطقية واحترافية للمشروع الحالي.
