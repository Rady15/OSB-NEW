using ACH.API.Helpers;
using ACH.Core.Entities;
using ACH.Core.Repositories.Contract;
using ACH.Core.Services.Contract;
using ACH.Repository;
using ACH.Service;
using Microsoft.Extensions.DependencyInjection;

namespace ACH.API.Extensions
{
    public static class ApplicationServicesExtension
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped(typeof(IUnitOfWork), typeof(UnitOfWork));
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<ITechnicalServiceRequestService, TechnicalServiceRequestService>();
            services.AddScoped<IInternationalServiceRequestService, InternationalServiceRequestService>();
            services.AddScoped<ICompanyDocumentService, CompanyDocumentService>();
            services.AddScoped<IAccountingServiceRequestService, AccountingServiceRequestService>();
            services.AddScoped<ILegalServiceRequestService, LegalServiceRequestService>();
            services.AddScoped<IMarketResearchRequestService, MarketResearchRequestService>();
            services.AddScoped<ICommercialMediationRequestService,CommercialMediationRequestService>();
            services.AddScoped<IFeasibilityStudyRequestService, FeasibilityStudyRequestService>();
            services.AddScoped<IInsuranceServiceRequestService, InsuranceServiceRequestService>();
            services.AddScoped<IChamberOfCommerceServiceRequestService, ChamberOfCommerceServiceRequestService>();
            services.AddScoped<ILaborOfficeServiceRequestService, LaborOfficeServiceRequestService>();
            services.AddScoped<IZakatIncomeServiceRequestService,ZakatIncomeServiceRequestService>();
            services.AddScoped<ITrainingDevelopmentRequestService,TrainingDevelopmentRequestService>();
            services.AddScoped<ICustomServiceRequestService, CustomServiceRequestService>();
            services.AddScoped<ILicenseServiceRequestService, LicenseServiceRequestService>();
            services.AddScoped <IUpdateDataServiceRequest, UpdateDataServiceRequestService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IRenewalServiceRequestService, RenewalServiceRequestService>();
            services.AddScoped<IRequestService, RequestService>();
            services.AddScoped<INotificationService, SignalRNotificationService>();
            services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

            var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "achv2-d97bc-firebase-adminsdk-fbsvc-499067868e.json");

            services.AddSingleton<INotifyService>(provider =>
                new FirebaseNotificationService(
                    jsonPath,
                    "achv2-d97bc",
                    provider.GetRequiredService<ILogger<FirebaseNotificationService>>()
                ));

            return services;
        }
    }
}
