# كيفية ربط المرضى بالطبيب
# How to Link Patients with Doctor

## 📋 فهم النظام | Understanding the System

### الفرق الأساسي:
```
1. المريض موجود في النظام ≠ المريض مرتبط بالطبيب
2. فقط المرضى المرتبطين يظهرون في:
   - GET /api/doctors/patients
   - قائمة حجز المواعيد
   - لوحة الطبيب
```

---

## 🔗 طرق ربط المريض بالطبيب

### 1️⃣ **إنشاء مريض مؤقت من لوحة الطبيب**

**الطريقة الأسرع والأفضل!** ✨

#### من الواجهة:
1. اذهب إلى صفحة "مرضاي" `/doctor/patients`
2. اضغط "إضافة مريض مؤقت"
3. أدخل البيانات:
   - الاسم الكامل
   - البريد الإلكتروني
   - رقم الهاتف
4. اضغط "حفظ"

#### ما يحدث في الـ Backend:
```
POST /api/doctors/patients/temp
Body:
{
  "fullName": "محمد أحمد",
  "email": "mohammed@example.com",
  "phone": "+966501234567"
}

Response:
{
  "messageKey": "success.patient.tempCreated",
  "message": "تم إنشاء المريض المؤقت وربطه بالطبيب",
  "patientId": "64f...",
  "userId": "64f...",
  "accountStatus": "temporary",
  "isTemporary": true
}
```

**✅ النتيجة:**
- يتم إنشاء المريض
- يتم ربطه تلقائياً بالطبيب
- يظهر فوراً في قائمة مرضى الطبيب
- يمكن حجز موعد له مباشرة

---

### 2️⃣ **المريض يحجز موعد من تطبيقه**

#### السيناريو:
1. المريض يسجل في التطبيق (تطبيق المريض)
2. يبحث عن طبيب
3. يحجز موعد

#### ما يحدث:
```
POST /api/appointments/book  (من تطبيق المريض)
Body:
{
  "doctorId": "64f...doctor",
  "date": "2026-05-15",
  "startTime": "10:00",
  "notes": "استشارة عامة"
}

Response:
{
  "message": "Appointment booked successfully.",
  "appointment": {
    "_id": "64f...",
    "doctor": { ... },
    "patient": { ... },
    "status": "scheduled"
  }
}
```

**✅ النتيجة:**
- عند إنشاء الموعد، يتم **ربط تلقائي** بين الطبيب والمريض
- المريض يظهر في `GET /api/doctors/patients`
- الطبيب يمكنه رؤية المريض في لوحته

---

### 3️⃣ **ربط مريض موجود مسبقاً**

#### إذا أنشأت المريض من Admin Panel:

**⚠️ لن يُربط تلقائياً بالطبيب!**

**الحلول:**

##### أ. عبر API مباشر (للمطورين):
```
POST /api/doctors/:doctorId/patients/:patientId/link
```
*(ملاحظة: تحقق من API-4.pdf إذا كان هذا endpoint موجود)*

##### ب. عبر حجز موعد:
1. الطبيب يحجز موعد للمريض من لوحته
2. عند الحجز، يتم الربط تلقائياً

##### ج. تحويل لمريض مؤقت:
إذا كان المريض غير مرتبط، انشئه كمريض مؤقت بنفس البيانات

---

## 🔍 تشخيص المشاكل

### المشكلة: "لا يوجد مرضى في قائمة حجز المواعيد"

#### الخطوة 1: افتح صفحة المرضى
```
/doctor/patients
```

**ماذا ترى؟**

#### أ. لا يوجد مرضى أصلاً:
```
✅ الحل: أضف مريض مؤقت من الزر "إضافة مريض مؤقت"
```

#### ب. يوجد مرضى لكن مع رسالة:
```
"هذا المريض مرتبط بالطبيب لكن يحتاج موافقة..."
```
```
✅ الحل: أرسل "طلب وصول" - المريض سيوافق من تطبيقه
```

#### ج. يوجد مرضى ويظهرون بشكل طبيعي:
```
✅ إذاً المشكلة في صفحة المواعيد (تحقق من الكود)
```

---

## 🧪 اختبار الربط

### Test 1: تأكد من API
افتح Console في المتصفح:

```javascript
// 1. تأكد من token
console.log(localStorage.getItem('token'));

// 2. استدعي API المرضى
fetch('http://localhost:5000/api/doctors/patients?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'x-lang': 'ar'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Total patients:', data.total);
  console.log('Patients:', data.patients);
});
```

