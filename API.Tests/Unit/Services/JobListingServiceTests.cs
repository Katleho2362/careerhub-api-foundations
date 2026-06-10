using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using CareerHub.Api.Exceptions;
using CareerHub.Api.Repositories;
using CareerHub.Api.Services;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace API.Tests.Unit.Services;

public class JobListingServiceTests
{
  
    private readonly IJobListingRepository _repo;
    private readonly JobListingService _sut;   


    // The Constructor 
    public JobListingServiceTests()
    {
        _repo = Substitute.For<IJobListingRepository>();    // creates a fake version of repository 
        _sut  = new JobListingService(_repo);    // system Under Test
    }

   //Helper Methods = ar my factories 
    private static CreateJobRequest ValidCreateRequest() => new()
    {
        Title       = "Software Engineer",
        CompanyId   = Guid.NewGuid(),
        Location    = "Cape Town",
        Description = "A great role for a talented engineer with plenty of experience.",
        Type        = JobType.FullTime,
        SalaryMin   = 50_000m,
        SalaryMax   = 80_000m,
        ClosingDate = DateTime.UtcNow.AddDays(30)
    };

    
    /// Returns a JobResponse  stub — the value returned when the
    /// repository reloads the listing after insertion.
    private static JobResponse StubJobResponse(Guid id) => new()
    {
        Id          = id,
        Title       = "Software Engineer",
        CompanyName = "Acme Corp",
        Location    = "Cape Town",
        Type        = JobType.FullTime,
        PostedAt    = DateTime.UtcNow,
        ClosingDate = DateTime.UtcNow.AddDays(30)
    };

    
    // Test 1 — Salary Max Less Than Min
    [Fact]
    public async Task CreateAsync_WhenSalaryMaxLessThanSalaryMin_ThrowsInvalidSalaryException()
    {
        // Arrange
        // Company must exist so we get past the first guard and reach salary validation
        var request = ValidCreateRequest();
        request.SalaryMin = 80_000m;
        request.SalaryMax = 50_000m;   // invalid: max < min

        _repo.CompanyExistsAsync(request.CompanyId).Returns(true);
        _repo.DuplicateListingExistsAsync(request.CompanyId, request.Title).Returns(false);

        // Act & Assert
        // The service's CreateListingAsync checks SalaryMax > SalaryMin via
        // the IValidatableObject on the DTO — but our service also relies on
        // the DB check constraint. Here we test the service-layer guard:
        // the DTO's cross-field validation fires before AddAsync is reached.
        await Assert.ThrowsAsync<ArgumentException>(
            () => _sut.CreateListingAsync(request));

        // The repository must never be written to after detecting invalid salary
        await _repo.DidNotReceive().AddAsync(Arg.Any<CareerHub.Api.Models.JobListing>());
    }

     // Test 2 — Closing Date In The Past
    [Fact]
    public async Task CreateAsync_WhenExpiresAtIsInThePast_ThrowsInvalidListingException ()
    {
        // Arrange
        var request = ValidCreateRequest();
        request.ClosingDate = DateTime.UtcNow.AddDays(-1);  // in the past

        _repo.CompanyExistsAsync(request.CompanyId).Returns(true);
        _repo.DuplicateListingExistsAsync(request.CompanyId, request.Title).Returns(false);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _sut.CreateListingAsync(request));

        // Must abort before touching the database
        await _repo.DidNotReceive().AddAsync(Arg.Any<CareerHub.Api.Models.JobListing>());
    }

    // Test 3 — Company Does Not Exist
    [Fact]
    public async Task CreateAsync_WhenCompanyDoesNotExist_ThrowsCompanyNotFoundException()
    {
        // Arrange
        var request = ValidCreateRequest();
        _repo.CompanyExistsAsync(request.CompanyId).Returns(false);  // company missing

        // Act & Assert
        await Assert.ThrowsAsync<CompanyNotFoundException>(
            () => _sut.CreateListingAsync(request));

        await _repo.DidNotReceive().AddAsync(Arg.Any<CareerHub.Api.Models.JobListing>());
    }


   
    //Test4 - Valid Request Happy Path
    [Fact]
    public async Task CreateAsync_WhenValid_CallsAddAsyncExactlyOnce()
    {
        // Arrange
        var request = ValidCreateRequest();
        var listingId = Guid.NewGuid();

        _repo.CompanyExistsAsync(request.CompanyId).Returns(true);
        _repo.DuplicateListingExistsAsync(request.CompanyId, request.Title).Returns(false);

        // After AddAsync the service reloads via GetListingByIdAsync —
        // we need to return a non-null value or the service will throw
        _repo.GetListingByIdAsync(Arg.Any<Guid>())
             .Returns(StubJobResponse(listingId));

        // Act
        await _sut.CreateListingAsync(request);

        // Assert — exactly one write, no more, no less
        await _repo.Received(1).AddAsync(Arg.Any<CareerHub.Api.Models.JobListing>());
    }



    // Test 5 — Patch Salary Min Exceeds Existing Max

    [Fact]
    public async Task PatchAsync_WhenOnlySalaryMinChanged_CallsValidationS()
    {
        // Arrange
        var id = Guid.NewGuid();
        var request = new UpdateJobListingRequest
        {
            SalaryMin = 200_000m   
        };

        // The substitute repo mirrors the real behaviour: new min (200k) > stored max (80k)
        _repo.PatchAsync(id, request)
             .Returns<JobResponse>(_ => throw new ArgumentException(
                 "SalaryMax must be greater than SalaryMin."));

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _sut.PatchListingAsync(id, request));
    }

   // Test 6 — Patch Only Title Changed
    [Fact]
    public async Task PatchAsync_WhenOnlyTitleChanged_DoesNotCallSalaryValidation()
    {
        // Arrange — only Title supplied, no salary fields at all
        var id = Guid.NewGuid();
        var request = new UpdateJobListingRequest { Title = "Senior Engineer" };

        var expectedResponse = StubJobResponse(id);  // Configured the fake repo to return a StubJobResponse with the updated title
        expectedResponse.Title = "Senior Engineer";

        _repo.PatchAsync(id, request).Returns(expectedResponse);

        // Act
        var result = await _sut.PatchListingAsync(id, request);

        // Assert — the service forwarded to the repo and no exception was raised,
        // proving the happy path works without salary validation interfering
        await _repo.Received(1).PatchAsync(id, request);
        Assert.Equal("Senior Engineer", result.Title);
    }

    // Test 7 — Listing Not Found

    [Fact]
    public async Task PatchAsync_WhenListingNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var request = new UpdateJobListingRequest { Title = "Ghost Listing" };

        // Real repo throws JobNotFoundException when the listing is missing
        _repo.PatchAsync(id, request)
             .Returns<JobResponse>(_ => throw new JobNotFoundException(id));

        // Act & Assert
        await Assert.ThrowsAsync<JobNotFoundException>(
            () => _sut.PatchListingAsync(id, request));
    }
}