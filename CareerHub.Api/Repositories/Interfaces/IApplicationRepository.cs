using CareerHub.Api.DTOs;
using CareerHub.Api.Models;

namespace CareerHub.Api.Repositories;

public interface IApplicationRepository
{
    // True if this applicant already applied to this listing
    Task<bool> HasApplicantAppliedAsync(Guid jobListingId, Guid applicantId);

    // True if the applicant record exists
    Task<bool> ApplicantExistsAsync(Guid applicantId);

    // All applications for one job listing
    Task<IEnumerable<ApplicationResponse>> GetApplicationsForListingAsync(Guid jobListingId);

    // All applications submitted by one applicant
    Task<IEnumerable<ApplicationResponse>> GetApplicationsByApplicantAsync(Guid applicantId);

    // Returns the raw entity so the service can update status
    Task<Application?> GetEntityAsync(Guid jobListingId, Guid applicantId);

    Task AddAsync(Application application);
    Task UpdateStatusAsync(Application application);
}