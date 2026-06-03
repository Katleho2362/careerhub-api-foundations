namespace CareerHub.Api.Models;

public class Company
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;

    public string Industry { get; set; } = string.Empty;

    // One company owns many job listings
    // Initialised to empty list so it's never null
    public ICollection<JobListing> JobListings { get; set; } = [];
}