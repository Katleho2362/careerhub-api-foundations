using System.ComponentModel.DataAnnotations;
using CareerHub.Api.Enums;

namespace CareerHub.Api.DTOs;

public class UpdateJobRequest : IValidatableObject
{
    [Required]
    [StringLength(120, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(80, MinimumLength = 2)]
    public string Company { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    [Required]
    [MinLength(20)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public JobType Type { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal? SalaryMin { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal? SalaryMax { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (SalaryMin.HasValue &&
            SalaryMax.HasValue &&
            SalaryMax <= SalaryMin)
        {
            yield return new ValidationResult(
                "SalaryMax must be greater than SalaryMin.",
                new[] { nameof(SalaryMax) }
            );
        }
    }
}