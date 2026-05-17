# تحليل فجوات صفحات الطبيب مقابل API

هذا التقرير يطابق بين صفحات الطبيب الحالية في `frontend/src/pages/doctor` وبين قدرات الـ backend الموثقة في `api4_extracted.txt` المستخرج من `API-4.pdf`.

## نطاق الفحص

- صفحة المواعيد: `frontend/src/pages/doctor/appointments/DoctorAppointmentsPage.tsx`
- صفحة المرضى: `frontend/src/pages/doctor/patients/DoctorPatientsPage.tsx`
- صفحة جدول العمل: `frontend/src/pages/doctor/work-schedule/DoctorWorkSchedulePage.tsx`
- صفحة السجلات الطبية: `frontend/src/pages/doctor/medical-records/DoctorMedicalRecordsPage.tsx`
- المكوّنات والدialogs المرتبطة
- طبقة التكامل:
  - `frontend/src/lib/doctor/client.ts`
  - `frontend/src/lib/doctor/endpoints.ts`
  - `frontend/src/lib/doctor/types.ts`
  - hooks تحت `frontend/src/hooks/doctor`

## 1. صفحة المواعيد

### المنفذ فعليًا في الفرونت

- عرض قائمة المواعيد مع pagination.
- فلترة حسب:
  - `status`
  - `date`
- بحث محلي فقط داخل النتائج المعروضة حاليًا باستخدام:
  - اسم المريض
  - `patientId`
  - `notes`
- تفاصيل الموعد عبر `GET /api/appointments/:appointmentId`
- حجز موعد عبر `POST /api/appointments/book`
- إلغاء موعد عبر `PATCH /api/appointments/:appointmentId/cancel`
- إعادة جدولة عبر `PATCH /api/appointments/:appointmentId/reschedule`
- إكمال الموعد عبر `PATCH /api/appointments/:appointmentId/complete`
- تعليم الموعد كـ `no-show` عبر `PATCH /api/appointments/:appointmentId/no-show`
- تحميل أنواع المواعيد المتاحة للحجز عبر `GET /doctors/:doctorId/appointment-types/available`
- تحميل `free slots` عند الحجز عبر `GET /doctors/:doctorId/slots?type=free`

### الموجود في الـ API وغير ظاهر أو غير مكتمل في الواجهة

#### إدارة ملفات الموعد غير منفذة

الـ backend يدعم:

- `POST /api/appointments/:appointmentId/files`
- `GET /api/appointments/:appointmentId/files`
- `GET /api/appointments/:appointmentId/files/:fileId`
- `GET /api/appointments/:appointmentId/files/:fileId/download`
- `DELETE /api/appointments/:appointmentId/files/:fileId`

لكن الواجهة الحالية:

- تعرض الملفات المرتبطة فقط إن وُجدت ضمن تفاصيل الموعد.
- لا تتيح رفع ملف للموعد.
- لا تتيح تنزيل الملف.
- لا تتيح عرض metadata مفصل للملف.
- لا تتيح unlink للملف من الموعد.

#### إدارة أنواع المواعيد للطبيب غير منفذة

طبقة `doctorApi` تدعم:

- `GET /api/doctors/:doctorId/appointment-types`
- `POST /api/doctors/:doctorId/appointment-types`
- `PATCH /api/doctors/:doctorId/appointment-types/:typeId`
- `DELETE /api/doctors/:doctorId/appointment-types/:typeId`

لكن الواجهة تستخدم فقط endpoint المتاح للحجز `available`، ولا توجد شاشة لإدارة:

- إنشاء نوع موعد
- تعديل الاسم
- تعديل السعر
- التحكم في `isPriceVisibleToPatient`
- التفعيل/التعطيل `isActive`
- الحذف الناعم

#### إعادة الجدولة غير مربوطة بالـ slots

واجهة إعادة الجدولة تسمح بإدخال:

- `date`
- `startTime`
- `reason`

لكنها لا:

- تجلب `free slots` الخاصة بالتاريخ الجديد.
- تمنع اختيار وقت غير صالح قبل الإرسال.
- تتيح تغيير `appointmentTypeId` رغم أن الـ API يدعمه في reschedule.

