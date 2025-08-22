
const { PrismaClient } = require('@prisma/client');

async function testBudgetAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing budget API...');
    
    // Get first patient and user for testing
    const patient = await prisma.patient.findFirst({
      select: { id: true, firstName: true, lastName: true }
    });
    
    const user = await prisma.user.findFirst({
      where: { role: { not: 'PATIENT' } },
      select: { id: true, firstName: true, lastName: true, email: true }
    });
    
    console.log('📋 Found patient:', patient);
    console.log('👨‍⚕️ Found user:', user);
    
    if (!patient || !user) {
      console.log('❌ No patient or user found. Please run seed first.');
      return;
    }
    
    // Test budget data
    const budgetData = {
      title: "Presupuesto de Prueba API",
      patientId: patient.id,
      doctorId: user.id,
      description: "Presupuesto creado desde script de prueba",
      subtotal: 150,
      discount: 0,
      tax: 0,
      total: 150,
      items: [
        {
          type: "tratamiento",
          name: "Limpieza dental",
          description: "Limpieza y profilaxis dental",
          category: "preventivo",
          quantity: 1,
          unitPrice: 150,
          discount: 0,
          total: 150,
          priority: "Normal",
          estimated: false
        }
      ]
    };
    
    console.log('💾 Creating budget directly with Prisma...');
    
    // Create budget directly using Prisma
    const budget = await prisma.budget.create({
      data: {
        title: budgetData.title,
        description: budgetData.description,
        patientId: budgetData.patientId,
        doctorId: budgetData.doctorId,
        validUntil: null,
        notes: null,
        termsConditions: null,
        subtotal: budgetData.subtotal,
        discount: budgetData.discount,
        tax: budgetData.tax,
        total: budgetData.total,
        status: 'Borrador',
        odontogramaData: null,
        includeOdontogram: false,
        items: {
          create: budgetData.items.map(item => ({
            type: item.type,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
            priority: item.priority,
            estimated: item.estimated,
            notes: item.notes || null,
            productId: null,
          }))
        }
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            numeroExpediente: true,
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        items: true
      }
    });
    
    console.log('✅ Budget created successfully!');
    console.log('📄 Budget details:');
    console.log(`   ID: ${budget.id}`);
    console.log(`   Number: ${budget.budgetNumber}`);
    console.log(`   Title: ${budget.title}`);
    console.log(`   Patient: ${budget.patient.firstName} ${budget.patient.lastName}`);
    console.log(`   Doctor: ${budget.doctor.firstName} ${budget.doctor.lastName}`);
    console.log(`   Total: $${budget.total}`);
    console.log(`   Items: ${budget.items.length}`);
    console.log(`   Status: ${budget.status}`);
    
    // Now test fetching budgets
    console.log('\n🔍 Testing budget fetch...');
    const budgets = await prisma.budget.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            numeroExpediente: true,
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${budgets.length} budgets in total`);
    console.log('📋 Recent budgets:');
    budgets.slice(0, 3).forEach((budget, index) => {
      console.log(`   ${index + 1}. ${budget.title} - ${budget.patient.firstName} ${budget.patient.lastName} ($${budget.total})`);
    });
    
  } catch (error) {
    console.error('❌ Error testing budget API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBudgetAPI().catch(console.error);
