using LambdaGeneration.API.Application.Interfaces.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class SendEmail : ISendEmail
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SendEmail> _logger;

        public SendEmail(IConfiguration configuration, ILogger<SendEmail> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string email, string subject, string body)
        {
            try
            {
                var emailSetting = _configuration.GetSection("EmailSettings");
                var host = emailSetting["Host"];
                var portValue = emailSetting["Port"];
                var enableSslValue = emailSetting["EnableSsl"];
                var username = emailSetting["Username"];
                var password = emailSetting["Password"];
                var fromEmail = emailSetting["FromEmail"];
                var fromName = emailSetting["FromName"];

                if (string.IsNullOrWhiteSpace(host) ||
                    string.IsNullOrWhiteSpace(portValue) ||
                    string.IsNullOrWhiteSpace(enableSslValue) ||
                    string.IsNullOrWhiteSpace(username) ||
                    string.IsNullOrWhiteSpace(password) ||
                    string.IsNullOrWhiteSpace(fromEmail))
                {
                    _logger.LogError("EmailSettings are not fully configured");
                    return false;
                }

                if (!int.TryParse(portValue, out var port))
                {
                    _logger.LogError("Invalid EmailSettings: Port value {Port}", portValue);
                    return false;
                }

                if (!bool.TryParse(enableSslValue, out var enableSsl))
                {
                    _logger.LogError("Invalid EmailSettings: EnableSsl value {EnableSsl}", enableSslValue);
                    return false;
                }

                using var client = new SmtpClient(host, port)
                {
                    EnableSsl = enableSsl,
                    Credentials = new NetworkCredential(
                        username,
                        password
                    ),
                    Timeout = 30000
                };

                var message = new MailMessage
                {
                    From = new MailAddress(
                        fromEmail,
                        fromName
                        ),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                    Priority = MailPriority.Normal
                };

                message.To.Add(email);

                await client.SendMailAsync(message).WaitAsync(TimeSpan.FromSeconds(15));
                _logger.LogInformation($"Email sent successfully to {email}");
                return true;

            }
            catch (TimeoutException ex)
            {
                _logger.LogError(ex, "SMTP send timeout for {Email}", email);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", email);
                return false;
            }
        }

        public async Task<bool> SendVerifyEmail(string email, string code)
        {
            var subject = "Подтверждение почты";
            var body = $@"<!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    body {{ font-family: Arial, sans-serif; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #007bff; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9f9f9; }}
                    .button {{ display: inline-block; padding: 12px 24px; background: #007bff; 
                              color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }}
                    .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Подтверждение почты</h1>
                    </div>
                    <div class='content'>
                        <p>Здравствуйте!</p>
                        <p>Вы регистрируетесь на сайте, для этого необходимо подтвердить почту</p>
                        <p>Введите следующий код на сайте:</p>
                        <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;'>
                            {code}
                        </p>
                        <p><strong>Ссылка действительна в течение 15 минут.</strong></p>
                        <p>Если вы не регистрируетесь, проигнорируйте это письмо.</p>
                    </div>
                    <div class='footer'>
                        <p>© {DateTime.Now.Year} Lambda Generation. Все права защищены.</p>
                    </div>
                </div>
            </body>
            </html>";

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendPasswordResetEmail(string email, string resetLink)
        {
            var subject = "Восстановление пароля";
            var body = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    body {{ font-family: Arial, sans-serif; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #007bff; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9f9f9; }}
                    .button {{ display: inline-block; padding: 12px 24px; background: #007bff; 
                              color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }}
                    .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Восстановление пароля</h1>
                    </div>
                    <div class='content'>
                        <p>Здравствуйте!</p>
                        <p>Вы запросили восстановление пароля для вашего аккаунта.</p>
                        <p>Для создания нового пароля нажмите на кнопку ниже:</p>
                        <p style='text-align: center;'>
                            <a href='{resetLink}' class='button'>Восстановить пароль</a>
                        </p>
                        <p>Или скопируйте эту ссылку в браузер:</p>
                        <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;'>
                            {resetLink}
                        </p>
                        <p><strong>Ссылка действительна в течение 1 часа.</strong></p>
                        <p>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
                    </div>
                    <div class='footer'>
                        <p>© {DateTime.Now.Year} Lambda Generation. Все права защищены.</p>
                    </div>
                </div>
            </body>
            </html>";

            return await SendEmailAsync(email, subject, body);
        }
    }
}
