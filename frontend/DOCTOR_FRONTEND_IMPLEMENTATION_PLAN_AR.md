# خطة تنفيذ صفحات الطبيب مرتبة بالأولوية

هذه الخطة مبنية على الفجوات الموثقة في:

- [DOCTOR_FRONTEND_API_GAP_ANALYSIS_AR.md](C:/Users/Abdalmoute/OneDrive/Desktop/lmj_health_web/frontend/DOCTOR_FRONTEND_API_GAP_ANALYSIS_AR.md:1)

الهدف هو نقل صفحات الطبيب من تغطية تشغيلية أساسية إلى تغطية متوافقة فعليًا مع قدرات الـ backend الحالية، مع ترتيب التنفيذ بحسب:

1. أعلى أثر على الاستخدام اليومي للطبيب
2. أقل مخاطرة على الصفحات الحالية
3. أفضل تسلسل لبناء الأساسات قبل الميزات المعقدة

## المبادئ التنفيذية

- نبدأ أولًا بالميزات التي لها API جاهز واضح وواجهة ناقصة فقط.
- نؤجل الـ encounter workflow الكامل إلى ما بعد تجهيز الملفات والأنواع وإعادة الجدولة، لأنه أكبر مسار وظيفي.
- كل مرحلة يجب أن تنتهي بـ:
  - تكامل API مكتمل
  - UI usable
  - حالات loading/error/empty
  - تحديث query cache بشكل صحيح

## المرحلة 1: إغلاق الفجوات السريعة وعالية العائد

### الأولوية

عالية جدًا

### الهدف

استكمال الميزات الموجودة أصلًا في الصفحات الحالية لكن بشكل ناقص أو غير مكتمل، بدون إدخال workflow سريري كبير جديد.

### العناصر

#### 1. تحسين إعادة جدولة الموعد

العمل المطلوب:

- ربط `RescheduleAppointmentDialog` مع `useSlots(date, "free")`
- استبدال حقل الوقت الحر بإظهار الأوقات المتاحة فقط
- إضافة اختيار `appointmentTypeId` داخل dialog إعادة الجدولة
- منع اختيار وقت غير متاح أو ماضٍ
- تحديث بطاقة الموعد بعد نجاح العملية عبر refetch للتفاصيل

الملفات المرجحة:

- `frontend/src/components/doctor/appointments/reschedule-appointment-dialog.tsx`
- `frontend/src/pages/doctor/appointments/DoctorAppointmentsPage.tsx`
- `frontend/src/hooks/doctor/useAppointmentTypes.ts`

الأثر:

- تقليل أخطاء الإرسال
- مطابقة سلوك الواجهة مع قواعد الـ backend

#### 2. تمكين تعديل السجل الطبي

العمل المطلوب:

- إضافة وضع `edit` في صفحة السجلات الطبية
- استخدام `useUpdateDoctorMedicalRecord`
- فتح dialog أو form معبأ بالقيم الحالية
- تحديث القائمة والتفاصيل بعد الحفظ

الملفات المرجحة:

- `frontend/src/pages/doctor/medical-records/DoctorMedicalRecordsPage.tsx`
- `frontend/src/components/doctor/medical-records/create-medical-record-form.tsx`

الأثر:

- إغلاق فجوة functional مهمة موجود endpoint لها بالفعل

#### 3. إصلاح payload إنشاء السجل الطبي

العمل المطلوب:

- مراجعة الحقول الموجودة في form
- إزالة الحقول الوهمية غير المرسلة أو تحويلها إلى payload حقيقي
- توضيح ما سيتم حفظه فعلًا
- عدم إبقاء قسم أدوية يبدو وكأنه يعمل بينما لا يدخل في الطلب

القرار الأفضل في هذه المرحلة:

- إما تبسيط النموذج ليتوافق مع body الحالي
- أو توسيع integration إذا قررنا استغلال `attachments/prescriptions` بشكل أفضل

الأثر:

- منع تضليل المستخدم
- جعل السجل الطبي متماسكًا بين UI وAPI

## المرحلة 2: ملفات المرضى وملفات المواعيد

### الأولوية

عالية

### الهدف

تفعيل إدارة الملفات لأنها مدعومة جيدًا في الـ backend وتمثل فجوة واضحة في الاستخدام اليومي.

### العناصر

#### 1. ملفات المريض

العمل المطلوب:

- إضافة client methods إذا لزم لاستدعاء:
  - `POST /api/patients/:patientId/files/upload`
  - `GET /api/patients/:patientId/files`
  - `GET /api/patients/:patientId/files/:fileId`
  - `GET /api/patients/:patientId/files/:fileId/download`
  - `DELETE /api/patients/:patientId/files/:fileId`
  - أو alias doctor download-url عند الحاجة
- إضافة تبويب ملفات فعلي داخل بطاقة المريض:
  - رفع ملف
  - تنزيل ملف
  - عرض metadata
  - أرشفة/حذف

الملفات المرجحة:

- `frontend/src/lib/doctor/client.ts`
- `frontend/src/lib/doctor/types.ts`
- `frontend/src/hooks/doctor/*`
- `frontend/src/components/doctor/patients/doctor-patient-expandable-card.tsx`
- `frontend/src/pages/doctor/patients/DoctorPatientsPage.tsx`

#### 2. ملفات الموعد

العمل المطلوب:

- إضافة API integration لـ:
  - upload
  - list
  - details
  - download
  - unlink
- تحويل قسم ملفات الموعد من عرض static إلى إدارة فعلية

الملفات المرجحة:

