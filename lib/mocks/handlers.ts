import { http, HttpResponse } from 'msw'

// Mock data
const mockProjects = [
    {
        id: '1',
        title: 'AI-Powered Student Portal',
        description: 'A comprehensive portal for student management with AI features',
        category: 'Web Development',
        tags: ['React', 'AI', 'TypeScript'],
        author: {
            id: '1',
            name: 'John Doe',
            email: 'john@ui.edu.ng',
            role: 'student'
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
        status: 'active',
        githubUrl: 'https://github.com/johndoe/student-portal',
        liveUrl: 'https://student-portal.vercel.app'
    },
    {
        id: '2',
        title: 'Smart Library Management System',
        description: 'Digital library system with book recommendations',
        category: 'Full Stack',
        tags: ['Node.js', 'MongoDB', 'React'],
        author: {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@ui.edu.ng',
            role: 'student'
        },
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-18T12:00:00Z',
        status: 'active',
        githubUrl: 'https://github.com/janesmith/library-system'
    }
]

const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@ui.edu.ng',
    role: 'student',
    isEmailVerified: true,
    profile: {
        department: 'Computer Science',
        level: '400',
        interests: ['AI', 'Web Development', 'Mobile Apps']
    }
}

export const handlers = [
    // Auth endpoints
    http.post('/api/auth/login', () => {
        return HttpResponse.json({
            user: mockUser,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        })
    }),

    http.post('/api/auth/register', () => {
        return HttpResponse.json({
            message: 'Registration successful. Please verify your email.',
            user: mockUser
        })
    }),

    http.get('/api/auth/me', () => {
        return HttpResponse.json({ user: mockUser })
    }),

    // Projects endpoints
    http.get('/api/projects', ({ request }) => {
        const url = new URL(request.url)
        const search = url.searchParams.get('search')
        const category = url.searchParams.get('category')

        let filteredProjects = mockProjects

        if (search) {
            filteredProjects = filteredProjects.filter(p =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            )
        }

        if (category && category !== 'all') {
            filteredProjects = filteredProjects.filter(p => p.category === category)
        }

        return HttpResponse.json({
            projects: filteredProjects,
            total: filteredProjects.length,
            page: 1,
            limit: 10
        })
    }),

    http.get('/api/projects/:id', ({ params }) => {
        const project = mockProjects.find(p => p.id === params.id)
        if (!project) {
            return new HttpResponse(null, { status: 404 })
        }
        return HttpResponse.json({ project })
    }),

    // Milestones endpoints
    http.get('/api/milestones', () => {
        return HttpResponse.json({
            milestones: [
                {
                    id: '1',
                    title: 'Project Proposal',
                    description: 'Submit initial project proposal',
                    dueDate: '2024-02-15T23:59:59Z',
                    status: 'completed',
                    progress: 100
                },
                {
                    id: '2',
                    title: 'Literature Review',
                    description: 'Complete literature review and research',
                    dueDate: '2024-03-01T23:59:59Z',
                    status: 'in_progress',
                    progress: 65
                }
            ]
        })
    }),

    // AI Assistant endpoints
    http.post('/api/ai/chat', async ({ request }) => {
        const { message } = await request.json() as { message: string }

        // Simulate AI response delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        return HttpResponse.json({
            response: `This is a mock AI response to: "${message}". In a real implementation, this would be powered by your AI service.`,
            conversationId: 'mock-conversation-id'
        })
    }),

    // Health check
    http.get('/api/health', () => {
        return HttpResponse.json({
            status: 'ok',
            message: 'Mock API is running',
            timestamp: new Date().toISOString()
        })
    })
]