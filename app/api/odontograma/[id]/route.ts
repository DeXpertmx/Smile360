
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Actualizar odontograma específico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT /api/odontograma/[id] - Iniciando actualización de odontograma');
    
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

    const { id } = params;
    console.log('ID del odontograma a actualizar:', id);

    if (!id) {
      return NextResponse.json({ error: 'ID del odontograma es requerido' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
      console.log('Datos recibidos para actualización:', JSON.stringify(body, null, 2));
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

    console.log('Verificando que el odontograma existe...');
    
    // Verificar que el odontograma existe
    const odontogramaExistente = await prisma.odontograma.findUnique({
      where: { id },
    });

    if (!odontogramaExistente) {
      console.log('Error: Odontograma no encontrado con ID:', id);
      return NextResponse.json(
        { error: 'Odontograma no encontrado' },
        { status: 404 }
      );
    }

    console.log('Odontograma encontrado, procediendo a actualizar...');

    // Actualizar el odontograma
    const odontogramaActualizado = await prisma.odontograma.update({
      where: { id },
      data: {
        patientId,
        datos: JSON.stringify(datos),
        tratamientosSugeridos: JSON.stringify(tratamientosSugeridos || []),
        notas: notas || '',
        doctor: (session.user.firstName || '') + ' ' + (session.user.lastName || ''),
      },
    });

    console.log('Odontograma actualizado exitosamente:', odontogramaActualizado.id);

    // Parsear los datos JSON para la respuesta
    const response = {
      ...odontogramaActualizado,
      datos: datos,
      tratamientosSugeridos: tratamientosSugeridos || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error completo al actualizar odontograma:', error);
    
    // Analizar el tipo de error para devolver información más específica
    if (error instanceof Error) {
      // Error de base de datos
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Paciente no encontrado - Verifique que el paciente exists' },
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

// DELETE - Eliminar odontograma específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Verificar que el odontograma existe
    const odontogramaExistente = await prisma.odontograma.findUnique({
      where: { id },
    });

    if (!odontogramaExistente) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el odontograma
    await prisma.odontograma.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Odontograma eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar odontograma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener odontograma específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    const odontograma = await prisma.odontograma.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!odontograma) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado' },
        { status: 404 }
      );
    }

    // Parsear los datos JSON
    const response = {
      ...odontograma,
      datos: odontograma.datos ? JSON.parse(odontograma.datos) : [],
      tratamientosSugeridos: odontograma.tratamientosSugeridos 
        ? JSON.parse(odontograma.tratamientosSugeridos) 
        : [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener odontograma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
