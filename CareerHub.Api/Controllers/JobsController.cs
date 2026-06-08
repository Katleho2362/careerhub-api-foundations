using CareerHub.Api.DTOs;
using CareerHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using Microsoft.AspNetCore.RateLimiting;

namespace CareerHub.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Route("api/v{version:apiVersion}/jobs")]
public class JobsController(IJobListingService jobListingService) : ControllerBase
{
    private readonly IJobListingService _jobListingService = jobListingService;

    // =====================================================
    // GET ALL JOBS (paginated + filtered + sorted)
    // GET /api/jobs?page=1&pageSize=20&location=cape+town&sort=salaryMin&dir=asc
    // =====================================================
    [HttpGet]
    public async Task<IActionResult> GetJobs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? location = null,
        [FromQuery] string? employmentType = null,
        [FromQuery] decimal? salaryMin = null,
        [FromQuery] decimal? salaryMax = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string sort = "postedAt",
        [FromQuery] string dir = "")
    {
        var filter = new JobListingFilterQuery
        {
            Location = location,
            EmploymentType = employmentType,
            SalaryMin = salaryMin,
            SalaryMax = salaryMax,
            CompanyId = companyId,
            Sort = sort,
            Dir = dir
        };

        var result = await _jobListingService.GetActiveListingsPagedAsync(page, pageSize, filter);
        Response.Headers["X-Total-Count"] = result.TotalCount.ToString();
        return Ok(result);
    }

    // =====================================================
    // PATCH JOB (partial update)
    // PATCH /api/jobs/{id}
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> PatchJob(Guid id, UpdateJobListingRequest request)
    {
        var updated = await _jobListingService.PatchListingAsync(id, request);
        return Ok(updated);
    }

        // =====================================================
        // SEARCH JOBS
        // GET /jobs/search?q={term}
        // =====================================================
        [EnableRateLimiting("search")]
        [HttpGet("search")]
        public async Task<IActionResult> SearchJobs([FromQuery] string q)
        {
            var results = await _jobListingService.SearchListingsAsync(q);
            return Ok(results);
        }

        // =====================================================
        // GET APPLICATION STATS
        // GET /jobs/stats?companyId={id}
        // =====================================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetApplicationStats([FromQuery] Guid companyId)
        {
            var stats = await _jobListingService.GetApplicationStatsAsync(companyId);
            return Ok(stats);
        }

    // =====================================================
    // GET JOB BY ID
    // =====================================================
    // [HttpGet("{id:guid}")]
    // public async Task<IActionResult> GetJobById(Guid id)
    // {
    //     var job = await _jobListingService.GetListingByIdAsync(id);
    //     return Ok(job);
    // }
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var job = await _jobListingService.GetListingByIdAsync(id);

        // Compute ETag from id + postedAt ticks + salaryMin
        var etag = $"\"{job.Id}-{job.PostedAt.Ticks}-{job.SalaryMin}\"";

        // If client sent If-None-Match and it matches, return 304
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);

        Response.Headers.ETag = etag;
        return Ok(job);
    }

    // =====================================================
    // CREATE JOB
    // =====================================================
    [EnableRateLimiting("post-listing")]
    [Authorize(Roles = "Employer")]
    [HttpPost]
    public async Task<IActionResult> CreateJob(CreateJobRequest request)
    {
        var created = await _jobListingService.CreateListingAsync(request);
        return CreatedAtAction(nameof(GetJobById), new { id = created.Id }, created);
    }

    // =====================================================
    // UPDATE JOB
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateJob(Guid id, UpdateJobRequest request)
    {
        var updated = await _jobListingService.UpdateListingAsync(id, request);
        return Ok(updated);
    }

    // =====================================================
    // CLOSE JOB
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> CloseJob(Guid id)
    {
        await _jobListingService.CloseListingAsync(id);
        return NoContent();
    }
}