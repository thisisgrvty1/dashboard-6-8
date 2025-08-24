
# Contribution Guidelines

Thank you for your interest in contributing to the Webhook Chat Dashboard! We welcome contributions from the community to help make this project better.

## How to Contribute

To contribute, please follow these steps:

1.  **Fork the Repository:** Create your own fork of the project on your Git hosting platform.
2.  **Create a Branch:** Create a new branch from `main` in your fork for your feature or bug fix. Use a descriptive name, such as `feat/add-new-theme` or `fix/modal-close-bug`.
3.  **Make Your Changes:** Write your code and make your changes on the new branch.
4.  **Submit a Pull Request:** Push your branch to your fork and open a pull request against the `main` branch of the original repository.

## Development Workflow

-   Ensure you have followed the [Project Setup Guide](./project-setup.md) to get your local environment running.
-   Write clean, readable, and maintainable code.
-   If you add new functionality, please consider if it needs to be documented in the relevant `.md` files in the `/docs` directory.

## Coding Style

Please follow the coding style and patterns already present in the codebase.

-   **TypeScript:** The project uses TypeScript. Please use appropriate types for props, state, and variables.
-   **React:** Use functional components with hooks.
-   **Formatting:** Maintain consistent formatting. While we don't enforce a strict linter at this stage, your code should be clean and easy to read.
-   **Component Structure:** Keep components focused on a single responsibility. If a component becomes too large, break it down into smaller, reusable sub-components.

## Commit Messages

We encourage the use of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for your commit messages. This makes the commit history easier to read and helps with automated tooling in the future.

Each commit message should consist of a **type**, a **scope** (optional), and a **subject**.

**Format:** `type(scope): subject`

**Example Types:**
-   `feat`: A new feature.
-   `fix`: A bug fix.
-   `docs`: Documentation only changes.
-   `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc).
-   `refactor`: A code change that neither fixes a bug nor adds a feature.
-   `chore`: Changes to the build process or auxiliary tools.

**Example Commit Messages:**
```
feat: Add message streaming support in chat view
fix(settings): Ensure API keys are trimmed before saving
docs: Update state management guide with context API section
```

## Pull Request Process

1.  Ensure your pull request has a clear and descriptive title.
2.  In the pull request description, explain the "what" and "why" of your changes. If it resolves an existing issue, please link to it (e.g., `Closes #123`).
3.  Your pull request will be reviewed by a maintainer. You may be asked to make changes before it can be merged.

Thank you for your contribution!
