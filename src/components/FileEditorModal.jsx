import React, { useState, useEffect } from 'react';
import { X, Save, FileText, HardDrive, Download } from 'lucide-react';

export function FileEditorModal({ isOpen, onClose, file, onSaveFile }) {
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
      setMessage('✅ Alterações salvas com sucesso no Time Capsule!');
      setTimeout(() => {
        setMessage('');
        onClose();
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
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
        <div className="modal-header">
          <div className="pane-title-group">
            <FileText size={22} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Visualizar & Editar Conteúdo</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Time Capsule HD: {file.path}
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Nome do Arquivo / Item</label>
            <input 
              type="text" 
              className="form-control"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Categoria de Armazenamento</label>
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

            <div className="form-group" style={{ flex: 1 }}>
              <label>Tamanho Estimado</label>
              <input 
                type="text" 
                className="form-control"
                value={file.sizeFormatted || '1 KB'} 
                disabled 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Conteúdo do Arquivo (Visualizador & Editor)</label>
            <textarea 
              className="form-control" 
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite ou edite o conteúdo do arquivo aqui..."
              style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }}
            />
          </div>

          {message && (
            <div style={{ fontSize: '13px', textAlign: 'center', padding: '8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }}>
              {message}
            </div>
          )}

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleDownloadSimulated}>
              <Download size={16} /> Baixar Cópia Local
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar no Time Capsule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
