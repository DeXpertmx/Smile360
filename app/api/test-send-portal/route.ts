
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Obtener una orden de tratamiento pendiente
    const order = await prisma.treatmentOrder.findFirst({
      where: { status: 'Pendiente' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'No se encontraron órdenes pendientes' }, { status: 404 });
    }

    // Generar un token único para acceso directo
    const signatureToken = generateUniqueToken();
    
    // Actualizar la orden con el token
    await prisma.treatmentOrder.update({
      where: { id: order.id },
      data: {
        signatureToken,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Token válido por 7 días
      }
    });

    // Crear el enlace al portal
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const portalLink = `${baseUrl}/portal/sign/${order.id}?token=${signatureToken}`;

    return NextResponse.json({
      success: true,
      message: 'Orden enviada al portal del paciente (PRUEBA)',
      portalLink,
      patient: {
        name: `${order.patient.firstName} ${order.patient.lastName}`,
        email: order.patient.email,
        phone: order.patient.phone
      },
      orderNumber: order.orderNumber,
      procedureType: order.procedureType,
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Error en prueba de envío al portal:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
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
