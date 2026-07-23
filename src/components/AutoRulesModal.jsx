import React, { useState } from 'react';
import { X, Sliders, Plus, CheckCircle, Clock } from 'lucide-react';

export function AutoRulesModal({ isOpen, onClose, rules, onAddRule }) {
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('Time Capsule /');
  const [newDest, setNewDest] = useState('Microsoft OneDrive');
  const [newTrigger, setNewTrigger] = useState('Arquivos > 30 dias sem alteração');

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    onAddRule({
      title: newTitle,
      description: `Agendamento automático de desafogamento para ${newDest}`,
      source: newSource,
      destination: newDest,
      trigger: newTrigger
    });

    setNewTitle('');
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '18px' }}>Regras de Agendamento e Desafogamento</h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Regras Ativas:</h3>
            {rules.map((rule) => (
              <div key={rule.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{rule.title}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {rule.source} ➔ {rule.destination} ({rule.trigger})
                  </div>
                </div>
                <span className="badge badge-tc">
                  <CheckCircle size={12} /> Ativa
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '14px' }}>Criar Nova Regra de Auto-Offload</h3>

            <div className="form-group">
              <label>Nome da Regra</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: Desafogar fotos antigas da Time Capsule"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Destino na Nuvem</label>
                <select className="form-control" value={newDest} onChange={(e) => setNewDest(e.target.value)}>
                  <option value="Microsoft OneDrive">Microsoft OneDrive (1 TB)</option>
                  <option value="Google Drive">Google Drive (200 GB)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Gatilho de Agendamento</label>
                <select className="form-control" value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)}>
                  <option value="Arquivos > 30 dias sem alteração">Arquivos &gt; 30 dias sem alteração</option>
                  <option value="Arquivos > 60 dias sem alteração">Arquivos &gt; 60 dias sem alteração</option>
                  <option value="Quando espaço livre na TC < 500 GB">Quando espaço livre na TC &lt; 500 GB</option>
                  <option value="Semanalmente aos Domingos">Semanalmente aos Domingos</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
              <Plus size={16} /> Adicionar Regra
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
