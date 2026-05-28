# CareerHub API Foundations

## Project Overview

CareerHub API Foundations is a simple ASP.NET Core Minimal API project that demonstrates how to build REST API endpoints for job listings.

The API allows users to:

- View all jobs
- View a single job by ID
- Handle invalid job requests with proper error responses

---

## Technologies Used

- ASP.NET Core Minimal API
- .NET 10
- C#
- VS Code

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /jobs | Returns all jobs |
| GET | /jobs/{id} | Returns a single job |
| POST | /jobs | Creates a new job |
| PUT | /jobs/{id} | Updates an existing job |
| DELETE | /jobs/{id} | Deletes a job |

---

## Project Structure

| Folder/File | Purpose |
|---|---|
| Controllers/ | Contains API controllers |
| DTOs/ | Contains request and response DTOs |
| Enums/ | Contains enum definitions |
| Mappings/ | Contains mapping logic between models and DTOs |
| Models/ | Contains domain models |
| Stores/ | Contains fake in-memory data storage |
| Program.cs | Configures middleware and application services |


---

## API Structure Choice

This project uses Controllers instead of Minimal APIs.

Controllers were chosen because the application evolved beyond simple GET endpoints and now includes:

- POST requests
- PUT requests
- DELETE requests
- DTO validation
- Problem Details handling
- Enum serialization
- OpenAPI integration

Controllers provide a more structured and scalable approach for enterprise-style ASP.NET Core APIs.

This structure improves separation of concerns by keeping routing and endpoint logic organized inside dedicated controller classes.


---

## Quick Start

### Clone Repository

```bash
git clone https://github.com/Katleho2362/careerhub-api-foundations.git
```

---

### Navigate Into Project

```bash
cd careerhub-api-foundations/CareerHub.Api
```

---

### Run The API

```bash
dotnet run
```

---
## View OpenAPI / Scalar UI

After running the API, open the browser and navigate to:

```text
http://localhost:5234/openapi/v1.json
```

to view the API documentation and test endpoints.

## Testing Endpoints

Open these URLs in your browser:

### Get All Jobs

```text
http://localhost:5234/jobs
```

### Get Single Job

```text
http://localhost:5234/jobs/1
```

### Test Not Found Response

```text
http://localhost:5234/jobs/99
```

---

## Expected Features Demonstrated

- REST API endpoint creation
- Route parameters
- HTTP responses
- JSON output
- Error handling
- Minimal API structure

---

## Git Workflow

This assignment uses feature branching.

Branch used:

```text
feature/assignment-1-1-careerhub-api
```

---

## Assignment 1.2 Design Decisions

### PostedAt Field

The PostedAt field belongs in JobResponse but not in CreateJobRequest because the client should not control when a job is posted. The server automatically sets the posting date and time when a new job is created using DateTime.UtcNow. Returning the field in JobResponse allows API clients to see when the job was created while still keeping the field server-owned.

---

### Salary Cross-Field Validation

The API uses IValidatableObject to implement cross-field validation between SalaryMin and SalaryMax. This approach was chosen because standard Data Annotation attributes cannot compare two different properties directly. The validation ensures that SalaryMax must always be greater than SalaryMin, helping prevent invalid salary ranges from being stored in the system.

---

### PUT Status Code Choice

The API returns 200 OK together with the updated job response after a successful PUT request. This approach was chosen because it allows the client to immediately receive the updated resource data without making another GET request. Returning the updated object is useful for API consumers and improves client-side synchronization.

---

### DELETE Behaviour for Missing IDs

When attempting to delete a job that does not exist, the API returns 404 Not Found. This is the correct behaviour because the requested resource cannot be found in the system. Returning 404 clearly communicates to the client that the job does not exist rather than silently ignoring the request.