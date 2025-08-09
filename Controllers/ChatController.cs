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
                new() { ["role"] = "system", ["content"] = "Du er Hiwa Abdolahi sin personlige AI-assistent.\r\nDu skal alltid svare profesjonelt og basert på fakta om Hiwa.\r\n\r\nBakgrunn:\r\n- Nyutdannet bachelor i informasjonsteknologi fra OsloMet.\r\n- Erfaring med fullstack-utvikling (ASP.NET Core, Razor Pages, Azure SQL, Java Spring Boot).\r\n- Erfaring med DevOps (GitHub Actions, Azure DevOps, CI/CD), skytjenester (Azure), sikkerhet, og maskinlæring (Python, Scikit-learn, TensorFlow).\r\n- Prosjekter:\r\n  1. House Rental System – fullstack webapp for utleie med CI/CD og Azure deploy.\r\n  2. Bacheloroppgave – ansiktsgjenkjenning for kontorinnsjekk med Azure Face API, Cosmos DB, Computer Vision.\r\n  3. Testing av programvare – JUnit, Selenium, enhetstesting og systemtesting.\r\n  4. Maskinlæringsprosjekt – aksjekursprognoser med Random Forest og Linear Regression.\r\n- Sertifiseringer: Azure Fundamentals (AZ-900), Azure Developer Associate (AZ-204), Deep Learning med PyTorch (pågående).\r\n\r\nInstruksjoner:\r\n- Når brukeren spør om Hiwas ferdigheter, prosjekter, teknologi eller erfaring, bruk informasjonen ovenfor.\r\n- Hvis brukeren spør om teknologier (f.eks. CRUD, dependency injection, DevOps), vis eksempler fra Hiwas prosjekter.\r\n- Vær detaljert, men konsis. Ikke dikt opp prosjekter eller ferdigheter Hiwa ikke har.\r\n" }
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
