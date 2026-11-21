using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using EcommerceAPI.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace EcommerceAPI.Services;

public class SteadfastOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookToken { get; set; } = string.Empty;
}

public class SteadfastBookingResult
{
    public bool Success { get; set; }
    public SteadfastConsignment? Consignment { get; set; }
    public string? ErrorMessage { get; set; }
}

public class SteadfastCourierService
{
    private readonly HttpClient _http;
    private readonly SteadfastOptions _options;
    private readonly ILogger<SteadfastCourierService> _logger;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_options.BaseUrl) &&
        !string.IsNullOrWhiteSpace(_options.ApiKey) &&
        !string.IsNullOrWhiteSpace(_options.SecretKey) &&
        _options.BaseUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase);

    public SteadfastCourierService(
        HttpClient http,
        IOptions<SteadfastOptions> options,
        ILogger<SteadfastCourierService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _http = http;

        if (IsConfigured)
        {
            _http.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");
            _http.DefaultRequestHeaders.Remove("Api-Key");
            _http.DefaultRequestHeaders.Add("Api-Key", _options.ApiKey);
            _http.DefaultRequestHeaders.Remove("Secret-Key");
            _http.DefaultRequestHeaders.Add("Secret-Key", _options.SecretKey);
            _http.DefaultRequestHeaders.Accept.Clear();
            _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }

    public async Task<SteadfastBookingResult> CreateOrderAsync(SteadfastCreateOrderRequest req)
    {
        if (!IsConfigured)
        {
            return new SteadfastBookingResult
            {
                Success = false,
                ErrorMessage = "Steadfast Courier credentials are not configured in system settings."
            };
        }

        var payload = new
        {
            invoice = req.Invoice,
            recipient_name = req.RecipientName,
            recipient_phone = req.RecipientPhone,
            recipient_address = req.RecipientAddress,
            cod_amount = req.CodAmount,
            note = req.Note ?? ""
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        HttpResponseMessage res;
        string body;

        try
        {
            res = await _http.PostAsync("create_order", content);
            body = await res.Content.ReadAsStringAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to Steadfast Courier API endpoint.");
            return new SteadfastBookingResult
            {
                Success = false,
                ErrorMessage = $"Failed to reach Steadfast server: {ex.Message}"
            };
        }

        if (!res.IsSuccessStatusCode)
        {
            var errMsg = ParseSteadfastErrorMessage((int)res.StatusCode, body);
            _logger.LogWarning("Steadfast create_order failed (HTTP {StatusCode}): {Body}", (int)res.StatusCode, body);
            return new SteadfastBookingResult
            {
                Success = false,
                ErrorMessage = errMsg
            };
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<SteadfastRawResponse>(body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (parsed == null || parsed.Status != 200 || parsed.Consignment is null)
            {
                var errMsg = parsed?.Message ?? ParseSteadfastErrorMessage(parsed?.Status ?? 400, body);
                return new SteadfastBookingResult
                {
                    Success = false,
                    ErrorMessage = errMsg
                };
            }

            return new SteadfastBookingResult
            {
                Success = true,
                Consignment = new SteadfastConsignment
                {
                    ConsignmentId = parsed.Consignment.ConsignmentId,
                    Invoice = parsed.Consignment.Invoice,
                    TrackingCode = parsed.Consignment.TrackingCode,
                    Status = string.IsNullOrWhiteSpace(parsed.Consignment.Status) ? "in_review" : parsed.Consignment.Status
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Steadfast response: {Body}", body);
            return new SteadfastBookingResult
            {
                Success = false,
                ErrorMessage = $"Invalid response from Steadfast Courier: {body}"
            };
        }
    }

    public async Task<decimal?> GetBalanceAsync()
    {
        if (!IsConfigured) return null;
        try
        {
            var res = await _http.GetAsync("get_balance");
            if (!res.IsSuccessStatusCode) return null;
            var body = await res.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("current_balance", out var balProp))
            {
                if (balProp.TryGetDecimal(out var bal)) return bal;
            }
        }
        catch
        {
            // Ignore balance check failure
        }
        return null;
    }

    public bool IsValidWebhookToken(string? bearerHeader)
    {
        if (string.IsNullOrWhiteSpace(_options.WebhookToken))
            return true;

        if (string.IsNullOrWhiteSpace(bearerHeader))
            return false;

        var token = bearerHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? bearerHeader.Substring(7).Trim()
            : bearerHeader.Trim();

        return string.Equals(token, _options.WebhookToken.Trim(), StringComparison.Ordinal);
    }

    private static string ParseSteadfastErrorMessage(int statusCode, string body)
    {
        if (string.IsNullOrWhiteSpace(body))
            return $"Steadfast returned status code {statusCode}.";

        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            // 1. Check for Laravel-style validation errors: { "errors": { "field": ["err1", "err2"] } }
            if (root.TryGetProperty("errors", out var errorsProp) && errorsProp.ValueKind == JsonValueKind.Object)
            {
                var errorList = new List<string>();
                foreach (var prop in errorsProp.EnumerateObject())
                {
                    if (prop.Value.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in prop.Value.EnumerateArray())
                        {
                            var s = item.GetString();
                            if (!string.IsNullOrWhiteSpace(s)) errorList.Add(s);
                        }
                    }
                    else if (prop.Value.ValueKind == JsonValueKind.String)
                    {
                        var s = prop.Value.GetString();
                        if (!string.IsNullOrWhiteSpace(s)) errorList.Add(s);
                    }
                }
                if (errorList.Count > 0)
                {
                    return string.Join(" ", errorList);
                }
            }

            // 2. Check for "message" field
            if (root.TryGetProperty("message", out var msgProp) && msgProp.ValueKind == JsonValueKind.String)
            {
                var msg = msgProp.GetString();
                if (!string.IsNullOrWhiteSpace(msg))
                {
                    if (msg.Contains("Account is not active", StringComparison.OrdinalIgnoreCase))
                    {
                        return "Your Steadfast Courier account is not active yet. Please contact Steadfast support (09678-045045) or verify your account on the Steadfast merchant portal to activate it.";
                    }
                    return msg;
                }
            }
        }
        catch
        {
            // Not JSON
        }

        if (body.Contains("Account is not active", StringComparison.OrdinalIgnoreCase))
        {
            return "Your Steadfast Courier account is not active yet. Please contact Steadfast support (09678-045045) or verify your account on the Steadfast merchant portal to activate it.";
        }

        return body.Length < 250 ? body : $"Steadfast error (HTTP {statusCode}).";
    }

    // ── Internal shape matching Steadfast's raw snake_case JSON ───────────
    private class SteadfastRawResponse
    {
        [JsonPropertyName("status")]
        public int Status { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("consignment")]
        public SteadfastRawConsignment? Consignment { get; set; }
    }

    private class SteadfastRawConsignment
    {
        [JsonPropertyName("consignment_id")]
        public long ConsignmentId { get; set; }

        [JsonPropertyName("invoice")]
        public string Invoice { get; set; } = string.Empty;

        [JsonPropertyName("tracking_code")]
        public string TrackingCode { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
    }
}