using CareerHub.Api.DTOs;
using CareerHub.Api.Models;

namespace CareerHub.Api.Repositories;

public interface IJobListingRepository
{
    // Returns all active listings with company name + application count
    Task<IEnumerable<JobResponse>> GetActiveListingsAsync();

    // Returns full detail for one listing including applicants
    Task<JobResponse?> GetListingByIdAsync(Guid id);

    // True if the listing exists and IsActive = true
    Task<bool> IsListingOpenAsync(Guid id);

    // True if the listing exists at all (active or not)
    Task<bool> ListingExistsAsync(Guid id);

    // True if the company exists
    Task<bool> CompanyExistsAsync(Guid companyId);

    // True if a listing with same title + companyId already exists
    Task<bool> DuplicateListingExistsAsync(Guid companyId, string title);

    // Returns the raw entity for update/close operations
    Task<JobListing?> GetEntityByIdAsync(Guid id);

    Task AddAsync(JobListing listing);
    Task UpdateAsync(JobListing listing);
    Task CloseAsync(Guid id);
}