using Azure.Communication.Email;
using Azure;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace PortfolioWebsite.Services
{
    public class EmailService
    {
        private readonly string _accessKey;

        public EmailService(IConfiguration config)
        {
            _accessKey = config["AZURE_COMMUNICATION_CONNECTION_STRING"]
                ?? throw new ArgumentNullException("ACS:AccessKey", "Mangler ACS AccessKey i secrets eller config.");
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string bodyHtml)
        {
            var client = new EmailClient(_accessKey);

            var email = new EmailMessage(
                senderAddress: "DoNotReply@739cc7a8-f6f2-4ef3-afb9-a6ea0827f850.azurecomm.net", // Husk: må være verifisert i Azure Communication Services
                content: new EmailContent(subject)
                {
                    Html = bodyHtml
                },
                recipients: new EmailRecipients(new[] { new EmailAddress(toEmail) }));

            try
            {
                await client.SendAsync(WaitUntil.Completed, email);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Feil ved sending: " + ex.Message);
                return false;
            }
          

        }
    }
}
