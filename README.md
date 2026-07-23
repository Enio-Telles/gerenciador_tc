# 🚀 Gerenciador Time Capsule (Gerenciador TC)

Aplicação web para monitoramento de armazenamento, gerenciamento de arquivos e automação de sincronização/descarregamento (*offload*) entre unidades **Apple Time Capsule** e provedores de nuvem (como OneDrive, Google Drive e Dropbox).

---

## 🛠️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Node.js**: v18.0.0 ou superior
- **npm**: v9.0.0 ou superior (incluso na instalação do Node.js)

---

## 📦 Instalação

1. Clone o repositório ou navegue até o diretório do projeto:
   ```bash
   cd gerenciador_tc
   ```

2. Instale as dependências necessárias:
   ```bash
   npm install
   ```

---

## 🏃‍♂️ Como Executar

A aplicação é composta por um **servidor backend** (API Node/Express) e um **frontend** (React/Vite). Para o funcionamento completo, execute ambos em terminais separados:

### 1. Iniciar o Backend (Servidor API)
No terminal, na raiz do projeto, execute:
```bash
npm run server
```
*O servidor backend estará disponível em `http://localhost:3001`.*

### 2. Iniciar o Frontend (Interface Web)
Abra um **segundo terminal** na raiz do projeto e execute:
```bash
npm run dev
```
*A interface web estará acessível em `http://localhost:5173` (ou na URL indicada pelo Vite no terminal).*

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, você encontrará os seguintes comandos disponíveis:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Frontend (Vite). |
| `npm run server` | Inicia a API backend Express (`node server/index.js`) na porta `3001`. |
| `npm start` | Comando alternativo para iniciar a API backend. |
| `npm run build` | Gera a versão otimizada de produção do Frontend na pasta `dist/`. |
| `npm run preview` | Executa a visualização local da versão de produção. |
| `npm run lint` | Executa a verificação de código usando Oxlint. |

---

## 🏗️ Estrutura do Projeto

```text
gerenciador_tc/
├── server/               # Servidor Backend (Express API)
│   ├── index.js          # Ponto de entrada do backend (rotas e portas)
│   └── services/         # Lógica de integração com Time Capsule e Nuvem
├── src/                  # Aplicação Frontend (React)
│   ├── components/       # Componentes visuais (Modais, Card de Disco, Navegador)
│   ├── App.jsx           # Componente raiz da aplicação
│   ├── index.css         # Estilização global
│   └── main.jsx          # Renderização inicial do React
├── public/               # Arquivos estáticos
├── package.json          # Dependências e scripts do projeto
└── vite.config.js        # Configuração do Vite
```

---

## 💡 Funcionalidades Principais

- **Monitor de Armazenamento**: Visualização em tempo real do espaço ocupado no Time Capsule.
- **Navegador de Arquivos**: Interface intuitiva para inspeção de arquivos do Time Capsule e da Nuvem.
- **Offload e Sincronização**: Liberação inteligente de espaço local movendo arquivos para a nuvem.
- **Regras Automáticas**: Criação de automações de limpeza e backup conforme limite de uso em disco.
