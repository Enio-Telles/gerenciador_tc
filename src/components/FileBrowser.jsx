import React, { useState } from 'react';
import { 
  Folder, File, HardDrive, Cloud, CheckSquare, Square, 
  DownloadCloud, Trash2, ArrowUpRight, Plus, Edit3, ArrowLeft, Eye 
} from 'lucide-react';

export function FileBrowser({ 
  tcFiles, 
  currentPath,
  onNavigatePath,
  cloudProvider, 
  cloudFiles, 
  selectedFiles, 
  onToggleSelectFile, 
  onSelectAll, 
  onStartOffload,
  onOpenFileEditor,
  onOpenNewItemModal,
  onDeleteSelected
}) {
  const [selectedTargetCloud, setSelectedTargetCloud] = useState('onedrive');

  const isAllSelected = tcFiles.length > 0 && selectedFiles.length === tcFiles.length;

  const handleFolderClick = (file) => {
    if (file.type === 'directory') {
      onNavigatePath(file.path);
    } else {
      onOpenFileEditor(file);
    }
  };

  const handleGoBack = () => {
    if (currentPath === '/' || !currentPath) return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parent = '/' + parts.join('/');
    onNavigatePath(parent);
  };

  return (
    <div className="explorer-container">
      {/* Time Capsule Share Explorer */}
      <div className="glass-panel explorer-pane">
        <div className="pane-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <div className="pane-title-group">
            <HardDrive size={20} color="#38bdf8" />
            <div>
              <h2 style={{ margin: 0 }}>Apple Time Capsule 2TB (\Data)</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Caminho atual: <strong>{currentPath || '/'}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {currentPath !== '/' && (
              <button 
                className="btn btn-secondary" 
                onClick={handleGoBack}
                title="Voltar para diretório pai"
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                <ArrowLeft size={14} /> Voltar
              </button>
            )}

            <button 
              className="btn btn-secondary" 
              onClick={onOpenNewItemModal}
              title="Criar novo arquivo ou pasta neste diretório"
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              <Plus size={14} /> Novo
            </button>

            {selectedFiles.length === 1 && (
              <button 
                className="btn btn-secondary"
                onClick={() => onOpenFileEditor(selectedFiles[0])}
                title="Visualizar ou editar conteúdo do arquivo selecionado"
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                <Edit3 size={14} /> Editar
              </button>
            )}

            {selectedFiles.length > 0 && (
              <button 
                className="btn btn-secondary"
                onClick={onDeleteSelected}
                title="Excluir itens selecionados"
                style={{ padding: '6px 10px', fontSize: '12px', color: '#ef4444' }}
              >
                <Trash2 size={14} /> Excluir ({selectedFiles.length})
              </button>
            )}

            <button 
              className="btn btn-secondary" 
              onClick={onSelectAll} 
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              {isAllSelected ? 'Desmarcar' : 'Todos'}
            </button>
          </div>
        </div>

        <div className="file-list">
          {tcFiles.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Esta pasta está vazia. Clique em <strong>"+ Novo"</strong> para adicionar um arquivo ou pasta.
            </div>
          ) : (
            tcFiles.map((file) => {
              const isSelected = selectedFiles.some(f => f.id === file.id);
              return (
                <div 
                  key={file.id} 
                  className={`file-item ${isSelected ? 'selected' : ''}`}
                >
                  <div 
                    className="file-info"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectFile(file);
                    }}
                  >
                    {isSelected ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color="#64748b" />}
                    {file.type === 'directory' ? <Folder size={18} color="#38bdf8" /> : <File size={18} color="#94a3b8" />}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderClick(file);
                      }}
                      style={{ cursor: 'pointer' }}
                      title={file.type === 'directory' ? 'Clique para abrir pasta' : 'Clique para visualizar e editar'}
                    >
                      <div className="file-name" style={{ color: file.type === 'directory' ? '#38bdf8' : 'inherit' }}>
                        {file.name}
                      </div>
                      <div className="file-meta">{file.sizeFormatted} • Modificado em {file.modified}</div>
                    </div>
                  </div>

                  <div className="file-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="badge badge-tc" style={{ fontSize: '11px' }}>{file.category}</span>
                    <button 
                      className="btn-icon" 
                      onClick={() => onOpenFileEditor(file)}
                      title="Abrir editor / detalhes"
                    >
                      <Eye size={14} color="#94a3b8" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
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
