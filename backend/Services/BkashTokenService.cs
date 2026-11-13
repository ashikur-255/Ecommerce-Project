using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EcommerceAPI.Config;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace EcommerceAPI.Services;

/// <summary>
/// bKash's tokenized checkout requires a short-lived id_token (grant/refresh
/// flow) sent with every create/execute/query call. This service gets one and
/// caches it so you're not calling grant on every single request.
/// </summary>
public class BkashTokenService
{
    private readonly HttpClient _http;
    private readonly BkashSettings _settings;
    private readonly IMemoryCache _cache;

    private const string TokenCacheKey = "bkash_id_token";
    private const string RefreshCacheKey = "bkash_refresh_token";

    public BkashTokenService(HttpClient http, IOptions<BkashSettings> settings, IMemoryCache cache)
    {
        _settings = settings.Value;
        _cache = cache;

        _http = http;
        _http.BaseAddress = new Uri(_settings.BaseUrl);
    }

    public async Task<string> GetTokenAsync()
    {
        if (_cache.TryGetValue<string>(TokenCacheKey, out var cachedToken) && !string.IsNullOrEmpty(cachedToken))
            return cachedToken;

        var refreshToken = _cache.Get<string>(RefreshCacheKey);

        return refreshToken != null
            ? await RefreshTokenAsync(refreshToken)
            : await GrantTokenAsync();
    }

    private async Task<string> GrantTokenAsync()
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/tokenized/checkout/token/grant");
        AddCommonHeaders(request);
        request.Headers.Add("username", _settings.Username);
        request.Headers.Add("password", _settings.Password);
        request.Content = new StringContent(JsonSerializer.Serialize(new
        {
            app_key = _settings.AppKey,
            app_secret = _settings.AppSecret
        }), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(
                $"bKash token grant failed ({(int)response.StatusCode} {response.StatusCode}): {body}");

        var json = JsonDocument.Parse(body).RootElement;
        var idToken = json.GetProperty("id_token").GetString() ?? string.Empty;
        var refreshToken = json.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : null;
        var expiresIn = json.TryGetProperty("expires_in", out var exp) ? exp.GetInt32() : 3300;

        CacheTokens(idToken, refreshToken, expiresIn);
        return idToken;
    }

    private async Task<string> RefreshTokenAsync(string refreshToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/tokenized/checkout/token/refresh");
        AddCommonHeaders(request);
        request.Headers.Add("username", _settings.Username);
        request.Headers.Add("password", _settings.Password);
        request.Content = new StringContent(JsonSerializer.Serialize(new
        {
            app_key = _settings.AppKey,
            app_secret = _settings.AppSecret,
            refresh_token = refreshToken
        }), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return await GrantTokenAsync(); // refresh token expired/invalid — start fresh

        var body = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(body).RootElement;

        var idToken = json.GetProperty("id_token").GetString() ?? string.Empty;
        var newRefreshToken = json.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : refreshToken;
        var expiresIn = json.TryGetProperty("expires_in", out var exp) ? exp.GetInt32() : 3300;

        CacheTokens(idToken, newRefreshToken, expiresIn);
        return idToken;
    }

    private void CacheTokens(string idToken, string? refreshToken, int expiresInSeconds)
    {
        // Refresh a couple of minutes before actual expiry so we never hand out
        // a token that dies mid-request.
        var ttl = TimeSpan.FromSeconds(Math.Max(60, expiresInSeconds - 120));
        _cache.Set(TokenCacheKey, idToken, ttl);

        if (refreshToken != null)
            _cache.Set(RefreshCacheKey, refreshToken, TimeSpan.FromHours(24));
    }

    // Matches the exact headers a verified-working request needs: a real
    // User-Agent (HttpClient sends none by default, which some gateways
    // reject outright) plus an explicit Accept header.
    private static void AddCommonHeaders(HttpRequestMessage request)
    {
        request.Headers.TryAddWithoutValidation(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");

        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }
}