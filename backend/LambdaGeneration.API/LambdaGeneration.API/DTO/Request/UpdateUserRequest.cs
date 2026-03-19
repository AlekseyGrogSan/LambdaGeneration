namespace LambdaGeneration.API.DTO.Request
{
    public record UpdateUserRequest(string name, string email, string aboutUser, IFormFile? avatar);
}
