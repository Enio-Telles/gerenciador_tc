import React, { useState } from 'react';
import { X, FolderPlus, FilePlus } from 'lucide-react';

export function NewItemModal({ isOpen, onClose, currentPath, onCreateItem }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('file'); // 'file' or 'directory'
  const [category, setCategory] = useState('documents');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      await onCreateItem({
        parentPath: currentPath,
        name: name.trim(),
        type,
        category,
        content
      });
      setName('');
      setContent('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
        <div className="modal-header">
          <div className="pane-title-group">
            {type === 'directory' ? <FolderPlus size={22} color="#38bdf8" /> : <FilePlus size={22} color="#38bdf8" />}
            <h2>Criar Novo Item no Time Capsule</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className={`btn ${type === 'file' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setType('file')}
            >
              <FilePlus size={16} /> Arquivo
            </button>
            <button
              type="button"
              className={`btn ${type === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setType('directory')}
            >
              <FolderPlus size={16} /> Pasta
            </button>
          </div>

          <div className="form-group">
            <label>Caminho de Destino</label>
            <input type="text" className="form-control" value={currentPath || '/'} disabled />
          </div>

          <div className="form-group">
            <label>Nome do {type === 'directory' ? 'Diretório' : 'Arquivo'}</label>
            <input
              type="text"
              className="form-control"
              placeholder={type === 'directory' ? 'Ex: Documentos_2026' : 'Ex: Notas.txt'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="documents">Documentos / Texto</option>
              <option value="photos">Fotos & Mídia</option>
              <option value="videos">Vídeos</option>
              <option value="archive">Arquivos Compactados</option>
              <option value="backup">Backups</option>
            </select>
          </div>

          {type === 'file' && (
            <div className="form-group">
              <label>Conteúdo Inicial do Arquivo</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Escreva o texto inicial do arquivo..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar no HD Time Capsule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
