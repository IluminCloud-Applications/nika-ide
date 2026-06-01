/**
 * Cross-platform utilities for shell, browser, and terminal detection.
 *
 * Support matrix:
 *   OS        | Browser      | PTY Shell         | External Terminal
 *   --------- | ------------ | ----------------- | -------------------------
 *   Windows   | start        | pwsh / powershell | wt (Windows Terminal) → powershell
 *   macOS     | open         | zsh               | Terminal.app via osascript
 *   Linux     | xdg-open     | bash              | gnome-terminal → xterm fallback
 */
import os from 'os';
import { exec } from 'child_process';

export type Platform = 'win32' | 'darwin' | 'linux';

export function getPlatform(): Platform {
  const p = os.platform();
  if (p === 'win32') return 'win32';
  if (p === 'darwin') return 'darwin';
  return 'linux';
}

// ── BROWSER ─────────────────────────────────────────────────────────────────

/** Opens a URL in the default browser (cross-platform). */
export function openBrowser(url: string): void {
  const cmds: Record<Platform, string> = {
    win32: `start "" "${url}"`,
    darwin: `open "${url}"`,
    linux: `xdg-open "${url}"`,
  };

  exec(cmds[getPlatform()], (err) => {
    if (err) console.error('[TaskMe] Failed to open browser:', err.message);
  });
}

// ── SHELL (for node-pty) ─────────────────────────────────────────────────────

export interface ShellConfig {
  shell: string;
  args: string[];
}

/**
 * Returns the best shell + args for the current OS,
 * ensuring login-shell environment (NVM, Homebrew, PATH) is loaded.
 */
export function getShellConfig(command?: string): ShellConfig {
  const platform = getPlatform();

  if (platform === 'win32') {
    // Prefer PowerShell 7 (cross-platform), fallback to Windows PowerShell 5
    const shell =
      process.env['PROGRAMFILES']
        ? `${process.env['PROGRAMFILES']}\\PowerShell\\7\\pwsh.exe`
        : 'powershell.exe';
    return command
      ? { shell, args: ['-NoLogo', '-Command', command] }
      : { shell, args: ['-NoLogo'] };
  }

  if (platform === 'darwin') {
    // zsh is the default shell on macOS Catalina+
    return command
      ? { shell: '/bin/zsh', args: ['-l', '-c', command] }
      : { shell: '/bin/zsh', args: ['-l'] };
  }

  // Linux — bash with login flag to load ~/.bashrc, nvm, etc.
  return command
    ? { shell: '/bin/bash', args: ['-l', '-c', command] }
    : { shell: '/bin/bash', args: ['-l'] };
}

// ── EXTERNAL TERMINAL WINDOW ─────────────────────────────────────────────────

/**
 * Opens an external terminal window on the user's desktop and runs a command.
 *
 * Strategy per OS:
 *   Windows → Windows Terminal (wt) → powershell.exe fallback
 *   macOS   → Terminal.app via osascript
 *   Linux   → gnome-terminal → xterm fallback
 */
export function openTerminalWindow(command: string, cwd?: string): void {
  const platform = getPlatform();
  const cwdArg = cwd ?? os.homedir();

  let shellCmd: string;

  if (platform === 'win32') {
    // Try Windows Terminal first (modern), fall back to PowerShell window
    shellCmd = `start wt -d "${cwdArg}" powershell -NoExit -Command "${command}" 2>nul || start powershell -NoExit -Command "cd '${cwdArg}'; ${command}"`;
  } else if (platform === 'darwin') {
    // osascript opens Terminal.app with the command
    const escaped = command.replace(/"/g, '\\"');
    shellCmd = `osascript -e 'tell application "Terminal" to do script "cd \\"${cwdArg}\\" && ${escaped}"' -e 'tell application "Terminal" to activate'`;
  } else {
    // Linux: gnome-terminal (GNOME/PopOS/Ubuntu), xterm as universal fallback
    shellCmd = `gnome-terminal --working-directory="${cwdArg}" -- bash -l -c "${command}; exec bash" 2>/dev/null || xterm -e "cd '${cwdArg}' && ${command}; bash" &`;
  }

  exec(shellCmd, (err) => {
    if (err) console.error('[TaskMe] Failed to open terminal window:', err.message);
  });
}
