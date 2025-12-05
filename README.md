# StrangerChat — Anonymous Random Chat Application

A world-class, professional anonymous chat application built with Next.js, NextAuth, and WebSocket for real-time communication. Connect with random strangers around the world instantly!

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

Run all tests:

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

Run end-to-end tests:

```bash
pnpm e2e:headless
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

## 🔒 Security Considerations

1. **Rate Limiting**: Implement rate limiting for:

   - Authentication attempts
   - Message sending
   - Friend requests

2. **Input Validation**: Validate all user input on server-side

3. **XSS Prevention**: React handles this automatically, but be careful with `dangerouslySetInnerHTML`

4. **CSRF Protection**: NextAuth includes CSRF protection

5. **Environment Variables**: Never commit `.env.local` to version control

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

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:

- [Next.js](https://nextjs.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Note**: This is a demonstration project. For production use, implement:

- Database persistence
- Message history
- Moderation tools
- Analytics
- Error tracking (Sentry)
- Monitoring (Datadog, New Relic)

A production-ready template for building enterprise applications with Next.js. This boilerplate provides a solid foundation with carefully selected technologies and ready-to-go infrastructure to help you develop high-quality applications efficiently.

## Motivation

While most Next.js boilerplates focus on individual developer needs with excessive complexity, **next-enterprise** prioritizes strategic simplicity for enterprise teams. It offers a streamlined foundation with high-impact features that maximize developer productivity and accelerate time-to-market for business-critical applications.

<a href="https://blazity.com/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/assets/blazity-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="/assets/blazity-logo-light.svg">
  <img alt="Logo" align="right" height="80" src="/assets/blazity-logo-light.svg">
</picture>
</a>

> [!NOTE] > **Blazity** is a group of Next.js architects. We help organizations architect, optimize, and deploy high-performance Next.js applications at scale. Contact us at [contact@blazity.com](https://blazity.com) if you’d like to talk about your project.

## Documentation

There is a separate documentation that explains its functionality, highlights core business values and technical decisions, provides guidelines for future development, and includes architectural diagrams.

We encourage you to [visit our docs (docs.blazity.com)](https://docs.blazity.com) to learn more

## Integrated features

### Boilerplate

With this template you will get all the boilerplate features included:

- [Next.js 15](https://nextjs.org/) - Performance-optimized configuration using App Directory
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework for efficient UI development
- [ESlint 9](https://eslint.org/) and [Prettier](https://prettier.io/) - Code consistency and error prevention
- [Corepack](https://github.com/nodejs/corepack) & [pnpm](https://pnpm.io/) as the package manager - For project management without compromises
- [Strict TypeScript](https://www.typescriptlang.org/) - Enhanced type safety with carefully crafted config and [ts-reset](https://github.com/total-typescript/ts-reset) library
- [GitHub Actions](https://github.com/features/actions) - Pre-configured workflows including bundle size and performance tracking
- Perfect Lighthouse score - Optimized performance metrics
- [Bundle analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) - Monitor and manage bundle size during development
- Testing suite - [Vitest](https://vitest.dev), [React Testing Library](https://testing-library.com/react), and [Playwright](https://playwright.dev/) for comprehensive testing
- [Storybook](https://storybook.js.org/) - Component development and documentation
- Advanced testing - Smoke and acceptance testing capabilities
- [Conventional commits](https://www.conventionalcommits.org/) - Standardized commit history management
- [Observability](https://opentelemetry.io/) - Open Telemetry integration
- [Absolute imports](https://nextjs.org/docs/advanced-features/module-path-aliases) - Simplified import structure
- [Health checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) - Kubernetes-compatible monitoring
- [Radix UI](https://www.radix-ui.com/) - Headless components for customization
- [CVA](http://cva.style/) (Class Variance Authority) - Consistent design system creation
- [Renovate BOT](https://www.whitesourcesoftware.com/free-developer-tools/renovate) - Automated dependency and security updates
- [Patch-package](https://www.npmjs.com/package/patch-package) - External dependency fixes without compromises
- Component relationship tools - Graph for managing coupling and cohesion
- [Semantic Release](https://github.com/semantic-release/semantic-release) - Automated changelog generation
- [T3 Env](https://env.t3.gg/) - Streamlined environment variable management

### Infrastructure & deployments

#### Vercel

Easily deploy your Next.js app with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=github&utm_campaign=next-enterprise) by clicking the button below:

[![Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/Blazity/next-enterprise)

#### Custom cloud infrastructure

**next-enterprise** offers dedicated infrastructure as code (IaC) solutions built with Terraform, designed specifically for deploying Next.js applications based on our extensive experience working with enterprise clients.

Learn more in our [documentation (docs.blazity.com)][docs] how to quickstart with the deployments using simple CLI.

#### Available cloud providers and theirs features:

- **AWS (Amazon Web Services)**
  - Automated provisioning of AWS infrastructure
  - Scalable & secure setup using:
    - VPC - Isolated network infrastructure
    - Elastic Container Service (ECS) - Container orchestration
    - Elastic Container Registry (ECR) - Container image storage
    - Application Load Balancer - Traffic distribution
    - S3 + CloudFront - Static asset delivery and caching
    - AWS WAF - Web Application Firewall protection
    - Redis Cluster - Caching
  - CI/CD ready - Continuous integration and deployment pipeline

_... more coming soon_

### Team & maintenance

**next-enterprise** is backed and maintained by [Blazity](https://blazity.com), providing up to date security features and integrated feature updates.

#### Active maintainers

- Igor Klepacki ([neg4n](https://github.com/neg4n)) - Open Source Software Developer
- Tomasz Czechowski ([tomaszczechowski](https://github.com/tomaszczechowski)) - Solutions Architect & DevOps
- Jakub Jabłoński ([jjablonski-it](https://github.com/jjablonski-it)) - Head of Integrations

#### All-time contributors

[bmstefanski](https://github.com/bmstefanski)

## License

MIT

[docs]: https://docs.blazity.com/next-enterprise/deployments/enterprise-cli
