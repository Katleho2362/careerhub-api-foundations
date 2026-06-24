using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationDetailsAndDevApplicant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AvailableImmediately",
                table: "applications",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverLetter",
                table: "applications",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                table: "applications",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticePeriodWeeks",
                table: "applications",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "applications",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearsOfExperience",
                table: "applications",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableImmediately",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "CoverLetter",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "NoticePeriodWeeks",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "YearsOfExperience",
                table: "applications");
        }
    }
}
