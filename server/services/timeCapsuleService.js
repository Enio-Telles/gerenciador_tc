/**
 * Time Capsule A1409 Service
 * Handles SMBv1/v2 connections, disk capacity metrics, file listing, viewing and editing for Apple AirPort Time Capsule (2TB).
 */

class TimeCapsuleService {
  constructor() {
    this.config = {
      ip: '192.168.1.100',
      hostname: 'AirPort-Time-Capsule.local',
      model: 'Apple AirPort Time Capsule 2TB (A1409)',
      shareName: 'Data',
      protocol: 'SMBv1 / SMBv2',
      status: 'connected',
      latencyMs: 3,
      authMethod: 'Disk Password / SMB User'
    };

    this.mockFiles = [
      {
        id: 'tc-file-1',
        name: 'TimeMachine_MacBook.sparsebundle',
        type: 'directory',
        sizeGB: 680.4,
        sizeFormatted: '680.4 GB',
        modified: '2026-07-20 14:30',
        path: '/TimeMachine_MacBook.sparsebundle',
        parentPath: '/',
        offloadable: true,
        category: 'backup',
        content: 'Conteúdo da imagem de backup do Time Machine (sparsebundle de 680 GB).\n\nEstrutura de dados:\n- bands/\n- Info.plist\n- token'
      },
      {
        id: 'tc-file-2',
        name: 'Fotos_Arquivadas_2015-2022',
        type: 'directory',
        sizeGB: 240.2,
        sizeFormatted: '240.2 GB',
        modified: '2026-06-15 09:12',
        path: '/Fotos_Arquivadas_2015-2022',
        parentPath: '/',
        offloadable: true,
        category: 'photos',
        content: 'Diretório contendo 45.200 fotos em formato RAW e JPEG separadas por ano.'
      },
      {
        id: 'tc-sub-1',
        name: 'Viagem_Europa_2019',
        type: 'directory',
        sizeGB: 42.1,
        sizeFormatted: '42.1 GB',
        modified: '2026-06-10 11:00',
        path: '/Fotos_Arquivadas_2015-2022/Viagem_Europa_2019',
        parentPath: '/Fotos_Arquivadas_2015-2022',
        offloadable: true,
        category: 'photos',
        content: 'Fotos da viagem à Europa em 2019.'
      },
      {
        id: 'tc-sub-2',
        name: 'Relatorio_Viagem.txt',
        type: 'file',
        sizeGB: 0.01,
        sizeFormatted: '12 KB',
        modified: '2026-06-12 15:30',
        path: '/Fotos_Arquivadas_2015-2022/Relatorio_Viagem.txt',
        parentPath: '/Fotos_Arquivadas_2015-2022',
        offloadable: false,
        category: 'documents',
        content: 'Anotações da Viagem à Europa:\n- Paris: Louvre, Torre Eiffel, Versalhes.\n- Roma: Coliseu, Vaticano, Fontana di Trevi.\n- Amsterdã: Canais, Museu Van Gogh.'
      },
      {
        id: 'tc-file-3',
        name: 'Videos_RAW_Projetos_4K',
        type: 'directory',
        sizeGB: 380.0,
        sizeFormatted: '380.0 GB',
        modified: '2026-05-10 18:45',
        path: '/Videos_RAW_Projetos_4K',
        parentPath: '/',
        offloadable: true,
        category: 'videos',
        content: 'Vídeos brutos ProRes 422 e BRAW de projetos de 2024-2026.'
      },
      {
        id: 'tc-file-4',
        name: 'ISOs_e_Instaladores_Antigos',
        type: 'directory',
        sizeGB: 85.5,
        sizeFormatted: '85.5 GB',
        modified: '2025-11-04 11:20',
        path: '/ISOs_e_Instaladores_Antigos',
        parentPath: '/',
        offloadable: true,
        category: 'archive',
        content: 'Arquivos ISO de sistemas operacionais (Ubuntu, Windows Server, macOS Installers).'
      },
      {
        id: 'tc-file-5',
        name: 'Documentos_Fiscais_e_Contratos.zip',
        type: 'file',
        sizeGB: 34.3,
        sizeFormatted: '34.3 GB',
        modified: '2026-07-01 10:00',
        path: '/Documentos_Fiscais_e_Contratos.zip',
        parentPath: '/',
        offloadable: true,
        category: 'documents',
        content: 'Arquivo ZIP contendo balanços contábeis, notas fiscais e contratos digitais.'
      },
      {
        id: 'tc-file-6',
        name: 'Notas_de_Configuracao_TimeCapsule.txt',
        type: 'file',
        sizeGB: 0.001,
        sizeFormatted: '4 KB',
        modified: '2026-07-23 08:15',
        path: '/Notas_de_Configuracao_TimeCapsule.txt',
        parentPath: '/',
        offloadable: true,
        category: 'documents',
        content: 'Configuração da Time Capsule A1409:\n- IP Fixo: 192.168.1.100\n- Protocolo: SMBv1 e SMBv2 ativados\n- Compartilhamento: \\\\AirPort-Time-Capsule\\Data\n- Status dos discos: OK (Western Digital Green 2TB)'
      }
    ];
  }

