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

            AddPattern(@".*[гg][аaа][вv][нn][оo0]\w*.*");      // говно
            AddPattern(@".*[рp][аaа][кkк][оo0][лl]\w*.*");    // ракoл (гомосек)
            AddPattern(@".*[пp][иi][дd][аaа][рp][аaа][сc]\w*.*"); // пидорас
            AddPattern(@".*[мm][уy][дd][аaа][кkк]\w*.*");      // мудак
            AddPattern(@".*[гg][нn][иi][дd][аaа]\w*.*");       // гнида
            AddPattern(@".*[тt][вv][аaа][рp][ьь]\w*.*");       // тварь
            AddPattern(@".*[мm][уy][сc][оo0][рp]\w*.*");       // мусор (в значении "полиция")
            AddPattern(@".*[пp][еe][дd][аaа][лl]\w*.*");       // педал (педофил)
            AddPattern(@".*[гg][еe][йy]\w*.*");                 // гей
            AddPattern(@".*[лl][еe][з3][бb][иi][аaа][нn]\w*.*"); // лесбиян

            AddPattern(@".*[хx][аa][з3][яя][еe][вv][аa]\w*.*"); // хазяева (оскорбление)
            AddPattern(@".*[жж][иi][дd]\w*.*");                 // жид (оскорбление евреев)
            AddPattern(@".*[хx][аa][чч]\w*.*");                  // хач (оскорбление кавказцев)
            AddPattern(@".*[чч][уy][рp][кk][аa]\w*.*");          // чурка (оскорбление азиатов)
            AddPattern(@".*[нn][иi][гg][еe][рp]\w*.*");          // нигер
            AddPattern(@".*[пp][оo][нn][еe][дd][еe][лl][ьь][нn][иi][кk]\w*.*"); // понедельник (кодовое)

            AddPattern(@".*[тt][еe][рp][аa][кk][тt]\w*.*");      // теракт
            AddPattern(@".*[вv][зз][рp][ыы][вv]\w*.*");          // взрыв
            AddPattern(@".*[уy][бb][иi][йy][сc][тt][вv][оo]\w*.*"); // убийство
            AddPattern(@".*[рp][аa][сc][сc][тt][рp][еe][лl]\w*.*"); // расстрел
            AddPattern(@".*[пp][аa][кk][еe][тt]\w*.*");          // пакет (возможно, оружие)

            AddPattern(@".*[нn][аa][рp][кk][оo][тt][иi][кk][иi]\w*.*"); // наркотики
            AddPattern(@".*[тt][рp][аa][вv][аa]\w*.*");            // трава (марихуана)
            AddPattern(@".*[шш][ыы][рp][еe][вv][оo]\w*.*");        // ширево
            AddPattern(@".*[кk][оo][кk][сc]\w*.*");                // кокс (кокаин)
            AddPattern(@".*[гg][еe][рp][оo][иi][нn]\w*.*");        // героин
            AddPattern(@".*[сc][пp][аa][йy][сc]\w*.*");            // спайс
            AddPattern(@".*[мm][дd][мm][аa]\w*.*");                // МДМА

            AddPattern(@".*[пp][оo][рp][нn][оo]\w*.*");           // порно
            AddPattern(@".*[сc][еe][кk][сc]\w*.*");               // секс
            AddPattern(@".*[пp][рp][оo][сc][тt][иi][тt][уy][тt][кk][иi]\w*.*"); // проститутки
            AddPattern(@".*[иi][нn][тt][иi][мm]\w*.*");            // интим
            AddPattern(@".*[эe][сc][кk][оo][рp][тt]\w*.*");        // эскорт

            AddPattern(@"\bnazi\w*\b");
            AddPattern(@"\bfaggot\w*\b");
            AddPattern(@"\brapist\w*\b");
            AddPattern(@"\bmurder\w*\b");
            AddPattern(@"\bkill\w*\b");
            AddPattern(@"\bterrorist\w*\b");
            AddPattern(@"\bisis\b");
            AddPattern(@"\bal qaeda\b");
            AddPattern(@"\bhitler\b");
            AddPattern(@"\bwhite power\b");

            AddPattern(@".*[лl][оo][хx]\w*.*");                  // лох
            AddPattern(@".*[пp][оo][дd][оo][нn][оo][кk]\w*.*");   // подонок
            AddPattern(@".*[сc][кk][оo][тt][иi][нn][аa]\w*.*");   // скотина
            AddPattern(@".*[сc][вv][оo][лl][оo][чч]\w*.*");       // сволочь
            AddPattern(@".*[мm][еe][рp][зз][аa][вv][еe][цc]\w*.*"); // мерзавец

            AddPattern(@".*[уy][бb][еe][йy]\w*.*");               // убей
            AddPattern(@".*[вv][зз][оo][рp][вv][иi]\w*.*");       // взорви
            AddPattern(@".*[уy][нn][иi][чч][тt][оo][жж][ьь]\w*.*"); // уничтожь
            AddPattern(@".*[сc][жж][иi][гg][аa][йy]\w*.*");       // сжигай
            AddPattern(@".*[рp][аa][сc][пp][иi][лl][иi]\w*.*");   // распили

            AddPattern(@".*[хx][аa][чч][иi][кk]\w*.*");           // хачик
            AddPattern(@".*[чч][уy][рp][кk][аa]\w*.*");           // чурка
            AddPattern(@".*[нn][еe][гg][рp]\w*.*");               // негр
            AddPattern(@".*[жж][иi][дd][оo][вv][сc][кk][иi][йy]\w*.*"); // жидовский
            AddPattern(@".*[цc][вv][иi][лl][ьь][нn][ыy][еe]\w*.*"); // цвильные (оскорбление)

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

        public async Task<ModerationRegex> ModerationComment(string content)
        {
            var res = new ModerationRegex();
            var parts = new List<ModerationRegex>();

            parts.Add(await ModerateContent(content));

            foreach (var part in parts)
            {
                res.Reason.AddRange(part.Reason);
            }

            res.IsApproved = parts.All(p => p.IsApproved);

            if (res.Reason.Count > 0)
                res.Suggestions = "Удалите недопустимые слова из комментария!";

            return res;
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
