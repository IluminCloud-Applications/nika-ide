---
name: remix-icons
description: Use Remix Icons (ri-* classes) when adding icons to the UI. Activate when the user asks for icons, icon components, icon packs, or when building UI that would benefit from consistent iconography. Do NOT use lucide-react or heroicons — always prefer Remix Icons in this project.
---

## Remix Icons in this project

Remix Icons is loaded via CDN or npm package (`remixicon`). Use class-based syntax:

```html
<i className="ri-home-line"></i>
<i className="ri-user-fill text-blue-400 text-xl"></i>
```

## Icon naming pattern

- Suffix `-line` → outline version
- Suffix `-fill` → solid/filled version

```tsx
// In React/TSX, use className (not class)
<i className="ri-search-line w-4 h-4" />
```

## Common icon classes

| Purpose        | Line                   | Fill                   |
|----------------|------------------------|------------------------|
| Home           | ri-home-line           | ri-home-fill           |
| User           | ri-user-line           | ri-user-fill           |
| Settings       | ri-settings-3-line     | ri-settings-3-fill     |
| Search         | ri-search-line         | ri-search-fill         |
| Close          | ri-close-line          | ri-close-fill          |
| Menu           | ri-menu-line           | ri-menu-fill           |
| Arrow right    | ri-arrow-right-line    | ri-arrow-right-fill    |
| Check          | ri-check-line          | ri-check-fill          |
| Add / Plus     | ri-add-line            | ri-add-fill            |
| Delete / Trash | ri-delete-bin-line     | ri-delete-bin-fill     |
| Edit / Pencil  | ri-edit-line           | ri-edit-fill           |
| Folder         | ri-folder-line         | ri-folder-fill         |
| File           | ri-file-line           | ri-file-fill           |
| Code           | ri-code-line           | ri-code-fill           |
| Terminal       | ri-terminal-line       | ri-terminal-fill       |
| Cloud          | ri-cloud-line          | ri-cloud-fill          |
| Lock           | ri-lock-line           | ri-lock-fill           |
| Globe          | ri-global-line         | ri-global-fill         |
| Dashboard      | ri-dashboard-line      | ri-dashboard-fill      |

## Size & color

Control size with Tailwind font size or `text-*` classes. Color with `text-*`:

```tsx
<i className="ri-star-fill text-yellow-400 text-2xl" />
```

## Gotchas

- Icons are `<i>` elements (inline) — wrap in a flex container if you need block alignment.
- To find any icon: https://remixicon.com — search by keyword.
- Always prefer `-line` (outline) for UI chrome and `-fill` for emphasis/active states.
- The package is `remixicon`, import CSS with: `import 'remixicon/fonts/remixicon.css'`
