# CareerHub API Foundations

## Project Overview

CareerHub API Foundations is an ASP.NET Core Web API project that demonstrates how to build REST API endpoints for job listings.

The API allows users to:

- View all jobs
- View a single job by ID
- Handle invalid job requests with proper error responses

---

## Technologies Used

- - ASP.NET Core Web API
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
- - Controller-based API structure

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

## Assignment 1.3 – Error Handling and Observability

This assignment focuses on implementing centralized error handling and structured logging for the CareerHub API using ASP.NET Core and Serilog.

---

## Features Implemented

* Global exception handling using `IExceptionHandler`
* Structured `ProblemDetails` responses
* Custom domain exceptions:

  * `JobNotFoundException`
  * `DuplicateJobListingException`
* Serilog structured logging integration
* Request and response logging
* Consistent HTTP status code handling

---

## HTTP Status Codes Implemented

| Status Code               | Description                                        |
| ------------------------- | -------------------------------------------------- |
| 404 Not Found             | Returned when a job cannot be found                |
| 409 Conflict              | Returned when attempting to create a duplicate job |
| 500 Internal Server Error | Returned for unexpected server errors              |

---

## Controller Thinning

Using custom exceptions such as `JobNotFoundException` improves the architecture by keeping controllers clean and focused on request handling instead of managing error responses directly. Rather than returning `NotFound()` inside every controller action, exceptions are thrown and handled centrally by the global exception handler.

This approach:

* Reduces duplicated error-handling code
* Improves maintainability
* Keeps controllers easier to read
* Ensures consistent API error responses across the application

---

## Structured Logging

Serilog’s structured logging is preferred in production environments because it produces searchable and machine-readable logs that can easily be analyzed by monitoring and logging platforms.

Unlike `Console.WriteLine()` string concatenation, structured logging captures:

* timestamps
* HTTP methods
* request paths
* status codes
* exception details
* execution times

This makes debugging, monitoring, and troubleshooting significantly easier in large-scale applications.

---

## Technologies Used

* ASP.NET Core Web API
* Scalar API Reference
* Serilog
* ProblemDetails Middleware

---

## Tests Performed

### GET /jobs

Verified successful retrieval of job listings and Serilog request logging.

### GET /jobs/{id}

Tested invalid job ID handling which returns:

* `404 Not Found`
* Structured ProblemDetails response
* Logged exception details

### POST /jobs

Tested duplicate job submission which returns:

* `409 Conflict`
* Duplicate job exception message
* Structured error response
* Serilog exception logging

---

## Screenshots

Assignment testing screenshots are stored in:

```text
CareerHub.Api/Doc/screenshots/
```

## Authentication and Authorization

### 1. Stateless Authentication

Session-based authentication stores user information on the server after a successful login. The server creates a session and sends the client a session identifier, usually stored in a cookie. For every subsequent request, the server must look up the session data to determine who the user is.

JWT-based authentication is stateless. After a successful login, the server generates a JSON Web Token (JWT) containing user information and claims. The client sends this token with each request, and the server validates the token without storing any session data.

Statelessness is important for horizontally scaled APIs because requests can be handled by any server instance. Since no session data is stored on the server, there is no need to share session state between multiple servers. This improves scalability, simplifies deployment, and reduces infrastructure complexity.

### 2. 401 Unauthorized vs 403 Forbidden

A **401 Unauthorized** response occurs when a request requires authentication but the user has not provided a valid JWT token. The authentication middleware cannot establish the user's identity, so access is denied before the request reaches the controller.

A **403 Forbidden** response occurs when the user is authenticated successfully, but does not have the required permissions or role to perform the requested action. In this assignment, a user with the role "User" receives a 403 response when attempting to access endpoints restricted to the "Employer" role.

In the ASP.NET Core middleware pipeline:

* Authentication middleware (`UseAuthentication`) validates the JWT and determines who the user is.
* Authorization middleware (`UseAuthorization`) evaluates policies and roles to determine what the user is allowed to do.

A 401 response is typically produced during authentication, while a 403 response is produced during authorization.

### 3. Token Storage

Storing JWTs in `localStorage` is considered a security risk because JavaScript running in the browser can access the stored token. If an attacker successfully performs a Cross-Site Scripting (XSS) attack, they may be able to steal the token and impersonate the user.

Safer alternatives include:

* **HttpOnly cookies**, which cannot be accessed by JavaScript.
* **Secure cookies**, which are only transmitted over HTTPS.
* **SameSite cookies**, which help protect against Cross-Site Request Forgery (CSRF) attacks.

For production applications, storing authentication tokens in secure HttpOnly cookies is generally considered safer than storing them in localStorage.

# Assignment 2.1

## EF Core Change Tracker

The EF Core Change Tracker monitors entities that are loaded or added through the DbContext. When an entity is modified, EF Core keeps track of those changes in memory. Instead of sending a database query every time a property changes, all changes are collected and persisted when SaveChangesAsync() is called. This improves performance by reducing the number of database operations and ensures that related changes are saved together as a single unit of work.

## Migrations as Version Control

Migrations act as version control for the database schema. Whenever the application model changes, a migration records the difference between the current schema and the new schema. Migration files must be committed to source control alongside the code that generated them so that all developers and environments can keep their databases synchronized. If a teammate pulls code that depends on a migration they have not applied, the application may fail because the database structure will not match the code.

## Connection String Security

The connection string is stored in appsettings.Development.json instead of appsettings.json because it contains sensitive information such as database credentials. Files containing secrets should not be committed to source control. Exposing database credentials in a repository can allow unauthorized access to the database. In production environments, a safer approach is to use environment variables, secret management tools, or cloud-based secret stores such as Azure Key Vault to protect sensitive configuration values.
