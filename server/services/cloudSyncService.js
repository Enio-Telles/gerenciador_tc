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
        color: '#4285F4'
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
        color: '#0078D4'
      }
    };

    this.activeJobs = [
      {
        id: 'job-101',
        name: 'Desafogar Videos_RAW_Projetos_4K para OneDrive',
        source: 'Time Capsule (/Videos_RAW_Projetos_4K)',
        target: 'OneDrive (/Archive_TC/Videos)',
        provider: 'onedrive',
        actionType: 'offload', // offload = transfer and free up TC/local space
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
        description: 'Transferir diretórios da Time Capsule com mais de 60 dias para o OneDrive e liberar a Time Capsule.',
        source: 'Time Capsule / (Backups)',
        destination: 'Microsoft OneDrive',
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

  async listFiles(providerId, path = '/') {
    return {
      provider: this.providers[providerId] || this.providers.gdrive,
      currentPath: path,
      items: [
        { id: 'cloud-item-1', name: 'Backups_TimeCapsule_Archive', type: 'directory', sizeFormatted: '--' },
        { id: 'cloud-item-2', name: 'Documentos_Importantes', type: 'directory', sizeFormatted: '--' },
        { id: 'cloud-item-3', name: 'Fotos_GooglePhotos_BKP', type: 'directory', sizeFormatted: '--' }
      ]
    };
  }

  getActiveJobs() {
    return this.activeJobs;
  }

  async createSyncJob({ sourceFiles, targetProvider, targetFolder, actionType }) {
    const jobName = actionType === 'offload' ? 'Desafogamento' : 'Sincronização';
    const providerName = this.providers[targetProvider]?.name || 'Nuvem';
    
    const newJob = {
      id: `job-${Date.now()}`,
      name: `${jobName} [${sourceFiles.length} item(ns)] para ${providerName}`,
      source: `Time Capsule (${sourceFiles[0]?.name || 'Seleção'})`,
      target: `${providerName} (${targetFolder || '/'})`,
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
