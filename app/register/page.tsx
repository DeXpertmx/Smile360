
import { Metadata } from 'next';
import OrganizationRegistrationForm from '@/components/registration/OrganizationRegistrationForm';

export const metadata: Metadata = {
  title: 'Registrar Clínica - Smile 360',
  description: 'Crea tu clínica digital con Smile 360. Sistema integral de gestión 360° para clínicas dentales modernas.'
};

export default function RegisterPage() {
  return <OrganizationRegistrationForm />;
}
