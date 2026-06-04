namespace CareerHub.Api.Exceptions;

public class DuplicateApplicationException(Guid jobListingId, Guid applicantId)
    : Exception($"Applicant {applicantId} has already applied to listing {jobListingId}.");