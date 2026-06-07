using CareerHub.Api.DTOs;
using CareerHub.Api.Exceptions;
using CareerHub.Api.Models;
using CareerHub.Api.Repositories;


namespace CareerHub.Api.Services;

// No using Microsoft.EntityFrameworkCore here — ever.
public class JobListingService(
    IJobListingRepository jobListingRepo) : IJobListingService
{
    private readonly IJobListingRepository _jobListingRepo = jobListingRepo;

    public async Task<IEnumerable<JobResponse>> GetActiveListingsAsync()
    {
        return await _jobListingRepo.GetActiveListingsAsync();
    }

    public async Task<JobResponse> GetListingByIdAsync(Guid id)
    {
        var listing = await _jobListingRepo.GetListingByIdAsync(id);
        if (listing is null) throw new JobNotFoundException(id);
        return listing;
    }  

    public async Task<IEnumerable<JobResponse>> SearchListingsAsync(string searchTerm)
    {
        return await _jobListingRepo.SearchAsync(searchTerm);
    }

    public async Task<JobResponse> CreateListingAsync(CreateJobRequest request)
    {
        // Rule: company must exist
        if (!await _jobListingRepo.CompanyExistsAsync(request.CompanyId))
            throw new CompanyNotFoundException(request.CompanyId);

        // Rule: closing date must be in the future
        if (request.ClosingDate <= DateTime.UtcNow)
            throw new ArgumentException("Closing date must be in the future.");

        // Rule: no duplicate listing
        if (await _jobListingRepo.DuplicateListingExistsAsync(request.CompanyId, request.Title))
            throw new DuplicateJobListingException(request.CompanyId.ToString(), request.Title);

        var listing = new JobListing
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CompanyId = request.CompanyId,
            Location = request.Location,
            Type = request.Type,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            PostedAt = DateTime.UtcNow,
            ClosingDate = request.ClosingDate,
            IsActive = true
        };

        await _jobListingRepo.AddAsync(listing);

        // Reload via repo so response includes company name
        var created = await _jobListingRepo.GetListingByIdAsync(listing.Id);
        return created!;
    }

    public async Task<JobResponse> UpdateListingAsync(Guid id, UpdateJobRequest request)
    {
        var existing = await _jobListingRepo.GetEntityByIdAsync(id);
        if (existing is null) throw new JobNotFoundException(id);

        // Rule: cannot update a closed listing
        if (!existing.IsActive)
            throw new ListingClosedException(id);

        // Rule: only the owning company can update
        if (existing.CompanyId != request.CompanyId)
            throw new UnauthorizedAccessException(
                $"Company {request.CompanyId} does not own listing {id}.");

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.Location = request.Location;
        existing.Type = request.Type;
        existing.SalaryMin = request.SalaryMin;
        existing.SalaryMax = request.SalaryMax;
        existing.ClosingDate = request.ClosingDate;

        await _jobListingRepo.UpdateAsync(existing);

        var updated = await _jobListingRepo.GetListingByIdAsync(id);
        return updated!;
    }

    public async Task CloseListingAsync(Guid id)
    {
        if (!await _jobListingRepo.ListingExistsAsync(id))
            throw new JobNotFoundException(id);

        await _jobListingRepo.CloseAsync(id);
    }

    public async Task<IEnumerable<JobListingStatsResponse>> GetApplicationStatsAsync(Guid companyId)
    {
        if (!await _jobListingRepo.CompanyExistsAsync(companyId))
            throw new CompanyNotFoundException(companyId);

        return await _jobListingRepo.GetApplicationStatsAsync(companyId);
    }
}