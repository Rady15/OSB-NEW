using ACH.API.DTOs;
using ACH.Core.Entities;
using AutoMapper;
using System;

namespace ACH.API.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {

            CreateMap<TechnicalServiceRequest, TechnicalServiceRequestDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Request.UserId))
                .ForMember(dest => dest.RequestId, opt => opt.MapFrom(src => src.Request.Id))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Request.Status.ToString()))
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateTechnicalServiceRequestDto, TechnicalServiceRequest>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

            CreateMap<CreateInternationalServiceRequestDto, InternationalServiceRequest>();

            CreateMap<InternationalServiceRequest, InternationalServiceRequestDto>()
                .ForMember(dest => dest.FileUrls, opt => opt.Ignore())
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));
            CreateMap<CompanyDocument, CompanyDocumentDto>();

            CreateMap<CreateAccountingServiceRequestDto, AccountingServiceRequest>();

            CreateMap<AccountingServiceRequest, AccountingServiceRequestDto>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Request.Status.ToString()))
                .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Request.CreatedAt))
                .ForMember(d => d.UserId, o => o.MapFrom(s => s.Request.UserId))
                .ForMember(d => d.RequestType, o => o.MapFrom(s => s.Request.ServiceType.ToString()))
                .ForMember(d => d.RequestId, o => o.MapFrom(s => s.Request.Id))
                .ForMember(d => d.RequestCode, o => o.MapFrom(s => s.Request.RequestCode))
                .ForMember(d => d.FileUrls, o => o.Ignore());

            CreateMap<CreateLegalServiceRequestDto, LegalServiceRequest>();

            CreateMap<LegalServiceRequest, LegalServiceRequestDto>()
                .ForMember(d => d.UserId, o => o.MapFrom(s => s.Request.UserId))
                .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Request.CreatedAt))
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Request.Status.ToString()))
                .ForMember(d => d.RequestId, o => o.MapFrom(s => s.Request.Id))
                .ForMember(d => d.ServiceType, o => o.MapFrom(s => s.Request.ServiceType.ToString()))
                .ForMember(d => d.RequestCode, o => o.MapFrom(s => s.Request.RequestCode));

            CreateMap<Request, RequestDto>()
                .ForMember(dest => dest.ServiceType, opt => opt.MapFrom(src => src.ServiceType.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.RequestCode));

            CreateMap<MarketResearchRequest, MarketResearchRequestDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Request.UserId))
                .ForMember(dest => dest.ResearchType, opt => opt.MapFrom(src => src.ResearchType.ToString()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Request.CreatedAt))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Request.Status.ToString()))
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateMarketResearchRequestDto, MarketResearchRequest>();

            CreateMap<CreateCustomServiceRequestDto, CustomServiceRequest>();

            CreateMap<CustomServiceRequest, CustomServiceRequestDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Request.UserId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Request.CreatedAt))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Request.Status.ToString()))
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateTrainingDevelopmentRequestDto, TrainingDevelopmentRequest>();

            CreateMap<TrainingDevelopmentRequest, TrainingDevelopmentRequestDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Request.CreatedAt))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Request.Status.ToString()))
                .ForMember(dest => dest.RequestId, opt => opt.MapFrom(src => src.Request.Id))
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateCommercialMediationRequestDto, CommercialMediationRequest>();

            CreateMap<CommercialMediationRequest, CommercialMediationRequestDto>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Request.Status.ToString()))
                .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Request.CreatedAt))
                .ForMember(d => d.UserId, o => o.MapFrom(s => s.Request.UserId))
                .ForMember(d => d.RequestType, o => o.MapFrom(s => s.Request.ServiceType.ToString()))
                .ForMember(d => d.RequestId, o => o.MapFrom(s => s.Request.Id))
                .ForMember(d => d.RequestCode, o => o.MapFrom(s => s.Request.RequestCode))
                .ForMember(d => d.FileUrls, o => o.Ignore());

            CreateMap<CreateFeasibilityStudyRequestDto, FeasibilityStudyRequest>();

            CreateMap<FeasibilityStudyRequest, FeasibilityStudyRequestDto>()
                .ForMember(dest => dest.FileUrls, opt => opt.Ignore())
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateInsuranceServiceRequestDto, InsuranceServiceRequest>();

            CreateMap<InsuranceServiceRequest, InsuranceServiceRequestDto>()
                .ForMember(dest => dest.FileUrls, opt => opt.Ignore())
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateChamberOfCommerceServiceRequestDto, ChamberOfCommerceServiceRequest>();

            CreateMap<ChamberOfCommerceServiceRequest, ChamberOfCommerceServiceRequestDto>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Request.Status.ToString()))
                .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Request.CreatedAt))
                .ForMember(d => d.UserId, o => o.MapFrom(s => s.Request.UserId))
                .ForMember(d => d.RequestType, o => o.MapFrom(s => s.Request.ServiceType.ToString()))
                .ForMember(d => d.RequestId, o => o.MapFrom(s => s.Request.Id))
                .ForMember(d => d.RequestCode, o => o.MapFrom(s => s.Request.RequestCode))
                .ForMember(d => d.FileUrls, o => o.Ignore());

            CreateMap<CreateLaborOfficeServiceRequestDto, LaborOfficeServiceRequest>();

            CreateMap<LaborOfficeServiceRequest, LaborOfficeServiceRequestDto>()
                .ForMember(dest => dest.ServiceType, opt => opt.MapFrom(src => src.Request.ServiceType.ToString()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Request.CreatedAt))
                .ForMember(dest => dest.RequestId, opt => opt.MapFrom(src => src.Request.Id))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Request.Status.ToString()))
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode))
                .ForMember(dest => dest.FileUrls, opt => opt.MapFrom(src => src.Request.Files.Select(f => f.FileUrl).ToList()))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Request.UserId));

            CreateMap<CreateZakatIncomeServiceRequestDto, ZakatIncomeServiceRequest>()
                .ForMember(dest => dest.ServiceType,
                    opt => opt.MapFrom(src => Enum.Parse<ZakatIncomeServiceType>(src.ServiceType)));

            CreateMap<ZakatIncomeServiceRequest, ZakatIncomeServiceRequestDto>()
                .ForMember(dest => dest.ServiceType, opt => opt.MapFrom(src => src.ServiceType.ToString()))
                .ForMember(dest => dest.FileUrls, opt => opt.Ignore())
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateLicenseServiceRequestDto, LicenseServiceRequest>();

            CreateMap<LicenseServiceRequest, LicenseServiceRequestDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Request.UserId))
                .ForMember(dest => dest.LicenseType, opt => opt.MapFrom(src => src.LicenseType.ToString()))
                .ForMember(dest => dest.RequestId, opt => opt.MapFrom(src => src.Request.Id))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Request.CreatedAt))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Request.Status.ToString()))
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateUpdateBusinessRequestDto, UpdateDataServiceRequest>();

            CreateMap<UpdateDataServiceRequest, UpdateBusinessRequestDto>()
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

            CreateMap<CreateRenewalServiceRequestDto, RenewalServiceRequestDto>();

            CreateMap<RenewalServiceRequest, RenewalServiceRequestDto>()
                .ForMember(dest => dest.RequestCode, opt => opt.MapFrom(src => src.Request.RequestCode));

        }
    }
}