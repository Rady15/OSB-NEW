using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public enum RequestStatus
    {
        Pending,
        InProgress,
        Completed,
        Cancelled,
        WaitingForPayment,
        Paid,
        MissingDocuments

    }
}
