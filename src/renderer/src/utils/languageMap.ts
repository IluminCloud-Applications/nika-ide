const EXT_LANGUAGE_MAP: Record<string, string> = {
  ts:     'typescript',
  tsx:    'typescript',
  js:     'javascript',
  jsx:    'javascript',
  py:     'python',
  json:   'json',
  md:     'markdown',
  mdx:    'markdown',
  css:    'css',
  scss:   'scss',
  sass:   'scss',
  html:   'xml',
  xml:    'xml',
  svg:    'xml',
  yaml:   'yaml',
  yml:    'yaml',
  toml:   'ini',
  sh:     'bash',
  bash:   'bash',
  zsh:    'bash',
  sql:    'sql',
  rs:     'rust',
  go:     'go',
  java:   'java',
  c:      'c',
  cpp:    'cpp',
  h:      'cpp',
  rb:     'ruby',
  php:    'php',
  swift:  'swift',
  kt:     'kotlin',
  dart:   'dart',
  vue:    'xml',
  dockerfile: 'dockerfile',
  env:    'ini',
  ini:    'ini',
  conf:   'ini',
  txt:    'text',
}

const FILENAME_LANGUAGE_MAP: Record<string, string> = {
  'Dockerfile':         'dockerfile',
  'docker-compose.yml': 'yaml',
  '.gitignore':         'text',
  '.env':               'ini',
  'Makefile':           'makefile',
  'GEMINI.md':          'markdown',
  'CLAUDE.md':          'markdown',
}

export function getLanguageFromFilename(filename: string): string {
  const special = FILENAME_LANGUAGE_MAP[filename]
  if (special) return special

  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return EXT_LANGUAGE_MAP[ext] ?? 'text'
}
