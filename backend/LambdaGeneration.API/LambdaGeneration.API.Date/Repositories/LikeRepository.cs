using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Repositories
{
    public class LikeRepository : ILikeRepository
    {
        private readonly LambdaGenerationDbContext _context;

        public LikeRepository(LambdaGenerationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Like(Guid articleId, Guid authorId)
        {
            await _context.Articles
                .Where(a => a.ArticleID == articleId)
                .ExecuteUpdateAsync(properties =>
                    properties.SetProperty(
                        a => a.CountLikes,
                        a => a.CountLikes + 1
                    )
                );
            await _context.Likes.AddAsync(new LikeEntity
            {
                Id = Guid.NewGuid(),
                ArticleId = articleId,
                AuthorId = authorId
            });

            await _context.SaveChangesAsync();

            return await _context.Articles.Where(a => a.ArticleID == articleId).Select(a => a.CountLikes).FirstOrDefaultAsync();
        }

        public async Task<int> UnLike(Guid articleId, Guid authorId)
        {
            await _context.Articles
                .Where(a => a.ArticleID == articleId)
                .ExecuteUpdateAsync(properties =>
                    properties.SetProperty(
                        a => a.CountLikes,
                        a => a.CountLikes - 1
                    )
                );

            await _context.Likes
                .Where(l => l.ArticleId == articleId && l.AuthorId == authorId)
                .ExecuteDeleteAsync();

            await _context.SaveChangesAsync();

            return await _context.Articles.Where(a => a.ArticleID == articleId).Select(a => a.CountLikes).FirstOrDefaultAsync();
        }

        public async Task<bool> IsLiked(Guid articleId, Guid authorId)
        {
            return await _context.Likes.AnyAsync(l => l.ArticleId == articleId && l.AuthorId == authorId);
        }

        public async Task<int> GetCountLikes(Guid id)
        {
            return await _context.Articles.Where(a => a.ArticleID == id).Select(a => a.CountLikes).FirstOrDefaultAsync();
        }
    }
}
