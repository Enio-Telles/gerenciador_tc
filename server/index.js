import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { timeCapsuleService } from './services/timeCapsuleService.js';
import { cloudSyncService } from './services/cloudSyncService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Status endpoint
app.get('/api/status', async (req, res) => {
  const tcStatus = await timeCapsuleService.getStatus();
  const cloudStatus = await cloudSyncService.getProvidersStatus();
  
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    timeCapsule: tcStatus,
    cloudProviders: cloudStatus,
    localDisk: {
      totalGB: 512,
      usedGB: 479.8,
      freeGB: 32.2,
      percentUsed: 93.7,
      warning: true,
      offloadableGB: 185.4
    }
  });
});

// Time Capsule endpoints
app.get('/api/timecapsule/files', async (req, res) => {
  const path = req.query.path || '/';
  const files = await timeCapsuleService.listFiles(path);
  res.json(files);
});

app.get('/api/timecapsule/file-details/:id', async (req, res) => {
  const details = await timeCapsuleService.getFileDetails(req.params.id);
  if (!details) return res.status(404).json({ error: 'Arquivo não encontrado' });
  res.json(details);
});

app.post('/api/timecapsule/save-file', async (req, res) => {
  const result = await timeCapsuleService.saveFile(req.body);
  res.json(result);
});

app.post('/api/timecapsule/create-item', async (req, res) => {
  const result = await timeCapsuleService.createItem(req.body);
  res.json(result);
});

app.delete('/api/timecapsule/delete-item/:id', async (req, res) => {
  const result = await timeCapsuleService.deleteItem(req.params.id);
  res.json(result);
});

app.post('/api/timecapsule/test-connection', async (req, res) => {
  const { ip, shareName, password } = req.body;
  const result = await timeCapsuleService.testConnection({ ip, shareName, password });
  res.json(result);
});

app.post('/api/timecapsule/mount-linux', async (req, res) => {
  const result = await timeCapsuleService.mountOnLinux(req.body);
  res.json(result);
});

// Windows Dual-Boot & NTFS Partition endpoints
app.post('/api/windows/open-folder', (req, res) => {
  const { folderPath } = req.body;
  const target = folderPath || '/mnt/windows';
  const env = { ...process.env, DISPLAY: process.env.DISPLAY || ':0', XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || '/run/user/1000' };

  import('child_process').then(({ exec }) => {
    exec(`xdg-open "${target}" || gio open "${target}" || nautilus "${target}"`, { env }, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: `Erro ao abrir: ${err.message}` });
      }
      res.json({ success: true, message: `Pasta ${target} aberta no gerenciador de arquivos!` });
    });
  });
});

app.get('/api/windows/partitions', (req, res) => {
  import('child_process').then(({ exec }) => {
    exec('lsblk -J -f -o NAME,FSTYPE,LABEL,SIZE,MOUNTPOINTS', (err, stdout) => {
      if (err) return res.json({ success: false, partitions: [] });
      try {
        const data = JSON.parse(stdout);
        const findNtfs = (devices) => {
          let ntfsList = [];
          for (const dev of devices || []) {
            if (dev.fstype === 'ntfs' || (dev.mountpoints && dev.mountpoints.some(m => m && m.includes('windows')))) {
              ntfsList.push({
                name: `/dev/${dev.name}`,
                fstype: dev.fstype || 'ntfs',
                label: dev.label || 'Partição Windows',
                size: dev.size,
                mountpoints: dev.mountpoints || ['/mnt/windows']
              });
            }
            if (dev.children) {
              ntfsList = ntfsList.concat(findNtfs(dev.children));
            }
          }
          return ntfsList;
        };
        const partitions = findNtfs(data.blockdevices);
        res.json({ success: true, partitions });
      } catch (e) {
        res.json({ success: false, partitions: [], error: e.message });
      }
    });
  });
});

app.post('/api/windows/open-disks', (req, res) => {
  const env = { ...process.env, DISPLAY: process.env.DISPLAY || ':0', XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || '/run/user/1000' };

  import('child_process').then(({ exec }) => {
    exec('gnome-disks', { env }, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
    });
    res.json({ success: true, message: 'Gerenciador de Discos (GNOME Disks) iniciado!' });
  });
});


// Cloud Providers endpoints
app.get('/api/cloud/providers', async (req, res) => {
  const providers = await cloudSyncService.getProvidersStatus();
  res.json(providers);
});

app.get('/api/cloud/files', async (req, res) => {
  const provider = req.query.provider || 'gdrive';
  const path = req.query.path || '/';
  const files = await cloudSyncService.listFiles(provider, path);
  res.json(files);
});

app.post('/api/cloud/connect-gdrive', async (req, res) => {
  const { account, targetFolder } = req.body;
  const result = await cloudSyncService.connectGDrive({ account, targetFolder });
  res.json(result);
});

app.post('/api/cloud/disconnect/:provider', async (req, res) => {
  const result = await cloudSyncService.disconnectProvider(req.params.provider);
  res.json(result);
});

// Sync & Offload Job Operations
app.get('/api/jobs', (req, res) => {
  const jobs = cloudSyncService.getActiveJobs();
  res.json(jobs);
});

app.post('/api/jobs/start-offload', async (req, res) => {
  const { sourceFiles, targetProvider, targetFolder, actionType } = req.body;
  const newJob = await cloudSyncService.createSyncJob({
    sourceFiles,
    targetProvider,
    targetFolder,
    actionType: actionType || 'offload'
  });
  res.json(newJob);
});

app.post('/api/jobs/cancel/:jobId', (req, res) => {
  const result = cloudSyncService.cancelJob(req.params.jobId);
  res.json(result);
});

// Sync rules
app.get('/api/rules', (req, res) => {
  const rules = cloudSyncService.getSyncRules();
  res.json(rules);
});

app.post('/api/rules', (req, res) => {
  const newRule = cloudSyncService.addSyncRule(req.body);
  res.json(newRule);
});

app.listen(PORT, () => {
  console.log(`[gerenciador_tc] Servidor backend rodando na porta ${PORT}`);
});
