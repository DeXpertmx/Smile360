
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
    const { startDate, endDate, reportData } = data;

    // Aquí implementarías la generación del PDF usando una librería como puppeteer o jsPDF
    // Por ahora, retornamos un placeholder
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Gastos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .category-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Gastos</h1>
          <p>Período: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h2>Resumen Ejecutivo</h2>
          <p><strong>Total de Gastos:</strong> ${reportData.totalExpenses}</p>
          <p><strong>Monto Total:</strong> $${reportData.totalAmount.toLocaleString()}</p>
          <p><strong>Promedio:</strong> $${reportData.averageExpense.toFixed(2)}</p>
        </div>
        
        <h2>Gastos por Categoría</h2>
        ${reportData.categorySummary.map((cat: any) => 
          `<div class="category-item">
            <span>${cat.category} (${cat.count} gastos)</span>
            <span>$${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)</span>
          </div>`
        ).join('')}
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="reporte-gastos-${new Date().toISOString().split('T')[0]}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte PDF' },
      { status: 500 }
    );
  }
}
