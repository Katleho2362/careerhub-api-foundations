using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

//using Microsoft.OpenApi.Models;

namespace CareerHub.Api.Transformers;

public class CareerHubDocumentTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Info = new OpenApiInfo
        {
            Title       = "CareerHub API",
            Version     = "v1",
            Description = "REST API for managing job listings and applications.",

            Contact     = new OpenApiContact
            {
                Name  = "CareerHub Team",
                Email = "api@careerhub.dev",
                Url   = new Uri("https://careerhub.dev")
            }
        };
        return Task.CompletedTask;
    }
}