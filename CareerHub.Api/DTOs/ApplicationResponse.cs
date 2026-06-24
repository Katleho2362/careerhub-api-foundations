using CareerHub.Api.Enums;

namespace CareerHub.Api.DTOs;

public class ApplicationResponse
{
    public Guid JobListingId { get; set; }
    public Guid ApplicantId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public ApplicationStatus Status { get; set; }

    // ── Rich application fields ──────────────────────────────────────
    public string? Phone { get; set; }
    public string? CoverLetter { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? LinkedInUrl { get; set; }
    public bool? AvailableImmediately { get; set; }
    public int? NoticePeriodWeeks { get; set; }
}