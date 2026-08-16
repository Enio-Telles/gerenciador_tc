#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path.cwd()
REPO = os.environ.get('GITHUB_REPOSITORY', 'unknown/repository')
EVENT = os.environ.get('GITHUB_EVENT_NAME', 'workflow_dispatch')
TARGET_BRANCH = os.environ.get('TARGET_BRANCH', 'main')
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
MODEL = os.environ.get('WIKI_MODEL', 'openai/gpt-oss-20b:free')
START = '<!-- wiki-bilingual-link:start -->'
END = '<!-- wiki-bilingual-link:end -->'
PAGES = {
    'Home.md': 'home',
    'Architecture.md': 'architecture',
    'Installation-and-Usage.md': 'installation_and_usage',
    'Contributing-and-Troubleshooting.md': 'contributing_and_troubleshooting',
}
SECRET_PATTERNS = [
    re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----'),
    re.compile(r'\b(?:sk|rk|ghp|github_pat|xoxb|xoxp)-[A-Za-z0-9_-]{12,}\b', re.I),
    re.compile(r'OPENROUTER_API_KEY\s*[:=]', re.I),
    re.compile(r'(?:password|secret|token|api[_-]?key)\s*[:=]\s*["\'][^"\']{8,}["\']', re.I),
]
IGNORED = {'.git', '.venv', 'venv', 'node_modules', 'dist', 'build', 'coverage', '__pycache__', '.next', '.cache'}
TEXT_EXTS = {'.md', '.rst', '.txt', '.adoc', '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.rs', '.rb', '.php', '.cs', '.cpp', '.c', '.h', '.hpp', '.sql', '.sh', '.yml', '.yaml', '.json', '.toml', '.ini', '.cfg', '.xml', '.html', '.css'}


def run(cmd: list[str], cwd: Path | None = None, timeout: int = 120, check: bool = True) -> str:
    p = subprocess.run(cmd, cwd=str(cwd) if cwd else None, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=timeout)
    if check and p.returncode:
        raise RuntimeError(f"{' '.join(cmd)} failed: {p.stdout[-1200:]}")
    return p.stdout


def changed_files() -> list[str]:
    if EVENT == 'workflow_dispatch':
        return []
    head = run(['git', 'rev-parse', 'HEAD']).strip()
    parents = run(['git', 'rev-list', '--parents', '-n', '1', head]).strip().split()
    base = parents[1] if len(parents) > 2 else f'{head}^'
    return [x for x in run(['git', 'diff', '--name-only', base, head]).splitlines() if x]


def is_code(path: str) -> bool:
    p = path.replace('\\', '/')
    if p.startswith('.github/'):
        return False
    return not p.lower().endswith(('.md', '.markdown', '.rst', '.txt', '.adoc'))


def read_safe(path: Path, limit: int = 6000) -> str:
    if path.name in {'.env', '.env.local', '.env.production', 'credentials.json', 'secrets.json'}:
        return ''
    if path.suffix.lower() not in TEXT_EXTS and path.name not in {'Dockerfile', 'Makefile', 'Procfile'}:
        return ''
    try:
        text = path.read_text(encoding='utf-8', errors='replace')[:limit]
    except OSError:
        return ''
    if any(pattern.search(text) for pattern in SECRET_PATTERNS):
        return '[omitted: secret-like pattern detected]'
    return text


