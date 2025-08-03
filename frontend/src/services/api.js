const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // User authentication methods
  async login(credentials) {
    return this.makeRequest("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    const formData = new FormData();

    // Add text fields
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);

    // Add avatar file if provided
    if (userData.avatar) {
      formData.append("avatar", userData.avatar);
    }

    return this.makeRequest("/users/register", {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async logout() {
    return this.makeRequest("/users/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.makeRequest("/users/current-user", {
      method: "GET",
    });
  }

  async refreshToken() {
    return this.makeRequest("/users/refresh-token", {
      method: "POST",
    });
  }

  async changePassword(passwords) {
    return this.makeRequest("/users/change-password", {
      method: "PATCH",
      body: JSON.stringify(passwords),
    });
  }

  async updateAvatar(avatarFile) {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    return this.makeRequest("/users/update-avatar", {
      method: "PATCH",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest("/health", {
      method: "GET",
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
