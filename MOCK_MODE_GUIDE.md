# 🎭 Mock Mode Guide - Running Frontend Without Backend

This guide explains how to run the Project Hub frontend in standalone mode without needing the backend server. Perfect for demos, development, and testing!

## 🚀 Quick Start

### Option 1: Mock Mode (Recommended)
```bash
# Run frontend with mock API
pnpm dev:mock
```

### Option 2: Manual Setup
```bash
# Copy mock environment
cp .env.mock .env.local

# Start development server
pnpm dev
```

## 🎯 What Mock Mode Provides

### ✅ **Fully Functional Features:**
- **User Authentication** (login/register/logout)
- **Project Browsing** with search and filters
- **Project Details** with realistic data
- **Milestone Management** with progress tracking
- **AI Assistant** with simulated responses
- **User Profiles** and settings
- **Admin Dashboard** with mock analytics
- **Supervisor Features** with student data

### 🎭 **Mock Data Includes:**
- **Sample Projects** (AI Portal, Library System, etc.)
- **User Profiles** (Students, Supervisors, Admins)
- **Milestones** with various statuses
- **AI Conversations** with realistic responses
- **Analytics Data** for dashboards

## 🔧 Configuration

### Environment Variables
```bash
# .env.mock
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MOCK_DELAY=500        # Response delay (ms)
NEXT_PUBLIC_MOCK_ERROR_RATE=0     # Error simulation (0-1)
```

### Customizing Mock Data
Edit `lib/mocks/handlers.ts` to:
- Add more sample projects
- Modify user profiles
- Customize AI responses
- Add error scenarios

## 🎨 Visual Indicators

When running in mock mode, you'll see:
- **🎭 Mock API Mode** indicator in top-right corner
- Console message: "Mock API initialized"
- All API calls intercepted by MSW

## 📋 Available Scripts

```bash
# Development with backend
pnpm dev:backend

# Development with mock API
pnpm dev:mock

# Normal development (uses .env.local)
pnpm dev

# Build for production
pnpm build

# Run tests with mock API
pnpm test
```

## 🔍 Testing Different Scenarios

### 1. **Authentication Flow**
```javascript
// Login with any @ui.edu.ng email
email: "john@ui.edu.ng"
password: "any-password"
```

### 2. **Project Search**
- Search for "AI", "Library", "Portal"
- Filter by categories
- View project details

### 3. **AI Assistant**
- Ask any question
- Get simulated AI responses
- Test conversation flow

### 4. **Admin Features**
- Access admin dashboard
- View user management
- Check system analytics

## 🛠 Customization Examples

### Adding New Mock Projects
```typescript
// lib/mocks/handlers.ts
const mockProjects = [
  {
    id: '3',
    title: 'Your New Project',
    description: 'Custom project description',
    category: 'Mobile Development',
    tags: ['React Native', 'Firebase'],
    // ... more fields
  }
]
```

### Simulating API Errors
```typescript
// Return error for specific endpoints
http.get('/api/projects/:id', ({ params }) => {
  if (params.id === 'error-test') {
    return new HttpResponse(null, { status: 500 })
  }
  // ... normal response
})
```

### Custom AI Responses
```typescript
http.post('/api/ai/chat', async ({ request }) => {
  const { message } = await request.json()
  
  if (message.includes('help')) {
    return HttpResponse.json({
      response: 'I can help you with project ideas, research, and development guidance!'
    })
  }
  
  // Default response
})
```

## 🎯 Use Cases

### **For Developers:**
- Frontend development without backend setup
- Component testing and styling
- Feature demonstrations
- Rapid prototyping

### **For Designers:**
- UI/UX testing with realistic data
- User flow validation
- Visual design verification
- Responsive design testing

### **For Demos:**
- Client presentations
- Stakeholder reviews
- Feature showcases
- User acceptance testing

### **For Testing:**
- Integration testing
- E2E test development
- Error scenario testing
- Performance testing

## 🔄 Switching Between Modes

### To Backend Mode:
```bash
pnpm dev:backend
# or
cp .env.development .env.local && pnpm dev
```

### To Mock Mode:
```bash
pnpm dev:mock
# or
cp .env.mock .env.local && pnpm dev
```

## 🐛 Troubleshooting

### Mock API Not Working?
1. Check console for MSW initialization
2. Verify `.env.local` has `NEXT_PUBLIC_USE_MOCK_API=true`
3. Clear browser cache and restart dev server

### Missing Mock Data?
1. Check `lib/mocks/handlers.ts` for endpoint coverage
2. Add new handlers for missing endpoints
3. Verify request URLs match handler patterns

### Performance Issues?
1. Reduce `NEXT_PUBLIC_MOCK_DELAY` in `.env.mock`
2. Optimize mock data size
3. Use browser dev tools to identify bottlenecks

## 📚 Technical Details

### How It Works:
1. **MSW (Mock Service Worker)** intercepts network requests
2. **Handlers** return realistic mock data
3. **Environment variables** control mock behavior
4. **Visual indicators** show mock mode status

### File Structure:
```
lib/mocks/
├── handlers.ts          # API endpoint handlers
├── browser.ts          # Browser MSW setup
├── server.ts           # Node.js MSW setup (testing)
└── init.ts             # Initialization utilities

components/providers/
└── mock-api-provider.tsx # React provider for mock API

.env.mock               # Mock mode configuration
.env.development        # Backend mode configuration
```

## 🎉 Benefits

- **⚡ Fast Setup** - No backend installation required
- **🔄 Reliable** - No network dependencies
- **🎨 Flexible** - Easy to customize mock data
- **🧪 Testable** - Perfect for automated testing
- **📱 Portable** - Works offline and anywhere
- **🎭 Realistic** - Simulates real API behavior

---

**Ready to start?** Run `pnpm dev:mock` and explore the full Project Hub experience! 🚀