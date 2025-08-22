
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PeriodontogramEditor from '@/components/periodontogram/PeriodontogramEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface PeriodontogramPageProps {
  params: {
    id: string;
  };
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  numeroExpediente: string;
  birthDate?: string;
  phone?: string;
  email?: string;
}

interface Doctor {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  especialidad?: string;
}

interface PeriodontalMeasurement {
  id?: string;
  toothNumber: number;
  position: 'vestibular' | 'lingual';
  pocketDepthMesial: number;
  pocketDepthCentral: number;
  pocketDepthDistal: number;
  attachmentLevelMesial: number;
  attachmentLevelCentral: number;
  attachmentLevelDistal: number;
  recessionMesial: number;
  recessionCentral: number;
  recessionDistal: number;
  bleedingMesial: boolean;
  bleedingCentral: boolean;
  bleedingDistal: boolean;
  suppressionMesial: boolean;
  suppressionCentral: boolean;
  suppressionDistal: boolean;
  plaqueMesial: boolean;
  plaqueCentral: boolean;
  plaqueDistal: boolean;
  mobility: number;
  furcationInvolvement?: string;
  notes?: string;
}

interface ToothStatus {
  id?: string;
  toothNumber: number;
  status: string;
  condition: string[];
  surfaces: string[];
  treatments: string[];
  priority: string;
  notes?: string;
  treatmentStatus: string;
  isImplant: boolean;
  implantBrand?: string;
  implantSize?: string;
  hasRestoration: boolean;
  restorationType?: string;
  restorationCondition?: string;
}

interface PeriodontogramData {
  id: string;
  patientId: string;
  title: string;
  examinationDate: string;
  notes?: string;
  diagnosis?: string;
  recommendations?: string;
  riskLevel?: string;
  status: string;
  treatmentPlan?: string;
  followUpDate?: string;
  patient: Patient;
  doctor: Doctor;
  measurements: PeriodontalMeasurement[];
  toothStatuses: ToothStatus[];
}

export default function ViewPeriodontogramPage({ params }: PeriodontogramPageProps) {
  const [periodontogram, setPeriodontogram] = useState<PeriodontogramData | null>(null);
  const [previousPeriodontograms, setPreviousPeriodontograms] = useState<PeriodontogramData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPeriodontogram();
  }, [params.id]);

  const fetchPeriodontogram = async () => {
    try {
      const response = await fetch(`/api/periodontograms/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPeriodontogram(data);
        
        // Fetch previous periodontograms for comparison
        const prevResponse = await fetch(`/api/periodontograms?patientId=${data.patientId}`);
        if (prevResponse.ok) {
          const prevData = await prevResponse.json();
          // Filter out current periodontogram and only show completed ones
          const filtered = prevData
            .filter((p: PeriodontogramData) => p.id !== params.id && p.status === 'Completado')
            .sort((a: PeriodontogramData, b: PeriodontogramData) => 
              new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime()
            );
          setPreviousPeriodontograms(filtered);
        }
      } else {
        toast.error('Error al cargar el periodontograma');
        router.push('/periodontograma');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el periodontograma');
      router.push('/periodontograma');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    // This is view-only mode, so we don't actually save
    // But we need this function for the editor component
    console.log('Save attempted in view-only mode');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!periodontogram) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-600 mb-4">Periodontograma no encontrado</p>
            <Button onClick={() => router.push('/periodontograma')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Periodontogramas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/periodontograma')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Periodontograma</h1>
            <p className="text-gray-600">
              {periodontogram.patient.firstName} {periodontogram.patient.lastName} - {periodontogram.patient.numeroExpediente}
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => router.push(`/periodontograma/${params.id}/editar`)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Viewer */}
      <PeriodontogramEditor
        periodontogramData={periodontogram}
        isEditable={false}
        onSave={handleSave}
        previousPeriodontograms={previousPeriodontograms}
      />
    </div>
  );
}
