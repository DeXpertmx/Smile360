
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Si hay token, verificarlo en lugar de la sesión
    if (token) {
      // Verificar que el token sea válido
      const orderCheck = await prisma.treatmentOrder.findUnique({
        where: { 
          id: params.id,
          signatureToken: token,
          tokenExpiry: {
            gte: new Date()
          },
          status: 'Pendiente'
        }
      });

      if (!orderCheck) {
        return NextResponse.json({ 
          error: 'Token inválido o expirado, o la orden ya fue procesada' 
        }, { status: 400 });
      }
    } else {
      // Verificar sesión normal si no hay token
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { patientSignature, witnessName, witnessSignature, consentDetails } = body;

    if (!patientSignature) {
      return NextResponse.json({ error: 'Firma del paciente requerida' }, { status: 400 });
    }

    // Obtener IP del cliente
    const headersList = headers();
    const clientIp = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown';

    const order = await prisma.treatmentOrder.update({
      where: { id: params.id },
      data: {
        patientSignature,
        signatureDate: new Date(),
        signatureIpAddress: clientIp,
        witnessName: witnessName || null,
        witnessSignature: witnessSignature || null,
        hasInformedConsent: true,
        consentDetails: consentDetails || null,
        status: 'Firmada',
        // Limpiar el token después de usar
        signatureToken: null,
        tokenExpiry: null
      }
    });

    // Agregar al expediente del paciente como documento médico
    await prisma.medicalDocument.create({
      data: {
        patientId: order.patientId,
        type: 'orden_tratamiento',
        name: `Orden de Tratamiento Firmada - ${order.orderNumber}`,
        filename: `orden-${order.orderNumber}.pdf`,
        originalName: `Orden de Tratamiento ${order.orderNumber}.pdf`,
        mimeType: 'application/pdf',
        size: 0, // Se actualizará cuando se genere el PDF
        url: `/api/treatment-orders/${order.id}/pdf`,
        description: `Orden de tratamiento firmada digitalmente por el paciente`,
        category: 'Consentimientos'
      }
    });

    return NextResponse.json({ 
      message: 'Orden firmada exitosamente',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        signatureDate: order.signatureDate
      }
    });

  } catch (error) {
    console.error('Error al firmar orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
