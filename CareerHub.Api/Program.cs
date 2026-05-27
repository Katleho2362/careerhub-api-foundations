using CareerHub.Api.Stores;

var builder = WebApplication.CreateBuilder(args);  // creates the API application builder 

builder.Services.AddControllers();
builder.Services.AddOpenApi();  // OpenAPI Documentation to test (scalar)


var app = builder.Build();   // builds the final app 

if (app.Environment.IsDevelopment())  // enable OpenApi only in development mode 
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
// Maps controller routes such as GET /jobs and GET /jobs/{id}
app.MapControllers();

app.Run();