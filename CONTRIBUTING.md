# Contributing to NextCore ERP

Thank you for your interest in contributing to NextCore ERP! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, etc.)
   - Screenshots or logs if applicable

### Suggesting Features

1. **Check the roadmap** to see if the feature is already planned
2. **Create a feature request issue** with:
   - Clear description of the feature
   - Use cases and benefits
   - Proposed implementation approach
   - Any relevant mockups or examples

### Code Contributions

#### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- Basic knowledge of TypeScript, React, and NestJS
- Familiarity with microservices architecture

#### Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/nextcore-erp.git
cd nextcore-erp

# Install dependencies
pnpm install

# Start development environment
docker-compose up -d

# Start services in development mode
pnpm dev
```

#### Making Changes

1. **Fork the repository** and create a feature branch
2. **Follow coding standards**:
   - Use TypeScript for all new code
   - Follow existing code style and patterns
   - Add appropriate comments and documentation
   - Write tests for new functionality

3. **Commit message format**:
   ```
   type(scope): description
   
   Longer description if needed
   
   Fixes #issue-number
   ```
   
   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   Scopes: `auth`, `crm`, `sales`, `invoicing`, `inventory`, `accounting`, `hrm`, `frontend`, `infra`

4. **Testing**:
   ```bash
   # Run unit tests
   pnpm test
   
   # Run e2e tests
   pnpm test:e2e
   
   # Run linting
   pnpm lint
   ```

5. **Create a pull request**:
   - Use the PR template
   - Link related issues
   - Provide clear description of changes
   - Include screenshots for UI changes

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use strict mode, proper typing
- **ESLint**: Follow configured rules
- **Prettier**: Auto-format code
- **Naming**: Use descriptive, consistent names

### Architecture Principles

- **Microservices**: Keep services independent and focused
- **API-First**: Design APIs before implementation
- **Event-Driven**: Use events for service communication
- **Database Per Service**: Each service owns its data
- **Stateless**: Services should be stateless and scalable

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test service interactions
- **E2E Tests**: Test complete user workflows
- **Load Tests**: Ensure performance requirements

### Documentation

- **Code Comments**: Explain complex logic
- **API Documentation**: Use OpenAPI/Swagger
- **README Updates**: Keep documentation current
- **Architecture Docs**: Document design decisions

## 🏗️ Project Structure

```
nextcore-erp/
├── services/           # Microservices
│   ├── auth-service/   # Authentication
│   ├── crm-service/    # Customer management
│   ├── sales-service/  # Sales operations
│   └── ...
├── frontend/           # React frontend
├── infra/             # Infrastructure configs
├── docs/              # Documentation
├── tests/             # Test suites
└── scripts/           # Utility scripts
```

## 🔄 Development Workflow

### Feature Development

1. **Create issue** describing the feature
2. **Create feature branch** from `main`
3. **Implement feature** following guidelines
4. **Write tests** for new functionality
5. **Update documentation** as needed
6. **Create pull request** for review
7. **Address feedback** and iterate
8. **Merge** after approval

### Bug Fixes

1. **Reproduce the bug** and understand the issue
2. **Create bug fix branch** from `main`
3. **Write test** that reproduces the bug
4. **Fix the bug** ensuring test passes
5. **Create pull request** with fix
6. **Verify fix** in review environment

### Release Process

1. **Version bump** following semantic versioning
2. **Update changelog** with new features and fixes
3. **Create release branch** for final testing
4. **Tag release** and create GitHub release
5. **Deploy to production** using automated pipeline

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and methods
- Mock external dependencies
- Aim for 80%+ code coverage
- Use descriptive test names

```typescript
describe('ContactService', () => {
  it('should create a new contact with valid data', async () => {
    // Test implementation
  });
});
```

### Integration Tests

- Test service interactions
- Use test databases
- Test API endpoints end-to-end
- Verify data persistence

### E2E Tests

- Test complete user workflows
- Use Playwright for browser testing
- Test critical business processes
- Include mobile responsive testing

## 📚 Resources

### Documentation

- [Architecture Overview](./docs/architecture/)
- [API Documentation](./docs/api/)
- [Deployment Guide](./DEPLOYMENT.md)
- [Development Setup](./README.md#development)

### External Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core microservices implementation
- ✅ Basic frontend functionality
- ✅ Kubernetes deployment
- 🔄 Advanced features completion

### Phase 2 (Next)
- 📋 Mobile application
- 📋 Advanced reporting
- 📋 Third-party integrations
- 📋 AI/ML features

### Phase 3 (Future)
- 📋 Multi-language support
- 📋 Advanced workflow engine
- 📋 Marketplace for plugins
- 📋 Enterprise features

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights
- Special badges for significant contributions

## 📞 Getting Help

- **Discord**: Join our development community
- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Email**: Contact maintainers directly

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 📄 License

By contributing to NextCore ERP, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NextCore ERP! Together, we're building the future of enterprise resource planning. 🚀