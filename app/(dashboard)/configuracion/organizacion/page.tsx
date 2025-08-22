
import { Metadata } from 'next';
import OrganizationSettings from '@/components/admin/OrganizationSettings';

export const metadata: Metadata = {
  title: 'Configuración de Organización - Smile 360',
  description: 'Configuración y gestión de la organización'
};

export default function OrganizationSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de la Organización</h1>
          <p className="text-gray-600">
            Gestiona la configuración y ajustes de tu clínica
          </p>
        </div>
      </div>

      <OrganizationSettings />
    </div>
  );
}
