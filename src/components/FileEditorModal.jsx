import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Download, Eye, Edit3, CheckCircle2, HardDrive, Info } from 'lucide-react';

export function FileEditorModal({ isOpen, onClose, file, onSaveFile }) {
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'edit'
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('documents');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (file) {
      setName(file.name || '');
      setContent(file.content || '');
      setCategory(file.category || 'documents');
      setMessage('');
      setActiveTab('view');
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      await onSaveFile({
        id: file.id,
        name,
        content,
        category
      });
      setMessage('✅ Conteúdo salvo com sucesso no Time Capsule!');
      setTimeout(() => {
        setMessage('');
        setActiveTab('view');
      }, 1000);
    } catch (err) {
      setMessage('❌ Erro ao salvar o arquivo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadSimulated = () => {
    const element = document.createElement('a');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(blob);
    element.download = name || 'timecapsule-file.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '92%' }}>
        
        {/* Header Modal */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div className="pane-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} color="#a855f7" />
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {name || file.name}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Caminho no Time Capsule: <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{file.path}</code>
              </span>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button 
            type="button" 
            className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('view')}
            style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={15} /> Visualizar Conteúdo
          </button>

          <button 
            type="button" 
            className={`btn ${activeTab === 'edit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('edit')}
            style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={15} /> Editar Conteúdo
          </button>
        </div>

        {/* File Metadata Summary */}
        <div style={{ display: 'flex', gap: '16px', background: 'rgba(15, 23, 42, 0.4)', padding: '10px 14px', borderRadius: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div><strong>Tamanho:</strong> {file.sizeFormatted || '1 KB'}</div>
          <div><strong>Modificado:</strong> {file.modified || 'Recente'}</div>
          <div><strong>Categoria:</strong> <span className="badge badge-tc" style={{ fontSize: '10px' }}>{category}</span></div>
          <div><strong>Status SMB:</strong> Pronto no Time Capsule</div>
        </div>

        {/* TAB 1: VISUALIZAR CONTEÚDO */}
        {activeTab === 'view' && (
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Conteúdo lido da Apple Time Capsule (SMB Share):</span>
              <button className="btn btn-secondary" onClick={handleDownloadSimulated} style={{ padding: '4px 10px', fontSize: '12px' }}>
                <Download size={13} /> Baixar Cópia
              </button>
            </div>

            <div 
              style={{ 
                background: '#090d16', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '16px', 
                maxHeight: '320px', 
                overflowY: 'auto', 
                fontFamily: 'Consolas, Monaco, "Andale Mono", monospace', 
                fontSize: '13px', 
                lineHeight: '1.6', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                color: '#e2e8f0'
              }}
            >
              {content || '(Arquivo sem conteúdo de texto ou comprimido)'}
            </div>
          </div>
        )}

        {/* TAB 2: EDITAR CONTEÚDO */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSave} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '500' }}>Nome do Arquivo</label>
              <input 
                type="text" 
                className="form-control"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '500' }}>Categoria de Armazenamento</label>
              <select 
                className="form-control" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="documents">Documentos / Texto</option>
                <option value="photos">Fotos & Imagens</option>
                <option value="videos">Vídeos & Mídia</option>
                <option value="backup">Time Machine / Backup</option>
                <option value="archive">Arquivos ZIP / ISO</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '500' }}>Editar Texto do Arquivo</label>
              <textarea 
                className="form-control" 
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite ou altere o conteúdo aqui..."
                style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }}
              />
            </div>

            {message && (
              <div style={{ fontSize: '13px', textAlign: 'center', padding: '8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px', color: '#38bdf8' }}>
                {message}
              </div>
            )}

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        {activeTab === 'view' && (
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
