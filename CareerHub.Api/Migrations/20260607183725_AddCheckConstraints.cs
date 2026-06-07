using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "ck_job_listings_closing_after_posted",
                table: "job_listings",
                sql: "\"ClosingDate\" > \"PostedAt\"");

            migrationBuilder.AddCheckConstraint(
                name: "ck_job_listings_salary_min_positive",
                table: "job_listings",
                sql: "\"SalaryMin\" IS NULL OR \"SalaryMin\" > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_job_listings_salary_range_valid",
                table: "job_listings",
                sql: "\"SalaryMin\" IS NULL OR \"SalaryMax\" IS NULL OR \"SalaryMax\" > \"SalaryMin\"");

            migrationBuilder.AddCheckConstraint(
                name: "ck_applications_submitted_not_future",
                table: "applications",
                sql: "\"SubmittedAt\" <= now()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_job_listings_closing_after_posted",
                table: "job_listings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_job_listings_salary_min_positive",
                table: "job_listings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_job_listings_salary_range_valid",
                table: "job_listings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_applications_submitted_not_future",
                table: "applications");
        }
    }
}
