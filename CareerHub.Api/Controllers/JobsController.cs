using CareerHub.Api.DTOs;
using CareerHub.Api.Exceptions;
using CareerHub.Api.Mappings;
using CareerHub.Api.Models;
using CareerHub.Api.Stores;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace CareerHub.Api.Controllers;

[ApiController]
[Route("jobs")]
public class JobsController : ControllerBase
{
    [HttpGet]   //  Public endpoint - anyone can view all jobs
    public async Task<IActionResult> GetJobs()
    {
        await Task.CompletedTask;

        var response = JobListingStore.Jobs
            .Select(JobMapping.ToResponse)
            .ToList();

        return Ok(response);
    }

    [HttpGet("{id:guid}")]    // Public endpoint - anyone can view a job by ID
    public async Task<IActionResult> GetJobById(Guid id)
    {
        await Task.CompletedTask;

        var job = JobListingStore.Jobs.FirstOrDefault(j => j.Id == id);

        if (job is null)
        {
            throw new JobNotFoundException(id);
        }

        return Ok(JobMapping.ToResponse(job));
    }
    

    [Authorize(Roles = "Employer")]   // Only authenticated Employers can create new job listings
    [HttpPost]
    public async Task<IActionResult> CreateJob(CreateJobRequest request)
    {
        await Task.CompletedTask;

        var duplicateJob = JobListingStore.Jobs.FirstOrDefault(j =>
            j.Title.Equals(request.Title, StringComparison.OrdinalIgnoreCase) &&
            j.Company.Equals(request.Company, StringComparison.OrdinalIgnoreCase));

        if (duplicateJob is not null)
        {
            throw new DuplicateJobListingException(request.Company, request.Title);
        }

        var job = new JobListing
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Company = request.Company,
            Location = request.Location,
            Type = request.Type,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        JobListingStore.Jobs.Add(job);

        var response = JobMapping.ToResponse(job);

        return CreatedAtAction(
            nameof(GetJobById),
            new { id = job.Id },
            response
        );
    }


    [Authorize(Roles = "Employer")]     // Only authenticated Employers can update existing job listings
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateJob(Guid id, UpdateJobRequest request)
    {
        await Task.CompletedTask;

        var existingJob = JobListingStore.Jobs.FirstOrDefault(j => j.Id == id);

        if (existingJob is null)
        {
            throw new JobNotFoundException(id);
        }

        existingJob.Title = request.Title;
        existingJob.Description = request.Description;
        existingJob.Company = request.Company;
        existingJob.Location = request.Location;
        existingJob.Type = request.Type;
        existingJob.SalaryMin = request.SalaryMin;
        existingJob.SalaryMax = request.SalaryMax;

        var response = JobMapping.ToResponse(existingJob);

        return Ok(response);
    }

    

    [Authorize(Roles = "Employer")]   // Only authenticated users with the Employer rolecan delete job listings
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        await Task.CompletedTask;

        var job = JobListingStore.Jobs.FirstOrDefault(j => j.Id == id);

        if (job is null)
        {
            throw new JobNotFoundException(id);
        }

        JobListingStore.Jobs.Remove(job);

        return NoContent();
    }
}