using Microsoft.EntityFrameworkCore;
using WwwSqlDesigner.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("WwwSqlDesigner"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddControllersWithViews();

// [DISABLED] KeyCloak Authentication Services
// using Microsoft.AspNetCore.Authentication.Cookies;
// using Microsoft.AspNetCore.Authentication.OpenIdConnect;
// using Microsoft.IdentityModel.Protocols.OpenIdConnect;
//
// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
// })
// .AddCookie(options =>
// {
//     options.Cookie.SameSite = SameSiteMode.None;
//     options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
// })
// .AddOpenIdConnect(options =>
// {
//     options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
//     options.Authority = builder.Configuration["KeyCloak:Authority"];
//     options.ClientId = builder.Configuration["KeyCloak:ClientId"];
//     options.ClientSecret = builder.Configuration["KeyCloak:ClientSecret"];
//     options.MetadataAddress = builder.Configuration["KeyCloak:MetadataAddress"];
//     options.ResponseType = OpenIdConnectResponseType.Code;
//     options.SaveTokens = true;
//     options.GetClaimsFromUserInfoEndpoint = true;
//     options.Scope.Add("openid");
//     options.Scope.Add("profile");
//     options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
//     {
//         NameClaimType = "name",
//         RoleClaimType = "groups",
//         ValidateIssuer = true
//     };
// });

// HSTS instructs browser to only access the site over HTTPS.
// Default HSTS value is 30 days but this is changed below.
// For production environments that are implementing HTTPS for the first time, initial HstsOptions.MaxAge is set to a small value. The value should be no more than a single day in case you need to revert the HTTPS infrastructure to HTTP. 
// After sustainability of the HTTPS configuration is realized, the HSTS max-age value can be increased to a commonly used value of one year.
// https://aka.ms/aspnetcore-hsts

// builder.Services.AddHsts(options =>
// {
//     options.Preload = true;
//     options.IncludeSubDomains = true;
//     options.MaxAge = TimeSpan.FromDays(1);
// });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    // app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

// app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseRouting();

// [DISABLED] Authentication/Authorization Middleware
// app.UseAuthentication();
// app.UseAuthorization();
// app.Use(async (context, next) =>
// {
//     if (!context.User.Identity?.IsAuthenticated ?? false)
//     {
//         await context.ChallengeAsync(OpenIdConnectDefaults.AuthenticationScheme);
//     }
//     else
//     {
//         await next();
//     }
// });

app.MapControllerRoute(
    name: "default",
    pattern: "backend/{controller=Home}/{action=Index}/{id?}");

//Migrate DB on startup if running in a Development environment
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    // context.Database.Migrate();
}

app.Run();
