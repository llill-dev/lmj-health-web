import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { DeleteAccountFlow } from '@/components/account-deletion';
import { resolveAccountDeletionScope } from '@/lib/auth/accountDeletionClient';
import { resolveRestorePath } from '@/lib/auth/accountDeletionSession';
import { getRoleRoot } from '@/routes/ProtectedRoute';
import { readAuthUser } from '@/lib/cookies';
import { useI18n } from '@/i18n/provider';

export default function DeleteAccountPage() {
  const { t } = useI18n();
  const authUser = readAuthUser();
  const scope = resolveAccountDeletionScope(authUser?.role);

  if (!scope) {
    return <Navigate to={getRoleRoot('doctor')} replace />;
  }

  const cancelHref =
    scope === 'patient' ? '/patient/profile-settings' : '/doctor/profile-settings';

  return (
    <>
      <Helmet>
        <title>{t('accountDeletion.feedback.delete')} • LMJ Health</title>
      </Helmet>
      <DeleteAccountFlow
        scope={scope}
        cancelHref={cancelHref}
        homeHref="/welcome"
        restoreHref={resolveRestorePath(scope)}
      />
    </>
  );
}
