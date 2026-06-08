namespace CareerHub.Api.DTOs;

public record JobListingFilterQuery
{
    // Filters — all optional
    public string? Location { get; init; }
    public string? EmploymentType { get; init; }
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public Guid? CompanyId { get; init; }

    // Sort
    public string Sort { get; init; } = "postedAt";
    public string Dir { get; init; } = "";
}