import React from 'react';
import { HardDrive, ShieldCheck, RefreshCw, Settings, Sliders, Cloud } from 'lucide-react';

export function Header({ status, onOpenConfig, onOpenRules, onOpenGDrive, onRefresh }) {
  const isTcConnected = status?.timeCapsule?.connected;
  const isGDriveConnected = status?.cloudProviders?.gdrive?.status === 'connected';

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

      <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span className={`badge ${isTcConnected ? 'badge-tc' : 'badge-warning'}`}>
          <ShieldCheck size={14} />
          {isTcConnected ? `TC Conectada (${status?.timeCapsule?.ip})` : 'Desconectada'}
        </span>

        <button 
          className="btn btn-secondary" 
          onClick={onOpenGDrive} 
          title="Conectar ou configurar conta do Google Drive"
          style={{ borderColor: isGDriveConnected ? 'rgba(52, 168, 83, 0.4)' : 'var(--border-color)', color: isGDriveConnected ? '#34a853' : 'inherit' }}
        >
          <Cloud size={16} color={isGDriveConnected ? '#34a853' : '#94a3b8'} />
          {isGDriveConnected ? 'Google Drive (Conectado)' : 'Conectar Google Drive'}
        </button>

        <button className="btn btn-secondary" onClick={onOpenRules} title="Regras de Agendamento">
          <Sliders size={16} />
          Regras
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
