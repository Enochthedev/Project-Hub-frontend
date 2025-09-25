import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import RecommendationsPage from '@/app/recommendations/page'
import { ProjectsProvider } from '@/components/providers/projects-provider'
import { AIProvider } from '@/components/providers/ai-provider'
import { recommendationsApi } from '@/lib/api/recommendations'
import { RecommendationResult, Recommendation } from '@/lib/api/types'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock recommendations API
jest.mock('@/lib/api/recommendations')

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
}

const mockRecommendation: Recommendation = {
  projectId: '1',
  title: 'AI Chatbot Development',
  abstract: 'Build an intelligent chatbot using machine learning techniques',
  specialization: 'AI',
  difficultyLevel: 'intermediate',
  similarityScore: 0.85,
  matchingSkills: ['Python', 'Machine Learning', 'NLP'],
  matchingInterests: ['Artificial Intelligence', 'Natural Language Processing'],
  reasoning: 'This project matches your AI interests and Python skills perfectly.',
  supervisor: {
    id: 'sup1',
    name: 'Dr. Smith',
    specialization: 'AI'
  },
  diversityBoost: 0.1
}

const mockRecommendationResult: RecommendationResult = {
  recommendations: [mockRecommendation],
  reasoning: 'Based on your profile, we found projects that match your skills and interests.',
  averageSimilarityScore: 0.85,
  fromCache: false,
  generatedAt: '2024-01-01T00:00:00Z',
  expiresAt: '2024-01-01T01:00:00Z',
  metadata: {
    method: 'ai_enhanced',
    fallback: false,
    projectsAnalyzed: 100,
    cacheHitRate: 0.2,
    processingTimeMs: 1500
  }
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
        <AIProvider>
          {component}
        </AIProvider>
      </ProjectsProvider>
    </QueryClientProvider>
  )
}