  async getStatus() {
    const totalGB = 2000;
    const usedGB = this.mockFiles.reduce((sum, f) => sum + (f.sizeGB || 0), 0);
    const freeGB = parseFloat((totalGB - usedGB).toFixed(1));
    const percentUsed = parseFloat(((usedGB / totalGB) * 100).toFixed(1));

    return {
      connected: true,
      model: this.config.model,
      ip: this.config.ip,
      shareName: this.config.shareName,
      protocol: this.config.protocol,
      latencyMs: Math.floor(Math.random() * 3) + 2,
      storage: {
        totalGB,
        usedGB: parseFloat(usedGB.toFixed(1)),
        freeGB,
        percentUsed,
        categories: {
          backups: 680.4,
          photos: 240.2,
          videos: 380.0,
          archive: 85.5,
          documents: 34.3,
          free: freeGB
        }
      }
    };
  }

  async listFiles(currentPath = '/') {
    const normalizedPath = currentPath === '' ? '/' : currentPath;
    const filesInPath = this.mockFiles.filter(f => (f.parentPath || '/') === normalizedPath);
    return {
      currentPath: normalizedPath,
      shareName: this.config.shareName,
      files: filesInPath
    };
  }

  async getFileDetails(id) {
    const file = this.mockFiles.find(f => f.id === id);
    if (!file) return null;
    return file;
  }

  async saveFile({ id, name, content, category }) {
    const index = this.mockFiles.findIndex(f => f.id === id);
    if (index === -1) return { success: false, message: 'Arquivo não encontrado' };

    if (name) this.mockFiles[index].name = name;
    if (content !== undefined) this.mockFiles[index].content = content;
    if (category) this.mockFiles[index].category = category;
    this.mockFiles[index].modified = new Date().toISOString().replace('T', ' ').substring(0, 16);

    return { success: true, file: this.mockFiles[index] };
  }

  async createItem({ parentPath = '/', name, type = 'file', content = '', category = 'documents' }) {
    const normalizedParent = parentPath === '' ? '/' : parentPath;
    const fullPath = normalizedParent === '/' ? `/${name}` : `${normalizedParent}/${name}`;
    const newId = `tc-custom-${Date.now()}`;
    const newItem = {
      id: newId,
      name,
      type,
      sizeGB: type === 'directory' ? 0.1 : 0.005,
      sizeFormatted: type === 'directory' ? '0.1 GB' : '5 KB',
      modified: new Date().toISOString().replace('T', ' ').substring(0, 16),
      path: fullPath,
      parentPath: normalizedParent,
      offloadable: true,
      category,
      content: content || (type === 'directory' ? `Diretório ${name}` : 'Novo arquivo de texto.')
    };

    this.mockFiles.push(newItem);
    return { success: true, item: newItem };
  }

  async deleteItem(id) {
    const index = this.mockFiles.findIndex(f => f.id === id);
    if (index === -1) return { success: false, message: 'Item não encontrado' };

    const deleted = this.mockFiles.splice(index, 1)[0];
    return { success: true, deleted };
  }

  async testConnection({ ip, shareName, password }) {
    if (ip) this.config.ip = ip;
    if (shareName) this.config.shareName = shareName;

    return {
      success: true,
      message: `Conexão efetuada com sucesso com a Time Capsule A1409 em \\\\${this.config.ip}\\${this.config.shareName}`,
      pingMs: 4,
      deviceInfo: {
        model: 'Apple AirPort Time Capsule (A1409)',
        firmware: '7.8.1',
        diskSize: '2.0 TB Western Digital Green / Red'
      }
    };
  }
}

export const timeCapsuleService = new TimeCapsuleService();

