# Contributing to Spline Research

First off, thank you for considering contributing! 🎉 We welcome issues, feature requests, and pull requests from everyone.

Please read this document carefully to get started and help us keep contributions smooth and consistent.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)  
2. [How Can I Contribute?](#how-can-i-contribute)  
   - [Reporting Bugs](#reporting-bugs)  
   - [Suggesting Enhancements](#suggesting-enhancements)  
   - [Submitting Pull Requests](#submitting-pull-requests)  
3. [Branch & Commit Guidelines](#branch--commit-guidelines)  
4. [Development Workflow](#development-workflow)  
   - [Setup](#setup)  
   - [Linting & Formatting](#linting--formatting)  
   - [Testing](#testing)  
   - [Building & Running](#building--running)  
5. [Where to Discuss](#where-to-discuss)  
6. [Additional Resources](#additional-resources)  

---

---

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please open an [Issue](https://github.com/mateoltd/spline-research/issues) with:

-  A **clear** and descriptive title.  
-  Steps to reproduce the bug.  
-  Expected vs actual behaviour.  
-  Any relevant screenshots or logs.  
-  Your environment (OS, Node.js version).

### Suggesting Enhancements

Want to propose a new feature or improvement? Open an Issue with:

-  A summary of the idea.  
-  Why it is useful or how it improves the project.  
-  Any mockups, sketches, or links to reference implementations.

### Submitting Pull Requests

1. Fork the repo and create a topic branch:

   ```bash
   git checkout -b feat/your-feature
   ```

2. Make your changes in that branch.  
3. Ensure linting, formatting, and tests pass:

   ```bash
   npm install        # if dependencies changed
   npm run lint
   npm test
   ```

4. Commit your changes following our [Commit Guidelines](#branch--commit-guidelines).  
5. Push to your fork and open a Pull Request against `main`.  
6. Fill in the PR template:

   - What does this change?  
   - Why is this change needed?  
   - How was it tested?  
   - Any additional notes or references.

---

## Branch & Commit Guidelines

### Branch Naming

-  `feat/<short-description>` for new features  
-  `fix/<short-description>` for bug fixes  
-  `docs/<short-description>` for documentation only changes  
-  `test/<short-description>` for adding or updating tests  
-  `refactor/<short-description>` for code changes that neither fixes a bug nor adds a feature  

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
 
[optional body]

[optional footer]
```

-  **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`  
-  **scope**: a noun describing the section (e.g. `parser`, `build`)  
-  **short summary**: max 72 characters  
-  Use the imperative mood (“Add feature” not “Added feature”).  

Example:

```
feat(parser): implement scene-file header parsing

Detailed explanation of what and why…
```

---

## Development Workflow

### Setup

```bash
git clone https://github.com/mateoltd/spline-research.git
cd spline-open-analysis
npm install
```

### Linting & Formatting

-  ESLint + Prettier are configured.  
-  To run lint:

  ```bash
  npm run lint
  ```

-  To auto-fix:

  ```bash
  npm run lint:fix
  ```

### Testing

-  Tests are written with Jest.  
-  To run the full test suite:

  ```bash
  npm test
  ```

-  To run in watch mode:

  ```bash
  npm run test:watch
  ```

### Building & Running

-  Build parsers and demos:

  ```bash
  npm run build
  ```

-  Start local demo server:

  ```bash
  npm start
  ```

-  Open http://localhost:3000 in your browser.

---

## Where to Discuss

-  Use [Issues](https://github.com/mateoltd/spline-research/issues) for:  
  - Bug reports  
  - Feature requests  
-  Use [Discussions](https://github.com/mateoltd/spline-research/discussions) for:  
  - General Q&A  
  - Design and architecture debates  
  - Community topics

---

## Additional Resources

-  [README.md](README.md) – project overview and usage  
-  [LICENSE](LICENSE) – licensing details (MIT)  
-  [Conventional Commits](https://www.conventionalcommits.org/) – commit message spec  
-  [Commitizen](https://github.com/commitizen/cz-cli) – optional CLI for structured commits  

Thank you for improving the project! We look forward to your contributions. 🎉
