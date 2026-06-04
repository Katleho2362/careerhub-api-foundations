using CareerHub.Api.DTOs;
using CareerHub.Api.Models;

namespace CareerHub.Api.Mappings;

public static class JobMapping
{
    public static JobResponse ToResponse(JobListing job) => new()
    {
        Id = job.Id,
        Title = job.Title,
        Description = job.Description,
        CompanyName = job.Company.Name,
        Location = job.Location,
        Type = job.Type,
        SalaryMin = job.SalaryMin,
        SalaryMax = job.SalaryMax,
        PostedAt = job.PostedAt,
        ClosingDate = job.ClosingDate,              // ← NEW
        SalaryDisplay = job.SalaryMin == null && job.SalaryMax == null
            ? "Salary not specified"
            : job.SalaryMin != null && job.SalaryMax != null
                ? $"R{job.SalaryMin:N0} – R{job.SalaryMax:N0}/month"
            : job.SalaryMin != null
                ? $"From R{job.SalaryMin:N0}/month"
                : $"Up to R{job.SalaryMax:N0}/month",
        ApplicationCount = job.Applications.Count
    };

// we create a readable salary string 
    private static string FormatSalary(decimal? salaryMin, decimal? salaryMax)
    {
        if (salaryMin.HasValue && salaryMax.HasValue)
        {
            return $"R{salaryMin.Value:N0} – R{salaryMax.Value:N0}/month";
        }

        if (salaryMin.HasValue)
        {
            return $"From R{salaryMin.Value:N0}/month";
        }

        if (salaryMax.HasValue)
        {
            return $"Up to R{salaryMax.Value:N0}/month";
        }

        return "Salary not specified";
    }
}