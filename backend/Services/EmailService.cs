using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EcommerceAPI.Config;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace EcommerceAPI.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public EmailService(
        IOptions<EmailSettings> options,
        ILogger<EmailService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _settings = options.Value;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody)
    {
        // ── 1. Priority: HTTP API (Resend) ──────────────────────────────────
        // Bypasses cloud port blocks (Render/AWS/DigitalOcean block ports 25, 465, 587 on free tiers)
        var resendKey = !string.IsNullOrWhiteSpace(_settings.ResendApiKey)
            ? _settings.ResendApiKey
            : Environment.GetEnvironmentVariable("RESEND_API_KEY") 
              ?? Environment.GetEnvironmentVariable("Email__ResendApiKey");

        if (!string.IsNullOrWhiteSpace(resendKey))
        {
            try
            {
                _logger.LogInformation($"Sending email to {toEmail} via Resend HTTPS API...");
                await SendViaResendAsync(resendKey, toEmail, subject, htmlBody);
                _logger.LogInformation($"Email sent successfully to {toEmail} via Resend.");
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send email via Resend API. Attempting fallback...");
            }
        }

        // ── 2. Brevo HTTPS API ──────────────────────────────────────────────
        var brevoKey = !string.IsNullOrWhiteSpace(_settings.BrevoApiKey)
            ? _settings.BrevoApiKey
            : Environment.GetEnvironmentVariable("BREVO_API_KEY")
              ?? Environment.GetEnvironmentVariable("Email__BrevoApiKey");

        if (!string.IsNullOrWhiteSpace(brevoKey))
        {
            try
            {
                _logger.LogInformation($"Sending email to {toEmail} via Brevo HTTPS API...");
                await SendViaBrevoAsync(brevoKey, toEmail, subject, htmlBody);
                _logger.LogInformation($"Email sent successfully to {toEmail} via Brevo.");
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send email via Brevo API. Attempting fallback...");
            }
        }

        // ── 3. Direct SMTP (Gmail / Custom) with strict timeout ──────────────
        // Warning: Render Free Tier blocks outbound ports 25, 465, 587.
        // We set a 6-second timeout so the request never freezes the client for 70-100s.
        await SendViaSmtpAsync(toEmail, subject, htmlBody);
    }

    private async Task SendViaResendAsync(string apiKey, string toEmail, string subject, string htmlBody)
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(10);

        var fromEmail = string.IsNullOrWhiteSpace(_settings.FromEmail) || _settings.FromEmail.Contains("gmail.com")
            ? "onboarding@resend.dev"
            : _settings.FromEmail;

        var fromName = string.IsNullOrWhiteSpace(_settings.FromName) ? "BDFashions" : _settings.FromName;

        var payload = new
        {
            from = $"{fromName} <{fromEmail}>",
            to = new[] { toEmail },
            subject = subject,
            html = htmlBody
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey.Trim());

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Resend API error ({response.StatusCode}): {err}");
        }
    }

    private async Task SendViaBrevoAsync(string apiKey, string toEmail, string subject, string htmlBody)
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(10);

        var fromEmail = string.IsNullOrWhiteSpace(_settings.FromEmail) ? "noreply@clickebd.xyz" : _settings.FromEmail;
        var fromName = string.IsNullOrWhiteSpace(_settings.FromName) ? "BDFashions" : _settings.FromName;

        var payload = new
        {
            sender = new { name = fromName, email = fromEmail },
            to = new[] { new { email = toEmail } },
            subject = subject,
            htmlContent = htmlBody
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        request.Headers.Add("api-key", apiKey.Trim());

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Brevo API error ({response.StatusCode}): {err}");
        }
    }

    private async Task SendViaSmtpAsync(string toEmail, string subject, string htmlBody)
    {
        var email = new MimeMessage();

        var fromName = string.IsNullOrWhiteSpace(_settings.FromName) ? "BDFashions" : _settings.FromName;
        var fromEmail = string.IsNullOrWhiteSpace(_settings.FromEmail) ? "noreply@clickebd.xyz" : _settings.FromEmail;

        email.From.Add(new MailboxAddress(fromName, fromEmail));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;

        email.Body = new BodyBuilder
        {
            HtmlBody = htmlBody
        }.ToMessageBody();

        using var smtp = new SmtpClient();

        // Prevent hangs on Linux/Docker container CRL or revocation checks
        smtp.CheckCertificateRevocation = false;
        smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;

        // Strict 6-second timeout so requests don't hang for 100 seconds when blocked
        smtp.Timeout = 6000;

        Exception? lastEx = null;

        // Try primary port (usually 587 with STARTTLS)
        try
        {
            _logger.LogInformation($"Attempting SMTP connect to {_settings.Host}:{_settings.Port}...");
            var socketOption = _settings.Port == 465 
                ? SecureSocketOptions.SslOnConnect 
                : SecureSocketOptions.StartTls;

            await smtp.ConnectAsync(_settings.Host, _settings.Port, socketOption);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Primary SMTP connect failed. Trying fallback port...");
            lastEx = ex;

            // Try fallback port (465 if 587 failed, or vice versa)
            try
            {
                var fallbackPort = _settings.Port == 465 ? 587 : 465;
                var fallbackOption = fallbackPort == 465 
                    ? SecureSocketOptions.SslOnConnect 
                    : SecureSocketOptions.StartTls;

                await smtp.ConnectAsync(_settings.Host, fallbackPort, fallbackOption);
                lastEx = null; // Connected!
            }
            catch (Exception ex2)
            {
                _logger.LogError(ex2, "Fallback SMTP connect also failed.");
                lastEx = ex2;
            }
        }

        if (lastEx != null || !smtp.IsConnected)
        {
            throw new InvalidOperationException(
                $"Could not establish SMTP connection to {_settings.Host}. If hosted on Render Free tier, Render blocks SMTP ports 25, 465, and 587. Please configure ResendApiKey to send via HTTPS (port 443).",
                lastEx
            );
        }

        await smtp.AuthenticateAsync(_settings.Username, _settings.Password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
