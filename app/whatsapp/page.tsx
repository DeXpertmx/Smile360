
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppConfig } from "@/components/whatsapp/WhatsAppConfig";
import { MessageSender } from "@/components/whatsapp/MessageSender";
import { MessageHistory } from "@/components/whatsapp/MessageHistory";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, History, Settings, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function WhatsAppPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Error obteniendo pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeTemplates = async () => {
    try {
      const response = await fetch("/api/whatsapp/templates/initialize", {
        method: "POST",
      });
      if (response.ok) {
        toast.success("Plantillas inicializadas correctamente");
      }
    } catch (error) {
      console.error("Error inicializando plantillas:", error);
    }
  };

  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Mensaje enviado exitosamente");
  };

  useEffect(() => {
    fetchPatients();
    initializeTemplates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
            <MessageCircle className="w-8 h-8" />
            WhatsApp Business
          </h1>
          <p className="text-gray-600">
            Gestiona la comunicación con tus pacientes a través de WhatsApp
          </p>
        </div>
        <Button onClick={fetchPatients} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensajes
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="stats">
            <MessageCircle className="w-4 h-4 mr-2" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <WhatsAppConfig />
        </TabsContent>

        <TabsContent value="send">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Cargando pacientes...</span>
              </CardContent>
            </Card>
          ) : (
            <MessageSender 
              patients={patients} 
              onMessageSent={handleMessageSent}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <MessageHistory refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">0</div>
                <p className="text-xs text-muted-foreground">En las últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recordatorios Automáticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">0</div>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <p className="text-xs text-muted-foreground">Promedio mensual</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Funcionalidades Próximas</CardTitle>
              <CardDescription>
                Mejoras planificadas para el sistema de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Envío masivo de promociones y avisos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Confirmación automática de citas por WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Chatbot para respuestas automáticas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Métricas detalladas y análisis de engagement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Webhooks para estados de mensajes en tiempo real
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
