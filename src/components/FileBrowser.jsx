import React, { useState } from 'react';
import { Folder, File, HardDrive, Cloud, CheckSquare, Square, DownloadCloud, Trash2, ArrowUpRight } from 'lucide-react';

export function FileBrowser({ 
  tcFiles, 
  cloudProvider, 
  cloudFiles, 
  selectedFiles, 
  onToggleSelectFile, 
  onSelectAll, 
  onStartOffload 
}) {
  const [selectedTargetCloud, setSelectedTargetCloud] = useState('onedrive');

  const isAllSelected = tcFiles.length > 0 && selectedFiles.length === tcFiles.length;

  return (
    <div className="explorer-container">
      {/* Time Capsule Share Explorer */}
      <div className="glass-panel explorer-pane">
        <div className="pane-header">
          <div className="pane-title-group">
            <HardDrive size={20} color="#38bdf8" />
            <h2>Apple Time Capsule 2TB (\Data)</h2>
          </div>
          <button className="btn btn-secondary" onClick={onSelectAll} style={{ padding: '6px 12px', fontSize: '13px' }}>
            {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
        </div>

        <div className="file-list">
          {tcFiles.map((file) => {
            const isSelected = selectedFiles.some(f => f.id === file.id);
            return (
              <div 
                key={file.id} 
                className={`file-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onToggleSelectFile(file)}
              >
                <div className="file-info">
                  {isSelected ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color="#64748b" />}
                  {file.type === 'directory' ? <Folder size={18} color="#38bdf8" /> : <File size={18} color="#94a3b8" />}
                  <div>
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">{file.sizeFormatted} • Modificado em {file.modified}</div>
                  </div>
                </div>

                <div className="file-actions">
                  <span className="badge badge-tc" style={{ fontSize: '11px' }}>{file.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cloud Target Explorer */}
      <div className="glass-panel explorer-pane">
        <div className="pane-header">
          <div className="pane-title-group">
            <Cloud size={20} color={selectedTargetCloud === 'gdrive' ? '#34a853' : '#0078d4'} />
            <h2>Destino na Nuvem</h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${selectedTargetCloud === 'onedrive' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTargetCloud('onedrive')}
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              OneDrive (1 TB)
            </button>
            <button 
              className={`btn ${selectedTargetCloud === 'gdrive' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setSelectedTargetCloud('gdrive')}
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              Google Drive (200 GB)
            </button>
          </div>
        </div>

        <div className="file-list">
          <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Pasta de Destino na Nuvem: <strong>/{selectedTargetCloud === 'onedrive' ? 'OneDrive_TC_Archive' : 'GoogleDrive_BKP'}</strong>
          </div>
          
          {cloudFiles.map((item) => (
            <div key={item.id} className="file-item" style={{ cursor: 'default' }}>
              <div className="file-info">
                <Folder size={18} color={selectedTargetCloud === 'gdrive' ? '#34a853' : '#0078d4'} />
                <div>
                  <div className="file-name">{item.name}</div>
                  <div className="file-meta">Pasta na nuvem</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offload CTA Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Selecionados: <strong>{selectedFiles.length} item(ns)</strong> ({selectedFiles.reduce((acc, curr) => acc + (curr.sizeGB || 0), 0).toFixed(1)} GB)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary"
              disabled={selectedFiles.length === 0}
              onClick={() => onStartOffload(selectedTargetCloud, 'sync')}
            >
              <DownloadCloud size={16} />
              Apenas Copiar p/ Nuvem
            </button>

            <button 
              className="btn btn-primary"
              disabled={selectedFiles.length === 0}
              onClick={() => onStartOffload(selectedTargetCloud, 'offload')}
            >
              <ArrowUpRight size={16} />
              Desafogar (Mover p/ Nuvem)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
