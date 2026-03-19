using System.ComponentModel.DataAnnotations;

namespace LambdaGeneration.API.DTO
{
    public record RequestToRegistr(string UserName,
    string Email,
    string Password,
    string aboutUser);
}
