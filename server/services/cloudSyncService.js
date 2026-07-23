/**
 * Cloud Sync & Offload Engine Service
 * Manages streaming transfer between Apple Time Capsule A1409 and Cloud Services (Google Drive & Microsoft OneDrive).
 */

class CloudSyncService {
  constructor() {
    this.providers = {
      gdrive: {
        id: 'gdrive',
        name: 'Google Drive',
        account: 'enio.telles@gmail.com',
        status: 'connected',
        totalGB: 200,
        usedGB: 84.2,
        freeGB: 115.8,
        percentUsed: 42.1,
        color: '#34A853',
        targetFolder: '/GoogleDrive_BKP',
        connectedAt: '2026-07-01 10:00'
      },
      onedrive: {
        id: 'onedrive',
        name: 'Microsoft OneDrive',
        account: 'enio.telles@outlook.com',
        status: 'connected',
        totalGB: 1000,
        usedGB: 310.5,
        freeGB: 689.5,
        percentUsed: 31.05,
        color: '#0078D4',
        targetFolder: '/OneDrive_TC_Archive',
        connectedAt: '2026-06-15 14:20'
      }
    };

    this.mockCloudFiles = {
      gdrive: [
        { id: 'gd-1', name: 'GoogleDrive_BKP', type: 'directory', sizeFormatted: '84.2 GB', modified: '2026-07-22 18:00' },
        { id: 'gd-2', name: 'Fotos_GooglePhotos_Backup', type: 'directory', sizeFormatted: '45.0 GB', modified: '2026-07-20 12:30' },
        { id: 'gd-3', name: 'Documentos_Projetos_Drive', type: 'directory', sizeFormatted: '12.2 GB', modified: '2026-07-15 09:10' },
        { id: 'gd-4', name: 'Videos_Drive_Archive', type: 'directory', sizeFormatted: '27.0 GB', modified: '2026-07-10 16:45' },
        { id: 'gd-5', name: 'Relatorio_Sincronizacao_GDrive.pdf', type: 'file', sizeFormatted: '2.4 MB', modified: '2026-07-23 09:00' }
      ],
      onedrive: [
        { id: 'od-1', name: 'OneDrive_TC_Archive', type: 'directory', sizeFormatted: '310.5 GB', modified: '2026-07-21 11:00' },
        { id: 'od-2', name: 'Backups_TimeCapsule_Archive', type: 'directory', sizeFormatted: '180.0 GB', modified: '2026-07-19 14:20' },
        { id: 'od-3', name: 'Documentos_Fiscais_Cloud', type: 'directory', sizeFormatted: '34.3 GB', modified: '2026-07-01 10:00' },
        { id: 'od-4', name: 'Imagens_ISO_Backup_OneDrive', type: 'directory', sizeFormatted: '96.2 GB', modified: '2026-06-28 15:30' }
      ]
    };

    this.activeJobs = [
      {
        id: 'job-101',
        name: 'Desafogar Videos_RAW_Projetos_4K para Google Drive',
        source: 'Time Capsule (/Videos_RAW_Projetos_4K)',
        target: 'Google Drive (/GoogleDrive_BKP)',
        provider: 'gdrive',
        actionType: 'offload',
        totalSizeGB: 380.0,
        transferredGB: 194.2,
        percentProgress: 51.1,
        speedMBs: 48.2,
        status: 'running',
        etaMinutes: 64,
        startedAt: '2026-07-23 08:30'
      }
    ];

    this.syncRules = [
      {
        id: 'rule-1',
        title: 'Desafogamento Automático de Backups Antigos',
        description: 'Transferir diretórios da Time Capsule com mais de 60 dias para o Google Drive e liberar a Time Capsule.',
        source: 'Time Capsule / (Backups)',
        destination: 'Google Drive',
        trigger: 'Arquivos > 60 dias sem alteração',
        enabled: true,
        lastRun: '2026-07-20 02:00'
      },
      {
        id: 'rule-2',
        title: 'Sincronização Contínua de Fotos',
        description: 'Manter réplica da pasta Fotos_Arquivadas no Google Drive.',
        source: 'Time Capsule /Fotos_Arquivadas_2015-2022',
        destination: 'Google Drive',
        trigger: 'Semanalmente aos Domingos às 03:00',
        enabled: true,
        lastRun: '2026-07-19 03:00'
      }
    ];
  }

  async getProvidersStatus() {
    return this.providers;
  }

  async listFiles(providerId = 'gdrive', path = '/') {
    const pId = this.providers[providerId] ? providerId : 'gdrive';
    const items = this.mockCloudFiles[pId] || [];

    return {
      provider: this.providers[pId],
      currentPath: path,
      items
    };
  }

  async connectGDrive({ account, targetFolder }) {
    if (!account) account = 'enio.telles@gmail.com';
    if (!targetFolder) targetFolder = '/GoogleDrive_BKP';

    this.providers.gdrive = {
      id: 'gdrive',
      name: 'Google Drive',
      account,
      status: 'connected',
      totalGB: 200,
      usedGB: 84.2,
      freeGB: 115.8,
      percentUsed: 42.1,
      color: '#34A853',
      targetFolder,
      connectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    return {
      success: true,
      message: `Conta do Google Drive (${account}) conectada e autorizada com sucesso!`,
      provider: this.providers.gdrive
    };
  }

  async disconnectProvider(providerId) {
    if (this.providers[providerId]) {
      this.providers[providerId].status = 'disconnected';
      return { success: true, message: `Provedor ${this.providers[providerId].name} desconectado.` };
    }
    return { success: false, message: 'Provedor não encontrado' };
  }

  getActiveJobs() {
    return this.activeJobs;
  }

  async createSyncJob({ sourceFiles, targetProvider, targetFolder, actionType }) {
    const jobName = actionType === 'offload' ? 'Desafogamento' : 'Sincronização';
    const providerName = this.providers[targetProvider]?.name || 'Google Drive';
    
    const newJob = {
      id: `job-${Date.now()}`,
      name: `${jobName} [${sourceFiles.length} item(ns)] para ${providerName}`,
      source: `Time Capsule (${sourceFiles[0]?.name || 'Seleção'})`,
      target: `${providerName} (${targetFolder || '/GoogleDrive_BKP'})`,
      provider: targetProvider,
      actionType: actionType || 'offload',
      totalSizeGB: sourceFiles.reduce((acc, curr) => acc + (curr.sizeGB || 10), 0),
      transferredGB: 0.1,
      percentProgress: 1.0,
      speedMBs: 52.4,
      status: 'running',
      etaMinutes: 45,
      startedAt: new Date().toLocaleString()
    };

    this.activeJobs.unshift(newJob);
    return newJob;
  }

  cancelJob(jobId) {
    const index = this.activeJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      this.activeJobs[index].status = 'cancelled';
      return { success: true, message: 'Tarefa cancelada' };
    }
    return { success: false, message: 'Tarefa não encontrada' };
  }

  getSyncRules() {
    return this.syncRules;
  }

  addSyncRule(rule) {
    const newRule = {
      id: `rule-${Date.now()}`,
      enabled: true,
      lastRun: 'Nunca executado',
      ...rule
    };
    this.syncRules.push(newRule);
    return newRule;
  }
}

export const cloudSyncService = new CloudSyncService();
