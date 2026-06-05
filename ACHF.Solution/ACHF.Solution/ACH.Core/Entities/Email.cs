using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class Email
    {
        public int ID { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public string Recipients { get; set; }
        public bool IsHtml { get; set; } = false;
        public string? phoneNumber { get; set; }
        public string? AttachmentPath { get; set; }
    }
}
