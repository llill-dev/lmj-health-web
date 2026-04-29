/**
 * توليد مفتاح machine key لـ POST /api/admin/lookups.
 *
 * API-3 (LMJ Health): الجسم يجب أن يتضمن `key` صريحاً (مثل `"peanut"` في المثال).
 * لا يُوثَّق أن الخادم يولّد أو يستبدل المفتاح تلقائياً؛ لذا يُنشَأ هنا على الواجهة
 * بصيغة تتوافق مع التحقق المعتاد: حرف إنجليزي صغير أولاً، ثم أحرف صغيرة وأرقام وشرطة سفلية.
 *
 * @param length طول المفتاح الكلي (افتراضي 16 حرفاً)
 */
export function generateLookupMachineKey(length = 16): string {
  const minLen = 8;
  const maxLen = 48;
  const n = Math.min(maxLen, Math.max(minLen, Math.floor(length)));
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);

  const firstLetter = String.fromCharCode(97 + (buf[0] % 26));
  const restCharset = 'abcdefghijklmnopqrstuvwxyz0123456789_';
  let rest = '';
  for (let i = 1; i < n; i++) {
    rest += restCharset[buf[i] % restCharset.length];
  }

  return firstLetter + rest;
}
