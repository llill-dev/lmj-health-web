import { Helmet } from 'react-helmet-async';

export default function AdminSettingsPage() {
  return (
    <>
      <Helmet>
        <title>الإعدادات • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='min-h-[520px]'
      />
    </>
  );
}
