namespace LambdaGeneration.API.Core.Enums
{
    public static class UserTagExtensions
    {
        public static string ToApiValue(this UserTag tag)
        {
            return tag switch
            {
                UserTag.User => "user",
                UserTag.Admin => "admin",
                UserTag.DrossBoss => "dross-boss",
                _ => "user"
            };
        }

        public static UserTag FromStorageValue(string? tagValue)
        {
            return tagValue?.Trim().ToLowerInvariant() switch
            {
                "admin" => UserTag.Admin,
                "dross-boss" => UserTag.DrossBoss,
                "dross_boss" => UserTag.DrossBoss,
                _ => UserTag.User
            };
        }
    }
}
