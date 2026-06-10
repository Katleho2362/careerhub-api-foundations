using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using CareerHub.Api.Exceptions;
using CareerHub.Api.Models;
using CareerHub.Api.Repositories;
using CareerHub.Api.Services;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace API.Tests.Unit.Services;

public class ApplicationServiceTests
{
    // Fresh substitutes per test 
    private readonly IApplicationRepository _applicationRepo;
    private readonly IJobListingRepository  _jobListingRepo;
    private readonly ApplicationService     _sut;

    public ApplicationServiceTests()
    {
        _applicationRepo = Substitute.For<IApplicationRepository>();
        _jobListingRepo  = Substitute.For<IJobListingRepository>();
        _sut             = new ApplicationService(_applicationRepo, _jobListingRepo);
    }

    

    /// Builds a raw Application entity in the given status.
    /// Used to set up GetByIdAsync / GetEntityAsync substitutes.
    
    private static Application ApplicationInStatus(
        Guid listingId, Guid applicantId, ApplicationStatus status) => new()
    {
        JobListingId = listingId,
        ApplicantId  = applicantId,
        SubmittedAt  = DateTime.UtcNow.AddDays(-1),
        Status       = status
    };

    
    /// Builds an ApplicationResponse matching the given status.
    /// Used to set up GetApplicationsForListingAsync substitutes.
    
    private static ApplicationResponse ResponseInStatus(
        Guid listingId, Guid applicantId, ApplicationStatus status) => new()
    {
        JobListingId  = listingId,
        ApplicantId   = applicantId,
        ApplicantName = "Test User",
        SubmittedAt   = DateTime.UtcNow.AddDays(-1),
        Status        = status
    };

    // =========================================================================
    // PatchStatusAsync — legal transitions
    // =========================================================================
    // [Theory] lets xUnit run one method with many input sets.
    // Each [InlineData] row is one test case; the output lists all of them
    // individually so a single failing row is immediately visible.
    // =========================================================================

    [Theory]
    [InlineData(ApplicationStatus.Submitted,   ApplicationStatus.UnderReview)]
    [InlineData(ApplicationStatus.UnderReview, ApplicationStatus.Shortlisted)]
    [InlineData(ApplicationStatus.UnderReview, ApplicationStatus.Rejected)]
    [InlineData(ApplicationStatus.Shortlisted, ApplicationStatus.Offered)]
    [InlineData(ApplicationStatus.Shortlisted, ApplicationStatus.Rejected)]
    public async Task UpdateStatusAsync_WhenTransitionIsLegal_CallsUpdateAsync(
        ApplicationStatus from, ApplicationStatus to)
    {
        // Arrange
        var listingId   = Guid.NewGuid();
        var applicantId = Guid.NewGuid();

        var entity = ApplicationInStatus(listingId, applicantId, from);

        // GetByIdAsync is what PatchStatusAsync calls first
        _applicationRepo
            .GetByIdAsync(listingId, applicantId)
            .Returns(entity);

        // After UpdateStatusAsync the service reloads via GetApplicationsForListingAsync
        _applicationRepo
            .GetApplicationsForListingAsync(listingId)
            .Returns(new List<ApplicationResponse>
            {
                ResponseInStatus(listingId, applicantId, to)
            });

        var request = new UpdateApplicationStatusRequest { Status = to };

        // Act — must not throw
        var result = await _sut.PatchStatusAsync(listingId, applicantId, request);

        // Assert — the repo's update method was called exactly once
        await _applicationRepo.Received(1).UpdateStatusAsync(entity);
        Assert.Equal(to, result.Status);
    }

    // =========================================================================
    // PatchStatusAsync — illegal transitions
    // =========================================================================

    [Theory]
    [InlineData(ApplicationStatus.Rejected,  ApplicationStatus.Submitted)]
    [InlineData(ApplicationStatus.Offered,   ApplicationStatus.Submitted)]
    [InlineData(ApplicationStatus.Rejected,  ApplicationStatus.UnderReview)]
    [InlineData(ApplicationStatus.Offered,   ApplicationStatus.Shortlisted)]
    public async Task UpdateStatusAsync_WhenTransitionIsIllegal_ThrowsAndNeverCallsUpdate(
        ApplicationStatus from, ApplicationStatus to)
    {
        // Arrange
        var listingId   = Guid.NewGuid();
        var applicantId = Guid.NewGuid();

        var entity = ApplicationInStatus(listingId, applicantId, from);

        _applicationRepo
            .GetByIdAsync(listingId, applicantId)
            .Returns(entity);

        var request = new UpdateApplicationStatusRequest { Status = to };

        // Act & Assert — the transition guard must fire before any write
        await Assert.ThrowsAsync<InvalidStatusTransitionException>(
            () => _sut.PatchStatusAsync(listingId, applicantId, request));

        // The database must never be touched after a rejected transition
        await _applicationRepo.DidNotReceive().UpdateStatusAsync(Arg.Any<Application>());
    }

    // =========================================================================
    // PatchStatusAsync — not found
    // =========================================================================

    [Fact]
    public async Task UpdateStatusAsync_WhenApplicationNotFound_ThrowsApplicationNotFoundException()
    {
        // Arrange
        var listingId   = Guid.NewGuid();
        var applicantId = Guid.NewGuid();

        // Returning null simulates the application not existing in the database
        _applicationRepo
            .GetByIdAsync(listingId, applicantId)
            .ReturnsNull();

        var request = new UpdateApplicationStatusRequest
        {
            Status = ApplicationStatus.UnderReview
        };

        // Act & Assert
        await Assert.ThrowsAsync<ApplicationNotFoundException>(
            () => _sut.PatchStatusAsync(listingId, applicantId, request));

        // No write should ever happen if the entity was not found
        await _applicationRepo.DidNotReceive().UpdateStatusAsync(Arg.Any<Application>());
    }
}