using LambdaGeneration.API.Core.Models;
using System.ComponentModel.DataAnnotations;

namespace LambdaGeneration.API.DTO.Response
{
    public record GetCommentsResponse(List<GetUpdateComment> Comments); 
}
