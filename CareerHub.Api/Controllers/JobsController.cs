using CareerHub.Api.Stores;
using Microsoft.AspNetCore.Mvc;

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

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetJobById(int id)
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
}