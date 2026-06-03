using CareerHub.Api.Data;
using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using CareerHub.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerHub.Api.Controllers;

[ApiController]
[Route("jobs/{jobId:guid}/applications")]
public class ApplicationsController(CareerHubDbContext context) : ControllerBase
{
    private readonly CareerHubDbContext _context = context;

    // =====================================================
    // SUBMIT APPLICATION
    // POST /jobs/{jobId}/applications
    // Requires authentication — the caller must be an
    // Applicant. The ApplicantId comes from the request
    // body (in a real system this would come from the JWT
    // claim, but for this assignment we accept it as input).
    // Rejects duplicate applications via the composite PK.
    // =====================================================

    [Authorize(Roles = "Applicant")]
    [HttpPost]
    public async Task<IActionResult> SubmitApplication(Guid jobId, SubmitApplicationRequest request)
    {
        // Confirm the job listing exists
        var jobExists = await _context.JobListings
            .AnyAsync(j => j.Id == jobId);

        if (!jobExists)
            return NotFound(new { error = $"Job listing {jobId} was not found." });

        // Confirm the applicant exists
        var applicantExists = await _context.Applicants
            .AnyAsync(a => a.Id == request.ApplicantId);

        if (!applicantExists)
            return NotFound(new { error = $"Applicant {request.ApplicantId} was not found." });

        // Reject duplicate — same applicant cannot apply twice to the same listing
        var alreadyApplied = await _context.Applications
            .AnyAsync(a =>
                a.JobListingId == jobId &&
                a.ApplicantId == request.ApplicantId);

        if (alreadyApplied)
            return Conflict(new
            {
                error = "You have already applied for this job listing.",
                jobListingId = jobId,
                applicantId = request.ApplicantId
            });

        var application = new Application
        {
            JobListingId = jobId,
            ApplicantId = request.ApplicantId,
            SubmittedAt = DateTime.UtcNow,
            Status = ApplicationStatus.Submitted
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetApplications),
            new { jobId },
            new ApplicationResponse
            {
                JobListingId = application.JobListingId,
                ApplicantId = application.ApplicantId,
                ApplicantName = (await _context.Applicants.FindAsync(application.ApplicantId))!.FullName,
                SubmittedAt = application.SubmittedAt,
                Status = application.Status
            }
        );
    }

    // =====================================================
    // GET APPLICATIONS FOR A JOB
    // GET /jobs/{jobId}/applications
    // Read-only — no tracking, projected columns only.
    // =====================================================

    [Authorize(Roles = "Employer")]
    [HttpGet]
    public async Task<IActionResult> GetApplications(Guid jobId)
    {
        var jobExists = await _context.JobListings
            .AnyAsync(j => j.Id == jobId);

        if (!jobExists)
            return NotFound(new { error = $"Job listing {jobId} was not found." });

        var applications = await _context.Applications
            .AsNoTracking()
            .Where(a => a.JobListingId == jobId)
            .Select(a => new ApplicationResponse
            {
                JobListingId = a.JobListingId,
                ApplicantId = a.ApplicantId,
                ApplicantName = a.Applicant.FullName,
                SubmittedAt = a.SubmittedAt,
                Status = a.Status
            })
            .ToListAsync();

        return Ok(applications);
    }
}