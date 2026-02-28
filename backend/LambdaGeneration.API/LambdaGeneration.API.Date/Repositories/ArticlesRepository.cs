using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using Nestor.Nyms;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Repositories
{
    public class ArticlesRepository : IArticlesRepository
    {
        private readonly LambdaGenerationDbContext _context;

        public ArticlesRepository(LambdaGenerationDbContext context)
        {
            _context = context;
        }

        public async Task Create(Articles article)
        {
            if (article.ArticleTags.Contains(0))
            {
                while (article.ArticleTags.Contains(0))
                {
                    article.ArticleTags.Remove(0);
                }
            }
            var article_entity = new ArticlesEntity
            {
                ArticleID = article.ArticleID,
                ArticleTitle = article.ArticleTitle,
                ArticleContent = article.ArticleContent,
                ArticlePreview = article.ArticlePreview,
                AuthorID = article.AuthorID,
                CreatedDate = article.CreatedDate,
                ArticleTags = article.ArticleTags
            };

            _context.Articles.Add(article_entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Guid article_id)
        {
            await _context.Articles.Where(a => a.ArticleID == article_id).ExecuteDeleteAsync();
            await _context.SaveChangesAsync();
        }


        public async Task<Articles?> GetById(Guid article_id)
        {
            var article_entity = await _context.Articles.FirstOrDefaultAsync(a => a.ArticleID == article_id);
            if (article_entity == null)
                return null;
            return Articles.Map(article_entity.ArticleID,
                article_entity.ArticleTitle,
                article_entity.ArticleContent,
                article_entity.ArticlePreview,
                article_entity.AuthorID,
                article_entity.ArticleTags,
                article_entity.CreatedDate,
                article_entity.CountLikes
                );
        }

        public async Task<Articles?> Update(Guid article_id, string new_title, string new_content, string new_preview)
        {
            await _context.Articles
                .Where(a => a.ArticleID == article_id)
                .ExecuteUpdateAsync(setter => setter
                .SetProperty(ar => ar.ArticleTitle, new_title)
                .SetProperty(ar => ar.ArticleContent, new_content)
                .SetProperty(ar => ar.ArticlePreview, new_preview)
                );

            await _context.SaveChangesAsync();

            var article_entity = await _context.Articles.FirstOrDefaultAsync(a => a.ArticleID == article_id);

            return Articles.Map(
                article_entity.ArticleID,
                article_entity.ArticleTitle,
                article_entity.ArticleContent,
                article_entity.ArticlePreview,
                article_entity.AuthorID,
                article_entity.ArticleTags,
                article_entity.CreatedDate,
                article_entity.CountLikes
            );
        }

        public async Task<Articles?> UpdateTags(Guid article_id, List<int> new_tags)
        {
            var article_entity = await _context.Articles.FirstOrDefaultAsync(a => a.ArticleID == article_id);
            if (article_entity.ArticleTags.Contains(0))
            {
                while (article_entity.ArticleTags.Contains(0))
                {
                    article_entity.ArticleTags.Remove(0);
                }
            }
            if (article_entity == null)
                return null;
            article_entity.ArticleTags = new_tags;
            await _context.SaveChangesAsync();
            return Articles.Map(
                article_entity.ArticleID,
                article_entity.ArticleTitle,
                article_entity.ArticleContent,
                article_entity.ArticlePreview,
                article_entity.AuthorID,
                article_entity.ArticleTags,
                article_entity.CreatedDate,
                article_entity.CountLikes
            );
        }

        public async Task<List<Articles>> GetAllArticlesUser(Guid author_id)
        {
            return await _context.Articles
                .Where(a => a.AuthorID == author_id)
                .Select(a => Articles.Map(a.ArticleID,
                a.ArticleTitle,
                a.ArticleContent,
                a.ArticlePreview,
                a.AuthorID,
                a.ArticleTags,
                a.CreatedDate,
                a.CountLikes)).
                ToListAsync();
        }

        public async Task<List<Articles>> GetArticlesPage(int pageNumber, int pageSize)
        {
            // Расчет смещения
            int skip = (pageNumber - 1) * pageSize;

            return await _context.Articles
                // Сортировка от новых к старым
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip) // Пропустить
                .Take(pageSize) // Взять
                .Select(a => Articles.Map(
                    a.ArticleID,
                    a.ArticleTitle,
                    a.ArticleContent,
                    a.ArticlePreview,
                    a.AuthorID,
                    a.ArticleTags,
                    a.CreatedDate,
                    a.CountLikes))
                .ToListAsync();
        }

        public async Task<List<Articles>> SearchArticles(string searchTerm, int pageNumber, int pageSize = 10)
        {
            //Фильтрация (если поисковый запрос не пустой)
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return null;
            }

            int skip = (pageNumber - 1) * pageSize;

            var query = _context.Articles.AsNoTracking();

            // Приводим к нижнему регистру для надежности
            string stringTerms = searchTerm.Trim().ToLower();
            List<string> terms = stringTerms.Split(new[] { ',', ' ', '!', '?' }, StringSplitOptions.RemoveEmptyEntries).ToList();

            var expandedTerms = await ExpandTerms(terms);

            // Поиск по оригинальным терминам + синонимам
            query = query.Where(a =>
                expandedTerms.Any(t => a.ArticleTitle.ToLower().Contains(t)) ||
                expandedTerms.Any(t => a.ArticleContent.ToLower().Contains(t))
            );

            return await query
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(pageSize)
                .Select(a => Articles.Map(
                    a.ArticleID,
                    a.ArticleTitle,
                    a.ArticleContent,
                    a.ArticlePreview,
                    a.AuthorID,
                    a.ArticleTags,
                    a.CreatedDate,
                    a.CountLikes))
                .ToListAsync();
        }

        // Улучшенный метод расширения терминов
        private async Task<List<string>> ExpandTerms(List<string> terms)
        {
            var synonymDictionary = new Dictionary<string, List<string>>
            {
                // Python - теперь есть все три варианта как ключи!
                ["python"] = new() { "python", "питон", "пайтон" },
                ["питон"] = new() { "python", "питон", "пайтон" },
                ["пайтон"] = new() { "python", "питон", "пайтон" },

                // C#
                ["c#"] = new() { "c#", "си шарп", "csharp", "сишарп" },
                ["csharp"] = new() { "c#", "си шарп", "csharp", "сишарп" },
                ["сишарп"] = new() { "c#", "си шарп", "csharp", "сишарп" },
                ["си шарп"] = new() { "c#", "си шарп", "csharp", "сишарп" },

                // Java
                ["java"] = new() { "java", "джава" },
                ["джава"] = new() { "java", "джава" },

                //С++
                ["С++"] = new() { "C++","сиплюсплюс", "плюсики", "cplusplus" },
                ["сиплюсплюс"] = new() { "C++", "сиплюсплюс", "плюсики", "cplusplus" },
                ["плюсы"] = new() { "C++", "сиплюсплюс", "плюсики", "cplusplus" },
                ["плюсики"] = new() { "C++", "сиплюсплюс", "плюсики", "cplusplus" },
                ["cplusplus"] = new() { "C++", "сиплюсплюс", "плюсики", "cplusplus" },

                // JavaScript
                ["javascript"] = new() { "javascript", "js", "джаваскрипт" },
                ["js"] = new() { "javascript", "js", "джаваскрипт" },
                ["джаваскрипт"] = new() { "javascript", "js", "джаваскрипт" },

                // .NET
                [".net"] = new() { ".net", "dotnet", "дотнет" },
                ["dotnet"] = new() { ".net", "dotnet", "дотнет" },
                ["дотнет"] = new() { ".net", "dotnet", "дотнет" },

                // IT
                ["it"] = new() { "it", "айти" },
                ["айти"] = new() { "it", "айти" }
            };

            var expanded = new HashSet<string>();

            foreach (var term in terms)
            {
                if (synonymDictionary.TryGetValue(term, out var synonyms))
                { 
                    foreach (var synonym in synonyms)
                        expanded.Add(synonym.ToLower());
                }
                else
                {
                    expanded.Add(term);
                }
            }

            return expanded.ToList();
        }
    }
}
