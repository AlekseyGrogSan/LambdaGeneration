using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LambdaGeneration.API.Date.Migrations
{
    public partial class AddViewCooldownTracking : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserID",
                table: "Views",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VisitorKey",
                table: "Views",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Views_ArticleID_UserID_ViewedDate",
                table: "Views",
                columns: new[] { "ArticleID", "UserID", "ViewedDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Views_ArticleID_VisitorKey_ViewedDate",
                table: "Views",
                columns: new[] { "ArticleID", "VisitorKey", "ViewedDate" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Views_ArticleID_UserID_ViewedDate",
                table: "Views");

            migrationBuilder.DropIndex(
                name: "IX_Views_ArticleID_VisitorKey_ViewedDate",
                table: "Views");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "Views");

            migrationBuilder.DropColumn(
                name: "VisitorKey",
                table: "Views");
        }
    }
}
