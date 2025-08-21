// wwwroot/js/contact-form.js 
document.addEventListener("DOMContentLoaded", () => {
    let isSubmitting = false; // 👈 hinder dobbel submit

    function hasValidationErrors(formEl) {
        if (!formEl) return false;
        if (formEl.querySelector(".input-validation-error, .field-validation-error")) return true;
        const errorBits = formEl.querySelectorAll(".text-danger, .validation-summary-errors li");
        for (const el of errorBits) {
            if (el.textContent && el.textContent.trim().length > 0) return true;
        }
        return false;
    }

    function clearValidationState(formEl) {
        if (!formEl) return;
        formEl.querySelectorAll(".text-danger").forEach(n => (n.textContent = ""));
        formEl.querySelectorAll(".input-validation-error").forEach(i => i.classList.remove("input-validation-error"));
        formEl.querySelectorAll(".field-validation-error").forEach(i => i.classList.remove("field-validation-error"));
    }

    // Vis suksess, skjul skjema, “Send en ny melding” blir stående
    function renderConfirmationFallback(formEl, message = "Takk! Meldingen er sendt") {
        const confirmation = document.getElementById("confirmation");
        if (!confirmation || !formEl) return;

        // Skjul skjema (ikke fjern)
        formEl.style.display = "none";

        // ✅ Render premium-markup direkte (matcher CSS/GSAP)
        confirmation.style.display = "flex";
        confirmation.innerHTML = `
  <div class="success-box" role="status" aria-live="polite" aria-atomic="true">
    <div class="success-surface">
      <div class="success-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" class="success-check">
          <path d="M14 24.5 L21.5 32 L34 18"></path>
        </svg>
      </div>
      <div class="success-text">
        <div class="success-headline">Meldingen er sendt</div>
        <div class="success-sub">Takk! Jeg svarer deg så snart som mulig.</div>
      </div>
      <div class="confirmation-actions">
        <button id="contact-new" class="btn btn-primary" type="button">Send en ny melding</button>
      </div>
    </div>
    <div class="success-glow" aria-hidden="true"></div>
  </div>
`;


        // 👉 Trigger premium-GSAP (IKKE dupliser)
        window.dispatchEvent(new CustomEvent("contactConfirmShown"));

        // UX: fokus + «ny melding»
        const newBtn = document.getElementById("contact-new");
        newBtn?.focus();
        newBtn?.addEventListener("click", () => {
            confirmation.style.display = "none";
            // nullstill og vis skjemaet igjen
            formEl.querySelectorAll(".text-danger").forEach(n => (n.textContent = ""));
            formEl.reset();
            formEl.style.display = "";
            formEl.scrollIntoView({ behavior: "smooth", block: "start" });
            formEl.querySelector("[name='Message']")?.focus();
            const sb = formEl.querySelector("button[type='submit']");
            if (sb) { sb.disabled = false; sb.innerHTML = "Send"; }
        });
    }


    function wireContactForm() {
        const form = document.querySelector(".contact-form");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (isSubmitting) return;          // 👈 blokkér spam/dobbel
            isSubmitting = true;

            const submitButton = form.querySelector("button[type='submit']");
            const originalText = submitButton ? submitButton.innerHTML : null;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = "⏳ Sender...";
            }

            const tokenEl = document.querySelector("input[name='__RequestVerificationToken']");
            const antiForgery = tokenEl ? tokenEl.value : null;
            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: formData,
                    headers: antiForgery ? { "RequestVerificationToken": antiForgery } : {}
                });

                const html = await response.text();
                const doc = new DOMParser().parseFromString(html, "text/html");

                const returnedForm = doc.querySelector(".contact-form");
                const returnedAlert = doc.querySelector(".alert, .success-box"); // hvis backend gir noe

                if (returnedForm && hasValidationErrors(returnedForm)) {
                    // ❌ Valideringsfeil: vis serverens form med feil
                    form.outerHTML = returnedForm.outerHTML;
                    wireContactForm(); // re-bind etter DOM-replace
                } else {
                    // ✅ Suksess: vår sticky-bekreftelse (ingen auto-hide)
                    // (Vil du animere: GSAP lytter på 'contactConfirmShown' eller 'formSent' – valgfritt)
                    renderConfirmationFallback(form, "Takk! Meldingen er sendt");
                }

            } catch (err) {
                console.error(err);
                alert("❌ Noe gikk galt! Prøv igjen.");
            } finally {
                if (submitButton && document.body.contains(submitButton)) {
                    submitButton.disabled = false;
                    if (originalText !== null) submitButton.innerHTML = originalText;
                }
                isSubmitting = false; // 👈 slippe gjennom nye forsøk
            }
        });
    }

    wireContactForm();
});
