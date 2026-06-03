using CareerHub.Api.DTOs;
using CareerHub.Api.Exceptions;
using CareerHub.Api.Mappings;
using CareerHub.Api.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CareerHub.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace CareerHub.Api.Controllers;

[ApiController]
[Route("jobs")]
public class JobsController (CareerHubDbContext context) : ControllerBase
{
    private readonly CareerHubDbContext _context = context;  // DbContext is injected by ASP.NET Core dependency injection.

     // =====================================================
    // GET ALL JOBS
    // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetJobs()
        {
            var jobs = await _context.JobListings
                .AsNoTracking()
                .Select(j => new JobResponse
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = j.Description,
                    CompanyName = j.Company.Name,
                    Location = j.Location,
                    Type = j.Type,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    PostedAt = j.PostedAt,
                    SalaryDisplay = j.SalaryMin == null && j.SalaryMax == null
                        ? "Salary not specified"
                        : j.SalaryMin != null && j.SalaryMax != null
                            ? $"R{j.SalaryMin:N0} – R{j.SalaryMax:N0}/month"
                            : j.SalaryMin != null
                                ? $"From R{j.SalaryMin:N0}/month"
                                : $"Up to R{j.SalaryMax:N0}/month",
                    ApplicationCount = j.Applications.Count()
                })
                .ToListAsync();

            return Ok(jobs);
        }


    // =====================================================
    // GET JOB BY ID
    // =====================================================

    [HttpGet("{id:guid}")]    // Public endpoint - anyone can view a job by ID
    public async Task<IActionResult> GetJobById(Guid id)
    {
        // var job = await _context.JobListings     // Finds a job by its primary key.
        //     .FindAsync(id);


        // if (job is null)
        // {
        //     throw new JobNotFoundException(id);
        // }

        // return Ok(JobMapping.ToResponse(job));

        var job = await _context.JobListings
        .AsNoTracking()
        .Include(j => j.Company)
        .Include(j => j.Applications)
            .ThenInclude(a => a.Applicant)
        .FirstOrDefaultAsync(j => j.Id == id);   // FindAsync doesn't support Include

    if (job is null)
        throw new JobNotFoundException(id);

    return Ok(JobMapping.ToResponse(job));

    }
    

    // =====================================================
    // CREATE JOB
    // =====================================================

    [Authorize(Roles = "Employer")]   // Only authenticated Employers can create new job listings
    [HttpPost]
    public async Task<IActionResult> CreateJob(CreateJobRequest request)
    {
        

      var duplicateJob = await _context.JobListings    // Checks if a matching job already exists without loading records.
        .AnyAsync(j =>
         j.Title == request.Title &&
         j.CompanyId == request.CompanyId);

        if (duplicateJob)
        {
            throw new DuplicateJobListingException(request.CompanyId.ToString(), request.Title);
        }

        var job = new JobListing
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CompanyId = request.CompanyId,
            Location = request.Location,
            Type = request.Type,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.JobListings.Add(job);

        await _context.SaveChangesAsync();    // Persists all tracked changes to PostgreSQL.

       // var response = JobMapping.ToResponse(job);
       // Reload with Company so the mapper can access job.Company.Name
        var created = await _context.JobListings
            .AsNoTracking()
            .Include(j => j.Company)
            .FirstAsync(j => j.Id == job.Id);

        return CreatedAtAction(
            nameof(GetJobById),
            new { id = job.Id },
            //response
            JobMapping.ToResponse(created)
        );
    }


    // =====================================================
    // UPDATE JOB
    // =====================================================

    [Authorize(Roles = "Employer")]     // Only authenticated Employers can update existing job listings
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateJob(Guid id, UpdateJobRequest request)
    {
        

        //var existingJob = await _context.JobListings.FindAsync(id);
            var existingJob = await _context.JobListings
            .Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (existingJob is null)
        {
            throw new JobNotFoundException(id);
        }

        existingJob.Title = request.Title;
        existingJob.Description = request.Description;
        existingJob.CompanyId = request.CompanyId;
        existingJob.Location = request.Location;
        existingJob.Type = request.Type;
        existingJob.SalaryMin = request.SalaryMin;
        existingJob.SalaryMax = request.SalaryMax;

        await _context.SaveChangesAsync();

        //var response = JobMapping.ToResponse(existingJob);

       // return Ok(response);
        return Ok(JobMapping.ToResponse(existingJob));
    }

    
    // =====================================================
    // DELETE JOB
    // =====================================================

    [Authorize(Roles = "Employer")]   // Only authenticated users with the Employer rolecan delete job listings
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
         var job = await _context.JobListings
            .FindAsync(id);

        if (job is null)
        {
            throw new JobNotFoundException(id);
        }

        _context.JobListings.Remove(job);    // Marks the entity for deletion.

        await _context.SaveChangesAsync();

        return NoContent();
    }
}