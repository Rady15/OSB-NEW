using System.Net.Mail;
using System.Net;
using ACH.Core.Entities;

namespace ACH.API.Helpers
{
    public static class EmailSettinges
    {
        public static void SendEmail(Email email)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    "ayaahmed29392@gmail.com",
                    "mpcw xgza ktqj jmhr" 
                )
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("ayaahmed29392@gmail.com", "ACH System"),
                Subject = email.Subject,
                Body = email.Body,
                IsBodyHtml = email.IsHtml
            };

            mailMessage.To.Add(email.Recipients);

            if (!string.IsNullOrEmpty(email.AttachmentPath) &&
                File.Exists(email.AttachmentPath))
            {
                mailMessage.Attachments.Add(
                    new Attachment(email.AttachmentPath)
                );
            }

            smtpClient.Send(mailMessage);
        }
    }
    //public static class EmailSettinges
    //{
    //    public static void SendEmail(Email email)
    //    {
    //        var client = new SmtpClient("smtp.gmail.com", 587);
    //        client.EnableSsl = true;
    //        client.Credentials = new NetworkCredential("ayaahmed29392@gmail.com", "mpcw xgza ktqj jmhr");
    //        client.Send("ayaahmed29392@gmail.com", email.Recipients, email.Subject, email.Body);


    //    }
    //}
}
