# تدقيق تغطية Endpoints لداشبورد الطبيب فقط

## النطاق

هذا التقرير يطبق البروميت على **الـ endpoints المرتبطة مباشرة بصفحة داشبورد الطبيب** فقط:

- route: `/doctor/dashboard`
- page: `frontend/src/pages/doctor/dashboard/DoctorDashboardPage.tsx`
- shell component: `frontend/src/components/doctor/dashboard/home-doctor.tsx`
- hooks/live data المستخدمة داخل الصفحة نفسها

لا يشمل هذا التقرير بقية صفحات بوابة الطبيب مثل:

- المرضى
- المواعيد كصفحة مستقلة
- الملف الشخصي
- السجل الطبي
- الزيارات
- السكرتارية

## ملخص تنفيذي

- تمّت مراجعة **6 قدرات/عناقيد API** مرتبطة مباشرة بالداشبورد.
- الحالة الحالية:
  - `1` مكتمل
  - `4` جزئي
  - `1` مفقود
  - `0` غير منطبق
- أكبر فجوة حالية أن الداشبورد ما يزال يعتمد جزئيًا على `api_mock` بدل endpoints الطبيب الحقيقية.
- أهم مشكلة وظيفية: بطاقات الإحصاءات السفلية وبعض إحصاءات الأعلى لا تُغذّى من API canonical للطبيب.
- أهم مشكلة عقد/تكامل: fallback إلى mock appointments عندما تُرجع الـ API قائمة فارغة فعليًا قد يخفي حالة "لا يوجد بيانات".

## مصفوفة التغطية

| المجال | Method | Path | الحالة | دليل الواجهة | ملاحظات |
|---|---|---|---|---|---|
| Dashboard snapshot | `GET` | `/api/doctors/home/snapshot` | ✅ مكتمل | `lib/doctor/homeSnapshot.ts`, `hooks/doctor/useDoctorHomeSnapshot.ts`, `components/doctor/dashboard/home-doctor.tsx` | مربوط فعليًا ويغذي KPIs الرئيسية |
| Dashboard stats | `GET` | `/api/doctors/analytics/summary` | ❌ مفقود | `hooks/doctor/useDashboardStats.ts` | الداشبورد لا يستخدم endpoint التحليلات، بل `api_mock.getDashboardStats()` |
| Today appointments | `GET` | `/api/appointments` | ⚠️ جزئي | `hooks/doctor/useDoctorAppointmentsApi.ts`, `lib/doctor/client.ts`, `components/doctor/dashboard/home-doctor.tsx` | يوجد ربط live، لكن الصفحة تعمل fallback إلى mock إذا كانت القائمة live فارغة |
| Quick patient search | `GET` | `/api/doctors/patients` | ✅ مكتمل | `hooks/doctor/useDashboardPatientsSearch.ts`, `hooks/doctor/useDoctorPatients.ts`, `lib/doctor/client.ts` | البحث السريع على مرضى الطبيب مربوط بالواجهة |
| Active consultation summary | `GET` | `/api/doctors/home/snapshot` + consultation flows | ⚠️ جزئي | `components/doctor/dashboard/home-doctor.tsx` | الداشبورد يقرأ summary فقط من snapshot، بدون flow حي داخل الصفحة |
| Waitlist summary | `GET` | `/api/doctors/home/snapshot` + waitlist endpoints | ⚠️ جزئي | `components/doctor/dashboard/home-doctor.tsx` | يعرض nearest waitlist request فقط، بلا تكامل أعمق من داخل الداشبورد |

## الفجوات التفصيلية

### 1) إحصاءات الداشبورد التحليلية

- **Backend:** `GET /api/doctors/analytics/summary`
- **الغرض:** مصدر canonical لملخصات الطبيب التحليلية
- **الحالة الحالية:** `frontend/src/hooks/doctor/useDashboardStats.ts` يستخدم `api_mock.getDashboardStats()` فقط
- **نوع الفجوة:** `mock only`
- **الأولوية:** `P0`
- **الأثر:** بطاقات مثل عدد السجلات الطبية والمؤشرات العامة ليست قادمة من backend الحقيقي
- **الإصلاح المقترح:**
  - إضافة client/hook لطرف `GET /api/doctors/analytics/summary`
  - استبدال `useDashboardStats` بمصدر live
  - حذف الاعتماد على `api_mock` من الداشبورد

### 2) مواعيد اليوم في الداشبورد

- **Backend:** `GET /api/appointments`
- **الغرض:** جلب المواعيد لليوم الحالي للطبيب
- **الحالة الحالية:** يوجد ربط live عبر `useDoctorAppointmentsApi`، لكن `home-doctor.tsx` يستخدم:
  - `apiAppointments.length ? apiAppointments : mockAppointments`
