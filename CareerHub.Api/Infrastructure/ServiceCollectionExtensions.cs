using CareerHub.Api.Repositories;
using CareerHub.Api.Services;

namespace CareerHub.Api.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddJobListingFeature(this IServiceCollection services)
    {
        services.AddScoped<IJobListingRepository, JobListingRepository>();

        //Correct version
        services.AddScoped<IJobListingService, JobListingService>();

        // Lifetime Validation.
        //services.AddSingleton<IJobListingService, JobListingService>();
        return services;
    }

    public static IServiceCollection AddApplicationFeature(this IServiceCollection services)
    {
        services.AddScoped<IApplicationRepository, ApplicationRepository>();
        services.AddScoped<IApplicationService, ApplicationService>();
        return services;
    }
 

        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            // Singleton — holds no request state, safe to share across all requests
            services.AddSingleton<SlowQueryInterceptor>();
            return services;
        }

}