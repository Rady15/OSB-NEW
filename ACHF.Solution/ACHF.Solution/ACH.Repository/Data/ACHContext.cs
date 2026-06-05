using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Repository.Data
{
    public class ACHContext : DbContext
    {
        public ACHContext(DbContextOptions<ACHContext> options) : base(options)
        {
        }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Request>()
    .HasOne(r => r.ZakatIncome)
    .WithOne(z => z.Request)
    .HasForeignKey<ZakatIncomeServiceRequest>(z => z.RequestId);

    //        modelBuilder.Entity<Request>()
    //.HasOne(r => r.User)
    //.WithMany() 
    //.HasForeignKey(r => r.UserId)
    //.OnDelete(DeleteBehavior.Cascade);




        }

        public DbSet<TechnicalServiceRequest> TechnicalServiceRequests { get; set; }
        public DbSet<InternationalServiceRequest> InternationalServiceRequests { get; set; }
        public DbSet<AccountingServiceRequest> AccountingServiceRequests { get; set; }
        public DbSet<LegalServiceRequest> LegalServiceRequests { get; set; }
        public DbSet<MarketResearchRequest> MarketResearchRequests { get; set; }
        public DbSet<ServiceFile> ServiceFiles { get; set; }
        public DbSet<TrainingDevelopmentRequest> TrainingDevelopmentRequests { get; set; }
        public DbSet<CommercialMediationRequest> CommercialMediationRequests { get; set; }
        public DbSet<FeasibilityStudyRequest> FeasibilityStudyRequests { get; set; }
        public DbSet<InsuranceServiceRequest> InsuranceServiceRequests { get; set; }
        public DbSet<ChamberOfCommerceServiceRequest> ChamberOfCommerceServiceRequests { get; set; }
        public DbSet<LaborOfficeServiceRequest> LaborOfficeServiceRequests { get;set; }
        public DbSet<ZakatIncomeServiceRequest> ZakatIncomeServiceRequests { get; set; }
        public DbSet<CustomServiceRequest> CustomServiceRequests { get; set; }
        public DbSet<UpdateDataServiceRequest> UpdateDataServiceRequests { get; set; }
        public DbSet<LicenseServiceRequest> LicenseServiceRequests { get; set; }
        public DbSet<RenewalServiceRequest> RenewalServiceRequests { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<CompanyDocument> CompanyDocuments { get; set; }
    }
}
