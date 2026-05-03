namespace LambdaGeneration.API.DTO.Response
{
    public record FollowingUserResponse(Guid id, string name, string aboutUser, int followersCount, int followingCount, int articlesCount, string pathAvatar, string role, string tag);
}
