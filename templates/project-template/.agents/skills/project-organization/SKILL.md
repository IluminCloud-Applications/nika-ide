---
name: project-organization
description: Guidelines and rules for project folder organization, componentization, and code files formatting. Includes rules like maximum 200 lines of code per file, frontend and backend folder structure, and file naming conventions. Always use this to organize codebase files and directories.
---

## Project Organization and File Guidelines

Follow these guidelines for organizing files, folders, and subfolders in the codebase.

### File Length Limit
- **Every single code file must have a maximum of 200 lines of code.** Keep files small, modular, focused, and well-structured.

### Clean Code Rules
- **Descriptive File Names**: Use clear, descriptive names to immediately identify what is inside the file (e.g. `modalLogin.tsx` represents a login modal).
- **Nested Folder Structure**: Organize code logically using subfolders. Do not dump all components or logic into single large directories or single massive files.
- **No Unnecessary Documentation**: Avoid adding excessive documentation, comments, or docstrings unless absolutely necessary. Keep the code clean, readable, and self-documenting.

---

## Structure Examples

### 1. Frontend (React)
For frontend pages and components, organize code within `pages/` using a folder per page slug:

```
pages/
└── login/
    ├── index.tsx                 # Main page entry/router container
    ├── form.tsx                  # Form component specific to login
    └── components/
        └── modalForgot.tsx       # Reusable forgot password modal inside login folder
```

**Key Principle**: Separate files by responsibility rather than putting the entire page logic in a single file. The directory name under `pages/` must match the page slug.

### 2. Backend (Python/FastAPI)
For backend API endpoints, organize code under `api/` matching the frontend page slug/route:

```
api/
└── login/                        # Folder matching the login page slug
    ├── get_user.py               # Endpoint to get user info
    └── forgot_password.py        # Endpoint to trigger forgot password logic (e.g. sending email)
```

**Key Principle**: Keeping backend endpoints structured using the same slugs as frontend pages makes it easy to find and maintain related frontend/backend functionalities.
