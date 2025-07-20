using System.ComponentModel.DataAnnotations;

namespace PortfolioWebsite.Models
{
    public class ContactFormModel
    {
        [Required(ErrorMessage = "Navn er påkrevd")]
        public string? Name { get; set; }

        [Required(ErrorMessage = "E-post er påkrevd")]
        [EmailAddress(ErrorMessage = "Ugyldig e-postadresse")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Telefonnummer er påkrevd")]
        [Phone(ErrorMessage = "Ugyldig telefonnummer")]
        public string? Phone { get; set; }



        [Required(ErrorMessage = "Melding kan ikke være tom")]
        public string? Message { get; set; }
    }
}
