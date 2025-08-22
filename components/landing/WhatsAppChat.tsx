
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = '5215551234567';
  const defaultMessage = 'Hola, me interesa conocer más sobre SmileSys';

  const openWhatsApp = (message?: string) => {
    const finalMessage = message || defaultMessage;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const quickMessages = [
    {
      text: 'Quiero una demo personalizada',
      message: 'Hola, me gustaría solicitar una demo personalizada de SmileSys para mi clínica dental'
    },
    {
      text: 'Información sobre precios',
      message: 'Hola, me interesa conocer más detalles sobre los planes y precios de SmileSys'
    },
    {
      text: 'Migración de datos',
      message: 'Hola, ¿pueden ayudarme con la migración de datos desde mi sistema actual a SmileSys?'
    },
    {
      text: 'Soporte técnico',
      message: 'Hola, necesito soporte técnico con SmileSys'
    }
  ];

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80">
          <Card className="shadow-2xl border-green-200">
            <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">SmileSys Support</div>
                  <div className="text-sm text-green-100">En línea</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                👋 ¡Hola! ¿En qué podemos ayudarte hoy?
              </div>
              
              {quickMessages.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-green-50 hover:border-green-200"
                  onClick={() => openWhatsApp(item.message)}
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm">{item.text}</span>
                </Button>
              ))}
              
              <div className="pt-2 border-t">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => openWhatsApp()}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="bg-green-600 hover:bg-green-700 w-14 h-14 rounded-full shadow-lg relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </Button>
      </div>
    </>
  );
}
