import React, { useState } from 'react';
import { X, Cloud, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';

export function GoogleDriveModal({ isOpen, onClose, gdriveStatus, onConnectGDrive, onDisconnectGDrive }) {
  const [account, setAccount] = useState(gdriveStatus?.account || 'enio.telles@gmail.com');
  const [targetFolder, setTargetFolder] = useState(gdriveStatus?.targetFolder || '/GoogleDrive_BKP');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const isConnected = gdriveStatus?.status === 'connected';

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setMessage('');

    try {
      const res = await onConnectGDrive({ account, targetFolder });
      if (res.success) {
        setMessage('✅ Google Drive vinculado e autorizado com sucesso via OAuth 2.0!');
        setTimeout(() => {
          setMessage('');
          onClose();
        }, 1200);
      } else {
        setMessage('❌ Falha na autenticação com a conta do Google.');
      }
    } catch (err) {
      setMessage('❌ Erro de conexão com o servidor de autenticação.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Deseja realmente desconectar a conta do Google Drive?')) return;
    setIsAuthenticating(true);
    await onDisconnectGDrive('gdrive');
    setIsAuthenticating(false);
    setMessage('Conta desconectada.');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div className="pane-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(52, 168, 83, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <Cloud size={24} color="#34A853" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Conectar ao Google Drive</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Sincronização e desafogamento direto para sua conta Google Cloud
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Status Badge Banner */}
        <div 
          style={{ 
            marginTop: '14px', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justify: 'space-between',
            background: isConnected ? 'rgba(52, 168, 83, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${isConnected ? 'rgba(52, 168, 83, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isConnected ? <CheckCircle2 size={20} color="#34A853" /> : <AlertCircle size={20} color="#ef4444" />}
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: isConnected ? '#34A853' : '#ef4444' }}>
                {isConnected ? 'Conta Google Drive Conectada' : 'Google Drive Desconectado'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isConnected ? `Autorizado para: ${gdriveStatus?.account}` : 'Nenhuma conta vinculada'}
              </div>
            </div>
          </div>

          {isConnected && (
            <span style={{ fontSize: '12px', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 8px', borderRadius: '4px' }}>
              Uso: {gdriveStatus?.usedGB || 84.2} GB de {gdriveStatus?.totalGB || 200} GB ({gdriveStatus?.percentUsed || 42.1}%)
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleConnect} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '500' }}>Endereço de E-mail da Conta Google</label>
            <input 
              type="email" 
              className="form-control"
              value={account} 
              onChange={(e) => setAccount(e.target.value)}
              placeholder="exemplo@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '500' }}>Pasta de Destino para Backups / Offload</label>
            <input 
              type="text" 
              className="form-control"
              value={targetFolder} 
              onChange={(e) => setTargetFolder(e.target.value)}
              placeholder="/GoogleDrive_BKP"
              required
            />
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: '600' }}>
              <ShieldCheck size={16} /> Protocolo de Segurança OAuth 2.0
            </div>
            <div>
              A conexão concede permissões escopadas apenas para criar e gerenciar arquivos na pasta especificada do seu Google Drive. Nenhuma senha da sua conta Google é armazenada.
            </div>
          </div>

          {message && (
            <div style={{ fontSize: '13px', textAlign: 'center', padding: '10px', background: 'rgba(52, 168, 83, 0.15)', borderRadius: '6px', color: '#34A853', fontWeight: '500' }}>
              {message}
            </div>
          )}

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            {isConnected ? (
              <button type="button" className="btn btn-secondary" onClick={handleDisconnect} disabled={isAuthenticating} style={{ color: '#ef4444' }}>
                Desconectar Conta
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-success" disabled={isAuthenticating} style={{ background: '#34A853', borderColor: '#34A853', color: '#fff' }}>
                <Cloud size={16} /> {isAuthenticating ? 'Conectando...' : isConnected ? 'Atualizar Conexão' : 'Vincular Conta Google'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
