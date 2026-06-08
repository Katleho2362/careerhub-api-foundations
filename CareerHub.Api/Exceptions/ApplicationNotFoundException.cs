namespace CareerHub.Api.Exceptions;

public class ApplicationNotFoundException : Exception
{
    public ApplicationNotFoundException(
        Guid jobListingId,
        Guid applicantId)
        : base(
            $"Application for applicant '{applicantId}' " +
            $"on listing '{jobListingId}' was not found.")
    {
    }
}