describe('RecommendationsPage', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockResolvedValue(mockRecommendationResult)
    ;(recommendationsApi.rateRecommendation as jest.Mock).mockResolvedValue({ message: 'Rating submitted' })
    jest.clearAllMocks()
  })

  it('renders recommendations page with header', async () => {
    renderWithProviders(<RecommendationsPage />)

    expect(screen.getByText('Project Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Personalized project suggestions based on your profile and interests')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('loads and displays recommendations on mount', async () => {
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(recommendationsApi.generateRecommendations).toHaveBeenCalledWith({
        limit: 6,
        forceRefresh: false,
        includeDiversityBoost: true,
      })
    })

    await waitFor(() => {
      expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
      expect(screen.getByText('Build an intelligent chatbot using machine learning techniques')).toBeInTheDocument()
    })
  })

  it('displays recommendation summary correctly', async () => {
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Recommendation Summary')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Projects Found
      expect(screen.getByText('85%')).toBeInTheDocument() // Average Match
      expect(screen.getByText('100')).toBeInTheDocument() // Projects Analyzed
    })
  })

  it('displays similarity score and progress bar', async () => {
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('Match')).toBeInTheDocument()
    })
  })

  it('displays matching skills and interests', async () => {
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Matching Skills')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('Machine Learning')).toBeInTheDocument()
      
      expect(screen.getByText('Matching Interests')).toBeInTheDocument()
      expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument()
    })
  })

  it('displays recommendation reasoning', async () => {
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Why recommended?')).toBeInTheDocument()
      expect(screen.getByText('This project matches your AI interests and Python skills perfectly.')).toBeInTheDocument()
    })
  })

  it('shows diversity boost indicator', async () => {
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Diversity pick • Expands your horizons')).toBeInTheDocument()
    })
  })

  it('handles refresh button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    await user.click(refreshButton)

    expect(recommendationsApi.generateRecommendations).toHaveBeenCalledWith({
      limit: 6,
      forceRefresh: true,
      includeDiversityBoost: true,
    })
  })

  it('handles view project button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('View')).toBeInTheDocument()
    })

    const viewButton = screen.getByText('View')
    await user.click(viewButton)

    expect(mockRouter.push).toHaveBeenCalledWith('/projects/1')
  })

  it('handles bookmark button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      const bookmarkButtons = screen.getAllByRole('button')
      const bookmarkButton = bookmarkButtons.find(button => 
        button.querySelector('svg')?.getAttribute('class')?.includes('h-4 w-4')
      )
      expect(bookmarkButton).toBeInTheDocument()
    })

    // Find bookmark button by its icon
    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i })
    await user.click(bookmarkButton)

    const { toast } = require('sonner')
    expect(toast.success).toHaveBeenCalledWith('Project bookmarked successfully')
  })

  it('handles positive rating', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i })
      expect(thumbsUpButton).toBeInTheDocument()
    })

    const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i })
    await user.click(thumbsUpButton)

    expect(recommendationsApi.rateRecommendation).toHaveBeenCalledWith('1', 'positive')
    
    await waitFor(() => {
      expect(screen.getByText('Thanks for feedback!')).toBeInTheDocument()
    })
  })

  it('handles negative rating', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      const thumbsDownButton = screen.getByRole('button', { name: /thumbs down/i })
      expect(thumbsDownButton).toBeInTheDocument()
    })

    const thumbsDownButton = screen.getByRole('button', { name: /thumbs down/i })
    await user.click(thumbsDownButton)

    expect(recommendationsApi.rateRecommendation).toHaveBeenCalledWith('1', 'negative')
  })

  it('displays loading state', () => {
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    renderWithProviders(<RecommendationsPage />)

    // Should show skeleton loaders
    expect(document.querySelectorAll('[class*="animate-pulse"]')).toHaveLength(6)
  })

  it('displays error state', async () => {
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockRejectedValue(
      new Error('Failed to load recommendations')
    )

    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Recommendations')).toBeInTheDocument()
      expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  it('handles error retry', async () => {
    const user = userEvent.setup()
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockRejectedValue(
      new Error('Failed to load recommendations')
    )

    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    // Reset mock to succeed on retry
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockResolvedValue(mockRecommendationResult)

    const tryAgainButton = screen.getByText('Try Again')
    await user.click(tryAgainButton)

    expect(recommendationsApi.generateRecommendations).toHaveBeenCalledTimes(2)
  })

  it('displays no recommendations state', async () => {
    const emptyResult = {
      ...mockRecommendationResult,
      recommendations: []
    }
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockResolvedValue(emptyResult)

    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('No Recommendations Available')).toBeInTheDocument()
      expect(screen.getByText('Complete your profile to get personalized project recommendations.')).toBeInTheDocument()
      expect(screen.getByText('Complete Profile')).toBeInTheDocument()
    })
  })

  it('handles complete profile button click', async () => {
    const user = userEvent.setup()
    const emptyResult = {
      ...mockRecommendationResult,
      recommendations: []
    }
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockResolvedValue(emptyResult)

    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Profile')).toBeInTheDocument()
    })

    const completeProfileButton = screen.getByText('Complete Profile')
    await user.click(completeProfileButton)

    expect(mockRouter.push).toHaveBeenCalledWith('/profile')
  })

  it('displays cached results indicator', async () => {
    const cachedResult = {
      ...mockRecommendationResult,
      fromCache: true
    }
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockResolvedValue(cachedResult)

    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Cached results/)).toBeInTheDocument()
    })
  })

  it('handles rating API error gracefully', async () => {
    const user = userEvent.setup()
    ;(recommendationsApi.rateRecommendation as jest.Mock).mockRejectedValue(
      new Error('Rating failed')
    )

    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i })
      expect(thumbsUpButton).toBeInTheDocument()
    })

    const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i })
    await user.click(thumbsUpButton)

    const { toast } = require('sonner')
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to submit rating')
    })
  })

  it('displays correct similarity score colors', async () => {
    const highScoreRecommendation = {
      ...mockRecommendation,
      similarityScore: 0.9
    }
    const highScoreResult = {
      ...mockRecommendationResult,
      recommendations: [highScoreRecommendation]
    }
    ;(recommendationsApi.generateRecommendations as jest.Mock).mockResolvedValue(highScoreResult)

    renderWithProviders(<RecommendationsPage />)

    await waitFor(() => {
      const scoreElement = screen.getByText('90%')
      expect(scoreElement).toHaveClass('text-green-600')
    })
  })
})
