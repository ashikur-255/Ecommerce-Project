namespace EcommerceAPI.Services;

/// <summary>
/// Contract every mobile-wallet gateway (bKash, Nagad, Rocket, ...) implements.
/// The controller and frontend never need to change when a new provider is
/// added — just implement this interface and register it in Program.cs.
/// </summary>
public interface IMfsPaymentGateway
{
    string ProviderName { get; }

    Task<(string paymentId, string redirectUrl)> CreatePaymentAsync(
        decimal amount, string currency, string merchantInvoiceNumber);

    Task<(bool success, string trxId, string status)> ExecutePaymentAsync(string paymentId);

    Task<(bool success, string trxId, string status)> QueryPaymentAsync(string paymentId);
}