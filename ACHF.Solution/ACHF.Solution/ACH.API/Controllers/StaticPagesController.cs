using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ACH.API.Controllers
{
    public class StaticPagesController : BaseApiController
    {

        [HttpGet("terms")]
        public IActionResult GetTerms()
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/static/terms.json");

            if (!System.IO.File.Exists(path))
                return NotFound("Terms file not found");

            var json = System.IO.File.ReadAllText(path);
            var data = JsonSerializer.Deserialize<object>(json);

            return Ok(data);
        }
        [HttpGet("privacy")]
        public IActionResult GetPrivacy()
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/static/privacy.json");
            var json = System.IO.File.ReadAllText(path);
            return Content(json, "application/json");
        }

    }
}
