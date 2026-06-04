using CareerHub.Api.DTOs;

namespace CareerHub.Api.Services;

public interface IJobListingService
{
    Task<IEnumerable<JobResponse>> GetActiveListingsAsync();
    Task<JobResponse> GetListingByIdAsync(Guid id);
    Task<JobResponse> CreateListingAsync(CreateJobRequest request);
    Task<JobResponse> UpdateListingAsync(Guid id, UpdateJobRequest request);
    Task CloseListingAsync(Guid id);
}