- `frontend/src/lib/doctor/client.ts`
- `frontend/src/lib/doctor/types.ts`
- `frontend/src/hooks/doctor/useDoctorAppointmentsApi.ts`
- `frontend/src/components/doctor/appointments/doctor-appointment-expandable-card.tsx`

الأثر:

- يفتح استخدامًا حقيقيًا للمرفقات بدل مجرد القراءة

## المرحلة 3: إدارة أنواع المواعيد

### الأولوية

عالية إلى متوسطة

### الهدف

إضافة شاشة إدارة appointment types للطبيب بدل الاكتفاء باستخدامها أثناء الحجز.

### العناصر

- إنشاء صفحة أو section جديدة لإدارة أنواع المواعيد
- عرض القائمة عبر `GET /api/doctors/:doctorId/appointment-types`
- إنشاء نوع موعد
- تعديل:
  - الاسم
  - السعر
  - إظهار السعر للمريض
  - التفعيل/التعطيل
- حذف ناعم
- ربط أي تحديث مباشرة بنوافذ الحجز وإعادة الجدولة

الملفات المرجحة:

- `frontend/src/pages/doctor/appointments/DoctorAppointmentsPage.tsx` أو صفحة مستقلة جديدة
- `frontend/src/hooks/doctor/useAppointmentTypes.ts`
- `frontend/src/lib/doctor/types.ts`

الأثر:

- يقلل اعتماد الفريق على seed/manual backend setup
- يجعل الحجز وإعادة الجدولة أكثر مرونة

## المرحلة 4: تحسين صفحة المرضى حول حالات العلاقة والوصول

### الأولوية

متوسطة

### الهدف

رفع دقة صفحة المرضى بحيث تعكس حالة الوصول الفعلية بدل الحالات التقديرية أو الـ placeholders.

### العناصر

#### 1. تحسين access request flow

- إظهار تفاصيل الطلب عبر `GET /api/access-requests/:id`
- دعم `items[]` و `expiresAt` عند إنشاء الطلب إن أردنا استغلال الـ backend كاملًا
- عرض حالة الطلب بشكل أوضح

#### 2. ربط `active-encounter` فعليًا

- جلب حالة encounter الحالية للمريض
- إزالة `TODO` الحالي
- جعل فلتر `active-encounter` مبنيًا على بيانات backend حقيقية

#### 3. توسيع تفاصيل profile

- إظهار تفاصيل أدق للـ medications
- إظهار تفاصيل أدق للـ orders
- إظهار إجراءات على الملفات

الأثر:

- يجعل صفحة المرضى مركزًا فعليًا لإدارة العلاقة بين الطبيب والمريض

## المرحلة 5: encounter workflow الكامل

### الأولوية

متوسطة إلى عالية وظيفيًا، لكن مؤجلة زمنيًا لأنها أكبر كتلة عمل

### الهدف

إدخال المسار السريري الحديث الموجود في الـ backend إلى الفرونت بشكل صحيح.

### العناصر

#### 1. encounters

- list encounters للمريض
- create encounter
- detail encounter
- update encounter
- close encounter

#### 2. prescriptions داخل encounter

- list/create/update
- item CRUD
- duplicate
- finalize
- preview

#### 3. orders داخل encounter

- lab/imaging/procedure/referral
- detail/update
- item CRUD
- finalize
- preview

#### 4. encounter documents

- list documents
- link patient file/document
- share document with patient

القرار التصميمي المقترح:

- لا نبدأ بـ full workflow داخل صفحة المرضى الحالية مباشرة
- الأفضل إنشاء route أو workspace سريري مخصص للطبيب

أمثلة مسارات مناسبة:

- `/doctor/patients/:patientId/encounters`
- `/doctor/patients/:patientId/encounters/:encounterId`

الأثر:

- هذا هو أكبر انتقال معماري بين الواجهة الحالية والـ backend الحالي

## المرحلة 6: تحسينات ثانوية

### الأولوية

منخفضة

### العناصر

- استغلال query `name` في صفحة المرضى بجانب `search`
- تحسين عرض metadata للمواعيد:
  - `cancelledAt`
  - `cancelReason`
  - `rescheduledAt`
  - `rescheduleReason`
  - `completedAt`
  - `noShowAt`
- استغلال `booked/all slots` بشكل أوسع في صفحة الجدول
- تحسين تسمية الواجهة:
  - زيارة
  - استشارة
  - encounter

## ترتيب التنفيذ المقترح النهائي

1. إعادة جدولة الموعد بشكل صحيح + `appointmentTypeId`
2. تعديل السجل الطبي + إصلاح payload إنشاء السجل
3. ملفات المرضى
4. ملفات المواعيد
5. إدارة أنواع المواعيد
6. تحسين access requests وحالة `active-encounter`
7. encounter workflow الكامل
8. التحسينات الثانوية

## تقسيم العمل إلى Sprintات

### Sprint 1

- تحسين إعادة الجدولة
- تعديل السجل الطبي
- إصلاح create medical record form

### Sprint 2

- ملفات المرضى
- ملفات المواعيد

### Sprint 3

- إدارة appointment types
- تحسين access request UX

### Sprint 4

- encounters foundation
- active encounter integration

### Sprint 5

- prescriptions
- orders
- documents

## نقطة البداية الموصى بها

أفضل بداية تنفيذية الآن:

1. `RescheduleAppointmentDialog`
2. `DoctorMedicalRecordsPage`
3. `CreateMedicalRecordForm`

السبب:

- أثر عالي
- تغييرات محدودة نسبيًا
- تعتمد على APIs موجودة بالفعل
- ستعطينا momentum سريع قبل الدخول في الملفات وencounters
