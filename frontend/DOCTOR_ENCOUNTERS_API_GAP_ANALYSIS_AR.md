# تحليل فجوات صفحة الزيارات الطبية للطبيب مقابل API

## الهدف
هذا التقرير يراجع مسارات `Encounter-Centered Clinical Workflow` الخاصة بالطبيب في ملف `API-4.pdf`، ثم يقارنها بالتنفيذ الحالي في واجهة صفحة `الزيارات الطبية` داخل المشروع، لاكتشاف:

- ما الذي يدعمه الـ Backend وغير منفذ في الـ Frontend
- ما الذي يظهر في الـ Frontend لكنه غير مدعوم مباشرة من الـ Backend
- ما الذي تم ربطه فعليًا وما يزال ناقصًا أو غير مكتمل

---

## أساس المراجعة
تمت المراجعة بالاعتماد على:

- ملف `API-4.pdf`
- صفحة الزيارات الطبية الحالية
- مكوّنات `encounters`
- hook تجميع الزيارات
- طبقة `doctor client` و`types`

المراجع البرمجية الأساسية:

- [DoctorEncountersPage.tsx](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/pages/doctor/encounters/DoctorEncountersPage.tsx:1)
- [useDoctorMedicalVisitsPage.ts](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/hooks/doctor/useDoctorMedicalVisitsPage.ts:1)
- [medical-visits.ts](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/lib/doctor/medical-visits.ts:1)
- [medical-visit-expandable-card.tsx](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/components/doctor/encounters/medical-visit-expandable-card.tsx:1)
- [client.ts](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/lib/doctor/client.ts:823)
- [types.ts](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/lib/doctor/types.ts:344)

المراجع المؤكدة من الـ PDF:

- `GET /api/doctors/:doctorId/patients/:patientId/encounters`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters`
- `GET /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`
- `PATCH /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/close`
- مسارات prescriptions المرتبطة بالزيارة
- مسارات orders المرتبطة بالزيارة
- مسارات documents المرتبطة بالزيارة
- `doctor library`
- `doctor templates`

---

## ما هو منفذ حاليًا في الـ Frontend

### 1. عرض قائمة الزيارات الطبية
الواجهة الحالية تعرض قائمة زيارات طبية للطبيب مع:

- تبويبات حالة: `الكل / نشطة / مغلقة`
- فلترة تاريخ من/إلى
- ترتيب حسب:
  - `startedAt`
  - `createdAt`
- عرض بطاقة لكل زيارة

### 2. مصدر البيانات الحالي
الربط الحالي لا يعتمد على endpoint عام للزيارات على مستوى الطبيب، بل يقوم بما يلي:

- يجلب قائمة المرضى أولًا
- ثم يرسل طلب `listEncounters` لكل مريض على حدة
- ثم يدمج النتائج محليًا في الواجهة

هذا السلوك موجود في:

- [useDoctorMedicalVisitsPage.ts](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/hooks/doctor/useDoctorMedicalVisitsPage.ts:38)

### 3. ما تم ربطه فعليًا من الـ API
المسار المربوط فعليًا الآن هو فقط:

- `GET /api/doctors/:doctorId/patients/:patientId/encounters`

مع Query Params:

- `status`
- `dateFrom`
- `dateTo`
- `sortBy`
- `sortOrder`
- `page`
- `limit`

### 4. شكل البيانات المستخدمة حاليًا
الواجهة الحالية تبني بطاقة الزيارة من بيانات مختصرة جدًا:

- حالة الزيارة
- نوع المصدر `origin`
- تاريخ البدء
- الموعد المرتبط إن وجد
- اسم المريض
- رقم ملف تقريبي

ثم تضيف فوق ذلك بعض القيم المحلية أو التجريبية أثناء التحويل.

---

## ما يدعمه الـ Backend وغير منفذ في الـ Frontend

## أولوية عالية

### 1. إنشاء زيارة طبية جديدة غير منفذ
الـ Backend يدعم:

- `POST /api/doctors/:doctorId/patients/:patientId/encounters`

لكن الواجهة الحالية لا تنشئ الزيارة فعليًا.

الوضع الحالي:

- زر `زيارة جديدة` في الصفحة لا يستدعي الـ API
- يعرض فقط `toast` معلوماتي يقول إن الربط سيتم لاحقًا

الموضع:

- [DoctorEncountersPage.tsx](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/pages/doctor/encounters/DoctorEncountersPage.tsx:91)

النتيجة:

- أهم فعل أساسي في الصفحة غير مربوط أصلًا

### 2. جلب تفاصيل زيارة واحدة غير منفذ
الـ Backend يدعم:

- `GET /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`

لكن الواجهة الحالية لا تستخدم هذا المسار إطلاقًا.

النتيجة:

- الكارد الموسع لا يعرض `detail payload` حقيقي للزيارة
- الصفحة تعمل حاليًا على `summary list payload` فقط

### 3. تعديل بيانات الزيارة غير منفذ
الـ Backend يدعم:

- `PATCH /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`

لتحرير:

- `origin`
- `notes`

لكن لا يوجد في الواجهة:

- زر تعديل encounter
- dialog تعديل
- mutation update encounter

### 4. إغلاق الزيارة غير منفذ
الـ Backend يدعم:

- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/close`