**النتيجة المتوقعة:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 2,
  "results": 2,
  "patients": [
    {
      "_id": "64f...",
      "publicId": "PAT-001",
      "user": {
        "fullName": "محمد أحمد",
        "phone": "+966...",
        "accountStatus": "temporary"
      },
      "isTemporary": true,
      "lastVisitAt": null
    }
  ]
}
```

---

### Test 2: تأكد من الـ React Query

في Dev Tools (React Query Devtools):

```
Query Key: ["doctor", "patients", "list", {...}]
Status: success
Data: { patients: [...], total: X }
```

---

## 📊 حالات الربط

### ✅ حالات الربط التلقائي:

| الطريقة | يُربط تلقائياً؟ | API المستخدم |
|---------|-----------------|---------------|
| مريض مؤقت من لوحة الطبيب | ✅ نعم | `POST /doctors/patients/temp` |
| مريض يحجز موعد | ✅ نعم | `POST /appointments/book` |
| طبيب يحجز موعد لمريض موجود | ✅ نعم | `POST /appointments/book` |

### ❌ حالات بدون ربط تلقائي:

| الطريقة | يُربط تلقائياً؟ | الحل |
|---------|-----------------|------|
| إنشاء مريض من Admin | ❌ لا | يحتاج موعد أو link API |
| مريض signup عادي | ❌ لا | يحتاج يحجز موعد |
| استيراد مرضى من ملف | ❌ لا | يحتاج link API |

---

## 🎯 الخطوات العملية لك الآن

### لحل مشكلتك الحالية:

#### 1️⃣ افتح صفحة المرضى كطبيب:
```
http://localhost:5173/doctor/patients
```

#### 2️⃣ تحقق:
- كم عدد المرضى؟
- هل يوجد المريضين "أسلم" و"إبراهيم السلايمات"؟

#### 3️⃣ إذا لم يوجدوا:
اضغط "إضافة مريض مؤقت" وأضفهم

#### 4️⃣ إذا يوجدوا:
- ارجع لصفحة المواعيد
- اضغط "حجز موعد جديد"
- يجب أن يظهروا في القائمة الآن! ✅

---

## 🔗 الـ API Reference

### جلب مرضى الطبيب:
```
GET /api/doctors/patients
Query params:
  - page: number (default 1)
  - limit: number (default 20)
  - search: string (optional)
  - diagnosis: string (optional)
  - from: YYYY-MM-DD (optional)
  - to: YYYY-MM-DD (optional)
  - account_status: 'all' | 'active' | 'temporary' | 'suspended'

Response:
{
  "page": 1,
  "limit": 20,
  "total": 5,
  "results": 5,
  "patients": [
    {
      "_id": "64f...",
      "publicId": "PAT-001",
      "user": {
        "_id": "64f...",
        "fullName": "محمد أحمد",
        "email": "mohammed@example.com",
        "phone": "+966501234567",
        "accountStatus": "temporary"
      },
      "allergies": [],
      "medicalConditions": [],
      "bloodType": null,
      "lastVisitAt": null,
      "isTemporary": true
    }
  ]
}
```

### إنشاء مريض مؤقت:
```
POST /api/doctors/patients/temp
Body:
{
  "fullName": "اسم المريض الكامل",
  "email": "email@example.com",
  "phone": "+966501234567"
}

Response:
{
  "messageKey": "success.patient.tempCreated",
  "message": "تم إنشاء المريض المؤقت وربطه بالطبيب",
  "patientId": "64f...",
  "userId": "64f...",
  "accountStatus": "temporary",
  "isTemporary": true
}
```

### حجز موعد:
```
POST /api/appointments/book
Body:
{
  "doctorId": "64f...doctor",
  "patientId": "64f...patient",  // مطلوب عند الحجز من الطبيب
  "date": "2026-05-15",
  "startTime": "10:00",
  "appointmentTypeId": "65f...",  // اختياري
  "notes": "ملاحظات"
}

Response:
{
  "message": "Appointment booked successfully.",
  "appointment": {
    "_id": "64f...",
    "doctor": { "_id": "...", ... },
    "patient": { "_id": "...", ... },
    "date": "2026-05-15T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "10:30",
    "status": "scheduled"
  }
}
```

---

## 💡 نصائح مهمة

### 1. استخدم المرضى المؤقتين:
- الأسرع للعيادات
- لا يحتاج تفعيل من المريض
- يمكن حجز مواعيد مباشرة
- لاحقاً المريض يفعّل حسابه

### 2. تحقق من الربط:
```javascript
// في console
fetch('/api/doctors/patients?page=1&limit=1', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('Total:', d.total))
```

### 3. راقب الـ Network Tab:
عند فتح صفحة المواعيد، يجب أن ترى:
```
GET /api/doctors/patients?page=1&limit=100
Status: 200 OK
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "لا توجد مرضى مرتبطين"

#### الأسباب المحتملة:

1. **الطبيب غير معتمد:**
```json
{
  "status": 403,
  "messageKey": "errors.doctor.notApproved",
  "message": "Doctor account pending admin approval"
}
```
**الحل:** اعتمد الطبيب من Admin panel

2. **Token خطأ:**
```json
{
  "status": 401,
  "message": "Unauthorized"
}
```
**الحل:** سجل دخول من جديد

3. **فعلاً لا يوجد مرضى:**
```json
{
  "total": 0,
  "patients": []
}
```
**الحل:** أضف مرضى مؤقتين

---

## ✅ الخلاصة

### الخطوات السليمة:

```
1. سجل دخول كطبيب ✅
2. اذهب إلى صفحة "مرضاي" ✅
3. أضف مريض مؤقت أو اثنين ✅
4. ارجع لصفحة "المواعيد" ✅
5. اضغط "حجز موعد جديد" ✅
6. يجب أن تظهر القائمة! ✅
```

---

**الآن جرب وأخبرني بالنتيجة! 🚀**
