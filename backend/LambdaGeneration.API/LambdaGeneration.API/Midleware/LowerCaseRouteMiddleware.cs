namespace LambdaGeneration.API.Midleware
{
    public class LowerCaseRouteMiddleware
    {
        private readonly RequestDelegate _next;

        public LowerCaseRouteMiddleware(RequestDelegate next) { _next = next; }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value;

            if (!string.IsNullOrEmpty(path) && path.Any(char.IsUpper))
            {
                var lowerCasePath = path.ToLowerInvariant();

                context.Request.Path = new PathString(lowerCasePath);
            }

            await _next(context);
        }
    }
}
