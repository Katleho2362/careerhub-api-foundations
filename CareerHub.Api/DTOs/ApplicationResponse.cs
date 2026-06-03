using CareerHub.Api.Enums;

namespace CareerHub.Api.DTOs;

public class ApplicationResponse
{
    public Guid JobListingId { get; set; }
    public Guid ApplicantId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public ApplicationStatus Status { get; set; }
}