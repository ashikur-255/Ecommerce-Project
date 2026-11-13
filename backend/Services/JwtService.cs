using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcommerceAPI.Models;
using Microsoft.IdentityModel.Tokens;

namespace EcommerceAPI.Services;

public class JwtService
{
    private readonly IConfiguration _config;
    private readonly ILogger<JwtService> _logger;

    public JwtService(IConfiguration config, ILogger<JwtService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public string GenerateToken(User user)
    {
        try
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var secret = _config["Jwt:Secret"];
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(secret))
                throw new Exception("JWT Secret is missing from appsettings.json.");

            if (string.IsNullOrWhiteSpace(issuer))
                throw new Exception("JWT Issuer is missing from appsettings.json.");

            if (string.IsNullOrWhiteSpace(audience))
                throw new Exception("JWT Audience is missing from appsettings.json.");

            var expDays = int.TryParse(_config["Jwt:ExpiryInDays"], out var days)
                ? days
                : 7;

            _logger.LogInformation(
                "Generating JWT token for user: {Login}",
                user.Email ?? user.Phone ?? $"User-{user.Id}"
            );

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role ?? "customer"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(
                    JwtRegisteredClaimNames.Iat,
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64
                )
            };

            // Add Email Claim only if available
            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                claims.Add(new Claim(ClaimTypes.Email, user.Email));
            }

            // Add Phone Claim only if available
            if (!string.IsNullOrWhiteSpace(user.Phone))
            {
                claims.Add(new Claim(ClaimTypes.MobilePhone, user.Phone));
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expDays),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation("JWT token generated successfully for UserId: {UserId}", user.Id);

            return tokenString;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating JWT token");
            throw;
        }
    }
}