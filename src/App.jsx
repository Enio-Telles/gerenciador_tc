import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DiskMeterCard } from './components/DiskMeterCard';
import { FileBrowser } from './components/FileBrowser';
import { JobMonitor } from './components/JobMonitor';
import { AutoRulesModal } from './components/AutoRulesModal';
import { TCConfigModal } from './components/TCConfigModal';
import { FileEditorModal } from './components/FileEditorModal';
import { NewItemModal } from './components/NewItemModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';

export function App() {
  const [status, setStatus] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [tcFiles, setTcFiles] = useState([]);
  const [cloudProvider, setCloudProvider] = useState('gdrive');
  const [cloudFiles, setCloudFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [rules, setRules] = useState([]);

  // Modals state
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isGDriveOpen, setIsGDriveOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.log('Using local fallback state if server starting...');
    }
  };

  const fetchTcFiles = async (path = currentPath) => {
    try {
      const res = await fetch(`http://localhost:3001/api/timecapsule/files?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setTcFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCloudFiles = async (provider = cloudProvider) => {
    try {
      const res = await fetch(`http://localhost:3001/api/cloud/files?provider=${provider}`);
      if (res.ok) {
        const data = await res.json();
        setCloudFiles(data.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchTcFiles(currentPath);
    fetchCloudFiles(cloudProvider);
    fetchJobs();
    fetchRules();

    const interval = setInterval(() => {
      fetchStatus();
      fetchJobs();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigatePath = (newPath) => {
    setCurrentPath(newPath);
    setSelectedFiles([]);
    fetchTcFiles(newPath);
  };

  const handleToggleSelectFile = (file) => {
    if (selectedFiles.some(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === tcFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...tcFiles]);
    }
  };

  const handleOpenFileEditor = async (file) => {
    try {
      const res = await fetch(`http://localhost:3001/api/timecapsule/file-details/${file.id}`);
      if (res.ok) {
        const details = await res.json();
        setEditingFile(details);
      } else {
        setEditingFile(file);
      }
    } catch (e) {
      setEditingFile(file);
    }
  };

  const handleSaveFile = async (updatedData) => {
    const res = await fetch('http://localhost:3001/api/timecapsule/save-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      fetchTcFiles(currentPath);
      fetchStatus();
    }
  };

  const handleCreateItem = async (newItemData) => {
    const res = await fetch('http://localhost:3001/api/timecapsule/create-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItemData)
    });
    if (res.ok) {
      fetchTcFiles(currentPath);
      fetchStatus();
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedFiles.length} item(ns) da Time Capsule?`)) return;

    for (const file of selectedFiles) {
      await fetch(`http://localhost:3001/api/timecapsule/delete-item/${file.id}`, {
        method: 'DELETE'
      });
    }
    setSelectedFiles([]);
    fetchTcFiles(currentPath);
  };

  const handleStartOffload = async (targetProvider, actionType) => {
    if (selectedFiles.length === 0) return;

    try {
      const res = await fetch('http://localhost:3001/api/jobs/start-offload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceFiles: selectedFiles,
          targetProvider,
          targetFolder: targetProvider === 'gdrive' ? '/GoogleDrive_BKP' : '/OneDrive_TC_Archive',
          actionType
        })
      });
      if (res.ok) {
        fetchJobs();
        setSelectedFiles([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelJob = async (jobId) => {
    try {
      await fetch(`http://localhost:3001/api/jobs/cancel/${jobId}`, { method: 'POST' });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRule = async (ruleData) => {
    try {
      const res = await fetch('http://localhost:3001/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestConnection = async (credentials) => {
    try {
      const res = await fetch('http://localhost:3001/api/timecapsule/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Erro de conexão com o servidor local' };
    }
  };

  const handleConnectGDrive = async ({ account, targetFolder }) => {
    try {
      const res = await fetch('http://localhost:3001/api/cloud/connect-gdrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, targetFolder })
      });
      if (res.ok) {
        const data = await res.json();
        fetchStatus();
        fetchCloudFiles('gdrive');
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  const handleDisconnectGDrive = async (provider) => {
    try {
      await fetch(`http://localhost:3001/api/cloud/disconnect/${provider}`, {
        method: 'POST'
      });
      fetchStatus();
      fetchCloudFiles(cloudProvider);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header 
        status={status}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenGDrive={() => setIsGDriveOpen(true)}
        onRefresh={() => {
          fetchStatus();
          fetchTcFiles(currentPath);
          fetchCloudFiles(cloudProvider);
          fetchJobs();
        }}
      />

      {/* Storage Meters Dashboard Grid */}
      <div className="meters-grid">
        <DiskMeterCard 
          type="local"
          title="HD Local (Computador)"
          subtitle="SSD Principal do Sistema"
          totalGB={status?.localDisk?.totalGB || 512}
          usedGB={status?.localDisk?.usedGB || 479.8}
          freeGB={status?.localDisk?.freeGB || 32.2}
          percentUsed={status?.localDisk?.percentUsed || 93.7}
          warning={status?.localDisk?.warning}
          offloadableGB={status?.localDisk?.offloadableGB || 185.4}
          onQuickOffload={() => {
            if (tcFiles.length > 0) setSelectedFiles([tcFiles[0]]);
          }}
        />

        <DiskMeterCard 
          type="tc"
          title="Apple Time Capsule A1409"
          subtitle="Rede Local (2.0 TB SMB)"
          totalGB={status?.timeCapsule?.storage?.totalGB || 2000}
          usedGB={status?.timeCapsule?.storage?.usedGB || 1420.4}
          freeGB={status?.timeCapsule?.storage?.freeGB || 579.6}
          percentUsed={status?.timeCapsule?.storage?.percentUsed || 71.0}
        />

        <DiskMeterCard 
          type="gdrive"
          title="Google Drive"
          subtitle={`Conta: ${status?.cloudProviders?.gdrive?.account || 'enio.telles@gmail.com'}`}
          totalGB={status?.cloudProviders?.gdrive?.totalGB || 200}
          usedGB={status?.cloudProviders?.gdrive?.usedGB || 84.2}
          freeGB={status?.cloudProviders?.gdrive?.freeGB || 115.8}
          percentUsed={status?.cloudProviders?.gdrive?.percentUsed || 42.1}
        />

        <DiskMeterCard 
          type="onedrive"
          title="Microsoft OneDrive"
          subtitle="Conta Microsoft (1.0 TB Cloud)"
          totalGB={status?.cloudProviders?.onedrive?.totalGB || 1000}
          usedGB={status?.cloudProviders?.onedrive?.usedGB || 310.5}
          freeGB={status?.cloudProviders?.onedrive?.freeGB || 689.5}
          percentUsed={status?.cloudProviders?.onedrive?.percentUsed || 31.1}
        />
      </div>

      {/* Explorer / Offloader Section */}
      <FileBrowser 
        tcFiles={tcFiles}
        currentPath={currentPath}
        onNavigatePath={handleNavigatePath}
        cloudProvider={cloudProvider}
        cloudFiles={cloudFiles}
        onSelectCloudProvider={(p) => {
          setCloudProvider(p);
          fetchCloudFiles(p);
        }}
        selectedFiles={selectedFiles}
        onToggleSelectFile={handleToggleSelectFile}
        onSelectAll={handleSelectAll}
        onStartOffload={handleStartOffload}
        onOpenFileEditor={handleOpenFileEditor}
        onOpenNewItemModal={() => setIsNewItemOpen(true)}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Active Jobs Monitor */}
      <JobMonitor 
        jobs={jobs}
        onCancelJob={handleCancelJob}
      />

      {/* Modals */}
      <AutoRulesModal 
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={rules}
        onAddRule={handleAddRule}
      />

      <TCConfigModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentConfig={status?.timeCapsule}
        onTestConnection={handleTestConnection}
      />

      <GoogleDriveModal 
        isOpen={isGDriveOpen}
        onClose={() => setIsGDriveOpen(false)}
        gdriveStatus={status?.cloudProviders?.gdrive}
        onConnectGDrive={handleConnectGDrive}
        onDisconnectGDrive={handleDisconnectGDrive}
      />

      <FileEditorModal
        isOpen={!!editingFile}
        onClose={() => setEditingFile(null)}
        file={editingFile}
        onSaveFile={handleSaveFile}
      />

      <NewItemModal
        isOpen={isNewItemOpen}
        onClose={() => setIsNewItemOpen(false)}
        currentPath={currentPath}
        onCreateItem={handleCreateItem}
      />
    </div>
  );
}

export default App;