مع قواعد مهمة:

- الإغلاق يُمنع إذا بقيت `draft prescriptions`
- الإغلاق يُمنع إذا بقيت `draft encounter orders`

لكن الواجهة الحالية لا تقدم:

- زر إغلاق encounter
- فحص حالة الإغلاق
- عرض أسباب فشل الإغلاق
- workflow واضح لإنهاء draft work قبل الإغلاق

### 5. Workflow الوصفات داخل الزيارة غير منفذ
الـ Backend يدعم سطحًا كاملًا للوصفات المرتبطة بالزيارة:

- list prescriptions
- create draft prescription
- get prescription
- update prescription
- add item
- update item
- delete item
- duplicate item
- finalize prescription
- preview prescription

المسارات الأساسية:

- `GET /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions`
- `PATCH /.../prescriptions/:prescriptionId`
- `POST /.../items`
- `PATCH /.../items/:itemId`
- `DELETE /.../items/:itemId`
- `POST /.../items/:itemId/duplicate`
- `POST /.../finalize`
- `GET /.../preview`

بينما صفحة الزيارات الحالية لا تنفذ أي جزء من هذا المسار.

### 6. Workflow الطلبات داخل الزيارة غير منفذ
الـ Backend يدعم:

- list encounter orders
- create lab order
- create imaging order
- create procedure order
- create referral order
- get order
- update order
- add item
- update item
- delete item
- finalize order
- preview order

المسارات الأساسية:

- `GET /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders`
- `POST /.../orders/lab`
- `POST /.../orders/imaging`
- `POST /.../orders/procedures`
- `POST /.../orders/referrals`
- `PATCH /.../orders/:orderId`
- `POST /.../orders/:orderId/finalize`
- `GET /.../orders/:orderId/preview`

لكن صفحة الزيارات الحالية لا تقدم أي integration لهذه الإمكانيات.

### 7. وثائق الزيارة الطبية غير منفذة
الـ Backend يدعم:

