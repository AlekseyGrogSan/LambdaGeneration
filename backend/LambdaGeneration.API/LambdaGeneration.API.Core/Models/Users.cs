using LambdaGeneration.API.Core.Enums;

namespace LambdaGeneration.API.Core.Models
{
    public class Users
    {
        private Users(Guid Id, string username, string Hashpassword, string email, string aboutUser)
        {
            UserID = Id;
            UserName = username;
            PasswordHash = Hashpassword;
            Email = email;
            AboutUser = aboutUser;
            CreatedDate = DateTime.UtcNow;
        }

        private Users(Guid Id, string username, string Hashpassword, string email, string aboutUser, DateTime createDate)
        {
            UserID = Id;
            UserName = username;
            PasswordHash = Hashpassword;
            Email = email;
            AboutUser = aboutUser;
            CreatedDate = createDate;
        }

        public Guid UserID { get; }
        public string UserName { get; } = string.Empty;
        public string Email { get; } = string.Empty;
        public string AboutUser { get; } = string.Empty;
        public string PasswordHash { get; } = string.Empty;
        public Role Role { get; private set; } = Role.User;
        public DateTime CreatedDate { get; }
        public bool IsBanned { get; private set; } = false;

        public static Users Create(Guid id, string username, string hashpassword, string email, string aboutUser)
        {
            return new Users(id, username, hashpassword, email, aboutUser);
        }

        public static Users Map(Guid id, string username, string hashpassword, string email, Role role, string aboutUser, DateTime createDate)
        {
            Users user = new Users(id, username, hashpassword, email, aboutUser, createDate);
            user.Role = role;
            return user;
        }
        public void SetRole(Role role)
        {
            Role = role;
        }

        public void SetBanned()
        {
            IsBanned = !IsBanned;
        }

        public static Users Map(Guid id, string username, string hashpassword, string email, Role role)
        {
            Users user = new Users(id, username, hashpassword, email);
            user.Role = role;
            return user;
        }
        public void SetRole(Role role)
        {
            Role = role;
        }

        public void SetBanned()
        {
            IsBanned = !IsBanned;
        }
    }
}
