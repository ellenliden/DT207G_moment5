/**
 * Street Bites Admin - Dashboard Logic
 * Hanterar admin dashboard med statistik och översikt
 */

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");

  // Kontrollera autentisering
  if (!authService.isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }

  // Hantera logout
  logoutBtn.addEventListener("click", function () {
    if (confirm("Är du säker på att du vill logga ut?")) {
      authService.logout();
    }
  });

  // Ladda dashboard data
  loadDashboardData();

  /**
   * Ladda all dashboard data
   */
  async function loadDashboardData() {
    try {
      // Ladda statistik parallellt
      await Promise.all([
        loadOrderStats(),
        loadMenuStats(),
        loadLocationStats(),
        loadRecentOrders(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showError("Fel vid laddning av dashboard data");
    }
  }

  /**
   * Ladda beställningsstatistik
   */
  async function loadOrderStats() {
    try {
      const orders = await authService.getAllOrders();

      // Räkna totala beställningar
      document.getElementById("totalOrders").textContent = orders.length;

      // Räkna väntande beställningar
      const pendingOrders = orders.filter(
        (order) => order.status === "pending" || order.status === "processing"
      );
      document.getElementById("pendingOrders").textContent =
        pendingOrders.length;
    } catch (error) {
      console.error("Error loading order stats:", error);
      document.getElementById("totalOrders").textContent = "0";
      document.getElementById("pendingOrders").textContent = "0";
    }
  }

  /**
   * Ladda meny-statistik
   */
  async function loadMenuStats() {
    try {
      const menuItems = await authService.getAllMenuItems();
      document.getElementById("totalMenuItems").textContent = menuItems.length;
    } catch (error) {
      console.error("Error loading menu stats:", error);
      document.getElementById("totalMenuItems").textContent = "0";
    }
  }

  /**
   * Ladda plats-statistik
   */
  async function loadLocationStats() {
    try {
      const locations = await authService.getAllLocations();
      const activeLocations = locations.filter((location) => location.isActive);
      document.getElementById("activeLocations").textContent =
        activeLocations.length;
    } catch (error) {
      console.error("Error loading location stats:", error);
      document.getElementById("activeLocations").textContent = "0";
    }
  }

  /**
   * Ladda senaste beställningar
   */
  async function loadRecentOrders() {
    const recentOrdersContainer = document.getElementById("recentOrders");

    try {
      const orders = await authService.getAllOrders();

      // Sortera efter datum (nyaste först) och ta de 5 senaste
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = "<p>Inga beställningar än</p>";
        return;
      }

      // Skapa HTML för beställningar
      recentOrdersContainer.innerHTML = recentOrders
        .map(
          (order) => `
                <div class="order-item">
                    <div class="order-info">
                        <h4>Beställning #${order.orderNumber}</h4>
                        <p>${order.customerName} • ${formatDate(
            order.createdAt
          )}</p>
                        <p>${order.items.length} produkt(er) • ${
            order.totalAmount
          } kr</p>
                    </div>
                    <div class="order-status status-${order.status}">
                        ${getStatusText(order.status)}
                    </div>
                </div>
            `
        )
        .join("");
    } catch (error) {
      console.error("Error loading recent orders:", error);
      recentOrdersContainer.innerHTML =
        "<p>Fel vid laddning av beställningar</p>";
    }
  }

  /**
   * Formatera datum för visning
   * @param {string} dateString - Datum som sträng
   * @returns {string} - Formaterat datum
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Hämta svensk text för status
   * @param {string} status - Status på engelska
   * @returns {string} - Status på svenska
   */
  function getStatusText(status) {
    const statusMap = {
      pending: "Väntande",
      processing: "Tillagas",
      ready: "Redo",
      completed: "Slutförd",
      cancelled: "Avbruten",
    };
    return statusMap[status] || status;
  }

  /**
   * Visa felmeddelande
   * @param {string} message - Felmeddelande
   */
  function showError(message) {
    // Skapa temporärt felmeddelande
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "20px";
    errorDiv.style.right = "20px";
    errorDiv.style.zIndex = "1000";

    document.body.appendChild(errorDiv);

    // Ta bort efter 5 sekunder
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  // Uppdatera dashboard data var 30:e sekund
  setInterval(loadDashboardData, 30000);
});
