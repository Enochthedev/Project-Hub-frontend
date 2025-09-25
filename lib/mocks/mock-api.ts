import { mockProjects, mockUser, mockMilestones } from "./mock-data"

// Simple mock API implementation without MSW
class MockAPI {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async get(url: string, options?: any) {
    await this.delay(500) // Simulate network delay

    if (url.includes("/auth/me")) {
      return { user: mockUser }
    }

    if (url.includes("/projects")) {
      const urlObj = new URL(url, "http://localhost")
      const search = urlObj.searchParams.get("search")
      const category = urlObj.searchParams.get("category")

      let filteredProjects = mockProjects

      if (search) {
        filteredProjects = filteredProjects.filter(
          (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()),
        )
      }

      if (category && category !== "all") {
        filteredProjects = filteredProjects.filter((p) => p.category === category)
      }

      return {
        projects: filteredProjects,
        total: filteredProjects.length,
        page: 1,
        limit: 10,
      }
    }

    if (url.includes("/milestones")) {
      return { milestones: mockMilestones }
    }

    if (url.includes("/health")) {
      return {
        status: "ok",
        message: "Mock API is running",
        timestamp: new Date().toISOString(),
      }
    }

    throw new Error(`Mock API: Unhandled GET request to ${url}`)
  }

  async post(url: string, data?: any, options?: any) {
    await this.delay(500)

    if (url.includes("/auth/login")) {
      return {
        user: mockUser,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      }
    }

    if (url.includes("/auth/register")) {
      return {
        message: "Registration successful. Please verify your email.",
        user: mockUser,
      }
    }

    if (url.includes("/ai/chat")) {
      return {
        response: `This is a mock AI response to: "${data.message}". In a real implementation, this would be powered by your AI service.`,
        conversationId: "mock-conversation-id",
      }
    }

    throw new Error(`Mock API: Unhandled POST request to ${url}`)
  }

  async put(url: string, data?: any, options?: any) {
    await this.delay(500)
    return { success: true, message: "Updated successfully" }
  }

  async patch(url: string, data?: any, options?: any) {
    await this.delay(500)
    return { success: true, message: "Updated successfully" }
  }

  async delete(url: string, options?: any) {
    await this.delay(500)
    return { success: true, message: "Deleted successfully" }
  }

  uploadFile(url: string, file: File, onProgress?: (progress: number) => void) {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (onProgress) onProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          resolve({
            success: true,
            data: { url: "http://example.com/uploaded-file.jpg" },
          })
        }
      }, 100)
    })
  }

  clearCache() {
    // No-op for mock API
  }

  getCacheStats() {
    return { size: 0, keys: [] }
  }

  async healthCheck() {
    try {
      await this.get("/health")
      return true
    } catch {
      return false
    }
  }
}

export const mockApi = new MockAPI()