def context(files: list[str]) -> str:
    chunks = []
    for rel in files[:80]:
        path = ROOT / rel
        if path.is_file():
            text = read_safe(path)
            if text:
                chunks.append(f'### Changed file: {rel}\n{text}')
    for name in ['README.md', 'pyproject.toml', 'package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'Dockerfile', 'Makefile']:
        path = ROOT / name
        if path.is_file() and name not in files:
            text = read_safe(path, 5000)
            if text:
                chunks.append(f'### Project anchor: {name}\n{text}')
    tracked = [x for x in run(['git', 'ls-files']).splitlines() if not any(part in IGNORED for part in Path(x).parts)]
    chunks.append('### Tracked tree\n' + '\n'.join(tracked[:500]))
    return '\n\n'.join(chunks)[:60000]


def generate(context_text: str, files: list[str]) -> dict[str, str]:
    if not OPENROUTER_API_KEY:
        raise RuntimeError('OPENROUTER_API_KEY is missing')
    system = ('You are a conservative software documentation maintainer. Use only facts in the repository context. '
              'Never invent commands, dependencies, architecture, tests, performance, or behavior. If unsupported, say in Portuguese and English that it was not verified in the snapshot. '
              'Never reproduce secrets. Return JSON only with exactly the keys home, architecture, installation_and_usage, contributing_and_troubleshooting. '
              'Each value must be Markdown with exactly the sections ## Português (Brasil) and ## English.')
    user = f'Repository: {REPO}\nChanged code: {json.dumps(files[:80], ensure_ascii=False)}\n\nContext:\n{context_text}\n\nGenerate four concise bilingual Wiki pages. Return JSON only.'
    body = json.dumps({'model': MODEL, 'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}], 'temperature': 0.15, 'max_tokens': 6500}).encode()
    req = urllib.request.Request('https://openrouter.ai/api/v1/chat/completions', data=body, method='POST', headers={'Authorization': f'Bearer {OPENROUTER_API_KEY}', 'Content-Type': 'application/json', 'HTTP-Referer': f'https://github.com/{REPO}', 'X-Title': 'Bilingual Wiki Sync'})
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f'OpenRouter HTTP {exc.code}: {exc.read().decode(errors="replace")[-800:]}')
    raw = payload.get('choices', [{}])[0].get('message', {}).get('content', '')
    raw = re.sub(r'^```(?:json)?\s*|\s*```$', '', raw.strip(), flags=re.I)
    result = json.loads(raw)
    if set(result) != set(PAGES.values()) or not all(isinstance(result[k], str) for k in PAGES.values()):
        raise RuntimeError('invalid OpenRouter schema')
    for key, value in result.items():
        if '## Português (Brasil)' not in value or '## English' not in value:
            raise RuntimeError(f'missing bilingual headings: {key}')
        if any(pattern.search(value) for pattern in SECRET_PATTERNS):
            raise RuntimeError(f'secret-like pattern in generated page: {key}')
    return result


def update_readme() -> Path:
    candidates = sorted([p for p in ROOT.iterdir() if p.is_file() and p.name.lower().startswith('readme')], key=lambda p: p.name.lower())
    path = next((p for p in candidates if p.name.lower() == 'readme.md'), candidates[0] if candidates else ROOT / 'README.md')
    text = path.read_text(encoding='utf-8', errors='replace') if path.exists() else f"# {REPO.split('/', 1)[-1]}\n"
    wiki = f'https://github.com/{REPO}/wiki'
    block = f'{START}\n[![Wiki bilíngue](https://img.shields.io/badge/Wiki-Bilingual-blue?logo=readthedocs)]({wiki})\n\n> **Documentação / Documentation:** consulte a [Wiki bilíngue do projeto]({wiki}) para visão geral, arquitetura, instalação, uso, contribuição e troubleshooting.\n{END}'
    pattern = re.compile(re.escape(START) + r'.*?' + re.escape(END), re.S)
    updated = pattern.sub(block, text, count=1) if pattern.search(text) else block + '\n\n' + text.lstrip()
    path.write_text(updated.rstrip() + '\n', encoding='utf-8')
    return path


def publish_wiki(pages: dict[str, str]) -> None:
    if not GITHUB_TOKEN:
        raise RuntimeError('GITHUB_TOKEN is missing')
    tmp = Path(tempfile.mkdtemp(prefix='wiki-sync-'))
    try:
        remote = f'https://x-access-token:{GITHUB_TOKEN}@github.com/{REPO}.wiki.git'
        run(['git', 'clone', '--depth', '1', remote, str(tmp / 'wiki')], timeout=180)
        wiki = tmp / 'wiki'
        for filename, key in PAGES.items():
            (wiki / filename).write_text(pages[key].rstrip() + '\n', encoding='utf-8')
        run(['git', 'config', 'user.name', 'github-actions[bot]'], cwd=wiki)
        run(['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], cwd=wiki)
        run(['git', 'add', *PAGES], cwd=wiki)
        if subprocess.run(['git', 'diff', '--cached', '--quiet'], cwd=str(wiki)).returncode == 0:
            return
        run(['git', 'commit', '-m', 'docs: sync bilingual Wiki from merged code'], cwd=wiki, timeout=60)
        run(['git', 'push', 'origin', 'HEAD:master'], cwd=wiki, timeout=180)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main() -> None:
    files = changed_files()
    if EVENT != 'workflow_dispatch' and files and not any(is_code(x) for x in files):
        print('No code changes; skipping.')
        return
    if EVENT != 'workflow_dispatch' and not files:
        print('No changed files; skipping.')
        return
    pages = generate(context(files), files)
    readme = update_readme()
    run(['git', 'config', 'user.name', 'github-actions[bot]'], cwd=ROOT)
    run(['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], cwd=ROOT)
    run(['git', 'add', str(readme.relative_to(ROOT))], cwd=ROOT)
    if subprocess.run(['git', 'diff', '--cached', '--quiet'], cwd=str(ROOT)).returncode != 0:
        run(['git', 'commit', '-m', 'docs: sync bilingual Wiki link [skip ci]'], cwd=ROOT, timeout=60)
        run(['git', 'push', 'origin', f'HEAD:{TARGET_BRANCH}'], cwd=ROOT, timeout=180)
    publish_wiki(pages)
    print(json.dumps({'repository': REPO, 'changed_files': files, 'wiki_pages': list(PAGES), 'model': MODEL}, ensure_ascii=False))

if __name__ == '__main__':
    main()
