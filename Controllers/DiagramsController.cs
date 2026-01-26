using Microsoft.AspNetCore.Mvc;

public class DiagramsController : Controller
{
    [HttpGet("/diagrams")]
    public IActionResult Architecture()
    {
        return View();
    }
}
