
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener pacientes con información de CRM
    const patients = await prisma.patient.findMany({
      include: {
        treatments: {
          where: { status: { in: ['En Progreso', 'Completado'] } }
        },
        budgets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            items: true
          }
        },
        treatmentPlans: {
          where: { status: { in: ['Planificado', 'En Progreso'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        appointments: {
          orderBy: { date: 'desc' },
          take: 1
        },
        crmInfo: true
      }
    });

    // Mapear a formato CRM
    const crmPatients = patients.map(patient => {
      const completedTreatments = patient.treatments.filter(t => t.status === 'Completado').length;
      const totalTreatments = patient.treatments.length;
      const activeBudgets = patient.budgets.filter(b => b.status === 'Enviado' || b.status === 'Aprobado');
      const latestBudget = patient.budgets[0]; // El más reciente
      
      // Usar información del CRM si existe, sino determinar por reglas de negocio
      let status = patient.crmInfo?.status || 'prospecto';
      let source = patient.crmInfo?.source || 'walk_in';
      let priority = patient.crmInfo?.priority || 'media';
      
      if (!patient.crmInfo) {
        // Determinar estado del paciente en el pipeline
        if (patient.appointments.length > 0) {
          status = 'consultado';
        }
        
        if (activeBudgets.length > 0) {
          status = 'presupuestado';
        }
        
        if (patient.budgets.some(b => b.status === 'Aprobado')) {
          status = 'aprobado';
        }
        
        if (patient.treatments.some(t => t.status === 'En Progreso')) {
          status = 'en_tratamiento';
        }
        
        if (totalTreatments > 0 && completedTreatments === totalTreatments) {
          status = 'completado';
        }
      }

      const treatmentProgress = totalTreatments > 0 ? (completedTreatments / totalTreatments) * 100 : 0;
      
      // Obtener tratamiento principal (presupuestado o en progreso)
      let currentTreatment = '';
      let currentTreatmentType = '';
      
      if (status === 'presupuestado' && latestBudget) {
        currentTreatment = latestBudget.title;
        currentTreatmentType = 'Presupuestado';
      } else if (status === 'en_tratamiento') {
        const activeTreatment = patient.treatments.find(t => t.status === 'En Progreso');
        if (activeTreatment) {
          currentTreatment = activeTreatment.name;
          currentTreatmentType = activeTreatment.category;
        }
      } else if (patient.treatmentPlans[0]) {
        currentTreatment = patient.treatmentPlans[0].title;
        currentTreatmentType = patient.treatmentPlans[0].status;
      } else if (patient.treatments.length > 0) {
        currentTreatment = patient.treatments[0].name; // Último tratamiento
        currentTreatmentType = patient.treatments[0].category;
      }
      
      // Calcular costo total del tratamiento
      const budgetTotal = latestBudget ? parseFloat(latestBudget.total.toString()) : 0;
      const treatmentCosts = patient.treatments.reduce((total, t) => total + parseFloat(t.cost.toString()), 0);
      const totalCost = budgetTotal || treatmentCosts;

      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email || '',
        phone: patient.phone,
        status,
        source,
        priority: priority as 'alta' | 'media' | 'baja',
        lastContact: patient.crmInfo?.lastContact.toISOString() || patient.updatedAt.toISOString(),
        notes: patient.crmInfo?.crmNotes || patient.notes || '',
        treatmentProgress,
        budgetTotal: totalCost,
        currentTreatment,
        currentTreatmentType,
        budgetStatus: latestBudget?.status,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString()
      };
    });

    return NextResponse.json(crmPatients);

  } catch (error) {
    console.error('Error al obtener pacientes CRM:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
