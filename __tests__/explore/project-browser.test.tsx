import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ExplorePage from '@/app/explore/page'
import { ProjectsProvider } from '@/components/providers/projects-provider'
import { useProjectsStore } from '@/lib/stores/projects-store'
import { ProjectSummary, PaginatedProjects } from '@/lib/api/types'

// Mock the stores and hooks
jest.mock('@/lib/stores/projects-store')
jest.mock('@/hooks/use-mobile', () => ({
  useMobile: () => ({ isMobile: false })
}))

// Mock project data
const mockProjects: ProjectSummary[] = [
  {
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
  },
  {
    id: '2',
    title: 'Web Application for E-commerce',
    abstract: 'Create a full-stack e-commerce platform with modern web technologies',
    specialization: 'WebDev',
    difficultyLevel: 'advanced',
    tags: ['React', 'Node.js', 'Database'],
    isGroupProject: true,
    supervisor: {
      id: 'sup2',
      name: 'Prof. Johnson',
      department: 'Software Engineering'
    },
    viewCount: 200,
    bookmarkCount: 40,
    createdAt: '2024-01-02T00:00:00Z'
  }
]

const mockPaginatedProjects: PaginatedProjects = {
  projects: mockProjects,
  total: 2,
  limit: 12,
  offset: 0,
  hasMore: false
}

const mockProjectsStore = {
  projects: mockProjects,
  searchResults: mockPaginatedProjects,
  isLoading: false,
  error: null,
  searchProjects: jest.fn(),
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

describe('ExplorePage', () => {
  beforeEach(() => {
    ;(useProjectsStore as jest.Mock).mockReturnValue(mockProjectsStore)
    jest.clearAllMocks()
  })

  it('renders the explore page with projects', async () => {
    renderWithProviders(<ExplorePage />)

    expect(screen.getByText('Explore Projects')).toBeInTheDocument()
    expect(screen.getByText('Browse through our collection of project ideas for students.')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
      expect(screen.getByText('Web Application for E-commerce')).toBeInTheDocument()
    })
  })

  it('displays project count correctly', async () => {
    renderWithProviders(<ExplorePage />)

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 projects')).toBeInTheDocument()
    })
  })

  it('handles search input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExplorePage />)

    const searchInput = screen.getByPlaceholderText('Search projects by title, description, or tags...')
    await user.type(searchInput, 'chatbot')

    await waitFor(() => {
      expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'chatbot'
        })
      )
    }, { timeout: 1000 })
  })

  it('handles specialization filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExplorePage />)

    // Open specialization dropdown
    const specializationSelect = screen.getByRole('combobox', { name: /specialization/i })
    await user.click(specializationSelect)

    // Select AI specialization
    const aiOption = screen.getByText('AI')
    await user.click(aiOption)

    await waitFor(() => {
      expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          specializations: ['AI']
        })
      )
    })
  })

  it('handles difficulty filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExplorePage />)

    // Open difficulty dropdown
    const difficultySelect = screen.getByRole('combobox', { name: /difficulty/i })
    await user.click(difficultySelect)

    // Select intermediate difficulty
    const intermediateOption = screen.getByText('Intermediate')
    await user.click(intermediateOption)

    await waitFor(() => {
      expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          difficultyLevels: ['intermediate']
        })
      )
    })
  })

  it('handles group projects filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExplorePage />)

    const groupProjectsSwitch = screen.getByRole('switch', { name: /group projects only/i })
    await user.click(groupProjectsSwitch)

    await waitFor(() => {
      expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          isGroupProject: true
        })
      )
    })
  })

  it('handles tag selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExplorePage />)

    const pythonTag = screen.getByText('Python')
    await user.click(pythonTag)

    await waitFor(() => {
      expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['Python']
        })
      )
    })
  })

  it('handles sorting options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExplorePage />)

    // Open sort by dropdown
    const sortBySelect = screen.getByRole('combobox', { name: /sort by/i })
    await user.click(sortBySelect)

    // Select popularity
    const popularityOption = screen.getByText('Popularity')
    await user.click(popularityOption)

    await waitFor(() => {
      expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'popularity'
        })
      )
    })
  })

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    
    // Mock store with active filters
    const storeWithFilters = {
      ...mockProjectsStore,
      searchResults: {
        ...mockPaginatedProjects,
        projects: mockProjects.filter(p => p.specialization === 'AI')
      }
    }
    ;(useProjectsStore as jest.Mock).mockReturnValue(storeWithFilters)

    renderWithProviders(<ExplorePage />)

    // Add a filter first
    const pythonTag = screen.getByText('Python')
    await user.click(pythonTag)

    // Wait for clear button to appear
    await waitFor(() => {
      expect(screen.getByText('Clear all filters')).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Clear all filters')
    await user.click(clearButton)

    await waitFor(() => {
      expect(mockProjectsStore.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '',
          specializations: [],
          difficultyLevels: [],
          tags: [],
          isGroupProject: undefined,
          sortBy: 'relevance',
          sortOrder: 'desc'
        })
      )
    })
  })

  it('displays loading state', () => {
    const loadingStore = {
      ...mockProjectsStore,
      isLoading: true,
      searchResults: null
    }
    ;(useProjectsStore as jest.Mock).mockReturnValue(loadingStore)

    renderWithProviders(<ExplorePage />)

    expect(screen.getByText('Loading projects...')).toBeInTheDocument()
    // Should show skeleton loaders
    expect(document.querySelectorAll('[class*="animate-pulse"]')).toHaveLength(6)
  })

  it('displays error state', () => {
    const errorStore = {
      ...mockProjectsStore,
      error: 'Failed to load projects',
      searchResults: null
    }
    ;(useProjectsStore as jest.Mock).mockReturnValue(errorStore)

    renderWithProviders(<ExplorePage />)

    expect(screen.getByText('Error Loading Projects')).toBeInTheDocument()
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('displays no results state', () => {
    const emptyStore = {
      ...mockProjectsStore,
      searchResults: {
        ...mockPaginatedProjects,
        projects: [],
        total: 0
      }
    }
    ;(useProjectsStore as jest.Mock).mockReturnValue(emptyStore)

    renderWithProviders(<ExplorePage />)

    expect(screen.getByText('No projects found')).toBeInTheDocument()
    expect(screen.getByText('No projects are currently available.')).toBeInTheDocument()
  })

  it('displays active filters as badges', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExplorePage />)

    // Add a specialization filter
    const specializationSelect = screen.getByRole('combobox', { name: /specialization/i })
    await user.click(specializationSelect)
    const aiOption = screen.getByText('AI')
    await user.click(aiOption)

    // Add a tag filter
    const pythonTag = screen.getByText('Python')
    await user.click(pythonTag)

    await waitFor(() => {
      // Should show active filter badges
      expect(screen.getByText('AI')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })
})
