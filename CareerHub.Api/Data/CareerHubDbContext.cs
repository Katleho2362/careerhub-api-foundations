using CareerHub.Api.Models;
using Microsoft.EntityFrameworkCore;

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

            // We assign the Guid in C# code, not the database
            entity.Property(c => c.Id)
                .ValueGeneratedNever();

            entity.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(c => c.Website)
                .HasMaxLength(300);

            entity.Property(c => c.Industry)
                .HasMaxLength(100);

            // No two companies can have the same name
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

            // No two applicants can share the same email
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

            // Unique index now uses CompanyId instead of Company string
            // Prevents the same company posting the same job title twice
            entity.HasIndex(j => new { j.Title, j.CompanyId })
                .IsUnique();

            // Company → JobListing relationship
            // Restrict: you cannot delete a company that still has listings
            // This protects data integrity — deactivate listings first
            entity.HasOne(j => j.Company)
                .WithMany(c => c.JobListings)
                .HasForeignKey(j => j.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

    // =====================================================
    //   Application 
    // =====================================================

      modelBuilder.Entity<Application>(entity =>
        {
            entity.ToTable("applications");

            // Composite primary key — this is what prevents duplicate applications
            // One applicant can only apply once to the same listing
            entity.HasKey(a => new { a.JobListingId, a.ApplicantId });

            entity.Property(a => a.JobListingId)
                .ValueGeneratedNever();

            entity.Property(a => a.ApplicantId)
                .ValueGeneratedNever();

            entity.Property(a => a.SubmittedAt)
                .IsRequired();

            // JobListing → Application
            // Cascade: if a listing is deleted, its applications go with it
            entity.HasOne(a => a.JobListing)
                .WithMany(j => j.Applications)
                .HasForeignKey(a => a.JobListingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Applicant → Application
            // Restrict: don't silently erase application history
            // if someone tries to delete an applicant
            entity.HasOne(a => a.Applicant)
                .WithMany(ap => ap.Applications)
                .HasForeignKey(a => a.ApplicantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

    }
}