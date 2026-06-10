using CareerHub.Api.Data;
using CareerHub.Api.DTOs;
using CareerHub.Api.Enums;
using CareerHub.Api.Models;
using CareerHub.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Repository;

/// <summary>
/// Repository-level tests against a real PostgreSQL 16 container.
/// Each test creates a fresh DbContext via CreateContext(), seeds only the rows
/// it needs, and asserts against a clean slice of data.
///
/// Why not the in-memory provider?
/// — Check constraints (ck_job_listings_salary_range_valid, ck_job_listings_closing_after_posted)
///   are DDL enforced by PostgreSQL. The in-memory provider ignores them silently.
/// — The tsvector computed column and GIN index are PostgreSQL-specific.
///   The in-memory provider never evaluates HasComputedColumnSql and cannot
///   translate SearchVector.Matches(EF.Functions.ToTsQuery(...)).
/// — EF.CompileAsyncQuery expression trees are translated against the registered
///   provider. An in-memory plan is not a PostgreSQL plan — bugs in SQL translation
///   would be invisible.
/// </summary>
public class JobListingRepositoryTests : IClassFixture<PostgreSqlContainerFixture>
{
    private readonly PostgreSqlContainerFixture _fixture;

    public JobListingRepositoryTests(PostgreSqlContainerFixture fixture)
    {
        _fixture = fixture;
    }

    // ── DbContext factory ─────────────────────────────────────────────────

    /// <summary>
    /// Creates a fresh CareerHubDbContext connected to the real PostgreSQL container
    /// and applies all migrations so the full schema — check constraints, indexes,
    /// computed columns — is in place before any test inserts data.
    /// </summary>
    private CareerHubDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<CareerHubDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;

        var context = new CareerHubDbContext(options);

        // Migrate creates the real schema including all check constraints,
        // indexes, and the tsvector computed column. Without this the tests
        // would be running against an empty database.
        context.Database.Migrate();

