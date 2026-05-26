using CareerHub.Api.Models;

namespace CareerHub.Api.Stores;

public static class JobListingStore
{

    // store our temporary data only 
    public static readonly List<JobListing> Jobs = new()
    {
        new JobListing(
            1,
            "Junior Software Developer",
            "Assist in developing and maintaining web applications.",
            "Bitcube",
            "Johannesburg",
            "Full-time"
        ),
        new JobListing(
            2,
            "Frontend Developer Intern",
            "Support the frontend team with React and UI development tasks.",
            "CareerHub",
            "Remote",
            "Internship"
        ),
        new JobListing(
            3,
            "IT Support Technician",
            "Provide technical support and troubleshoot user issues.",
            "Tech Solutions",
            "Bloemfontein",
            "Contract"
        )
    };
}