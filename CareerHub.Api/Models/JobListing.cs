using CareerHub.Api.Enums;

namespace CareerHub.Api.Models;

// Information that our job posting will contain
public class JobListing
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Company { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public JobType Type { get; set; }

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    // Set by the server when the job is created
    public DateTime PostedAt { get; set; }

    // Determines whether the job is active
    public bool IsActive { get; set; }
}