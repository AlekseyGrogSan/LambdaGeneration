using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class RegexModerationService : IRegexModerationService
    {
        private readonly List<Regex> _forbiddenPatterns;

        public RegexModerationService()
        {
            _forbiddenPatterns = new List<Regex>();
            CheckForbiddenPattern();
        }

        private void CheckForbiddenPattern()
        {
            AddPattern(@".*[хx][уy][ёйеяю]\w*.*");
            AddPattern(@".*[пp][иi][з3][дd]\w+.*");
            AddPattern(@".*[еeё][бb6][аaа]\w*.*");
            AddPattern(@".*[бb6][лl][яя][^а-яa-z0-9].*");
            AddPattern(@".*[жж][oо0][пp][аaа]\w*.*");
            AddPattern(@".*[мm][уyу][дd][иi][лl]\w*.*");
            AddPattern(@".*[сc][уy][кkк][аaаи]?[^а-яa-z0-9].*");

            AddPattern(@".*[иi][дd][иi][оo0][тt]\w*.*");
            AddPattern(@".*[дd][уy][рp][аaа][кkк]\w*.*");
            AddPattern(@".*[дd][еeё][бb6][иi][лl]\w*.*");
            AddPattern(@".*[уy][ёеe][бb6][иi][щщ]\w*.*");
            AddPattern(@".*[дd][еeё][гг][еeё][нn]\w*.*");

            AddPattern(@"\bfuck\w*\b");
            AddPattern(@"\bshit\w*\b");
            AddPattern(@"\basshole\b");
            AddPattern(@"\bbitch\w*\b");
            AddPattern(@"\bdamn\b");
            AddPattern(@"\bcunt\b");

        }

        private void AddPattern(string pattern, RegexOptions options = RegexOptions.IgnoreCase)
        {
            try
            {
                _forbiddenPatterns.Add(new Regex(pattern, options | RegexOptions.Compiled));
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"Некорректный regex паттерн: {pattern}. Ошибка: {ex.Message}", ex);
            }
        }

        private async Task<ModerationRegex> ModerateContent(string content)
        {
            return await Task.Run(() =>
            {
                var result = new ModerationRegex();

                var content_lower = content.ToLower();

                foreach (var pattern in _forbiddenPatterns)
                {
                    var matches = pattern.Matches(content_lower);
                    foreach (Match match in matches)
                    {
                        if (match.Success)
                            result.Reason.Add($"Обнаружено запрещенное выражение: \"{match.Value}\"");
                    }

                }

                result.IsApproved = result.Reason.Count == 0;

                return result;
            });
        }


        public async Task<ModerationRegex> ModerateArticle(string article_title, string article_preview, string article_content)
        {
            var result = new ModerationRegex();
            var parts = new List<ModerationRegex>();

            parts.Add(await ModerateContent(article_title));
            parts.Add(await ModerateContent(article_preview));
            parts.Add(await ModerateContent(article_content));

            foreach (var part in parts)
            {
                result.Reason.AddRange(part.Reason);
            }

            result.IsApproved = parts.All(p => p.IsApproved);

            if (result.Reason.Count > 0)
            {
                result.Suggestions = "Удалите недопустимые слова из статьи!";
            }
            return result;
        }



    }
}
