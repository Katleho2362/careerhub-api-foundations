using CareerHub.Api.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CareerHub.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An exception occurred: {Message}", exception.Message);

        var statusCode = exception switch
        {
            JobNotFoundException              => StatusCodes.Status404NotFound,
            CompanyNotFoundException          => StatusCodes.Status404NotFound,
            DuplicateJobListingException      => StatusCodes.Status409Conflict,
            DuplicateApplicationException     => StatusCodes.Status409Conflict,
            ListingClosedException            => StatusCodes.Status422UnprocessableEntity,
            InvalidStatusTransitionException  => StatusCodes.Status422UnprocessableEntity,
            UnauthorisedApplicantException    => StatusCodes.Status403Forbidden,
            ArgumentException                 => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException       => StatusCodes.Status403Forbidden,
            _                                 => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = GetTitle(statusCode),
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }

    private static string GetTitle(int statusCode) =>
        statusCode switch
        {
            StatusCodes.Status400BadRequest           => "Bad Request",
            StatusCodes.Status403Forbidden            => "Forbidden",
            StatusCodes.Status404NotFound             => "Resource Not Found",
            StatusCodes.Status409Conflict             => "Resource Conflict",
            StatusCodes.Status422UnprocessableEntity  => "Unprocessable Request",
            _                                         => "Internal Server Error"
        };
}