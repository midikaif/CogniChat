# Contributing to CogniChat

First off, thanks for taking the time to contribute! ❤️

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the JavaScript/React styleguides
- End all files with a newline
- Avoid platform-dependent code

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/React Styleguide

- Use ES6+ features
- Use meaningful variable names
- Add comments for complex logic
- Follow the existing code style
- Use functional components with hooks
- Prop validation using PropTypes or TypeScript

### Backend Node.js Styleguide

- Use const/let instead of var
- Use async/await over promises
- Add error handling to all async functions
- Follow REST API conventions

## Development Setup

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature
4. Make your changes
5. Commit with meaningful messages
6. Push to your fork
7. Create a Pull Request

## Testing

Before submitting a pull request, test your changes:

### Frontend

```bash
cd Frontend
npm run lint
npm run build
```

### Backend

```bash
cd Backend
npm test
```

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed

## Recognition

Contributors will be recognized in the project's README.

Thank you for contributing to CogniChat! 🎉
