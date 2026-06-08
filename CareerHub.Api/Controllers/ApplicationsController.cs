

using Asp.Versioning;
using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using CareerHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CareerHub.Api.Controllers;

[ApiController]
[ApiVersion(1)]
public class ApplicationsController(IApplicationService applicationService) : ControllerBase
{
    private readonly IApplicationService _applicationService = applicationService;

    // =====================================================
    // SUBMIT APPLICATION
    // POST /jobs/{jobId}/applications
    // =====================================================
    [EnableRateLimiting("apply")]
    [Authorize(Roles = "Applicant")]
    [HttpPost]
    [Route("api/v{version:apiVersion}/jobs/{jobId:guid}/applications")]
    public async Task<IActionResult> SubmitApplication(Guid jobId, SubmitApplicationRequest request)
    {
        var result = await _applicationService.SubmitApplicationAsync(jobId, request);
        return CreatedAtAction(nameof(GetApplications), new { jobId }, result);
    }

    // =====================================================
    // GET APPLICATIONS FOR A JOB
    // GET /jobs/{jobId}/applications
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpGet]
    [Route("api/v{version:apiVersion}/jobs/{jobId:guid}/applications")]
    public async Task<IActionResult> GetApplications(Guid jobId)
    {
        var results = await _applicationService.GetApplicationsForListingAsync(jobId);
        return Ok(results);
    }

    // =====================================================
    // GET APPLICATIONS BY APPLICANT
    // GET /applicants/{applicantId}/applications
    // =====================================================
    [Authorize(Roles = "Applicant")]
    [HttpGet]
    [Route("api/v{version:apiVersion}/applicants/{applicantId:guid}/applications")]
    public async Task<IActionResult> GetApplicationsByApplicant(Guid applicantId)
    {
        var results = await _applicationService.GetApplicationsByApplicantAsync(applicantId);
        return Ok(results);
    }

    // =====================================================
    // PATCH APPLICATION STATUS  (Part 5B)
    // PATCH /applications/{id}/status
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpPatch("api/v{version:apiVersion}/applications/{jobListingId:guid}/{applicantId:guid}/status")]
    public async Task<IActionResult> PatchApplicationStatus(
        Guid jobListingId,
        Guid applicantId,
        [FromBody] UpdateApplicationStatusRequest request)
    {
        var result = await _applicationService.PatchStatusAsync(
            jobListingId,
            applicantId,
            request);

        return Ok(result);
    }

    // =====================================================
    // GET APPLICATION BY ID (with ETag)
    // GET /api/v1/applications/{jobListingId}/{applicantId}
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpGet]
    [Route("api/v{version:apiVersion}/applications/{jobListingId:guid}/{applicantId:guid}")]
    public async Task<IActionResult> GetApplicationById(Guid jobListingId, Guid applicantId)
    {
        var applications = await _applicationService.GetApplicationsForListingAsync(jobListingId);
        var app = applications.FirstOrDefault(a => a.ApplicantId == applicantId);

        if (app is null) return NotFound();

        // Compute ETag from jobListingId + applicantId + status
        var etag = $"\"{app.JobListingId}-{app.ApplicantId}-{app.Status}\"";

        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);

        Response.Headers.ETag = etag;
        return Ok(app);
    }

    // =====================================================
    // WITHDRAW APPLICATION
    // DELETE /jobs/{jobId}/applications/{applicantId}
    // =====================================================
    [Authorize(Roles = "Applicant")]
    [HttpDelete]
    [Route("api/v{version:apiVersion}/jobs/{jobId:guid}/applications/{applicantId:guid}")]
    public async Task<IActionResult> WithdrawApplication(
        Guid jobId, Guid applicantId, [FromQuery] Guid requestingApplicantId)
    {
        await _applicationService.WithdrawApplicationAsync(jobId, applicantId, requestingApplicantId);
        return NoContent();
    }
}