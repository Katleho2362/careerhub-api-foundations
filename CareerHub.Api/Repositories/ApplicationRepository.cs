using CareerHub.Api.Data;
using CareerHub.Api.DTOs;
using CareerHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareerHub.Api.Repositories;

public class ApplicationRepository(CareerHubDbContext context) : IApplicationRepository
{
    private readonly CareerHubDbContext _context = context;

    public async Task<bool> HasApplicantAppliedAsync(Guid jobListingId, Guid applicantId)
    {
        return await _context.Applications
            .AnyAsync(a => a.JobListingId == jobListingId && a.ApplicantId == applicantId);
    }

    public async Task<bool> ApplicantExistsAsync(Guid applicantId)
    {
        return await _context.Applicants.AnyAsync(a => a.Id == applicantId);
    }

    public async Task<IEnumerable<ApplicationResponse>> GetApplicationsForListingAsync(Guid jobListingId)
    {
        return await _context.Applications
            .AsNoTracking()
            .Where(a => a.JobListingId == jobListingId)
            .Select(a => new ApplicationResponse
            {
                JobListingId = a.JobListingId,
                ApplicantId = a.ApplicantId,
                ApplicantName = a.Applicant.FullName,
                SubmittedAt = a.SubmittedAt,
                Status = a.Status
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<ApplicationResponse>> GetApplicationsByApplicantAsync(Guid applicantId)
    {
        return await _context.Applications
            .AsNoTracking()
            .Where(a => a.ApplicantId == applicantId)
            .Select(a => new ApplicationResponse
            {
                JobListingId = a.JobListingId,
                ApplicantId = a.ApplicantId,
                ApplicantName = a.Applicant.FullName,
                SubmittedAt = a.SubmittedAt,
                Status = a.Status
            })
            .ToListAsync();
    }

    public async Task<Application?> GetEntityAsync(Guid jobListingId, Guid applicantId)
    {
        return await _context.Applications
            .FirstOrDefaultAsync(a =>
                a.JobListingId == jobListingId &&
                a.ApplicantId == applicantId);
    }

    public async Task AddAsync(Application application)
    {
        _context.Applications.Add(application);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateStatusAsync(Application application)
    {
        _context.Applications.Update(application);
        await _context.SaveChangesAsync();
    }
}