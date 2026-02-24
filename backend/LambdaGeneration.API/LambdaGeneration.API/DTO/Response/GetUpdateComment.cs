namespace LambdaGeneration.API.DTO.Response
{
    public record GetUpdateComment(Guid commentId, Guid articleId, Guid authorId, string content, int countLikes, bool hasReplies, DateTime publishDate);
}
