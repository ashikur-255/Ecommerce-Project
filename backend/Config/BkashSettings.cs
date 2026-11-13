namespace EcommerceAPI.Config;

public class BkashSettings
{
    // Sandbox: https://tokenized.sandbox.bka.sh/v1.2.0-beta
    // Production: https://tokenized.pay.bka.sh/v1.2.0-beta
    public string BaseUrl { get; set; } = string.Empty;

    public string AppKey { get; set; } = string.Empty;
    public string AppSecret { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    // Your API's own public base URL — bKash redirects the customer's browser
    // back to {CallbackBaseUrl}/api/bkash/callback after they pay.
    public string CallbackBaseUrl { get; set; } = string.Empty;

    // Your React app's base URL — where we send the customer after we've
    // finished processing the callback (e.g. http://localhost:5173).
    public string FrontendBaseUrl { get; set; } = string.Empty;
}