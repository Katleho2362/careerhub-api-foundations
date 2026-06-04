using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using CareerHub.Api.Exceptions;
using CareerHub.Api.Models;
using CareerHub.Api.Repositories;

namespace CareerHub.Api.Services;

public class ApplicationService(
    IApplicationRepository applicationRepo,
    IJobListingRepository jobListingRepo) : IApplicationService
{
    private readonly IApplicationRepository _applicationRepo = applicationRepo;
    private readonly IJobListingRepository _jobListingRepo = jobListingRepo;

    public async Task<ApplicationResponse> SubmitApplicationAsync(
        Guid jobListingId, SubmitApplicationRequest request)
    {
        if (!await _jobListingRepo.IsListingOpenAsync(jobListingId))
            throw new ListingClosedException(jobListingId);

        if (!await _applicationRepo.ApplicantExistsAsync(request.ApplicantId))
            throw new JobNotFoundException(request.ApplicantId);

        if (await _applicationRepo.HasApplicantAppliedAsync(jobListingId, request.ApplicantId))
            throw new DuplicateApplicationException(jobListingId, request.ApplicantId);

        var application = new Application
        {
            JobListingId = jobListingId,
            ApplicantId = request.ApplicantId,
            SubmittedAt = DateTime.UtcNow,
            Status = ApplicationStatus.Submitted
        };

        await _applicationRepo.AddAsync(application);

        var applications = await _applicationRepo
            .GetApplicationsForListingAsync(jobListingId);

        return applications.First(a => a.ApplicantId == request.ApplicantId);
    }

    public async Task<IEnumerable<ApplicationResponse>> GetApplicationsForListingAsync(Guid jobListingId)
    {
        if (!await _jobListingRepo.ListingExistsAsync(jobListingId))
            throw new JobNotFoundException(jobListingId);

        return await _applicationRepo.GetApplicationsForListingAsync(jobListingId);
    }

    public async Task<IEnumerable<ApplicationResponse>> GetApplicationsByApplicantAsync(Guid applicantId)
    {
        return await _applicationRepo.GetApplicationsByApplicantAsync(applicantId);
    }

    public async Task<ApplicationResponse> UpdateStatusAsync(
        Guid jobListingId, Guid applicantId, ApplicationStatus newStatus)
    {
        var application = await _applicationRepo.GetEntityAsync(jobListingId, applicantId);
        if (application is null) throw new JobNotFoundException(jobListingId);

        if (!ApplicationStatusTransitions.IsPermitted(application.Status, newStatus))
            throw new InvalidStatusTransitionException(
                application.Status.ToString(), newStatus.ToString());

        application.Status = newStatus;
        await _applicationRepo.UpdateStatusAsync(application);

        var all = await _applicationRepo.GetApplicationsForListingAsync(jobListingId);
        return all.First(a => a.ApplicantId == applicantId);
    }

    public async Task WithdrawApplicationAsync(
        Guid jobListingId, Guid applicantId, Guid requestingApplicantId)
    {
        if (applicantId != requestingApplicantId)
            throw new UnauthorisedApplicantException(requestingApplicantId);

        var application = await _applicationRepo.GetEntityAsync(jobListingId, applicantId);
        if (application is null) throw new JobNotFoundException(jobListingId);

        application.Status = ApplicationStatus.Rejected;
        await _applicationRepo.UpdateStatusAsync(application);
    }
}