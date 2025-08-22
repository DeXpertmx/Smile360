
// Utilidades para WhatsApp

export interface WhatsAppMessageData {
  phoneNumber: string;
  message: string;
  patientId?: string;
  appointmentId?: string;
  messageType?: "REMINDER" | "NOTIFICATION" | "PROMOTION" | "MANUAL";
}

export interface EvolutionApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía un mensaje a través de Evolution API
 */
export async function sendWhatsAppMessage(
  instanceName: string,
  data: WhatsAppMessageData
): Promise<EvolutionApiResponse> {
  try {
    const evolutionApiUrl = process.env.EVOLUTION_API_BASE_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error("Credenciales de Evolution API no configuradas");
    }

    const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: data.phoneNumber.replace(/\D/g, ""),
        text: data.message,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        messageId: result.key?.id,
      };
    } else {
      const errorData = await response.text();
      return {
        success: false,
        error: `Error API: ${response.status} - ${errorData}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Procesa variables en plantillas de mensajes
 */
export function processMessageTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let processedMessage = template;

  // Reemplazar variables en formato {variable}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    processedMessage = processedMessage.replace(regex, value);
  }

  return processedMessage;
}

/**
 * Valida un número de teléfono para WhatsApp
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remover todos los caracteres no numéricos
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Verificar que tenga al menos 10 dígitos y máximo 15
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

/**
 * Formatea un número de teléfono para WhatsApp
 */
export function formatPhoneNumber(phone: string): string {
  // Remover todos los caracteres no numéricos
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Si no comienza con código de país, asumir México (+52)
  if (cleanPhone.length === 10) {
    return `52${cleanPhone}`;
  }
  
  return cleanPhone;
}

/**
 * Verifica el estado de una instancia de WhatsApp
 */
export async function checkInstanceStatus(instanceName: string): Promise<{
  isConnected: boolean;
  status: string;
  error?: string;
}> {
  try {
    const evolutionApiUrl = process.env.EVOLUTION_API_BASE_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error("Credenciales de Evolution API no configuradas");
    }

    const response = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
      headers: {
        'apikey': evolutionApiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isConnected: data.instance?.state === 'open',
        status: data.instance?.state || 'unknown',
      };
    } else {
      return {
        isConnected: false,
        status: 'error',
        error: `Error API: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      isConnected: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
