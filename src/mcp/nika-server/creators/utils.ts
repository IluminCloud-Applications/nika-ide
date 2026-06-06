import path from 'node:path'

export function getUserDataPath(): string {
  if (process.env.USER_DATA_PATH) {
    return process.env.USER_DATA_PATH
  }
  const home = process.env.HOME || process.env.USERPROFILE || ''
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Nika IDE')
  } else if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Nika IDE')
  } else {
    return path.join(home, '.config', 'Nika IDE')
  }
}
