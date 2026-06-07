using CareerHub.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CareerHub.Api.Data;

public class CareerHubDbContext(
    DbContextOptions<CareerHubDbContext> options)
    : DbContext(options)
{
    // Represents the job_listings table in PostgreSQL.
    // EF Core uses this DbSet to perform CRUD operations.
    // Each Dbset represents one table in postgreSQL
    public DbSet<JobListing> JobListings => Set<JobListing>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Applicant> Applicants => Set<Applicant>();
    public DbSet<Application> Applications => Set<Application>();

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // =====================================================
    //   COMPANY
    // =====================================================
    modelBuilder.Entity<Company>(entity =>
    {
        entity.ToTable("companies");

        entity.HasKey(c => c.Id);

        entity.Property(c => c.Id)
            .ValueGeneratedNever();

        entity.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        entity.Property(c => c.Website)
            .HasMaxLength(300);

        entity.Property(c => c.Industry)
            .HasMaxLength(100);

        entity.HasIndex(c => c.Name)
            .IsUnique();
    });

    // =====================================================
    //   APPLICANT
    // =====================================================
    modelBuilder.Entity<Applicant>(entity =>
    {
        entity.ToTable("applicants");

        entity.HasKey(a => a.Id);

        entity.Property(a => a.Id)
            .ValueGeneratedNever();

        entity.Property(a => a.FullName)
            .IsRequired()
            .HasMaxLength(200);

        entity.Property(a => a.Email)
            .IsRequired()
            .HasMaxLength(200);

        entity.HasIndex(a => a.Email)
            .IsUnique();
    });

    // =====================================================
    //   JOBLISTING
    // =====================================================
    modelBuilder.Entity<JobListing>(entity =>
    {
        entity.ToTable("job_listings");

        entity.HasKey(j => j.Id);

        entity.Property(j => j.Id)
            .ValueGeneratedNever();

        entity.Property(j => j.Title)
            .IsRequired()
            .HasMaxLength(200);

        entity.Property(j => j.Description)
            .IsRequired()
            .HasMaxLength(2000);

        entity.Property(j => j.Location)
            .IsRequired()
            .HasMaxLength(200);

        entity.HasIndex(j => new { j.Title, j.CompanyId })
            .IsUnique();

        entity.HasOne(j => j.Company)
            .WithMany(c => c.JobListings)
            .HasForeignKey(j => j.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Composite index — active listing query (job board page load)
        // IsActive first: eliminates inactive listings immediately
        // ClosingDate second: range scan within the active subset
        entity.HasIndex(j => new { j.IsActive, j.ClosingDate })
            .HasDatabaseName("ix_job_listings_active_closing");

        // Composite index — company-scoped listing query (employer dashboard)
        // CompanyId first: highly selective, narrows to one company immediately
        // IsActive second: filters within that company's listings
        entity.HasIndex(j => new { j.CompanyId, j.IsActive })
            .HasDatabaseName("ix_job_listings_company_active");    

        // =====================================================
        // CHECK CONSTRAINTS — enforce business rules at DB level
        // =====================================================

        // SalaryMin must be positive when provided
        entity.ToTable(t => t.HasCheckConstraint(
            "ck_job_listings_salary_min_positive",
            "\"SalaryMin\" IS NULL OR \"SalaryMin\" > 0"));

        // SalaryMax must be greater than SalaryMin when both provided
        // Null salary range is allowed — only invalid when both exist and max < min
        entity.ToTable(t => t.HasCheckConstraint(
            "ck_job_listings_salary_range_valid",
            "\"SalaryMin\" IS NULL OR \"SalaryMax\" IS NULL OR \"SalaryMax\" > \"SalaryMin\""));

        // ClosingDate must be after PostedAt
        // A listing cannot close before it was posted
        entity.ToTable(t => t.HasCheckConstraint(
            "ck_job_listings_closing_after_posted",
            "\"ClosingDate\" > \"PostedAt\""));
    });

    // =====================================================
    //   APPLICATION
    // =====================================================
    modelBuilder.Entity<Application>(entity =>
    {
        entity.ToTable("applications");

        entity.HasKey(a => new { a.JobListingId, a.ApplicantId });

        entity.Property(a => a.JobListingId)
            .ValueGeneratedNever();

        entity.Property(a => a.ApplicantId)
            .ValueGeneratedNever();

        entity.Property(a => a.SubmittedAt)
            .IsRequired();

        entity.HasOne(a => a.JobListing)
            .WithMany(j => j.Applications)
            .HasForeignKey(a => a.JobListingId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(a => a.Applicant)
            .WithMany(ap => ap.Applications)
            .HasForeignKey(a => a.ApplicantId)
            .OnDelete(DeleteBehavior.Restrict);


        // Index supporting HasApplicantAppliedAsync — called on every submission
        entity.HasIndex(a => new { a.JobListingId, a.ApplicantId })
            .HasDatabaseName("ix_applications_listing_applicant");

        // Index supporting GetApplicationsForListingAsync — employer dashboard
        entity.HasIndex(a => a.JobListingId)
            .HasDatabaseName("ix_applications_listing_id");

        // SubmittedAt must not be in the future
        // Applications cannot be backdated or forward-dated
        entity.ToTable(t => t.HasCheckConstraint(
            "ck_applications_submitted_not_future",
            "\"SubmittedAt\" <= now()"));
    });
}}