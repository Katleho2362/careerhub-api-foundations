using CareerHub.Api.Enums;

namespace CareerHub.Api.Services;

public static class ApplicationStatusTransitions
{
    // The rules are defined in exactly one place.
    // To add a new valid transition (e.g. Offered → Accepted),
    // add one line to this dictionary. Nothing else changes.
    private static readonly Dictionary<ApplicationStatus, IReadOnlySet<ApplicationStatus>> _allowed =
        new()
        {
            [ApplicationStatus.Submitted]   = new HashSet<ApplicationStatus> { ApplicationStatus.UnderReview },
            [ApplicationStatus.UnderReview] = new HashSet<ApplicationStatus> { ApplicationStatus.Shortlisted, ApplicationStatus.Rejected },
            [ApplicationStatus.Shortlisted] = new HashSet<ApplicationStatus> { ApplicationStatus.Offered, ApplicationStatus.Rejected },
            [ApplicationStatus.Offered]     = new HashSet<ApplicationStatus>(),
            [ApplicationStatus.Rejected]    = new HashSet<ApplicationStatus>(),
        };

    // Testable independently — no database, no HTTP context
    public static bool IsPermitted(ApplicationStatus from, ApplicationStatus to)
    {
        return _allowed.TryGetValue(from, out var allowed) && allowed.Contains(to);
    }
}