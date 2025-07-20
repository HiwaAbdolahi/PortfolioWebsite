using Microsoft.AspNetCore.Mvc;
using PortfolioWebsite.Services;
using PortfolioWebsite.Models;

public class HomeController : Controller
{
    private readonly EmailService _email;

    // Konstruktør – henter EmailService via avhengighetsinjeksjon
    public HomeController(EmailService email)
    {
        _email = email;
    }

    // GET: Viser forsiden med kontaktskjemaet (tomt modelobjekt)
    [HttpGet]
    public IActionResult Index()
    {
        return View(new ContactFormModel());
    }

    // POST: Håndterer innsending av kontaktskjemaet
    [HttpPost]
    [ValidateAntiForgeryToken] // Beskytter mot CSRF-angrep
    public async Task<IActionResult> Index(ContactFormModel model)
    {
        // Hvis validering feiler, vis skjemaet igjen med feilmeldinger
        if (!ModelState.IsValid)
            return View(model);

        // Bygg emne og HTML-innhold basert på brukerens innsendte data
        string subject = $"Kontakt fra {model.Name}";
        string body = $@"
            <p><strong>Navn:</strong> {model.Name}</p>
            <p><strong>E-post:</strong> {model.Email}</p>
            <p><strong>Telefon:</strong> {model.Phone}</p>
            <p><strong>Melding:</strong><br/>{model.Message}</p>";

        // Send e-post til deg (verifisert mottaker)
        bool sent = await _email.SendEmailAsync(
            toEmail: "hiwa.abdolahi.dev@gmail.com",  // Din e-postadresse
            subject: subject,
            bodyHtml: body
        );

        // Bruk TempData for å vise tilbakemelding etter redirect
        if (sent)
            TempData["Success"] = "? Takk! Din melding ble sendt.";
        else
            TempData["Error"] = "? Beklager, noe gikk galt. Prøv igjen senere.";

        // Redirect for å unngå dobbel innsending hvis bruker refresher siden
        return RedirectToAction("Index");
    }
}

