// ══════════════════════════════════════════════════════════════════════════════
// All using statements MUST come first in C# top-level programs
// ══════════════════════════════════════════════════════════════════════════════
using EcommerceAPI.Config;
using EcommerceAPI.Data;
using EcommerceAPI.Middleware;
using EcommerceAPI.Repositories;
using EcommerceAPI.Repositories.Interfaces;
using EcommerceAPI.Services;
using EcommerceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Stripe;
using System.Text;
using System.Text.Json.Serialization;

// ── Npgsql: Fix DateTime ↔ timestamptz compatibility (MUST be before builder) ──
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

var builder = WebApplication.CreateBuilder(args);

// ── Render / PaaS dynamic PORT binding ──────────────────────────────────────
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// ── Database ─────────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new InvalidOperationException("Database connection string is not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, sql =>
    {
        sql.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);
    }));

// ── JWT Configuration ────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Secret"]
    ?? Environment.GetEnvironmentVariable("Jwt__Secret")
    ?? throw new InvalidOperationException("JWT Secret is not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EcommerceAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EcommerceClient";

if (jwtKey.Length < 32)
    throw new InvalidOperationException("JWT Secret must be at least 32 characters long.");

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

// ── bKash ────────────────────────────────────────────────────────────────────
builder.Services.Configure<BkashSettings>(builder.Configuration.GetSection("Bkash"));
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<BkashTokenService>();
builder.Services.AddHttpClient<BkashPaymentGateway>();
builder.Services.AddScoped<PaymentRecordService>();

// ── Email ─────────────────────────────────────────────────────────────────────
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));
builder.Services.AddScoped<IEmailService, EmailService>();

// ── SMS ──────────────────────────────────────────────────────────────────────
builder.Services.Configure<SmsNetBdSettings>(builder.Configuration.GetSection("SmsNetBd"));
builder.Services.AddHttpClient<ISmsService, SmsNetBdService>();

// ── SSLCommerz ───────────────────────────────────────────────────────────────
builder.Services.AddHttpClient("sslcommerz");
builder.Services.AddScoped<SslCommerzService>();

// ── SteadfastCourierService ───────────────────────────────────────────────────
builder.Services.Configure<SteadfastOptions>(builder.Configuration.GetSection("Steadfast"));
builder.Services.AddHttpClient<SteadfastCourierService>();

// ── Stripe ────────────────────────────────────────────────────────────────────
var stripeKey = builder.Configuration["Stripe:SecretKey"]
    ?? Environment.GetEnvironmentVariable("Stripe__SecretKey");
if (!string.IsNullOrEmpty(stripeKey))
{
    StripeConfiguration.ApiKey = stripeKey;
}

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "https://clickebd.xyz",
    "https://www.clickebd.xyz",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5085",
};

// Also read from config
var configOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
if (configOrigins != null)
{
    foreach (var o in configOrigins)
    {
        var normalized = o.Trim().TrimEnd('/');
        if (!string.IsNullOrEmpty(normalized))
            allowedOrigins.Add(normalized);
    }
}

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;
            var normalized = origin.Trim().TrimEnd('/');

            if (allowedOrigins.Contains(normalized)) return true;

            if (Uri.TryCreate(normalized, UriKind.Absolute, out var uri))
            {
                var host = uri.Host;
                return host.Equals("clickebd.xyz", StringComparison.OrdinalIgnoreCase)
                    || host.EndsWith(".clickebd.xyz", StringComparison.OrdinalIgnoreCase)
                    || host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase)
                    || host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
            }
            return false;
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

// ── Controllers + JSON ────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition =
            JsonIgnoreCondition.WhenWritingNull;
    });

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BDFashions Ecommerce API",
        Version = "v1",
        Description = "ASP.NET Core Web API – BDFashions E-Commerce"
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

// ── Forwarded Headers (for Reverse Proxy / Docker / Nginx) ──────────────────
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

app.UseForwardedHeaders();

// ── Auto-migrate on startup ───────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
// Swagger available in ALL environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "BDFashions Ecommerce API v1");
    c.RoutePrefix = "swagger";
});

// HTTPS redirect only in Development (Render handles HTTPS termination)
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS MUST come before Authentication/Authorization
app.UseCors("AllowFrontend");

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=2592000,immutable");
    }
});
app.UseAuthentication();
app.UseAuthorization();

// Health check endpoints
app.MapGet("/", () => Results.Ok(new { status = "ok", service = "BDFashions Ecommerce API", version = "1.0" }));
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.Run();
