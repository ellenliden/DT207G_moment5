/**
 * Street Bites Admin - Authentication Service
 * Hanterar autentisering och API-kommunikation
 */

class AuthService {
  constructor() {
    // API base URL - ändra till din backend URL
    this.API_BASE_URL = "http://localhost:3000/api";
    this.token = localStorage.getItem("adminToken");
  }

  /**
   * Logga in admin-användare
   * @param {string} email - E-postadress
   * @param {string} password - Lösenord
   * @returns {Promise<Object>} - Login response
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Inloggning misslyckades");
      }

      // Spara token i localStorage
      this.token = data.token;
      localStorage.setItem("adminToken", data.token);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Logga ut användare
   */
  logout() {
    this.token = null;
    localStorage.removeItem("adminToken");
    window.location.href = "index.html";
  }

  /**
   * Kontrollera om användare är inloggad
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Hämta autentiseringsheader för API-anrop
   * @returns {Object} - Headers med Authorization
   */
  getAuthHeaders() {
    if (!this.token) {
      throw new Error("Ingen autentiseringstoken tillgänglig");
    }

    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Göra autentiserat API-anrop
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - API response
   */
  async authenticatedRequest(endpoint, options = {}) {
    if (!this.isAuthenticated()) {
      throw new Error("Användare inte autentiserad");
    }

    const defaultOptions = {
      headers: this.getAuthHeaders(),
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(
        `${this.API_BASE_URL}${endpoint}`,
        mergedOptions
      );

      if (response.status === 401) {
        // Token är ogiltig, logga ut användaren
        this.logout();
        throw new Error("Sessionen har gått ut. Logga in igen.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API-anrop misslyckades");
      }

      return data;
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  /**
   * Hämta användarprofil
   * @returns {Promise<Object>} - User profile
   */
  async getUserProfile() {
    return this.authenticatedRequest("/protected/profile");
  }

  /**
   * Hämta alla beställningar (admin)
   * @returns {Promise<Array>} - Orders array
   */
  async getAllOrders() {
    return this.authenticatedRequest("/orders");
  }

  /**
   * Hämta alla meny-kategorier (admin)
   * @returns {Promise<Array>} - Categories array
   */
  async getAllCategories() {
    return this.authenticatedRequest("/menu/categories");
  }

  /**
   * Skapa ny meny-kategori (admin)
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Created category
   */
  async createCategory(categoryData) {
    return this.authenticatedRequest("/menu/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * Uppdatera meny-kategori (admin)
   * @param {string} categoryId - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategory(categoryId, categoryData) {
    return this.authenticatedRequest(`/menu/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * Ta bort meny-kategori (admin)
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteCategory(categoryId) {
    return this.authenticatedRequest(`/menu/categories/${categoryId}`, {
      method: "DELETE",
    });
  }

  /**
   * Hämta alla meny-produkter (admin)
   * @returns {Promise<Array>} - Menu items array
   */
  async getAllMenuItems() {
    return this.authenticatedRequest("/menu/items");
  }

  /**
   * Skapa ny meny-produkt (admin)
   * @param {Object} itemData - Menu item data
   * @returns {Promise<Object>} - Created menu item
   */
  async createMenuItem(itemData) {
    return this.authenticatedRequest("/menu/items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  }

  /**
   * Uppdatera meny-produkt (admin)
   * @param {string} itemId - Menu item ID
   * @param {Object} itemData - Updated menu item data
   * @returns {Promise<Object>} - Updated menu item
   */
  async updateMenuItem(itemId, itemData) {
    return this.authenticatedRequest(`/menu/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  }

  /**
   * Ta bort meny-produkt (admin)
   * @param {string} itemId - Menu item ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteMenuItem(itemId) {
    return this.authenticatedRequest(`/menu/items/${itemId}`, {
      method: "DELETE",
    });
  }

  /**
   * Uppdatera beställningsstatus (admin)
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated order
   */
  async updateOrderStatus(orderId, status) {
    return this.authenticatedRequest(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Hämta alla platser (admin)
   * @returns {Promise<Array>} - Locations array
   */
  async getAllLocations() {
    return this.authenticatedRequest("/locations");
  }

  /**
   * Skapa ny plats (admin)
   * @param {Object} locationData - Location data
   * @returns {Promise<Object>} - Created location
   */
  async createLocation(locationData) {
    return this.authenticatedRequest("/locations", {
      method: "POST",
      body: JSON.stringify(locationData),
    });
  }

  /**
   * Uppdatera plats (admin)
   * @param {string} locationId - Location ID
   * @param {Object} locationData - Updated location data
   * @returns {Promise<Object>} - Updated location
   */
  async updateLocation(locationId, locationData) {
    return this.authenticatedRequest(`/locations/${locationId}`, {
      method: "PUT",
      body: JSON.stringify(locationData),
    });
  }

  /**
   * Ta bort plats (admin)
   * @param {string} locationId - Location ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteLocation(locationId) {
    return this.authenticatedRequest(`/locations/${locationId}`, {
      method: "DELETE",
    });
  }
}

// Skapa global instans av AuthService
window.authService = new AuthService();
