# Contributing to AnimFlow

Thank you for your interest in contributing to AnimFlow! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/tech-blog.git
cd tech-blog

# Install dependencies
npm install

# Build the core library
npm run build -w @animflow/core

# Start the development blog
npm run dev -w blog
```

### Project Structure

```
animflow/
├── packages/
│   ├── core/           # @animflow/core - Main library
│   │   ├── src/
│   │   │   ├── parser/     # YAML/JSON parsing
│   │   │   ├── renderer/   # Canvas rendering
│   │   │   ├── animator/   # Animation engine
│   │   │   └── schema/     # JSON Schema validation
│   │   └── package.json
│   └── playground/     # Development playground
├── blog/               # Example blog site
│   ├── src/
│   │   ├── components/ # Astro/React components
│   │   └── content/    # MDX posts
│   └── package.json
└── tests/              # Test suites
```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/kronenz/tech-blog/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, browser)
   - Minimal reproduction code/YAML if applicable

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions considered
   - Example use cases

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write/update tests if applicable
5. Ensure all tests pass:
   ```bash
   npm run test
   npm run typecheck
   ```
6. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add new animation type"
   ```
7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Keep functions focused and small

### Commit Messages

Follow conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for custom node shapes
fix: resolve animation timing issue on Safari
docs: update API reference for setSpeed method
```

### Testing

- Write tests for new features
- Update tests when modifying existing functionality
- Run the full test suite before submitting PRs:
  ```bash
  npm run test:run
  ```

### Documentation

- Update README.md if adding new features
- Add JSDoc comments to public APIs
- Include example usage in documentation
- Update the blog with examples for major features

## Areas to Contribute

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers.

### Feature Ideas

- New node types (e.g., cylinder, hexagon, cloud)
- Additional animation effects
- Export functionality (SVG, PNG, GIF)
- Accessibility improvements
- Performance optimizations
- Documentation improvements
- Blog post examples

### Core Library (`packages/core`)

- Parser enhancements
- Renderer optimizations
- New animation types
- Schema validation improvements

### Blog (`blog/`)

- New educational posts using AnimFlow
- Component improvements
- Theme enhancements
- SEO optimizations

## Questions?

- Open a [Discussion](https://github.com/kronenz/tech-blog/discussions) for questions
- Check existing documentation and issues first
- Be specific and provide context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AnimFlow!
