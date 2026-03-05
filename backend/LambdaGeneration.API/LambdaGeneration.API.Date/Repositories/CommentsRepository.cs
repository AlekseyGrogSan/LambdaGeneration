using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Repositories
{
    public class CommentsRepository : ICommentsRepository
    {
        private readonly LambdaGenerationDbContext _context;

        public CommentsRepository(LambdaGenerationDbContext context)
        {
            _context = context;
        }
        public async Task<Comments> CreateCommentAsync(Comments comment)
        {
            var commentEntity = new CommentsEntity
            {
                Id = comment.Id,
                ArticleId = comment.ArticleId,
                AuthorId = comment.AuthorId,
                Content = comment.Content,
                ParentCommentId = comment.ParentCommentId,
                IsApproved = comment.IsApproved,
                DatePublish = comment.DatePublish,
                CountLikes = comment.CountLikes,
                IsUpdate = comment.IsUpdate
            };

            await _context.Articles.Where(a => a.ArticleID == comment.ArticleId)
                .ExecuteUpdateAsync(setter => 
                    setter.SetProperty(a => a.CountComments, a => a.CountComments+1));

            _context.Comments.Add(commentEntity);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comments> GetCommentByIdAsync(Guid idComment)
        {
            var commentEntity = await _context.Comments
                .AsNoTracking().FirstOrDefaultAsync(c => c.Id == idComment);

            if (commentEntity == null) return null;

            var hasReplies = await _context.Comments.AnyAsync(c => c.ParentCommentId == idComment);

            var comment = Comments.Map(
                    id: commentEntity.Id,
                    articleId: commentEntity.ArticleId,
                    authorId: commentEntity.AuthorId,
                    content: commentEntity.Content,
                    isAprovded: commentEntity.IsApproved,
                    parentCommId: commentEntity.ParentCommentId,
                    datePublish: commentEntity.DatePublish,
                    countLikes: commentEntity.CountLikes,
                    hasReplies: hasReplies,
                    isUpdate: commentEntity.IsUpdate
                );

            return comment;
        }

        public async Task<ICollection<Comments>> GetCommentsByIdAsync(Guid articleId)
        {
            var commentsEntities = await _context.Comments
                .AsNoTracking()
                .Where(c => c.ArticleId == articleId && c.ParentCommentId == null)
                .OrderBy(c => c.DatePublish)
                .Select(c => new
                {
                    Entity = c,
                    HasChildren = _context.Comments.Any(child => child.ParentCommentId == c.Id)
                })
                .ToListAsync();

            return commentsEntities.Select(c => Comments.Map(
                id: c.Entity.Id,
                articleId: c.Entity.ArticleId,
                authorId: c.Entity.AuthorId,
                content: c.Entity.Content,
                isAprovded: c.Entity.IsApproved,
                parentCommId: c.Entity.ParentCommentId,
                datePublish: c.Entity.DatePublish,
                countLikes: c.Entity.CountLikes,
                hasReplies: c.HasChildren,
                isUpdate: c.Entity.IsUpdate
            )).ToList();
        }

        public async Task<ICollection<Comments>> GetChildrenCommentsByIdAsync(Guid idParentComment)
        {
            var childrenEntities = await _context.Comments
                .AsNoTracking()
                .Where(c => c.ParentCommentId == idParentComment)
                .Select(c => new
                {
                    Entity = c,
                    HasChildren = _context.Comments.Any(child => child.ParentCommentId == c.Id)
                })
                .ToListAsync();

            return childrenEntities.Select(c => Comments.Map(
                id: c.Entity.Id,
                articleId: c.Entity.ArticleId,
                authorId: c.Entity.AuthorId,
                content: c.Entity.Content,
                isAprovded: c.Entity.IsApproved,
                parentCommId: c.Entity.ParentCommentId,
                datePublish: c.Entity.DatePublish,
                countLikes: c.Entity.CountLikes,
                hasReplies: c.HasChildren, 
                isUpdate: c.Entity.IsUpdate
            )).ToList();
        }
        public async Task<Comments?> UpdateCommentAsync(Guid idComment, string contentUpdate)
        {
            await _context.Comments
                .Where(c => c.Id == idComment)
                .ExecuteUpdateAsync(setter => setter
                    .SetProperty(c => c.Content, contentUpdate)  
                );

            await _context.SaveChangesAsync();

            var commentEntity = await _context.Comments
                .AsNoTracking().FirstOrDefaultAsync(c => c.Id == idComment);

            if (commentEntity == null) return null;

            var hasReplies = await _context.Comments.AnyAsync(c => c.ParentCommentId == idComment);

            var comment = Comments.Map(
                    id: commentEntity.Id,
                    articleId: commentEntity.ArticleId,
                    authorId: commentEntity.AuthorId,
                    content: commentEntity.Content,
                    isAprovded: commentEntity.IsApproved,
                    parentCommId: commentEntity.ParentCommentId,
                    datePublish: commentEntity.DatePublish,
                    countLikes: commentEntity.CountLikes,
                    hasReplies: hasReplies,
                    isUpdate: commentEntity.IsUpdate
                );

            return comment;
        }

        public async Task<bool> DeleteCommentAsync(Guid idComment)
        {
            var comment_to_del = await _context.Comments.AsNoTracking().FirstOrDefaultAsync(c => c.Id == idComment);
            int res = await _context.Comments.Where(c => c.Id == idComment).ExecuteDeleteAsync();
            await _context.Articles.Where(a => a.ArticleID == comment_to_del.ArticleId)
                .ExecuteUpdateAsync(setter => 
                    setter.SetProperty(a => a.CountComments, a => a.CountComments - 1));
            return res > 0;
        }

        public async Task<bool> SoftDeleteCommentAsync(Guid idComment)
        {
            var comment_to_del = await _context.Comments.AsNoTracking().FirstOrDefaultAsync(c => c.Id == idComment);
            int res = await _context.Comments.Where(c => c.Id == idComment).ExecuteDeleteAsync();
            await _context.Articles.Where(a => a.ArticleID == comment_to_del.ArticleId)
                .ExecuteUpdateAsync(setter =>
                    setter.SetProperty(a => a.CountComments, a => a.CountComments - 1));
            return res > 0;
        }
    }
}
