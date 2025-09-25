import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectCard } from '@/components/shared/project-card'
import { ProjectsProvider } from '@/components/providers/projects-provider'
import { ProjectSummary } from '@/lib/api/types'

const mockProject: ProjectSummary = {
  id: '1',
  title: 'AI Chatbot Development',
  abstract: 'Build an intelligent chatbot using machine learning techniques and natural language processing to create engaging user interactions.',
  specialization: 'AI',
  difficultyLevel: 'intermediate',
  tags: ['Python', 'Machine Learning', 'NLP', 'TensorFlow', 'React'],
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

const mockGroupProject: ProjectSummary = {
  ...mockProject,
  id: '2',
  title: 'E-commerce Platform',
  isGroupProject: true,
  specialization: 'WebDev',
  difficultyLevel: 'advanced'
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

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    renderWithProviders(<ProjectCard project={mockProject} />)

    expect(screen.getByText('AI Chatbot Development')).toBeInTheDocument()
    expect(screen.getByText(/Build an intelligent chatbot/)).toBeInTheDocument()
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Dr. Smith - Computer Science')).toBeInTheDocument()
    expect(screen.getByText('150 views')).toBeInTheDocument()
    expect(screen.getByText('25 bookmarks')).toBeInTheDocument()
  })

  it('displays group project badge for group projects', () => {
    renderWithProviders(<ProjectCard project={mockGroupProject} />)

    expect(screen.getByText('Group')).toBeInTheDocument()
  })

  it('does not display group project badge for individual projects', () => {
    renderWithProviders(<ProjectCard project={mockProject} />)

    expect(screen.queryByText('Group')).not.toBeInTheDocument()
  })

  it('displays correct specialization colors', () => {
    renderWithProviders(<ProjectCard project={mockProject} />)

    const specializationBadge = screen.getByText('Artificial Intelligence')
    expect(specializationBadge).toHaveClass('bg-purple-50', 'text-purple-700')
  })

  it('displays correct difficulty colors', () => {
    renderWithProviders(<ProjectCard project={mockProject} />)

    const difficultyBadge = screen.getByText('Intermediate')
    expect(difficultyBadge).toHaveClass('bg-yellow-50', 'text-yellow-700')
  })

  it('shows limited tags with overflow indicator', () => {
    renderWithProviders(<ProjectCard project={mockProject} />)

    // Should show first 5 tags
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Machine Learning')).toBeInTheDocument()
    expect(screen.getByText('NLP')).toBeInTheDocument()
    expect(screen.getByText('TensorFlow')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()

    // Should not show overflow indicator since we have exactly 5 tags
    expect(screen.queryByText('+0 more')).not.toBeInTheDocument()
  })

  it('shows overflow indicator for many tags', () => {
    const projectWithManyTags = {
      ...mockProject,
      tags: ['Python', 'ML', 'NLP', 'TensorFlow', 'React', 'Node.js', 'MongoDB']
    }

    renderWithProviders(<ProjectCard project={projectWithManyTags} />)

    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('expands and collapses abstract text', async () => {
    const user = userEvent.setup()
    const longAbstractProject = {
      ...mockProject,
      abstract: 'This is a very long abstract that should be truncated initially and then expanded when the user clicks the show more button. It contains a lot of detailed information about the project.'
    }

    renderWithProviders(<ProjectCard project={longAbstractProject} />)

    // Initially should show truncated text
    expect(screen.getByText(/This is a very long abstract that should be truncated initially/)).toBeInTheDocument()
    expect(screen.getByText('Show More')).toBeInTheDocument()

    // Click show more
    await user.click(screen.getByText('Show More'))

    // Should now show full text
    expect(screen.getByText(/It contains a lot of detailed information about the project/)).toBeInTheDocument()
    expect(screen.getByText('Show Less')).toBeInTheDocument()

    // Click show less
    await user.click(screen.getByText('Show Less'))

    // Should be truncated again
    expect(screen.getByText('Show More')).toBeInTheDocument()
  })

  it('does not show expand/collapse for short abstracts', () => {
    const shortAbstractProject = {
      ...mockProject,
      abstract: 'Short abstract'
    }

    renderWithProviders(<ProjectCard project={shortAbstractProject} />)

    expect(screen.queryByText('Show More')).not.toBeInTheDocument()
    expect(screen.queryByText('Show Less')).not.toBeInTheDocument()
  })

  it('handles bookmark toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectCard project={mockProject} />)

    const bookmarkButton = screen.getByRole('button', { name: /save project/i })
    expect(bookmarkButton).toBeInTheDocument()

    await user.click(bookmarkButton)

    // After clicking, it should show as bookmarked
    expect(screen.getByRole('button', { name: /unsave project/i })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <ProjectCard project={mockProject} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('formats specializations correctly', () => {
    const webDevProject = { ...mockProject, specialization: 'WebDev' }
    renderWithProviders(<ProjectCard project={webDevProject} />)

    expect(screen.getByText('Web Development')).toBeInTheDocument()
  })

  it('handles unknown specializations gracefully', () => {
    const unknownSpecProject = { ...mockProject, specialization: 'UnknownSpec' }
    renderWithProviders(<ProjectCard project={unknownSpecProject} />)

    expect(screen.getByText('UnknownSpec')).toBeInTheDocument()
  })

  it('displays zero stats correctly', () => {
    const noStatsProject = {
      ...mockProject,
      viewCount: 0,
      bookmarkCount: 0
    }

    renderWithProviders(<ProjectCard project={noStatsProject} />)

    expect(screen.getByText('0 views')).toBeInTheDocument()
    expect(screen.getByText('0 bookmarks')).toBeInTheDocument()
  })
})
