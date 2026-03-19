namespace LambdaGeneration.API.DTO.Response
{
    public record UserProfileResponse(Guid id, string name, string aboutUser,DateTime createDate, int subscribersCount, int followingCount, int articlesCount, string pathAvatar);
}