        return context;
    }

    // ── Seed helpers ──────────────────────────────────────────────────────

    /// <summary>
    /// Inserts a company and returns it. Every listing needs a company FK.
    /// Uses ValueGeneratedNever so we control the Id.
    /// </summary>
    private static async Task<Company> SeedCompanyAsync(CareerHubDbContext context)
    {
        var company = new Company
        {
            Id       = Guid.NewGuid(),
            Name     = $"Test Company {Guid.NewGuid():N}",
            Industry = "Technology",
            Website  = "https://example.com"
        };
        context.Companies.Add(company);
        await context.SaveChangesAsync();
        return company;
    }

    /// <summary>
    /// Builds a valid active listing attached to the given company.
    /// PostedAt and ClosingDate are set so ClosingDate > PostedAt (satisfies the check constraint).
    /// </summary>
    private static JobListing BuildActiveListing(
        Guid companyId,
        string? title     = null,
        DateTime? postedAt = null,
        bool active        = true,
        DateTime? closingDate = null)
    {
        var posted  = postedAt ?? DateTime.UtcNow.AddDays(-1);
        var closing = closingDate ?? DateTime.UtcNow.AddDays(30);

        return new JobListing
        {
            Id          = Guid.NewGuid(),
            CompanyId   = companyId,
            Title       = title ?? $"Job {Guid.NewGuid():N}",
            Description = "A sufficiently long description for the listing.",
            Location    = "Cape Town",
            Type        = JobType.FullTime,
            SalaryMin   = 30_000m,
            SalaryMax   = 60_000m,
            PostedAt    = posted,
            ClosingDate = closing,
            IsActive    = active
        };
    }

    // =========================================================================
    // Pagination — GetActiveListingsPagedAsync
    // =========================================================================

    [Fact]
    public async Task GetActiveListingsPagedAsync_Page1_ReturnsCorrectCount()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        // Seed exactly 6 active listings
        for (var i = 0; i < 6; i++)
            context.JobListings.Add(BuildActiveListing(company.Id));

        await context.SaveChangesAsync();

        var repo   = new JobListingRepository(context);
        var filter = new JobListingFilterQuery { CompanyId = company.Id };

        var (items, totalCount) = await repo.GetActiveListingsPagedAsync(
            page: 1, pageSize: 4, filter: filter);

        Assert.Equal(4, items.Count());
        Assert.Equal(6, totalCount);

        var paged = PagedResponse<JobResponse>.Create(items, 1, 4, totalCount);
        Assert.True(paged.HasNextPage);
        Assert.False(paged.HasPreviousPage);
    }

    [Fact]
    public async Task GetActiveListingsPagedAsync_Page2_ReturnsDifferentRows()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        for (var i = 0; i < 6; i++)
            context.JobListings.Add(BuildActiveListing(company.Id));

        await context.SaveChangesAsync();

        var repo   = new JobListingRepository(context);
        var filter = new JobListingFilterQuery { CompanyId = company.Id };

        var (page1Items, _) = await repo.GetActiveListingsPagedAsync(1, 3, filter);
        var (page2Items, _) = await repo.GetActiveListingsPagedAsync(2, 3, filter);

        var page1Ids = page1Items.Select(j => j.Id).ToHashSet();
        var page2Ids = page2Items.Select(j => j.Id).ToHashSet();

        // No ID should appear on both pages
        Assert.Empty(page1Ids.Intersect(page2Ids));
    }

    [Fact]
    public async Task GetActiveListingsPagedAsync_ResultsAreOrderedByPostedAtDescending()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        // Spread PostedAt values across several days so ordering is unambiguous
        var offsets = new[] { -10, -7, -5, -3, -1 };
        foreach (var offset in offsets)
        {
            context.JobListings.Add(BuildActiveListing(
                company.Id,
                postedAt: DateTime.UtcNow.AddDays(offset)));
        }
        await context.SaveChangesAsync();

        var repo   = new JobListingRepository(context);
        var filter = new JobListingFilterQuery { CompanyId = company.Id };

        var (items, _) = await repo.GetActiveListingsPagedAsync(1, 10, filter);
        var list = items.ToList();

        // Each item must be posted on or after the next item (newest first)
        for (var i = 0; i < list.Count - 1; i++)
        {
            Assert.True(
                list[i].PostedAt >= list[i + 1].PostedAt,
                $"Expected descending PostedAt order but index {i} ({list[i].PostedAt}) " +
                $"< index {i + 1} ({list[i + 1].PostedAt}).");
        }
    }

    [Fact]
    public async Task GetActiveListingsPagedAsync_ExcludesInactiveListings()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        // 3 active listings
        for (var i = 0; i < 3; i++)
            context.JobListings.Add(BuildActiveListing(company.Id, active: true));

        // 2 inactive listings (IsActive = false simulates expired/closed)
        for (var i = 0; i < 2; i++)
            context.JobListings.Add(BuildActiveListing(company.Id, active: false));

        await context.SaveChangesAsync();

        var repo   = new JobListingRepository(context);
        var filter = new JobListingFilterQuery { CompanyId = company.Id };

        var (_, totalCount) = await repo.GetActiveListingsPagedAsync(1, 20, filter);

        // Only the 3 active listings must be returned
        Assert.Equal(3, totalCount);
    }

    // =========================================================================
    // Check Constraints — must fire at the database level
    // =========================================================================

    [Fact]
    public async Task CheckConstraint_RejectsSalaryMaxLessThanSalaryMin()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        // Bypass all service logic and insert directly — only the DB constraint can stop this.
        var invalid = BuildActiveListing(company.Id);
        invalid.SalaryMin = 90_000m;
        invalid.SalaryMax = 40_000m; // violates ck_job_listings_salary_range_valid

        context.JobListings.Add(invalid);

        // The check constraint fires on SaveChangesAsync — not before.
        await Assert.ThrowsAnyAsync<Exception>(
            () => context.SaveChangesAsync());
    }

    [Fact]
    public async Task CheckConstraint_RejectsClosingDateBeforePostedAt()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        var postedAt    = DateTime.UtcNow;
        var closingDate = postedAt.AddDays(-5); // violates ck_job_listings_closing_after_posted

        var invalid = BuildActiveListing(
            company.Id,
            postedAt:    postedAt,
            closingDate: closingDate);

        context.JobListings.Add(invalid);

        await Assert.ThrowsAnyAsync<Exception>(
            () => context.SaveChangesAsync());
    }

    // =========================================================================
    // HasApplicantAppliedAsync — compiled query
    // =========================================================================

    [Fact]
    public async Task HasAppliedAsync_WhenApplicationExists_ReturnsTrue()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        // Seed applicant
        var applicant = new Applicant
        {
            Id       = Guid.NewGuid(),
            FullName = "Jane Applicant",
            Email    = $"jane-{Guid.NewGuid():N}@example.com"
        };
        context.Applicants.Add(applicant);

        // Seed listing
        var listing = BuildActiveListing(company.Id);
        context.JobListings.Add(listing);
        await context.SaveChangesAsync();

        // Seed application linking the applicant to the listing
        var application = new Application
        {
            JobListingId = listing.Id,
            ApplicantId  = applicant.Id,
            SubmittedAt  = DateTime.UtcNow.AddMinutes(-5),
            Status       = ApplicationStatus.Submitted
        };
        context.Applications.Add(application);
        await context.SaveChangesAsync();

        var repo   = new ApplicationRepository(context);
        var result = await repo.HasApplicantAppliedAsync(listing.Id, applicant.Id);

        Assert.True(result);
    }

    [Fact]
    public async Task HasAppliedAsync_WhenNoApplicationExists_ReturnsFalse()
    {
        await using var context = CreateContext();

        // Do not seed any application — the method must return false cleanly.
        var repo   = new ApplicationRepository(context);
        var result = await repo.HasApplicantAppliedAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(result);
    }

    // =========================================================================
    // Full-Text Search — SearchAsync (tsvector / GIN index)
    // =========================================================================

    /// <summary>
    /// "engineer" stems to the same lexeme as "Engineering" under the English
    /// configuration. This test proves stemming works — which LIKE '%engineer%'
    /// case-insensitively could not guarantee without the tsvector index.
    /// The in-memory provider cannot run this test because it never evaluates
    /// HasComputedColumnSql and cannot translate SearchVector.Matches(ToTsQuery(...)).
    /// </summary>
    [Fact]
    public async Task FullTextSearch_ReturnsStemmedMatches()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        var listing = BuildActiveListing(company.Id, title: "Software Engineering Position");
        // Override ClosingDate to be in the future so SearchAsync includes it
        listing.ClosingDate = DateTime.UtcNow.AddDays(30);
        context.JobListings.Add(listing);
        await context.SaveChangesAsync();

        var repo    = new JobListingRepository(context);
        var results = await repo.SearchAsync("engineer");

        Assert.Contains(results, r => r.Id == listing.Id);
    }

    [Fact]
    public async Task FullTextSearch_DoesNotReturnNonMatchingListings()
    {
        await using var context = CreateContext();
        var company = await SeedCompanyAsync(context);

        // Only this listing should match "accountant"
        var matching = BuildActiveListing(company.Id, title: "Senior Accountant Role");
        matching.Description = "We need an experienced accountant for our finance team.";
        matching.ClosingDate = DateTime.UtcNow.AddDays(30);

        // These must NOT match
        var nonMatching1 = BuildActiveListing(company.Id, title: "Software Developer");
        nonMatching1.ClosingDate = DateTime.UtcNow.AddDays(30);

        var nonMatching2 = BuildActiveListing(company.Id, title: "Project Manager");
        nonMatching2.ClosingDate = DateTime.UtcNow.AddDays(30);

        context.JobListings.AddRange(matching, nonMatching1, nonMatching2);
        await context.SaveChangesAsync();

        var repo    = new JobListingRepository(context);
        var results = (await repo.SearchAsync("accountant")).ToList();

        // Only the matching listing should be returned
        Assert.Contains(results,    r => r.Id == matching.Id);
        Assert.DoesNotContain(results, r => r.Id == nonMatching1.Id);
        Assert.DoesNotContain(results, r => r.Id == nonMatching2.Id);
    }
}