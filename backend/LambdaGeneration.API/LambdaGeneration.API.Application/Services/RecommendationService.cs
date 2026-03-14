using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly IArticlesRepository _articlesRepository;

        public RecommendationService(IArticlesRepository articlesRepository)
        {
            _articlesRepository = articlesRepository;
        }

        public async Task<List<Articles>> GetRecmmedationArticlesAsync(Guid userId, int size = 1, int countPages = 10)
        {
            if (size < 1 || countPages < 1)
            {
                throw new ArgumentException("Page number and size must be positive.");
            }

            return await _articlesRepository.GetRecommentationArticles(userId, size, countPages);
        }

        public async Task<List<Articles>> GetRandomArticlesAsync(int size = 1, int countPages = 10)
        {
            if (size < 1 || countPages < 1)
            {
                throw new ArgumentException("Page number and size must be positive.");
            }

            return await _articlesRepository.GetRandomArticles(size, countPages);
        }

        public async Task<List<Articles>> GetLatestArticlesAsync(int size = 1, int countPages = 10)
        {
            if (size < 1 || countPages < 1)
                throw new ArgumentException("Page number and size must be positive.");
            return await _articlesRepository.GetLatestAsync(size, countPages);
        }
    }
}
