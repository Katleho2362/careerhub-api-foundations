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

    // ── Rich application fields ─────────────────────────────────────
    // All nullable: existing seeded rows predate these columns, and a
    // migration cannot add non-null columns to a table with existing
    // rows without supplying a default. Nullability is also semantically
    // honest here — a dev-seeded application genuinely has no cover
    // letter, no phone number, etc.
    public string? Phone { get; set; }
    public string? CoverLetter { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? LinkedInUrl { get; set; }
    public bool? AvailableImmediately { get; set; }
    public int? NoticePeriodWeeks { get; set; }

    // Required navigation properties
    // null! tells the compiler EF Core will always populate these
    public JobListing JobListing { get; set; } = null!;
    public Applicant Applicant { get; set; } = null!;
}