namespace CareerHub.Api.DTOs;

// Response record for the application statistics endpoint
// Contains per-status application counts and listing rank by total applications
public record JobListingStatsResponse
{
    public Guid ListingId { get; init; }
    public string Title { get; init; } = string.Empty;
    public int TotalApplications { get; init; }
    public int Rank { get; init; }
    public int Submitted { get; init; }
    public int UnderReview { get; init; }
    public int Shortlisted { get; init; }
    public int Rejected { get; init; }
    public int Offered { get; init; }
}