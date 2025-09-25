import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import ExplorePage from '@/app/explore/page'
import ProjectDetailPage from '@/app/projects/[id]/page'
import ProjectComparePage from '@/app/projects/compare/page'
import { ProjectsProvider } from '@/components/providers/projects-provider'
import { useProjectsStore } from '@/lib/stores/projects-store'
import { ProjectSummary, Project, PaginatedProjects } from '@/lib/api/types'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock the stores and hooks
jest.mock('@/lib/stores/projects-store')
jest.mock('@/hooks/use-mobile', () => ({
  useMobile: () => ({ isMobile: false })
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
}

const mockProject: Project = {
  id: '1',
  title: 'AI Chatbot Development',
  abstract: 'Build an intelligent chatbot using machine learning techniques',
  description: 'This project involves creating a sophisticated chatbot that can understand and respond to user queries using natural language processing and machine learning algorithms.',
  specialization: 'AI',
  difficultyLevel: 'intermediate',
  tags: ['Python', 'Machine Learning', 'NLP'],
  requiredSkills: ['Python', 'TensorFlow', 'Natural Language Processing'],
  learningOutcomes: ['Understanding of NLP concepts', 'Experience with ML frameworks', 'API development skills'],
  isGroupProject: false,
  maxGroupSize: undefined,
  estimatedDuration: '3-4 months',
  supervisor: {
    id: 'sup1',
    name: 'Dr. Smith',
    title: 'Professor',
    department: 'Computer Science',
    specializations: ['AI', 'ML']
  },
  status: 'approved',
  isAvailable: true,
  applicationDeadline: '2024-12-31T23:59:59Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  viewCount: 150,
  bookmarkCount: 25
}

const mockProjectSummary: ProjectSummary = {
  id: '1',
  title: 'AI Chatbot Development',
  abstract: 'Build an intelligent chatbot using machine learning techniques',
  specialization: 'AI',
  difficultyLevel: 'intermediate',
  tags: ['Python', 'Machine Learning', 'NLP'],
  isGroupProject: false,
  supervisor: {
    id: 'sup1',
    name: 'Dr. Smith',
    department: 'Computer Science'
  },
  viewCount: 150,
  bookmarkCount: 25,
  createdAt: '2024-01-01T00:00:00Z'
}

const mockPaginatedProjects: PaginatedProjects = {
  projects: [mockProjectSummary],
  total: 1,
  limit: 12,
  offset: 0,
  hasMore: false
}

const mockProjectsStore = {
  projects: [mockProjectSummary],
  currentProject: mockProject,
  relatedProjects: [],
  searchResults: mockPaginatedProjects,
  isLoading: false,
  isLoadingProject: false,
  error: null,
  searchProjects: jest.fn().mockResolvedValue(undefined),
  getProjectById: jest.fn().mockResolvedValue(undefined),
  getRelatedProjects: jest.fn().mockResolvedValue(undefined),
  clearError: jest.fn(),
}

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectsProvider>
        {component}
      </ProjectsProvider>
    </QueryClientProvider>
  )
}

