using Testcontainers.PostgreSql;

namespace API.Tests.Repository;

/// <summary>
/// Starts a real PostgreSQL 16 container once for the entire test class.
/// IAsyncLifetime integrates with xUnit's async setup/teardown — InitializeAsync
/// runs before the first test, DisposeAsync runs after the last test.
///
/// The container is shared across all tests in JobListingRepositoryTests via
/// IClassFixture. Each individual test creates its own DbContext and seeds its
/// own rows, so tests never share database state.
/// </summary>
public class PostgreSqlContainerFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:16")
        .WithDatabase("careerhub_test")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    /// <summary>
    /// Connection string pointing at the running container.
    /// Available after InitializeAsync completes.
    /// </summary>
    public string ConnectionString => _container.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _container.DisposeAsync();
    }
}