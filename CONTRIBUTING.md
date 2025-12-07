# Contributing to StrangerChat

Thank you for your interest in contributing to StrangerChat! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Security](#security)

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- pnpm 10.0.0 (managed via Corepack)
- Git

### Setup

1. **Fork and Clone**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/strangerchat.git
   cd strangerchat
   ```

2. **Enable Corepack**:

   ```bash
   corepack enable
   corepack prepare pnpm@10.0.0 --activate
   ```

3. **Install Dependencies**:

   ```bash
   pnpm install
   ```

4. **Set up Environment Variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Run Development Server**:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-user-profiles`
- `fix/websocket-connection-issue`
- `docs/update-readme`
- `refactor/improve-chat-state`

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile component
fix: resolve WebSocket reconnection issue
docs: update API documentation
style: format code with prettier
refactor: simplify chat state logic
test: add tests for message component
chore: update dependencies
```

Examples:

```bash
git commit -m "feat: add typing indicator to chat"
git commit -m "fix: prevent duplicate friend requests"
git commit -m "docs: add deployment guide"
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always enabled
- **Type Safety**: Avoid `any`, use proper types
- **Interfaces**: Prefer interfaces for object shapes
- **Enums**: Use const enums when possible

```typescript
// Good
interface UserProfile {
  id: string
  name: string
  email: string
}

// Avoid
const user: any = { ... }
```

### React Components

- **Functional Components**: Use function declarations
- **Hooks**: Follow Rules of Hooks
- **Props**: Always define prop types
- **Naming**: PascalCase for components

```typescript
// Good
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```

### Styling

- **Tailwind CSS**: Use utility classes
- **Class Variance Authority (CVA)**: For component variants
- **Responsive**: Mobile-first approach
- **Accessibility**: Include ARIA labels

```typescript
import { cva } from "class-variance-authority"

const buttonVariants = cva("px-4 py-2 rounded-lg", {
  variants: {
    variant: {
      primary: "bg-blue-600 text-white",
      secondary: "bg-gray-200 text-gray-900",
    },
  },
})
```

### File Organization

```
strangerchat/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx
│       ├── Button.stories.tsx
│       └── README.md
├── lib/                    # Core business logic
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Testing

### Unit Tests (Vitest)

- **Coverage**: Aim for >95%
- **File Location**: Co-located with components
- **Naming**: `*.test.ts` or `*.test.tsx`

```typescript
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "./Button"

describe("Button", () => {
  it("renders with label", () => {
    render(<Button label="Click me" onClick={() => {}} />)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })
})
```

Run tests:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### E2E Tests (Playwright)

- **Coverage**: Critical user flows >95%
- **File Location**: `e2e/` directory
- **Naming**: `*.spec.ts`

```typescript
import { test, expect } from "@playwright/test"

test("user can send a message", async ({ page }) => {
  await page.goto("/")
  await page.fill('[data-testid="message-input"]', "Hello!")
  await page.click('[data-testid="send-button"]')
  await expect(page.locator(".chat-message")).toContainText("Hello!")
})
```

Run E2E tests:

```bash
# Run E2E tests
pnpm e2e

# Headless mode (CI)
pnpm e2e:headless

# UI mode (interactive)
pnpm e2e:ui
```

### Testing Best Practices

1. **Test user behavior**, not implementation details
2. **Use semantic queries**: `getByRole`, `getByLabelText`
3. **Avoid brittle tests**: Don't rely on CSS classes
4. **Test edge cases**: Empty states, errors, loading
5. **Mock external dependencies**: APIs, WebSockets

## Submitting Changes

### Pull Request Process

1. **Update from main**:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Ensure all checks pass**:

   ```bash
   pnpm lint          # Linting
   pnpm type-check    # TypeScript
   pnpm test:coverage # Unit tests
   pnpm e2e          # E2E tests
   pnpm build        # Production build
   ```

3. **Create Pull Request**:
   - Clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Add tests for new features

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Code Review

All submissions require review. Reviewers will check:

- Code quality and style
- Test coverage
- Performance impact
- Security considerations
- Documentation completeness

## Security

**Never commit**:

- API keys or secrets
- Personal credentials
- `.env` files
- Sensitive user data

For security vulnerabilities, see [SECURITY.md](./SECURITY.md).

## Development Tools

### Available Scripts

```bash
# Development
pnpm dev                # Start dev server
pnpm build             # Production build
pnpm start             # Start production server

# Code Quality
pnpm lint              # Run ESLint
pnpm format            # Format with Prettier
pnpm format:check      # Check formatting
pnpm type-check        # TypeScript check

# Testing
pnpm test              # Run unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
pnpm e2e               # Run E2E tests

# Analysis
pnpm analyze           # Bundle analysis
pnpm coupling-graph    # Generate dependency graph
```

### Editor Setup

**VS Code** (recommended):

Install extensions:

- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Questions?

- **General Questions**: Open a [GitHub Discussion](https://github.com/sandeep-jaiswar/strangerchat/discussions)
- **Bug Reports**: Create an [Issue](https://github.com/sandeep-jaiswar/strangerchat/issues)
- **Feature Requests**: Open an [Issue](https://github.com/sandeep-jaiswar/strangerchat/issues) with the enhancement label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make StrangerChat better for everyone. We appreciate your time and effort! 🎉
