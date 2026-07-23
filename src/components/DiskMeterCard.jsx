import React from 'react';
import { HardDrive, Cloud, AlertTriangle, ArrowRight } from 'lucide-react';

export function DiskMeterCard({ type, title, subtitle, totalGB, usedGB, freeGB, percentUsed, warning, offloadableGB, onQuickOffload }) {
  const isLocal = type === 'local';
  
  return (
    <div className={`glass-panel meter-card ${type}`}>
      <div className="meter-header">
        <div className="meter-title-info">
          {type === 'tc' && <HardDrive size={22} color="#38bdf8" />}
          {type === 'gdrive' && <Cloud size={22} color="#34a853" />}
          {type === 'onedrive' && <Cloud size={22} color="#0078d4" />}
          {type === 'local' && <HardDrive size={22} color="#ef4444" />}
          
          <div>
            <h3>{title}</h3>
            <span className="stat-sub">{subtitle}</span>
          </div>
        </div>

        {warning && (
          <span className="badge badge-warning">
            <AlertTriangle size={13} /> ALERTA DE CRÍTICO
          </span>
        )}
      </div>

      <div className="meter-stats">
        <div>
          <span className="stat-main">{freeGB} GB</span>
          <span className="stat-sub"> livres de {totalGB} GB</span>
        </div>
        <span className="stat-sub" style={{ fontWeight: 600 }}>{percentUsed}% ocupado</span>
      </div>

      <div className="progress-bar-track">
        <div 
          className={`progress-bar-fill fill-${type}`} 
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {isLocal && warning && (
        <div className="local-offload-alert">
          <div>
            <strong>Espaço no HD do Computador Quase Cheio ({percentUsed}%)!</strong>
            <p>Você pode desafogar até {offloadableGB} GB enviando arquivos diretamente da Time Capsule para o OneDrive/Google Drive.</p>
          </div>
          <button className="btn btn-primary" onClick={onQuickOffload} style={{ whiteSpace: 'nowrap' }}>
            Desafogar Agora
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
