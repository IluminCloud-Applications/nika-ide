---
name: react-shadcn
description: Use ShadCN UI components when building React interfaces. Activate when creating forms, dialogs, buttons, tables, dropdowns, cards, or any UI component. Always import from existing ShadCN components rather than building from scratch. Use when the user asks for UI, forms, modals, or any interactive React component.
---

## React + ShadCN in this project

ShadCN components live in `frontend/src/components/ui/`. Always import from there (alias `@/components/ui/...`) — never recreate what already exists.

Esses componentes já consomem os tokens do design system (`bg-card`, `text-foreground`, `border-border`, `bg-primary`, etc.). Ao montar telas, **nunca** sobreponha com cores fixas (`bg-zinc-*`, `text-white`, hex); use os tokens. O tema vem de `frontend/src/index.css` (fonte única de verdade, controlada pelo Estúdio de Design — não edite).

## Import pattern

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
```

## Common components

| Component    | Import path                        | Use for                        |
|--------------|------------------------------------|--------------------------------|
| Button       | `@/components/ui/button`           | All clickable actions          |
| Input        | `@/components/ui/input`            | Text fields                    |
| Dialog       | `@/components/ui/dialog`           | Modals / overlays              |
| Select       | `@/components/ui/select`           | Dropdowns                      |
| Table        | `@/components/ui/table`            | Data tables                    |
| Badge        | `@/components/ui/badge`            | Labels / status chips          |
| Tooltip      | `@/components/ui/tooltip`          | Hover hints                    |
| Tabs         | `@/components/ui/tabs`             | Tabbed navigation              |
| Card         | `@/components/ui/card`             | Content grouping               |
| Separator    | `@/components/ui/separator`        | Dividers                       |

## Button variants

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm" />   // sm | default | lg | icon
```

## Form pattern with react-hook-form

```tsx
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
```

## Gotchas

- Check `frontend/src/components/ui/` before adding a new component via `npx shadcn-ui add`.
- ShadCN components use Radix UI primitives — import compound sub-components from the same file (e.g., `DialogContent` from `dialog`, not a separate file).
- `cn()` utility is in `@/lib/utils` — use it to merge classNames conditionally.
