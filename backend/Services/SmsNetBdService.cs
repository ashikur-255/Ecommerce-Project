using EcommerceAPI.Config;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace EcommerceAPI.Services;

public class SmsNetBdService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly SmsNetBdSettings _settings;
    private readonly ILogger<SmsNetBdService> _logger;

    public SmsNetBdService(
        HttpClient httpClient,
        IOptions<SmsNetBdSettings> options,
        ILogger<SmsNetBdService> logger)
    {
        _httpClient = httpClient;
        _settings = options.Value;
        _logger = logger;
    }

    public async Task<bool> SendOtpAsync(string phone, string otp)
    {
        try
        {
            // Format phone number
            var formattedPhone = phone
                .Replace("+", "")
                .Replace(" ", "")
                .Replace("-", "")
                .Trim();

            // SMS.net.bd expects phone without country code
            // Example: 017XXXXXXXX or 019XXXXXXXX
            if (formattedPhone.StartsWith("880"))
            {
                formattedPhone = formattedPhone.Substring(3);
            }
            else if (formattedPhone.StartsWith("88"))
            {
                formattedPhone = formattedPhone.Substring(2);
            }

            // Ensure it starts with 01 (Bangladesh mobile)
            if (!formattedPhone.StartsWith("01"))
            {
                _logger.LogWarning($"Invalid phone format: {phone}");
                return false;
            }

            // Validate phone length (should be 11 digits for Bangladesh)
            if (formattedPhone.Length != 11)
            {
                _logger.LogWarning($"Phone number length is {formattedPhone.Length}, expected 11 digits");
                return false;
            }

            var message = $"Your verification code is {otp}. It will expire in 10 minutes.";

            // Using GET method with query parameters (SMS.net.bd supports both GET and POST)
            var url = $"{_settings.BaseUrl}/sendsms" +
                      $"?api_key={Uri.EscapeDataString(_settings.ApiKey)}" +
                      $"&msg={Uri.EscapeDataString(message)}" +
                      $"&to={Uri.EscapeDataString(formattedPhone)}";

            _logger.LogInformation($"Sending SMS to: {formattedPhone}");
            _logger.LogInformation($"URL: {url}");

            var response = await _httpClient.GetAsync(url);
            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation($"SMS Response: {responseContent}");
            _logger.LogInformation($"Response Status Code: {response.StatusCode}");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning($"SMS failed with status: {response.StatusCode}");
                return false;
            }

            // Parse response to check for success
            try
            {
                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, object>>(responseContent);
                if (jsonResponse != null && jsonResponse.ContainsKey("error"))
                {
                    var errorCode = jsonResponse["error"].ToString();
                    if (errorCode == "0")
                    {
                        _logger.LogInformation("SMS sent successfully");
                        return true;
                    }
                    else
                    {
                        _logger.LogWarning($"SMS API returned error code: {errorCode}");
                        return false;
                    }
                }
            }
            catch (JsonException)
            {
                // If response is not JSON, check if it contains success indicators
                if (responseContent.Contains("SMS Sent") || responseContent.Contains("success"))
                {
                    _logger.LogInformation("SMS sent successfully (non-JSON response)");
                    return true;
                }
            }

            return false;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, $"HTTP error sending SMS to {phone}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Unexpected error sending SMS to {phone}");
            return false;
        }
    }
}