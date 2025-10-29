using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LambdaGeneration.API.Date.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UsersEntity",
                columns: table => new
                {
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordSalt = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    countArticles = table.Column<int>(type: "integer", nullable: false),
                    countSubscribers = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsersEntity", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Articles",
                columns: table => new
                {
                    ArticleID = table.Column<Guid>(type: "uuid", nullable: false),
                    ArticleTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ArticleContent = table.Column<string>(type: "text", nullable: false),
                    ArticlePreview = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AuthorID = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CountLikes = table.Column<int>(type: "integer", nullable: false),
                    CountComments = table.Column<int>(type: "integer", nullable: false),
                    ArticleTags = table.Column<int[]>(type: "integer[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Articles", x => x.ArticleID);
                    table.ForeignKey(
                        name: "FK_Articles_UsersEntity_AuthorID",
                        column: x => x.AuthorID,
                        principalTable: "UsersEntity",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Articles_AuthorID",
                table: "Articles",
                column: "AuthorID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Articles");

            migrationBuilder.DropTable(
                name: "UsersEntity");
        }
    }
}
