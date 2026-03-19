using LambdaGeneration.API.Core.Enums;

namespace LambdaGeneration.API.Core.Models
{
    public class Users
    {
        private Users(Guid Id, string username, string Hashpassword, string email, string aboutUser, string? pathAvatar)
        {
            UserID = Id;
            UserName = username;
            PasswordHash = Hashpassword;
            Email = email;
            AboutUser = aboutUser;
            CreatedDate = DateTime.UtcNow;
            FollowersCount = 0;
            FollowingCount = 0;
            ArticlesCount = 0;
            PathAvatar = pathAvatar;
        }

        private Users(Guid Id, string username, string Hashpassword, string email, string aboutUser, DateTime createDate, int followersCount, int followingCount, int articlesCount, string pathAvatar)
        {
            UserID = Id;
            UserName = username;
            PasswordHash = Hashpassword;
            Email = email;
            AboutUser = aboutUser;
            CreatedDate = createDate;
            FollowersCount = followersCount;
            FollowingCount = followingCount;
            ArticlesCount = articlesCount;
            PathAvatar = pathAvatar;
        }

        public Guid UserID { get; }
        public string UserName { get; } = string.Empty;
        public string Email { get; } = string.Empty;
        public string AboutUser { get; } = string.Empty;
        public string PasswordHash { get; } = string.Empty;
        public Role Role { get; private set; } = Role.User;
        public DateTime CreatedDate { get; }
        public bool IsBanned { get; private set; } = false;
        public int FollowersCount { get; }
        public int FollowingCount { get; }
        public int ArticlesCount { get; }
        public string PathAvatar { get; } = string.Empty;

        public static Users Create(Guid id, string username, string hashpassword, string email, string aboutUser, string pathAvatar)
        {
            return new Users(id, username, hashpassword, email, aboutUser, pathAvatar);
        }

        public static Users Map(Guid id, string username, string hashpassword, string email, Role role, string aboutUser, DateTime createDate, int followersCount, int followingCount, int articlesCount, string? pathAvatar)
        {
            Users user = new Users(id, username, hashpassword, email, aboutUser, createDate, followersCount, followingCount, articlesCount, pathAvatar);
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
