
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const canViewReports = session.user?.role === 'ADMIN' || 
                          session.user?.role === 'DOCTOR';
                          // @ts-ignore - permisos property might not exist in type
                          // || session.user?.permisos?.includes('REPORTES_VER');

    if (!canViewReports) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    const data = await request.json();
    const { startDate, endDate, expenses } = data;

    // Generar CSV como alternativa a Excel (más simple)
    const csvHeaders = [
      'Número de Gasto',
      'Fecha',
      'Descripción',
      'Categoría',
      'Monto',
      'Impuestos',
      'Total',
      'Proveedor',
      'Método de Pago',
      'Estado',
      'N° Factura',
      'Registrado por',
      'Notas'
    ].join(',');

    const csvRows = expenses.map((expense: any) => [
      expense.expenseNumber || '',
      new Date(expense.expenseDate).toLocaleDateString(),
      `"${expense.description.replace(/"/g, '""')}"`,
      `"${expense.category.name}"`,
      expense.amount,
      expense.taxAmount || 0,
      expense.totalAmount,
      `"${expense.vendor || ''}"`,
      `"${expense.paymentMethod}"`,
      `"${expense.status}"`,
      `"${expense.invoiceNumber || ''}"`,
      `"${expense.user.firstName} ${expense.user.lastName}"`,
      `"${(expense.notes || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="gastos-detalle-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error generating Excel report:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte Excel' },
      { status: 500 }
    );
  }
}
