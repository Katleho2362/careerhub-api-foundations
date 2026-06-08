using CareerHub.Api.Data;
using CareerHub.Api.DTOs;
using CareerHub.Api.Models;
using Microsoft.EntityFrameworkCore;
using CareerHub.Api.Mappings;
using CareerHub.Api.Exceptions;

namespace CareerHub.Api.Repositories;

public class JobListingRepository(CareerHubDbContext context) : IJobListingRepository
{
    private readonly CareerHubDbContext _context = context;

    // Compiled query for GetActiveListingsAsync — hot path, called on every job board page load.
    // Eliminates repeated LINQ expression tree compilation on every request.
    private static readonly Func<CareerHubDbContext, IAsyncEnumerable<JobResponse>>
        GetActiveListingsCompiled =
        EF.CompileAsyncQuery((CareerHubDbContext ctx) =>
            ctx.JobListings
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
                }));

    // Compiled query for IsListingOpenAsync — hot path, called on every application submission.
    // Sits at the entry point of the most write-heavy operation in the system.
    private static readonly Func<CareerHubDbContext, Guid, IAsyncEnumerable<bool>>
        IsListingOpenCompiled =
        EF.CompileAsyncQuery((CareerHubDbContext ctx, Guid id) =>
            ctx.JobListings
                .Where(j => j.Id == id && j.IsActive && j.ClosingDate > DateTime.UtcNow)
                .Select(j => true));

    // Delegates to the compiled query — public signature unchanged
    public async Task<IEnumerable<JobResponse>> GetActiveListingsAsync()
    {
        var results = new List<JobResponse>();
        await foreach (var item in GetActiveListingsCompiled(_context))
            results.Add(item);
        return results;
    }

    public async Task<JobResponse> PatchAsync(Guid id, UpdateJobListingRequest request)
    {
        var listing = await GetEntityByIdAsync(id);
        if (listing is null) throw new JobNotFoundException(id);

        // Apply only non-null fields
        if (request.Title is not null)       listing.Title = request.Title;
        if (request.Description is not null) listing.Description = request.Description;
        if (request.Location is not null)    listing.Location = request.Location;
        if (request.ExpiresAt is not null)   listing.ClosingDate = request.ExpiresAt.Value;

        // Salary — re-validate only if either was included
        var newMin = request.SalaryMin ?? listing.SalaryMin;
        var newMax = request.SalaryMax ?? listing.SalaryMax;

        if (request.SalaryMin is not null || request.SalaryMax is not null)
        {
            if (newMin.HasValue && newMax.HasValue && newMin > newMax)
                throw new ArgumentException("SalaryMax must be greater than SalaryMin.");

            listing.SalaryMin = newMin;
            listing.SalaryMax = newMax;
        }

        // ExpiresAt — re-validate only if included
        if (request.ExpiresAt is not null && request.ExpiresAt.Value <= DateTime.UtcNow)
            throw new ArgumentException("ExpiresAt must be in the future.");

        await _context.SaveChangesAsync();

        var updated = await GetListingByIdAsync(id);
        return updated!;
    }


    //iMPLEMENTING PAGINATED ACTIVE LISTINGS METHOD 
    public async Task<(IEnumerable<JobResponse> Items, int TotalCount)> GetActiveListingsPagedAsync(
        int page, int pageSize, JobListingFilterQuery filter)
    {
        // Start with base query — IQueryable, nothing executed yet
        var query = _context.JobListings
            .AsNoTracking()
            .Where(j => j.IsActive);

        // ── Filters ──────────────────────────────────────────────
        // Each clause only added when the parameter was provided
        if (!string.IsNullOrWhiteSpace(filter.Location))
            query = query.Where(j =>
                j.Location.ToLower().Contains(filter.Location.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.EmploymentType))
            query = query.Where(j =>
                j.Type.ToString() == filter.EmploymentType);

        if (filter.SalaryMin.HasValue)
            query = query.Where(j => j.SalaryMin >= filter.SalaryMin.Value);

        if (filter.SalaryMax.HasValue)
            query = query.Where(j => j.SalaryMax <= filter.SalaryMax.Value);

        if (filter.CompanyId.HasValue)
            query = query.Where(j => j.CompanyId == filter.CompanyId.Value);

        // ── Count (Query 1) — before Skip/Take ───────────────────
        var totalCount = await query.CountAsync();

        // ── Sorting ───────────────────────────────────────────────
        // Default direction per column unless dir= overrides it
        var ascending = filter.Dir.ToLower() == "asc";
        var descending = filter.Dir.ToLower() == "desc";

        IOrderedQueryable<JobListing> ordered = filter.Sort.ToLower() switch
        {
            "salarymin" => ascending || (!descending)
                ? query.OrderBy(j => j.SalaryMin)
                : query.OrderByDescending(j => j.SalaryMin),

            "salarymax" => descending || (!ascending)
                ? query.OrderByDescending(j => j.SalaryMax)
                : query.OrderBy(j => j.SalaryMax),

            "title" => ascending || (!descending)
                ? query.OrderBy(j => j.Title)
                : query.OrderByDescending(j => j.Title),

            // Default: postedAt descending — newest first
            _ => ascending
                ? query.OrderBy(j => j.PostedAt)
                : query.OrderByDescending(j => j.PostedAt)
        };

        // ── Data (Query 2) — Skip/Take after OrderBy ─────────────
        var items = await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        return (items, totalCount);
    }


    

    // Searches active, open listings using PostgreSQL full-text search.
    // Matches against the pre-computed tsvector column (Title + Description).
    // Supports stemming — "develop" matches "developer", "developing", "development".
    // Uses the GIN index — no sequential scan.
    public async Task<IEnumerable<JobResponse>> SearchAsync(string searchTerm)
    {
        return await _context.JobListings
            .AsNoTracking()
            .Where(j => j.IsActive
                && j.ClosingDate > DateTime.UtcNow
                && j.SearchVector.Matches(EF.Functions.ToTsQuery("english", searchTerm)))
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

    // Delegates to the compiled query — public signature unchanged
    public async Task<bool> IsListingOpenAsync(Guid id)
    {
        await foreach (var _ in IsListingOpenCompiled(_context, id))
            return true;
        return false;
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

       // Raw SQL required — EF Core cannot translate RANK() window functions or
       // COUNT(*) FILTER (WHERE ...) conditional aggregation from LINQ.
     // String interpolation inside FromSql is injection-safe because EF Core
      // converts interpolated parameters to DbParameter objects automatically.
        public async Task<IEnumerable<JobListingStatsResponse>> GetApplicationStatsAsync(Guid companyId)
        {
            var results = await _context.Database
                .SqlQuery<JobListingStatsResponse>($"""
                    SELECT
                        j."Id"          AS "ListingId",
                        j."Title"       AS "Title",
                        COUNT(a."ApplicantId")::int AS "TotalApplications",
                        RANK() OVER (ORDER BY COUNT(a."ApplicantId") DESC)::int AS "Rank",
                        COUNT(*) FILTER (WHERE a."Status" = 0)::int AS "Submitted",
                        COUNT(*) FILTER (WHERE a."Status" = 1)::int AS "UnderReview",
                        COUNT(*) FILTER (WHERE a."Status" = 2)::int AS "Shortlisted",
                        COUNT(*) FILTER (WHERE a."Status" = 3)::int AS "Rejected",
                        COUNT(*) FILTER (WHERE a."Status" = 4)::int AS "Offered"
                    FROM job_listings j
                    LEFT JOIN applications a ON a."JobListingId" = j."Id"
                    WHERE j."CompanyId" = {companyId}
                    AND j."IsActive" = true
                    GROUP BY j."Id", j."Title"
                    ORDER BY "Rank"
                    """)
                .ToListAsync();

            return results;
        }
}