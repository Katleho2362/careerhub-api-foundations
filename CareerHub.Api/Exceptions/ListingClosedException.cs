namespace CareerHub.Api.Exceptions;

public class ListingClosedException(Guid jobListingId)
    : Exception($"Job listing {jobListingId} is closed and no longer accepting applications.");