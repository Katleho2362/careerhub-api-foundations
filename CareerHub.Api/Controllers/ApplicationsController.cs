using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using CareerHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerHub.Api.Controllers;

[ApiController]
[Route("jobs/{jobId:guid}/applications")]
public class ApplicationsController(IApplicationService applicationService) : ControllerBase
{
    private readonly IApplicationService _applicationService = applicationService;

    // =====================================================
    // SUBMIT APPLICATION
    // =====================================================
    [Authorize(Roles = "Applicant")]
    [HttpPost]
    public async Task<IActionResult> SubmitApplication(Guid jobId, SubmitApplicationRequest request)
    {
        var result = await _applicationService.SubmitApplicationAsync(jobId, request);
        return CreatedAtAction(nameof(GetApplications), new { jobId }, result);
    }

    // =====================================================
    // GET APPLICATIONS FOR A JOB
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpGet]
    public async Task<IActionResult> GetApplications(Guid jobId)
    {
        var results = await _applicationService.GetApplicationsForListingAsync(jobId);
        return Ok(results);
    }

    // =====================================================
    // GET APPLICATIONS BY APPLICANT
    // =====================================================
    [Authorize(Roles = "Applicant")]
    [HttpGet("/applicants/{applicantId:guid}/applications")]
    public async Task<IActionResult> GetApplicationsByApplicant(Guid applicantId)
    {
        var results = await _applicationService.GetApplicationsByApplicantAsync(applicantId);
        return Ok(results);
    }

    // =====================================================
    // UPDATE APPLICATION STATUS
    // =====================================================
    [Authorize(Roles = "Employer")]
    [HttpPatch("{applicantId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid jobId, Guid applicantId, [FromBody] ApplicationStatus newStatus)
    {
        var result = await _applicationService.UpdateStatusAsync(jobId, applicantId, newStatus);
        return Ok(result);
    }

    // =====================================================
    // WITHDRAW APPLICATION
    // =====================================================
    [Authorize(Roles = "Applicant")]
    [HttpDelete("{applicantId:guid}")]
    public async Task<IActionResult> WithdrawApplication(
        Guid jobId, Guid applicantId, [FromQuery] Guid requestingApplicantId)
    {
        await _applicationService.WithdrawApplicationAsync(jobId, applicantId, requestingApplicantId);
        return NoContent();
    }
}