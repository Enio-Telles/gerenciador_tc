import React, { useState, useEffect } from 'react';
import { X, HardDrive, Folder, ExternalLink, PlusCircle, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export function WindowsDualBootModal({ isOpen, onClose }) {
  const [partitions, setPartitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPartitions = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/windows/partitions');
      if (res.ok) {
        const data = await res.json();
        setPartitions(data.partitions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPartitions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenFolder = async (folderPath) => {
    try {
      const res = await fetch('http://localhost:3001/api/windows/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.message || 'Pasta aberta no gerenciador de arquivos!');
      } else {
        setMessage(data.message || 'Erro ao abrir pasta');
      }
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      setMessage('Erro de comunicação com o servidor');
    }
  };

  const handleOpenDisks = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/windows/open-disks', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Gerenciador de Discos (GNOME Disks) aberto com sucesso!');
      } else {
        setMessage(data.message || 'Erro ao abrir GNOME Disks');
      }
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      setMessage('Erro ao abrir GNOME Disks');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '92%' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div className="pane-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <HardDrive size={24} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Arquivos Windows Dual-Boot & Partições NTFS</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Acesso direto às pastas do Windows (C:) e criação de novas partições NTFS no Linux
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Action Message */}
        {message && (
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        {/* Section 1: Fast Shortcuts to Windows Folders */}
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={16} color="#38bdf8" /> Atalhos para Pastas do Windows (Dual-Boot)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleOpenFolder('/mnt/windows')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'hand2' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={18} color="#38bdf8" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>C:\ (Raiz Windows)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/mnt/windows</div>
                </div>
              </div>
              <ExternalLink size={14} />
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={() => handleOpenFolder('/mnt/windows/Users')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'hand2' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Folder size={18} color="#f59e0b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>C:\Users (Usuários)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Documentos e Downloads</div>
                </div>
              </div>
              <ExternalLink size={14} />
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={() => handleOpenFolder('/mnt/windows/projetos')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'hand2' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="#22c55e" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>C:\projetos</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Código e Sistemas</div>
                </div>
              </div>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* Section 2: NTFS Partitions Status */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={16} color="#22c55e" /> Partições NTFS Detectadas no Sistema
            </h3>
            <button className="btn btn-secondary" onClick={fetchPartitions} style={{ fontSize: '11px', padding: '4px 8px' }}>
              🔄 Atualizar
            </button>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {partitions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                {loading ? 'Buscando partições NTFS...' : 'Partição principal Windows montada em /mnt/windows (NTFS)'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>Dispositivo</th>
                    <th style={{ padding: '8px 12px' }}>Sistema Arquivos</th>
                    <th style={{ padding: '8px 12px' }}>Tamanho</th>
                    <th style={{ padding: '8px 12px' }}>Ponto de Montagem</th>
                  </tr>
                </thead>
                <tbody>
                  {partitions.map((p, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{p.name}</td>
                      <td style={{ padding: '8px 12px', color: '#38bdf8' }}>{p.fstype || 'ntfs'}</td>
                      <td style={{ padding: '8px 12px' }}>{p.size}</td>
                      <td style={{ padding: '8px 12px', color: '#22c55e' }}>
                        {p.mountpoints ? p.mountpoints.filter(Boolean).join(', ') || '/mnt/windows' : '/mnt/windows'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section 3: Create New NTFS Partition Tool */}
        <div style={{ marginTop: '20px', background: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={18} color="#38bdf8" /> Gerar Nova Partição NTFS
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '420px' }}>
                Abra o utilitário gráfico do Ubuntu para redimensionar partições ou criar uma nova partição NTFS com segurança.
              </div>
            </div>

            <button 
              className="btn btn-success" 
              onClick={handleOpenDisks}
              style={{ background: '#0284c7', borderColor: '#0284c7', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'hand2' }}
            >
              <PlusCircle size={16} /> Abrir Gerenciador de Discos (GNOME Disks)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
