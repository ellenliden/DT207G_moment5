/**
 * Street Bites Admin - Login Page Logic
 * Hanterar inloggningsformuläret
 */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  // Kontrollera om användare redan är inloggad
  if (authService.isAuthenticated()) {
    window.location.href = "dashboard.html";
    return;
  }

  // Hantera formulärsubmit
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validera input
    if (!email || !password) {
      showError("Vänligen fyll i alla fält");
      return;
    }

    if (!isValidEmail(email)) {
      showError("Vänligen ange en giltig e-postadress");
      return;
    }

    try {
      // Visa laddningsindikator
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Loggar in...";
      submitBtn.disabled = true;

      // Gör login-anrop
      const response = await authService.login(email, password);

      // Lyckad inloggning
      showSuccess("Inloggning lyckades! Omdirigerar...");

      // Omdirigera till dashboard efter kort delay
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      showError(
        error.message || "Inloggning misslyckades. Kontrollera dina uppgifter."
      );
    } finally {
      // Återställ knapp
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  /**
   * Visa felmeddelande
   * @param {string} message - Felmeddelande
   */
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    errorMessage.className = "error-message";

    // Dölj meddelande efter 5 sekunder
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }

  /**
   * Visa framgångsmeddelande
   * @param {string} message - Framgångsmeddelande
   */
  function showSuccess(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    errorMessage.className = "success-message";

    // Dölj meddelande efter 3 sekunder
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 3000);
  }

  /**
   * Validera e-postadress
   * @param {string} email - E-postadress att validera
   * @returns {boolean} - True om giltig
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Lägg till Enter-tangent stöd för formuläret
  document.addEventListener("keypress", function (e) {
    if (
      e.key === "Enter" &&
      !loginForm.querySelector('button[type="submit"]').disabled
    ) {
      loginForm.dispatchEvent(new Event("submit"));
    }
  });
});
