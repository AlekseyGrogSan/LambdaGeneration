using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class GigaChatModerationService : IGigaChatModerationService
    {
        private readonly HttpClient _httpClient;
        private readonly string _authUrl;
        private readonly string _apiUrl;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _scope;
        private string _accessToken;
        private DateTime _tokenExpires;

        public GigaChatModerationService(string clientId, string clientSecret, string scope = "GigaChat")
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _scope = scope;
            _authUrl = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
            _apiUrl = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";

            var handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, sslPolicyErrors) => true;

            _httpClient = new HttpClient(handler);
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        }
        
        //Проверка не истек ли токен
        //Если истек, генерим новый
        public async Task<string> GetAccessToken()
        {
            if (!string.IsNullOrEmpty(_accessToken) && DateTime.UtcNow < _tokenExpires)
            {
                return _accessToken;
            }

            // ОТКЛЮЧЕНИЕ SSL ПРОВЕРКИ
            var handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, sslPolicyErrors) => true;

            using var httpClient = new HttpClient(handler);
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            var authData = new[]
            {
            new KeyValuePair<string, string>("scope", _scope)
            };

            var reqUiD = Guid.NewGuid().ToString();

            string correctClientId;
            string correctClientSecret;

            try
            {
                var secretBytes = Convert.FromBase64String(_clientSecret);
                var decodedString = Encoding.UTF8.GetString(secretBytes);

                // Разделяем по двоеточию
                var parts = decodedString.Split(':');
                if (parts.Length == 2)
                {
                    correctClientId = parts[0];
                    correctClientSecret = parts[1];
                }
                else
                {
                    // Если не разделилось, используем оригинальные
                    correctClientId = _clientId;
                    correctClientSecret = _clientSecret;
                }
            }
            catch (Exception ex)
            {
                // Если декодирование не удалось, используем как есть
                correctClientId = _clientId;
                correctClientSecret = _clientSecret;
            }

            // Формируем правильные credentials
            var credentials = $"{correctClientId}:{correctClientSecret}";
            var authBytes = Encoding.UTF8.GetBytes(credentials);
            var authString = Convert.ToBase64String(authBytes);

            var request = new HttpRequestMessage(HttpMethod.Post, _authUrl)
            {
                Content = new FormUrlEncodedContent(authData)
            };
            request.Headers.Add("Accept", "application/json");
            request.Headers.Add("RqUID", reqUiD);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authString);

            var response = await httpClient.SendAsync(request);

            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);

            _accessToken = tokenResponse.AccessToken;
            _tokenExpires = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn - 60);

            return _accessToken;
        }
        public async Task<ModerationResult> ModerationContent(string content)
        {
            try
            {
                var token = await GetAccessToken();
                //промт
                var moderPromt = @$"
                    Проанализирую следующий текст и определи, валиден ли он, для публикации на сайте.
                    Оцени по следующим критериям:
                    1.Является ли текст антинаучным
                    2.Контент для взрослых
                    3.Наличие дискриминации и разжигания ненависти
                    4.Спам, мошеничество, нелегальные акции и схемы
                    
                    Ответь в формате JSON:
                    {{
                        ""is_approved"": true/false,
                        ""reason"": ""краткое объяснение"",
                        ""confidence"": 0.95,
                        ""flags"": [""список нарушений""]
                    }}
                    
                    Текст  для анализа: ""{content}""";
                //запрос
                var request = new GigaChatRequest
                {
                    Messages = new List<ChatMessage>
                    {
                        new ChatMessage
                        {
                            Role = "system",
                            Content = "Ты - модератор контента." +
                            "Отвечай только в формате JSON."
                        },
                        new ChatMessage
                        {
                            Role = "user",
                            Content = moderPromt
                        }
                    },
                    Temperature = 0.1,
                    MaxTokens = 3000
                };

                //сериализуем запрос
                var jsonRequest = JsonConvert.SerializeObject(request);
                //создаем http форму запроса
                var httpContent = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
                //создаем http запрос с Bearer токеном
                var httpRequest = new HttpRequestMessage(HttpMethod.Post, _apiUrl)
                {
                    Content = httpContent
                };

                httpRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                //отправили запрос
                var response = await _httpClient.SendAsync(httpRequest);

                response.EnsureSuccessStatusCode();
                //приняли ответ
                var responseContent = await response.Content.ReadAsStringAsync();

                var gigaChatResponse = JsonConvert.DeserializeObject<GigaChatResponse>(responseContent);

                if (gigaChatResponse?.Choices?.Count() > 0)
                {
                    var moderationResult = gigaChatResponse.Choices[0].Message.Content;

                    return ParseResult(moderationResult);
                }
                return new ModerationResult
                {
                    IsApproved = false,
                    Reason = "Ошибка модерации"
                };
            }
            catch (Exception ex)
            {
                return new ModerationResult
                {
                    IsApproved = false,
                    Reason = $"Ошибка модерации: {ex.Message}"
                };
            }
        }

        private ModerationResult ParseResult(string jsonResponse)
        {
            try
            {
                var cleanJson = jsonResponse.Trim();

                if (cleanJson.StartsWith("```json"))
                    cleanJson = cleanJson.Substring(7);
                if (cleanJson.EndsWith("```"))
                    cleanJson = cleanJson.Substring(0, cleanJson.Length - 3);

                cleanJson = cleanJson.Trim();

                var jObject = JObject.Parse(cleanJson);

                var result = new ModerationResult();

                if (jObject["is_approved"] != null)
                {
                    var approvedValue = jObject["is_approved"].ToString().ToLower();
                    result.IsApproved = approvedValue == "true" || approvedValue == "1";
                }

                if (jObject["is_approved"]?.Type == JTokenType.Boolean)
                {
                    result.IsApproved = jObject["is_approved"].Value<bool>();
                }

                result.Reason = jObject["reason"]?.ToString() ?? "Не указано";
                result.Confidence = jObject["confidence"]?.Value<double>() ?? 0.8;
                result.Flags = jObject["flags"]?.ToObject<List<string>>() ?? new List<string>();

                return result;
            }
            catch (Exception ex)
            {
                return AnalyzeTextResponse(jsonResponse);
            }
        }

        private ModerationResult AnalyzeTextResponse(string response)
        {
            var negativeKeywords = new[] { "отклонен", "заблокирован", "нарушение", "небезопасен", "запрещен" };

            var positiveKeywords = new[] { "одобрен", "безопасен", "разрешен", "соответствует" };

            var isApproved = positiveKeywords.Any(k => response.ToLower().Contains(k)) &&
                            !negativeKeywords.Any(k => response.ToLower().Contains(k));

            return new ModerationResult
            {
                IsApproved = isApproved,
                Reason = "Автоматический анализ ответа",
                Confidence = isApproved ? 0.8 : 0.6
            };
        }

        public async Task<bool> IsContentSafeAsync(string content)
        {
            var result = await ModerationContent(content); // Использует основной метод
            return result.IsApproved; // Возвращает только булево значение
        }
    }
}
