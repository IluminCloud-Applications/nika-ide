/**
 * Auto-install commands and official URLs for each tool, per OS.
 *
 * `auto`        — shell command that installs the tool.
 *                 null means no reliable 1-click install for that platform.
 * `url`         — official download/install page to open in the browser.
 * `interactive` — if true, the command needs an external terminal (sudo, curl|bash, etc.)
 */

export type PlatformKey = 'linux' | 'darwin' | 'win32'

interface InstallInfo {
  auto: string | null
  url: string
  interactive: boolean
}

type PlatformInstalls = Record<PlatformKey, InstallInfo>

export const INSTALL_REGISTRY: Record<string, PlatformInstalls> = {
  git: {
    linux:  { auto: 'sudo apt-get install -y git || sudo dnf install -y git || sudo pacman -S --noconfirm git', url: 'https://git-scm.com/downloads/linux',  interactive: true },
    darwin: { auto: 'xcode-select --install',                                                                   url: 'https://git-scm.com/downloads/mac',   interactive: true },
    win32:  { auto: 'winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements',     url: 'https://git-scm.com/downloads/win',   interactive: false },
  },
  wsl: {
    linux:  { auto: null, url: 'https://learn.microsoft.com/en-us/windows/wsl/install', interactive: false },
    darwin: { auto: null, url: 'https://learn.microsoft.com/en-us/windows/wsl/install', interactive: false },
    win32:  { auto: 'wsl --install && wsl --update',                                     url: 'https://learn.microsoft.com/en-us/windows/wsl/install', interactive: true },
  },
  node: {
    linux:  { auto: null,                                                                                              url: 'https://nodejs.org/en/download', interactive: false },
    darwin: { auto: 'brew install node',                                                                               url: 'https://nodejs.org/en/download', interactive: false },
    win32:  { auto: 'winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements', url: 'https://nodejs.org/en/download', interactive: false },
  },
  npm: {
    linux:  { auto: null, url: 'https://nodejs.org/en/download', interactive: false },
    darwin: { auto: null, url: 'https://nodejs.org/en/download', interactive: false },
    win32:  { auto: null, url: 'https://nodejs.org/en/download', interactive: false },
  },
  docker: {
    linux:  { auto: null, url: 'https://docs.docker.com/engine/install/',                         interactive: false },
    darwin: { auto: null, url: 'https://docs.docker.com/desktop/setup/install/mac-install/',       interactive: false },
    win32:  { auto: 'winget install --id Docker.DockerDesktop -e --accept-source-agreements --accept-package-agreements', url: 'https://docs.docker.com/desktop/setup/install/windows-install/', interactive: false },
  },
  python: {
    linux:  { auto: 'sudo apt-get install -y python3 || sudo dnf install -y python3 || sudo pacman -S --noconfirm python', url: 'https://www.python.org/downloads/', interactive: true },
    darwin: { auto: 'brew install python',                                                                                  url: 'https://www.python.org/downloads/', interactive: false },
    win32:  { auto: 'winget install --id Python.Python.3.12 -e --accept-source-agreements --accept-package-agreements',     url: 'https://www.python.org/downloads/', interactive: false },
  },
  claude: {
    linux:  { auto: 'curl -fsSL https://claude.ai/install.sh | bash',  url: 'https://docs.anthropic.com/en/docs/claude-code/overview', interactive: true },
    darwin: { auto: 'curl -fsSL https://claude.ai/install.sh | bash',  url: 'https://docs.anthropic.com/en/docs/claude-code/overview', interactive: true },
    win32:  { auto: 'winget install Anthropic.ClaudeCode',             url: 'https://docs.anthropic.com/en/docs/claude-code/overview', interactive: false },
  },
  agy: {
    linux:  { auto: 'curl -fsSL https://antigravity.google/cli/install.sh | bash',  url: 'https://antigravity.google/docs/cli-getting-started', interactive: true },
    darwin: { auto: 'curl -fsSL https://antigravity.google/cli/install.sh | bash',  url: 'https://antigravity.google/docs/cli-getting-started', interactive: true },
    win32:  { auto: 'irm https://antigravity.google/cli/install.ps1 | iex',         url: 'https://antigravity.google/docs/cli-getting-started', interactive: true },
  },
  codex: {
    linux:  { auto: 'curl -fsSL https://chatgpt.com/codex/install.sh | sh',                          url: 'https://developers.openai.com/codex/cli', interactive: true },
    darwin: { auto: 'curl -fsSL https://chatgpt.com/codex/install.sh | sh',                          url: 'https://developers.openai.com/codex/cli', interactive: true },
    win32:  { auto: 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"', url: 'https://developers.openai.com/codex/cli', interactive: true },
  },
}

/** Human-readable OS label */
export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  linux:  'Linux',
  darwin: 'macOS',
  win32:  'Windows',
}
