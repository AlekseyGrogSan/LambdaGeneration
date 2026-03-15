namespace LambdaGeneration.API.Date.Entities
{
    public class SubscriptionEntity
    {
        public Guid FollowerId { get; set; }
        public Guid FollowingId { get; set; }

        public UsersEntity Follower { get; set; } = null!;
        public UsersEntity Following { get; set; } = null!;
    }
}
