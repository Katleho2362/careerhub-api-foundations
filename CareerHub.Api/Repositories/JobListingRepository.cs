using CareerHub.Api.Data;
using CareerHub.Api.DTOs;
using CareerHub.Api.Models;
using Microsoft.EntityFrameworkCore;
using CareerHub.Api.Mappings;

namespace CareerHub.Api.Repositories;

public class JobListingRepository(CareerHubDbContext context) : IJobListingRepository
{
    private readonly CareerHubDbContext _context = context;

    public async Task<IEnumerable<JobResponse>> GetActiveListingsAsync()
    {
        return await _context.JobListings
            .AsNoTracking()
            .Where(j => j.IsActive)
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
                ClosingDate = j.ClosingDate,
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
    }

    public async Task<JobResponse?> GetListingByIdAsync(Guid id)
    {
        var job = await _context.JobListings
            .AsNoTracking()
            .Include(j => j.Company)
            .Include(j => j.Applications)
                .ThenInclude(a => a.Applicant)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job is null) return null;

        return JobMapping.ToResponse(job);
    }

    public async Task<bool> IsListingOpenAsync(Guid id)
    {
        return await _context.JobListings
            .AnyAsync(j => j.Id == id && j.IsActive && j.ClosingDate > DateTime.UtcNow);
    }

    public async Task<bool> ListingExistsAsync(Guid id)
    {
        return await _context.JobListings.AnyAsync(j => j.Id == id);
    }

    public async Task<bool> CompanyExistsAsync(Guid companyId)
    {
        return await _context.Companies.AnyAsync(c => c.Id == companyId);
    }

    public async Task<bool> DuplicateListingExistsAsync(Guid companyId, string title)
    {
        return await _context.JobListings
            .AnyAsync(j => j.CompanyId == companyId && j.Title == title);
    }

    public async Task<JobListing?> GetEntityByIdAsync(Guid id)
    {
        return await _context.JobListings.FirstOrDefaultAsync(j => j.Id == id);
    }

    public async Task AddAsync(JobListing listing)
    {
        _context.JobListings.Add(listing);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(JobListing listing)
    {
        _context.JobListings.Update(listing);
        await _context.SaveChangesAsync();
    }

    public async Task CloseAsync(Guid id)
    {
        var listing = await _context.JobListings.FirstOrDefaultAsync(j => j.Id == id);
        if (listing is null) return;
        listing.IsActive = false;
        await _context.SaveChangesAsync();
    }
}