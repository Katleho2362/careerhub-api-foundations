using System.ComponentModel.DataAnnotations;

namespace CareerHub.Api.DTOs;

public class SubmitApplicationRequest
{
    [Required]
    public Guid ApplicantId { get; set; }

    // ── Rich application fields — all optional ──────────────────────
    // Mirrors the frontend's ApplicationRequest shape (Assignment 2.1's
    // ApplicationForm). None are [Required] here because the existing
    // dev/seeded applications were created without them, and a thin
    // submission (just ApplicantId) should still be technically valid
    // at this DTO layer even though the real form always sends all of
    // them — validation of "did the form actually fill these in" lives
    // in the Zod schema on the frontend, not duplicated here.
    [Phone]
    public string? Phone { get; set; }

    [MaxLength(2000)]
    public string? CoverLetter { get; set; }

    [Range(0, 50)]
    public int? YearsOfExperience { get; set; }

    [Url]
    public string? LinkedInUrl { get; set; }

    public bool? AvailableImmediately { get; set; }

    [Range(0, int.MaxValue)]
    public int? NoticePeriodWeeks { get; set; }
}