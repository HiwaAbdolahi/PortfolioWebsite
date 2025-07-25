// wwwroot/js/contact-form.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-form");
    const submitButton = form.querySelector("button[type='submit']");
    const confirmation = document.getElementById("confirmation");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.innerHTML = "⏳ Sender...";

        const formData = new FormData(form);
        const token = document.querySelector("input[name='__RequestVerificationToken']").value;

        try {
            

            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    "RequestVerificationToken": token
                }
            });

            const html = await response.text();
            const parser = new DOMParser();
            const newDocument = parser.parseFromString(html, "text/html");

            const alert = newDocument.querySelector(".alert");
            const newForm = newDocument.querySelector(".contact-form");

            // Gi beskjed til animasjonsfilen
            window.dispatchEvent(new CustomEvent("formSent", {
                detail: {
                    alertHtml: alert?.outerHTML ?? null,
                    newForm: newForm?.outerHTML ?? null
                }
            }));


            form.remove();
        } catch (err) {
            alert("❌ Noe gikk galt! Prøv igjen.");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = "Send";
        }
    });
});
