using CareerHub.Api.Enums;

namespace CareerHub.Api.DTOs;

public class UpdateApplicationStatusRequest
{
    public ApplicationStatus Status { get; set; }
}