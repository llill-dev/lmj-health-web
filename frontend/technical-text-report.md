# تقرير فحص النصوص التقنية الظاهرة للمستخدم

- الملفات المفحوصة: 868
- إجمالي الملاحظات: 9 (خطيرة: 5, متوسطة: 3, منخفضة: 1)

| الخطورة | الملف | السطر | النوع | التفصيل | النص |
|---|---|---|---|---|---|
| HIGH | `src/components/doctor/support/doctor-support-contact-form.tsx` | 182 | jsx-attr:placeholder | debug-marker — علامة تطوير/تجربة (TODO/DEBUG/placeholder) ظاهرة للمستخدم. | `+963 9XX XXX XXX` |
| HIGH | `src/components/platform/contact-us-dialog.tsx` | 353 | jsx-attr:placeholder | debug-marker — علامة تطوير/تجربة (TODO/DEBUG/placeholder) ظاهرة للمستخدم. | `+963 9XX XXX XXX` |
| HIGH | `src/components/platform/contact-us-dialog.tsx` | 402 | jsx-text | raw-api-endpoint — نص يحتوي على مسار API خام (endpoint) يظهر للمستخدم. | `المرفقات عبر API متاحة للمرضى فقط (POST /api/complaints + ملفات المريض)` |
| HIGH | `src/pages/admin/doctor-specializations/AdminDoctorSpecializationsPage.tsx` | 474 | jsx-text | raw-api-endpoint — نص يحتوي على مسار API خام (endpoint) يظهر للمستخدم. | `DELETE /api/admin/lookups/:id` |
| HIGH | `src/pages/connection-test/ConnectionTestPage.tsx` | 307 | jsx-text | raw-api-endpoint — نص يحتوي على مسار API خام (endpoint) يظهر للمستخدم. | `/api/health/ready` |
| MEDIUM | `src/components/admin/medical-content/dialogs/EditAdminContentDialog.tsx` | 1140 | jsx-attr:placeholder | json-blob — نص يشبه JSON خام يُعرض كما هو للمستخدم. | `{"key":"value"}` |
| MEDIUM | `src/components/admin/medical-content/DynamicTemplateFieldRenderer.tsx` | 247 | jsx-attr:placeholder | json-blob — نص يشبه JSON خام يُعرض كما هو للمستخدم. | `{"key":"value"}` |
| MEDIUM | `src/components/admin/medical-content/DynamicTemplateFieldRenderer.tsx` | 247 | jsx-expr-string | json-blob — نص يشبه JSON خام يُعرض كما هو للمستخدم. | `{"key":"value"}` |
| LOW | `src/pages/connection-test/ConnectionTestPage.tsx` | 404 | jsx-text | technical-field-name — اسم حقل/متغير تقني (snake_case أو camelCase برمجي) بدل تسمية مفهومة للمستخدم. | `The readiness endpoint responded successfully, but it did                       not return the expected summary fields.` |
