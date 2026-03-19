using LambdaGeneration.API.Core.Enums;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;

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
                ArticleTags = article.ArticleTags,
                FilePath = article.FilePath,
            };

            _context.Articles.Add(article_entity);

            await _context.Users
                .Where(u => u.UserID == article.AuthorID)
                .ExecuteUpdateAsync(u => u.SetProperty(x => x.countArticles, x => x.countArticles + 1));

            await _context.SaveChangesAsync();
        }

        public async Task Delete(Guid article_id)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(u => u.ArticleID == article_id);

            await _context.Users
                .Where(u => u.UserID == article.AuthorID)
                .ExecuteUpdateAsync(u => u.SetProperty(x => x.countArticles, x => x.countArticles - 1));

            await _context.Articles.Where(a => a.ArticleID == article_id).ExecuteDeleteAsync();
            await _context.SaveChangesAsync();
        }


        public async Task<Articles?> GetById(Guid article_id)
        {
            var article_entity = await _context.Articles.FirstOrDefaultAsync(a => a.ArticleID == article_id);
            if (article_entity == null)
                return null;
            return Map(article_entity);
        }

        public async Task<Articles?> Update(Guid article_id, string new_title, string new_content, string new_preview, string file_path)
        {
            await _context.Articles
                .Where(a => a.ArticleID == article_id)
                .ExecuteUpdateAsync(setter => setter
                    .SetProperty(ar => ar.ArticleTitle, new_title)
                    .SetProperty(ar => ar.ArticleContent, new_content)
                    .SetProperty(ar => ar.ArticlePreview, new_preview)
                    .SetProperty(ar => ar.FilePath, file_path)
                );

            await _context.SaveChangesAsync();

            var article_entity = await _context.Articles.FirstOrDefaultAsync(a => a.ArticleID == article_id);

            if (article_entity == null) return null;

            return Map(article_entity);
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
            return Map(article_entity);
        }

        public async Task<List<Articles>> GetAllArticlesUser(Guid author_id)
        {
            return await _context.Articles
                .Where(a => a.AuthorID == author_id)
                .Select(a => Map(a)).
                ToListAsync();
        }

        public async Task<List<Articles>> GetArticlesPage(int pageNumber, int pageSize)
        {
            int skip = (pageNumber - 1) * pageSize;

            return await _context.Articles
                // Сортировка от новых к старым
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip) // Пропустить
                .Take(pageSize) // Взять
                .Select(a => Map(a))
                .ToListAsync();
        }

        public async Task<List<Articles>> GetRecommentationArticles(Guid userId, int page, int countPages)
        {
            // 1. Получаем статьи, которые лайкнул пользователь
            if (page < 1 || countPages < 1)
                throw new ArgumentException("Page and countPages must be positive.");

            // 1. Получаем уникальные теги статей, которые лайкнул пользователь
            var relevantArticlesTags = await _context.Likes
                .AsNoTracking()
                .Where(l => l.AuthorId == userId)
                .Select(l => l.Articles)
                .SelectMany(a => a.ArticleTags)
                .Distinct()
                .ToArrayAsync();

            if (!relevantArticlesTags.Any())
            {
                return await GetRandomArticles(page, countPages);
            }

            int skip = (page - 1) * countPages;

            // 2. Фильтруем и пагинируем на уровне БД (без материализации всех статей в память)
            return await _context.Articles
                .AsNoTracking()
                .Where(a => a.ArticleTags.Any(tag => relevantArticlesTags.Contains(tag)))
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(countPages)
                .Select(Map)
                .ToList();

            return result;
        }

        public async Task<List<Articles>> GetRandomArticles(int page, int countPages)
        {
            int skip = (page - 1) * countPages;

            return await _context.Articles
                // Берем рандомные статьи как дефолтное значение
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip) // Пропустить
                .Take(countPages * 2)
                .OrderBy(a => EF.Functions.Random())
                .Take(countPages) // Взять
                .Select(a => Map(a))
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
                .Select(a => Map(a))
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

        public async Task<List<Articles>> SearchArticlesByTags(List<int>? tags, int page, int pageSize = 10)
        {
            int skip = (page - 1) * pageSize;

            // Если тэги не выбраны, то передаём случаёные статьи
            if (tags == null || tags.Count == 0)
            {
                return await GetRandomArticles(page, pageSize);
            }

            // Фильтруем статьи по выбранным тегам
            var articles = await _context.Articles
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(pageSize)
                .Select(a => Map(a))
                .ToListAsync();

            return articles
                .Where(a => a.ArticleTags.Any(t => tags.Contains(t)))
                .ToList();
        }

        public async Task<List<Articles>> GetLatestAsync(int page, int countPages)
        {
            int skip = (page - 1) * countPages;

            // Фильтруем статьи по выбранным тегам
            return await _context.Articles
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(countPages)
                .Select(a =>Map(a))
                .ToListAsync();
        }

        public async Task<List<Articles>> GetLikesArticles(Guid authorId)
        {
            return await _context.Likes.AsNoTracking()
                .Where(l => l.AuthorId == authorId)
                .Select(l => l.Articles)
                .Select(a => Map(a))
                .ToListAsync();
        }

        private static Articles Map(ArticlesEntity a)
        {
            return Articles.Map(
                a.ArticleID,
                    a.ArticleTitle,
                    a.ArticleContent,
                    a.ArticlePreview,
                    a.AuthorID,
                    a.ArticleTags,
                    a.CreatedDate,
                    a.CountLikes,
                    a.CountComments,
                    a.FilePath
                );
        }
    }
}
