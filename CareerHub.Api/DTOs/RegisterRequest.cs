// DTOs/RegisterRequest.cs
namespace CareerHub.Api.DTOs;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password
);