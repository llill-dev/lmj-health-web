import { AlertTriangle, Mail, Phone, Send } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import {
  clearPendingDoctorRecoveryLogin,
  peekPendingDoctorRecoveryLogin,
} from '@/lib/auth/accountDeletionSession';

export default function OffboardedDoctorRestorePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const pendingLogin = peekPendingDoctorRecoveryLogin();
  const contactEmail = pendingLogin?.email || 'support@lmjhealth.com';
  const contactPhone = pendingLogin?.phone || '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast('يرجى كتابة رسالتك قبل الإرسال', {
        title: 'رسالة مطلوبة',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending request - in real implementation, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    toast('تم إرسال طلبك بنجاح. سيتم التواصل معك قريباً.', {
      title: 'تم الإرسال',
      variant: 'success',
    });
    
    clearPendingDoctorRecoveryLogin();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>طلب استعادة الحساب الموقوف | LMJ Health</title>
      </Helmet>

      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[#F0FDF4] via-white to-[#E6F4F3] px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg">
          {/* Header Card */}
          <div className="mb-6 rounded-2xl border-2 border-[#FEF3C7] bg-[#FFFBEB] p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FCD34D]">
                <AlertTriangle className="h-6 w-6 text-[#92400E]" />
              </div>
              <div className="flex-1">
                <h1 className="font-cairo text-[20px] font-extrabold text-[#92400E] sm:text-[22px]">
                  حسابك موقوف من قبل الإدارة
                </h1>
                <p className="mt-2 font-cairo text-[14px] font-semibold leading-relaxed text-[#78350F]">
                  تم إيقاف حسابك من قبل المشرف. لاستعادة حسابك، يرجى تقديم طلب للإدارة عبر النموذج أدناه.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-lg sm:p-8">
            <h2 className="mb-6 font-cairo text-[18px] font-extrabold text-[#111827] sm:text-[20px]">
              نموذج طلب استعادة الحساب
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact Info Display */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#667085]" />
                  <div>
                    <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                      البريد الإلكتروني المسجل
                    </p>
                    <p className="font-cairo text-[14px] font-bold text-[#111827]">
                      {contactEmail}
                    </p>
                  </div>
                </div>
                {contactPhone !== '—' && (
                  <div className="mt-3 flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#667085]" />
                    <div>
                      <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                        رقم الهاتف المسجل
                      </p>
                      <p className="font-cairo text-[14px] font-bold text-[#111827]">
                        {contactPhone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="message" className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
                  رسالتك للإدارة <span className="text-[#F04438]">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا... يرجى توضيح سبب طلب استعادة الحساب وأي معلومات إضافية قد تساعد الإدارة في مراجعة طلبك."
                  rows={5}
                  className="w-full rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[14px] font-semibold text-[#111827] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 font-cairo text-[15px] font-extrabold text-white shadow-[0_8px_16px_rgba(15,143,139,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_12px_24px_rgba(15,143,139,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>جارٍ الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>إرسال الطلب</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                onClick={() => clearPendingDoctorRecoveryLogin()}
                className="font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-primary"
              >
                العودة إلى صفحة تسجيل الدخول
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-center">
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              إذا كنت بحاجة إلى مساعدة إضافية، يمكنك التواصل مع فريق الدعم عبر:
            </p>
            <p className="mt-2 font-cairo text-[13px] font-bold text-[#111827]">
              support@lmjhealth.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
