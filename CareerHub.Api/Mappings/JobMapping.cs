using CareerHub.Api.DTOs;
using CareerHub.Api.Models;

namespace CareerHub.Api.Mappings;

public static class JobMapping
{

    //  we takes one job from store and converts it into the response format clients should see.
    public static JobResponse ToResponse(JobListing job)
    {
        return new JobResponse
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            //Company = job.Company.Name,  // made changes 
             CompanyName = job.Company?.Name ?? string.Empty,
            Location = job.Location,
            Type = job.Type,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            PostedAt = job.PostedAt,
            SalaryDisplay = FormatSalary(job.SalaryMin, job.SalaryMax),
            ApplicationCount = job.Applications.Count  
        };
    }


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