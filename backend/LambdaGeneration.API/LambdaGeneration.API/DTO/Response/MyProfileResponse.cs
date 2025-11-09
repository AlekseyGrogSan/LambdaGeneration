namespace LambdaGeneration.API.DTO.Response
{
    public record MyProfileResponse(Guid id, string name, string email, string aboutUser ,DateTime createDate);
}
