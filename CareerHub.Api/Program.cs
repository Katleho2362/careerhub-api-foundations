using System.Text.Json.Serialization;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();

builder.Services.AddProblemDetails(); // Registers standard Problem Details error responses

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Global exception handling
app.UseExceptionHandler();

// Standard ProblemDetails for status code errors
app.UseStatusCodePages();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();