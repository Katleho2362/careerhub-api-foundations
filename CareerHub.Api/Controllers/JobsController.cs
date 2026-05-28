using CareerHub.Api.Stores;
using Microsoft.AspNetCore.Mvc;
using CareerHub.Api.DTOs;
using CareerHub.Api.Mappings;
using CareerHub.Api.Models;

namespace CareerHub.Api.Controllers;

[ApiController]
[Route("jobs")]
public class JobsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        await Task.CompletedTask;

        return Ok(JobListingStore.Jobs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        await Task.CompletedTask;

        var job = JobListingStore.Jobs.FirstOrDefault(j => j.Id == id);

        if (job is null)
        {
            return NotFound(new
            {
                message = $"Job with ID {id} was not found."
            });
        }

        return Ok(job);
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob (CreateJobRequest request)
    {
        await Task.CompletedTask;

        //Dupplication Check 

        var duplicateJob = JobListingStore.Jobs.FirstOrDefault(j => 
        j.Title.Equals(request.Title, StringComparison.OrdinalIgnoreCase) &&
        j.Company.Equals(request.Company, StringComparison.OrdinalIgnoreCase));

        if(duplicateJob != null)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Duplicate job listing",
                Detail = "A job with the same title and company already exists.",
                Status = StatusCodes.Status409Conflict
            });
        }

            //create new job 
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

                // Server-owned fields
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateJob(Guid id, UpdateJobRequest request)
    {
        await Task.CompletedTask;

        var existingJob = JobListingStore.Jobs.FirstOrDefault(j => j.Id == id);

        if (existingJob == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Job not found",
                Detail = $"Job with ID {id} was not found.",
                Status = StatusCodes.Status404NotFound
            });
        }

        existingJob.Title = request.Title;
        existingJob.Description = request.Description;
        existingJob.Company = request.Company;
        existingJob.Location = request.Location;
        existingJob.Type = request.Type;
        existingJob.SalaryMin = request.SalaryMin;
        existingJob.SalaryMax = request.SalaryMax;

        // PostedAt and IsActive are NOT changed

        var response = JobMapping.ToResponse(existingJob);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        await Task.CompletedTask;

        var job = JobListingStore.Jobs.FirstOrDefault(j => j.Id == id);

        if (job == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Job not found",
                Detail = $"Job with ID {id} was not found.",
                Status = StatusCodes.Status404NotFound
            });
        }

        JobListingStore.Jobs.Remove(job);

        return NoContent();
    }

}