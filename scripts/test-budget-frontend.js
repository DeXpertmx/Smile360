
const { default: fetch } = require('node-fetch');

// Mock session data - simulating authenticated request
const mockSessionData = {
  user: {
    id: 'cmeaezjvu0000qkth72xt5z7l', // John Doe from previous test
    email: 'john@doe.com'
  }
};

async function testBudgetAPI() {
  console.log('🔍 Testing budget API via HTTP...');
  
  // Test data that would come from the frontend form
  const budgetData = {
    title: "Presupuesto desde Frontend",
    description: "Presupuesto creado simulando el formulario frontend",
    patientId: "cmeaezjw60003qkth4lvpbmws", // Carlos Rodríguez
    doctorId: "cmeaezjvu0000qkth72xt5z7l", // John Doe
    subtotal: 200,
    discount: 0,
    tax: 0,
    total: 200,
    items: [
      {
        type: "tratamiento",
        name: "Consulta general",
        description: "Revisión y diagnóstico",
        category: "general",
        quantity: 1,
        unitPrice: 200,
        discount: 0,
        total: 200,
        priority: "Normal",
        estimated: false
      }
    ],
    status: "Borrador",
    odontogramaData: null,
    includeOdontogram: false
  };

  try {
    console.log('📤 Sending POST request to /api/budgets...');
    console.log('📋 Data being sent:', JSON.stringify(budgetData, null, 2));

    // Note: This will fail because we don't have session authentication in this script
    // But we can see what happens and debug the response
    const response = await fetch('http://localhost:3000/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    const responseData = await response.json();
    console.log('📄 Response data:', responseData);

    if (response.ok) {
      console.log('✅ Budget saved successfully via API!');
    } else {
      console.log('❌ API returned error:', responseData.error);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testBudgetAPI().catch(console.error);
