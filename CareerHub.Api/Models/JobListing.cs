using CareerHub.Api.Enums;
using NpgsqlTypes;

namespace CareerHub.Api.Models;

// Information that our job posting will contain

public class JobListing
{
    public Guid Id { get; set; }

    // Replaces the old "Company" string property
    // CompanyId is the foreign key column in the database
    public Guid CompanyId { get; set; }

    // Navigation property — EF Core populates this when you Include() it
    public Company Company { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public JobType Type { get; set; }

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    public DateTime PostedAt { get; set; } = DateTime.UtcNow;

    public DateTime ClosingDate { get; set; } 

    public bool IsActive { get; set; }

    // Computed stored tsvector column — maintained by PostgreSQL automatically
    // Combines Title (weight A) and Description (weight B) for full-text search
    public NpgsqlTsVector SearchVector { get; set; } = null!;

    // One listing can receive many applications
    public ICollection<Application> Applications { get; set; } = [];
}