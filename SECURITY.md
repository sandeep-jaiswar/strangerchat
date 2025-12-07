# Security Policy

## Supported Versions

We actively maintain and provide security updates for the latest version of StrangerChat.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of StrangerChat seriously. If you discover a security vulnerability, please follow these steps:

### Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues by:

1. **GitHub Security Advisories** (Recommended): 
   - Navigate to the Security tab in the repository
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**: Contact the maintainers directly at the email listed in the repository

### What to Include

Please provide the following information:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
- **Full paths** of source file(s) related to the vulnerability
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours of submission
- **Status Update**: Within 7 days with severity assessment
- **Fix Timeline**: Critical issues within 30 days, others within 90 days

## Security Measures

### Current Implementation

1. **Authentication**: NextAuth.js with secure JWT strategy
2. **Environment Variables**: Validated using @t3-oss/env-nextjs
3. **Dependencies**: Automated security scanning via GitHub Actions
4. **Code Analysis**: CodeQL analysis on every commit
5. **Input Validation**: Zod schemas for runtime type checking
6. **HTTPS**: Enforced in production environments

### Known Limitations

⚠️ **Important**: This application uses in-memory state storage:

- Messages are not persisted to a database
- State is lost on server restart
- Not suitable for production without adding persistence layer
- No rate limiting implemented (should be added for production)

### Best Practices for Deployment

1. **Environment Variables**:
   ```bash
   # Always use strong secrets
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   
   # Never commit .env files
   echo ".env*" >> .gitignore
   ```

2. **Authentication**:
   - Use HTTPS in production
   - Set secure cookie flags
   - Implement CSRF protection (enabled by default in NextAuth)

3. **Rate Limiting**:
   - Add rate limiting middleware for:
     - Authentication attempts
     - Message sending
     - Friend requests
   - Example: Use `express-rate-limit` or similar

4. **Content Security Policy**:
   - Configure CSP headers in `next.config.ts`
   - Restrict script sources
   - Enable XSS protection

5. **Database Security** (when implemented):
   - Use parameterized queries
   - Encrypt sensitive data at rest
   - Regular backups
   - Access control and auditing

## Dependency Management

### Automated Updates

- **Renovate Bot**: Automatically creates PRs for dependency updates
- **Dependabot**: GitHub's security alerts for known vulnerabilities
- **GitHub Actions**: NPM audit runs on every push

### Manual Reviews

Before accepting dependency updates:

1. Review CHANGELOG for breaking changes
2. Check for known security issues
3. Test critical functionality
4. Verify bundle size impact

## Secure Development Guidelines

### Code Review Checklist

- [ ] No secrets in code or config files
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (if database added)
- [ ] XSS prevention (avoid dangerouslySetInnerHTML)
- [ ] CSRF token validation
- [ ] Proper error handling (no sensitive info in errors)
- [ ] Authentication checks on protected routes
- [ ] Authorization checks for resource access

### Testing Security

```bash
# Run security audits
pnpm audit

# Check for outdated dependencies
pnpm outdated

# Run CodeQL analysis (via GitHub Actions)
# See .github/workflows/security.yml
```

## Security Contact

For questions about security, contact the repository maintainers through GitHub Issues (for non-sensitive topics) or via the private disclosure methods above.

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged (with their permission) in our security advisories.
