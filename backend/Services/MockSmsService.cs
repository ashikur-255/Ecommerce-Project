// Create a new file: Services/MockSmsService.cs
using Microsoft.Extensions.Logging;

namespace EcommerceAPI.Services;

public class MockSmsService : ISmsService
{
    private readonly ILogger<MockSmsService> _logger;

    public MockSmsService(ILogger<MockSmsService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendOtpAsync(string phone, string otp)
    {
        _logger.LogInformation($"MOCK SMS: Sending OTP '{otp}' to '{phone}'");
        Console.WriteLine($"\n========== MOCK SMS ==========");
        Console.WriteLine($"Phone: {phone}");
        Console.WriteLine($"OTP: {otp}");
        Console.WriteLine($"==============================\n");
        return Task.FromResult(true);
    }
}