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

# Assignment 2.2 — Relationships, Loading Strategies & Query Optimisation

---

## Relationship Design Decisions

### Entity Relationship Diagram

[View ERD on Lucidchart](https://lucid.app/lucidchart/ec6c4ed0-3ae7-406d-af70-aed73d85dbd7/edit?viewport_loc=510%2C-12%2C1799%2C944%2C0_0&invitationId=inv_c41728ca-4b42-494e-8c11-fe5e5b979439)

### Relationships

- **Company → JobListing** — one-to-many. A company owns many listings; a listing belongs to one company.
- **JobListing ↔ Applicant** — many-to-many via the `Application` join entity.
- **Applicant → Application** — one-to-many. An applicant can submit many applications.

### Why Application cannot be a hidden join table

A hidden join table only stores two foreign keys. `Application` carries its own data — a submission timestamp and a status (`Submitted`, `UnderReview`, `Shortlisted`, `Rejected`, `Offered`) that changes over time. That makes it a domain concept, not a link. A hidden table cannot store this data or represent state transitions.

### Delete behaviour

| Relationship | Behaviour | Reason |
|---|---|---|
| Company → JobListing | Restrict | Cannot delete a company that still has listings — deactivate listings first |
| JobListing → Application | Cascade | An application cannot exist without its listing |
| Applicant → Application | Restrict | Application history must be explicitly handled before removing an applicant |

---

## N+1 Problem

### Before fix

Without projection, EF Core loaded every column from every joined table including ones the response DTO never uses — such as the company's website, industry, and the listing's active flag. It also loaded the entire applications collection into memory just to count it in C#.

### After fix

After switching to a Select projection, EF Core fetches only the columns the DTO exposes. The application count is computed by the database using a correlated subquery — a single number returned per row rather than a full collection loaded into memory. The result is one SQL statement with a JOIN regardless of how many listings exist.

### Why this matters in production

Loading unused columns wastes database I/O and network bandwidth on every request. Computing a count in C# instead of SQL means loading entire collections into memory for a number the database can compute instantly. Neither problem is visible in development with five rows — both compound rapidly under real load with thousands of concurrent requests.

---

## Read vs Write Queries

### AsNoTracking on reads

EF Core's change tracker snapshots every loaded entity and watches for changes until SaveChangesAsync is called. On write operations this is essential — it is what allows EF Core to detect which columns changed and write only those. On read-only GET endpoints that never call SaveChangesAsync, it is wasted memory and CPU with no benefit. All read endpoints in this project use AsNoTracking to skip this overhead entirely.

### Silent data loss scenario

If AsNoTracking were accidentally applied to a write operation, EF Core would load the entity outside the change tracker. Any property changes made to that entity would be invisible to the context. SaveChangesAsync would write nothing to the database — no error, no exception, no indication anything went wrong. The caller would receive a 200 OK response and their update would silently disappear. This is one of the most dangerous bugs in EF Core applications because it produces no failure — only incorrect data.


## Assignment 2.3 — Architecture Decisions

### 1. Boundary Decisions

I took the **one repository per entity** approach: `IJobListingRepository` and
`IApplicationRepository`.

I did not create a separate `ICompanyRepository` because the only company query the system
needs is `CompanyExistsAsync(Guid companyId)` — a single boolean check that fits naturally
inside `IJobListingRepository`. Adding a full repository for one method would be an empty
abstraction with no current use case.

When `ApplicationService` needs to validate that a listing exists before creating an
application, that query lives in `IJobListingRepository.IsListingOpenAsync()`. The query
targets the `job_listings` table — it is a query about a job listing, not about an
application. Putting it in `IApplicationRepository` would create a cross-entity dependency
inside the repository layer. Putting it directly in the service would break the rule that
only repositories import EF Core.

### 2. Return Types

Returning `IQueryable<T>` from a repository interface breaks the abstraction because
composing it with `Where`, `Include`, or `AnyAsync` forces the caller to import
`Microsoft.EntityFrameworkCore`. The interface is then only implementable with EF Core —
you cannot swap it for Dapper, an in-memory list, or a mock without rewriting every caller.
The abstraction exists so callers do not need to know how data is fetched. Returning
`IQueryable<T>` collapses that boundary.

### 3. Lifetime Choices

| Service | Lifetime | Wrong choice consequence |
|---|---|---|
| `CareerHubDbContext` | Scoped | **Singleton:** shared change tracker across requests causes concurrency corruption. **Transient:** two contexts per request means `SaveChangesAsync` in one does not see changes made in the other. |
| `JobListingService` | Scoped | **Singleton:** captures a Scoped `DbContext` that is disposed after request 1, causing `ObjectDisposedException` on every subsequent request. |
| `ApplicationRepository` | Scoped | **Singleton:** same captive dependency problem — holds a disposed `DbContext` after the first request. |
| `ApplicationStatusCache` | Singleton | **Scoped/Transient:** recreates the same static read-only dictionary on every request for no benefit. A Singleton is safe because the data never changes. |

### 4. Status Transitions

**The service layer owns this validation.**

- **Not the controller** — the controller's job is HTTP parsing and response mapping. A
  background job cannot reuse a rule that lives inside an HTTP action method, and the rule
  cannot be tested without sending an HTTP request.
- **Not the repository** — the repository's job is data access. It should persist whatever
  the service hands it. Transition rules in the repository cannot be tested without a
  database connection and mix two responsibilities into one class.
- **The service** — the rule is a business rule. It is expressed as a pure static method
  that takes a current status and a target status and returns a bool, with no database
  involved.

---
## Assignment 2.3 part 2 — Architecture Notes

### 1. Repository Design Decisions

Two repositories were created following entity ownership boundaries:

- `IJobListingRepository` — owns all queries targeting `job_listings` and `companies`
- `IApplicationRepository` — owns all queries targeting `applications` and `applicants`

No `ICompanyRepository` was created. The only company query needed is
`CompanyExistsAsync` — a single boolean check that lives inside `IJobListingRepository`.
A dedicated repository for one method would be an empty abstraction with no current
use case. If company management features are added in future, the repository can be
extracted then.

### 2. What the Controller Lost

Every piece of logic removed from controllers during the refactor:

| Logic removed | Moved to | Reason |
|---|---|---|
| `AnyAsync` duplicate job check | `JobListingRepository` | Data access belongs in the repository |
| Company existence check | `JobListingRepository` | Data access belongs in the repository |
| Building the `JobListing` entity | `JobListingService` | Entity construction is business logic |
| Closing date validation | `JobListingService` | Business rule — not an HTTP concern |
| Owner validation on update | `JobListingService` | Business rule — not an HTTP concern |
| Duplicate application check | `ApplicationRepository` | Data access belongs in the repository |
| Applicant existence check | `ApplicationRepository` | Data access belongs in the repository |
| Status transition validation | `ApplicationService` | Business rule — not an HTTP concern |
| `SaveChangesAsync` calls | Repositories | Persistence is a repository responsibility |
| `try/catch` blocks | `GlobalExceptionHandler` | Exception mapping is a cross-cutting concern |

After the refactor every controller action does exactly three things: parse the request,
call one service method, return an HTTP response.

### 3. Status Transition Design

Valid transitions are encoded in a single static dictionary inside
`Services/ApplicationStatusTransitions.cs`:
Submitted    { UnderReview }
UnderReview  { Shortlisted, Rejected }
Shortlisted  { Offered, Rejected }
Offered      { }
Rejected    →{ }

This satisfies all three Part 6 requirements:

1. **Defined in exactly one place** — the dictionary is the single source of truth. No
   switch statements or if/else chains anywhere else in the codebase.

2. **No database query needed** — `ApplicationStatusTransitions.IsPermitted(from, to)` is
   a pure static method. The service calls it before touching the repository.

3. **One line to extend** — to allow `Offered → Accepted`, add one entry to the dictionary:
   `[ApplicationStatus.Offered] = new HashSet<ApplicationStatus> { ApplicationStatus.Accepted }`.
   Nothing else in the codebase changes.

### 4. Lifetime Misconfiguration

To test DI validation, `IJobListingService` was temporarily registered as Singleton:

```csharp
// Deliberate mistake — used to trigger startup validation error
services.AddSingleton<IJobListingService, JobListingService>();
```

The app refused to start with this error:
System.AggregateException: Some services are not able to be constructed.
Error: Cannot consume scoped service 'CareerHub.Api.Repositories.IJobListingRepository'
from singleton 'CareerHub.Api.Services.IJobListingService'.

**Why the container cannot allow this:** A Singleton lives for the entire application
lifetime. A Scoped service is created per request and disposed at the end of it. If a
Singleton captures a Scoped service, the Scoped service is never disposed — it lives
forever inside the Singleton. At runtime this means the `DbContext` is never disposed,
its change tracker accumulates entities from every request ever made, and concurrent
requests share state they should never share, causing data corruption and memory leaks.

**Fix:** Restore the correct lifetime:

```csharp
services.AddScoped<IJobListingService, JobListingService>(); // correct
```

The app starts cleanly after this correction.

## Assignment 2.4 — Query Optimisation & PostgreSQL Features

### 1. Constraint Placement

Service-layer validation can be bypassed by:
1. **Direct psql access** — a developer runs INSERT/UPDATE directly during an incident
2. **Migration scripts** — batch updates run directly against the database
3. **A bug in the service** — validation accidentally removed during a refactor

Without a database constraint, invalid data is stored silently with no exception or log.

### 2. Index Column Ordering

**`ix_job_listings_active_closing` — `IsActive, ClosingDate`**
`IsActive` first: eliminates all inactive listings before the range scan on `ClosingDate`.
A query filtering only on `ClosingDate` cannot use this index efficiently.

**`ix_job_listings_company_active` — `CompanyId, IsActive`**
`CompanyId` first: highly selective, narrows to one company immediately.
`IsActive` second: filters within that company's listings.

### 3. Identifying Hot Paths

**`IsListingOpenAsync`** — called on every application submission. Entry point of the
most write-heavy operation. With 1,000 daily users submitting applications, this runs
hundreds of times per hour during peak periods.

**`GetActiveListingsAsync`** — called on every job board page load. With 1,000 daily
users averaging 5 page loads each, this runs ~3-4 times per minute during business
hours. EF Core recompiles the LINQ expression tree on every call without a compiled query.

### 4. FromSql Scope

The stats query requires `RANK() OVER (ORDER BY ...)` — a window function EF Core
cannot translate from LINQ. It also requires `COUNT(*) FILTER (WHERE ...)` — PostgreSQL
conditional aggregation that has no LINQ equivalent.

### 5. EXPLAIN ANALYZE Findings

**Before indexes (natural plan):**
Seq Scan on job_listings — scanned all 207 rows, filtered 66 inactive
Seq Scan on applications — scanned all rows per listing
Execution Time: 0.381ms

**After indexes (forced with SET enable_seqscan = off):**
Bitmap Index Scan on ix_job_listings_active_closing
Index Only Scan on ix_applications_listing_id
Execution Time: 0.361ms

The planner chose Seq Scan naturally because at 207 rows it is genuinely faster.
At 50,000 rows the index becomes critical — it scans only active rows instead of
the entire table. `enable_seqscan = off` demonstrates the plan the planner would
choose at production scale.

**Full-text search plan:**
Bitmap Index Scan on ix_job_listings_search_vector
Execution Time: 0.079ms
GIN index used — no sequential scan. Stemming confirmed: "developer" matched as
"develop" in the tsvector.

### 6. Hot Path Justification

**`GetActiveListingsAsync`** — 5,000 calls/day with 1,000 daily users × 5 page loads.
EF Core compiles the LINQ tree on every call. Compiled query eliminates this overhead.

**`IsListingOpenAsync`** — called before every application insert. During a hiring
surge for a popular listing, hundreds of calls per hour. Compiled query eliminates
repeated expression compilation at the most write-heavy entry point.

### 7. Constraint Decisions

| Constraint | Rule enforced | Bypass scenario | Consequence without it |
|---|---|---|---|
| `ck_job_listings_salary_min_positive` | SalaryMin > 0 | Direct psql INSERT | Negative salaries stored and returned to users |
| `ck_job_listings_salary_range_valid` | SalaryMax > SalaryMin | Migration script | Inverted salary ranges displayed without error |
| `ck_job_listings_closing_after_posted` | ClosingDate > PostedAt | Direct psql INSERT | Listings that closed before they opened |
| `ck_applications_submitted_not_future` | SubmittedAt <= now() | Direct psql INSERT | Future-dated applications bypassing business rules |

### 8. FromSql Parameterisation

**String interpolation inside `SqlQuery<T>` is injection-safe** because EF Core
intercepts the interpolated string and converts each value into a `DbParameter`.
PostgreSQL receives `$1`, `$2` placeholders — the value never touches the SQL string.

**`string.Format` or `+` concatenation is not safe** because the value is embedded
into the SQL string before EF Core sees it — it reaches PostgreSQL as raw SQL text.

### 9. Connection Pool Calculation

**Scenario:** 3 instances, PostgreSQL `max_connections = 100`, 10 reserved for admin.
Available: 100 - 10 = 90
Per instance: 90 ÷ 3 = 30
Maximum Pool Size = 30
Minimum Pool Size = 2

Minimum of 2 prevents cold-start latency — connections are ready before the first
request arrives after a quiet period.

**When the pool is exhausted:** new requests wait for a connection. If none is freed
within the timeout (15 seconds default), the request fails with a timeout exception.
The client sees a slow response followed by a 500 error with no indication the
database was the bottleneck.