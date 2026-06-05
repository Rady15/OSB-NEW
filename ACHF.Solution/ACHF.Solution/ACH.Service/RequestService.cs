using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class RequestService : IRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotifyService _notifyService;

        public RequestService(IUnitOfWork unitOfWork, INotifyService notifyService)
        {
            _unitOfWork = unitOfWork;
            _notifyService = notifyService;
        }

        //public async Task<List<UserFullServiceRequest>> GetUserServicesAsync(string userId)
        //{
        //    var requests = await _unitOfWork.Repository<Request>()
        //        .GetQueryable()
        //        .Where(r => r.UserId == userId)
        //        .OrderByDescending(r => r.CreatedAt)
        //        .Select(r => new UserFullServiceRequest
        //        {
        //            RequestId = r.Id,
        //            ServiceType = r.ServiceType.ToString(),
        //            userId = r.UserId,
        //            Status = r.Status.ToString(),
        //            CreatedAt = r.CreatedAt,
        //            Price = r.Price,

        //        })
        //        .ToListAsync();

        //    return requests;
        //}
        public async Task<List<UserFullServiceRequest>> GetUserServicesAsync(string userId)
        {
            var query = _unitOfWork.Repository<Request>()
                .GetQueryable()
                .Where(r => r.UserId == userId);

            var requests = await IncludeAllDetails(query)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return requests.Select(MapRequestWithDetails).ToList();
        }
        public async Task<Request?> AddRequestDescriptionAsync(Guid requestId, string description)
        {
            var request = await _unitOfWork.Repository<Request>()
                .GetByIdAsync(requestId);

            if (request == null)
                return null;

            request.description = description;
            request.Status = RequestStatus.MissingDocuments;

            _unitOfWork.Repository<Request>().UpdateAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }
        public async Task<Request> GetRequestByIdAsync(Guid requestId)
        {
            return await _unitOfWork.Repository<Request>()
                .GetByIdAsync(requestId);
        }

        //public async Task<List<UserFullServiceRequest>> GetAllRequestsWithDetailsAsync()
        //{
        //    var requests = await _unitOfWork.Repository<Request>()
        //        .GetQueryable()
        //        .Include(r => r.Files)
        //        .Include(r => r.ZakatIncome)
        //        .Include(r => r.Training)
        //        .Include(r => r.MarketResearch)
        //        .Include(r => r.License)
        //        .Include(r => r.Technical).
        //        Include(r => r.Accounting).
        //        Include(r => r.UpdateData)
        //        .Include(r => r.CommercialMediation)
        //        .Include(r => r.LaborOffice)
        //        .Include(r => r.FeasibilityStudy)
        //        .Include(r => r.Legal)
        //        .Include(r => r.Insurance)
        //        .Include(r => r.International)
        //        .Include(r => r.ChamberOfCommerce)
        //       .Include(r => r.Custom)
        //        .OrderByDescending(r => r.CreatedAt)
        //        .ToListAsync();

        //    var result = requests.Select(r => new UserFullServiceRequest
        //    {
        //        RequestId = r.Id,
        //        ServiceType = r.ServiceType.ToString(),
        //        Status = r.Status.ToString(),
        //        CreatedAt = r.CreatedAt,
        //        FileUrls = r.Files.Select(f => f.FileUrl).ToList(),
        //        userId = r.UserId,
        //        Price = r.Price,
        //        ServiceDetails = r.ServiceType switch
        //        {
        //            ServiceType.Accounting => new
        //            {
        //                r.Accounting.ServiceType,
        //                r.Accounting.FiscalYear,
        //                r.Accounting.Description
        //            },
        //            ServiceType.Custom => new
        //            {
        //                r.Custom.ServiceName,
        //                r.Custom.Details,
        //                r.Custom.ContactNumber
        //            },
        //            ServiceType.ChamberOfCommerce => new
        //            {
        //                r.ChamberOfCommerce.ServiceType,
        //                r.ChamberOfCommerce.CommercialRegistrationNumber,
        //                r.ChamberOfCommerce.BusinessActivityType,
        //                r.ChamberOfCommerce.NumberOfEmployees,
        //                r.ChamberOfCommerce.Capital

        //            },
        //            ServiceType.CommercialMediation => new
        //            {
        //                r.CommercialMediation.MediationType,
        //                r.CommercialMediation.DisputeDescription,
        //                r.CommercialMediation.DisputeValue,
        //                r.CommercialMediation.StartDate,
        //                r.CommercialMediation.PartiesInvolved
        //            },
        //            ServiceType.FeasibilityStudy => new
        //            {
        //                r.FeasibilityStudy.StudyType,
        //                r.FeasibilityStudy.ProjectName,
        //                r.FeasibilityStudy.ActivityType,
        //                r.FeasibilityStudy.Location,
        //                r.FeasibilityStudy.ProposedCapital
        //            },
        //            ServiceType.Insurance => new
        //            {
        //                r.Insurance.ServiceType,
        //                r.Insurance.EmployeeName,
        //                r.Insurance.NationalId,
        //                r.Insurance.BirthDate,
        //                r.Insurance.BasicSalary,
        //                r.Insurance.EmploymentDate
        //            },
        //            ServiceType.International => new
        //            {
        //                r.International.ServiceType,
        //                r.International.Capital,
        //                r.International.ProposedActivity,
        //                r.International.Country,

        //            },
        //            ServiceType.LaborOffice => new
        //            {
        //                r.LaborOffice.ServiceType,
        //                r.LaborOffice.WorkerName,
        //                r.LaborOffice.IqamaNumber,
        //                r.LaborOffice.Nationality,
        //                r.LaborOffice.Profession,
        //                r.LaborOffice.IqamaExpiryDate
        //            },
        //            ServiceType.Legal => new
        //            {
        //                r.Legal.ServiceType,
        //                r.Legal.RequestDetails,
        //                r.Legal.LegalField,
        //            },

        //            ServiceType.Zakat => new
        //            {
        //                r.ZakatIncome.AnnualRevenue,
        //                r.ZakatIncome.Expenses,
        //                r.ZakatIncome.Costs,
        //                r.ZakatIncome.FixedAssets,
        //                r.ZakatIncome.FiscalYear
        //            },

        //            ServiceType.TrainingDevelopment => new
        //            {
        //                r.Training.Category,
        //                r.Training.ProgramName,
        //                r.Training.ParticipantsCount,
        //                r.Training.Level,
        //                r.Training.Method
        //            },

        //            ServiceType.MarketResearch => new
        //            {
        //                r.MarketResearch.ResearchType,
        //                r.MarketResearch.ProductDetails,
        //                r.MarketResearch.TargetMarket,
        //                r.MarketResearch.GeographicRegion,
        //                r.MarketResearch.Budget,
        //            },
        //            ServiceType.License => new
        //            {
        //                r.License.LicenseType,

        //            },
        //            ServiceType.Renewal => new
        //            {

        //            },
        //            ServiceType.Technical => new
        //            {
        //                r.Technical.ServiceType,
        //                r.Technical.ProjectDescription,
        //                r.Technical.Platform,
        //                r.Technical.BudgetInSAR,
        //                r.Technical.CreatedAt
        //            },
        //            ServiceType.UpdateData => new
        //            {

        //                r.UpdateData.UpdateType,
        //                r.UpdateData.NewAddress,
        //                r.UpdateData.NewLegalRepName,
        //                r.UpdateData.NewLegalRepIdNumber,
        //            },

        //            _ => null
        //        }
        //    }).ToList();

        //    return result;
        //}
        public async Task<List<UserFullServiceRequest>> GetAllRequestsWithDetailsAsync()
        {
            var query = _unitOfWork.Repository<Request>().GetQueryable();

            var requests = await IncludeAllDetails(query)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return requests.Select(MapRequestWithDetails).ToList();
        }

        public async Task<IEnumerable<object>> GetAllZakatAsync()
        {
            var zakatData = await _unitOfWork.Repository<ZakatIncomeServiceRequest>()
                .GetQueryable()
                .Where(z => z.Request.ServiceType == ServiceType.Zakat)
                .OrderByDescending(z => z.Request.CreatedAt)
                .Select(z => new
                {
                    z.Id,
                    z.AnnualRevenue,
                    z.Expenses,
                    z.Costs,
                    z.FixedAssets,
                    z.FiscalYear,
                    z.ServiceType,
                    RequestId = z.RequestId,
                    RequestStatus = z.Request.Status,
                    RequestCreatedAt = z.Request.CreatedAt,
                    Files = z.Request.Files.Select(f => new
                    {
                        f.Id,
                        f.FileUrl
                    })
                })
                .ToListAsync();

            return zakatData;
        }

        ////public async Task<Dictionary<string, int>> GetAllStatusCountsAsync()
        ////{
        ////    var allStatuses = Enum.GetValues(typeof(RequestStatus))
        ////                          .Cast<RequestStatus>();

        ////    var requests = await _unitOfWork.Repository<Request>()
        ////        .GetQueryable()
        ////        .ToListAsync();

        ////    var counts = allStatuses.ToDictionary(
        ////        status => status.ToString(),
        ////        status => requests.Count(r => r.Status == status)
        ////    );

        ////    return counts;
        ////}

        public async Task<Dictionary<string, int>> GetAllStatusCountsAsync()
        {
            var query = _unitOfWork.Repository<Request>()
                .GetQueryable();

            var total = await query.CountAsync();

            var statusCounts = await query
                .GroupBy(r => r.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var result = new Dictionary<string, int>
    {
        { "Total", total }
    };

            foreach (var item in statusCounts)
            {
                result[item.Status.ToString()] = item.Count;
            }

            foreach (RequestStatus status in Enum.GetValues(typeof(RequestStatus)))
            {
                if (!result.ContainsKey(status.ToString()))
                {
                    result[status.ToString()] = 0;
                }
            }

            return result;
        }
        public async Task<List<Request>> GetAllRequestsAsync()
        {
            return await _unitOfWork.Repository<Request>()
                            .GetQueryable()
                            .ToListAsync();
        }
        public async Task<bool> SetRequestPriceAsync(Guid requestId, decimal price)
        {
            var request = await _unitOfWork.Repository<Request>()
                .GetByIdAsync(requestId);

            if (request == null)
                return false;

            request.Price = price;
            request.Status = RequestStatus.WaitingForPayment;

            _unitOfWork.Repository<Request>().UpdateAsync(request);
            await _unitOfWork.CompleteAsync();

            return true;
        }


        public async Task<bool> AssignRequestToEmployee(Guid requestId, string employeeUserId)
        {
            var request = await _unitOfWork.Repository<Request>()
                .GetByIdAsync(requestId);

            if (request == null)
                return false;

            request.AssignedEmployeeUserId = employeeUserId;
            request.Status = RequestStatus.InProgress;

            _unitOfWork.Repository<Request>().UpdateAsync(request);
            await _unitOfWork.CompleteAsync();
            return true;
        }


        //public async Task<List<UserFullServiceRequest>> GetEmployeeRequests(string employeeId)
        //{
        //    return await _unitOfWork.Repository<Request>()
        //        .GetQueryable()
        //        .Where(r => r.AssignedEmployeeUserId == employeeId)
        //        .OrderByDescending(r => r.CreatedAt)
        //        .Select(r => new UserFullServiceRequest
        //        {
        //            RequestId = r.Id,
        //            ServiceType = r.ServiceType.ToString(),
        //            Status = r.Status.ToString(),
        //            CreatedAt = r.CreatedAt
        //        })
        //        .ToListAsync();
        //}
        public async Task<List<UserFullServiceRequest>> GetEmployeeRequests(string employeeId)
        {
            var query = _unitOfWork.Repository<Request>()
                .GetQueryable()
                .Where(r => r.AssignedEmployeeUserId == employeeId);

            var requests = await IncludeAllDetails(query)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return requests.Select(MapRequestWithDetails).ToList();
        }


        private UserFullServiceRequest MapRequestWithDetails(Request r)
        {
            return new UserFullServiceRequest
            {
                RequestId = r.Id,
                ServiceType = r.ServiceType.ToString(),
                Status = r.Status.ToString(),
                AssignedEmployeeUserId=r.AssignedEmployeeUserId,
                CreatedAt = r.CreatedAt,
                userId = r.UserId,
                Price = r.Price,
                FileUrls = r.Files?.Select(f => f.FileUrl).ToList() ?? new List<string>(),

                ServiceDetails = r.ServiceType switch
                {
                    ServiceType.Accounting => new
                    {
                        r.Accounting?.ServiceType,
                        r.Accounting?.FiscalYear,
                        r.Accounting?.Description
                    },

                    ServiceType.Custom => new
                    {
                        r.Custom?.ServiceName,
                        r.Custom?.Details,
                        r.Custom?.ContactNumber
                    },

                    ServiceType.ChamberOfCommerce => new
                    {
                        r.ChamberOfCommerce?.ServiceType,
                        r.ChamberOfCommerce?.CommercialRegistrationNumber,
                        r.ChamberOfCommerce?.BusinessActivityType,
                        r.ChamberOfCommerce?.NumberOfEmployees,
                        r.ChamberOfCommerce?.Capital
                    },

                    ServiceType.CommercialMediation => new
                    {
                        r.CommercialMediation?.MediationType,
                        r.CommercialMediation?.DisputeDescription,
                        r.CommercialMediation?.DisputeValue,
                        r.CommercialMediation?.StartDate,
                        r.CommercialMediation?.PartiesInvolved
                    },

                    ServiceType.FeasibilityStudy => new
                    {
                        r.FeasibilityStudy?.StudyType,
                        r.FeasibilityStudy?.ProjectName,
                        r.FeasibilityStudy?.ActivityType,
                        r.FeasibilityStudy?.Location,
                        r.FeasibilityStudy?.ProposedCapital
                    },

                    ServiceType.Insurance => new
                    {
                        r.Insurance?.ServiceType,
                        r.Insurance?.EmployeeName,
                        r.Insurance?.NationalId,
                        r.Insurance?.BirthDate,
                        r.Insurance?.BasicSalary,
                        r.Insurance?.EmploymentDate
                    },

                    ServiceType.International => new
                    {
                        r.International?.ServiceType,
                        r.International?.Capital,
                        r.International?.ProposedActivity,
                        r.International?.Country
                    },

                    ServiceType.LaborOffice => new
                    {
                        r.LaborOffice?.ServiceType,
                        r.LaborOffice?.WorkerName,
                        r.LaborOffice?.IqamaNumber,
                        r.LaborOffice?.Nationality,
                        r.LaborOffice?.Profession,
                        r.LaborOffice?.IqamaExpiryDate
                    },

                    ServiceType.Legal => new
                    {
                        r.Legal?.ServiceType,
                        r.Legal?.RequestDetails,
                        r.Legal?.LegalField
                    },

                    ServiceType.Zakat => new
                    {
                        r.ZakatIncome?.AnnualRevenue,
                        r.ZakatIncome?.Expenses,
                        r.ZakatIncome?.Costs,
                        r.ZakatIncome?.FixedAssets,
                        r.ZakatIncome?.FiscalYear
                    },

                    ServiceType.TrainingDevelopment => new
                    {
                        r.Training?.Category,
                        r.Training?.ProgramName,
                        r.Training?.ParticipantsCount,
                        r.Training?.Level,
                        r.Training?.Method
                    },

                    ServiceType.MarketResearch => new
                    {
                        r.MarketResearch?.ResearchType,
                        r.MarketResearch?.ProductDetails,
                        r.MarketResearch?.TargetMarket,
                        r.MarketResearch?.GeographicRegion,
                        r.MarketResearch?.Budget
                    },

                    ServiceType.Technical => new
                    {
                        r.Technical?.ServiceType,
                        r.Technical?.ProjectDescription,
                        r.Technical?.Platform,
                        r.Technical?.BudgetInSAR,
                        r.Technical?.CreatedAt
                    },

                    ServiceType.UpdateData => new
                    {
                        r.UpdateData?.UpdateType,
                        r.UpdateData?.NewAddress,
                        r.UpdateData?.NewLegalRepName,
                        r.UpdateData?.NewLegalRepIdNumber
                    },

                    _ => null
                }
            };
        }
        private IQueryable<Request> IncludeAllDetails(IQueryable<Request> query)
        {
            return query
                .Include(r => r.Files)
                .Include(r => r.ZakatIncome)
                .Include(r => r.Training)
                .Include(r => r.MarketResearch)
                .Include(r => r.License)
                .Include(r => r.Technical)
                .Include(r => r.Accounting)
                .Include(r => r.UpdateData)
                .Include(r => r.CommercialMediation)
                .Include(r => r.LaborOffice)
                .Include(r => r.FeasibilityStudy)
                .Include(r => r.Legal)
                .Include(r => r.Insurance)
                .Include(r => r.International)
                .Include(r => r.ChamberOfCommerce)
                .Include(r => r.Custom);
        }
        public async Task<bool> UpdateRequestStatusAsync(Guid requestId, RequestStatus newStatus)
        {
            var request = await _unitOfWork.Repository<Request>()
                .GetByIdAsync(requestId);

            if (request == null)
                return false;


            request.Status = newStatus;

            _unitOfWork.Repository<Request>().UpdateAsync(request);
            await _unitOfWork.CompleteAsync();

            return true;
        }

    }

}
