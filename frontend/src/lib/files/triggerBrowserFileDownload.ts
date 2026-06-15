/**
 * يحاول حفظ ملف على جهاز المستخدم (مجلد التحميلات الافتراضي).
 *
 * 1) `fetch` ثم `Blob` + `blob:` URL لأن روابط التوقيع/النطاقات الأخرى لا تُطبَّق
 *    عليها خاصية `<a download>` بشكل موثوق، و`target="_blank"` يفضّل المعاينة عن التنزيل.
 * 2) إن فشل `fetch` (CORS)، نرجع لمحاولة واحدة باستخدام رابط مباشر **بدون**
 *    `target=_blank` لتعظيم احتمال تنزيل المتصفح إن أرسل الخادم Content-Disposition مناسبًا.
 */
export async function triggerBrowserFileDownload(
  sourceUrl: string,
  filename: string,
): Promise<void> {
  const clickDownloadLink = (href: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  try {
    const response = await fetch(sourceUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    try {
      clickDownloadLink(blobUrl);
    } finally {
      /** Safari يحتاج وقتاً قصيراً قبل revoke */
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    }
  } catch {
    clickDownloadLink(sourceUrl);
  }
}

/**
 * يحمّل الملف إلى مجلد التحميلات ويفتح نسخة للمعاينة في تبويب جديد.
 * يُفضَّل fetch + blob URL حتى يعمل التنزيل باسم ملف صحيح والمعاينة معاً.
 */
export async function triggerBrowserFileDownloadAndOpen(
  sourceUrl: string,
  filename: string,
): Promise<void> {
  const openInNewTab = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const clickDownloadLink = (href: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  try {
    const response = await fetch(sourceUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    try {
      openInNewTab(blobUrl);
      clickDownloadLink(blobUrl);
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    }
  } catch {
    openInNewTab(sourceUrl);
    clickDownloadLink(sourceUrl);
  }
}
