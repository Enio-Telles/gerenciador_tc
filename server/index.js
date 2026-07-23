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

app.post('/api/timecapsule/test-connection', async (req, res) => {
  const { ip, shareName, password } = req.body;
  const result = await timeCapsuleService.testConnection({ ip, shareName, password });
  res.json(result);
});

// Cloud Providers endpoints
app.get('/api/cloud/files', async (req, res) => {
  const provider = req.query.provider || 'gdrive';
  const path = req.query.path || '/';
  const files = await cloudSyncService.listFiles(provider, path);
  res.json(files);
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
    actionType: actionType || 'offload' // 'offload' (move and delete from TC) or 'sync' (copy)
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
