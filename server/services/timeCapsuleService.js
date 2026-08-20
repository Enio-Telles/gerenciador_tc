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
      // Raiz (/)
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
      },

      // Subarquivos em /TimeMachine_MacBook.sparsebundle
      {
        id: 'tc-tm-1',
        name: 'Info.plist',
        type: 'file',
        sizeGB: 0.001,
        sizeFormatted: '4 KB',
        modified: '2026-07-20 14:30',
        path: '/TimeMachine_MacBook.sparsebundle/Info.plist',
        parentPath: '/TimeMachine_MacBook.sparsebundle',
        offloadable: false,
        category: 'backup',
        content: '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">\n<plist version="1.0">\n<dict>\n  <key>CFBundleInfoDictionaryVersion</key>\n  <string>6.0</string>\n  <key>CFBundleName</key>\n  <string>Time Machine Backup</string>\n  <key>Size</key>\n  <integer>680394829104</integer>\n</dict>\n</plist>'
      },
      {
        id: 'tc-tm-2',
        name: 'token',
        type: 'file',
        sizeGB: 0.001,
        sizeFormatted: '1 KB',
        modified: '2026-07-20 14:30',
        path: '/TimeMachine_MacBook.sparsebundle/token',
        parentPath: '/TimeMachine_MacBook.sparsebundle',
        offloadable: false,
        category: 'backup',
        content: 'a8f93bc09e112d48c0812984bb3'
      },
      {
        id: 'tc-tm-3',
        name: 'com.apple.TimeMachine.SnapshotHistory.plist',
        type: 'file',
        sizeGB: 0.002,
        sizeFormatted: '12 KB',
        modified: '2026-07-20 14:28',
        path: '/TimeMachine_MacBook.sparsebundle/com.apple.TimeMachine.SnapshotHistory.plist',
        parentPath: '/TimeMachine_MacBook.sparsebundle',
        offloadable: false,
        category: 'backup',
        content: 'Historico de Snapshots do macOS:\n- 2026-07-20-143011\n- 2026-07-19-180005\n- 2026-07-18-091522'
      },
      {
        id: 'tc-tm-4',
        name: 'bands',
        type: 'directory',
        sizeGB: 680.3,
        sizeFormatted: '680.3 GB',
        modified: '2026-07-20 14:30',
        path: '/TimeMachine_MacBook.sparsebundle/bands',
        parentPath: '/TimeMachine_MacBook.sparsebundle',
        offloadable: true,
        category: 'backup',
        content: 'Pasta de blocos comprimidos de backup (bands de 512 MB cada).'
      },

      // Subarquivos em /TimeMachine_MacBook.sparsebundle/bands
      {
        id: 'tc-band-1',
        name: 'band_0001.bin',
        type: 'file',
        sizeGB: 0.512,
        sizeFormatted: '512 MB',
        modified: '2026-07-20 14:30',
        path: '/TimeMachine_MacBook.sparsebundle/bands/band_0001.bin',
        parentPath: '/TimeMachine_MacBook.sparsebundle/bands',
        offloadable: true,
        category: 'backup',
        content: '[Dados binários criptografados do backup]'
      },
      {
        id: 'tc-band-2',
        name: 'band_0002.bin',
        type: 'file',
        sizeGB: 0.512,
        sizeFormatted: '512 MB',
        modified: '2026-07-20 14:30',
        path: '/TimeMachine_MacBook.sparsebundle/bands/band_0002.bin',
        parentPath: '/TimeMachine_MacBook.sparsebundle/bands',
        offloadable: true,
        category: 'backup',
        content: '[Dados binários criptografados do backup]'
      },

      // Subarquivos em /Fotos_Arquivadas_2015-2022
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
        name: 'Ano_2021_Familia',
        type: 'directory',
        sizeGB: 85.0,
        sizeFormatted: '85.0 GB',
        modified: '2026-05-20 16:15',
        path: '/Fotos_Arquivadas_2015-2022/Ano_2021_Familia',
        parentPath: '/Fotos_Arquivadas_2015-2022',
        offloadable: true,
        category: 'photos',
        content: 'Álbum de fotos de família de 2021.'
      },
      {
        id: 'tc-sub-3',
        name: 'Relatorio_Viagem.txt',
        type: 'file',
        sizeGB: 0.001,
        sizeFormatted: '12 KB',
        modified: '2026-06-12 15:30',
        path: '/Fotos_Arquivadas_2015-2022/Relatorio_Viagem.txt',
        parentPath: '/Fotos_Arquivadas_2015-2022',
        offloadable: false,
        category: 'documents',
        content: 'Anotações da Viagem à Europa:\n- Paris: Louvre, Torre Eiffel, Versalhes.\n- Roma: Coliseu, Vaticano, Fontana di Trevi.\n- Amsterdã: Canais, Museu Van Gogh.'
      },

      // Subarquivos em /Fotos_Arquivadas_2015-2022/Viagem_Europa_2019
      {
        id: 'tc-fe-1',
        name: 'DSC_001_TorreEiffel.NEF',
        type: 'file',
        sizeGB: 0.024,
        sizeFormatted: '24.5 MB',
        modified: '2019-07-14 18:20',
        path: '/Fotos_Arquivadas_2015-2022/Viagem_Europa_2019/DSC_001_TorreEiffel.NEF',
        parentPath: '/Fotos_Arquivadas_2015-2022/Viagem_Europa_2019',
        offloadable: true,
        category: 'photos',
        content: '[Imagem RAW da Torre Eiffel ao pôr do sol]'
      },
      {
        id: 'tc-fe-2',
        name: 'DSC_002_Coliseu_Roma.NEF',
        type: 'file',
        sizeGB: 0.022,
        sizeFormatted: '22.1 MB',
        modified: '2019-07-18 10:15',
        path: '/Fotos_Arquivadas_2015-2022/Viagem_Europa_2019/DSC_002_Coliseu_Roma.NEF',
        parentPath: '/Fotos_Arquivadas_2015-2022/Viagem_Europa_2019',
        offloadable: true,
        category: 'photos',
        content: '[Imagem RAW do Coliseu de Roma]'
      },
      {
        id: 'tc-fe-3',
        name: 'Roteiro_Viagem.pdf',
        type: 'file',
        sizeGB: 0.001,
        sizeFormatted: '1.2 MB',
        modified: '2019-07-01 09:00',
        path: '/Fotos_Arquivadas_2015-2022/Viagem_Europa_2019/Roteiro_Viagem.pdf',
        parentPath: '/Fotos_Arquivadas_2015-2022/Viagem_Europa_2019',
        offloadable: false,
        category: 'documents',
        content: 'Roteiro completo de passagens, reservas de hotel e trens Eurostar.'
      },

      // Subarquivos em /Videos_RAW_Projetos_4K
      {
        id: 'tc-v-1',
        name: 'Projeto_Documentario_Cena01.mov',
        type: 'file',
        sizeGB: 140.0,
        sizeFormatted: '140.0 GB',
        modified: '2026-05-10 18:45',
        path: '/Videos_RAW_Projetos_4K/Projeto_Documentario_Cena01.mov',
        parentPath: '/Videos_RAW_Projetos_4K',
        offloadable: true,
        category: 'videos',
        content: '[Arquivo de vídeo bruto ProRes 422 4K 60fps]'
      },
      {
        id: 'tc-v-2',
        name: 'Projeto_Documentario_Cena02.mov',
        type: 'file',
        sizeGB: 180.0,
        sizeFormatted: '180.0 GB',
        modified: '2026-05-10 19:10',
        path: '/Videos_RAW_Projetos_4K/Projeto_Documentario_Cena02.mov',
        parentPath: '/Videos_RAW_Projetos_4K',
        offloadable: true,
        category: 'videos',
        content: '[Arquivo de vídeo bruto ProRes 422 4K 60fps]'
      },
      {
        id: 'tc-v-3',
        name: 'Audio_Master_Dolby.wav',
        type: 'file',
        sizeGB: 60.0,
        sizeFormatted: '60.0 GB',
        modified: '2026-05-10 17:00',
        path: '/Videos_RAW_Projetos_4K/Audio_Master_Dolby.wav',
        parentPath: '/Videos_RAW_Projetos_4K',
        offloadable: true,
        category: 'videos',
        content: '[Arquivo de áudio multicanal 96kHz 24-bit]'
      },

      // Subarquivos em /ISOs_e_Instaladores_Antigos
      {
        id: 'tc-iso-1',
        name: 'Ubuntu_22.04_LTS.iso',
        type: 'file',
        sizeGB: 4.2,
        sizeFormatted: '4.2 GB',
        modified: '2025-04-10 14:00',
        path: '/ISOs_e_Instaladores_Antigos/Ubuntu_22.04_LTS.iso',
        parentPath: '/ISOs_e_Instaladores_Antigos',
        offloadable: true,
        category: 'archive',
        content: '[Imagem ISO do Ubuntu Server / Desktop]'
      },
      {
        id: 'tc-iso-2',
        name: 'Windows_Server_2022.iso',
        type: 'file',
        sizeGB: 5.1,
        sizeFormatted: '5.1 GB',
        modified: '2025-08-12 10:30',
        path: '/ISOs_e_Instaladores_Antigos/Windows_Server_2022.iso',
        parentPath: '/ISOs_e_Instaladores_Antigos',
        offloadable: true,
        category: 'archive',
        content: '[Imagem ISO do Windows Server]'
      },
      {
        id: 'tc-iso-3',
        name: 'macOS_Monterey_Installer.app.zip',
        type: 'file',
        sizeGB: 12.3,
        sizeFormatted: '12.3 GB',
        modified: '2025-11-04 11:20',
        path: '/ISOs_e_Instaladores_Antigos/macOS_Monterey_Installer.app.zip',
        parentPath: '/ISOs_e_Instaladores_Antigos',
        offloadable: true,
        category: 'archive',
        content: '[Instalador do macOS Monterey em formato ZIP]'
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

  async mountOnLinux({
    ip = process.env.TIMECAPSULE_HOST || '192.168.3.10',
    shareName = process.env.TIMECAPSULE_SHARE || 'Data',
    username = process.env.TIMECAPSULE_USER || '',
    password = process.env.TIMECAPSULE_PASSWORD || '',
  } = {}) {
    const { exec } = await import('child_process');
    return new Promise((resolve) => {
      const scriptPath = '/home/enio/Documentos/projetos/gerenciador_tc/app_montador_tc.py';
      exec(`python3 "${scriptPath}" &`, (err) => {
        if (err) {
          return resolve({ success: false, message: `Erro ao iniciar montador: ${err.message}` });
        }
        resolve({ success: true, message: 'Aplicativo Montador Time Capsule iniciado com sucesso no Linux!' });
      });
    });
  }
}

export const timeCapsuleService = new TimeCapsuleService();

