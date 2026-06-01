import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

export async function checkApp(projectPath: string): Promise<string> {
  const frontendPath = path.join(projectPath, 'frontend')
  const reports: string[] = []
  let hasErrors = false

  // 1. Frontend Check (npm run build)
  if (fs.existsSync(frontendPath)) {
    reports.push('=== Frontend Check (Build) ===')
    try {
      execSync('npm run build', {
        cwd: frontendPath,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 60000
      })
      reports.push('✓ Frontend build succeeded without errors.')
    } catch (err: any) {
      hasErrors = true
      const rawError = (err.stderr || err.stdout || err.message || '').trim()
      reports.push('❌ Frontend build failed!')
      reports.push(filterFrontendErrors(rawError))
    }

    // 2. Frontend Security Check (npm audit)
    try {
      reports.push('\n=== Frontend Security Check (npm audit) ===')
      execSync('npm audit --audit-level=high', {
        cwd: frontendPath,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 20000
      })
      reports.push('✓ No high or critical vulnerabilities found.')
    } catch (err: any) {
      const rawAudit = (err.stdout || err.stderr || '').trim()
      const auditSummary = filterAuditSummary(rawAudit)
      if (auditSummary) {
        reports.push(`⚠ Vulnerabilities found:\n${auditSummary}`)
      } else {
        reports.push('✓ Audit completed (some warnings found).')
      }
    }
  } else {
    reports.push('=== Frontend Check ===')
    reports.push('⚠ Directory "frontend" not found. Skipping frontend checks.')
  }

  // 3. Backend Docker & Python Check
  reports.push('\n=== Backend Check (Docker & Python) ===')
  let isBackendRunning = false
  try {
    const ps = execSync('docker compose ps --format json', { cwd: projectPath, encoding: 'utf-8', timeout: 10000 })
    isBackendRunning = checkContainerRunning(ps)
  } catch (_) {
    try {
      const psStr = execSync('docker compose ps', { cwd: projectPath, encoding: 'utf-8', timeout: 10000 })
      isBackendRunning = psStr.toLowerCase().includes('backend') && 
                         (psStr.toLowerCase().includes('up') || psStr.toLowerCase().includes('running'))
    } catch (_) {}
  }

  if (isBackendRunning) {
    // 3a. Check Python Syntax / Compilation
    try {
      execSync('docker compose exec -T backend python -m compileall -q .', {
        cwd: projectPath,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 20000
      })
      reports.push('✓ Python syntax verification: OK (all files compile successfully).')
    } catch (err: any) {
      hasErrors = true
      const rawCompileErr = (err.stderr || err.stdout || '').trim()
      reports.push('❌ Python compilation error(s) found:')
      reports.push(rawCompileErr || err.message)
    }

    // 3b. Check backend logs for runtime Tracebacks or Exceptions
    try {
      const logs = execSync('docker compose logs --tail=100 backend', {
        cwd: projectPath,
        encoding: 'utf-8',
        timeout: 15000
      })
      const runtimeErrors = filterBackendRuntimeErrors(logs)
      if (runtimeErrors) {
        hasErrors = true
        reports.push('❌ Python runtime exception(s) detected in container logs:')
        reports.push(runtimeErrors)
      } else {
        reports.push('✓ No recent runtime exceptions detected in backend logs.')
      }
    } catch (err: any) {
      reports.push(`⚠ Could not retrieve container logs: ${err.message}`)
    }
  } else {
    hasErrors = true
    reports.push('❌ Backend service is NOT running! Please start the app first.')
  }

  // 4. Return consolidated report
  if (!hasErrors) {
    return 'OK - All systems are healthy! Frontend builds successfully, backend container is running, and no syntax or runtime errors were detected in Python code.'
  }

  return reports.join('\n')
}

function filterFrontendErrors(output: string): string {
  const lines = output.split('\n')
  const relevant: string[] = []
  let isCapturingContext = false

  for (const line of lines) {
    const lower = line.toLowerCase()
    if (
      lower.includes('error') ||
      lower.includes('failed') ||
      lower.includes('exception') ||
      /ts\d+:/.test(line) ||
      /src\/.*\.(tsx?|jsx?)/.test(line)
    ) {
      relevant.push(line)
      isCapturingContext = true
      continue
    }

    if (isCapturingContext) {
      if (/^\s*\d+:/.test(line) || /^\s*~+/.test(line) || line.trim() === '') {
        relevant.push(line)
      } else {
        isCapturingContext = false
      }
    }
  }

  if (relevant.length > 0) {
    return relevant.join('\n')
  }

  return lines
    .filter(l => !l.includes('npm ERR!') && !l.includes('node_modules'))
    .slice(-25)
    .join('\n')
}

function filterAuditSummary(output: string): string {
  const lines = output.split('\n')
  const summary = lines.filter(line =>
    line.toLowerCase().includes('vulnerabilit') ||
    line.toLowerCase().includes('severity') ||
    line.toLowerCase().includes('high') ||
    line.toLowerCase().includes('critical') ||
    line.toLowerCase().includes('found')
  )
  return summary.slice(-5).join('\n')
}

function checkContainerRunning(psOutput: string): boolean {
  try {
    const services = JSON.parse(psOutput)
    const backend = Array.isArray(services)
      ? services.find((s: any) => s.Service === 'backend' || s.Name?.includes('backend'))
      : null
    if (backend) {
      return backend.State === 'running' || backend.Status?.includes('Up')
    }

    // fallback JSON Lines
    const lines = psOutput.trim().split('\n')
    for (const line of lines) {
      try {
        const s = JSON.parse(line)
        if (s.Service === 'backend' || s.Name?.includes('backend')) {
          return s.State === 'running' || s.Status?.includes('Up')
        }
      } catch (_) {}
    }
  } catch (_) {}
  return false
}

function filterBackendRuntimeErrors(logs: string): string | null {
  const lines = logs.split('\n')
  const tracebacks: string[] = []
  let inTraceback = false
  let currentTraceback: string[] = []

  for (const line of lines) {
    if (line.includes('Traceback (most recent call last):') || line.includes('Traceback:')) {
      inTraceback = true
      currentTraceback = [line]
      continue
    }

    if (inTraceback) {
      currentTraceback.push(line)
      if (line.trim() !== '' && !line.startsWith(' ') && !line.includes('File "')) {
        tracebacks.push(currentTraceback.join('\n'))
        inTraceback = false
      }
    } else {
      const lower = line.toLowerCase()
      if (
        lower.includes('exception:') ||
        lower.includes('error:') ||
        lower.includes('failed to')
      ) {
        tracebacks.push(line)
      }
    }
  }

  if (tracebacks.length > 0) {
    return tracebacks.slice(-8).join('\n\n')
  }
  return null
}
