
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

export function BudgetTestForm() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    
    if (!title.trim()) {
      toast.error('Ingresa un título');
      return;
    }

    setLoading(true);
    console.log('Loading started');

    try {
      const testBudgetData = {
        title: title,
        patientId: "cm4c72w7d000133rlwrt2zd3f", // ID real de un paciente
        doctorId: "cm4c6xfuw0001i5hl64pjm1dc", // ID real de un doctor
        subtotal: 100,
        discount: 0,
        total: 100,
        items: [
          {
            type: "tratamiento",
            name: "Limpieza dental",
            category: "general",
            quantity: 1,
            unitPrice: 100,
            discount: 0,
            total: 100,
            priority: "Normal",
            estimated: false
          }
        ]
      };

      console.log('Sending data:', testBudgetData);

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBudgetData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        toast.success('¡Presupuesto guardado correctamente!');
        setTitle("");
      } else {
        toast.error(result.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
      console.log('Loading ended');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Prueba de Presupuesto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del presupuesto"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Guardando...' : 'Guardar Presupuesto de Prueba'}
        </Button>
      </form>
    </div>
  );
}
