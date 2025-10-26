/**
 * Navigation och hamburger-meny funktionalitet för Street Bites Admin
 * Hanterar responsiv navigation för mobil och tablet
 *
 */

class NavigationManager {
  constructor() {
    this.hamburgerBtn = document.getElementById("hamburgerBtn");
    this.navMenu = document.getElementById("navMenu");
    this.navOverlay = document.getElementById("navOverlay");
    this.navLinks = document.querySelectorAll(".nav-link");

    this.init();
  }

  init() {
    if (!this.hamburgerBtn || !this.navMenu || !this.navOverlay) {
      console.warn("Navigation elements not found");
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    // Hamburger-knapp klick
    this.hamburgerBtn.addEventListener("click", () => {
      this.toggleMenu();
    });

    // Overlay klick för att stänga meny
    this.navOverlay.addEventListener("click", () => {
      this.closeMenu();
    });

    // Stäng meny när man klickar på navigation-länkar
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMenu();
      });
    });

    // ESC-tangent för att stänga meny
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen()) {
        this.closeMenu();
      }
    });

    // Stäng meny vid window resize (för säkerhets skull)
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && this.isMenuOpen()) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.navMenu.classList.add("nav-menu-open");
    this.hamburgerBtn.classList.add("hamburger-open");
    this.navOverlay.classList.add("active");

    // Förhindra scroll på body när meny är öppen
    document.body.style.overflow = "hidden";
  }

  closeMenu() {
    this.navMenu.classList.remove("nav-menu-open");
    this.hamburgerBtn.classList.remove("hamburger-open");
    this.navOverlay.classList.remove("active");

    // Återställ scroll på body
    document.body.style.overflow = "";
  }

  isMenuOpen() {
    return this.navMenu.classList.contains("nav-menu-open");
  }

  // Publik metod för att stänga meny från andra scripts
  forceClose() {
    this.closeMenu();
  }
}

// Initialisera navigation när DOM är laddad
document.addEventListener("DOMContentLoaded", () => {
  new NavigationManager();
});

// Exportera för användning i andra filer
window.NavigationManager = NavigationManager;