- `GET /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/link`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/:documentId/share`

هذا يعني أن الزيارة الطبية في الـ Backend قادرة على:

- ربط ملف مريض موجود بالزيارة
- توليد وربط PDF مدعوم
- مشاركة الوثيقة مع المريض

لكن صفحة الزيارات الحالية لا تعرض:

- documents tab
- linked documents list
- share action
- link/generate flow

---

## أولوية متوسطة

### 8. Doctor Library غير منفذ
الـ Backend يدعم:

- `GET /api/doctors/library/recent`
- `GET /api/doctors/library/items`
- `POST /api/doctors/library/items`
- `GET /api/doctors/library/items/:itemId`
- `PATCH /api/doctors/library/items/:itemId`
- `DELETE /api/doctors/library/items/:itemId`
- `PATCH /api/doctors/library/items/:itemId/favorite`

لكن الواجهة الحالية للزيارات الطبية لا تستثمر هذا إطلاقًا.

الأثر:

- الطبيب لا يملك مكتبة سريعة لعناصر متكررة أثناء العمل السريري

### 9. Doctor Templates غير منفذ
الـ Backend يدعم:

- `GET /api/doctors/templates`
- `POST /api/doctors/templates`
- `GET /api/doctors/templates/:templateId`
- `PATCH /api/doctors/templates/:templateId`
- `DELETE /api/doctors/templates/:templateId`
- `POST /api/doctors/templates/:templateId/apply`

لكن لا يوجد في الواجهة:

- templates picker
- save as template
- apply template to draft payload

### 10. Preview / Finalize lifecycle غير منفذ
في كل من:

- prescriptions
- encounter orders

الـ Backend يدعم:

- `preview`
- `finalize`

لكن الواجهة لا تعرض هذه الدورة نهائيًا، وبالتالي لا يستفيد المستخدم من:

- مرحلة المعاينة قبل الاعتماد
- الفصل بين draft وfinalized

---

## ما يظهر في الـ Frontend لكنه غير مدعوم أو غير مربوط مباشرة بالـ Backend

### 1. مفهوم “صفحة كل زيارات الطبيب” لا يملك endpoint عام مباشر
حتى بعد مراجعة الـ PDF، المسار الموثق هو:

- `list encounters for one linked patient`

ولم يظهر endpoint موثق بصيغة:

- `GET /api/doctors/:doctorId/encounters`

هذا يعني أن صفحة الزيارات الحالية في الفرونت تمثل مفهومًا أوسع من السطح الموثق في الـ Backend.

النتيجة:

- تم بناء الصفحة عبر تجميع نتائج `encounters` لكل مريض
- وليس عبر endpoint واحد رسمي للصفحة نفسها

هذا استنتاج مهم من الـ PDF ومن التنفيذ الحالي معًا.

### 2. البحث الحالي محلي فقط وليس Backend search
الواجهة الحالية تعرض حقل بحث في صفحة الزيارات، لكنه:

- يبحث محليًا داخل النتائج المحمّلة فقط
- لا يوجد له query param مقابل في الـ API الموثق

هذا يعني أن البحث الموجود `Frontend-only behavior`
وليس `API-backed search`

### 3. الإحصاءات الحالية ليست إحصاءات Backend حقيقية
إحصاءات الصفحة مثل:

- الكل
- نشطة
- مغلقة

يتم اشتقاقها من العناصر المحمّلة داخل الصفحة نفسها بعد التجميع، وليس من endpoint إحصائي مخصص.

النتيجة:

- الأرقام ليست موثوقة عند وجود مرضى أكثر من الحد الذي تحمله الصفحة

### 4. العدادات داخل draft section غير مبنية على Backend حقيقي
داخل بطاقة الزيارة يوجد قسم:

- `مسودات الزيارات`
- مع عدادات:
  - وصفات
  - تحاليل
  - أشعة

لكن هذه القيم في التنفيذ الحالي ليست ناتجة عن encounter detail حقيقي، بل يتم بناؤها محليًا أثناء mapping.

الموضع:

- [medical-visits.ts](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/src/lib/doctor/medical-visits.ts:101)

النتيجة:

- الواجهة توحي بوجود draft workflow متكامل، بينما backend data الخاصة به غير مربوطة هنا فعليًا

### 5. زر “استكمال المسودة” غير مربوط بمسار Draft حقيقي
الزر الحالي:

- `استكمال المسودة`

ينقل الطبيب إلى صفحة ملف المريض، وليس إلى محرر draft encounter حقيقي.

هذا يعني:

- يوجد سلوك UI
- لكن لا يوجد workflow encounter draft editor حقيقي وراءه

### 6. الانتقال بـ `openEncounters` غير مستثمر فعليًا
صفحة الزيارات ترسل:

- `state: { openEncounters: true }`

أثناء الانتقال إلى ملف المريض، لكن لا يوجد استهلاك واضح لهذا المفتاح في صفحة ملف المريض.

بالتالي هذا سلوك فرونت غير مكتمل.

---

## مشكلات معمارية في التنفيذ الحالي

### 1. الصفحة مبنية على N+1 requests
بدل endpoint واحد عام للزيارات، التنفيذ الحالي:

- يحمّل مرضى
- ثم يرسل query encounters لكل مريض

النتيجة:

- حمل زائد على الشبكة
- تعقيد أعلى في إدارة التحميل والأخطاء
- بطء محتمل مع ازدياد المرضى

### 2. الصفحة محدودة بعدد مرضى قليل
الهوك الحالي يضع:

- `MAX_PATIENTS_FOR_ENCOUNTERS = 12`

هذا يعني أن صفحة الزيارات لا تمثل كل مرضى الطبيب عند النمو.

### 3. الصفحة محدودة بعدد encounters لكل مريض
لكل مريض يتم استخدام:

- `limit: 20`

وبالتالي:

- النتائج الإجمالية ليست شاملة
- الصفحة ليست true complete encounters index

### 4. حالة الخطأ في encounter queries الجزئية غير ممثلة بدقة
الحالة العامة `isError` مأخوذة من `patientsQuery` فقط، وليس من فشل encounter queries الجزئية لكل مريض.

النتيجة:

- قد تفشل بعض استعلامات المرضى دون أن تعكس الصفحة ذلك كمشكلة كلية واضحة

---

## أشياء منفذة جزئيًا وتحتاج استكمال

### 1. الفلاتر
المنفذ حاليًا:

- status
- dateFrom
- dateTo
- sortBy
- sortOrder

وهو متوافق جيدًا مع الـ API الموثق.

لكن غير المنفذ:

- pagination فعلية على مستوى encounter index الكامل
- search API-backed

### 2. encounter summary mapping
الواجهة تستفيد من:

- `status`
- `origin`
- `appointment summary`

وهذا جيد.

لكن لا يوجد استثمار كافٍ لـ:

- `closedAt`
- detail payload
- encounter-level derived state

### 3. active encounter state
تم استثماره جزئيًا داخل ملف المريض، لكن في قائمة المرضى العامة ما زال غير متكامل بالكامل.

---

## الفجوات مرتبة بالأولوية التنفيذية

### المرحلة 1

1. ربط `POST create encounter`
2. ربط `GET encounter detail`
3. ربط `PATCH encounter`
4. ربط `POST close encounter`

### المرحلة 2

5. ربط encounter prescriptions workflow
6. ربط encounter orders workflow
7. ربط preview/finalize states

### المرحلة 3

8. ربط encounter documents
9. ربط doctor templates
10. ربط doctor library

### المرحلة 4

11. إعادة تصميم صفحة الزيارات لتفادي N+1 aggregation
12. إما:
   - طلب endpoint عام للزيارات على مستوى الطبيب من الـ Backend
   - أو اعتماد pagination/aggregation strategy أوضح ومدروسة

---

## الخلاصة المهنية
صفحة `الزيارات الطبية` الحالية في الفرونت ليست ربطًا كاملاً مع نظام `encounters` في الـ Backend، بل هي:

- `واجهة عرض أولية`
- فوق `list encounters per patient`
- مع بعض طبقات UI توحي بوجود Workflow سريري أوسع

بينما الـ Backend الفعلي يدعم منظومة أعمق بكثير تشمل:

- encounter lifecycle
- draft/finalize workflow
- prescriptions داخل الزيارة
- orders داخل الزيارة
- documents داخل الزيارة
- templates
- library

أكبر فجوة حاليًا:

- الواجهة تعرض `encounters as a page`
- لكن لا تشغّل `encounter as a clinical workflow`

وهذا هو الفرق الجوهري الذي ينبغي معالجته في المرحلة القادمة.
