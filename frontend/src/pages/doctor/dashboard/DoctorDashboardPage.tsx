import { Helmet } from 'react-helmet-async';
import HomeDoctor from '@/components/doctor/home-doctor';

export default function DoctorDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Doctor Dashboard • LMJ Health</title>
      </Helmet>
      <HomeDoctor />
    </>
  );
}
