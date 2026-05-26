namespace CareerHub.Api.Models;

// information that our job posting  will contain
public record JobListing(
    int Id,
    string Title,
    string Description,
    string Company,
    string Location,
    string Type
);