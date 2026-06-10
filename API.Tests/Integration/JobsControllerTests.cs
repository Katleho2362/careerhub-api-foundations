using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using API.Tests.Intergration;
using System.Net.Http.Json;
using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using System.Text.Json;
using System.Text.Json.Serialization;


namespace API.Tests.Integration;

public class JobsControllerTests : IClassFixture<WebApplicationFactoryFixture>
{
    private readonly WebApplicationFactoryFixture _factory;
    private readonly HttpClient _client;

    public JobsControllerTests(WebApplicationFactoryFixture factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetJobs_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/jobs");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetJobs_ResponseIsPagedEnvelope()
    {
        // Act
        //var response = await _client.GetAsync("/api/v1/jobs");
        var response = await _client.GetAsync("/api/v1/jobs?page=1&pageSize=5");

        // Assert
        response.EnsureSuccessStatusCode();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };

        var body = await response.Content.ReadFromJsonAsync<PagedResponse<JobResponse>>(options);

        Assert.NotNull(body);
        Assert.Equal(1, body.Page);
        Assert.Equal(5, body.PageSize);
        Assert.True(body.TotalCount >= 0);
        Assert.True(body.TotalPages >= 0);
        Assert.NotNull(body.Data);
    }
    
    [Fact]
    public async Task GetJobs_ResponseIncludesXTotalCountHeader()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/jobs");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.True(response.Headers.Contains("X-Total-Count"), "X-Total Count header must be present on aall paginated list");
    }

   [Fact]
    public async Task PosteJob_WithoutToken_Returns401()
    {
        // Arrange
        var request = new CreateJobRequest
        {
            Title = "Software Engineer",
            CompanyId = Guid.NewGuid(),
            Location = "Johannesburg",
            Description = "We are looking for a skilled software engineer to join our team.",
            Type = JobType.FullTime,
            SalaryMin = 20000,
            SalaryMax = 50000,
            ClosingDate = DateTime.UtcNow.AddDays(30)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/jobs", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteJob_WithoutToken_Returns401()
    {
        // Arrange
        var jobId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/v1/jobs/{jobId}");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // GetJobs_WithoutVersion_ReturnsSameStatusAsV1
    [Fact]
    public async Task GetJobs_WithoutVersion_ReturnsSameStatusAsV1()
    {
        var responseWithoutVersion =
            await _client.GetAsync("/api/jobs");
           // await _client.GetAsync("/api/v1/jobs");

        var responseV1 =
            await _client.GetAsync("/api/v1/jobs");

        Assert.Equal(
            responseV1.StatusCode,
            responseWithoutVersion.StatusCode);
    }

    // GetJobs_ResponseIncludesApiSupportedVersionsHeader
    [Fact]
    public async Task GetJobs_ResponseIncludesApiSupportedVersionsHeader()
    {
        var response =
            await _client.GetAsync("/api/v1/jobs");

        response.EnsureSuccessStatusCode();

        Assert.True(
            response.Headers.Contains("api-supported-versions"));

        var versions =
            string.Join(",",
                response.Headers.GetValues("api-supported-versions"));

        Assert.Contains("1.0", versions);
    }

    // =====================================================
    // POST APPLICATION WITHOUT TOKEN
    // POST /api/v1/jobs/{jobId}/applications
    // Should return 401 Unauthorized
    // =====================================================
    // 3. PostApplication_WithoutToken_Returns401
    [Fact]
    public async Task PostApplication_WithoutToken_Returns401()
    {
       // var jobId = Guid.NewGuid();
       var jobId =
          Guid.Parse("22222222-0000-0000-0000-000000000001");

        var request = new
        {
            ApplicantId = Guid.NewGuid()
        };

        var response =
            await _client.PostAsJsonAsync(
                $"/api/v1/jobs/{jobId}/applications",
                request);

        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }

        // =====================================================
        // GET JOB BY ID
        // Valid ID should never return 500
        // =====================================================

        // GetJobById_WithValidId_DoesNotReturn500
    [Fact]
    public async Task GetJobById_WithValidId_DoesNotReturn500()
    {
        //var id = Guid.NewGuid();
        var id =
         Guid.Parse("22222222-0000-0000-0000-000000000001");

        var response =
            await _client.GetAsync($"/api/v1/jobs/{id}");

        Assert.NotEqual(
            HttpStatusCode.InternalServerError,
            response.StatusCode);

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.NotFound);
    }

    // =====================================================
    // GET JOB BY ID
    // Response must contain a valid ETag header
    // =====================================================
    // GetJobById_ResponseIncludesETagHeader
    [Fact]
    public async Task GetJobById_ResponseIncludesETagHeader()
    {
        // Arrange - get a listing from the jobs endpoint
        var jobsResponse =
            await _client.GetAsync("/api/v1/jobs?page=1&pageSize=1");

        jobsResponse.EnsureSuccessStatusCode();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };

        var jobs =
            await jobsResponse.Content
                .ReadFromJsonAsync<PagedResponse<JobResponse>>(options);

        var jobId = jobs!.Data.First().Id;

        // Act
        var response =
            await _client.GetAsync($"/api/v1/jobs/{jobId}");

        // Assert
        response.EnsureSuccessStatusCode();

        Assert.True(response.Headers.Contains("ETag"));

        var etag =
            response.Headers.GetValues("ETag").First();

        Assert.False(string.IsNullOrWhiteSpace(etag));
    }

    // =====================================================
    // ETag Round Trip Test
    // First request gets ETag
    // Second request sends If-None-Match
    // Should return 304 Not Modified
    // =====================================================
    //GetJobById_WithMatchingETag_Returns304
    [Fact]
    public async Task GetJobById_WithMatchingETag_Returns304()
    {
        // Arrange - get a job first
        var jobsResponse =
            await _client.GetAsync("/api/v1/jobs?page=1&pageSize=1");

        jobsResponse.EnsureSuccessStatusCode();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };

        var jobs =
            await jobsResponse.Content
                .ReadFromJsonAsync<PagedResponse<JobResponse>>(options);

        var jobId = jobs!.Data.First().Id;

        // First request to get the ETag
        var firstResponse =
            await _client.GetAsync($"/api/v1/jobs/{jobId}");

        firstResponse.EnsureSuccessStatusCode();

        var etag =
            firstResponse.Headers
                .GetValues("ETag")
                .First();

        // Second request with If-None-Match
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"/api/v1/jobs/{jobId}");

        request.Headers.TryAddWithoutValidation(
            "If-None-Match",
            etag);

        // Act
        var secondResponse =
            await _client.SendAsync(request);

        // Assert
        Assert.Equal(
            HttpStatusCode.NotModified,
            secondResponse.StatusCode);
    }
}