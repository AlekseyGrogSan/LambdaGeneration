using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Date.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace LambdaGeneration.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IArticlesRepository _articlesRepository;
        private readonly ICommentsRepository _commentsRepository;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IUsersRepository usersRepository,
            IArticlesRepository articlesRepository,
            ICommentsRepository commentsRepository,
            ILogger<AdminController> logger)
        {
            _usersRepository = usersRepository;
            _articlesRepository = articlesRepository;
            _commentsRepository = commentsRepository;
            _logger = logger;
        }

        [HttpGet("users/{userId:guid}")]
        public async Task<IActionResult> GetUser(Guid userId)
        {
            var user = await _usersRepository.GetProfile(userId);
            if (user == null)
                return NotFound(new { message = "Пользователь не найден" });

            return Ok(new
            {
                user.UserID,
                user.UserName,
                user.Email,
                user.AboutUser,
                user.Role,
                user.IsBanned,
                user.CreatedDate,
                user.FollowersCount,
                user.FollowingCount,
                user.ArticlesCount,
                user.PathAvatar
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _usersRepository.GetAllUsers();
            return Ok(users.Select(user => new
            {
                user.UserID,
                user.UserName,
                Role = user.Role.ToString(),
                user.IsBanned
            }));
        }

        [HttpPatch("users/{userId:guid}/ban")]
        public async Task<IActionResult> ToggleBan(Guid userId)
        {
            var user = await _usersRepository.GetProfile(userId);
            if (user == null)
                return NotFound(new { message = "Пользователь не найден" });

            user.SetBanned();
            await _usersRepository.SetBanned(userId, user.IsBanned);

            _logger.LogInformation(
                "Admin {Admin} {Action} user {UserId}",
                User.FindFirst("UserId")?.Value,
                user.IsBanned ? "banned" : "unbanned",
                userId);

            return Ok(new
            {
                user.UserID,
                user.IsBanned,
                message = user.IsBanned ? "Пользователь забанен" : "Пользователь разбанен "
            });
        }

        [HttpDelete("users/{userId:guid}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var user = await _usersRepository.GetProfile(userId);
            if (user == null)
                return NotFound(new { message = "Пользователь не найден" });

            await _usersRepository.Delete(userId);

            _logger.LogWarning(
                "Admin {Admin} deleted user {UserId} ({UserName})",
                User.FindFirst("UserId")?.Value,
                userId,
                user.UserName);

            return Ok(new { message = $"Пользователь {user.UserName} удален" });
        }

        [HttpGet("users/{userId:guid}/articles")]
        public async Task<IActionResult> GetUserArticles(Guid userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var articles = await _articlesRepository.GetArticlesByAuthorPaged(userId, page, pageSize);
            return Ok(articles.Select(a => new
            {
                a.ArticleID,
                a.ArticleTitle,
                a.ArticlePreview,
                a.CreatedDate,
                a.CountLikes,
                a.CountComments,
                Tags = a.ArticleTags
            }));
        }

        [HttpGet("users/{userId:guid}/comments")]
        public async Task<IActionResult> GetUserComments(Guid userId)
        {
            var comments = await _commentsRepository.GetCommentsByAuthorAsync(userId);
            return Ok(comments.Select(c => new
            {
                c.Id,
                c.ArticleId,
                c.ArticleTitle,
                c.Content,
                c.ParentCommentId,
                c.DatePublish,
                c.CountLikes,
                c.HasReplies,
                c.IsApproved
            }));
        }

        [HttpDelete("articles/{articleId:guid}")]
        public async Task<IActionResult> DeleteArticle(Guid articleId)
        {
            var article = await _articlesRepository.GetById(articleId);
            if (article == null)
                return NotFound(new { message = "Статьи не найдены" });

            await _articlesRepository.Delete(articleId);

            _logger.LogWarning(
                "Admin {Admin} deleted article {ArticleId} \"{Title}\"",
                User.FindFirst("UserId")?.Value,
                articleId,
                article.ArticleTitle);

            return Ok(new { message = $"Стаья {article.ArticleTitle} удалена" });
        }

        [HttpGet("articles/{articleId:guid}/comments")]
        public async Task<IActionResult> GetArticleComments(Guid articleId)
        {
            var comments = await _commentsRepository.GetCommentsByIdAsync(articleId);
            return Ok(comments.Select(c => new
            {
                c.Id,
                c.AuthorId,
                c.Content,
                c.DatePublish,
                c.CountLikes,
                c.IsApproved,
                c.ParentCommentId,
                c.hasReplies
            }));
        }


        [HttpDelete("comments/{commentId:guid}")]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            var comment = await _commentsRepository.GetCommentByIdAsync(commentId);
            if (comment == null)
                return NotFound(new { message = "Комментарии у пользователя не найдены" });

            var deleted = await _commentsRepository.DeleteCommentAsync(commentId);
            if (!deleted)
                return StatusCode(500, new { message = "Ошибка удаления комментария" });

            _logger.LogWarning(
                "Admin {Admin} deleted comment {CommentId} on article {ArticleId}",
                User.FindFirst("UserId")?.Value,
                commentId,
                comment.ArticleId);

            return Ok(new { message = "Комментарий успешно удален" });
        }

        [HttpDelete("articles/{articleId:guid}/comments")]
        public async Task<IActionResult> DeleteAllArticleComments(Guid articleId)
        {
            var comments = await _commentsRepository.GetCommentsByIdAsync(articleId);
            if (!comments.Any())
                return NotFound(new { message = "Уомментарии у статьи не найдены" });

            int deletedCount = 0;
            foreach (var comment in comments)
            {
                var deleted = await _commentsRepository.DeleteCommentAsync(comment.Id);
                if (deleted) deletedCount++;
            }

            _logger.LogWarning(
                "Admin {Admin} deleted {Count} comments on article {ArticleId}",
                User.FindFirst("UserId")?.Value,
                deletedCount,
                articleId);

            return Ok(new { message = $"Удалено {deletedCount} комментариев" });
        }
    }
}

