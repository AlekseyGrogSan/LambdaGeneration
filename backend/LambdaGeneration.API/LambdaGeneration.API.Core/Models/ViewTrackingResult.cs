namespace LambdaGeneration.API.Core.Models
{
    public record ViewTrackingResult(bool ViewAdded, int CountViews, DateTime NextAllowedViewAtUtc);
}
