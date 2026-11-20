using System.Text;
using System.Text.Json;

namespace EcommerceAPI.Services;

/// <summary>
/// Wraps every SSLCommerz API call.
/// Sandbox base: https://sandbox.sslcommerz.com
/// Live base:    https://securepay.sslcommerz.com
/// </summary>
public class SslCommerzService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _http;
    private readonly ILogger<SslCommerzService> _log;

    private string StoreId => _config["SSLCommerz:StoreId"]
        ?? Environment.GetEnvironmentVariable("SSLCommerz__StoreId")
        ?? string.Empty;
    private string StorePasswd => _config["SSLCommerz:StorePasswd"]
        ?? Environment.GetEnvironmentVariable("SSLCommerz__StorePasswd")
        ?? string.Empty;
    private bool IsSandbox => bool.Parse(_config["SSLCommerz:IsSandbox"] ?? Environment.GetEnvironmentVariable("SSLCommerz__IsSandbox") ?? "true");

    private string BaseUrl => IsSandbox
        ? "https://sandbox.sslcommerz.com"
        : "https://securepay.sslcommerz.com";

    public SslCommerzService(IConfiguration config, IHttpClientFactory http, ILogger<SslCommerzService> log)
    {
        _config = config;
        _http = http;
        _log = log;
    }

    // ── Initiate a payment session ─────────────────────────────────────────
    // Returns the GatewayPageURL the frontend should redirect the user to.
    public async Task<SslInitResponse> InitiateAsync(SslInitRequest req)
    {
        var successUrl = _config["SSLCommerz:SuccessUrl"] ?? "";
        var failUrl = _config["SSLCommerz:FailUrl"] ?? "";
        var cancelUrl = _config["SSLCommerz:CancelUrl"] ?? "";
        var ipnUrl = _config["SSLCommerz:IpnUrl"] ?? "";

        var form = new Dictionary<string, string>
        {
            ["store_id"] = StoreId,
            ["store_passwd"] = StorePasswd,
            ["total_amount"] = req.Amount.ToString("F2"),
            ["currency"] = req.Currency,
            ["tran_id"] = req.TransactionId,
            ["success_url"] = successUrl,
            ["fail_url"] = failUrl,
            ["cancel_url"] = cancelUrl,
            ["ipn_url"] = ipnUrl,

            // Customer info (required by SSLCommerz)
            ["cus_name"] = req.CustomerName,
            ["cus_email"] = req.CustomerEmail,
            ["cus_phone"] = req.CustomerPhone,
            ["cus_add1"] = req.CustomerAddress,
            ["cus_city"] = req.CustomerCity,
            ["cus_country"] = req.CustomerCountry,

            // Shipping (can mirror customer for digital goods)
            ["ship_name"] = req.CustomerName,
            ["ship_add1"] = req.CustomerAddress,
            ["ship_city"] = req.CustomerCity,
            ["ship_country"] = req.CustomerCountry,
            ["shipping_method"] = "NO",

            // Product info
            ["product_name"] = req.ProductName,
            ["product_category"] = req.ProductCategory,
            ["product_profile"] = "general",

            // EMI (disable for now)
            ["emi_option"] = "0",

            // Value-added metadata (passed back in the callback)
            ["value_a"] = req.OrderId.ToString(),
            ["value_b"] = req.UserId.ToString(),
        };

        var client = _http.CreateClient("sslcommerz");
        var content = new FormUrlEncodedContent(form);

        // ✅ fixed — the session-initiation endpoint is /gwprocess/v4/api.php,
        // not /gwprocess/apicheck.php (confirmed against SSLCommerz's current
        // official integration docs). The old path would 404 or return HTML,
        // which the JSON deserialize below would then choke on.
        var response = await client.PostAsync($"{BaseUrl}/gwprocess/v4/api.php", content);
        var body = await response.Content.ReadAsStringAsync();

        _log.LogDebug("SSLCommerz initiate response: {Body}", body);

        var result = JsonSerializer.Deserialize<SslInitResponse>(body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        return result ?? throw new Exception("Empty response from SSLCommerz initiate");
    }

    // ── Validate a payment after success callback ──────────────────────────
    // SSLCommerz recommends re-validating the transaction on your server
    // so a customer can't forge a success callback.
    public async Task<SslValidationResponse> ValidateAsync(string valId)
    {
        var client = _http.CreateClient("sslcommerz");
        var url = $"{BaseUrl}/validator/api/validationserverAPI.php" +
                  $"?val_id={valId}&store_id={StoreId}&store_passwd={StorePasswd}" +
                  $"&v=1&format=json";

        var response = await client.GetAsync(url);
        var body = await response.Content.ReadAsStringAsync();

        _log.LogDebug("SSLCommerz validate response: {Body}", body);

        var result = JsonSerializer.Deserialize<SslValidationResponse>(body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        return result ?? throw new Exception("Empty response from SSLCommerz validate");
    }

    // ── IPN hash verification ──────────────────────────────────────────────
    // Verify that the IPN request actually came from SSLCommerz, not a forger.
    // https://developer.sslcommerz.com/doc/v4/#ipn-listener
    public bool VerifyIpnHash(Dictionary<string, string> form)
    {
        if (!form.TryGetValue("verify_sign", out var receivedHash)) return false;
        if (!form.TryGetValue("verify_key", out var keyList)) return false;

        var sb = new StringBuilder(StorePasswd);
        var keys = keyList.Split(',');
        foreach (var key in keys)
        {
            form.TryGetValue(key.Trim(), out var val);
            sb.Append($"{val}");
        }

        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(sb.ToString()));
        var computedHash = BitConverter.ToString(hash).Replace("-", "").ToLower();

        return receivedHash.ToLower() == computedHash;
    }
}

// ── DTOs for SSLCommerz API responses ─────────────────────────────────────

public class SslInitRequest
{
    public int UserId { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "BDT";
    public string TransactionId { get; set; } = string.Empty; // your internal tran_id
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string CustomerCity { get; set; } = string.Empty;
    public string CustomerCountry { get; set; } = "Bangladesh";
    public string ProductName { get; set; } = "Adidas Products";
    public string ProductCategory { get; set; } = "Clothing";
}

public class SslInitResponse
{
    public string Status { get; set; } = string.Empty; // "SUCCESS" or "FAILED"
    public string Failedreason { get; set; } = string.Empty;
    public string SessionKey { get; set; } = string.Empty;
    public string GatewayPageURL { get; set; } = string.Empty; // redirect here
    public string StoreBanner { get; set; } = string.Empty;
    public string StoreLogo { get; set; } = string.Empty;
}

public class SslValidationResponse
{
    public string Status { get; set; } = string.Empty; // "VALID" | "VALIDATED" | "INVALID_TRANSACTION"
    public string Tran_id { get; set; } = string.Empty;
    public string Val_id { get; set; } = string.Empty;
    public string Amount { get; set; } = "0";
    public string Store_amount { get; set; } = "0";
    public string Currency { get; set; } = string.Empty;
    public string Bank_tran_id { get; set; } = string.Empty;
    public string Card_type { get; set; } = string.Empty;
    public string Card_no { get; set; } = string.Empty;
    public string Value_a { get; set; } = string.Empty; // OrderId
    public string Value_b { get; set; } = string.Empty; // UserId
    public string Error { get; set; } = string.Empty;
}