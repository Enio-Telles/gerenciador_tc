import React from 'react';
import { HardDrive, CloudUpload, ShieldCheck, RefreshCw, Settings, Sliders } from 'lucide-react';

export function Header({ status, onOpenConfig, onOpenRules, onRefresh }) {
  const isConnected = status?.timeCapsule?.connected;

  return (
    <header className="glass-panel app-header">
      <div className="header-brand">
        <div className="brand-icon-wrapper">
          <HardDrive size={26} color="#38bdf8" />
        </div>
        <div className="brand-title">
          <h1>Gerenciador Time Capsule A1409</h1>
          <p>Sincronização direta Time Capsule ↔ Google Drive / OneDrive & Desafogamento do HD Local</p>
        </div>
      </div>

      <div className="header-actions">
        <span className={`badge ${isConnected ? 'badge-tc' : 'badge-warning'}`}>
          <ShieldCheck size={14} />
          {isConnected ? `Time Capsule Conectada (${status?.timeCapsule?.ip})` : 'Desconectada'}
        </span>

        <button className="btn btn-secondary" onClick={onOpenRules} title="Regras de Agendamento">
          <Sliders size={16} />
          Regras de Auto-Offload
        </button>

        <button className="btn btn-secondary" onClick={onOpenConfig} title="Configurações SMB / IP">
          <Settings size={16} />
          Configurar TC
        </button>

        <button className="btn btn-secondary" onClick={onRefresh} title="Atualizar Status">
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
}
