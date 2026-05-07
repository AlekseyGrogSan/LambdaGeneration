using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LambdaGeneration.API.Date.Migrations
{
    /// <inheritdoc />
    public partial class CountViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CountViews",
                table: "Articles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Views",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uuid", nullable: false),
                    ArticleID = table.Column<Guid>(type: "uuid", nullable: false),
                    ViewedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Views", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Views");

            migrationBuilder.DropColumn(
                name: "CountViews",
                table: "Articles");
        }
    }
}
