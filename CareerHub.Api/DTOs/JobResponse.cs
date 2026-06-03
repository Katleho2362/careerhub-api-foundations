using CareerHub.Api.Enums;

namespace CareerHub.Api.DTOs;

public class JobResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    //public string Company { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public JobType Type { get; set; }

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    public DateTime PostedAt { get; set; }

    public string SalaryDisplay { get; set; } = string.Empty;

    public int ApplicationCount { get; set; }  
}