using System.Text.Json.Serialization;
using Scalar.AspNetCore;
using CareerHub.Api.Middleware;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CareerHub.Api.Data;
using CareerHub.Api.Infrastructure;
using CareerHub.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Asp.Versioning;                 
using Microsoft.AspNetCore.Diagnostics.HealthChecks;    
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.IO.Compression;
using CareerHub.Api.Transformers;
using Microsoft.AspNetCore.ResponseCompression;

// Configure Serilog to write logs to the console
Log.Logger = new LoggerConfiguration()
        .WriteTo.Console()
        .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

    // Register infrastructure services including the slow query interceptor
    builder.Services.AddInfrastructure();

    // Registers EF Core DbContext and connects it to PostgreSQL.
    builder.Services.AddDbContext<CareerHubDbContext>((serviceProvider, options) =>
    {
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnection"));

        var interceptor = serviceProvider.GetRequiredService<SlowQueryInterceptor>();
        options.AddInterceptors(interceptor);
    });

// ==========================================
// Application Services & Repositories
// ==========================================
builder.Services.AddJobListingFeature();
builder.Services.AddApplicationFeature();

// Read the JWT secret key from configuration
var secretKey = builder.Configuration["Jwt:SecretKey"]!;

// ==========================================
// JWT Authentication Configuration
// ==========================================
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey))
        };
    });

// Enables role-based authorization using [Authorize]
builder.Services.AddAuthorization();

// Replace default logging with Serilog
builder.Host.UseSerilog();

// ==========================================
// CORS Policy
// ==========================================
// "FrontendPolicy" — named origins for the real deployed frontends
// (React on Vercel, local React dev server).
//
// "FlutterDevPolicy" — Flutter web's dev server picks a random port
// on every `flutter run`, so pinning a single origin isn't practical
// during development. This policy allows any origin but does NOT
// allow credentials, and is only ever applied when
// app.Environment.IsDevelopment() is true — see below. It is never
// used in staging or production.
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://careerhub.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("X-Total-Count");
    });

    options.AddPolicy("FlutterDevPolicy", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true) // dev only — any localhost port
            .AllowAnyHeader()
            .AllowAnyMethod();
        // Deliberately no AllowCredentials() here: browsers reject
        // wildcard-origin + credentials combinations anyway, and this
        // API doesn't need cookies from the Flutter dev client.
    });
});

// Register MVC controllers and configure JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

// ==========================================
// API Versioning
// ==========================================
builder.Services.AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
    })
    .AddMvc();

// ==========================================
// Rate Limiting
// ==========================================
builder.Services.AddRateLimiter(options =>
{
    // Global: 200 requests / 60 seconds
    options.AddFixedWindowLimiter("global", o =>
    {
        o.PermitLimit = 200;
        o.Window = TimeSpan.FromSeconds(60);
        o.QueueLimit = 0;
    });

    // Search: 30 requests / 60 seconds (sliding window)
    options.AddSlidingWindowLimiter("search", o =>
    {
        o.PermitLimit = 30;
        o.Window = TimeSpan.FromSeconds(60);
        o.SegmentsPerWindow = 6;
        o.QueueLimit = 0;
    });

    // Apply: 5 requests / 60 minutes
    options.AddFixedWindowLimiter("apply", o =>
    {
        o.PermitLimit = 5;
        o.Window = TimeSpan.FromMinutes(60);
        o.QueueLimit = 0;
    });

    // Post listing: 10 requests / 60 minutes
    options.AddFixedWindowLimiter("post-listing", o =>
    {
        o.PermitLimit = 10;
        o.Window = TimeSpan.FromMinutes(60);
        o.QueueLimit = 0;
    });

    // 429 response with Retry-After header
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = 429;

        if (context.Lease.TryGetMetadata(
            MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                ((int)retryAfter.TotalSeconds).ToString();

            context.HttpContext.Response.ContentType = "text/plain";
            await context.HttpContext.Response.WriteAsync(
                $"Rate limit exceeded. Please retry after {(int)retryAfter.TotalSeconds} seconds.",
                cancellationToken);
        }
        else
        {
            context.HttpContext.Response.ContentType = "text/plain";
            await context.HttpContext.Response.WriteAsync(
                "Rate limit exceeded. Please retry after 60 seconds.",
                cancellationToken);
        }
    };
});

    // ==========================================
    // Response Compression
    // ==========================================
    // Brotli-first, Gzip-fallback
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<BrotliCompressionProvider>();
        options.Providers.Add<GzipCompressionProvider>();
        options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
            new[] { "application/json" });
    });
    builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
    {
        options.Level = CompressionLevel.Fastest;
    });


// ==========================================
// OpenAPI — with Document Transformer      
// ==========================================
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<CareerHubDocumentTransformer>();
});

// Registers RFC7807 Problem Details responses
builder.Services.AddProblemDetails();

// Registers custom global exception handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// ==========================================
// Health Checks                             
// ==========================================
builder.Services.AddHealthChecks()
    .AddDbContextCheck<CareerHubDbContext>(
        name: "database",
        tags: new[] { "ready" });

// ==========================================
// Build-time DI Validation
// ==========================================
builder.Host.UseDefaultServiceProvider(options =>
{
    options.ValidateScopes = true;
    options.ValidateOnBuild = true;
});



var app = builder.Build();

app.UseResponseCompression();

// ==========================================
// Eager DI Resolution Check
// ==========================================
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<IJobListingService>();
    scope.ServiceProvider.GetRequiredService<IApplicationService>();
}

// Seeds the database with initial data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CareerHubDbContext>();
    SeedData.Seed(context);
}

// // ==========================================
// // Development-Only API Documentation
// // ==========================================
// if (app.Environment.IsDevelopment())
// {
//     app.MapOpenApi();
//     app.MapScalarApiReference();
// }

// ==========================================
// API Documentation
// ==========================================
// OpenAPI JSON must be available in all environments so the frontend's
// openapi-typescript generator can fetch it from the deployed API, not
// just from a local dev server.
app.MapOpenApi();

if (app.Environment.IsDevelopment())
{
   
    app.MapScalarApiReference();
}

// ==========================================
// Middleware Pipeline
// ==========================================

// Handles uncaught exceptions globally
app.UseExceptionHandler();

// Generates ProblemDetails responses for HTTP status code errors
app.UseStatusCodePages();

// Logs all HTTP requests using Serilog
app.UseSerilogRequestLogging();

// Applies CORS — permissive "any localhost port" policy in development
// (so Flutter web's randomly-assigned dev port always works), the
// strict named-origin policy everywhere else.
if (app.Environment.IsDevelopment())
{
    app.UseCors("FlutterDevPolicy");
}
else
{
    app.UseCors("FrontendPolicy");
}

// Enforces rate limiting policies
app.UseRateLimiter();

// Redirect HTTP requests to HTTPS
app.UseHttpsRedirection();

// Validates JWT tokens and creates User claims
app.UseAuthentication();

// Enforces Authorize and role requirements
app.UseAuthorization();

// Maps controller endpoints
app.MapControllers().RequireRateLimiting("global");

// ==========================================
// Health Check Endpoints                    ← NEW
// ==========================================
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    // No checks — just "is the process alive?"
    Predicate = _ => false
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    // Only run checks tagged "ready" (the DB check)
    Predicate = check => check.Tags.Contains("ready")
});

// Starts the application
app.Run();

public partial class Program { }