- **نوع الفجوة:** `mock fallback / incorrect empty-state behavior`
- **الأولوية:** `P0`
- **الأثر:** إذا رجعت API الحقيقية قائمة فارغة بشكل صحيح، الواجهة قد تستبدلها ببيانات mock وتعرض حالة مضللة
- **الإصلاح المقترح:**
  - إزالة fallback إلى `useAppointments`
  - اعتماد empty state حقيقي عندما تكون `apiAppointments.length === 0`
  - الإبقاء على mock فقط في وضع تطوير صريح إن لزم

### 3) بطاقات التقييم ونسبة الحضور

- **Backend المتوقع:** `GET /api/doctors/analytics/summary` وربما endpoints تحليلات/مراجعات ذات صلة
- **الحالة الحالية:** داخل `frontend/src/components/doctor/dashboard/home-doctor.tsx`
  - `4.9/5`
  - `94%`
  - مكتوبة كقيم ثابتة hardcoded
- **نوع الفجوة:** `no client / hardcoded UI`
- **الأولوية:** `P1`
- **الأثر:** الواجهة توحي ببيانات حقيقية بينما هي ثابتة
- **الإصلاح المقترح:**
  - ربط القيم بمصدر backend حقيقي أو إخفاؤها مؤقتًا
  - في حال عدم وجود endpoint واضح، توثيقها كـ deferred UI

### 4) الاستشارات النشطة داخل الداشبورد

- **Backend:** يظهر في API-3 وجود consultation flows (`/consultations`, `/consultations/:ticketId`, messages, status...)
- **الحالة الحالية:** الداشبورد يعرض ملخصًا محدودًا من `snapshot.activeConsultation`
- **نوع الفجوة:** `partial workflow`
- **الأولوية:** `P1`
- **الأثر:** بطاقة الاستشارة النشطة informative فقط، وليست نقطة دخول كاملة إلى workflow حي من الداشبورد
- **الإصلاح المقترح:**
  - ربط البطاقة بتنقل مباشر إلى consultation/encounter المناسب
  - أو تغذيتها من hook موحد يربط snapshot مع consultation state الفعلية

### 5) قائمة الانتظار داخل الداشبورد

- **Backend:** API-3 يذكر waitlist endpoints (`GET /waitlist`, `GET /waitlist/me`, `PATCH /waitlist/:id/contacted`, ... )
- **الحالة الحالية:** الداشبورد يقرأ `nearestWaitlistRequest` فقط من snapshot
- **نوع الفجوة:** `summary only`
- **الأولوية:** `P2`
- **الأثر:** لا يوجد تعامل غني من الداشبورد مع waitlist beyond summary
- **الإصلاح المقترح:**
  - إضافة deep-link واضح إلى صفحة waitlist عندما تصبح ضمن نطاق الطبيب
  - أو الاكتفاء بالملخص مع توضيح أنه summary card فقط

## ما هو مكتمل وجيد

### Snapshot الرئيسي للداشبورد

- `frontend/src/lib/doctor/homeSnapshot.ts`
- `frontend/src/hooks/doctor/useDoctorHomeSnapshot.ts`
- `frontend/src/components/doctor/dashboard/home-doctor.tsx`

هذا الربط جيد، لأن:

- endpoint حي
- hook واضح
- UI يستخدم النتيجة فعليًا
- هناك loading/error state أساسي

### بحث المرضى السريع

- `frontend/src/hooks/doctor/useDashboardPatientsSearch.ts`
- `frontend/src/hooks/doctor/useDoctorPatients.ts`
- `frontend/src/lib/doctor/client.ts`

هذا المسار يبدو مربوطًا live بشكل سليم، ويخدم الداشبورد مباشرة.

## أولويات التنفيذ المقترحة

1. استبدال `useDashboardStats` من mock إلى endpoint تحليلي حقيقي للطبيب.
2. حذف fallback من `useAppointments` داخل `home-doctor.tsx`.
3. تحويل القيم hardcoded (`rating`, `attendance`) إلى بيانات live أو إخفائها.
4. تحسين ربط بطاقات `activeConsultation` و`waitlist` بتدفقات حقيقية أو روابط واضحة.

## خلاصة عملية

الداشبورد الحالي للطبيب **ليس غير مربوط**، لكنه **مختلط** بين:

- بيانات live حقيقية: `home snapshot`, `patients search`, `appointments api`
- وبيانات mock / hardcoded: `dashboard stats`, بعض مؤشرات الأداء, fallback المواعيد

بالتالي الحالة الأدق له الآن:

- **Live partially integrated dashboard**
- وليس **fully backend-driven dashboard**