#### بحث المواعيد محدود ومحلي

- البحث في الصفحة محلي على العناصر المحمّلة فقط، وليس query حقيقي على الخادم.
- لا يوجد دعم backend ظاهر في التكامل لتمرير:
  - اسم المريض
  - `publicId`
  - الهاتف
  - نوع الموعد
  - سبب الإلغاء
  - سبب إعادة الجدولة

#### معلومات الـ booked/all slots غير مستعملة

الـ API يدعم:

- `type=booked`
- `type=all`
- pagination مع `booked`

لكن الواجهة الحالية تستخدم `free` فقط في الحجز ولا تستفيد من:

- عرض booked slots ليوم معين
- عرض merged timeline
- مقارنة سريعـة بين المتاح والمحجوز

#### بعض حقول الموعد موجودة بالـ API لكن غير مستثمرة بالكامل

الـ API يعيد حقولًا مثل:

- `appointmentType`
- `appointmentTypeNameSnapshot`
- `priceSnapshot`
- `priceVisibleToPatientSnapshot`
- `cancelledAt`
- `cancelledBy`
- `cancelReason`
- `rescheduledAt`
- `rescheduledBy`
- `rescheduleReason`
- `completedAt`
- `noShowAt`

الواجهة تعرض جزءًا منها فقط، ولا يوجد عرض واضح زمني أو تشغيلي لمعظم هذه البيانات.

## 2. صفحة المرضى

### المنفذ فعليًا في الفرونت

- قائمة المرضى عبر `GET /api/doctors/patients`
- الفلاتر الحالية:
  - `search`
  - `diagnosis`
  - `account_status`
  - `from`
  - `to`
  - `page`
  - `limit`
- فلتر واجهي إضافي غير API باسم `relationship`
- إنشاء مريض مؤقت عبر `POST /api/doctors/patients/temp`
- تحميل public profile عبر `GET /api/doctors/patients/:patientId/public`
- محاولة تحميل full profile عبر `GET /api/doctors/:doctorId/patients/:patientId`
- إنشاء access request عند الحاجة

### الموجود في الـ API وغير ظاهر أو غير مكتمل في الواجهة

#### فلتر `name` غير مستغل

الـ API يدعم query parameter مستقلًا باسم `name` بالإضافة إلى `search`.

لكن الواجهة لا ترسله إطلاقًا وتكتفي بـ `search`.

#### بيانات full profile موجودة لكن العرض ناقص

تفاصيل profile الموافق عليها تُرجع:

- `patient`
- `medicalRecords`
- `files`
- `medications`
- `orders`

الواجهة تعرض تبويبات لهذه البيانات، لكن بشكل مختصر جدًا فقط:

- لا تنزيل ملفات
- لا فتح ملف
- لا حذف/أرشفة ملف
- لا تفاصيل Order
- لا preview/order document
- لا تفاصيل medication إضافية مثل:
  - `startDate`
  - `endDate`
  - `notes`
  - `sourceType`
  - `remindersEnabled`

#### لا يوجد تكامل لملفات المريض

الـ backend يدعم:

- `POST /api/patients/:patientId/files/upload`
- `GET /api/patients/:patientId/files`
- `GET /api/patients/:patientId/files/:fileId`
- `GET /api/patients/:patientId/files/:fileId/download`
- `DELETE /api/patients/:patientId/files/:fileId`
- `GET /api/doctors/:doctorId/patients/:patientId/files/:fileId/download-url`

بينما الصفحة الحالية:

- تعرض قائمة ملفات مختصرة فقط ضمن full profile.
- لا يوجد upload.
- لا يوجد download.
- لا يوجد file details.
- لا يوجد archive/delete.

#### لا يوجد تكامل encounter workflow

الـ backend يدعم مسارًا سريريًا حديثًا غنيًا:

- `GET/POST /api/doctors/:doctorId/patients/:patientId/encounters`
- `GET/PATCH /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/close`

لكن الصفحة الحالية:

