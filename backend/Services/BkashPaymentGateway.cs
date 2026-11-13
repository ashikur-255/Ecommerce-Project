using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EcommerceAPI.Config;
using Microsoft.Extensions.Options;

namespace EcommerceAPI.Services;

/// <summary>
/// Implements bKash's Tokenized Checkout flow (create → customer pays on
/// bKash's page → redirect back → execute). Nagad/Rocket will get their own
/// class implementing the same IMfsPaymentGateway interface.
/// </summary>
public class BkashPaymentGateway : IMfsPaymentGateway
{
    private readonly HttpClient _http;
    private readonly BkashSettings _settings;
    private readonly BkashTokenService _tokenService;

    public string ProviderName => "bkash";

    public BkashPaymentGateway(HttpClient http, IOptions<BkashSettings> settings, BkashTokenService tokenService)
    {
        _settings = settings.Value;
        _tokenService = tokenService;

        _http = http;
        _http.BaseAddress = new Uri(_settings.BaseUrl);
    }

    public async Task<(string paymentId, string redirectUrl)> CreatePaymentAsync(
        decimal amount, string currency, string merchantInvoiceNumber)
    {
        var token = await _tokenService.GetTokenAsync();

        var request = new HttpRequestMessage(HttpMethod.Post, "/tokenized/checkout/create");
        AddAuthHeaders(request, token);
        request.Content = new StringContent(JsonSerializer.Serialize(new
        {
            mode = "0011",
            payerReference = merchantInvoiceNumber,
            callbackURL = $"{_settings.CallbackBaseUrl}/api/bkash/callback",
            amount = amount.ToString("0.00"),
            currency,
            intent = "sale",
            merchantInvoiceNumber
        }), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(
                $"bKash create payment failed ({(int)response.StatusCode} {response.StatusCode}): {body}");

        var json = JsonDocument.Parse(body).RootElement;
        var paymentId = json.GetProperty("paymentID").GetString() ?? string.Empty;
        var bkashUrl = json.GetProperty("bkashURL").GetString() ?? string.Empty;

        return (paymentId, bkashUrl);
    }

    public async Task<(bool success, string trxId, string status)> ExecutePaymentAsync(string paymentId)
    {
        var token = await _tokenService.GetTokenAsync();

        var request = new HttpRequestMessage(HttpMethod.Post, "/tokenized/checkout/execute");
        AddAuthHeaders(request, token);
        request.Content = new StringContent(
            JsonSerializer.Serialize(new { paymentID = paymentId }), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(body).RootElement;

        var status = json.TryGetProperty("transactionStatus", out var st) ? st.GetString() ?? "Unknown" : "Unknown";
        var trxId = json.TryGetProperty("trxID", out var tx) ? tx.GetString() ?? string.Empty : string.Empty;
        var success = response.IsSuccessStatusCode && status.Equals("Completed", StringComparison.OrdinalIgnoreCase);

        return (success, trxId, status);
    }

    public async Task<(bool success, string trxId, string status)> QueryPaymentAsync(string paymentId)
    {
        var token = await _tokenService.GetTokenAsync();

        var request = new HttpRequestMessage(HttpMethod.Post, "/tokenized/checkout/payment/status");
        AddAuthHeaders(request, token);
        request.Content = new StringContent(
            JsonSerializer.Serialize(new { paymentID = paymentId }), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(body).RootElement;

        var status = json.TryGetProperty("transactionStatus", out var st) ? st.GetString() ?? "Unknown" : "Unknown";
        var trxId = json.TryGetProperty("trxID", out var tx) ? tx.GetString() ?? string.Empty : string.Empty;
        var success = response.IsSuccessStatusCode && status.Equals("Completed", StringComparison.OrdinalIgnoreCase);

        return (success, trxId, status);
    }

    private void AddAuthHeaders(HttpRequestMessage request, string token)
    {
        request.Headers.Add("Authorization", token);
        request.Headers.Add("X-APP-Key", _settings.AppKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        request.Headers.TryAddWithoutValidation(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
    }
}