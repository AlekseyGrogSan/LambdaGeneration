namespace LambdaGeneration.API.Infrastructure
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            // Implement your password hashing logic here
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
        public bool VerifyPassword(string password, string hashedPassword)
        {
            // Implement your password verification logic here
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

    }
}
