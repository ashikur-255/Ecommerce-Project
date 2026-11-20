namespace EcommerceAPI.Config;

public class EmailSettings
{
    public string FromName { get; set; } = "BDFashions";

    public string FromEmail { get; set; } = "";

    public string Host { get; set; } = "smtp.gmail.com";

    public int Port { get; set; } = 587;

    public string Username { get; set; } = "";

    public string Password { get; set; } = "";

    public bool EnableSsl { get; set; } = true;

    public string? ResendApiKey { get; set; }

    public string? BrevoApiKey { get; set; }
}
