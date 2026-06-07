using CareerHub.Api.DTOs;
using CareerHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerHub.Api.Controllers;

[ApiController]
[Route("jobs")]
public class JobsController(IJobListingService jobListingService) : ControllerBase
{
    private readonly IJobListingService _jobListingService = jobListingService;

    // =====================================================
    // GET ALL JOBS
    // =====================================================
    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        var jobs = await _jobListingService.GetActiveListingsAsync();
        return Ok(jobs);
    }


        // =====================================================
        // SEARCH JOBS
        // GET /jobs/search?q={term}
        // =====================================================
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
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var job = await _jobListingService.GetListingByIdAsync(id);
        return Ok(job);
    }

    // =====================================================
    // CREATE JOB
    // =====================================================
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