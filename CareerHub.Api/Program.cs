    using System.Text.Json.Serialization;
    using Scalar.AspNetCore;
    using CareerHub.Api.Middleware;
    using Serilog;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.IdentityModel.Tokens;
    using System.Text;
    using CareerHub.Api.Data;
    using CareerHub.Api.Infrastructure;        // Needed for AddJobListingFeature / AddApplicationFeature extension methods
    using CareerHub.Api.Services;              // Needed for IJobListingService / IApplicationService in DI validation
    using Microsoft.EntityFrameworkCore;

    // Configure Serilog to write logs to the console
    Log.Logger = new LoggerConfiguration()
        .WriteTo.Console()
        .CreateLogger();

    var builder = WebApplication.CreateBuilder(args);

        // Register infrastructure services including the slow query interceptor
        builder.Services.AddInfrastructure();

        // Registers EF Core DbContext and connects it to PostgreSQL.
        // Adds the slow query interceptor to capture commands exceeding the threshold.
        builder.Services.AddDbContext<CareerHubDbContext>((serviceProvider, options) =>
        {
            options.UseNpgsql(
                builder.Configuration.GetConnectionString("DefaultConnection"));

            // Wire in the slow query interceptor
            var interceptor = serviceProvider.GetRequiredService<SlowQueryInterceptor>();
            options.AddInterceptors(interceptor);
        });

    // ==========================================
    // Application Services & Repositories
    // ==========================================
    // Instead of calling AddScoped directly here, we delegate to
    // extension methods defined in Infrastructure/ServiceCollectionExtensions.cs.
    // Each method registers one feature area — repositories and services together.
    // Program.cs stays clean and never calls AddScoped directly.
    builder.Services.AddJobListingFeature();
    builder.Services.AddApplicationFeature();

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

    // ==========================================
    // Build-time DI Validation
    // ==========================================
    // Instructs the DI container to validate the entire dependency graph
    // when the app starts. ValidateScopes catches captive dependencies —
    // for example a Singleton holding a Scoped service.
    // ValidateOnBuild catches missing registrations before the first request.
    // If the graph is invalid the app refuses to start and emits an error
    // identifying exactly which registration is misconfigured.
    builder.Host.UseDefaultServiceProvider(options =>
    {
        options.ValidateScopes = true;
        options.ValidateOnBuild = true;
    });

    var app = builder.Build();

    // ==========================================
    // Eager DI Resolution Check
    // ==========================================
    // Resolves the two primary services at startup inside a scoped context.
    // This forces the container to walk the full dependency chain for each
    // service and surface any lifetime or missing-registration errors
    // immediately with a clear message, before any HTTP request is handled.
    using (var scope = app.Services.CreateScope())
    {
        scope.ServiceProvider.GetRequiredService<IJobListingService>();
        scope.ServiceProvider.GetRequiredService<IApplicationService>();
    }

    // Seeds the database with initial data if the tables are empty.
    // Runs inside a scope so the DbContext is properly disposed after seeding.
    using (var scope = app.Services.CreateScope())
    {
        var context =
            scope.ServiceProvider.GetRequiredService<CareerHubDbContext>();

        SeedData.Seed(context);
    }

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

    // Enforces Authorize and role requirements
    app.UseAuthorization();

    // Maps controller endpoints
    app.MapControllers();

    // Starts the application
    app.Run();