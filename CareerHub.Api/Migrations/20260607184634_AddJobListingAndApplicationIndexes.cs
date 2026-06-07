using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddJobListingAndApplicationIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_job_listings_CompanyId",
                table: "job_listings");
            
            migrationBuilder.CreateIndex(
                name: "ix_job_listings_active_closing",
                table: "job_listings",
                columns: new[] { "IsActive", "ClosingDate" });

            migrationBuilder.CreateIndex(
                name: "ix_job_listings_company_active",
                table: "job_listings",
                columns: new[] { "CompanyId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "ix_applications_listing_applicant",
                table: "applications",
                columns: new[] { "JobListingId", "ApplicantId" });

            migrationBuilder.CreateIndex(
                name: "ix_applications_listing_id",
                table: "applications",
                column: "JobListingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_job_listings_active_closing",
                table: "job_listings");

                

            migrationBuilder.DropIndex(
                name: "ix_job_listings_company_active",
                table: "job_listings");

            migrationBuilder.DropIndex(
                name: "ix_applications_listing_applicant",
                table: "applications");

            migrationBuilder.DropIndex(
                name: "ix_applications_listing_id",
                table: "applications");

            migrationBuilder.CreateIndex(
                name: "IX_job_listings_CompanyId",
                table: "job_listings",
                column: "CompanyId");
        }
    }
}
