using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EcommerceAPI.DTOs;
using Microsoft.Extensions.Options;

namespace EcommerceAPI.Services;

public class SteadfastOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookToken { get; set; } = string.Empty;
}

public class SteadfastCourierService
{
    private readonly HttpClient _http;
    private readonly SteadfastOptions _options;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_options.BaseUrl) &&
        !string.IsNullOrWhiteSpace(_options.ApiKey) &&
        !string.IsNullOrWhiteSpace(_options.SecretKey) &&
        _options.BaseUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase);

    public SteadfastCourierService(HttpClient http, IOptions<SteadfastOptions> options)
    {
        _options = options.Value;
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

    public async Task<SteadfastCreateOrderResponse?> CreateOrderAsync(SteadfastCreateOrderRequest req)
    {
        if (!IsConfigured)
        {
            return null;
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

        var content = new StringContent(
            JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var res = await _http.PostAsync("create_order", content);
        var body = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new ApplicationException($"Steadfast create_order failed ({(int)res.StatusCode}): {body}");

        var parsed = JsonSerializer.Deserialize<SteadfastRawResponse>(body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (parsed == null || parsed.Status != 200 || parsed.Consignment is null)
        {
            var msg = parsed?.Message ?? body;
            throw new ApplicationException($"Steadfast returned error: {msg}");
        }

        return new SteadfastCreateOrderResponse
        {
            Status = parsed.Status,
            Message = parsed.Message,
            Consignment = new SteadfastConsignment
            {
                ConsignmentId = parsed.Consignment.ConsignmentId,
                Invoice = parsed.Consignment.Invoice,
                TrackingCode = parsed.Consignment.TrackingCode,
                Status = parsed.Consignment.Status
            }
        };
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

    // ── Internal shape matching Steadfast's raw snake_case JSON ───────────
    private class SteadfastRawResponse
    {
        public int Status { get; set; }
        public string? Message { get; set; }
        public SteadfastRawConsignment? Consignment { get; set; }
    }

    private class SteadfastRawConsignment
    {
        public long ConsignmentId { get; set; }
        public string Invoice { get; set; } = string.Empty;
        public string TrackingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}