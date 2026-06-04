namespace CareerHub.Api.Exceptions;

public class UnauthorisedApplicantException(Guid applicantId)
    : Exception($"Applicant {applicantId} is not authorised to modify this application.");