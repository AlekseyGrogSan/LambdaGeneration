using System.ComponentModel.DataAnnotations;

namespace LambdaGeneration.API.DTO.Request
{
    public class RegisterUserRequest
    {
        public string UserName { get; set; }
        [EmailAddress(ErrorMessage = "Некорректный формат почты")]
        public string Email { get; set; }
        public string Password { get; set; }
        public string aboutUser { get; set; }
    }
}
