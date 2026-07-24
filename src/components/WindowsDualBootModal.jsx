import React, { useState, useEffect } from 'react';
import { X, HardDrive, Folder, ExternalLink, PlusCircle, CheckCircle2, AlertTriangle, Cpu, Trash2, Search, FileText } from 'lucide-react';

export function WindowsDualBootModal({ isOpen, onClose }) {
  const [partitions, setPartitions] = useState([]);
  const [diskSpace, setDiskSpace] = useState({ total: '856G', used: '750G', free: '107G', percent: '88%' });
  const [largestFiles, setLargestFiles] = useState([]);
  const [loadingPartitions, setLoadingPartitions] = useState(false);
  const [scanningFiles, setScanningFiles] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPartitions = async () => {
    setLoadingPartitions(true);
    try {
      const res = await fetch('http://localhost:3001/api/windows/partitions');
      if (res.ok) {
        const data = await res.json();
        setPartitions(data.partitions || []);
        if (data.diskSpace) {
          setDiskSpace(data.diskSpace);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPartitions(false);
    }
  };

  const fetchLargestFiles = async () => {
    setScanningFiles(true);
    try {
      const res = await fetch('http://localhost:3001/api/windows/largest-files?minSize=50M');
      if (res.ok) {
        const data = await res.json();
        setLargestFiles(data.files || []);
        if (data.files?.length > 0) {
          setMessage(`Escanear completo: Encontrados ${data.files.length} arquivos grandes em C:`);
        } else {
          setMessage('Nenhum arquivo grande (>50MB) foi localizado nas pastas escaneadas.');
        }
      }
    } catch (e) {
      setMessage('Erro ao escanear maiores arquivos do Windows.');
    } finally {
      setScanningFiles(false);
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

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`⚠️ Tem certeza que deseja excluir PERMANENTEMENTE o arquivo?\n\nNome: ${file.name}\nTamanho: ${file.size}\nCaminho: ${file.winPath}`)) {
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/windows/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: file.path })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLargestFiles(largestFiles.filter(f => f.id !== file.id));
        setMessage(`✨ Arquivo "${file.name}" excluído da partição Windows com sucesso!`);
        fetchPartitions();
      } else {
        setMessage(`Erro: ${data.message}`);
      }
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      setMessage('Erro ao excluir arquivo');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '94%', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div className="pane-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <HardDrive size={24} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Arquivos Windows Dual-Boot & Limpeza de Disco</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Identificação de grandes arquivos, atalhos C:\ e criação de partições NTFS
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Disk Space Widget Card */}
        {diskSpace && (
          <div style={{ marginTop: '16px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={20} color="#22c55e" />
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' }}>
                  Espaço na Partição Windows (C:)
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#22c55e' }}>
                  {diskSpace.free} LIVRES
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  (de {diskSpace.total})
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: diskSpace.percent || '88%', 
                  height: '100%', 
                  background: parseInt(diskSpace.percent) > 85 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #38bdf8, #22c55e)',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease'
                }} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>Usado: {diskSpace.used} ({diskSpace.percent})</span>
              <span>Livre: {diskSpace.free}</span>
            </div>
          </div>
        )}

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
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

        {/* Section 2: Largest Files Scanner & Deleter */}
        <div style={{ marginTop: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={16} color="#ef4444" /> Analisador de Maiores Arquivos no Windows (&gt;50MB)
            </h3>

            <button 
              className="btn btn-primary" 
              onClick={fetchLargestFiles} 
              disabled={scanningFiles}
              style={{ fontSize: '12px', padding: '6px 12px', background: scanningFiles ? '#475569' : undefined }}
            >
              {scanningFiles ? '⏳ Escaneando...' : '🔍 Escanear Maiores Arquivos'}
            </button>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {scanningFiles ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#38bdf8', fontSize: '13px' }}>
                🔍 Analisando partição C:\ em busca de ISOs, instaladores, dumps e grandes arquivos... Aguarde...
              </div>
            ) : largestFiles.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Clique no botão <b>"Escanear Maiores Arquivos"</b> acima para listar os arquivos mais pesados que estão ocupando espaço no Windows (C:).
              </div>
            ) : (
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', color: 'var(--text-muted)', sticky: 'top' }}>
                      <th style={{ padding: '8px 12px' }}>Arquivo</th>
                      <th style={{ padding: '8px 12px' }}>Tamanho</th>
                      <th style={{ padding: '8px 12px' }}>Caminho no Windows</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {largestFiles.map((file) => {
                      const parentDir = file.path.substring(0, file.path.lastIndexOf('/'));
                      const isGigabyte = file.size.includes('GB');

                      return (
                        <tr key={file.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: '500', color: '#f8fafc', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText size={14} color={isGigabyte ? '#ef4444' : '#38bdf8'} />
                              {file.name}
                            </div>
                          </td>

                          <td style={{ padding: '8px 12px', fontWeight: 'bold', color: isGigabyte ? '#ef4444' : '#f59e0b' }}>
                            {file.size}
                          </td>

                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.winPath}>
                            {file.winPath}
                          </td>

                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => handleOpenFolder(parentDir)}
                                title="Abrir pasta contendo este arquivo"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
                                <Folder size={12} />
                              </button>

                              <button 
                                className="btn btn-secondary" 
                                onClick={() => handleDeleteFile(file)}
                                title="Excluir arquivo permanentemente"
                                style={{ padding: '4px 8px', fontSize: '11px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                              >
                                <Trash2 size={12} /> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: NTFS Partitions Status */}
        <div style={{ marginTop: '22px' }}>
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
                {loadingPartitions ? 'Buscando partições NTFS...' : 'Partição principal Windows montada em /mnt/windows (NTFS)'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>Dispositivo</th>
                    <th style={{ padding: '8px 12px' }}>Rótulo / Nome</th>
                    <th style={{ padding: '8px 12px' }}>Tamanho</th>
                    <th style={{ padding: '8px 12px' }}>Ponto de Montagem</th>
                  </tr>
                </thead>
                <tbody>
                  {partitions.map((p, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{p.name}</td>
                      <td style={{ padding: '8px 12px', color: '#38bdf8' }}>{p.label || 'Windows Partition'}</td>
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

        {/* Section 4: Create New NTFS Partition Tool */}
        <div style={{ marginTop: '20px', background: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={18} color="#38bdf8" /> Gerar Nova Partição NTFS
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '480px' }}>
                Abra o utilitário gráfico do Ubuntu para redimensionar partições ou criar uma nova partição NTFS com segurança.
              </div>
            </div>

            <button 
              className="btn btn-success" 
              onClick={handleOpenDisks}
              style={{ background: '#0284c7', borderColor: '#0284c7', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'hand2' }}
            >
              <PlusCircle size={16} /> Gerenciador de Discos (GNOME Disks)
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
