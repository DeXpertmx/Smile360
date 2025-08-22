
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, calId } = await request.json();

    if (!apiKey || !calId) {
      return NextResponse.json({ 
        success: false, 
        error: 'API Key y Cal ID son requeridos' 
      }, { status: 400 });
    }

    // Test Cal.com API connection by getting user info
    const response = await fetch(`https://api.cal.com/v1/me`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cal.com API error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciales inválidas o error de API' 
      }, { status: 400 });
    }

    const userData = await response.json();

    // Verify the user exists and has the correct username
    if (userData.username !== calId) {
      return NextResponse.json({ 
        success: false, 
        error: 'El Cal ID no coincide con el usuario de la API Key' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        username: userData.username,
        name: userData.name,
        email: userData.email
      }
    });

  } catch (error) {
    console.error('Error testing Cal.com connection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error de conexión' 
    }, { status: 500 });
  }
}
