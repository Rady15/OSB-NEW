
using ACH.API.Extensions;
using ACH.API.Filters;
using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using ACH.Core.Hubs;
using ACH.Core.Services.Contract;
using ACH.Repository.Data;
using ACH.Repository.Identity;
using ACH.Service;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace ACH.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers()
      .AddJsonOptions(options =>
      {
          options.JsonSerializerOptions.Converters.Add(
              new JsonStringEnumConverter());
      });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("IdentityConnectionString"));
            });
            builder.Services.AddDbContext<ACHContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("ACHConnectionString"));
            });

            //builder.Services.AddDbContext<RootLinkContext>(options =>
            //{
            //    options.UseSqlServer(builder.Configuration.GetConnectionString("ACHConnectionString"));
            //});
            builder.Services.AddIdentityServices(builder.Configuration);
            builder.Services.AddApplicationServices();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("MyPolicy", policy =>
                {
                    policy.WithOrigins("https://osb-new.vercel.app")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });
            builder.Services.AddScoped<ActiveUserFilter>();
            builder.Services.AddSignalR();

            //      builder.Services.Configure<FirebaseSettings>(
            //builder.Configuration.GetSection("Firebase"));

            //  builder.Services.AddHttpClient<INotifyService, FirebaseNotificationService>();

            var app = builder.Build();
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile("achv2-d97bc-firebase-adminsdk-fbsvc-aef0b4203f.json")
                
            });
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;

            var _identityContext = services.GetRequiredService<ApplicationDbContext>();
            var _ACHContext = services.GetRequiredService<ACHContext>();
            var userManager = services.GetRequiredService<UserManager<AppUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var loggerFactory = services.GetRequiredService<ILoggerFactory>();
            try
            {
                await _identityContext.Database.MigrateAsync();
             await _ACHContext.Database.MigrateAsync();

                var _userManager = services.GetRequiredService<UserManager<AppUser>>();

                await AppIdentityDbContextSeed.SeedUsersAsync(_userManager, roleManager);
                await AppIdentityDbContextSeed.SeedAdminAsync(userManager, roleManager);
                await AppIdentityDbContextSeed.SeedRolesAsync(roleManager);


            }
            catch (Exception ex)
            {
                var logger = loggerFactory.CreateLogger<Program>();
                logger.LogError(ex, "An error occurred during migration");
                Console.WriteLine(ex);

            }
            app.MapHub<NotificationHub>("/hubs/notifications");

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCors("MyPolicy");
            app.Use(async (context, next) =>
            {
                context.Request.EnableBuffering();
                await next();
            });
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
