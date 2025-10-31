namespace LambdaGeneration.API.Core.Models
{
    public class Users
    {
        private Users(Guid Id, string username, string Hashpassword, string email)
        {
            UserID = Id;
            UserName = username;
            PasswordHash = Hashpassword;
            Email = email;
            CreatedDate = DateTime.UtcNow;
        }

        public Guid UserID { get; }
        public string UserName { get; } = string.Empty;
        public string Email { get; } = string.Empty;
        public string PasswordHash { get; } = string.Empty;
        public DateTime CreatedDate { get; }

        public static Users Create(Guid id, string username, string hashpassword, string email)
        {
            return new Users(id, username, hashpassword, email);
        }
    }
}
