using CareerHub.Api.Enums;
using CareerHub.Api.Models;

namespace CareerHub.Api.Data;

public static class SeedData
{
    public static void Seed(CareerHubDbContext context)
    {
        // Guard — only seed if the database is empty
        if (context.Companies.Any()) return;

        // =====================================================
        // COMPANIES
        // =====================================================

        var bitcube = new Company
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000001"),
            Name = "Bitcube",
            Website = "https://bitcube.co.za",
            Industry = "Software Development"
        };

        var careerHub = new Company
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000002"),
            Name = "CareerHub",
            Website = "https://careerhub.co.za",
            Industry = "Recruitment"
        };

        var techSolutions = new Company
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000003"),
            Name = "Tech Solutions",
            Website = "https://techsolutions.co.za",
            Industry = "IT Services"
        };

        var dataForce = new Company
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000004"),
            Name = "DataForce",
            Website = "https://dataforce.co.za",
            Industry = "Data Analytics"
        };

        var cloudNine = new Company
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000005"),
            Name = "CloudNine",
            Website = "https://cloudnine.co.za",
            Industry = "Cloud Infrastructure"
        };

        context.Companies.AddRange(bitcube, careerHub, techSolutions, dataForce, cloudNine);
        context.SaveChanges();

        // =====================================================
        // JOB LISTINGS  (one per company — required for N+1 demo)
        // =====================================================

        var job1 = new JobListing
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000001"),
            Title = "Backend Developer",
            CompanyId = bitcube.Id,
            Description = "Build and maintain RESTful APIs using .NET and PostgreSQL.",
            Location = "Cape Town",
            Type = JobType.FullTime,
            SalaryMin = 35000,
            SalaryMax = 55000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        var job2 = new JobListing
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000002"),
            Title = "Talent Acquisition Specialist",
            CompanyId = careerHub.Id,
            Description = "Source and screen candidates for tech roles across South Africa.",
            Location = "Johannesburg",
            Type = JobType.FullTime,
            SalaryMin = 25000,
            SalaryMax = 38000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        var job3 = new JobListing
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000003"),
            Title = "IT Support Engineer",
            CompanyId = techSolutions.Id,
            Description = "Provide on-site and remote support for enterprise clients.",
            Location = "Durban",
            Type = JobType.Contract,
            SalaryMin = 18000,
            SalaryMax = 28000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        var job4 = new JobListing
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000004"),
            Title = "Data Analyst",
            CompanyId = dataForce.Id,
            Description = "Analyse large datasets and produce actionable business insights.",
            Location = "Remote",
            Type = JobType.FullTime,
            SalaryMin = 30000,
            SalaryMax = 45000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        var job5 = new JobListing
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000005"),
            Title = "DevOps Engineer",
            CompanyId = cloudNine.Id,
            Description = "Manage CI/CD pipelines and cloud infrastructure on AWS.",
            Location = "Remote",
            Type = JobType.FullTime,
            SalaryMin = 45000,
            SalaryMax = 70000,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.JobListings.AddRange(job1, job2, job3, job4, job5);
        context.SaveChanges();

        // =====================================================
        // APPLICANTS
        // =====================================================

        var applicant1 = new Applicant
        {
            Id = Guid.Parse("33333333-0000-0000-0000-000000000001"),
            FullName = "Sipho Ndlovu",
            Email = "sipho@example.com"
        };

        var applicant2 = new Applicant
        {
            Id = Guid.Parse("33333333-0000-0000-0000-000000000002"),
            FullName = "Ayanda Dlamini",
            Email = "ayanda@example.com"
        };

        var applicant3 = new Applicant
        {
            Id = Guid.Parse("33333333-0000-0000-0000-000000000003"),
            FullName = "Liam van der Berg",
            Email = "liam@example.com"
        };

        context.Applicants.AddRange(applicant1, applicant2, applicant3);
        context.SaveChanges();

        // =====================================================
        // APPLICATIONS  (so the detail endpoint has data to show)
        // =====================================================

        context.Applications.AddRange(
            new Application
            {
                JobListingId = job1.Id,
                ApplicantId = applicant1.Id,
                SubmittedAt = DateTime.UtcNow.AddDays(-3),
                Status = ApplicationStatus.Submitted
            },
            new Application
            {
                JobListingId = job1.Id,
                ApplicantId = applicant2.Id,
                SubmittedAt = DateTime.UtcNow.AddDays(-1),
                Status = ApplicationStatus.UnderReview
            },
            new Application
            {
                JobListingId = job4.Id,
                ApplicantId = applicant3.Id,
                SubmittedAt = DateTime.UtcNow.AddDays(-5),
                Status = ApplicationStatus.Shortlisted
            }
        );

        context.SaveChanges();
    }
}