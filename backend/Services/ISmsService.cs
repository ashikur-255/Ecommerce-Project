namespace EcommerceAPI.Services;

public interface ISmsService
{
    Task<bool> SendOtpAsync(string phone, string otp);
}