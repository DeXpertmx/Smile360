
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (authError) {
      console.error('Error obteniendo sesión:', authError);
      // Si hay error de sesión, intentamos validar por otro método
      // En este caso, permitimos continuar con logging adicional
      session = null;
    }
    
    if (!session?.user?.id) {
      console.log('❌ Sin sesión válida para envío al portal');
      
      // En modo desarrollo, permitir continuar con advertencia
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ MODO DESARROLLO: Continuando sin autenticación');
      } else {
        return NextResponse.json({ error: 'No autorizado - Sesión inválida o expirada. Por favor, inicie sesión nuevamente.' }, { status: 401 });
      }
    }
    
    if (session?.user?.id) {
      console.log('✅ Sesión válida, procesando envío al portal para usuario:', session.user.id);
    } else {
      console.log('⚠️ Procesando envío al portal sin autenticación (modo desarrollo)');
    }

    // Verificar que la orden existe y está pendiente
    const order = await prisma.treatmentOrder.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    if (order.status !== 'Pendiente') {
      return NextResponse.json({ 
        error: 'Solo se pueden enviar órdenes pendientes de firma' 
      }, { status: 400 });
    }

    // Generar un token único para acceso directo
    const signatureToken = generateUniqueToken();
    
    // Actualizar la orden con el token
    await prisma.treatmentOrder.update({
      where: { id: params.id },
      data: {
        signatureToken,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Token válido por 7 días
      }
    });

    // Crear el enlace al portal
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const portalLink = `${baseUrl}/portal/sign/${params.id}?token=${signatureToken}`;

    // TODO: Aquí se podría integrar con un servicio de SMS/WhatsApp/Email
    // para enviar automáticamente el enlace al paciente

    return NextResponse.json({
      message: 'Orden enviada al portal del paciente',
      portalLink,
      patient: {
        name: `${order.patient.firstName} ${order.patient.lastName}`,
        email: order.patient.email,
        phone: order.patient.phone
      },
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Error enviando orden al portal:', error);
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
