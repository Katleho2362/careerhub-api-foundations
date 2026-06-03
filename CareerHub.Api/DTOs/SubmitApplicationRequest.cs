using System.ComponentModel.DataAnnotations;

namespace CareerHub.Api.DTOs;

public class SubmitApplicationRequest
{
    [Required]
    public Guid ApplicantId { get; set; }
}