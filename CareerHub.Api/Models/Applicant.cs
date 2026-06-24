namespace CareerHub.Api.Models;

public class Applicant
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
      // Null for seeded/dev applicants that pre-date registration.
    // Non-null for all applicants created via POST /api/auth/register.
    public string? PasswordHash { get; set; }

    // One applicant can submit many applications
    // Initialised so it's never null
    public ICollection<Application> Applications { get; set; } = [];
}