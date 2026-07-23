import React, { useState } from 'react';
import { 
  Folder, File, HardDrive, Cloud, CheckSquare, Square, 
  DownloadCloud, Trash2, ArrowUpRight, Plus, Edit3, ArrowLeft, Eye, FolderOpen, ChevronRight, FileText
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
    const parent = parts.length === 0 ? '/' : '/' + parts.join('/');
    onNavigatePath(parent);
  };

  // Helper to build clickable breadcrumbs
  const getBreadcrumbs = () => {
    if (currentPath === '/' || !currentPath) {
      return [{ label: 'Data (Raiz)', path: '/' }];
    }
    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ label: 'Data', path: '/' }];
    let accumulated = '';
    parts.forEach(part => {
      accumulated += `/${part}`;
      crumbs.push({ label: part, path: accumulated });
    });
    return crumbs;
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
              
              {/* Breadcrumb Navigation Bar */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                <span>Caminho:</span>
                {getBreadcrumbs().map((crumb, idx, arr) => (
                  <span key={crumb.path} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span 
                      onClick={() => onNavigatePath(crumb.path)}
                      style={{ 
                        color: idx === arr.length - 1 ? '#38bdf8' : 'var(--text-secondary)',
                        fontWeight: idx === arr.length - 1 ? '600' : 'normal',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      title={`Navegar para ${crumb.label}`}
                    >
                      {crumb.label}
                    </span>
                    {idx < arr.length - 1 && <ChevronRight size={12} color="#64748b" />}
                  </span>
                ))}
              </div>
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
                title="Abrir e visualizar conteúdo do arquivo selecionado"
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                <FileText size={14} /> Abrir Conteúdo
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
          {/* Item de Voltar de Pasta se não estiver na raiz */}
          {currentPath !== '/' && (
            <div 
              className="file-item"
              onClick={handleGoBack}
              style={{ cursor: 'pointer', background: 'rgba(56, 189, 248, 0.05)', borderBottom: '1px dashed var(--border-color)' }}
              title="Clique para subir um nível de pasta"
            >
              <div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={18} color="#38bdf8" />
                <span style={{ fontWeight: '500', color: '#38bdf8', fontSize: '13px' }}>
                  .. (Diretório Anterior)
                </span>
              </div>
            </div>
          )}

          {tcFiles.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Esta pasta está vazia. Clique em <strong>"+ Novo"</strong> para adicionar um arquivo ou pasta.
            </div>
          ) : (
            tcFiles.map((file) => {
              const isSelected = selectedFiles.some(f => f.id === file.id);
              const isDir = file.type === 'directory';

              return (
                <div 
                  key={file.id} 
                  className={`file-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleFolderClick(file)}
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="file-info"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectFile(file);
                      }}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Selecionar item"
                    >
                      {isSelected ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color="#64748b" />}
                    </div>

                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
                      title={isDir ? `Clique para abrir a pasta ${file.name}` : `Clique para abrir o conteúdo de ${file.name}`}
                    >
                      {isDir ? <FolderOpen size={18} color="#38bdf8" /> : <FileText size={18} color="#a855f7" />}
                      <div>
                        <div className="file-name" style={{ color: isDir ? '#38bdf8' : 'inherit', fontWeight: isDir ? '600' : '500' }}>
                          {file.name}
                        </div>
                        <div className="file-meta">{file.sizeFormatted} • Modificado em {file.modified}</div>
                      </div>
                    </div>
                  </div>

                  <div className="file-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="badge badge-tc" style={{ fontSize: '11px' }}>{file.category}</span>
                    
                    {isDir ? (
                      <button 
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFolderClick(file);
                        }}
                        style={{ padding: '4px 10px', fontSize: '12px', gap: '4px' }}
                        title="Abrir conteúdo da pasta"
                      >
                        <FolderOpen size={13} color="#38bdf8" /> Abrir Pasta
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFileEditor(file);
                        }}
                        style={{ padding: '4px 10px', fontSize: '12px', gap: '4px', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                        title="Abrir e visualizar conteúdo do arquivo"
                      >
                        <Eye size={13} color="#a855f7" /> Abrir Conteúdo
                      </button>
                    )}
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
