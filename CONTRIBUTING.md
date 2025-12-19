# Contributing to IPL Auction Platform

Thank you for your interest in contributing! This project is a demonstration of Next.js 15 features and modern web development patterns.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/nextjs-demo.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Guidelines

### Code Style

- Follow TypeScript strict mode
- Use ESLint and Prettier (configured)
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Component Guidelines

**Server Components** (default):
```typescript
// ✅ Good: Default Server Component
export default function TeamsList() {
  const teams = getAllTeams(); // Direct DB access
  return <div>{teams.map(...)}</div>;
}
```

**Client Components** (only when needed):
```typescript
// ✅ Good: Client Component with clear reason
'use client'; // Needed for useState, useEffect

export function BidButton() {
  const [loading, setLoading] = useState(false);
  // Interactive component
}
```

### File Structure

```
app/
  [module]/
    components/     # Module-specific components
    actions.ts      # Server Actions
    page.tsx        # Route page
    loading.tsx     # Loading state
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Run type checking
npm run type-check

# Run linter
npm run lint
```

## Pull Request Process

1. Update README.md if adding features
2. Add comments explaining complex logic
3. Ensure no TypeScript errors
4. Update ARCHITECTURE.md for architectural changes
5. Test locally before submitting

## Feature Requests

Open an issue with:
- Clear description
- Use case
- Example implementation (if possible)

## Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment (Node version, OS)

## Questions?

Open a discussion or issue for clarification.

---

**Note**: This is primarily a learning/demonstration project. Major architectural changes should align with the goal of showcasing Next.js 15 features.
