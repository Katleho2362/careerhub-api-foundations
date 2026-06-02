using CareerHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareerHub.Api.Data;

public class CareerHubDbContext(
    DbContextOptions<CareerHubDbContext> options)
    : DbContext(options)
{
    // Represents the job_listings table in PostgreSQL.
    // EF Core uses this DbSet to perform CRUD operations.
    public DbSet<JobListing> JobListings => Set<JobListing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobListing>(entity =>
        {
            entity.ToTable("job_listings");  // Maps the JobListing entity to the PostgreSQL table job_listings.

            entity.HasKey(j => j.Id);

            entity.Property(j => j.Id)
                .ValueGeneratedNever();

            entity.Property(j => j.Title)  // Makes Title mandatory and limits it to 200 characters.
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(j => j.Description)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(j => j.Company)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(j => j.Location)
                .IsRequired()
                .HasMaxLength(200);

            entity.HasIndex(j => new      // Prevents duplicate job postings with the same title and company.
            {
                j.Title,
                j.Company
            }).IsUnique();
        });
    }
}