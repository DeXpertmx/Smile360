
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Si hay token, verificarlo en lugar de la sesión
    if (token) {
      const order = await prisma.treatmentOrder.findUnique({
        where: { 
          id: params.id,
          signatureToken: token,
          tokenExpiry: {
            gte: new Date()
          }
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
              lastName: true,
              especialidad: true,
              licencia: true
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
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'Orden no encontrada o token inválido' }, { status: 404 });
      }

      return NextResponse.json(order);
    }

    // Si no hay token, verificar sesión normal
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const order = await prisma.treatmentOrder.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            especialidad: true,
            licencia: true
          }
        },
        budget: {
          include: {
            items: true
          }
        },
        treatmentPlan: {
          include: {
            treatments: true
          }
        },
        template: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Error al obtener orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que la orden existe y no está firmada
    const existingOrder = await prisma.treatmentOrder.findUnique({
      where: { id: params.id }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // REGLA IMPORTANTE: Las órdenes firmadas NO pueden modificarse
    if (existingOrder.status === 'Firmada') {
      return NextResponse.json({ 
        error: 'No se pueden modificar órdenes de tratamiento firmadas por el paciente' 
      }, { status: 403 });
    }

    // Solo permitir modificar órdenes completadas por el mismo doctor que las creó
    if (existingOrder.status === 'Completada' && existingOrder.doctorId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Solo el doctor que creó la orden puede modificar órdenes completadas' 
      }, { status: 403 });
    }

    const body = await request.json();
    const {
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
      notes,
      status
    } = body;

    // No permitir cambiar status a "Firmada" desde aquí
    let newStatus = status;
    if (status === 'Firmada' && existingOrder.status !== 'Firmada') {
      newStatus = existingOrder.status; // Mantener el status actual
    }

    const order = await prisma.treatmentOrder.update({
      where: { id: params.id },
      data: {
        procedureType,
        procedureDescription,
        treatmentDetails,
        diagnosis,
        risks,
        alternatives,
        postOperativeCare,
        expectedOutcome,
        totalCost: totalCost ? parseFloat(totalCost) : undefined,
        paymentTerms,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        notes,
        status: newStatus
      },
      include: {
        patient: true,
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            especialidad: true
          }
        }
      }
    });

    return NextResponse.json(order);

  } catch (error) {
    console.error('Error al actualizar orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