- تعرض زر "بدء استشارة/زيارة" فقط على مستوى UI.
- الزر الحالي لا يبدأ encounter فعليًا.
- يوجد `TODO` واضح عند `hasActiveEncounter`.
- فلتر `relationship = active-encounter` غير مربوط ببيانات backend حقيقية.

#### لا يوجد تكامل prescriptions داخل encounter

الـ backend يدعم بالكامل:

- list/create/update prescription
- item CRUD
- duplicate item
- finalize
- preview

ولا يوجد في الواجهة الحالية أي شاشة أو dialog أو workflow لهذه العمليات.

#### لا يوجد تكامل orders داخل encounter

الـ backend يدعم:

- lab orders
- imaging orders
- procedure orders
- referral orders
- item CRUD
- finalize
- preview

والواجهة الحالية تعرض فقط summaries بسيطة للطلبات داخل profile، بدون:

- إنشاء
- تعديل
- preview
- finalize
- تفاصيل حسب النوع

#### لا يوجد تكامل encounter documents

الـ backend يدعم:

- `GET /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/link`
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/:documentId/share`

ولا يوجد مقابل فرونت حاليًا.

#### access request مبسط أكثر من الـ backend

الـ API يدعم في access request:

- `reason`
- `items[]`
- `expiresAt`

أما الواجهة الحالية فترسل `reason` فقط، ولا تتيح:

- تحديد requested items
- تحديد تاريخ انتهاء الطلب
- عرض شاشة summary/details للطلب عبر `GET /api/access-requests/:id`
- تحميل approved payload التفصيلي من route details إلا ضمن حالة فتح profile

## 3. صفحة السجلات الطبية

### المنفذ فعليًا في الفرونت

- اختيار مريض واحد
- جلب سجلاته عبر `GET /api/doctors/:doctorId/patients/:patientId/medical-records`
- عرض تفاصيل سجل واحد
- إنشاء سجل جديد عبر `POST /api/doctors/:doctorId/patients/:patientId/medical-records`
- بحث محلي داخل السجلات المحملة حسب:
  - `title`
  - `diagnosis`

### الموجود في الـ API وغير ظاهر أو غير مكتمل في الواجهة

#### تحديث السجل الطبي غير منفذ

الـ backend يدعم:

- `PATCH /api/doctors/:doctorId/patients/:patientId/medical-records/:recordId`

ويوجد hook له (`useUpdateDoctorMedicalRecord`) لكن الصفحة لا تستخدمه ولا يوجد UI للتعديل.

#### حقول إنشاء السجل لا تُطابق غنى الواجهة نفسها

Form الواجهة يحتوي حقولًا عديدة:

- `symptoms`
- `bloodPressure`
- `pulse`
- `temperature`
- `weight`
- `notes`
- `followUpDate`
- قسم أدوية بصري

لكن عند الإرسال يتم تحويل البيانات إلى body مبسط جدًا:

- `title` من `address`
- `diagnosis`
- `prescriptions` من split نص `treatment`
- `followUpRequired` boolean فقط

بالتالي الحقول التالية لا تُرسل فعليًا:

- `symptoms`
- vitals كاملة
- `notes`
- `followUpDate` كقيمة تاريخ
- نموذج الأدوية التفصيلي في البطاقة لا يدخل أصلًا في payload

#### attachments غير منفذة

الـ medical record في الـ API يدعم:

- `attachments`

لكن الصفحة لا تتيح:

- اختيار ملفات
- ربط ملفات موجودة
- تنزيل المرفقات
- تعديلها

#### لا توجد فلاتر خادمية للسجلات

الصفحة تعتمد على:

- اختيار patient
- search محلي

بينما السجل السريري الحديث في الـ backend عمليًا مرتبط أيضًا بـ:

- encounters
- prescriptions
- orders
- documents

وليس هناك filtering أو drill-down يستفيد من هذا الارتباط.

## 4. صفحة جدول العمل

### المنفذ فعليًا في الفرونت

- `GET /api/doctors/:doctorId/schedule`
- `PUT /api/doctors/:doctorId/schedule`
- `PATCH /api/doctors/:doctorId/schedule/settings`
- `POST /api/doctors/:doctorId/schedule/day`
- `PATCH /api/doctors/:doctorId/schedule/day/:day`
- `DELETE /api/doctors/:doctorId/schedule/day/:day`
- `POST /api/doctors/:doctorId/schedule/exception`
- `PATCH /api/doctors/:doctorId/schedule/exceptions`
- `DELETE /api/doctors/:doctorId/schedule/exception/:exceptionId`

### الموجود في الـ API وغير ظاهر أو غير مكتمل في الواجهة

#### لا يوجد استهلاك فعلي لـ booked/all slots داخل صفحة الجدول

الـ API يدعم `GET /api/doctors/:doctorId/slots` مع:

- `type=free`
- `type=booked`
- `type=all`
- pagination لـ booked

لكن صفحة الجدول لا توفر:

- استعراض الحجوزات اليومية الفعلية داخل الجدول
- merged timeline
- مقارنة الاستثناءات مع المواعيد المحجوزة

#### رسائل قيود الـ 409 ليست مستثمرة تشغيليًا

التوثيق يوضح أن تغييرات الجدول قد تُرفض إذا أبطلت مواعيد مستقبلية صالحة.
الواجهة تعرض conflict dialog، لكن ما زال ينقصها عادة:

- عرض قائمة المواعيد المتأثرة من backend إن وُجدت
- اقتراح مسار إصلاحي مباشر
- الربط السريع بصفحة المواعيد مع اليوم/الفترة المتأثرة

#### alias deprecated غير مستخدم

يوجد alias deprecated:

- `PATCH /api/doctors/:doctorId/schedule`

والواجهة لا تحتاجه حاليًا، وهذا جيد، لكن يجب الانتباه أن backend ما زال يدعمه.

## 5. فجوات عرض/نمذجة عامة

### فجوات في `types.ts`

بعض النماذج في الفرونت أبسط من السعة الفعلية للـ backend، مثل:

- `DoctorPatientMedication`
- `DoctorPatientOrder`
- `DoctorPatientFile`
- `DoctorPatientMedicalRecord`

وهذا يحد من بناء UI أغنى حتى لو كانت البيانات متاحة.

### وظائف backend موجودة في client وغير مستعملة في الصفحات

- appointment types CRUD
- update medical record
- slots `type=booked|all`
- patient file routes غير ممثلة في `doctorApi` بشكل كامل على مستوى UI workflow

## 6. أهم الفجوات ذات الأولوية

### أولوية عالية

1. ربط encounter workflow فعليًا من صفحة المرضى.
2. تنفيذ patient files upload/download/delete من بطاقة المريض.
3. تنفيذ appointment files upload/download/unlink من بطاقة الموعد.
4. تنفيذ update medical record بدل الاكتفاء بالإنشاء.
5. ربط reschedule dialog بالـ free slots + appointmentTypeId.

### أولوية متوسطة

1. إنشاء شاشة إدارة `appointment types`.
2. توسيع عرض full profile ليشمل تفاصيل orders/medications/files.
3. استهلاك `booked/all slots` في صفحة الجدول والمواعيد.
4. دعم access request fields الإضافية: `items[]`, `expiresAt`.

### أولوية منخفضة

1. دعم query `name` في صفحة المرضى بجانب `search`.
2. تحسين عرض audit/status metadata للمواعيد.
3. توحيد تسمية "استشارة/زيارة/encounter" في الواجهة لتطابق الـ backend.

## الخلاصة

الواجهة الحالية تغطي الأساسيات التشغيلية للطبيب في:

- قائمة المرضى
- المواعيد
- الجدول الأسبوعي
- إنشاء وعرض السجلات الطبية

لكن الـ backend صار أوسع بوضوح من الفرونت في أربعة محاور كبيرة:

1. `Encounter-centered workflow`
2. `Patient files`
3. `Appointment files`
4. `Appointment types management`

أكبر فجوة وظيفية الآن هي أن الواجهة ما زالت تعتمد منطق "ملف مريض + موعد + سجل طبي" بصورة مبسطة، بينما الـ backend انتقل إلى نموذج سريري أغنى قائم على `encounters`, `prescriptions`, `orders`, و`documents`.
