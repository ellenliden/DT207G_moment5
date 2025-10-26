/**
 * Menyhantering för Street Bites Admin
 * Hanterar kategorier och maträtter
 */

class MenuManager {
  constructor() {
    this.authService = new AuthService();
    this.currentCategoryId = null;
    this.currentMenuItemId = null;
    this.categories = [];
    this.menuItems = [];

    this.init();
  }

  init() {
    this.checkAuth();
    this.bindEvents();
    this.loadData();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      window.location.href = "index.html";
      return;
    }
  }

  bindEvents() {
    // Kategori-knappar
    document.getElementById("addCategoryBtn").addEventListener("click", () => {
      this.openCategoryModal();
    });

    document
      .getElementById("categoryModalClose")
      .addEventListener("click", () => {
        this.closeCategoryModal();
      });

    document
      .getElementById("categoryCancelBtn")
      .addEventListener("click", () => {
        this.closeCategoryModal();
      });

    document.getElementById("categoryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveCategory();
    });

    // Maträtt-knappar
    document.getElementById("addMenuItemBtn").addEventListener("click", () => {
      this.openMenuItemModal();
    });

    document
      .getElementById("menuItemModalClose")
      .addEventListener("click", () => {
        this.closeMenuItemModal();
      });

    document
      .getElementById("menuItemCancelBtn")
      .addEventListener("click", () => {
        this.closeMenuItemModal();
      });

    document.getElementById("menuItemForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveMenuItem();
    });

    // Logout-knapp
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.authService.logout();
      window.location.href = "index.html";
    });

    // Stäng modal vid klick utanför
    document.getElementById("categoryModal").addEventListener("click", (e) => {
      if (e.target.id === "categoryModal") {
        this.closeCategoryModal();
      }
    });

    document.getElementById("menuItemModal").addEventListener("click", (e) => {
      if (e.target.id === "menuItemModal") {
        this.closeMenuItemModal();
      }
    });
  }

  async loadData() {
    try {
      await Promise.all([this.loadCategories(), this.loadMenuItems()]);
    } catch (error) {
      console.error("Fel vid laddning av data:", error);
      this.showError("Kunde inte ladda meny-data");
    }
  }

  async loadCategories() {
    try {
      this.categories = await this.authService.getAllCategories();
      this.renderCategories();
      this.updateCategorySelect();
    } catch (error) {
      console.error("Fel vid laddning av kategorier:", error);
      this.showError("Kunde inte ladda kategorier");
    }
  }

  async loadMenuItems() {
    try {
      this.menuItems = await this.authService.getAllMenuItems();
      this.renderMenuItems();
    } catch (error) {
      console.error("Fel vid laddning av maträtter:", error);
      this.showError("Kunde inte ladda maträtter");
    }
  }

  renderCategories() {
    const container = document.getElementById("categoriesList");

    if (this.categories.length === 0) {
      container.innerHTML =
        "<p>Inga kategorier än. Lägg till en kategori för att komma igång.</p>";
      return;
    }

    container.innerHTML = this.categories
      .map(
        (category) => `
      <div class="category-card">
        <div class="category-info">
          <h4>${category.name}</h4>
          <p>${category.description || "Ingen beskrivning"}</p>
          <div class="category-meta">
            <span class="status ${category.isActive ? "active" : "inactive"}">
              ${category.isActive ? "Aktiv" : "Inaktiv"}
            </span>
            <span class="display-order">Ordning: ${category.displayOrder}</span>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn btn-sm btn-primary" onclick="menuManager.editCategory('${
            category._id
          }')">
            Redigera
          </button>
          <button class="btn btn-sm btn-danger" onclick="menuManager.deleteCategory('${
            category._id
          }')">
            Ta bort
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  renderMenuItems() {
    const container = document.getElementById("menuItemsList");

    if (this.menuItems.length === 0) {
      container.innerHTML =
        "<p>Inga maträtter än. Lägg till en maträtt för att komma igång.</p>";
      return;
    }

    container.innerHTML = this.menuItems
      .map((item) => {
        const category = this.categories.find(
          (cat) => cat._id === item.categoryId
        );
        return `
        <div class="menu-item-card">
          <div class="menu-item-image">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.name}" />`
                : '<div class="no-image">Ingen bild</div>'
            }
          </div>
          <div class="menu-item-info">
            <h4>${item.name}</h4>
            <p>${item.description || "Ingen beskrivning"}</p>
            <div class="menu-item-meta">
              <span class="price">${item.price} kr</span>
              <span class="category">${
                category ? category.name : "Okänd kategori"
              }</span>
              <span class="prep-time">${item.preparationTime} min</span>
            </div>
            <div class="menu-item-status">
              <span class="status ${
                item.isAvailable ? "available" : "unavailable"
              }">
                ${item.isAvailable ? "Tillgänglig" : "Ej tillgänglig"}
              </span>
              ${
                item.allergens
                  ? `<span class="allergens">Allergener: ${item.allergens}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="menu-item-actions">
            <button class="btn btn-sm btn-primary" onclick="menuManager.editMenuItem('${
              item._id
            }')">
              Redigera
            </button>
            <button class="btn btn-sm btn-danger" onclick="menuManager.deleteMenuItem('${
              item._id
            }')">
              Ta bort
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  updateCategorySelect() {
    const select = document.getElementById("menuItemCategory");
    select.innerHTML =
      '<option value="">Välj kategori...</option>' +
      this.categories
        .filter((cat) => cat.isActive)
        .map(
          (category) =>
            `<option value="${category._id}">${category.name}</option>`
        )
        .join("");
  }

  openCategoryModal(categoryId = null) {
    this.currentCategoryId = categoryId;
    const modal = document.getElementById("categoryModal");
    const title = document.getElementById("categoryModalTitle");
    const form = document.getElementById("categoryForm");

    if (categoryId) {
      const category = this.categories.find((cat) => cat._id === categoryId);
      title.textContent = "Redigera kategori";
      form.name.value = category.name;
      form.description.value = category.description || "";
      form.displayOrder.value = category.displayOrder;
      form.isActive.checked = category.isActive;
    } else {
      title.textContent = "Lägg till kategori";
      form.reset();
      form.displayOrder.value = this.categories.length + 1;
    }

    modal.style.display = "block";
  }

  closeCategoryModal() {
    document.getElementById("categoryModal").style.display = "none";
    this.currentCategoryId = null;
  }

  openMenuItemModal(menuItemId = null) {
    this.currentMenuItemId = menuItemId;
    const modal = document.getElementById("menuItemModal");
    const title = document.getElementById("menuItemModalTitle");
    const form = document.getElementById("menuItemForm");

    if (menuItemId) {
      const item = this.menuItems.find((item) => item._id === menuItemId);
      title.textContent = "Redigera maträtt";
      form.name.value = item.name;
      form.description.value = item.description || "";
      form.price.value = item.price;
      form.categoryId.value = item.categoryId;
      form.image.value = item.image || "";
      form.allergens.value = Array.isArray(item.allergens)
        ? item.allergens.join(", ")
        : item.allergens || "";
      form.preparationTime.value = item.preparationTime;
      form.isAvailable.checked = item.isAvailable;
    } else {
      title.textContent = "Lägg till maträtt";
      form.reset();
      form.preparationTime.value = 15;
    }

    modal.style.display = "block";
  }

  closeMenuItemModal() {
    document.getElementById("menuItemModal").style.display = "none";
    this.currentMenuItemId = null;
  }

  async saveCategory() {
    const form = document.getElementById("categoryForm");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.isActive = form.isActive.checked;

    try {
      if (this.currentCategoryId) {
        await this.authService.updateCategory(this.currentCategoryId, data);
        this.showSuccess("Kategori uppdaterad!");
      } else {
        await this.authService.createCategory(data);
        this.showSuccess("Kategori skapad!");
      }

      this.closeCategoryModal();
      await this.loadData();
    } catch (error) {
      console.error("Fel vid sparande av kategori:", error);
      this.showError("Kunde inte spara kategori");
    }
  }

  async saveMenuItem() {
    const form = document.getElementById("menuItemForm");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.isAvailable = form.isAvailable.checked;
    data.price = parseFloat(data.price);

    // Konvertera allergener från sträng till array och till små bokstäver
    if (data.allergens && data.allergens.trim()) {
      data.allergens = data.allergens
        .split(",")
        .map((allergen) => allergen.trim().toLowerCase())
        .filter((allergen) => allergen);
    } else {
      data.allergens = [];
    }

    // Ta bort tomma bild-URL:er
    if (!data.image || data.image.trim() === "") {
      delete data.image;
    }

    console.log("Sparar maträtt med data:", data);

    try {
      if (this.currentMenuItemId) {
        await this.authService.updateMenuItem(this.currentMenuItemId, data);
        this.showSuccess("Maträtt uppdaterad!");
      } else {
        const result = await this.authService.createMenuItem(data);
        console.log("Maträtt skapad:", result);
        this.showSuccess("Maträtt skapad!");
      }

      this.closeMenuItemModal();
      await this.loadData();
    } catch (error) {
      console.error("Fel vid sparande av maträtt:", error);
      this.showError("Kunde inte spara maträtt: " + error.message);
    }
  }

  async editCategory(categoryId) {
    this.openCategoryModal(categoryId);
  }

  async editMenuItem(menuItemId) {
    this.openMenuItemModal(menuItemId);
  }

  async deleteCategory(categoryId) {
    if (!confirm("Är du säker på att du vill ta bort denna kategori?")) {
      return;
    }

    try {
      await this.authService.deleteCategory(categoryId);
      this.showSuccess("Kategori borttagen!");
      await this.loadData();
    } catch (error) {
      console.error("Fel vid borttagning av kategori:", error);
      this.showError("Kunde inte ta bort kategori");
    }
  }

  async deleteMenuItem(menuItemId) {
    if (!confirm("Är du säker på att du vill ta bort denna maträtt?")) {
      return;
    }

    try {
      await this.authService.deleteMenuItem(menuItemId);
      this.showSuccess("Maträtt borttagen!");
      await this.loadData();
    } catch (error) {
      console.error("Fel vid borttagning av maträtt:", error);
      this.showError("Kunde inte ta bort maträtt");
    }
  }

  showSuccess(message) {
    // Skapa temporär success-meddelande
    const notification = document.createElement("div");
    notification.className = "notification success";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #017963;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showError(message) {
    // Skapa temporärt fel-meddelande
    const notification = document.createElement("div");
    notification.className = "notification error";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialisera när DOM är laddad
let menuManager;
document.addEventListener("DOMContentLoaded", () => {
  menuManager = new MenuManager();
});
