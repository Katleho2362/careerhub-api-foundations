using System.Text.Json.Serialization;
using Scalar.AspNetCore;
using CareerHub.Api.Middleware;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Configure Serilog to write logs to the console
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Read the JWT secret key from appsettings.Development.json
var secretKey =
    builder.Configuration["Jwt:SecretKey"]!;

// ==========================================
// JWT Authentication Configuration
// ==========================================
// Registers JWT Bearer authentication and
// configures how incoming tokens are validated.
builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                // We don't validate issuer or audience
                // for this assignment
                ValidateIssuer = false,
                ValidateAudience = false,

                // Reject expired tokens
                ValidateLifetime = true,

                // Verify the token was signed using our secret key
                ValidateIssuerSigningKey = true,

                // Secret key used to validate signatures
                IssuerSigningKey =
                    new SymmetricSecurityKey(
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
// Allows requests from the Next.js frontend
// running on localhost:3000.
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Register MVC controllers and configure JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings instead of integers
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

// Enables OpenAPI document generation
builder.Services.AddOpenApi();

// Registers RFC7807 Problem Details responses
builder.Services.AddProblemDetails();

// Registers custom global exception handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

// ==========================================
// Development-Only API Documentation
// ==========================================
if (app.Environment.IsDevelopment())
{
    // OpenAPI JSON endpoint
    app.MapOpenApi();

    // Scalar API documentation UI
    app.MapScalarApiReference();
}

// ==========================================
// Middleware Pipeline
// ==========================================

// Handles uncaught exceptions globally
app.UseExceptionHandler();

// Generates ProblemDetails responses
// for HTTP status code errors
app.UseStatusCodePages();

// Logs all HTTP requests using Serilog
app.UseSerilogRequestLogging();

// Applies the named CORS policy
app.UseCors("FrontendPolicy");

// Redirect HTTP requests to HTTPS
app.UseHttpsRedirection();

// Validates JWT tokens and creates User claims
app.UseAuthentication();

// Enforces [Authorize] and role requirements
app.UseAuthorization();

// Maps controller endpoints
app.MapControllers();

// Starts the application
app.Run();