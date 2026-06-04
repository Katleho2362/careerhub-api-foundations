using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;

namespace CareerHub.Api.Services;

public interface IApplicationService
{
    Task<ApplicationResponse> SubmitApplicationAsync(Guid jobListingId, SubmitApplicationRequest request);
    Task<IEnumerable<ApplicationResponse>> GetApplicationsForListingAsync(Guid jobListingId);
    Task<IEnumerable<ApplicationResponse>> GetApplicationsByApplicantAsync(Guid applicantId);
    Task<ApplicationResponse> UpdateStatusAsync(Guid jobListingId, Guid applicantId, ApplicationStatus newStatus);
    Task WithdrawApplicationAsync(Guid jobListingId, Guid applicantId, Guid requestingApplicantId);
}