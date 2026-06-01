import { execSync } from 'node:child_process'

export function sqlExecute(projectPath: string, sql: string): string {
  const b64Query = Buffer.from(sql).toString('base64')
  const pythonCode = `
import base64, json
from sqlalchemy import create_engine, text
from database.core import DATABASE_URL
query = base64.b64decode("${b64Query}").decode("utf-8")
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text(query))
    if res.returns_rows:
        rows = [dict(row._mapping) for row in res]
        print(json.dumps(rows, default=str))
    else:
        conn.commit()
        print(json.dumps({"status": "success", "rowcount": res.rowcount}))
`
  const b64Code = Buffer.from(pythonCode.trim()).toString('base64')
  return execSync(`docker compose exec -T backend python -c "$(echo ${b64Code} | base64 -d)"`, {
    cwd: projectPath,
    encoding: 'utf-8',
    timeout: 20000
  }).trim()
}
