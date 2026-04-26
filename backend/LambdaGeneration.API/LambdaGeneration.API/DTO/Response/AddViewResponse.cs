namespace LambdaGeneration.API.DTO.Response
{
    public record AddViewResponse(bool viewAdded, int countViews, DateTime nextAllowedViewAtUtc);
}
