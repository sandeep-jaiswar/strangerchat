# StrangerChat — Anonymous Random Chat Application

[![CI](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/ci.yml/badge.svg)](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/ci.yml)
[![Build](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/build.yml/badge.svg)](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/build.yml)
[![Security](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/security.yml/badge.svg)](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/security.yml)
[![E2E Tests](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/e2e.yml/badge.svg)](https://github.com/sandeep-jaiswar/strangerchat/actions/workflows/e2e.yml)

A world-class, professional anonymous chat application built with Next.js, NextAuth, and WebSocket for real-time communication. Connect with random strangers around the world instantly!

## 📋 Table of Contents

- [Features](#-features)
- [Important Notes](#️-important-notes)
- [Getting Started](#-getting-started)
- [Architecture](#️-architecture)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ⚡ Features

- **🎲 Random Matching**: Get paired with available users instantly for one-on-one conversations
- **⚡ Real-time Chat**: Low-latency messaging powered by WebSocket technology
- **🤝 Friend Requests**: Send and accept friend requests to stay connected
- **🔒 Secure Authentication**: Sign in with Google, Email, or GitHub via NextAuth
- **🌐 Global Reach**: Connect with people from anywhere in the world
- **📱 Mobile Friendly**: Responsive design works seamlessly on all devices
- **🎨 Beautiful UI**: Modern, accessible interface with smooth animations

## ⚠️ Important Notes

**In-Memory State**: All data (messages, friend lists, sessions) is stored in server memory only:

- Messages are **not persisted** to any database
- **Message history is lost** when either user disconnects
- **Friend lists are cleared** on server restart
- **Not suitable for production** without adding persistence layer

This architecture is designed for:

- Demonstration and learning purposes
- Low-latency ephemeral conversations
- Privacy-focused temporary chats

## 🚀 Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- pnpm 10.0.0 (managed via Corepack)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sandeep-jaiswar/strangerchat.git
cd strangerchat
```

2. Enable Corepack (ships with Node.js):

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
```

3. Install dependencies:

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required - NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars-long-generate-with-openssl

# Required - Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Required - AdSense (or use placeholder)
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-placeholder
```

#### Generating NextAuth Secret

```bash
openssl rand -base64 32
```

#### Setting up Google OAuth

**Google OAuth**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth**:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### Running the Application

#### Development Mode

```bash
pnpm dev
```

The application will start on `http://localhost:3000` with:

- Next.js app
- WebSocket server on `/api/ws`
- Hot module replacement

#### Production Mode

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Authentication**: NextAuth.js with JWT strategy
- **Real-time Communication**: WebSocket (ws library)
- **State Management**: In-memory singleton (ChatState class)
- **Testing**: Vitest, React Testing Library, Playwright
- **Type Safety**: TypeScript with strict mode
- **UI Components**: Lightweight custom components following Apple HIG (no heavy dependencies)

### Project Structure

```
strangerchat/
├── app/                      # Next.js App Router pages
│   ├── api/auth/            # NextAuth configuration
│   ├── dashboard/           # Authenticated user dashboard
│   ├── random-chat/         # Real-time chat interface
│   ├── friends/             # Friend management
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── Avatar/
│   ├── Button/
│   ├── ChatBubble/
│   ├── MessageComposer/
│   └── ...
├── hooks/                   # Custom React hooks
│   └── useWebSocket.ts     # WebSocket client logic
├── lib/                     # Core business logic
│   ├── chatState.ts        # In-memory state management
│   └── chatState.test.ts   # Unit tests
├── server.ts               # Custom Next.js + WebSocket server
└── types/                  # TypeScript type definitions
```

### WebSocket Message Types

**Client → Server**:

- `register`: Register user connection
- `find_match`: Request random match
- `send_message`: Send chat message
- `typing`: Send typing indicator
- `end_session`: End current chat
- `send_friend_request`: Send friend request
- `accept_friend_request`: Accept friend request
- `reject_friend_request`: Reject friend request

**Server → Client**:

- `registered`: Confirmation with online/available counts
- `waiting`: No match available yet
- `match_found`: Matched with partner
- `message`: Receive chat message
- `message_sent`: Message delivery confirmation
- `partner_typing`: Partner is typing
- `partner_disconnected`: Partner left
- `session_ended`: Chat session ended
- `friend_request_received`: New friend request
- `error`: Error message

## 🧪 Testing

### Unit Tests (Vitest)

Run all unit tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

Run tests with coverage:

```bash
pnpm test:coverage
```

Coverage requirements:
- Unit tests: **>95% coverage**
- All critical business logic must be tested
- Tests run automatically on every push via GitHub Actions

### E2E Tests (Playwright)

Run end-to-end tests:

```bash
pnpm e2e
```

Run in headless mode (CI):

```bash
pnpm e2e:headless
```

Run in UI mode (interactive):

```bash
pnpm e2e:ui
```

Coverage requirements:
- E2E tests: **>95% coverage** of critical user flows
- Tests run automatically on every pull request

## 🔄 CI/CD

### GitHub Actions Workflows

The repository includes comprehensive CI/CD pipelines:

#### **CI Workflow** (`.github/workflows/ci.yml`)
Runs on every push and pull request:
- ESLint code linting
- Prettier formatting check
- TypeScript type checking
- Unit tests with coverage reporting
- Coverage threshold validation (95%)

#### **Build Workflow** (`.github/workflows/build.yml`)
Verifies successful production builds:
- Next.js build compilation
- Bundle size analysis
- Build artifact creation

#### **E2E Tests Workflow** (`.github/workflows/e2e.yml`)
Tests critical user flows:
- Playwright browser tests
- Multi-browser testing (Chromium, Firefox, WebKit)
- Test report generation

#### **Security Workflow** (`.github/workflows/security.yml`)
Automated security scanning:
- CodeQL analysis for vulnerabilities
- Dependency review for known CVEs
- NPM audit for package vulnerabilities
- Runs daily and on every push

#### **Code Quality Workflow** (`.github/workflows/code-quality.yml`)
Code quality checks:
- Bundle size analysis
- Storybook build verification
- Component documentation

### Running Checks Locally

Before pushing, ensure all checks pass:

```bash
# Linting
pnpm lint

# Type checking
pnpm type-check

# Tests
pnpm test:coverage

# E2E tests
pnpm e2e

# Build
pnpm build
```

## 🔒 Security

StrangerChat implements multiple security layers:

### Authentication & Authorization
- **NextAuth.js**: Industry-standard authentication
- **JWT Tokens**: Secure session management
- **OAuth 2.0**: Google and GitHub sign-in
- **CSRF Protection**: Built-in by NextAuth

### Code Security
- **CodeQL Analysis**: Automated vulnerability scanning
- **Dependency Scanning**: Daily security audits
- **TypeScript**: Type safety to prevent common errors
- **Input Validation**: Zod schemas for runtime checks

### Environment Security
- **Environment Variables**: Validated using @t3-oss/env-nextjs
- **Secrets Management**: Never committed to repository
- **.env.example**: Template for required variables

### Security Best Practices
- Regular dependency updates via Renovate Bot
- Security advisories monitoring
- Conventional commit messages for audit trail

### Reporting Security Issues

Please see [SECURITY.md](./SECURITY.md) for information on reporting security vulnerabilities.

**DO NOT** create public issues for security concerns.

## 🚀 Development Best Practices

### Code Quality
- **ESLint**: Enforces code style and catches errors
- **Prettier**: Consistent code formatting
- **TypeScript Strict Mode**: Maximum type safety
- **Conventional Commits**: Standardized commit messages

### Component Development
- **Storybook**: Component playground and documentation
- **CVA**: Consistent component variants
- **Tailwind CSS**: Utility-first styling
- **Accessibility**: WCAG compliance focus

### Available Scripts

```bash
# Development
pnpm dev                # Start dev server
pnpm build             # Production build
pnpm start             # Start production server

# Code Quality
pnpm lint              # Run ESLint
pnpm lint:next         # Run Next.js linting
pnpm format            # Format with Prettier
pnpm format:check      # Check formatting
pnpm type-check        # TypeScript check

# Testing
pnpm test              # Run unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
pnpm e2e               # Run E2E tests
pnpm e2e:headless      # E2E in headless mode
pnpm e2e:ui            # E2E in UI mode

# Documentation
pnpm storybook         # Start Storybook
pnpm build-storybook   # Build Storybook

# Analysis
pnpm analyze           # Bundle analysis
pnpm coupling-graph    # Dependency graph
```

## 📦 Deployment

### Vercel (Recommended for Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sandeep-jaiswar/strangerchat)

**Important**: Vercel's serverless architecture may not be ideal for WebSocket. Consider:

- Using Vercel for the frontend only
- Deploying WebSocket server separately on a platform that supports long-running connections

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Enable Corepack
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose ports
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t strangerchat .
docker run -p 3000:3000 --env-file .env.local strangerchat
```

### Traditional Server (VPS, EC2, etc.)

```bash
# Install Node.js 20+
# Clone repository
git clone https://github.com/sandeep-jaiswar/strangerchat.git
cd strangerchat

# Install dependencies
corepack enable
pnpm install

# Set environment variables
# Copy .env.local with production values

# Build
pnpm build

# Run with PM2 (recommended)
npm install -g pm2
pm2 start pnpm --name strangerchat -- start
pm2 save
pm2 startup
```

## 🔧 Horizontal Scaling Considerations

**Current Limitation**: This application uses in-memory state, which doesn't scale across multiple instances.

### To Scale Horizontally:

1. **Use Sticky Sessions**: Configure your load balancer to route users to the same server:

   ```nginx
   upstream strangerchat {
       ip_hash;
       server server1:3000;
       server server2:3000;
   }
   ```

2. **Implement Redis for State**: Replace in-memory state with Redis:

   - Use Redis Pub/Sub for WebSocket messages
   - Store sessions, friend lists in Redis
   - Use Redis Sets for available users pool

3. **Use External WebSocket Service**: Consider:
   - Socket.io with Redis adapter
   - Pusher
   - Ably
   - AWS AppSync

### Example Redis Integration (Pseudocode)

```typescript
import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL)
const pub = new Redis(process.env.REDIS_URL)
const sub = new Redis(process.env.REDIS_URL)

// Store user sessions
await redis.setex(`user:${userId}:session`, 3600, JSON.stringify(session))

// Publish messages
await pub.publish(`chat:${sessionId}`, JSON.stringify(message))

// Subscribe to messages
sub.subscribe(`chat:${sessionId}`)
sub.on("message", (channel, message) => {
  // Forward to WebSocket client
})
```

## 🎨 Customization

### Themes

Update `tailwind.config.js` to customize colors, fonts, spacing:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#your-color",
      },
    },
  },
}
```

### Adding New Features

1. Update `lib/chatState.ts` for new state management
2. Add WebSocket message handlers in `server.ts`
3. Create/update components in `components/`
4. Add new pages in `app/`
5. Write tests for new functionality

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:

- Development workflow
- Coding standards
- Testing requirements
- Pull request process

Before contributing:
1. Read the [Contributing Guide](./CONTRIBUTING.md)
2. Check [open issues](https://github.com/sandeep-jaiswar/strangerchat/issues)
3. Follow our coding standards
4. Write tests for new features
5. Ensure all CI checks pass

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

Built with:

- [Next.js](https://nextjs.org/) - The React Framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI Components
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Vitest](https://vitest.dev/) - Unit Testing
- [Playwright](https://playwright.dev/) - E2E Testing

---

## 📌 Project Status

**Current Status**: Active Development

This is a demonstration project showcasing best practices for:
- Modern Next.js development
- Real-time WebSocket communication
- Comprehensive testing strategies
- CI/CD automation
- Security-first approach

### For Production Use

Before deploying to production, implement:

- ✅ Database persistence (PostgreSQL/MongoDB)
- ✅ Message history storage
- ✅ Rate limiting middleware
- ✅ Content moderation tools
- ✅ Analytics integration
- ✅ Error tracking (Sentry)
- ✅ Performance monitoring
- ✅ Horizontal scaling with Redis
- ✅ CDN for static assets
- ✅ Load balancing

---

## 📞 Support & Community

- **Documentation**: [GitHub Wiki](https://github.com/sandeep-jaiswar/strangerchat/wiki)
- **Issues**: [GitHub Issues](https://github.com/sandeep-jaiswar/strangerchat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sandeep-jaiswar/strangerchat/discussions)
- **Security**: [SECURITY.md](./SECURITY.md)

---

**Made with ❤️ by the StrangerChat Team**
