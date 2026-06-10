using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace API.Tests.Intergration;


// Starts the application Once for all Tests in a class
// IClassFixture<T> is the xUnit mechanism for shared, expensive setup 


public class WebApplicationFactoryFixture: WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Intergartion test run against a real database by default
            
        });
    }
}