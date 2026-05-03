using LambdaGeneration.API.Core.Enums;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IAdminService
    {
        Task Create(string configSection = "AdminConfig", UserTag tag = UserTag.Admin);
    }
}
