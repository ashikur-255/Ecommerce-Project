using System.Security.Claims;
using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using EcommerceAPI.Helpers;
using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using EcommerceAPI.Config;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly JwtService _jwt;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ISmsService _smsService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext db,
        JwtService jwt,
        IWebHostEnvironment env,
        IConfiguration configuration,
        IEmailService emailService,
        ISmsService smsService,
        ILogger<AuthController> logger)
    {
        _db = db;
        _jwt = jwt;
        _env = env;
        _configuration = configuration;
        _emailService = emailService;
        _smsService = smsService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Invalid input."));

            // Validate at least one contact method
            if (string.IsNullOrWhiteSpace(dto.Email) && string.IsNullOrWhiteSpace(dto.Phone))
            {
                return BadRequest(ApiResponse<string>.Fail("Please provide either email or phone number."));
            }

            // Validate password
            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            {
                return BadRequest(ApiResponse<string>.Fail("Password must be at least 6 characters."));
            }

            // Check if email exists (if provided)
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailLower = dto.Email.Trim().ToLowerInvariant();
                if (await _db.Users.AnyAsync(x => x.Email == emailLower))
                    return Conflict(ApiResponse<string>.Fail("Email already exists."));
            }

            // Normalize and check if phone exists (if provided)
            string? normalizedPhone = null;
            if (!string.IsNullOrWhiteSpace(dto.Phone))
            {
                normalizedPhone = NormalizePhoneNumber(dto.Phone.Trim());
                if (await _db.Users.AnyAsync(x => x.Phone == normalizedPhone))
                    return Conflict(ApiResponse<string>.Fail("Phone number already exists."));
            }

            var user = new User
            {
                Name = dto.Name.Trim(),
                Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim().ToLowerInvariant(),
                Phone = normalizedPhone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "customer",
                CreatedAt = DateTime.UtcNow,
                IsEmailVerified = false,
                IsPhoneVerified = false
            };

            // Generate email verification token ONLY IF email provided
            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                var verificationToken = GenerateToken();
                user.EmailVerificationToken = verificationToken;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
            }
            else
            {
                // ✅ If no email, set email verification to true (not applicable)
                user.IsEmailVerified = true;
            }

            // If phone provided, generate OTP
            if (!string.IsNullOrWhiteSpace(user.Phone))
            {
                var otp = Random.Shared.Next(100000, 999999).ToString();
                user.PhoneVerificationCode = otp;
                user.PhoneVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10);
            }

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var frontendUrl = _configuration["Cors:AllowedOrigins:0"] ?? "http://localhost:5173";

            // Send email verification if email provided
            if (!string.IsNullOrWhiteSpace(user.Email) && user.EmailVerificationToken != null)
            {
                try
                {
                    var verifyLink = $"{frontendUrl}/verify-email?token={user.EmailVerificationToken}";
                    var html = EmailTemplates.VerificationEmail(user.Name, verifyLink);
                    await _emailService.SendEmailAsync(user.Email, "Verify your Email Address", html);
                    _logger.LogInformation($"Verification email sent to {user.Email}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send verification email to {user.Email}");
                }
            }

            // Send phone verification if phone provided
            if (!string.IsNullOrWhiteSpace(user.Phone))
            {
                try
                {
                    var sent = await _smsService.SendOtpAsync(user.Phone, user.PhoneVerificationCode!);
                    if (!sent)
                    {
                        _logger.LogWarning($"Failed to send SMS to {user.Phone}");
                    }
                    else
                    {
                        _logger.LogInformation($"Verification SMS sent to {user.Phone}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send verification SMS to {user.Phone}");
                }
            }

            var message = "Registration successful. ";
            if (!string.IsNullOrWhiteSpace(user.Email))
                message += "Please check your email for verification. ";
            if (!string.IsNullOrWhiteSpace(user.Phone))
                message += "A verification code has been sent to your phone. ";

            return Ok(
                ApiResponse<AuthResponseDto>.Ok(
                    BuildAuthResponse(user),
                    message.Trim()
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration error for user: {Email}", dto.Email);
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred during registration."));
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            _logger.LogInformation($"Login attempt with Email: {dto.Email}, Phone: {dto.Phone}");

            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Invalid input."));

            if (string.IsNullOrWhiteSpace(dto.Email) && string.IsNullOrWhiteSpace(dto.Phone))
            {
                return BadRequest(ApiResponse<string>.Fail("Please provide either email or phone number."));
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(ApiResponse<string>.Fail("Password is required."));
            }

            User? user = null;

            // Search by email
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailLower = dto.Email.Trim().ToLowerInvariant();
                user = await _db.Users.FirstOrDefaultAsync(u => u.Email == emailLower);
                _logger.LogInformation($"Search by email: {emailLower}, Found: {user != null}");
            }

            // Search by phone if not found by email
            if (user == null && !string.IsNullOrWhiteSpace(dto.Phone))
            {
                try
                {
                    var phone = dto.Phone.Trim();

                    // Try exact match first
                    user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == phone);
                    _logger.LogInformation($"Search by phone exact: {phone}, Found: {user != null}");

                    // If not found, try normalized
                    if (user == null)
                    {
                        var normalizedPhone = NormalizePhoneNumber(phone);
                        user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == normalizedPhone);
                        _logger.LogInformation($"Search by phone normalized: {normalizedPhone}, Found: {user != null}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error searching by phone");
                }
            }

            // Check if user exists
            if (user == null)
            {
                _logger.LogWarning($"User not found for: {dto.Email ?? dto.Phone}");
                return Unauthorized(ApiResponse<string>.Fail("Invalid credentials."));
            }

            _logger.LogInformation($"User found: ID={user.Id}, Email={user.Email}, Phone={user.Phone}, IsEmailVerified={user.IsEmailVerified}, IsPhoneVerified={user.IsPhoneVerified}");

            // Check PasswordHash
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                _logger.LogError($"User {user.Id} has null or empty PasswordHash");
                return StatusCode(500, ApiResponse<string>.Fail("Account data is corrupted. Please contact support."));
            }

            // Verify password
            try
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                {
                    _logger.LogWarning($"Password verification failed for: {user.Email ?? user.Phone}");
                    return Unauthorized(ApiResponse<string>.Fail("Invalid credentials."));
                }
            }
            catch (Exception bcryptEx)
            {
                _logger.LogError(bcryptEx, $"BCrypt verification error for user: {user.Id}");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred during login."));
            }

            // ✅ FIXED: Check email verification ONLY IF the user has an email AND logging in with email
            if (!string.IsNullOrWhiteSpace(dto.Email) && !string.IsNullOrWhiteSpace(user.Email) && !user.IsEmailVerified)
            {
                _logger.LogWarning($"Unverified email login attempt: {user.Email}");
                return Unauthorized(ApiResponse<string>.Fail("Please verify your email before logging in."));
            }

            // ✅ FIXED: Check phone verification ONLY IF the user has a phone AND logging in with phone
            if (!string.IsNullOrWhiteSpace(dto.Phone) && !string.IsNullOrWhiteSpace(user.Phone) && !user.IsPhoneVerified)
            {
                _logger.LogWarning($"Unverified phone login attempt: {user.Phone}");
                return Unauthorized(ApiResponse<string>.Fail("Please verify your phone number before logging in."));
            }

            _logger.LogInformation($"Login successful for: {user.Email ?? user.Phone}");
            return Ok(ApiResponse<AuthResponseDto>.Ok(BuildAuthResponse(user), "Login successful."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error");
            return StatusCode(500, ApiResponse<string>.Fail($"An error occurred during login: {ex.Message}"));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST: api/auth/verify-phone-public (For new registrations)
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("verify-phone-public")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyPhonePublic([FromBody] VerifyPhonePublicDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Phone))
                return BadRequest(ApiResponse<string>.Fail("Phone number is required."));

            if (string.IsNullOrWhiteSpace(dto.Code))
                return BadRequest(ApiResponse<string>.Fail("Verification code is required."));

            var phone = dto.Phone.Trim();
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Phone == phone);
            if (user == null)
            {
                var normalized = NormalizePhoneNumber(phone);
                user = await _db.Users.FirstOrDefaultAsync(x => x.Phone == normalized);
            }

            if (user == null)
                return NotFound(ApiResponse<string>.Fail("User not found."));

            if (user.IsPhoneVerified)
                return BadRequest(ApiResponse<string>.Fail("Phone already verified."));

            if (user.PhoneVerificationCode != dto.Code)
            {
                _logger.LogWarning($"Invalid OTP attempt for phone: {phone}");
                return BadRequest(ApiResponse<string>.Fail("Invalid OTP."));
            }

            if (user.PhoneVerificationCodeExpiry == null ||
                user.PhoneVerificationCodeExpiry < DateTime.UtcNow)
            {
                return BadRequest(ApiResponse<string>.Fail("OTP has expired."));
            }

            user.IsPhoneVerified = true;
            user.PhoneVerificationCode = null;
            user.PhoneVerificationCodeExpiry = null;

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Phone verified successfully: {phone}");
            return Ok(ApiResponse<string>.Ok("", "Phone verified successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VerifyPhonePublic error");
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while verifying phone."));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/me
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        try
        {
            var userId = GetUserId();
            var user = await _db.Users.FindAsync(userId);

            if (user is null)
                return NotFound(ApiResponse<string>.Fail("User not found."));

            return Ok(ApiResponse<UserDto>.Ok(MapUser(user)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetMe error for user: {UserId}", GetUserId());
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while fetching user."));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/auth/profile
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Invalid input.")
                );
            }

            var userId = GetUserId();
            var user = await _db.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(
                    ApiResponse<string>.Fail("User not found.")
                );
            }

            user.Name = dto.Name.Trim();

            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                if (dto.NewPassword.Length < 6)
                    return BadRequest(ApiResponse<string>.Fail("Password must be at least 6 characters."));

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            }

            // Handle avatar upload
            if (dto.Avatar != null && dto.Avatar.Length > 0)
            {
                if (dto.Avatar.Length > 2 * 1024 * 1024)
                {
                    return BadRequest(
                        ApiResponse<string>.Fail("Avatar must be less than 2 MB.")
                    );
                }

                string[] allowedTypes = { "image/jpeg", "image/jpg", "image/png", "image/webp" };
                if (!allowedTypes.Contains(dto.Avatar.ContentType))
                {
                    return BadRequest(
                        ApiResponse<string>.Fail("Only JPG, PNG and WEBP images are allowed.")
                    );
                }

                var webRootPath = _env.WebRootPath;
                if (string.IsNullOrWhiteSpace(webRootPath))
                {
                    webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }

                var uploadFolder = Path.Combine(webRootPath, "uploads", "users");
                Directory.CreateDirectory(uploadFolder);

                if (!string.IsNullOrWhiteSpace(user.Avatar))
                {
                    var oldFilePath = Path.Combine(webRootPath, user.Avatar.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Avatar.FileName)}";
                var filePath = Path.Combine(uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Avatar.CopyToAsync(stream);
                }

                user.Avatar = $"/uploads/users/{fileName}";
            }

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Profile updated for user: {user.Email}");
            return Ok(
                ApiResponse<UserDto>.Ok(
                    MapUser(user),
                    "Profile updated successfully."
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateProfile error for user: {UserId}", GetUserId());
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while updating profile."));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/users  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("users")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string? search = null)
    {
        try
        {
            var query = _db.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLowerInvariant();
                query = query.Where(u => u.Name.ToLower().Contains(s) ||
                                         u.Email.ToLower().Contains(s));
            }

            var total = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                users = users.Select(MapUser),
                total,
                page,
                totalPages = (int)Math.Ceiling((double)total / limit)
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetAllUsers error");
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while fetching users."));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/auth/users/{id}  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpDelete("users/{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var adminId = GetUserId();
            if (id == adminId)
                return BadRequest(ApiResponse<string>.Fail("You cannot delete your own account."));

            var user = await _db.Users.FindAsync(id);
            if (user is null)
                return NotFound(ApiResponse<string>.Fail("User not found."));

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User deleted: {user.Email}");
            return Ok(ApiResponse<string>.Ok("Deleted", "User deleted successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DeleteUser error for user: {UserId}", id);
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while deleting user."));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST: api/auth/verify-email
    // ─────────────────────────────────────────────────────────────
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Verification token is required.")
                );
            }

            var user = await _db.Users.FirstOrDefaultAsync(x =>
                x.EmailVerificationToken == dto.Token);

            if (user == null)
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Invalid verification token.")
                );
            }

            if (user.IsEmailVerified)
            {
                return Ok(
                    ApiResponse<string>.Ok(
                        "Already Verified",
                        "Email is already verified."
                    )
                );
            }

            if (user.EmailVerificationTokenExpiry == null ||
                user.EmailVerificationTokenExpiry < DateTime.UtcNow)
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Verification token has expired.")
                );
            }

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Email verified: {user.Email}");
            return Ok(
                ApiResponse<string>.Ok(
                    "Verified",
                    "Email verified successfully."
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VerifyEmail error");
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while verifying email."));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST: api/auth/resend-verification
    // ─────────────────────────────────────────────────────────────
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
    {
        try
        {
            if (dto.Type?.ToLower() != "email" && dto.Type?.ToLower() != "phone")
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Invalid verification type. Must be 'email' or 'phone'.")
                );
            }

            if (dto.Type?.ToLower() == "email")
            {
                if (string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(ApiResponse<string>.Fail("Email is required."));

                var email = dto.Email.Trim().ToLowerInvariant();
                var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);

                if (user == null)
                    return NotFound(ApiResponse<string>.Fail("User not found."));

                if (user.IsEmailVerified)
                    return BadRequest(ApiResponse<string>.Fail("Email is already verified."));

                var token = GenerateToken();
                user.EmailVerificationToken = token;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

                await _db.SaveChangesAsync();

                var frontendUrl = _configuration["Cors:AllowedOrigins:0"] ?? "https://www.clickebd.xyz";
                var verifyLink = $"{frontendUrl}/verify-email?token={token}";
                var html = EmailTemplates.VerificationEmail(user.Name, verifyLink);

                bool emailSent = false;
                try
                {
                    await _emailService.SendEmailAsync(user.Email, "Verify Your Email Address", html);
                    emailSent = true;
                    _logger.LogInformation($"Verification email resent to: {user.Email}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to deliver email to {user.Email}: {ex.Message}");
                }

                return Ok(ApiResponse<object>.Ok(
                    new
                    {
                        email = user.Email,
                        emailSent = emailSent,
                        verifyUrl = verifyLink
                    },
                    emailSent
                        ? "A new verification email has been sent successfully. Please check your inbox and spam folder."
                        : "Verification link generated. If email delivery is delayed, click the instant verify link."
                ));
            }

            if (dto.Type?.ToLower() == "phone")
            {
                if (string.IsNullOrWhiteSpace(dto.Phone))
                    return BadRequest(ApiResponse<string>.Fail("Phone number is required."));

                var phone = dto.Phone.Trim();
                var user = await _db.Users.FirstOrDefaultAsync(x => x.Phone == phone);
                if (user == null)
                {
                    var normalized = NormalizePhoneNumber(phone);
                    user = await _db.Users.FirstOrDefaultAsync(x => x.Phone == normalized);
                }

                if (user == null)
                    return NotFound(ApiResponse<string>.Fail("User not found."));

                if (user.IsPhoneVerified)
                    return BadRequest(ApiResponse<string>.Fail("Phone is already verified."));

                var otp = Random.Shared.Next(100000, 999999).ToString();
                user.PhoneVerificationCode = otp;
                user.PhoneVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10);

                await _db.SaveChangesAsync();

                var sent = await _smsService.SendOtpAsync(user.Phone, otp);

                if (!sent)
                {
                    _logger.LogWarning($"Failed to send OTP to {user.Phone}");
                    return Ok(ApiResponse<string>.Ok(
                        "OTP Generated",
                        "We're having trouble sending the SMS. Please try again or use the resend option."
                    ));
                }

                _logger.LogInformation($"OTP resent to: {user.Phone}");
                return Ok(ApiResponse<string>.Ok(
                    "Verification Code Sent",
                    "A new verification code has been sent to your phone successfully."
                ));
            }

            return BadRequest(ApiResponse<string>.Fail("Invalid verification type."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ResendVerification error");
            return StatusCode(500,
                ApiResponse<string>.Fail("An error occurred while resending verification.")
            );
        }
    }

    // ───────────────────────────────────────────────────────────────
    // POST : api/auth/forgot-password
    // ───────────────────────────────────────────────────────────────
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Email) && string.IsNullOrWhiteSpace(dto.Phone))
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Please provide either email or phone number.")
                );
            }

            User? user = null;

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var email = dto.Email.Trim().ToLowerInvariant();
                user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);
            }

            if (user == null && !string.IsNullOrWhiteSpace(dto.Phone))
            {
                var phone = dto.Phone.Trim();
                user = await _db.Users.FirstOrDefaultAsync(x => x.Phone == phone);
            }

            if (user == null)
            {
                _logger.LogWarning($"Password reset requested for non-existent contact: {dto.Email ?? dto.Phone}");
                return Ok(
                    ApiResponse<string>.Ok(
                        "",
                        "If an account exists, a password reset link has been sent."
                    )
                );
            }

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                var token = GenerateToken();
                user.PasswordResetToken = token;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);

                await _db.SaveChangesAsync();

                var frontendUrl = _configuration["Cors:AllowedOrigins:0"] ?? "http://localhost:5173";
                var resetLink = $"{frontendUrl}/reset-password?token={token}";
                var html = EmailTemplates.ResetPasswordEmail(user.Name, resetLink);

                await _emailService.SendEmailAsync(user.Email, "Reset Your Password", html);

                _logger.LogInformation($"Password reset email sent to: {user.Email}");
                return Ok(
                    ApiResponse<string>.Ok(
                        "",
                        "Password reset email sent successfully."
                    )
                );
            }
            else if (!string.IsNullOrWhiteSpace(user.Phone))
            {
                var otp = Random.Shared.Next(100000, 999999).ToString();
                user.PasswordResetToken = otp;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(10);

                await _db.SaveChangesAsync();

                var sent = await _smsService.SendOtpAsync(user.Phone, otp);

                if (!sent)
                {
                    _logger.LogWarning($"Failed to send password reset SMS to {user.Phone}");
                    return Ok(
                        ApiResponse<string>.Ok(
                            "",
                            "We're having trouble sending the reset code. Please try again."
                        )
                    );
                }

                _logger.LogInformation($"Password reset SMS sent to: {user.Phone}");
                return Ok(
                    ApiResponse<string>.Ok(
                        "",
                        "Password reset code sent to your phone successfully."
                    )
                );
            }

            return BadRequest(
                ApiResponse<string>.Fail("No valid contact method found.")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ForgotPassword error");
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while processing your request."));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST: api/auth/reset-password
    // ─────────────────────────────────────────────────────────────
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Invalid request. Please check your input.")
                );
            }

            if (string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Reset token is required.")
                );
            }

            if (dto.NewPassword != dto.ConfirmPassword)
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Passwords do not match.")
                );
            }

            if (dto.NewPassword.Length < 6)
            {
                return BadRequest(
                    ApiResponse<string>.Fail("Password must be at least 6 characters.")
                );
            }

            var user = await _db.Users
                .FirstOrDefaultAsync(x => x.PasswordResetToken == dto.Token);

            if (user == null)
            {
                _logger.LogWarning($"Invalid password reset token: {dto.Token}");
                return BadRequest(
                    ApiResponse<string>.Fail("Invalid password reset token.")
                );
            }

            if (user.PasswordResetTokenExpiry == null ||
                user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                await _db.SaveChangesAsync();

                _logger.LogWarning($"Expired password reset token for user: {user.Email}");
                return BadRequest(
                    ApiResponse<string>.Fail("Password reset token has expired. Please request a new one.")
                );
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Password reset successfully for user: {user.Email}");
            return Ok(
                ApiResponse<string>.Ok(
                    "Success",
                    "Password has been reset successfully."
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ResetPassword error");
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while resetting password."));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST: api/auth/send-phone-verification
    // ─────────────────────────────────────────────────────────────
    [Authorize]
    [HttpPost("send-phone-verification")]
    public async Task<IActionResult> SendPhoneVerification()
    {
        try
        {
            var userId = GetUserId();
            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(ApiResponse<string>.Fail("User not found."));

            if (string.IsNullOrWhiteSpace(user.Phone))
                return BadRequest(ApiResponse<string>.Fail("Phone number not found."));

            if (user.IsPhoneVerified)
                return BadRequest(ApiResponse<string>.Fail("Phone already verified."));

            var otp = Random.Shared.Next(100000, 999999).ToString();
            user.PhoneVerificationCode = otp;
            user.PhoneVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10);

            await _db.SaveChangesAsync();

            var sent = await _smsService.SendOtpAsync(user.Phone, otp);

            if (!sent)
            {
                _logger.LogWarning($"Failed to send OTP to {user.Phone}");
                return Ok(ApiResponse<string>.Ok(
                    "OTP Generated",
                    "We're having trouble sending the SMS. Please try again or use the resend option."
                ));
            }

            _logger.LogInformation($"OTP sent to: {user.Phone}");
            return Ok(ApiResponse<string>.Ok("", "OTP sent successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"SendPhoneVerification error for user: {GetUserId()}");
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while sending OTP."));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST: api/auth/verify-phone
    // ─────────────────────────────────────────────────────────────
    [Authorize]
    [HttpPost("verify-phone")]
    public async Task<IActionResult> VerifyPhone([FromBody] VerifyPhoneDto dto)
    {
        try
        {
            var userId = GetUserId();
            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(ApiResponse<string>.Fail("User not found."));

            if (user.PhoneVerificationCode != dto.Code)
            {
                _logger.LogWarning($"Invalid OTP attempt for user: {user.Id}");
                return BadRequest(ApiResponse<string>.Fail("Invalid OTP."));
            }

            if (user.PhoneVerificationCodeExpiry == null ||
                user.PhoneVerificationCodeExpiry < DateTime.UtcNow)
            {
                return BadRequest(ApiResponse<string>.Fail("OTP has expired."));
            }

            user.IsPhoneVerified = true;
            user.PhoneVerificationCode = null;
            user.PhoneVerificationCodeExpiry = null;

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Phone verified for user: {user.Id}");
            return Ok(ApiResponse<string>.Ok("", "Phone verified successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"VerifyPhone error for user: {GetUserId()}");
            return StatusCode(500, ApiResponse<string>.Fail("An error occurred while verifying phone."));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private AuthResponseDto BuildAuthResponse(User user) => new()
    {
        Token = _jwt.GenerateToken(user),
        User = MapUser(user)
    };

    private static UserDto MapUser(User u) => new()
    {
        Id = u.Id,
        Name = u.Name,
        Email = u.Email,
        Phone = u.Phone,
        Role = u.Role,
        Avatar = u.Avatar,
        IsEmailVerified = u.IsEmailVerified,
        IsPhoneVerified = u.IsPhoneVerified
    };

    private static string GenerateToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    }

    /// <summary>
    /// Normalizes phone number to a consistent format: 880XXXXXXXXXX
    /// Examples:
    /// +8801708588330 -> 8801708588330
    /// 01708588330 -> 8801708588330
    /// 1708588330 -> 8801708588330
    /// </summary>
    private string NormalizePhoneNumber(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        try
        {
            // Remove all non-numeric characters (keep only digits)
            var normalized = new string(phone.Where(c => char.IsDigit(c)).ToArray());

            // If empty after removing non-digits, return empty
            if (string.IsNullOrWhiteSpace(normalized))
                return string.Empty;

            // Remove leading zeros
            normalized = normalized.TrimStart('0');

            // If empty after removing leading zeros, return empty
            if (string.IsNullOrWhiteSpace(normalized))
                return string.Empty;

            // If number doesn't start with 880, add it
            if (!normalized.StartsWith("880"))
            {
                normalized = "880" + normalized;
            }

            return normalized;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error normalizing phone number: {phone}");
            return phone; // Return original on error
        }
    }

    [HttpGet("debug-phone/{phone}")]
    [AllowAnonymous]
    public async Task<IActionResult> DebugPhone(string phone)
    {
        try
        {
            var normalized = NormalizePhoneNumber(phone);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == phone);
            var userNormalized = await _db.Users.FirstOrDefaultAsync(u => u.Phone == normalized);

            return Ok(new
            {
                inputPhone = phone,
                normalizedPhone = normalized,
                exactMatch = user != null ? new { user.Id, user.Email, user.Phone } : null,
                normalizedMatch = userNormalized != null ? new { userNormalized.Id, userNormalized.Email, userNormalized.Phone } : null,
                allPhones = await _db.Users.Where(u => u.Phone != null).Select(u => u.Phone).ToListAsync()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }
}