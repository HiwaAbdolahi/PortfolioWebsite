using PortfolioWebsite.Services;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);


// ?? Legg til user secrets
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();

}


builder.Services.AddHttpClient(); // legg til



// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<EmailService>();
// Register EmailService with dependency injection


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});




// ? Swagger (kun for testing/debugging)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Portfolio API", Version = "v1" });
});





var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    // ?? Swagger kun i Development
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();



app.UseCors("AllowAll");

app.UseAuthorization();


// ?? Ruting for Razor + API
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllers(); // ? VIKTIG for at API (ChatController) skal virke


app.Run();
