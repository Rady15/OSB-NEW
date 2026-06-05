using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using ACH.Repository.Identity;
using ACH.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace ACH.API.Extensions
{
    public static class IdentityServicesExtension
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped(typeof(IAuthService), typeof(AuthService));
            //    services.AddScoped(typeof(IProfileService), typeof(ProfileService));

            services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                //   options.Password.RequiredLength = 6;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.User.AllowedUserNameCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -._@+";
            }).AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders(); ;

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
  .AddJwtBearer(options =>
  {
      var key = Encoding.UTF8.GetBytes(configuration["JWT:secretkey"]);

      options.TokenValidationParameters = new TokenValidationParameters
      {
          ValidateAudience = true,
          ValidAudience = configuration["JWT:valiedaudiance"],
          ValidateIssuer = true,
          ValidIssuer = configuration["JWT:valiedIssuer"],
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = new SymmetricSecurityKey(key),
          ValidateLifetime = true,
          ClockSkew = TimeSpan.Zero
      };
    
  });

            return services;
        }
    }
}