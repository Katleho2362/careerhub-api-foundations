using CareerHub.Api.Stores;

var builder = WebApplication.CreateBuilder(args);  // creates the API application builder 

builder.Services.AddOpenApi();  // OpenAPI Documentation to test (scalar)

var app = builder.Build();   // builds the final app 

if (app.Environment.IsDevelopment())  // enable OpenApi only in development mode 
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/jobs", async () =>   // my first endpoint 
{
    await Task.CompletedTask;
    return Results.Ok(JobListingStore.Jobs); // returns: HTTP 200 OKwith all jobs.
})
.WithName("GetJobs");

app.MapGet("/jobs/{id:int}", async (int id) =>    // second endpoint which it get job by ID 
{
    await Task.CompletedTask;

    var job = JobListingStore.Jobs.FirstOrDefault(j => j.Id == id);

    return job is not null
        ? Results.Ok(job)
        : Results.NotFound(new { message = $"Job with ID {id} was not found." });
})
.WithName("GetJobById");

app.Run();