import React from 'react';
import { Activity, Play, Pause, XCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function JobMonitor({ jobs, onCancelJob }) {
  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel jobs-section">
      <div className="pane-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className="pane-title-group">
          <Activity size={20} color="#38bdf8" />
          <h2>Tarefas de Desafogamento & Transferência Direta (Stream)</h2>
        </div>
        <span className="badge badge-tc">{jobs.length} Tarefa(s) ativa(s)</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <div className="job-title-group">
                {job.status === 'running' ? (
                  <ArrowUpRight size={18} color="#38bdf8" />
                ) : (
                  <CheckCircle2 size={18} color="#34a853" />
                )}
                <div>
                  <strong>{job.name}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Origem: {job.source} ➔ Destino: {job.target}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="job-speed-tag">{job.speedMBs} MB/s</span>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => onCancelJob(job.id)} 
                  style={{ padding: '4px 8px' }}
                  title="Cancelar Tarefa"
                >
                  <XCircle size={15} color="#ef4444" />
                </button>
              </div>
            </div>

            <div className="job-progress-row">
              <div className="progress-bar-track" style={{ flex: 1 }}>
                <div 
                  className="progress-bar-fill fill-tc" 
                  style={{ width: `${job.percentProgress}%` }}
                />
              </div>

              <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono', width: '120px', textAlign: 'right' }}>
                {job.transferredGB.toFixed(1)} / {job.totalSizeGB.toFixed(1)} GB ({job.percentProgress.toFixed(0)}%)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Modo: <strong>Transferência Direta (Sem consumo de espaço no HD local)</strong></span>
              <span>Tempo restante estimado: <strong>~{job.etaMinutes} min</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
