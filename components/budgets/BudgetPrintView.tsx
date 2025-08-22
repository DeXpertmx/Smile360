
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useConfiguration } from "@/hooks/useConfiguration";

interface BudgetPrintViewProps {
  budget: any;
  includeOdontogram?: boolean;
  onClose: () => void;
}

export function BudgetPrintView({ budget, includeOdontogram = false, onClose }: BudgetPrintViewProps) {
  const { formatCurrency, config } = useConfiguration();
  const [odontogramData, setOdontogramData] = useState<any[]>([]);

  useEffect(() => {
    // Usar los datos del odontograma del presupuesto si están disponibles
    if (includeOdontogram && budget.odontogramaData) {
      try {
        // Los datos ya pueden venir como array desde la base de datos
        let parsedData = budget.odontogramaData;
        
        // Si es string, intentar parsearlo como JSON
        if (typeof budget.odontogramaData === 'string') {
          parsedData = JSON.parse(budget.odontogramaData);
        }
        
        setOdontogramData(parsedData);
      } catch (error) {
        console.error('Error parsing odontogram data:', error);
        // Fallback: usar los datos directamente si es array
        if (Array.isArray(budget.odontogramaData)) {
          setOdontogramData(budget.odontogramaData);
        } else if (budget.patientId) {
          fetchOdontogram();
        }
      }
    } else if (includeOdontogram && budget.patientId) {
      fetchOdontogram();
    }
  }, [budget.patientId, includeOdontogram, budget.odontogramaData]);

  const fetchOdontogram = async () => {
    try {
      const response = await fetch(`/api/patients/${budget.patientId}/odontogram`);
      if (response.ok) {
        const data = await response.json();
        setOdontogramData(data);
      }
    } catch (error) {
      console.error('Error fetching odontogram:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Controles de impresión - solo visible en pantalla */}
      <div className="print:hidden bg-gray-100 p-4 sticky top-0 z-10 border-b">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold">Vista de Impresión - {budget.budgetNumber}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Imprimir
            </button>
            <button
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido imprimible */}
      <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
        {/* Header con logo */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <img
              src="/images/logo-smile360.png"
              alt="Smile 360 Logo"
              className="h-16 w-auto mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-bold text-gray-900">{config.clinicName}</h1>
            {config.clinicAddress && (
              <p className="text-gray-600">{config.clinicAddress}</p>
            )}
            {config.clinicPhone && (
              <p className="text-gray-600">Tel: {config.clinicPhone}</p>
            )}
            {config.clinicEmail && (
              <p className="text-gray-600">Email: {config.clinicEmail}</p>
            )}
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 mb-2">PRESUPUESTO</h2>
            <p className="text-gray-700 mb-1">{budget.budgetNumber}</p>
            <p className="text-gray-600 text-sm">
              Fecha: {format(new Date(budget.createdAt), "PPP", { locale: es })}
            </p>
            {budget.validUntil && (
              <p className="text-gray-600 text-sm">
                Válido hasta: {format(new Date(budget.validUntil), "PPP", { locale: es })}
              </p>
            )}
          </div>
        </div>

        {/* Información del paciente y doctor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Información del Paciente</h3>
            <p className="text-gray-700 mb-1">
              <strong>Nombre:</strong> {budget.patient.firstName} {budget.patient.lastName}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Expediente:</strong> {budget.patient.numeroExpediente}
            </p>
            {budget.patient.email && (
              <p className="text-gray-700 mb-1">
                <strong>Email:</strong> {budget.patient.email}
              </p>
            )}
            {budget.patient.phone && (
              <p className="text-gray-700">
                <strong>Teléfono:</strong> {budget.patient.phone}
              </p>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Doctor Responsable</h3>
            <p className="text-gray-700 mb-1">
              <strong>Nombre:</strong> {budget.doctor.firstName} {budget.doctor.lastName}
            </p>
            {budget.doctor.especialidad && (
              <p className="text-gray-700">
                <strong>Especialidad:</strong> {budget.doctor.especialidad}
              </p>
            )}
          </div>
        </div>

        {/* Título y descripción del presupuesto */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{budget.title}</h3>
          {budget.description && (
            <p className="text-gray-700 whitespace-pre-wrap">{budget.description}</p>
          )}
        </div>

        {/* Elementos del presupuesto */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Tratamientos</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Tratamiento</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Cant.</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Precio Unit.</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Desc. %</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {budget.items?.map((item: any, index: number) => (
                <tr key={item.id || index}>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {item.type} • {item.category} • {item.priority}
                      {item.estimated && " • Estimado"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{item.discount}%</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Odontograma si está incluido */}
        {includeOdontogram && odontogramData && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Odontograma</h3>
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="text-center text-gray-600 mb-6">
                Estado Dental del Paciente
              </div>
              
              {/* Leyenda de colores */}
              <div className="mb-6 flex flex-wrap justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#ffffff' }}></div>
                  <span>Sano</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#8B0000' }}></div>
                  <span>Caries</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#708090' }}></div>
                  <span>Amalgama</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#F5F5DC' }}></div>
                  <span>Resina</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#FFD700' }}></div>
                  <span>Corona</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#FF69B4' }}></div>
                  <span>Endodoncia</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#FF0000' }}></div>
                  <span>Extracción</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-400" style={{ backgroundColor: '#4169E1' }}></div>
                  <span>Implante</span>
                </div>
              </div>

              {/* Maxilar Superior */}
              <div className="mb-8">
                <h4 className="text-center font-medium mb-4">Maxilar Superior</h4>
                <div className="grid grid-cols-8 gap-2 max-w-4xl mx-auto">
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(toothNumber => {
                    const toothData = odontogramData.find((d: any) => d.numero === toothNumber);
                    const caras = toothData?.caras || {
                      vestibular: 'sano',
                      lingual: 'sano',
                      mesial: 'sano',
                      distal: 'sano',
                      oclusal: 'sano'
                    };

                    const coloresEstados: Record<string, string> = {
                      sano: '#ffffff',
                      caries: '#8B0000',
                      amalgama: '#708090',
                      resina: '#F5F5DC',
                      corona: '#FFD700',
                      endodoncia: '#FF69B4',
                      extraccion: '#FF0000',
                      implante: '#4169E1'
                    };

                    return (
                      <div key={toothNumber} className="text-center">
                        <div className="text-xs font-medium mb-1">{toothNumber}</div>
                        <div className="mx-auto" style={{ width: '40px', height: '50px' }}>
                          {/* Cara vestibular */}
                          <div 
                            className="mx-auto border border-gray-400 rounded-t-lg mb-px" 
                            style={{ 
                              width: '30px', 
                              height: '10px',
                              backgroundColor: coloresEstados[caras.vestibular] || '#ffffff'
                            }}
                          ></div>
                          {/* Fila central con caras mesial, oclusal, distal */}
                          <div className="flex justify-center items-center mb-px">
                            <div 
                              className="border border-gray-400 rounded-l-sm" 
                              style={{ 
                                width: '8px', 
                                height: '20px',
                                backgroundColor: coloresEstados[caras.mesial] || '#ffffff'
                              }}
                            ></div>
                            <div 
                              className="border-t border-b border-gray-400" 
                              style={{ 
                                width: '14px', 
                                height: '20px',
                                backgroundColor: coloresEstados[caras.oclusal] || '#ffffff'
                              }}
                            ></div>
                            <div 
                              className="border border-gray-400 rounded-r-sm" 
                              style={{ 
                                width: '8px', 
                                height: '20px',
                                backgroundColor: coloresEstados[caras.distal] || '#ffffff'
                              }}
                            ></div>
                          </div>
                          {/* Cara lingual */}
                          <div 
                            className="mx-auto border border-gray-400 rounded-b-lg" 
                            style={{ 
                              width: '30px', 
                              height: '10px',
                              backgroundColor: coloresEstados[caras.lingual] || '#ffffff'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Maxilar Inferior */}
              <div>
                <h4 className="text-center font-medium mb-4">Maxilar Inferior</h4>
                <div className="grid grid-cols-8 gap-2 max-w-4xl mx-auto">
                  {[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17].map(toothNumber => {
                    const toothData = odontogramData.find((d: any) => d.numero === toothNumber);
                    const caras = toothData?.caras || {
                      vestibular: 'sano',
                      lingual: 'sano',
                      mesial: 'sano',
                      distal: 'sano',
                      oclusal: 'sano'
                    };

                    const coloresEstados: Record<string, string> = {
                      sano: '#ffffff',
                      caries: '#8B0000',
                      amalgama: '#708090',
                      resina: '#F5F5DC',
                      corona: '#FFD700',
                      endodoncia: '#FF69B4',
                      extraccion: '#FF0000',
                      implante: '#4169E1'
                    };

                    return (
                      <div key={toothNumber} className="text-center">
                        <div className="mx-auto" style={{ width: '40px', height: '50px' }}>
                          {/* Cara vestibular */}
                          <div 
                            className="mx-auto border border-gray-400 rounded-t-lg mb-px" 
                            style={{ 
                              width: '30px', 
                              height: '10px',
                              backgroundColor: coloresEstados[caras.vestibular] || '#ffffff'
                            }}
                          ></div>
                          {/* Fila central con caras mesial, oclusal, distal */}
                          <div className="flex justify-center items-center mb-px">
                            <div 
                              className="border border-gray-400 rounded-l-sm" 
                              style={{ 
                                width: '8px', 
                                height: '20px',
                                backgroundColor: coloresEstados[caras.mesial] || '#ffffff'
                              }}
                            ></div>
                            <div 
                              className="border-t border-b border-gray-400" 
                              style={{ 
                                width: '14px', 
                                height: '20px',
                                backgroundColor: coloresEstados[caras.oclusal] || '#ffffff'
                              }}
                            ></div>
                            <div 
                              className="border border-gray-400 rounded-r-sm" 
                              style={{ 
                                width: '8px', 
                                height: '20px',
                                backgroundColor: coloresEstados[caras.distal] || '#ffffff'
                              }}
                            ></div>
                          </div>
                          {/* Cara lingual */}
                          <div 
                            className="mx-auto border border-gray-400 rounded-b-lg" 
                            style={{ 
                              width: '30px', 
                              height: '10px',
                              backgroundColor: coloresEstados[caras.lingual] || '#ffffff'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium mt-1">{toothNumber}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumen financiero */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-sm">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-right pr-4">Subtotal:</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(budget.subtotal)}</td>
                </tr>
                {budget.discount > 0 && (
                  <tr>
                    <td className="py-2 text-right pr-4">Descuento:</td>
                    <td className="py-2 text-right font-medium text-red-600">-{formatCurrency(budget.discount)}</td>
                  </tr>
                )}
                {budget.tax > 0 && (
                  <tr>
                    <td className="py-2 text-right pr-4">IVA:</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(budget.tax)}</td>
                  </tr>
                )}
                <tr className="border-t border-gray-300">
                  <td className="py-2 text-right pr-4 font-bold text-lg">TOTAL:</td>
                  <td className="py-2 text-right font-bold text-lg text-teal-600">{formatCurrency(budget.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan de financiamiento */}
        {budget.paymentPlan && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Financiamiento</h3>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              {budget.paymentPlan === 'contado' && (
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Pago de Contado</h4>
                  <p className="text-gray-700">El paciente pagará el monto total al momento del tratamiento.</p>
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium text-green-800">Total a pagar: {formatCurrency(budget.total)}</p>
                    <p className="text-sm text-green-600 mt-1">✓ Sin intereses adicionales</p>
                  </div>
                </div>
              )}
              
              {budget.paymentPlan === '3_meses' && (
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Plan a 3 Meses</h4>
                  <p className="text-gray-700 mb-3">El pago se dividirá en 3 cuotas mensuales iguales.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map(mes => (
                      <div key={mes} className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="font-medium text-blue-800">Cuota {mes}</p>
                        <p className="text-blue-700">{formatCurrency(Number(budget.total) / 3)}</p>
                        <p className="text-xs text-blue-600">
                          Vence: {format(new Date(Date.now() + (mes * 30 * 24 * 60 * 60 * 1000)), "MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {budget.paymentPlan === '6_meses' && (
                <div>
                  <h4 className="font-semibold text-purple-600 mb-2">Plan a 6 Meses</h4>
                  <p className="text-gray-700 mb-3">El pago se dividirá en 6 cuotas mensuales con 5% de interés.</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(mes => (
                      <div key={mes} className="p-3 bg-purple-50 rounded border border-purple-200">
                        <p className="font-medium text-purple-800">Cuota {mes}</p>
                        <p className="text-purple-700">{formatCurrency((Number(budget.total) * 1.05) / 6)}</p>
                        <p className="text-xs text-purple-600">
                          Vence: {format(new Date(Date.now() + (mes * 30 * 24 * 60 * 60 * 1000)), "MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-purple-100 rounded text-sm">
                    <p className="text-purple-800">Total con intereses: {formatCurrency(Number(budget.total) * 1.05)}</p>
                  </div>
                </div>
              )}
              
              {budget.paymentPlan === '12_meses' && (
                <div>
                  <h4 className="font-semibold text-indigo-600 mb-2">Plan a 12 Meses</h4>
                  <p className="text-gray-700 mb-3">El pago se dividirá en 12 cuotas mensuales con 10% de interés.</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mes => (
                      <div key={mes} className="p-3 bg-indigo-50 rounded border border-indigo-200">
                        <p className="font-medium text-indigo-800">Cuota {mes}</p>
                        <p className="text-indigo-700">{formatCurrency((Number(budget.total) * 1.10) / 12)}</p>
                        <p className="text-xs text-indigo-600">
                          Vence: {format(new Date(Date.now() + (mes * 30 * 24 * 60 * 60 * 1000)), "MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-indigo-100 rounded text-sm">
                    <p className="text-indigo-800">Total con intereses: {formatCurrency(Number(budget.total) * 1.10)}</p>
                  </div>
                </div>
              )}
              
              {budget.paymentPlan === 'custom' && budget.customPayments && (
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2">Plan Personalizado</h4>
                  <p className="text-gray-700 mb-3">Plan de pagos personalizado según las necesidades del paciente.</p>
                  {(() => {
                    try {
                      const customPayments = JSON.parse(budget.customPayments);
                      return (
                        <div className="space-y-2">
                          {customPayments.map((payment: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200">
                              <div>
                                <p className="font-medium text-orange-800">
                                  {payment.description || `Pago ${index + 1}`}
                                </p>
                                <p className="text-xs text-orange-600">
                                  Vence: {format(new Date(payment.date), "PPP", { locale: es })}
                                </p>
                              </div>
                              <p className="text-orange-700 font-medium">
                                {formatCurrency(payment.amount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (error) {
                      return <p className="text-red-600 text-sm">Error al mostrar los pagos personalizados</p>;
                    }
                  })()}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p><strong>Importante:</strong> Los pagos deben realizarse en las fechas indicadas. En caso de retraso, se aplicarán los recargos correspondientes según los términos y condiciones.</p>
              </div>
            </div>
          </div>
        )}

        {/* Términos y condiciones */}
        {budget.termsConditions && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Términos y Condiciones</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {budget.termsConditions}
            </div>
          </div>
        )}

        {/* Notas adicionales */}
        {budget.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas Adicionales</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {budget.notes}
            </div>
          </div>
        )}

        {/* Firmas */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-b border-gray-300 mb-2 pb-8"></div>
            <p className="text-sm text-gray-600">Firma del Doctor</p>
            <p className="text-sm font-medium">{budget.doctor.firstName} {budget.doctor.lastName}</p>
          </div>
          
          <div className="text-center">
            <div className="border-b border-gray-300 mb-2 pb-8"></div>
            <p className="text-sm text-gray-600">Firma del Paciente</p>
            <p className="text-sm font-medium">{budget.patient.firstName} {budget.patient.lastName}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Este presupuesto fue generado por {config.clinicName} el {format(new Date(), "PPP 'a las' p", { locale: es })}</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .budget-print-content, .budget-print-content * {
            visibility: visible;
          }
          
          .budget-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
          }
          
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
