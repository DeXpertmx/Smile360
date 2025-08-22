
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const orders = await prisma.treatmentOrder.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            numeroExpediente: true,
            email: true,
            phone: true
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            especialidad: true
          }
        },
        budget: {
          select: {
            budgetNumber: true,
            title: true,
            total: true
          }
        },
        treatmentPlan: {
          select: {
            title: true,
            description: true
          }
        },
        template: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientId,
      budgetId,
      treatmentPlanId,
      templateId,
      procedureType,
      procedureDescription,
      treatmentDetails,
      diagnosis,
      risks,
      alternatives,
      postOperativeCare,
      expectedOutcome,
      totalCost,
      paymentTerms,
      scheduledDate,
      notes
    } = body;

    // Verificar que el presupuesto existe y está aprobado si se proporciona
    if (budgetId) {
      const budget = await prisma.budget.findUnique({
        where: { id: budgetId }
      });

      if (!budget || budget.status !== 'Aprobado') {
        return NextResponse.json(
          { error: 'Solo se pueden crear órdenes de tratamiento para presupuestos aprobados' },
          { status: 400 }
        );
      }
    }

    // Generar token para el portal del paciente automáticamente
    const signatureToken = generateUniqueToken();
    const tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

    const order = await prisma.treatmentOrder.create({
      data: {
        patientId,
        doctorId: session.user.id,
        budgetId,
        treatmentPlanId,
        templateId,
        procedureType,
        procedureDescription,
        treatmentDetails,
        diagnosis,
        risks,
        alternatives,
        postOperativeCare,
        expectedOutcome,
        totalCost: parseFloat(totalCost),
        paymentTerms,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        notes,
        // Automáticamente disponible en portal del paciente
        signatureToken,
        tokenExpiry
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            numeroExpediente: true,
            email: true,
            phone: true
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Crear el enlace directo al portal
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const portalLink = `${baseUrl}/portal/sign/${order.id}?token=${signatureToken}`;

    return NextResponse.json({
      order,
      portalLink,
      message: 'Orden de tratamiento creada y disponible en el portal del paciente'
    });

  } catch (error) {
    console.error('Error al crear orden de tratamiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function generateUniqueToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
