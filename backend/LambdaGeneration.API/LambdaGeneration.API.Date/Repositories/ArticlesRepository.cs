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
            if (article_entity == null)
                return null;
            
            // Заменяем коллекцию тегов на новую
            article_entity.ArticleTags = new_tags.Where(t => t != 0).ToList();
            
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

        public async Task<List<Articles>> GetArticlesByAuthorPaged(Guid author_id, int page, int pageSize)
        {
            int validPage = page < 1 ? 1 : page;
            int validPageSize = pageSize < 1 ? 10 : pageSize;
            int skip = (validPage - 1) * validPageSize;

            return await _context.Articles
                .Where(a => a.AuthorID == author_id)
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(validPageSize)
                .Select(a => Map(a))
                .ToListAsync();
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
            var likedArticles = await _context.Likes
                .AsNoTracking()
                .Where(l => l.AuthorId == userId)
                .Select(l => l.Articles)
                .ToListAsync();

            // 2. Собираем теги в памяти
            var relevantArticlesTags = likedArticles
                .SelectMany(a => a.ArticleTags)
                .Distinct()
                .ToArray();

            if (!relevantArticlesTags.Any())
            {
                return await GetRandomArticles(page, countPages);
            }

            int skip = (page - 1) * countPages;

            // 3. Фильтруем и пагинируем на стороне БД, чтобы рекомендации не деградировали при росте таблицы.
            return await _context.Articles
                .AsNoTracking()
                .Where(a => a.ArticleTags.Any(tag => relevantArticlesTags.Contains(tag)))
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(countPages)
                .Select(a => Map(a))
                .ToListAsync();
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
                // Programming Languages
                // C#
                ["c#"] = new() { "c#", "си шарп", "csharp", "сишарп" },
                ["csharp"] = new() { "c#", "си шарп", "csharp", "сишарп" },
                ["сишарп"] = new() { "c#", "си шарп", "csharp", "сишарп" },
                ["си шарп"] = new() { "c#", "си шарп", "csharp", "сишарп" },

                // Java
                ["java"] = new() { "java", "джава" },
                ["джава"] = new() { "java", "джава" },

                // Python
                ["python"] = new() { "python", "питон", "пайтон" },
                ["питон"] = new() { "python", "питон", "пайтон" },
                ["пайтон"] = new() { "python", "питон", "пайтон" },

                // JavaScript
                ["javascript"] = new() { "javascript", "js", "джаваскрипт" },
                ["js"] = new() { "javascript", "js", "джаваскрипт" },
                ["джаваскрипт"] = new() { "javascript", "js", "джаваскрипт" },

                // TypeScript
                ["typescript"] = new() { "typescript", "ts", "тайпскрипт" },
                ["ts"] = new() { "typescript", "ts", "тайпскрипт" },
                ["тайпскрипт"] = new() { "typescript", "ts", "тайпскрипт" },

                // Go
                ["go"] = new() { "go", "гo" },
                ["гo"] = new() { "go", "гo" },

                // Rust
                ["rust"] = new() { "rust", "раст" },
                ["раст"] = new() { "rust", "раст" },

                // Kotlin
                ["kotlin"] = new() { "kotlin", "котлин" },
                ["котлин"] = new() { "kotlin", "котлин" },

                // Swift
                ["swift"] = new() { "swift", "свифт" },
                ["свифт"] = new() { "swift", "свифт" },

                // PHP
                ["php"] = new() { "php", "пхп" },
                ["пхп"] = new() { "php", "пхп" },

                // C++
                ["c++"] = new() { "c++", "сиплюсплюс", "плюсики", "cplusplus" },
                ["сиплюсплюс"] = new() { "c++", "сиплюсплюс", "плюсики", "cplusplus" },
                ["плюсики"] = new() { "c++", "сиплюсплюс", "плюсики", "cplusplus" },
                ["cplusplus"] = new() { "c++", "сиплюсплюс", "плюсики", "cplusplus" },

                // C
                ["c"] = new() { "c", "си" },
                ["си"] = new() { "c", "си" },

                // Ruby
                ["ruby"] = new() { "ruby", "руби" },
                ["руби"] = new() { "ruby", "руби" },

                // Frameworks and Libraries
                // .NET
                [".net"] = new() { ".net", "dotnet", "дотнет" },
                ["dotnet"] = new() { ".net", "dotnet", "дотнет" },
                ["дотнет"] = new() { ".net", "dotnet", "дотнет" },

                // ASP.NET
                ["asp.net"] = new() { "asp.net", "aspnet", "асп.нет", "аспнет" },
                ["aspnet"] = new() { "asp.net", "aspnet", "асп.нет", "аспнет" },
                ["асп.нет"] = new() { "asp.net", "aspnet", "асп.нет", "аспнет" },
                ["аспнет"] = new() { "asp.net", "aspnet", "асп.нет", "аспнет" },

                // Entity Framework
                ["entity framework"] = new() { "entity framework", "entityframework", "ef", "entityframeworkcore", "efcore" },
                ["entityframework"] = new() { "entity framework", "entityframework", "ef", "entityframeworkcore", "efcore" },
                ["ef"] = new() { "entity framework", "entityframework", "ef", "entityframeworkcore", "efcore" },
                ["entityframeworkcore"] = new() { "entity framework", "entityframework", "ef", "entityframeworkcore", "efcore" },
                ["efcore"] = new() { "entity framework", "entityframework", "ef", "entityframeworkcore", "efcore" },

                // Spring
                ["spring"] = new() { "spring", "спринг" },
                ["спринг"] = new() { "spring", "спринг" },

                // React
                ["react"] = new() { "react", "реакт" },
                ["реакт"] = new() { "react", "реакт" },

                // Angular
                ["angular"] = new() { "angular", "ангулар" },
                ["ангулар"] = new() { "angular", "ангулар" },

                // Vue
                ["vue"] = new() { "vue", "вью" },
                ["вью"] = new() { "vue", "вью" },

                // Node.js
                ["node.js"] = new() { "node.js", "nodejs", "ноде", "ноджс" },
                ["nodejs"] = new() { "node.js", "nodejs", "ноде", "ноджс" },
                ["ноде"] = new() { "node.js", "nodejs", "ноде", "ноджс" },
                ["ноджс"] = new() { "node.js", "nodejs", "ноде", "ноджс" },

                // Django
                ["django"] = new() { "django", "джанго" },
                ["джанго"] = new() { "django", "джанго" },

                // Flask
                ["flask"] = new() { "flask", "фласк" },
                ["фласк"] = new() { "flask", "фласк" },

                // Topics
                // Math
                ["math"] = new() { "math", "математика", "матан", "алгебра", "геометрия" },
                ["математика"] = new() { "math", "математика", "матан", "алгебра", "геометрия" },
                ["матан"] = new() { "math", "математика", "матан", "алгебра", "геометрия" },
                ["алгебра"] = new() { "math", "математика", "матан", "алгебра", "геометрия" },
                ["геометрия"] = new() { "math", "математика", "матан", "алгебра", "геометрия" },

                // Data Structures
                ["data structures"] = new() { "data structures", "datastructures", "структуры данных", "структурыданных" },
                ["datastructures"] = new() { "data structures", "datastructures", "структуры данных", "структурыданных" },
                ["структуры данных"] = new() { "data structures", "datastructures", "структуры данных", "структурыданных" },
                ["структурыданных"] = new() { "data structures", "datastructures", "структуры данных", "структурыданных" },

                // LLM
                ["llm"] = new() { "llm", "llms", "большие языковые модели", "большая языковая модель" },
                ["llms"] = new() { "llm", "llms", "большие языковые модели", "большая языковая модель" },
                ["большие языковые модели"] = new() { "llm", "llms", "большие языковые модели", "большая языковая модель" },
                ["большая языковая модель"] = new() { "llm", "llms", "большие языковые модели", "большая языковая модель" },

                // ML
                ["ml"] = new() { "ml", "machine learning", "machinelearning", "машинное обучение" },
                ["machine learning"] = new() { "ml", "machine learning", "machinelearning", "машинное обучение" },
                ["machinelearning"] = new() { "ml", "machine learning", "machinelearning", "машинное обучение" },
                ["машинное обучение"] = new() { "ml", "machine learning", "machinelearning", "машинное обучение" },

                // PascalABC
                ["pascalabc"] = new() { "pascalabc", "pascal abc", "паскаль абс", "паскаль", "pascal" },
                ["pascal abc"] = new() { "pascalabc", "pascal abc", "паскаль абс", "паскаль", "pascal" },
                ["паскаль абс"] = new() { "pascalabc", "pascal abc", "паскаль абс", "паскаль", "pascal" },
                ["паскаль"] = new() { "pascalabc", "pascal abc", "паскаль абс", "паскаль", "pascal" },
                ["pascal"] = new() { "pascalabc", "pascal abc", "паскаль абс", "паскаль", "pascal" },

                // Unity
                ["unity"] = new() { "unity", "юнити", "unity3d", "юнити3d" },
                ["юнити"] = new() { "unity", "юнити", "unity3d", "юнити3d" },
                ["unity3d"] = new() { "unity", "юнити", "unity3d", "юнити3d" },
                ["юнити3d"] = new() { "unity", "юнити", "unity3d", "юнити3d" },

                // IT
                ["it"] = new() { "it", "айти", "информационные технологии" },
                ["айти"] = new() { "it", "айти", "информационные технологии" },
                ["информационные технологии"] = new() { "it", "айти", "информационные технологии" }
            };

            var expanded = new HashSet<string>();

            foreach (var term in terms)
            {
                if (synonymDictionary.TryGetValue(term.ToLower(), out var synonyms))
                {
                    foreach (var synonym in synonyms)
                        expanded.Add(synonym.ToLower());
                }
                else
                {
                    expanded.Add(term.ToLower());
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
                return await _context.Articles
                .OrderBy(a => EF.Functions.Random())
                .Skip(skip)
                .Take(pageSize)
                .Select(a => Map(a))
                .ToListAsync();
            }

            // Фильтруем статьи по выбранным тегам до пагинации, иначе релевантные статьи могут "теряться".
            return await _context.Articles
                .AsNoTracking()
                .Where(a => a.ArticleTags.Any(t => tags.Contains(t)))
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(pageSize)
                .Select(a => Map(a))
                .ToListAsync();
        }

        public async Task<List<Articles>> GetLatestAsync(int page, int countPages)
        {
            int skip = (page - 1) * countPages;

            // Фильтруем статьи по выбранным тегам
            return await _context.Articles
                .OrderByDescending(a => a.CreatedDate)
                .Skip(skip)
                .Take(countPages)
                .Select(a => Map(a))
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