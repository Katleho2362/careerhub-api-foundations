using CareerHub.Api.Enums;

namespace CareerHub.Api.Models;

public class Application
{
    // These two together form the composite primary key
    // One applicant can only apply once to the same listing
    public Guid JobListingId { get; set; }
    public Guid ApplicantId { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;

    // Required navigation properties
    // null! tells the compiler EF Core will always populate these
    public JobListing JobListing { get; set; } = null!;
    public Applicant Applicant { get; set; } = null!;
}