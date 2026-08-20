export function formatAuditLogDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: iso, time: '' };
  }
}
