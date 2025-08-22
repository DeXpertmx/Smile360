
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTreatmentTemplates() {
  try {
    console.log('Creando plantillas de órdenes de tratamiento...');

    // Plantilla para Blanqueamiento Dental
    const existingBlanqueamiento = await prisma.treatmentOrderTemplate.findFirst({
      where: { name: 'Blanqueamiento Dental Estándar' }
    });
    
    if (!existingBlanqueamiento) {
      await prisma.treatmentOrderTemplate.create({
        data: {
        name: 'Blanqueamiento Dental Estándar',
        category: 'Estético',
        description: 'Plantilla estándar para procedimientos de blanqueamiento dental',
        content: `
<h2>ORDEN DE TRATAMIENTO - BLANQUEAMIENTO DENTAL</h2>

<h3>Información del Paciente:</h3>
<p><strong>Nombre:</strong> {{patientName}}</p>
<p><strong>Número de Expediente:</strong> {{patientNumber}}</p>
<p><strong>Fecha:</strong> {{currentDate}}</p>

<h3>Procedimiento a Realizar:</h3>
<p><strong>Tipo:</strong> {{procedureType}}</p>
<p><strong>Descripción:</strong> {{procedureDescription}}</p>

<h3>Diagnóstico:</h3>
<p>{{diagnosis}}</p>

<h3>Plan de Tratamiento Detallado:</h3>
<p>{{treatmentDetails}}</p>

<h3>Riesgos y Consideraciones:</h3>
<ul>
  <li>Sensibilidad dental temporal</li>
  <li>Posible irritación de encías</li>
  <li>Resultados variables según el tipo de manchas</li>
  <li>Necesidad de evitar alimentos pigmentantes por 48 horas</li>
</ul>

<h3>Alternativas de Tratamiento:</h3>
<p>{{alternatives}}</p>

<h3>Cuidados Post-Operatorios:</h3>
<ul>
  <li>Evitar bebidas y alimentos pigmentantes por 48-72 horas</li>
  <li>Usar pasta dental para dientes sensibles si es necesario</li>
  <li>Mantener una excelente higiene oral</li>
  <li>Contactar al consultorio si presenta dolor severo</li>
</ul>

<h3>Resultados Esperados:</h3>
<p>{{expectedOutcome}}</p>

<h3>Costo Total del Tratamiento:</h3>
<p><strong>€{{totalCost}}</strong></p>

<h3>Términos de Pago:</h3>
<p>{{paymentTerms}}</p>
        `,
        variables: JSON.stringify([
          'patientName',
          'patientNumber',
          'currentDate',
          'procedureType',
          'procedureDescription',
          'diagnosis',
          'treatmentDetails',
          'alternatives',
          'expectedOutcome',
          'totalCost',
          'paymentTerms'
        ]),
        requiresSignature: true,
        isDefault: true,
        legalDisclaimer: 'Este procedimiento ha sido explicado en detalle. Entiendo los riesgos, beneficios y alternativas. Consiento voluntariamente a este tratamiento.',
        termsConditions: 'El paciente debe seguir todas las instrucciones post-operatorias. Los resultados pueden variar según cada individuo.'
        }
      });
    }

    // Plantilla para Endodoncia
    const existingEndodoncia = await prisma.treatmentOrderTemplate.findFirst({
      where: { name: 'Endodoncia Estándar' }
    });
    
    if (!existingEndodoncia) {
      await prisma.treatmentOrderTemplate.create({
        data: {
        name: 'Endodoncia Estándar',
        category: 'Endodoncia',
        description: 'Plantilla para tratamientos de conducto radicular',
        content: `
<h2>ORDEN DE TRATAMIENTO - ENDODONCIA</h2>

<h3>Información del Paciente:</h3>
<p><strong>Nombre:</strong> {{patientName}}</p>
<p><strong>Número de Expediente:</strong> {{patientNumber}}</p>
<p><strong>Fecha:</strong> {{currentDate}}</p>
<p><strong>Diente a tratar:</strong> {{toothNumber}}</p>

<h3>Procedimiento a Realizar:</h3>
<p><strong>Tipo:</strong> {{procedureType}}</p>
<p><strong>Descripción:</strong> {{procedureDescription}}</p>

<h3>Diagnóstico:</h3>
<p>{{diagnosis}}</p>

<h3>Plan de Tratamiento:</h3>
<p>{{treatmentDetails}}</p>

<h3>Riesgos del Procedimiento:</h3>
<ul>
  <li>Dolor post-operatorio</li>
  <li>Inflamación temporal</li>
  <li>Posible fractura del diente durante el procedimiento</li>
  <li>Necesidad de tratamiento adicional</li>
  <li>Posible necesidad de extracción si el tratamiento no es exitoso</li>
</ul>

<h3>Alternativas de Tratamiento:</h3>
<p>{{alternatives}}</p>

<h3>Cuidados Post-Operatorios:</h3>
<ul>
  <li>Evitar masticar con el diente tratado hasta la cita siguiente</li>
  <li>Tomar analgésicos según prescripción</li>
  <li>Mantener excelente higiene oral</li>
  <li>Contactar inmediatamente si presenta dolor severo o inflamación</li>
  <li>Acudir a cita de control según programado</li>
</ul>

<h3>Resultados Esperados:</h3>
<p>{{expectedOutcome}}</p>

<h3>Costo Total:</h3>
<p><strong>€{{totalCost}}</strong></p>
        `,
        variables: JSON.stringify([
          'patientName',
          'patientNumber',
          'currentDate',
          'toothNumber',
          'procedureType',
          'procedureDescription',
          'diagnosis',
          'treatmentDetails',
          'alternatives',
          'expectedOutcome',
          'totalCost'
        ]),
        requiresSignature: true,
        isDefault: true,
        legalDisclaimer: 'He sido informado sobre la naturaleza del tratamiento de conducto, sus riesgos, beneficios y alternativas. Consiento a este tratamiento.',
        termsConditions: 'Es posible que se requieran citas adicionales. El pronóstico puede variar según la complejidad del caso.'
        }
      });
    }

    // Plantilla para Cirugía Oral
    const existingCirugia = await prisma.treatmentOrderTemplate.findFirst({
      where: { name: 'Cirugía Oral Estándar' }
    });
    
    if (!existingCirugia) {
      await prisma.treatmentOrderTemplate.create({
        data: {
        name: 'Cirugía Oral Estándar',
        category: 'Cirugía',
        description: 'Plantilla para procedimientos quirúrgicos orales',
        content: `
<h2>ORDEN DE TRATAMIENTO - CIRUGÍA ORAL</h2>

<h3>Información del Paciente:</h3>
<p><strong>Nombre:</strong> {{patientName}}</p>
<p><strong>Número de Expediente:</strong> {{patientNumber}}</p>
<p><strong>Fecha:</strong> {{currentDate}}</p>

<h3>Procedimiento Quirúrgico:</h3>
<p><strong>Tipo:</strong> {{procedureType}}</p>
<p><strong>Descripción:</strong> {{procedureDescription}}</p>

<h3>Diagnóstico Pre-Quirúrgico:</h3>
<p>{{diagnosis}}</p>

<h3>Plan Quirúrgico:</h3>
<p>{{treatmentDetails}}</p>

<h3>Riesgos Quirúrgicos:</h3>
<ul>
  <li>Sangrado excesivo</li>
  <li>Infección post-quirúrgica</li>
  <li>Dolor e inflamación</li>
  <li>Daño a estructuras adyacentes</li>
  <li>Necesidad de procedimientos adicionales</li>
  <li>Reacciones a anestesia</li>
</ul>

<h3>Alternativas Quirúrgicas:</h3>
<p>{{alternatives}}</p>

<h3>Instrucciones Post-Quirúrgicas CRÍTICAS:</h3>
<ul>
  <li><strong>Reposo absoluto por 24-48 horas</strong></li>
  <li>Aplicar hielo por 15 minutos cada hora las primeras 6 horas</li>
  <li>No escupir, enjuagar o usar pajillas por 24 horas</li>
  <li>Dieta líquida/blanda por 48 horas</li>
  <li>Tomar antibióticos y analgésicos según prescripción</li>
  <li>No fumar ni consumir alcohol</li>
  <li>Contactar INMEDIATAMENTE si presenta sangrado excesivo o dolor severo</li>
</ul>

<h3>Pronóstico:</h3>
<p>{{expectedOutcome}}</p>

<h3>Costo Total:</h3>
<p><strong>€{{totalCost}}</strong></p>

<div style="margin-top: 30px; padding: 15px; border: 2px solid red; background-color: #ffe6e6;">
<h4 style="color: red;">AVISO IMPORTANTE</h4>
<p>Este es un procedimiento quirúrgico que requiere seguimiento estricto de las instrucciones post-operatorias. El incumplimiento puede resultar en complicaciones graves.</p>
</div>
        `,
        variables: JSON.stringify([
          'patientName',
          'patientNumber',
          'currentDate',
          'procedureType',
          'procedureDescription',
          'diagnosis',
          'treatmentDetails',
          'alternatives',
          'expectedOutcome',
          'totalCost'
        ]),
        requiresSignature: true,
        isDefault: true,
        legalDisclaimer: 'Entiendo que este es un procedimiento quirúrgico con riesgos inherentes. He sido informado completamente y consiento voluntariamente.',
        termsConditions: 'El cumplimiento de las instrucciones post-operatorias es crítico para el éxito del tratamiento. Los resultados no están garantizados.'
        }
      });
    }

    console.log('Plantillas de órdenes de tratamiento creadas exitosamente');

  } catch (error) {
    console.error('Error al crear plantillas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTreatmentTemplates();
