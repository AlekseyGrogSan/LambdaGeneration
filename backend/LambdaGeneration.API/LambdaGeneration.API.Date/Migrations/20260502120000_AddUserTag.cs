using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LambdaGeneration.API.Date.Migrations
{
    [Microsoft.EntityFrameworkCore.Infrastructure.DbContext(typeof(LambdaGenerationDbContext))]
    [Migration("20260502120000_AddUserTag")]
    public partial class AddUserTag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TagName",
                table: "Users",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "user");

            migrationBuilder.Sql("""
                UPDATE "Users"
                SET "TagName" = 'admin'
                WHERE "Role" = 2;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TagName",
                table: "Users");
        }
    }
}
