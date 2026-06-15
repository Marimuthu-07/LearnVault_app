import { User, Topic, Difficulty, Status, AuthResponse, DashboardStats } from "./types";

const API_BASE = "/api";

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("learnvault_token");
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
      
      return data as T;
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // --- Auth API ---
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("learnvault_token", res.token);
    return res;
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    });
    localStorage.setItem("learnvault_token", res.token);
    return res;
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/auth/profile");
  }

  logout(): void {
    localStorage.removeItem("learnvault_token");
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("learnvault_token");
  }

  // --- Topics API ---
  async getTopics(params: {
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
  } = {}): Promise<{ topics: Topic[] }> {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.category) query.append("category", params.category);
    if (params.status) query.append("status", params.status);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    
    const queryString = query.toString();
    const endpoint = `/topics${queryString ? `?${queryString}` : ""}`;
    return this.request<{ topics: Topic[] }>(endpoint);
  }

  async getTopic(id: string): Promise<{ topic: Topic }> {
    return this.request<{ topic: Topic }>(`/topics/${id}`);
  }

  async createTopic(topic: Omit<Topic, "id" | "userId" | "createdAt" | "updatedAt">): Promise<{ topic: Topic }> {
    return this.request<{ topic: Topic }>("/topics", {
      method: "POST",
      body: JSON.stringify(topic)
    });
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<{ topic: Topic }> {
    return this.request<{ topic: Topic }>(`/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
  }

  async deleteTopic(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/topics/${id}`, {
      method: "DELETE"
    });
  }

  // --- Statistics API ---
  async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/stats");
  }
}

export const api = new ApiClient();
