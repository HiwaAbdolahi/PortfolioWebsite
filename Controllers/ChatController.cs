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
                new() { ["role"] = "system", ["content"] = "Du er Hiwas AI-agent. Svar vennlig, profesjonelt og basert på informasjonen du har." }
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
                    .GetString();

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
