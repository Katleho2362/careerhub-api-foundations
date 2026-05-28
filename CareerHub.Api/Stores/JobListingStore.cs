using CareerHub.Api.Models;
using CareerHub.Api.Enums;

namespace CareerHub.Api.Stores;

public static class JobListingStore
{

    // store our temporary data only 
    public static readonly List<JobListing> Jobs = new()
    {
        new JobListing{

             Title = "Junior Software Developer",
            Description = "Assist in developing and maintaining web applications.",
            Company = "Bitcube",
            Location = "Johannesburg",
            Type = JobType.FullTime,
            SalaryMin = 25000,
            SalaryMax = 40000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        },

        new JobListing
         {
            Id = Guid.NewGuid(),
            Title = "Frontend Developer Intern",
            Description = "Support frontend development using React and TypeScript.",
            Company = "CareerHub",
            Location = "Remote",
            Type = JobType.Internship,
            SalaryMin = 12000,
            SalaryMax = 18000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        },

        new JobListing
        {
            Id = Guid.NewGuid(),
            Title = "IT Support Technician",
            Description = "Provide technical support and troubleshoot user issues.",
            Company = "Tech Solutions",
            Location =   "Bloemfontein",
            Type = JobType.Contract,
            SalaryMin = 12000,
            SalaryMax = 18000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        }
        
    };
}