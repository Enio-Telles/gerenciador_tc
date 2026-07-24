#!/usr/bin/env python3
"""
Gerenciador Time Capsule & Dual-Boot (App Tray System Bar)
Inicializa o Backend (Node.js/Express) e Frontend (Vite/React)
e exibe um ícone interativo na barra superior (System Tray) do Ubuntu.
"""

import os
import sys
import time
import subprocess
import webbrowser
import threading
from PIL import Image, ImageDraw
import pystray

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_PORT = 5000
FRONTEND_PORT = 5174

backend_process = None
frontend_process = None

def create_tray_icon_image():
    """Gera um ícone visual elegante em 64x64 para a barra superior do Ubuntu."""
    width = 64
    height = 64
    image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    dc = ImageDraw.Draw(image)
    
    # Círculo externo Cyan / Teal Neon
    dc.ellipse([4, 4, 60, 60], fill=(15, 23, 42, 245), outline=(56, 189, 248, 255), width=3)
    
    # Ícone central (Símbolo de Servidor / Rede / Disco)
    dc.rectangle([18, 18, 46, 26], fill=(56, 189, 248, 255))
    dc.ellipse([40, 20, 44, 24], fill=(34, 197, 94, 255)) # Led Verde ON
    
    dc.rectangle([18, 29, 46, 37], fill=(56, 189, 248, 255))
    dc.ellipse([40, 31, 44, 35], fill=(34, 197, 94, 255)) # Led Verde ON
    
    dc.rectangle([18, 40, 46, 48], fill=(99, 102, 241, 255))
    dc.ellipse([40, 42, 44, 46], fill=(234, 179, 8, 255)) # Led Amarelo
    
    return image

def start_backend():
    global backend_process
    if backend_process is None or backend_process.poll() is not None:
        print("[BACKEND] Iniciando servidor Node.js/Express...")
        backend_process = subprocess.Popen(
            ["npm", "run", "server"],
            cwd=PROJECT_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

def start_frontend():
    global frontend_process
    if frontend_process is None or frontend_process.poll() is not None:
        print("[FRONTEND] Iniciando servidor Vite/React...")
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=PROJECT_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

def stop_services():
    global backend_process, frontend_process
    print("[SERVIÇOS] Encerrando processos...")
    if backend_process and backend_process.poll() is None:
        backend_process.terminate()
    if frontend_process and frontend_process.poll() is None:
        frontend_process.terminate()

def open_web_interface(icon=None, item=None):
    webbrowser.open(f"http://localhost:{FRONTEND_PORT}")

def open_montador_app(icon=None, item=None):
    app_script = os.path.join(PROJECT_DIR, "app_montador_tc.py")
    subprocess.Popen([sys.executable, app_script], cwd=PROJECT_DIR)

def open_disks_manager(icon=None, item=None):
    subprocess.Popen(["gnome-disks"])

def restart_services(icon=None, item=None):
    stop_services()
    time.sleep(1)
    start_backend()
    start_frontend()

def on_quit(icon, item):
    stop_services()
    icon.stop()
    sys.exit(0)

def setup_tray():
    icon_image = create_tray_icon_image()
    
    menu = pystray.Menu(
        pystray.MenuItem("🚀 Abrir Gerenciador Web", open_web_interface, default=True),
        pystray.MenuItem("📡 Montar Time Capsule & Dual-Boot (App)", open_montador_app),
        pystray.MenuItem("💽 Gerenciar Partições NTFS (Discos)", open_disks_manager),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("🔄 Reiniciar Servidores", restart_services),
        pystray.MenuItem("❌ Encerrar Gerenciador", on_quit)
    )
    
    icon = pystray.Icon(
        "GerenciadorTC",
        icon_image,
        "Gerenciador Time Capsule & Dual-Boot",
        menu
    )
    
    # Inicia servidores em background
    start_backend()
    start_frontend()
    
    # Aguarda 2s e abre o navegador
    threading.Thread(target=lambda: (time.sleep(2.5), open_web_interface()), daemon=True).start()
    
    print("✅ Tray Icon ativo na barra superior do Ubuntu!")
    icon.run()

if __name__ == "__main__":
    setup_tray()
