# 🎓 Project Hub - Frontend

A modern, responsive frontend for the Project Hub platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✨ **Core Functionality**
- **Project Discovery** - Browse and search academic projects
- **User Authentication** - Secure login/register with @ui.edu.ng emails
- **Milestone Tracking** - Visual progress tracking and management
- **AI Assistant** - Intelligent project guidance and recommendations
- **Responsive Design** - Mobile-first, PWA-ready interface

### 🎭 **Mock API Mode**
- **Standalone Development** - Run without backend dependencies
- **Realistic Data** - Complete mock API with sample projects
- **Easy Switching** - Toggle between mock and real backend
- **Perfect for Demos** - Reliable offline demonstrations

### 📱 **Progressive Web App**
- **Offline Support** - Works without internet connection
- **Install Prompt** - Add to home screen functionality
- **Service Worker** - Background sync and caching
- **Mobile Optimized** - Touch-friendly interface

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios with caching
- **Mock API**: MSW (Mock Service Worker)
- **Testing**: Jest + React Testing Library
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Enochthedev/Project-Hub-frontend.git
cd Project-Hub-frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Modes

#### 🎭 **Mock API Mode (Recommended for Development)**
```bash
# Run with mock API (no backend needed)
pnpm dev:mock
```

#### 🔗 **Backend Mode**
```bash
# Run with real backend
pnpm dev:backend
```

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Normal development
pnpm dev:mock         # Development with mock API
pnpm dev:backend      # Development with real backend

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage

# Linting
pnpm lint             # Run ESLint
```

## 🎭 Mock API Mode

Perfect for development without backend setup:

### Features
- **Complete API Coverage** - All endpoints mocked
- **Realistic Data** - Sample projects, users, milestones
- **Visual Indicator** - Shows when mock mode is active
- **Easy Configuration** - Environment-based switching

### Usage
```bash
# Quick start with mock API
pnpm dev:mock

# Manual configuration
cp .env.mock .env.local
pnpm dev
```

See [MOCK_MODE_GUIDE.md](./MOCK_MODE_GUIDE.md) for detailed documentation.

## 🔧 Configuration

### Environment Variables

#### Mock Mode (`.env.mock`)
```bash
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### Backend Mode (`.env.development`)
```bash
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Production (`.env.production`)
```bash
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://project-hub-backend.onrender.com
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin dashboard components
│   ├── ai/               # AI assistant components
│   ├── auth/             # Authentication components
│   ├── milestones/       # Milestone components
│   └── providers/        # React context providers
├── lib/                   # Utilities and configurations
│   ├── api/              # API client and endpoints
│   ├── mocks/            # Mock API handlers
│   ├── stores/           # Zustand state stores
│   └── validations/      # Zod validation schemas
├── public/               # Static assets
└── __tests__/            # Test files
```

## 🎨 UI Components

Built with **shadcn/ui** and **Tailwind CSS**:

- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - System preference detection
- **Accessibility** - WCAG 2.1 AA compliant
- **Touch Optimized** - Mobile-friendly interactions

## 🔐 Authentication

- **University Email Only** - @ui.edu.ng domain validation
- **JWT Tokens** - Secure authentication with refresh
- **Role-Based Access** - Student, Supervisor, Admin roles
- **Auto-logout** - Token expiration handling

## 📱 PWA Features

- **Offline Mode** - Works without internet
- **Install Prompt** - Add to home screen
- **Background Sync** - Sync when online
- **Push Notifications** - Real-time updates

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Test Structure
- **Unit Tests** - Component and utility testing
- **Integration Tests** - API and store testing
- **E2E Tests** - Full user workflow testing

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Manual Deployment
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔗 Related Repositories

- **Backend**: [ProjectHub-backend](https://github.com/Enochthedev/ProjectHub-backend)
- **Documentation**: See individual component README files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check component-specific README files
- **Mock API Guide**: [MOCK_MODE_GUIDE.md](./MOCK_MODE_GUIDE.md)
- **Issues**: Create GitHub issues for bugs/features

---

**Built with ❤️ for the University of Ibadan Computer Science Department**