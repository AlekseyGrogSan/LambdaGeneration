using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LambdaGeneration.API.Date.Migrations
{
    /// <inheritdoc />
    public partial class fixBags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "countFollowing",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "countFollowing",
                table: "Users");
        }
    }
}
