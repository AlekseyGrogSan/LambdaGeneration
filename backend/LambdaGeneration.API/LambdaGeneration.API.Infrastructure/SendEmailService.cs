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

                using var client = new SmtpClient(emailSetting["Host"],
                    int.Parse(emailSetting["Port"]))
                {
                    EnableSsl = bool.Parse(emailSetting["EnableSsl"]),
                    Credentials = new NetworkCredential(
                        emailSetting["Username"],
                        emailSetting["Password"]
                    ),
                    Timeout = 30000
                };

                var message = new MailMessage
                {
                    From = new MailAddress(
                        emailSetting["FromEmail"],
                        emailSetting["FromName"]
                        ),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                    Priority = MailPriority.Normal
                };

                message.To.Add(email);

                await client.SendMailAsync(message);
                _logger.LogInformation($"Email sent successfully to {email}");
                return true;

            }
            catch
            {
                _logger.LogError($"Failed to send email to {email}");
                return false;
            }
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
                        <p>© {DateTime.Now.Year} My Application. Все права защищены.</p>
                    </div>
                </div>
            </body>
            </html>";

            return await SendEmailAsync(email, subject, body);
        }
    }
}
