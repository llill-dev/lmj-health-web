# تقرير فحص النصوص التقنية الظاهرة للمستخدم

- الملفات المفحوصة: 868
- إجمالي الملاحظات: 5 (خطيرة: 1, متوسطة: 3, منخفضة: 1)

| الخطورة | الملف | السطر | النوع | التفصيل | النص |
|---|---|---|---|---|---|
| HIGH | `src/pages/connection-test/ConnectionTestPage.tsx` | 307 | jsx-text | raw-api-endpoint — نص يحتوي على مسار API خام (endpoint) يظهر للمستخدم. | `/api/health/ready` |
| MEDIUM | `src/components/admin/medical-content/dialogs/EditAdminContentDialog.tsx` | 1140 | jsx-attr:placeholder | json-blob — نص يشبه JSON خام يُعرض كما هو للمستخدم. | `{"key":"value"}` |
| MEDIUM | `src/components/admin/medical-content/DynamicTemplateFieldRenderer.tsx` | 247 | jsx-attr:placeholder | json-blob — نص يشبه JSON خام يُعرض كما هو للمستخدم. | `{"key":"value"}` |
| MEDIUM | `src/components/admin/medical-content/DynamicTemplateFieldRenderer.tsx` | 247 | jsx-expr-string | json-blob — نص يشبه JSON خام يُعرض كما هو للمستخدم. | `{"key":"value"}` |
| LOW | `src/pages/connection-test/ConnectionTestPage.tsx` | 404 | jsx-text | technical-field-name — اسم حقل/متغير تقني (snake_case أو camelCase برمجي) بدل تسمية مفهومة للمستخدم. | `The readiness endpoint responded successfully, but it did                       not return the expected summary fields.` |
