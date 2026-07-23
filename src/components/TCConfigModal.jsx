import React, { useState } from 'react';
import { X, Settings, Wifi, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function TCConfigModal({ isOpen, onClose, currentConfig, onTestConnection }) {
  const [ip, setIp] = useState(currentConfig?.ip || '192.168.1.100');
  const [shareName, setShareName] = useState(currentConfig?.shareName || 'Data');
  const [password, setPassword] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await onTestConnection({ ip, shareName, password });
    setTesting(false);
    setTestResult(res);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '18px' }}>Configuração Conexão Time Capsule A1409</h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleTest} className="modal-body">
          <div className="form-group">
            <label>Endereço IP ou Hostname da Time Capsule</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="192.168.1.100 ou AirPort-Time-Capsule.local"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Nome do Compartilhamento SMB</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Data"
              value={shareName}
              onChange={(e) => setShareName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha do Disco AirPort / Senha SMB</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px', borderRadius: '10px', fontSize: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <strong>Nota de Compatibilidade A1409:</strong>
            <p>O modelo Apple AirPort Time Capsule A1409 (2TB) utiliza compartilhamento via SMBv1/SMBv2. As solicitações são efetuadas pela rede local e o aplicativo gerencia o mapa UNC <code>\\{ip}\{shareName}</code>.</p>
          </div>

          {testResult && (
            <div className={`badge ${testResult.success ? 'badge-tc' : 'badge-warning'}`} style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>
              {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {testResult.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={testing}>
              {testing ? <RefreshCw size={16} className="spin" /> : <Wifi size={16} />}
              {testing ? 'Testando Conexão...' : 'Testar Conexão SMB'}
            </button>
            
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Salvar & Fechar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
