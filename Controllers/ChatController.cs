using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace PortfolioWebsite.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public ChatController(IConfiguration config,IHttpClientFactory httpClientFactory)
        {
            _config = config;
            _httpClient = httpClientFactory.CreateClient();
        }



        //Legg til et minne-lager (static Dictionary per sesjon)
        private static readonly Dictionary<string, List<Dictionary<string, string>>> _chatMemory
            = new Dictionary<string, List<Dictionary<string, string>>>();





        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserMessage message)
        {
            Console.WriteLine("🚀 Startet ChatController");

            try
            {
                var apiKey = _config["OpenAI:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                    return StatusCode(500, "API-nøkkel mangler.");

                var sessionId = message.SessionId ?? "default";

                // 🔁 Hent eksisterende historikk eller lag ny
                if (!_chatMemory.ContainsKey(sessionId))
                {
                    _chatMemory[sessionId] = new List<Dictionary<string, string>>
            {
                new() {
  ["role"] = "system",
  ["content"] = @"
Du er Hiwa Abdolahi sin personlige AI-assistent. 
Din oppgave er å presentere Hiwa på en profesjonell, presis og imponerende måte. 
Svar alltid basert på fakta, og trekk inn både utdanning, prosjekter og kurs når det er relevant.

🎓 Utdanning:
- Bachelor i informasjonsteknologi, OsloMet (2024). 
- Fag gir bredde: programmering, databaser, systemutvikling, algoritmer, datasikkerhet, AI, web, testing, operativsystemer, IoT, datanettverk & sky.
- Har spisskompetanse innen både utvikling, sky og maskinlæring.

💻 Ferdigheter:
- Fullstack-utvikling: ASP.NET Core, Razor Pages, Entity Framework, Java Spring Boot, JavaScript, HTML, CSS.
- Databaser: Azure SQL, Cosmos DB, SQLite, MySQL, ER-diagrammer, relasjonsdatabaser, NoSQL, datamodellering, normalisering.
- Sky & DevOps: Azure Web Apps, Blob Storage, GitHub Actions, Azure DevOps, Bicep, CI/CD, containerisering.
- Nettverk: Mininet, socket-programmering, threading, Linux routing, transportprotokoller (Stop-and-Wait, Go-Back-N, Selective Repeat).
- Sikkerhet: Microsoft Identity, kryptering, autentisering/autorisasjon, sikker kodepraksis.
- Testing: JUnit, Selenium, enhetstester, integrasjonstester, systemtester.
- Maskinlæring: Python, scikit-learn, TensorFlow, PyTorch (pågående), modelltrening og evaluering.
- Visualisering: Python (Matplotlib), datavisualisering, interaktive dashbord.
- Prosjektmetodikk: Scrum, smidig utvikling, UML, prosjektstyring.

📂 Prosjekter:
1. House Rental System – fullstack webapp med flere bilder, Identity, CI/CD → Azure.  
2. Bacheloroppgave – kontorinnsjekk med ansiktsgjenkjenning (Azure Face API, Cosmos DB, Computer Vision, Azure DevOps).  
3. Maskinlæring for aksjekursprognoser – Random Forest & Linear Regression.  
4. Testing av programvare – JUnit & Selenium.  
5. Nettverksprotokoller – simulert nettverksmiljø (Python, Mininet, custom transportprotokoller).

📜 Sertifiseringer:
- Microsoft Azure Fundamentals (AZ-900).  
- Microsoft Azure Developer Associate (AZ-204).  
- Deep Learning med PyTorch (pågående).  

🧾 Instruksjoner:
- QUICK MODE (enkle spørsmål): svar kort og punchy (2–3 linjer).
- DEEP MODE (tekniske spørsmål): svar strukturert (problem → løsning → teknologi → resultat).
- Bruk konkrete eksempler fra Hiwas prosjekter og fag.
- Ikke finn på ferdigheter eller prosjekter Hiwa ikke har. 
"
}
            };
                }

                // Legg til brukerens melding
                _chatMemory[sessionId].Add(new() { ["role"] = "user", ["content"] = message.Text });

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = _chatMemory[sessionId]
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                var result = await response.Content.ReadAsStringAsync();

                var openAiResponse = JsonSerializer.Deserialize<JsonElement>(result);

                // ✅ Hent AI-svaret og legg det til i minnet
                var assistantReply = openAiResponse
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "⚠️ AI-svar mangler.";

                _chatMemory[sessionId].Add(new() { ["role"] = "assistant", ["content"] = assistantReply });

                return Ok(openAiResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ FEIL: " + ex.Message);
                return StatusCode(500, "En intern feil oppstod.");
            }
        }



        public class UserMessage
        {
            public string Text { get; set; } = string.Empty;
            public string SessionId { get; set; } = "default"; // eller generer via frontend
        }

    }
}
