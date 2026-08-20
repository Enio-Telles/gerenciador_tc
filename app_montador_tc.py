#!/usr/bin/env python3
"""
Montador Time Capsule & Gerenciador Dual-Boot Windows (Linux App)
Permite montar a Apple Time Capsule, acessar partições do Windows (NTFS)
e abrir a ferramenta de gerenciamento e criação de partições NTFS no Linux.
"""

import os
import sys
import json
import socket
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox

CONFIG_FILE = os.path.expanduser('~/.timecapsule_config.json')

DEFAULT_CONFIG = {
    'ip': os.environ.get('TIMECAPSULE_HOST', '192.168.3.10'),
    'shareName': os.environ.get('TIMECAPSULE_SHARE', 'Data'),
    'username': os.environ.get('TIMECAPSULE_USER', ''),
    'password': os.environ.get('TIMECAPSULE_PASSWORD', ''),
    'winMountPath': '/mnt/windows'
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                cfg = json.load(f)
                return {**DEFAULT_CONFIG, **cfg}
        except Exception:
            pass
    return DEFAULT_CONFIG.copy()

def save_config(config_data):
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
    except Exception as e:
        print(f"Erro ao salvar configurações: {e}")

class MultiManagerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("🚀 Gerenciador TC & Dual-Boot Windows (Linux)")
        self.root.geometry("620x680")
        self.root.resizable(False, False)
        
        self.config = load_config()

        # Tema Dark Mode
        self.bg_color = "#0f172a"
        self.card_bg = "#1e293b"
        self.text_color = "#f8fafc"
        self.accent_color = "#38bdf8"
        self.green_color = "#22c55e"
        self.red_color = "#ef4444"
        self.muted_color = "#94a3b8"

        self.root.configure(bg=self.bg_color)
        
        # Notebook (Abas)
        style = ttk.Style()
        style.theme_use('default')
        style.configure('TNotebook', background=self.bg_color, borderwidth=0)
        style.configure('TNotebook.Tab', background='#1e293b', foreground='white', padding=[15, 8], font=('Inter', 10, 'bold'))
        style.map('TNotebook.Tab', background=[('selected', '#0284c7')], foreground=[('selected', 'white')])

        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=15, pady=15)

        self.tab_tc = tk.Frame(self.notebook, bg=self.bg_color)
        self.tab_win = tk.Frame(self.notebook, bg=self.bg_color)
        self.tab_gdrive = tk.Frame(self.notebook, bg=self.bg_color)
        self.tab_partition = tk.Frame(self.notebook, bg=self.bg_color)

        self.notebook.add(self.tab_tc, text="📡 Time Capsule")
        self.notebook.add(self.tab_win, text="🪟 Pastas Windows")
        self.notebook.add(self.tab_gdrive, text="☁️ Google Drive")
        self.notebook.add(self.tab_partition, text="💽 Partições NTFS")

        self.setup_tab_tc()
        self.setup_tab_win()
        self.setup_tab_gdrive()
        self.setup_tab_partition()

        self.check_connection_async()

    # --- ABA 1: TIME CAPSULE ---
    def setup_tab_tc(self):
        card = tk.Frame(self.tab_tc, bg=self.card_bg, bd=1, relief="solid", highlightbackground="#334155")
        card.pack(fill="both", expand=True, padx=10, pady=10)

        # Status Bar
        self.status_frame = tk.Frame(card, bg="#0f172a", pady=10, padx=12)
        self.status_frame.pack(fill="x", padx=15, pady=15)

        self.status_indicator = tk.Label(
            self.status_frame, 
            text="● VERIFICANDO REDE...", 
            font=("Inter", 10, "bold"), 
            bg="#0f172a", 
            fg="#f59e0b"
        )
        self.status_indicator.pack(side="left")

        self.btn_refresh = tk.Button(
            self.status_frame,
            text="🔄 Testar",
            command=self.check_connection_async,
            bg="#334155",
            fg="white",
            font=("Inter", 9, "bold"),
            relief="flat",
            padx=10,
            cursor="hand2"
        )
        self.btn_refresh.pack(side="right")

        # Formulário
        form_frame = tk.Frame(card, bg=self.card_bg, padx=15)
        form_frame.pack(fill="x")

        tk.Label(form_frame, text="IP da Time Capsule:", bg=self.card_bg, fg=self.text_color, font=("Inter", 10, "bold")).pack(anchor="w", pady=(5, 2))
        self.ent_ip = tk.Entry(form_frame, bg="#0f172a", fg="white", insertbackground="white", font=("Monospace", 10), relief="flat", highlightbackground="#334155", highlightthickness=1)
        self.ent_ip.insert(0, self.config['ip'])
        self.ent_ip.pack(fill="x", ipady=5)

        tk.Label(form_frame, text="Compartilhamento SMB:", bg=self.card_bg, fg=self.text_color, font=("Inter", 10, "bold")).pack(anchor="w", pady=(8, 2))
        self.ent_share = tk.Entry(form_frame, bg="#0f172a", fg="white", insertbackground="white", font=("Monospace", 10), relief="flat", highlightbackground="#334155", highlightthickness=1)
        self.ent_share.insert(0, self.config['shareName'])
        self.ent_share.pack(fill="x", ipady=5)

        tk.Label(form_frame, text="Usuário SMB:", bg=self.card_bg, fg=self.text_color, font=("Inter", 10, "bold")).pack(anchor="w", pady=(8, 2))
        self.ent_user = tk.Entry(form_frame, bg="#0f172a", fg="white", insertbackground="white", font=("Monospace", 10), relief="flat", highlightbackground="#334155", highlightthickness=1)
        self.ent_user.insert(0, self.config['username'])
        self.ent_user.pack(fill="x", ipady=5)

        tk.Label(form_frame, text="Senha do Disco AirPort / SMB:", bg=self.card_bg, fg=self.text_color, font=("Inter", 10, "bold")).pack(anchor="w", pady=(8, 2))
        self.ent_pass = tk.Entry(form_frame, show="•", bg="#0f172a", fg="white", insertbackground="white", font=("Monospace", 10), relief="flat", highlightbackground="#334155", highlightthickness=1)
        self.ent_pass.insert(0, self.config['password'])
        self.ent_pass.pack(fill="x", ipady=5)

        # Ações
        btn_frame = tk.Frame(card, bg=self.card_bg, padx=15, pady=15)
        btn_frame.pack(fill="x")

        self.btn_mount = tk.Button(
            btn_frame,
            text="⚡ MONTAR E ABRIR PASTAS DA TIME CAPSULE",
            command=self.mount_tc_and_open,
            bg=self.accent_color,
            fg="#0f172a",
            font=("Inter", 11, "bold"),
            relief="flat",
            pady=8,
            cursor="hand2"
        )
        self.btn_mount.pack(fill="x", pady=4)

        self.btn_open_direct = tk.Button(
            btn_frame,
            text="📂 Abrir Janela do Diretório (Nautilus)",
            command=self.open_tc_folder,
            bg="#22c55e",
            fg="#0f172a",
            font=("Inter", 10, "bold"),
            relief="flat",
            pady=6,
            cursor="hand2"
        )
        self.btn_open_direct.pack(fill="x", pady=4)

        self.btn_unmount = tk.Button(
            btn_frame,
            text="🛑 Desmontar Compartilhamento",
            command=self.unmount_tc,
            bg="#334155",
            fg="white",
            font=("Inter", 9, "bold"),
            relief="flat",
            pady=5,
            cursor="hand2"
        )
        self.btn_unmount.pack(fill="x", pady=4)

    # --- ABA 2: DUAL-BOOT WINDOWS ---
    def setup_tab_win(self):
        card = tk.Frame(self.tab_win, bg=self.card_bg, bd=1, relief="solid", highlightbackground="#334155")
        card.pack(fill="both", expand=True, padx=10, pady=10)

        title = tk.Label(card, text="📂 Acesso às Pastas do Windows (Dual-Boot)", font=("Inter", 14, "bold"), bg=self.card_bg, fg=self.accent_color)
        title.pack(anchor="w", padx=15, pady=(15, 5))

        desc = tk.Label(
            card, 
            text="Sua partição Windows principal (NTFS) está montada no Linux em /mnt/windows.",
            font=("Inter", 10), 
            bg=self.card_bg, 
            fg=self.text_color,
            justify="left"
        )
        desc.pack(anchor="w", padx=15, pady=(0, 15))

        # Lista de partições detectadas
        part_frame = tk.Frame(card, bg="#0f172a", padx=12, pady=12)
        part_frame.pack(fill="both", expand=True, padx=15, pady=5)

        tk.Label(part_frame, text="Partições NTFS Detectadas no Disco:", font=("Inter", 10, "bold"), bg="#0f172a", fg=self.accent_color).pack(anchor="w", pady=(0, 5))

        self.txt_partitions = tk.Text(part_frame, height=6, bg="#0f172a", fg="#22c55e", font=("Monospace", 9), relief="flat")
        self.txt_partitions.pack(fill="both", expand=True)

        self.scan_ntfs_partitions()

        # Botões de Ação Windows
        btn_win_frame = tk.Frame(card, bg=self.card_bg, padx=15, pady=15)
        btn_win_frame.pack(fill="x")

        btn_open_win = tk.Button(
            btn_win_frame,
            text="📂 Abrir /mnt/windows no Gerenciador de Arquivos",
            command=self.open_windows_folder,
            bg=self.accent_color,
            fg="#0f172a",
            font=("Inter", 11, "bold"),
            relief="flat",
            pady=10,
            cursor="hand2"
        )
        btn_open_win.pack(fill="x", pady=4)

        btn_open_win_user = tk.Button(
            btn_win_frame,
            text="👤 Abrir Pasta de Usuários do Windows (C:\\Users)",
            command=self.open_windows_users_folder,
            bg="#334155",
            fg="white",
            font=("Inter", 10, "bold"),
            relief="flat",
            pady=8,
            cursor="hand2"
        )
        btn_open_win_user.pack(fill="x", pady=4)

    # --- ABA 3: GOOGLE DRIVE ---
    def setup_tab_gdrive(self):
        card = tk.Frame(self.tab_gdrive, bg=self.card_bg, bd=1, relief="solid", highlightbackground="#334155")
        card.pack(fill="both", expand=True, padx=10, pady=10)

        title = tk.Label(card, text="☁️ Conectar e Acessar o Google Drive", font=("Inter", 14, "bold"), bg=self.card_bg, fg="#34A853")
        title.pack(anchor="w", padx=15, pady=(15, 5))

        desc_text = (
            "No Ubuntu você pode acessar seu Google Drive de 3 formas:\n\n"
            "1. 👤 Contas Online do Ubuntu (Nativo): Integra seu Google Drive direto no Gerenciador de Arquivos (Nautilus).\n"
            "2. 🌐 Navegador Web: Acessa o Google Drive diretamente via web.\n"
            "3. ⚡ RClone / Gerenciador TC: Permite sincronizar e desafogar arquivos da Time Capsule direto para o Drive."
        )

        desc = tk.Label(
            card, 
            text=desc_text,
            font=("Inter", 10), 
            bg=self.card_bg, 
            fg=self.text_color,
            justify="left",
            wraplength=540
        )
        desc.pack(anchor="w", padx=15, pady=10)

        btn_frame = tk.Frame(card, bg=self.card_bg, padx=15, pady=10)
        btn_frame.pack(fill="x")

        btn_online_accounts = tk.Button(
            btn_frame,
            text="🔑 CONECTAR CONTA GOOGLE NO UBUNTU (CONTAS ONLINE)",
            command=self.open_gnome_online_accounts,
            bg="#34A853",
            fg="white",
            font=("Inter", 10, "bold"),
            relief="flat",
            pady=10,
            cursor="hand2"
        )
        btn_online_accounts.pack(fill="x", pady=4)

        btn_open_web_gdrive = tk.Button(
            btn_frame,
            text="🌐 ABRIR GOOGLE DRIVE NO NAVEGADOR WEB",
            command=self.open_gdrive_web,
            bg="#38bdf8",
            fg="#0f172a",
            font=("Inter", 10, "bold"),
            relief="flat",
            pady=8,
            cursor="hand2"
        )
        btn_open_web_gdrive.pack(fill="x", pady=4)

        btn_open_rclone = tk.Button(
            btn_frame,
            text="⚡ CONFIGURAR RCLONE / DRIVE VIA TERMINAL",
            command=self.open_rclone_config,
            bg="#334155",
            fg="white",
            font=("Inter", 10, "bold"),
            relief="flat",
            pady=8,
            cursor="hand2"
        )
        btn_open_rclone.pack(fill="x", pady=4)

    def open_gnome_online_accounts(self):
        try:
            subprocess.Popen(["gnome-control-center", "online-accounts"])
        except Exception as e:
            messagebox.showerror("Erro", f"Não foi possível abrir as configurações: {e}")

    def open_gdrive_web(self):
        import webbrowser
        webbrowser.open("https://drive.google.com")

    def open_rclone_config(self):
        try:
            subprocess.Popen(["gnome-terminal", "--", "rclone", "config"])
        except Exception as e:
            messagebox.showerror("Erro", f"Falha ao abrir terminal: {e}")

    # --- ABA 3: CRIAR / GERENCIAR PARTIÇÕES NTFS ---
    def setup_tab_partition(self):
        card = tk.Frame(self.tab_partition, bg=self.card_bg, bd=1, relief="solid", highlightbackground="#334155")
        card.pack(fill="both", expand=True, padx=10, pady=10)

        title = tk.Label(card, text="💽 Criar e Gerenciar Partições NTFS", font=("Inter", 14, "bold"), bg=self.card_bg, fg=self.accent_color)
        title.pack(anchor="w", padx=15, pady=(15, 5))

        info_text = (
            "Para criar uma nova partição NTFS no Linux de forma totalmente segura (sem perdas de dados):\n\n"
            "1. Abra o utilitário 'Discos do Ubuntu' (GNOME Disks) clicando no botão abaixo.\n"
            "2. Selecione seu disco NVMe / SSD (ex: nvme0n1).\n"
            "3. Escolha o espaço livre ou diminua uma partição existente.\n"
            "4. Clique em '+' para criar a nova partição e selecione o tipo 'NTFS'.\n"
            "5. Dê um nome (ex: 'Dados_Windows') e confirme."
        )

        desc = tk.Label(
            card, 
            text=info_text,
            font=("Inter", 10), 
            bg=self.card_bg, 
            fg=self.text_color,
            justify="left",
            wraplength=540
        )
        desc.pack(anchor="w", padx=15, pady=10)

        btn_disks_frame = tk.Frame(card, bg=self.card_bg, padx=15, pady=20)
        btn_disks_frame.pack(fill="x")

        btn_open_disks = tk.Button(
            btn_disks_frame,
            text="💽 ABRIR GERENCIADOR DE DISCOS DO UBUNTU (GNOME DISKS)",
            command=self.open_gnome_disks,
            bg=self.accent_color,
            fg="#0f172a",
            font=("Inter", 11, "bold"),
            relief="flat",
            pady=12,
            cursor="hand2"
        )
        btn_open_disks.pack(fill="x", pady=5)

    # --- LÓGICA & AUXILIARES ---
    def scan_ntfs_partitions(self):
        try:
            res_df = subprocess.run(["df", "-h", "/mnt/windows"], capture_output=True, text=True)
            space_info = ""
            if res_df.returncode == 0:
                df_lines = res_df.stdout.strip().split('\n')
                if len(df_lines) >= 2:
                    parts = df_lines[1].split()
                    if len(parts) >= 5:
                        space_info = f"💾 Espaço Livre em C: ({parts[0]}):\n   🟢 Disponível: {parts[3]}  |  Usado: {parts[2]} de {parts[1]} ({parts[4]})\n\n"

            res = subprocess.run(["lsblk", "-f", "-o", "NAME,FSTYPE,LABEL,MOUNTPOINTS"], capture_output=True, text=True)
            lines = res.stdout.split('\n')
            ntfs_lines = [l for l in lines if 'ntfs' in l.lower() or 'mnt' in l.lower() or 'nvme' in l.lower()]
            
            self.txt_partitions.delete("1.0", tk.END)
            full_text = space_info + "Partições no Disco:\n" + ("\n".join(ntfs_lines) if ntfs_lines else "Nenhuma partição NTFS detectada.")
            self.txt_partitions.insert(tk.END, full_text)
        except Exception as e:
            self.txt_partitions.insert(tk.END, f"Erro ao listar partições: {e}")

    def check_connection_async(self):
        ip = self.ent_ip.get().strip()
        self.status_indicator.config(text="● VERIFICANDO PING...", fg="#f59e0b")
        self.root.after(100, lambda: self._ping_check(ip))

    def _ping_check(self, ip):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1.5)
            res = s.connect_ex((ip, 445))
            s.close()
            if res == 0:
                self.status_indicator.config(text=f"● ONLINE ({ip}:445 OK)", fg=self.green_color)
            else:
                self.status_indicator.config(text=f"✖ OFF-LINE ({ip}:445 indisponível)", fg=self.red_color)
        except Exception:
            self.status_indicator.config(text=f"✖ ERRO DE REDE EM {ip}", fg=self.red_color)

    def open_tc_folder(self):
        ip = self.ent_ip.get().strip()
        share = self.ent_share.get().strip()
        user = self.ent_user.get().strip()

        env = dict(os.environ, DISPLAY=os.environ.get('DISPLAY', ':0'), XDG_RUNTIME_DIR=os.environ.get('XDG_RUNTIME_DIR', '/run/user/1000'))
        
        # URL SMB sempre limpa e válida para o Nautilus / GIO
        smb_url = f"smb://{user}@{ip}/{share}" if user else f"smb://{ip}/{share}"

        uid = os.getuid()
        gvfs_path = f"/run/user/{uid}/gvfs/smb-share:server={ip},share={share.lower()}"
        alt_gvfs_path = f"/run/user/{uid}/gvfs/smb-share:server={ip},share={share}"

        target = gvfs_path if os.path.exists(gvfs_path) else (alt_gvfs_path if os.path.exists(alt_gvfs_path) else smb_url)
        
        try:
            subprocess.Popen(["nautilus", target], env=env)
        except Exception:
            try:
                subprocess.Popen(["gio", "open", target], env=env)
            except Exception as e:
                messagebox.showerror("Erro", f"Não foi possível abrir a janela do diretório: {e}")

    def mount_tc_and_open(self):
        ip = self.ent_ip.get().strip()
        share = self.ent_share.get().strip()
        user = self.ent_user.get().strip()
        password = self.ent_pass.get().strip()

        self.config.update({'ip': ip, 'shareName': share, 'username': user, 'password': password})
        save_config(self.config)

        env = dict(os.environ, DISPLAY=os.environ.get('DISPLAY', ':0'), XDG_RUNTIME_DIR=os.environ.get('XDG_RUNTIME_DIR', '/run/user/1000'))
        smb_url = f"smb://{user}@{ip}/{share}" if user else f"smb://{ip}/{share}"

        try:
            # Tenta desmontar qualquer sessão anterior sem lançar erro
            subprocess.run(["gio", "mount", "-u", smb_url], capture_output=True, env=env)
            
            # Executa a montagem e passa usuario/senha se fornecidos
            proc = subprocess.Popen(["gio", "mount", smb_url], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env)
            proc.communicate(input=f"{user or 'admin'}\nWORKGROUP\n{password}\n")

            # Abre a janela do Nautilus diretamente
            self.open_tc_folder()
        except Exception as e:
            messagebox.showerror("Erro", f"Falha na montagem: {e}")

    def unmount_tc(self):
        url = f"smb://{self.ent_user.get().strip()}@{self.ent_ip.get().strip()}/{self.ent_share.get().strip()}"
        res = subprocess.run(["gio", "mount", "-u", url], capture_output=True, text=True)
        if res.returncode == 0:
            messagebox.showinfo("Desmontado", "Compartilhamento desmontado com sucesso!")
        else:
            messagebox.showwarning("Aviso", "O compartilhamento já não estava montado.")

    def open_windows_folder(self):
        path = "/mnt/windows"
        if os.path.exists(path):
            subprocess.Popen(["xdg-open", path])
        else:
            messagebox.showerror("Erro", f"Caminho {path} não encontrado!")

    def open_windows_users_folder(self):
        path = "/mnt/windows/Users"
        if os.path.exists(path):
            subprocess.Popen(["xdg-open", path])
        else:
            messagebox.showerror("Erro", f"Caminho {path} não encontrado!")

    def open_gnome_disks(self):
        try:
            subprocess.Popen(["gnome-disks"])
        except Exception as e:
            messagebox.showerror("Erro", f"Falha ao abrir gnome-disks: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = MultiManagerApp(root)
    root.mainloop()
