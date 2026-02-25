using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Repositories
{
    public class LikeCommentRepository : ILikeCommentRepository
    {
        private readonly LambdaGenerationDbContext _context;

        public LikeCommentRepository(LambdaGenerationDbContext content)
        {
            _context = content;
        }

        public async Task<int> Like(Guid commentId, Guid authorId)
        {
            await _context.Comments
                .Where(a => a.Id == commentId)
                .ExecuteUpdateAsync(properties =>
                    properties.SetProperty(
                        a => a.CountLikes,
                        a => a.CountLikes + 1
                    )
                );
            await _context.LikeComment.AddAsync(new LikeCommentEntity
            {
                Id = Guid.NewGuid(),
                CommentId = commentId,
                AuthorId = authorId
            });

            await _context.SaveChangesAsync();

            return await _context.Comments.Where(a => a.Id == commentId).Select(a => a.CountLikes).FirstOrDefaultAsync();
        }

        public async Task<bool> IsCommentLiked(Guid commentId, Guid authorId)
        {
            var isLiked = await _context.LikeComment
                .AnyAsync(l => l.CommentId == commentId && l.AuthorId == authorId);
            return isLiked;
        }

        public async Task<int> UnLike(Guid commentId, Guid authorId)
        {
            await _context.Comments
                .Where(a => a.Id == commentId)
                .ExecuteUpdateAsync(properties =>
                    properties.SetProperty(
                        a => a.CountLikes,
                        a => a.CountLikes - 1
                    )
                );

            await _context.LikeComment
                .Where(l => l.Id == commentId && l.AuthorId == authorId)
                .ExecuteDeleteAsync();

            await _context.SaveChangesAsync();

            return await _context.Comments.Where(a => a.Id == commentId).Select(a => a.CountLikes).FirstOrDefaultAsync();
        }

        public async Task<bool> IsLiked(Guid commentId, Guid authorId)
        {
            return await _context.LikeComment.AnyAsync(l => l.CommentId == commentId && l.AuthorId == authorId);
        }
    }
}
