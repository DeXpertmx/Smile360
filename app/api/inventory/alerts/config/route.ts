
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Configuraciones predeterminadas de alertas
    const defaultConfigs = [
      {
        id: 'stock_bajo',
        name: 'Stock Bajo',
        type: 'stock_management',
        enabled: true,
        threshold: 10, // Cantidad mínima
        emailNotification: true,
        smsNotification: false,
        pushNotification: true
      },
      {
        id: 'producto_agotado',
        name: 'Producto Agotado',
        type: 'stock_management',
        enabled: true,
        emailNotification: true,
        smsNotification: true,
        pushNotification: true
      },
      {
        id: 'vencimiento_proximo',
        name: 'Vencimiento Próximo',
        type: 'expiration',
        enabled: true,
        daysInAdvance: 30, // Días antes del vencimiento
        emailNotification: true,
        smsNotification: false,
        pushNotification: true
      },
      {
        id: 'sobrestock',
        name: 'Sobrestock',
        type: 'stock_management',
        enabled: false,
        threshold: 200, // Porcentaje sobre el stock máximo
        emailNotification: false,
        smsNotification: false,
        pushNotification: true
      },
      {
        id: 'consumo_anomalo',
        name: 'Consumo Anómalo',
        type: 'ai_detection',
        enabled: true,
        threshold: 50, // Porcentaje de variación
        emailNotification: true,
        smsNotification: false,
        pushNotification: true
      },
      {
        id: 'proveedor_retraso',
        name: 'Retraso de Proveedores',
        type: 'supplier',
        enabled: true,
        daysInAdvance: 3, // Días de tolerancia
        emailNotification: true,
        smsNotification: false,
        pushNotification: true
      }
    ];

    return NextResponse.json({
      success: true,
      configs: defaultConfigs
    });

  } catch (error) {
    console.error('Error obteniendo configuración de alertas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
