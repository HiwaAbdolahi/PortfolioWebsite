using Microsoft.AspNetCore.Mvc;
using PortfolioWebsite.Services;
using PortfolioWebsite.Models;

public class HomeController : Controller
{
    private readonly EmailService _email;

    public HomeController(EmailService email)
    {
        _email = email;
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View(new ContactFormModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Index(ContactFormModel model)
    {
        if (!ModelState.IsValid)
        {
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_ContactForm", model);
            else
                return View(model);
        }

        // ?? Send e-posten i bakgrunnen (ikke blokker bruker)
        Task.Run(async () =>
        {
            string subject = $"Kontakt fra {model.Name}";
            string body = $@"
                <p><strong>Navn:</strong> {model.Name}</p>
                <p><strong>E-post:</strong> {model.Email}</p>
                <p><strong>Telefon:</strong> {model.Phone}</p>
                <p><strong>Melding:</strong><br/>{model.Message}</p>";

            bool sent = await _email.SendEmailAsync(
                toEmail: "hiwa.abdolahi.dev@gmail.com",
                subject: subject,
                bodyHtml: body
            );

            // Du kan evt. logge resultatet her hvis ønskelig
            Console.WriteLine($"?? E-post sendt: {sent}");
        });

        // ? Gi umiddelbar respons til brukeren
        TempData["Success"] = "? Takk! Din melding ble sendt.";

        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView("_ContactForm", new ContactFormModel());
        }
        else
        {
            return RedirectToAction("Index");
        }
    }
}
