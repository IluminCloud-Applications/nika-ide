---
name: tailwind-css
description: Use Tailwind CSS for all styling in this project. Activate when adding styles, building components, creating layouts, or handling responsive design. Never write plain CSS or inline styles — always use Tailwind utility classes.
---

## Tailwind CSS in this project

This project uses Tailwind CSS v3. Config is in `tailwind.config.js`.

## Core conventions

- Use utility classes only — no custom CSS unless absolutely necessary.
- Responsive: `sm:` `md:` `lg:` `xl:` `2xl:` prefixes (mobile-first).
- Dark mode: configured via `class` strategy — use `dark:` prefix.
- Spacing scale: 0.25rem per unit (4 = 1rem, 8 = 2rem).

## Layout patterns

```tsx
// Flex row centered
<div className="flex items-center justify-between gap-4" />

// Grid 3 cols responsive
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" />

// Full screen centered
<div className="min-h-screen flex items-center justify-center" />
```

## Design tokens (OBRIGATÓRIO — não use cores fixas)

O tema vem 100% de `frontend/src/index.css` (fonte única de verdade). **Nunca** use cores cruas como `bg-zinc-900`, `text-zinc-100`, `bg-black`, `text-white`, `bg-[#09090b]` ou hex arbitrário — elas ignoram o tema e quebram a troca de design. Use **apenas** os tokens semânticos abaixo:

| Função              | Token (classe Tailwind)                                  |
|---------------------|----------------------------------------------------------|
| Fundo da página     | `bg-background` / texto `text-foreground`                |
| Cartão / painel     | `bg-card` / texto `text-card-foreground`                 |
| Menu / popover      | `bg-popover` / texto `text-popover-foreground`           |
| Destaque principal  | `bg-primary` / texto `text-primary-foreground`           |
| Apoio / secundário  | `bg-secondary` / texto `text-secondary-foreground`       |
| Suave / desativado  | `bg-muted` / texto `text-muted-foreground`               |
| Hover / realce      | `bg-accent` / texto `text-accent-foreground`             |
| Erro / perigo       | `bg-destructive` / texto `text-destructive-foreground`   |
| Bordas / inputs     | `border-border`, `border-input`, foco `ring-ring`        |

Para variações de intensidade use o **modificador de opacidade do próprio token** (ex.: `bg-primary/10`, `text-muted-foreground/70`), nunca uma cor nova.

## Typography

```tsx
<h1 className="text-2xl font-bold text-foreground" />
<p className="text-sm text-muted-foreground leading-relaxed" />
<span className="text-xs font-mono text-muted-foreground/70" />
```

## Common patterns in this codebase

- Background: `bg-background`, `bg-card`, `bg-muted`
- Borders: `border border-border`, `border-input`
- Text: `text-foreground` (primary), `text-muted-foreground` (muted), `text-muted-foreground/70` (subtle)
- Rounded: `rounded-lg` (default), `rounded-xl` (cards), `rounded-full` (pills/avatars)
- Transitions: `transition-all duration-200`

## Gotchas

- Use `divide-*` instead of adding borders manually to list items.
- `line-clamp-2` requires `@tailwindcss/line-clamp` plugin (or Tailwind v3.3+).
- Opacity modifier on tokens (`bg-primary/10`) is always valid in Tailwind v3 — prefer it over new colors.
- NÃO edite `frontend/src/index.css`; ele é controlado pelo Estúdio de Design.
- Avoid arbitrary values (`w-[37px]`) unless the design truly requires it; prefer scale values.
