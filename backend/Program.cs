using EcommerceAPI.Config;
using EcommerceAPI.Data;
using EcommerceAPI.Middleware;
using EcommerceAPI.Repositories;
using EcommerceAPI.Repositories.Interfaces;
using EcommerceAPI.Services;
using EcommerceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Stripe;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ── Render / PaaS dynamic PORT binding ───────────────────────────────────────
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure(3)));

// ── JWT Configuration ───────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret is not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EcommerceAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EcommerceClient";

if (jwtKey.Length < 32)
{
    throw new InvalidOperationException("JWT Secret must be at least 32 characters long.");
}

builder.Services.AddScoped<JwtService>();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError("Authentication failed: {Exception}", context.Exception.Message);
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Challenge: {Error}", context.Error);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IWishlistService, WishlistService>();

// ── bKash ─────────────────────────────────────────────────────────────────
builder.Services.Configure<BkashSettings>(builder.Configuration.GetSection("Bkash"));
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<BkashTokenService>();
builder.Services.AddHttpClient<BkashPaymentGateway>();
builder.Services.AddScoped<PaymentRecordService>();

// ── Email ─────────────────────────────────────────────────────────────────
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("Email"));
builder.Services.AddScoped<IEmailService, EmailService>();

// ── SMS ────────────────────────────────────────────────────────────────────
builder.Services.Configure<SmsNetBdSettings>(
    builder.Configuration.GetSection("SmsNetBd"));
builder.Services.AddHttpClient<ISmsService, SmsNetBdService>();

// ── SSLCommerz ──────────────────────────────────────────────────────────────
builder.Services.AddHttpClient("sslcommerz");
builder.Services.AddScoped<SslCommerzService>();

// ── SteadfastCourierService ────────────────────────────────────────────────
builder.Services.Configure<SteadfastOptions>(builder.Configuration.GetSection("Steadfast"));
builder.Services.AddHttpClient<SteadfastCourierService>();

// ── Stripe ────────────────────────────────────────────────────────────────────
var stripeKey = builder.Configuration["Stripe:SecretKey"];
if (!string.IsNullOrEmpty(stripeKey))
{
    StripeConfiguration.ApiKey = stripeKey;
}

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

// ── Controllers + JSON ────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()
        );
        options.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Ecommerce API",
        Version = "v1",
        Description = "ASP.NET Core Web API – Adidas-style E-Commerce (SQL Server)"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {your JWT token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Auto-migrate on startup ──────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ecommerce API v1");
        c.RoutePrefix = "swagger";
    });
    app.UseHttpsRedirection();
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();