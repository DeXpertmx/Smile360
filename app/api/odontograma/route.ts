
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/odontograma - Iniciando creación de odontograma');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión obtenida:', session ? 'Válida' : 'Inválida');
    
    if (!session) {
      console.log('Error: No hay sesión válida');
      return NextResponse.json({ error: 'No autorizado - Sesión requerida' }, { status: 401 });
    }

    if (!session.user) {
      console.log('Error: No hay usuario en la sesión');
      return NextResponse.json({ error: 'No autorizado - Usuario no encontrado' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
      console.log('Datos recibidos:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      return NextResponse.json({ error: 'Datos inválidos - JSON mal formado' }, { status: 400 });
    }

    const { patientId, datos, tratamientosSugeridos, notas } = body;

    // Validar datos requeridos
    if (!patientId) {
      console.log('Error: patientId requerido');
      return NextResponse.json({ error: 'patientId es requerido' }, { status: 400 });
    }

    if (!datos || !Array.isArray(datos)) {
      console.log('Error: datos debe ser un array');
      return NextResponse.json({ error: 'datos debe ser un array válido' }, { status: 400 });
    }

    console.log('Creando odontograma en la base de datos...');
    
    const odontograma = await prisma.odontograma.create({
      data: {
        patientId,
        datos: JSON.stringify(datos),
        tratamientosSugeridos: JSON.stringify(tratamientosSugeridos || []),
        notas: notas || '',
        fecha: new Date(),
        doctor: (session.user.firstName || '') + ' ' + (session.user.lastName || ''),
      },
    });

    console.log('Odontograma creado exitosamente:', odontograma.id);
    
    // Devolver el odontograma con datos parseados
    const response = {
      ...odontograma,
      datos: datos,
      tratamientosSugeridos: tratamientosSugeridos || []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error completo al crear odontograma:', error);
    
    // Analizar el tipo de error para devolver información más específica
    if (error instanceof Error) {
      // Error de base de datos
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Paciente no encontrado - Verifique que el paciente existe' },
          { status: 400 }
        );
      }
      
      // Error de validación de Prisma
      if (error.message.includes('Prisma') || error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Error de validación en los datos: ' + error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Error desconocido') },
      { status: 500 }
    );
  }
}
