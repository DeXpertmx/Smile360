
"use client";

import React, { useState } from 'react';
import { CashDashboard } from './CashDashboard';
import { CashMovementForm } from './CashMovementForm';
import { CashSessionForm } from './CashSessionForm';
import { CashSessionDetail } from './CashSessionDetail';

export function CajaModule() {
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenSession = (cashRegisterId: string) => {
    setSelectedCashRegisterId(cashRegisterId);
    setShowSessionForm(true);
  };

  const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowSessionDetail(true);
  };

  const handleNewMovement = (cashRegisterId?: string) => {
    setSelectedCashRegisterId(cashRegisterId || '');
    setShowMovementForm(true);
  };

  const handleViewCashRegister = (cashRegisterId: string) => {
    // Implementar navegación a detalle de caja si es necesario
    console.log('View cash register:', cashRegisterId);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Control de Caja</h1>
        <p className="text-gray-600 mt-2">
          Gestiona ingresos, egresos y arqueos de caja
        </p>
      </div>

      <CashDashboard
        key={refreshKey}
        onOpenSession={handleOpenSession}
        onViewSession={handleViewSession}
        onNewMovement={handleNewMovement}
        onViewCashRegister={handleViewCashRegister}
      />

      <CashMovementForm
        open={showMovementForm}
        onOpenChange={setShowMovementForm}
        onSuccess={handleSuccess}
        defaultCashRegisterId={selectedCashRegisterId}
      />

      <CashSessionForm
        open={showSessionForm}
        onOpenChange={setShowSessionForm}
        onSuccess={handleSuccess}
        cashRegisterId={selectedCashRegisterId}
      />

      <CashSessionDetail
        open={showSessionDetail}
        onOpenChange={setShowSessionDetail}
        sessionId={selectedSessionId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