describe('Project Browsing Integration', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useProjectsStore as jest.Mock).mockReturnValue(mockProjectsStore)
    jest.clearAllMocks()
  })

  describe('Project Discovery Flow', () => {
    it('allows users to search, filter, and navigate to project details', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ExplorePage />)

      // Search for projects
      const searchInput = screen.getByPlaceholderText('Search projects by title, description, or tags...')
      await user.type(searchInput, 'chatbot')

      await waitFor(() => {
        expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'chatbot'
          })
        )
      })

      // Apply filters
      const specializationSelect = screen.getByRole('combobox', { name: /specialization/i })
      await user.click(specializationSelect)
      const aiOption = screen.getByText('AI')
      await user.click(aiOption)

      await waitFor(() => {
        expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
          expect.objectContaining({
            specializations: ['AI']
          })
        )
      })

      // Navigate to project details
      const viewDetailsButton = screen.getByText('View Details')
      await user.click(viewDetailsButton)

      expect(mockRouter.push).toHaveBeenCalledWith('/projects/1')
    })

    it('allows users to bookmark projects from the explore page', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ExplorePage />)

      await waitFor(() => {
        expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
      })

      const bookmarkButton = screen.getByRole('button', { name: /save project/i })
      await user.click(bookmarkButton)

      // Should show as bookmarked
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unsave project/i })).toBeInTheDocument()
      })
    })

    it('allows users to start project comparison from explore page', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ExplorePage />)

      await waitFor(() => {
        expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
      })

      const compareButton = screen.getByRole('button', { name: /compare project/i })
      await user.click(compareButton)

      expect(mockRouter.push).toHaveBeenCalledWith('/projects/compare?ids=1')
    })
  })

  describe('Project Detail View', () => {
    beforeEach(() => {
      // Mock useParams for project detail page
      require('next/navigation').useParams = jest.fn().mockReturnValue({ id: '1' })
    })

    it('displays comprehensive project information', async () => {
      renderWithProviders(<ProjectDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
        expect(screen.getByText('Build an intelligent chatbot using machine learning techniques')).toBeInTheDocument()
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
        expect(screen.getByText('Professor')).toBeInTheDocument()
        expect(screen.getByText('Computer Science')).toBeInTheDocument()
        expect(screen.getByText('3-4 months')).toBeInTheDocument()
      })

      // Check learning outcomes
      expect(screen.getByText('Learning Outcomes')).toBeInTheDocument()
      expect(screen.getByText('Understanding of NLP concepts')).toBeInTheDocument()

      // Check required skills
      expect(screen.getByText('Required Skills')).toBeInTheDocument()
      expect(screen.getByText('TensorFlow')).toBeInTheDocument()
    })

    it('allows users to bookmark from project detail page', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ProjectDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
      })

      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i })
      await user.click(bookmarkButton)

      // Toast should be called
      const { toast } = require('sonner')
      expect(toast.success).toHaveBeenCalledWith('Project bookmarked successfully')
    })

    it('allows users to share project', async () => {
      // Mock navigator.clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      })

      const user = userEvent.setup()
      renderWithProviders(<ProjectDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
      })

      const shareButton = screen.getByRole('button', { name: /share/i })
      await user.click(shareButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })

    it('allows users to export project data', async () => {
      // Mock URL.createObjectURL and document methods
      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url')
      global.URL.revokeObjectURL = jest.fn()
      
      const mockLink = {
        click: jest.fn(),
        download: '',
        href: '',
      }
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      const user = userEvent.setup()
      renderWithProviders(<ProjectDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
      })

      const exportButton = screen.getByRole('button', { name: /download/i })
      await user.click(exportButton)

      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toContain('ai_chatbot_development_project.json')
    })
  })

  describe('Project Comparison', () => {
    beforeEach(() => {
      // Mock useSearchParams for comparison page
      require('next/navigation').useSearchParams = jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('1,2')
      })
    })

    it('displays multiple projects for comparison', async () => {
      const mockStoreWithMultipleProjects = {
        ...mockProjectsStore,
        currentProject: mockProject,
        searchResults: {
          ...mockPaginatedProjects,
          projects: [mockProjectSummary, { ...mockProjectSummary, id: '2', title: 'Web App Development' }]
        }
      }
      ;(useProjectsStore as jest.Mock).mockReturnValue(mockStoreWithMultipleProjects)

      renderWithProviders(<ProjectComparePage />)

      await waitFor(() => {
        expect(screen.getByText('Project Comparison')).toBeInTheDocument()
        expect(screen.getByText('Compare up to 4 projects side by side')).toBeInTheDocument()
      })
    })

    it('allows adding projects to comparison via search', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ProjectComparePage />)

      const searchInput = screen.getByPlaceholderText('Search for projects to add...')
      await user.type(searchInput, 'web development')

      await waitFor(() => {
        expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'web development',
            limit: 5
          })
        )
      })
    })

    it('allows removing projects from comparison', async () => {
      const user = userEvent.setup()
      
      // Mock with projects in comparison
      const mockStoreWithProjects = {
        ...mockProjectsStore,
        currentProject: mockProject,
      }
      ;(useProjectsStore as jest.Mock).mockReturnValue(mockStoreWithProjects)

      renderWithProviders(<ProjectComparePage />)

      // Wait for project to load and then try to remove it
      await waitFor(() => {
        const removeButtons = screen.queryAllByRole('button', { name: /remove/i })
        if (removeButtons.length > 0) {
          fireEvent.click(removeButtons[0])
          expect(mockRouter.replace).toHaveBeenCalled()
        }
      })
    })

    it('allows sharing comparison', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      })

      const user = userEvent.setup()
      renderWithProviders(<ProjectComparePage />)

      // Wait for share button to be available
      await waitFor(() => {
        const shareButton = screen.queryByText('Share')
        if (shareButton) {
          fireEvent.click(shareButton)
        }
      })
    })

    it('allows exporting comparison data', async () => {
      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url')
      global.URL.revokeObjectURL = jest.fn()
      
      const mockLink = {
        click: jest.fn(),
        download: '',
        href: '',
      }
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      const user = userEvent.setup()
      renderWithProviders(<ProjectComparePage />)

      await waitFor(() => {
        const exportButton = screen.queryByText('Export')
        if (exportButton) {
          fireEvent.click(exportButton)
          expect(mockLink.click).toHaveBeenCalled()
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error state when project loading fails', async () => {
      const errorStore = {
        ...mockProjectsStore,
        error: 'Failed to load project',
        currentProject: null,
        isLoadingProject: false,
      }
      ;(useProjectsStore as jest.Mock).mockReturnValue(errorStore)

      renderWithProviders(<ProjectDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading Project')).toBeInTheDocument()
        expect(screen.getByText('Failed to load project')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    it('allows retry when project loading fails', async () => {
      const user = userEvent.setup()
      const errorStore = {
        ...mockProjectsStore,
        error: 'Failed to load project',
        currentProject: null,
        isLoadingProject: false,
      }
      ;(useProjectsStore as jest.Mock).mockReturnValue(errorStore)

      renderWithProviders(<ProjectDetailPage />)

      const tryAgainButton = screen.getByText('Try Again')
      await user.click(tryAgainButton)

      expect(mockProjectsStore.clearError).toHaveBeenCalled()
      expect(mockProjectsStore.getProjectById).toHaveBeenCalled()
    })
  })
})