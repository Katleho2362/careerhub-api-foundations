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

# Assignment 3.1 — CareerHub API: Advanced API Patterns for Frontend Consumption

## Overview

This assignment makes the CareerHub API production-ready for frontend consumption. It adds pagination, filtering and sorting, partial updates, API versioning, ETags, CORS, and rate limiting. All changes are at the API boundary — the domain model, service layer, and database schema are untouched.

---

## Part 1 — Written Decisions

### 1. Pagination Strategy

**Strategy chosen: Offset pagination**

Offset pagination was chosen for its simplicity and clean fit with the existing `IQueryable` pipeline. The known tradeoff is page drift — if a new listing is posted between a user fetching page 1 and page 2, that listing shifts subsequent rows and the user may see a duplicate or miss one result.

For a job board this is acceptable. Browsing listings is casual, not transactional. A user occasionally seeing a repeated listing while scrolling is a minor inconvenience, not a critical error. The complexity of cursor pagination is not justified by the stakes of the data.

---

### 2. PATCH Race Condition

**The PUT race condition:**

Two recruiters open the same listing simultaneously. Recruiter A updates the salary and submits a PUT with the full record. Recruiter B, unaware, updates the description and also submits a PUT with the original salary. The server processes both and Recruiter B's PUT silently overwrites Recruiter A's salary change. No error is raised and the wrong salary is now in the database.

**Why the nullable DTO approach resolves this:**

With PATCH, each recruiter only sends the field they changed. Recruiter B's request never includes the salary field, so the server leaves it untouched. Recruiter A's change survives.

**Limitation of the nullable DTO approach:**

It cannot distinguish between "I did not send this field" and "I want to explicitly clear this field to null". If a recruiter wants to remove an expiry date by setting it to null, a nullable PATCH cannot express that intent. JSON Patch (RFC 6902) solves this with explicit operations like `remove`, making the intent unambiguous.

---

### 3. Versioning Strategy

**Breaking vs non-breaking changes:**

A breaking change removes or renames something a client already depends on — existing client code stops working. A non-breaking change adds something new while leaving everything existing intact.

In CareerHub context: adding a new `applicationDeadline` field to the job response is non-breaking — existing clients ignore unknown fields. Renaming `salaryMin` to `minimumSalary` is breaking — every client reading `salaryMin` silently gets nothing.

**What `AssumeDefaultVersionWhenUnspecified = true` does:**

Without it, requests to `/api/jobs` with no version segment return 400 because the middleware cannot determine which version to route to. With it enabled, unversioned requests default to v1. This means all existing clients that called `/api/jobs` before versioning was introduced continue working without any changes — the rollout is non-breaking.

---

### 4. Rate Limiting Algorithm

**Algorithm chosen: Fixed window for `apply`, sliding window for `search`**

For application submission the fixed window with a 60-minute window is appropriate. The threat is bots submitting fake applications at volume, not burst traffic in seconds. A 60-minute window limits a bot to 5 submissions per hour per IP — low enough to be useless for fraud at scale.

Fixed window has a burst vulnerability at window boundaries — a client could send 5 requests just before the window resets and 5 more just after, getting 10 through in a short period. For a 60-minute window this matters less: the burst exposure is narrow relative to the window, and even a burst of 10 applications in 2 minutes is still very low volume.

For the search endpoint a sliding window is used because it eliminates the burst vulnerability entirely, which matters more for an endpoint backed by an expensive GIN index query.

---

## Part 2 — CORS Configuration

CORS is configured with a named policy that permits the Next.js development origin (`http://localhost:3000`) and a production placeholder (`https://careerhub.vercel.app`). It allows any header and method, allows credentials (required for the Authorization header), and exposes `X-Total-Count` so the frontend can read the total listing count from the response headers.

The policy is applied before `UseAuthentication` and `UseAuthorization` in the middleware pipeline.

**Why `AllowAnyOrigin()` combined with `AllowCredentials()` causes a startup exception:**

The CORS specification forbids the wildcard origin when credentials are enabled. Allowing any origin with credentials would mean any website could make authenticated requests to the API on behalf of the user — a direct cross-site request forgery vector. ASP.NET Core enforces this at startup and throws rather than allowing a silent misconfiguration.

---

## Part 3 — Pagination

Pagination is added to `GET /api/v1/jobs` and `GET /api/v1/jobs/company/{companyId}`. The response is wrapped in a `PagedResponse<T>` envelope containing the data, current page, page size, total count, total pages, and booleans for next and previous page availability.

The implementation issues exactly two database queries per request — one count and one data fetch — both against the same `IQueryable` so they are always consistent. Results are ordered by `PostedAt` descending before pagination is applied, ensuring deterministic results. Both endpoints write `X-Total-Count` to the response headers and default to page 1 with 20 results when no parameters are provided.

---

## Part 4 — Filtering and Sorting

`GET /api/v1/jobs` accepts optional filters for location (partial match), employment type (exact match), minimum salary, maximum salary, and company ID. All filters are AND conditions — combining them narrows results. Omitting a filter returns all results.

Sorting is controlled by a `sort` parameter (postedAt, salaryMin, salaryMax, title) and a `dir` parameter (asc, desc). Filters are composed via `IQueryable` — no materialisation occurs before all conditions are applied.

---

## Part 5 — PATCH: Partial Updates

`PATCH /api/v1/jobs/{id}` accepts a partial update where every field is nullable. Only non-null fields are applied to the entity. Salary range validation only runs if either salary field is present in the request. The controller action is a single line.

`PATCH /api/v1/applications/{jobListingId}/{applicantId}/status` advances an application through the review workflow. Permitted transitions are Submitted → UnderReview, UnderReview → Shortlisted or Rejected, and Shortlisted → Offered or Rejected. Any illegal transition returns 400 Bad Request.

---

## Part 6 — API Versioning

URL segment versioning is implemented using `Asp.Versioning.Mvc`. All controllers use the route template `api/v{version:apiVersion}/[controller]` and are annotated with `[ApiVersion(1)]`. Every response includes the `api-supported-versions: 1.0` header. Requests without a version default to v1. Requests to v2 return 404.

**Introducing a v2 endpoint that renames `SalaryMin` to `MinimumSalary`:**

A new v2 response DTO is created with the renamed field. A v2 controller (or v2 action on the existing controller) is added alongside v1, which remains completely unchanged. Both versions run simultaneously for a minimum of 3–6 months. The `api-deprecated-versions: 1.0` header is added to v1 responses to signal to clients that migration is required. After the deprecation period, v1 is removed.

---

## Part 7 — ETags and Conditional Requests

ETags are added to `GET /api/v1/jobs/{id}` and `GET /api/v1/applications/{jobListingId}/{applicantId}`.

For a job listing the ETag is derived from the listing ID, the `PostedAt` timestamp ticks, and `SalaryMin`. For an application it is derived from both IDs and the current status. If the incoming `If-None-Match` header matches the computed ETag, the endpoint returns 304 Not Modified with no body. Otherwise the ETag is written to the response header and the full resource is returned.

**Why the current ETag can produce a stale 304:**

The job listing ETag uses `PostedAt` and `SalaryMin`. If a recruiter updates only the title or description, neither of which contributes to the ETag, the ETag value does not change. A client holding the old ETag receives 304 Not Modified even though the content has changed and displays stale data.

**What a stronger ETag would look like:**

A `LastModifiedAt` timestamp field added to both `JobListing` and `Application`, updated on every write regardless of which field changed. The ETag would be derived solely from this timestamp. Any change to any field updates `LastModifiedAt`, which changes the ETag and correctly invalidates the client cache.

---

## Part 8 — Rate Limiting

Four policies are registered:

| Policy | Algorithm | Limit | Endpoint |
|---|---|---|---|
| global | Fixed window | 200 req / 60 sec | All endpoints |
| search | Sliding window (6 segments) | 30 req / 60 sec | GET /api/v1/jobs/search |
| apply | Fixed window | 5 req / 60 min | POST /api/v1/applications |
| post-listing | Fixed window | 10 req / 60 min | POST /api/v1/jobs |

All policies reject immediately with no queue. Rejected requests receive 429 Too Many Requests with a `Retry-After` header and a plain text body stating the number of seconds until the window resets. `UseRateLimiter()` is placed after `UseCors` and before `UseAuthentication`.

**Why the `apply` policy uses a 60-minute window:**

A short window would block legitimate users applying to multiple jobs in quick succession. The fraud target is automated bots submitting hundreds of fake applications per hour, not humans. A 60-minute window limits a bot to 5 submissions per hour per IP — enough to stop fraud at scale without affecting real users.

**Why IP-based rate limiting is insufficient for authenticated requests:**

Attackers can rotate IP addresses through proxies and VPNs to bypass per-IP limits trivially. Multiple legitimate users behind a shared corporate or university IP would also be incorrectly grouped together and blocked collectively.

The correct partition key is the `sub` claim from the JWT — the authenticated user's unique ID. Rate limiting by user ID applies the limit to the identity regardless of IP address. An attacker would need to compromise or register thousands of distinct accounts to bypass it, which is a significantly higher barrier than rotating IPs. It also correctly isolates legitimate users from each other even when they share an IP.

**Why rate limiting reduces connection pool exhaustion:**

The global policy caps each instance at 200 requests per 60-second window. Requests that exceed this are rejected at the rate limiter before they reach the database layer — they never acquire a connection from the pool. This bounds the arrival rate of database-touching requests to a predictable ceiling, making it far less likely that all connections in the pool are held simultaneously under sustained load.
---

# Assignment 3.1  CareerHub API — Testing & CI/CD

---

## Part 1 — Written Decisions

### 1. Unit vs Integration Test Decisions

| Behaviour | Test Type | Reason |
|---|---|---|
| Salary validation in `CreateAsync` | Unit | Pure logic, no infrastructure needed. Integration can't tell *where* validation fired. |
| `[Authorize]` on `POST /api/v1/jobs` | Integration | Middleware enforces it. Unit tests bypass the HTTP pipeline entirely — 401 never fires. |
| `SalaryMax > SalaryMin` DB constraint | Repository (TestContainers) | Check constraints are DDL. In-memory provider ignores them silently. |
| `api-supported-versions` header | Integration | Header is emitted by versioning middleware. Unit tests return plain `ActionResult` with no headers. |
| `HasAppliedAsync` compiled query | Repository (TestContainers) | Compiled against the registered provider. In-memory plan is not a PostgreSQL plan — translation bugs are invisible. |

### 2. Why In-Memory EF Core Is Insufficient

**Check constraints** — `HasCheckConstraint` is stored in model metadata but never evaluated by the in-memory provider. Invalid rows save silently instead of throwing.

**`tsvector` computed column / full-text search** — `HasComputedColumnSql` is provider-specific SQL. The in-memory provider never evaluates it, so `SearchVector` doesn't exist and `EF.Functions.ToTsQuery` cannot be translated.

**`EF.CompileAsyncQuery`** — The compiled expression tree is translated once against the registered provider. An in-memory plan never produces SQL, so bugs in the PostgreSQL translation are completely invisible.

### 3. Test Isolation

A test is isolated when its result depends only on the code under test and the data it seeds itself — not on run order or shared state.

The shared-row problem: if Test A inserts 3 listings and Test B counts all listings expecting exactly 3, Test B fails whenever anything else runs first. The result is non-deterministic and impossible to diagnose.

TestContainers fixes this by running a real PostgreSQL container where each test seeds its own rows scoped to unique GUIDs. No test reads data it didn't insert, so order and parallelism don't matter.

### 4. CI Pipeline vs Local Testing

Local tests only prove your code passes on your machine today. CI proves the merged result passes on a clean machine on every push.

The specific failure CI catches: Developer A and Developer B both pass local tests on their own branches. When both branches merge into `main`, they conflict — incompatible changes to the same service, or clashing migrations. Neither developer's local run ever tested the merged state. CI runs against the merged commit and catches it before it lands.

---

## Part 6 — Branch Protection

**Steps to configure on `main`:**
1. GitHub → Settings → Branches → Add rule → enter `main`
2. Enable **Require status checks to pass** → search for and select **`Build and Test CareerHub API`**
3. Enable **Require branches to be up to date before merging**
4. Enable **Do not allow bypassing the above settings**
5. Save

**Why "up to date" matters:** Status checks alone prove CI passed at the time of last push. If another PR merges into `main` after your CI run, your branch is stale. This setting forces a re-run against the current `main` before merging, catching conflicts that status checks alone miss.

**Why "do not allow bypassing" matters:** Without it, admins can merge despite failing checks. A rule that can be bypassed is not enforced. This setting makes the protection unconditional for everyone.

---

## Part 7 — Coverage Analysis

### Test Pyramid

```
        /\
       /IT\       9 tests  — Integration (WebApplicationFactory)
      /----\
     / RT   \     10 tests — Repository (TestContainers)
    /--------\
   /    UT    \   10 tests — Unit (Service layer)
  /------------\
```

The distribution is intentionally balanced because each layer covers genuinely different behaviour. In a larger system the unit layer would dominate. The high repository count reflects CareerHub's reliance on PostgreSQL-specific features (constraints, full-text search, compiled queries) that cannot be verified at any other layer.

### What Unit Tests Don't Cover

**HTTP response shape and headers** — Unit tests call service methods and get C# objects back. They cannot assert on JSON serialisation, status codes, or headers like `ETag` and `X-Total-Count`. That requires an integration test.

**Database constraint enforcement independent of the service** — Mocks return whatever the test configures. If the service guard is removed, the unit test catches it — but the DB check constraint as a last line of defence can only be proven by inserting directly via `DbContext`, bypassing all service logic.

### What Integration Tests Can't Verify

WebApplicationFactory tests run the full pipeline but cannot distinguish between the service catching an error and the database catching it. If salary validation fires in the service, the test sees a 400 — but it cannot prove the check constraint itself would fire if the service guard were removed. That requires a repository test that bypasses the service entirely.

### What Repository Tests Can't Catch

Repository tests have no controller, middleware, or serialisation. A bug where the correct data is returned from the repository but the controller maps it to the wrong DTO field or returns the wrong status code is completely invisible. That belongs to the integration layer.

### Test Naming Convention

`MethodName_Scenario_ExpectedResult` — three examples from this suite:

- **`CreateAsync_WhenSalaryMaxLessThanSalaryMin_ThrowsArgumentException`** — which method, which condition, what happens. Named `Test1`, a failure tells you nothing.
- **`UpdateStatusAsync_WhenTransitionIsIllegal_ThrowsAndNeverCallsUpdate`** — two assertions are signalled in the name itself: exception thrown *and* repo never called.
- **`GetActiveListingsPagedAsync_ResultsAreOrderedByPostedAtDescending`** — the exact ordering expectation is the name. Without the convention you'd need to open the file to know what was being checked.

---

# CareerHub Frontend

A Next.js 15 + TypeScript + Tailwind frontend for CareerHub that allows users to browse and select job listings.

---

## Part 1 — Conceptual Questions

### 1. Lifting State Up
If `selectedId` is stored inside `JobList`, only `JobList` can access it. Since `Home` also needs the selected job to display the summary panel, the state must be moved to the nearest common ancestor, which is `Home`.

Data flow:
- User clicks `JobCard`
- `JobCard` calls `onSelect(id)`
- `Home` updates `selectedId`
- React re-renders
- Updated state flows down via props to `JobList` and summary panel

---

### 2. Re-render Cycle
Calling `setSelectedId` causes `Home` to re-render. Since `JobList` and `JobCard` are children of `Home`, they also re-render by default.

Re-rendering does **not** mean DOM updates. React compares old and new output and only updates DOM elements that changed.

React 19 improves performance using compiler-based memoization to skip unnecessary renders.

---

### 3. Union Types vs String
Using:

```ts
type EmploymentType = "FullTime" | "PartTime" | "Contract" | "Internship";
```

prevents invalid values.

Example 1:
Typing `"Fulltime"` causes a TypeScript error during development.

Example 2:
If the API adds `"Freelance"` and the frontend updates the union, TypeScript shows compile errors wherever the new type is not handled.

This catches bugs before runtime.

---

### 4. The && Rendering Trap
This:

```tsx
{job.applicantCount && <p>{job.applicantCount} applicants</p>}
```

renders `0` because `&&` returns the left value when falsy, and React renders `0` as text.

Correct solutions:

```tsx
{job.applicantCount > 0 && <p>...</p>}
```

or

```tsx
{job.applicantCount > 0 ? <p>...</p> : null}
```

Preferred:

```tsx
job.applicantCount > 0 && ...
```

because it is clear and readable.

---

## Why Static Data First
Using hardcoded data allows UI development without depending on API availability. Components become data-source agnostic, meaning they work the same whether data comes from static arrays or a backend API.

---

## Type Contract with Backend
`JobListing` in the frontend must match `JobListingResponse.cs` in the backend.

If the backend renames:

```cs
salaryMin
```

to

```cs
minimumSalary
```

without updating the frontend:
- TypeScript compilation fails
- Any code using `salaryMin` shows errors

This prevents runtime failures.

---

## Component Responsibility Table

| Component | Owns State | Receives via Props |
|-----------|------------|-------------------|
| Home | selectedId | None |
| JobList | None | jobs, selectedId, onSelect |
| JobCard | None | job, isSelected, onSelect |

---

## Build Gate
Project builds successfully with:
- 0 TypeScript errors
- 0 ESLint errors

Run:

```bash
npm run build
```

Paste final build output below:

```bash

> careerhub-frontend@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 5.3s
✓ Finished TypeScript in 4.4s    
✓ Collecting page data using 5 workers in 1544ms    
✓ Generating static pages using 5 workers (4/4) in 896ms
✓ Finalizing page optimization in 50ms    

Route (app)
┌ ○ /
└ ○ /_not-found


○  (Static)  prerendered as static content
```

---

## Tech Stack
- Next.js 15
- React
- TypeScript
- Tailwind CSS

---

## CareerHub Frontend — Assignment 1.2


## 1. The shadcn/ui ownership model

The shadcn/ui component model differs significantly from traditional component libraries such as MUI. In libraries like MUI, component source code is installed as a package dependency and stored inside the node_modules directory. These components are maintained externally, meaning that any library update may introduce breaking changes that affect all usages across the application. For example, if a new version renames a prop such as variant to intent, every component using the old prop name may fail immediately after upgrading.

shadcn/ui avoids this issue because components are generated directly into the project as source files. After installation, components such as badge.tsx exist inside the repository under src/components/ui. This means the component becomes part of the project codebase and is fully owned by the developer. Any updates released by shadcn/ui do not automatically affect the project. Instead, upgrades are manual and intentional, allowing developers to review changes before applying them. This approach provides greater stability and control over the UI layer.

## 2. Why the cn utility exists

The cn utility exists to simplify and improve conditional Tailwind CSS class composition. It combines the functionality of clsx, which conditionally joins class names, with tailwind-merge, which resolves conflicting Tailwind utility classes.

This is particularly useful when multiple conditional classes affect the same CSS property. For example, in the JobCard component, classes such as ring-1 and ring-2 both control ring width. If both classes are concatenated using plain string operations, both may remain in the final class list, creating ambiguity regarding which style should take precedence. Since Tailwind generates CSS rules separately, the final visual result may depend on stylesheet order rather than developer intention.

The tailwind-merge portion of cn prevents this issue by understanding Tailwind’s utility groups and removing earlier conflicting classes. As a result, only the intended class remains, making styling more predictable, readable, and maintainable.

## 3. The event handler versus useEffect argument

Although session storage operations can be placed inside event handlers such as click functions, this approach has important limitations. Writing persistence logic directly inside a click handler works only when the user actively interacts with the UI. It cannot handle scenarios where state must be restored automatically during component initialization.

The major limitation of the event-handler approach becomes evident during page refresh. When the browser reloads, no click event occurs. Consequently, no code inside the click handler executes, making it impossible to restore previously selected data. This negatively affects user experience because a user may lose context after refreshing or reopening the application.

The useEffect hook provides a better solution because it allows code to execute during component lifecycle events. One effect can restore the selected job when the page loads, while another can update session storage whenever the selected job changes. This separation ensures proper synchronization between React state and browser storage.

## 4. The Source of Truth for Dark Mode

The ThemeToggle component maintains an isDark state variable, but this state does not directly control the visual theme of the application. Its primary purpose is to determine what text or label should be displayed on the toggle button.

The true source of truth for dark mode is the presence or absence of the dark class on the root <html> element. Tailwind’s dark mode utilities operate by checking whether this class exists. Once the class is applied, all dark: styles across the application automatically become active.

This design has important implications. If the ThemeToggle component is unmounted and later remounted, its React state resets because local component state is not preserved across unmounts. However, the dark class on the <html> element remains unchanged because it exists outside the component tree. As a result, the entire application remains visually in dark mode even if the toggle component temporarily loses state. The component must therefore synchronize its state with the DOM or persisted storage whenever it mounts.

## shadcn/ui Setup

The shadcn/ui library was successfully installed and configured within the CareerHub frontend project. The configuration included enabling class-based dark mode support and adding the Badge component required for this assignment.

Three important files were generated during setup: the components.json configuration file at the project root, the src/lib/utils.ts file exporting the cn utility, and the src/components/ui/badge.tsx file containing the Badge component implementation.

Within badge.tsx, the function responsible for mapping badge variants to Tailwind classes is badgeVariants. This function uses the Class Variance Authority (CVA) library, which simplifies the process of defining reusable style variants for components.

## JobStatusBadge Component

A new reusable component named JobStatusBadge was created to centralize all badge-related rendering logic. This component serves two responsibilities: rendering employment type badges and rendering inactive job status badges.

Each employment type—Full-time, Part-time, Contract, and Internship—was assigned a unique color combination to ensure clear visual distinction. The mapping between employment type and color scheme is defined exclusively within JobStatusBadge, ensuring there is a single source of truth for badge styling.

The component also handles inactive listings. When isActive is false, an additional badge is rendered to communicate that the listing is no longer accepting applications. When the listing remains active, no status badge is rendered, and no hidden DOM element exists.

By extracting this logic into a dedicated component, the JobCard component becomes cleaner and easier to maintain.

## Tailwind Design Improvements

Significant styling improvements were made to both JobCard and JobList. All template literal-based class compositions were replaced with the cn utility to improve readability and prevent Tailwind conflicts.

Dark mode variants were added to every color-related class, including text, backgrounds, borders, shadows, and rings. This ensures complete visual consistency in both light and dark modes.

Special visual states were also introduced. Selected job cards now display a distinct highlighted appearance, making user selection immediately visible. Expired job cards were styled differently to visually communicate inactive status at the card level in addition to the status badge.

These changes collectively improved the professionalism and usability of the interface.

## Persisting Selected Jobs with useEffect

Two separate useEffect hooks were added to page.tsx to persist the selected job.

The first effect runs once when the component mounts. Its purpose is to read the stored job ID from session storage and restore the selected job if the ID still exists in the current dataset. Invalid or outdated IDs are ignored.

The second effect runs whenever selectedId changes. If a job is selected, the job ID is stored in session storage. If no job is selected, the storage key is removed to prevent stale data.

Keeping these effects separate is important because they serve different responsibilities. Merging them could cause the save logic to run before restoration is complete, potentially overwriting valid persisted data.

```md
## Effect Responsibilities

| Effect                      | Dependency Array      | Runs When                                             |
| --------------------------- | --------------------- | ----------------------------------------------------- |
| Restore selected job        | `[]`                  | Runs once after initial mount                         |
| Persist selected job        | `[selectedId]`        | Runs whenever the selected job changes                |
| If both effects were merged | Combined dependencies | Could overwrite stored state before restore completes |

```

## Dark Mode Toggle Implementation

A ThemeToggle component was created to manage theme switching across the application. This component toggles the dark class on document.documentElement, which activates or deactivates Tailwind’s dark mode styles.

On initial mount, the component checks local storage for a previously saved user preference. If no stored preference exists, the component falls back to the operating system theme preference using window.matchMedia.

Whenever the user changes the theme, the preference is saved to local storage. This ensures theme persistence across refreshes and browser sessions. The button also displays dynamic text based on the current theme and includes an accessible aria-label describing the action it performs.

Additionally, the application header, page background, summary panel, cards, and badges were updated to support both light and dark themes.

## Component Extraction Rationale

The decision to extract JobStatusBadge into a standalone component aligns with the Single Responsibility Principle. This principle states that each component should focus on one clearly defined responsibility.

If badge logic remained inside JobCard, changes to badge styling or employment type color mappings would require modifications within multiple conditional blocks. This increases complexity and maintenance effort.

With the extracted component, all badge-related styling and behavior exist in one place. If the employment type color scheme changes in the future, only the JobStatusBadge component requires modification. This significantly improves maintainability, reusability, and code clarity.

## Build Verification

The final application successfully passed all required validation checks. Running the build command produced zero TypeScript errors and zero ESLint errors, confirming that the project satisfies the assignment requirements.

npm run build:

> next build

▲ Next.js 16.2.9 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 7.0s
✓ Finished TypeScript in 3.2s    
✓ Collecting page data using 5 workers in 713ms    
✓ Generating static pages using 5 workers (4/4) in 814ms
✓ Finalizing page optimization in 25ms  


---

## Assignment 1.3: CareerHub Frontend -- Server State & TanStack Query

### 1. Server state vs client state

A manual `useEffect` + `useState` + `fetch` gives you none of the following for free:

- **Caching by key.** `useQuery` stores results keyed by `queryKey` so navigating away
  and back doesn't refetch. Without it: every remount fires a new request — the user
  sees a skeleton/spinner every single time they revisit the page, even seconds later.

- **Deduplication of in-flight requests.** If two components mount at once and both
  want "jobs", TanStack Query fires one network call and shares the result. With
  manual fetch, you get two simultaneous requests — wasted bandwidth, and a real risk
  of race conditions where the *slower* response overwrites the faster one's state.

- **Automatic retry on failure.** `useQuery` retries failed requests (configurable,
  default 3 attempts with backoff). Manual fetch fails once and stops — a momentary
  network blip becomes a hard error screen instead of self-healing.

- **Background refetching / stale-while-revalidate.** TanStack Query refetches on
  window refocus or reconnect while still showing the old data. Manual fetch-in-effect
  only fetches on mount — the user can sit on a stale page indefinitely, e.g. seeing a
  job that already closed, with no way to be brought back into sync without a hard
  page reload.

### 2. The queryKey contract

TanStack Query uses `queryKey` as the cache identity for a query — it's the lookup key
into the in-memory store, and it's what change-detection compares to decide whether to
refetch, share, or invalidate.

- **Failure mode A — shared key, should be separate:** Two components both use
  `["jobs"]`, but one wants jobs filtered by "Auckland" and the other "Wellington".
  Because they share a key, TanStack Query treats them as the *same* query — whichever
  fetch resolves last overwrites the cache, and **both components render the same
  (wrong) list**. Symptom: a filtered view randomly shows another filter's results.

- **Failure mode B — unique key, should be shared:** Two components both want the
  full unfiltered job list, but one uses `["jobs"]` and the other uses
  `["jobs", "list"]`. TanStack Query treats them as different queries — it fetches
  twice, caches twice, and a refetch/invalidation of one does not update the other.
  Symptom: two parts of the UI showing the same data go out of sync after a mutation,
  because only one cache entry got invalidated.

### 3. Why fetch does not throw on HTTP errors

The browser's `fetch` Promise only rejects on *network*-level failure (DNS failure, no
connection, CORS block, request aborted). A 404, 500, or any non-2xx HTTP response is
still a "successful" fetch from the Promise's point of view — the server responded, it
just responded with an error status. `res.ok` is `false` precisely in these in-band
HTTP error cases (4xx/5xx) even though `fetch` resolved normally.

If `res.ok` isn't checked and no error is thrown, `fetchJobs` will happily `.json()`
whatever error body the server sent (or throw a confusing JSON-parse error if the body
isn't JSON) and return it as if it were valid data. TanStack Query has no way to know
this was a failure — `isError` stays `false`, `isSuccess` becomes `true`, and the user
sees either a broken UI rendering garbage as if it were a job list, or a cryptic parse
crash instead of a clean "Try again" error panel.

### 4. Stale-while-revalidate

With default `staleTime: 0`, every refocus of the tab marks the query stale and
triggers a background refetch — but the **previously fetched data stays on screen
the whole time**. There's no skeleton, no flicker; the UI silently swaps in fresh data
when the response arrives (or stays as-is if the data is unchanged).

Contrast with `useEffect(() => { fetch... }, [])`: that effect only ever runs once, on
mount. Refocusing the tab does nothing — the user keeps looking at whatever was
fetched at initial mount, potentially stale for the entire session, with no built-in
mechanism to bring it back in sync.

---

### 1. What TanStack Query manages

`useQuery` automatically tracks all of the following. For each, I've described
what I would need to write by hand with `useState` + `useEffect` + `fetch` to
replicate it, and the edge cases that are easy to miss.

- **Loading state (`isPending`)**
  Manual equivalent: a `const [isLoading, setIsLoading] = useState(true)` state
  variable, set to `true` before the fetch call and `false` in a `finally` block.
  Edge case: if the component unmounts before the fetch resolves, calling
  `setIsLoading(false)` on an unmounted component logs a React warning — you'd
  need an `isMounted` ref or an `AbortController` to guard against it.

- **Error state (`isError`, `error`)**
  Manual equivalent: a `const [error, setError] = useState<Error | null>(null)`,
  set in a `catch` block, and reset to `null` at the start of every new fetch
  attempt (easy to forget — a stale error from a previous failed request can
  linger and display even after a successful retry if you don't clear it).

- **The actual data (`data`)**
  Manual equivalent: `const [jobs, setJobs] = useState<JobListing[] | undefined>(undefined)`,
  set inside `.then()`. Edge case: race conditions — if the user triggers two
  fetches in quick succession (e.g. by switching tabs and back), the *first*
  request might resolve *after* the second one, overwriting newer data with
  stale data. Solving this manually requires tracking a request ID or using
  `AbortController` to cancel the stale request.

- **Refetch on demand (`refetch`)**
  Manual equivalent: extracting the fetch logic into its own named function so
  it can be called again from a button's `onClick`, rather than only living
  inside a `useEffect`.

- **Caching by key**
  Manual equivalent: a module-level object or React Context acting as a cache,
  keyed by some identifier, checked before firing a new fetch. This is
  effectively reimplementing what `queryKey` already gives you — and you'd
  still need your own logic for cache invalidation and garbage collection.

- **Automatic retries**
  Manual equivalent: a retry loop with exponential backoff inside the `catch`
  block, with a max-attempts counter, written and tested from scratch.

- **Refetch on window refocus / network reconnect**
  Manual equivalent: a `window.addEventListener("focus", refetchFn)` (and a
  matching `online` event listener), remembering to clean both up in the
  effect's return function to avoid leaking listeners across re-renders.

- **Deduplication of simultaneous requests**
  Manual equivalent: a shared in-flight-promise cache so that two components
  requesting the same data at the same time share one network call instead of
  firing two — non-trivial to get right without a library.

### 2. The queryKey design decision

`["jobs"]` is the cache identity for "give me the full list of job listings."
TanStack Query stores the result of this query under that exact key, and any
component anywhere in the app that calls `useQuery({ queryKey: ["jobs"], ... })`
shares the same cached data, the same loading/error state, and the same
refetch behaviour — they're all subscribed to one underlying query.

If the page needed to show jobs filtered by location — for example "Auckland"
or "Wellington" separately — the key would need to become something like:

    ["jobs", { location: "Auckland" }]
    ["jobs", { location: "Wellington" }]

The filter value has to be part of the key because the key *is* what
distinguishes one cached result from another. If both filtered views used the
plain `["jobs"]` key, TanStack Query would treat "Auckland jobs" and
"Wellington jobs" as the *same* query — whichever one fetched most recently
would silently overwrite the other in the cache, and both views would end up
showing identical (and likely wrong) data. Including the filter value in the
key means each distinct filter gets its own cache entry, its own loading
state, and its own independent refetch — switching the location filter
becomes "ask for a different cache entry," not "refetch and hope for the best."

### 3. Skeleton design rationale

`JobCardSkeleton` mirrors `JobCard`'s exact structure — title row, badge,
company/location line, salary line, dashed-border footer, status badge area —
rather than showing a generic spinner, because the goal isn't just "tell the
user something is loading," it's "preserve the exact shape of the page while
real content arrives."

Layout shift is what happens when content appears on a page and pushes
everything below it into a new position, because the placeholder that was
there before it (or the absence of one) took up a different amount of space
than the real content does. A spinner in the middle of an empty page, for
example, occupies almost no vertical space — the instant six job cards load
in below it, every card, the open/closed counts in the sidebar, and the page
footer suddenly jump downward. That sudden jump is jarring, can make a user
click the wrong thing if they were mid-click, and is penalized by Core Web
Vitals (Cumulative Layout Shift) as a UX anti-pattern.

Because `JobCardSkeleton` occupies the same height, width, and grid position
that a real `JobCard` will occupy, the transition from loading to loaded is
visually seamless — nothing else on the page has to move when the real data
swaps in.

### 4. Gate

`npm run build` output:

> careerhub-frontend@0.1.0 build
> next build
▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local
  Creating an optimized production build ...
✓ Compiled successfully in 2.9s
✓ Finished TypeScript in 3.1s    
✓ Collecting page data using 6 workers in 768ms    
✓ Generating static pages using 6 workers (5/5) in 687ms
✓ Finalizing page optimization in 19ms    
Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /api/jobs
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

---
# Assignment 1.4 — Applications & Mutations

## Part 1 — Written Decisions

### 1. Why `@hookform/resolvers` is a separate package

React Hook Form and Zod are each independently popular and each used by people who don't use the other. If RHF depended directly on Zod, every RHF user would be forced to install Zod as a transitive dependency even if they use Yup, Joi, or no schema library at all — and the reverse would be true for Zod if it depended on RHF. Keeping them separate means each library stays focused on one job (RHF: form state and field registration; Zod: schema definition and parsing) and neither dictates the other's existence in a project. `@hookform/resolvers` exists purely as the adapter that translates between the two without either core library knowing the other exists.

At runtime, `zodResolver(schema)` returns a function matching RHF's `Resolver` signature: `(values, context, options) => ResolverResult`. RHF calls this function itself, passing in the current form values as `values`. Internally, `zodResolver` calls `schema.safeParse(values)` (or `safeParseAsync`, depending on the schema) on those values. If parsing succeeds, it returns `{ values: parsedData, errors: {} }` — note `values` here is the *parsed/coerced* output, not the raw input, which is exactly why `z.coerce.number()` actually converts the string from a number input into a real number by the time `onValid` receives it. If parsing fails, it returns `{ values: {}, errors: formattedErrors }`, where `formattedErrors` is shaped to match RHF's internal `FieldErrors` structure (each key mapped to a `{ type, message }` object) so `formState.errors.fieldName.message` works directly in JSX.

### 2. The number input problem

**Solution A** (`valueAsNumber: true` on `register`) intercepts the value at the DOM event level — when the input fires its `onChange`/`onBlur` event, RHF reads `event.target.valueAsNumber` (a built-in browser API for `<input type="number">`) instead of `event.target.value`, so the string-to-number conversion happens before RHF ever stores the value in its internal form state.

**Solution B** (`z.coerce.number()`) does nothing at the DOM layer — RHF stores the raw string exactly as the browser gave it. The conversion happens later, when `zodResolver` calls `schema.safeParse()` on submit; `z.coerce.number()` runs `Number(value)` internally before applying any further checks like `.min()` or `.int()`.

They produce an identical `z.infer<typeof schema>` type because `z.infer` (and `z.output`) describe the schema's **output** — what comes out the other end after all parsing and coercion — not its input. Both solutions guarantee a `number` arrives at that point, just via different mechanisms (DOM-level read vs. schema-level coercion), so the inferred output type is `number` either way.

I used **Solution B** in this assignment, deliberately, so that every validation rule for a field — type coercion included — lives in one place: the schema. With Solution A, you'd have coercion logic in `register()` calls scattered through the JSX and the remaining rules (`.int()`, `.min()`, `.max()`) in the schema — two places to check when debugging a number field. Solution B keeps `register("yearsOfExperience")` free of any options at all, matching this assignment's requirement that all validation logic live in the schema, not in `register`.

### 3. `mutate` vs `mutateAsync` — the `isSubmitting` timing bug

`handleSubmit(onValid)` awaits whatever promise `onValid` returns. If `onValid` calls `mutation.mutate(data)`, the problem is that `mutate` **does not return a promise at all** — it returns `void`. It fires the mutation (which internally starts its own async request) and returns immediately, synchronously, without waiting for anything. Since there is nothing to await, `onValid`'s returned promise resolves essentially instantly — and the moment it resolves, RHF flips `isSubmitting` back to `false`, even though the actual network request `mutate` kicked off is still pending in the background.

`mutateAsync(data)`, by contrast, returns the *actual promise* representing the mutation's lifecycle — it resolves only when the request settles (succeeds or throws). By writing `await mutation.mutateAsync(data)` inside `onValid`, `onValid`'s own returned promise is now chained to that same promise. `handleSubmit` is awaiting `onValid`, so it cannot resolve — and therefore cannot flip `isSubmitting` to `false` — until the mutation itself has actually finished. This is exactly why this assignment requires `mutateAsync` instead of `mutate` inside `onValid`.

### 4. `onSuccess` placement

**Option A** (in the `useMutation` options object) fires for *every* call to `mutate`/`mutateAsync` made through that mutation instance, no matter where in the codebase that call happens. **Option B** (passed per-call as `mutate(data, { onSuccess })`) fires only for that specific call site.

Concrete scenario where they differ: imagine a second button elsewhere in the app — say, a "Quick apply" shortcut on the job card itself — that also calls this same mutation's `mutate()` to submit an application, but from a different component, without going through `ApplicationForm`. If `onSuccess` is defined in Option A (on the mutation object), invalidating `["jobs"]` and resetting state would fire automatically for that second call site too, with zero extra code. If `onSuccess` were defined in Option B instead, that second call site would need its own `onSuccess` repeated, and forgetting to add it would mean the cache silently goes stale without a refetch.

I used **Option A** in this assignment to invalidate `["jobs"]` and call `reset()`. My reasoning isn't just "it works" — it's that cache invalidation and form reset are properties of *what a successful application submission means*, not properties of *this particular click handler*. There's only one call site in this assignment, so the practical difference doesn't show up yet, but defining the effect on the mutation itself means if a second submission entry point is ever added later, the cache-invalidation behavior is automatically correct without needing to remember to repeat it.

---

## README Updates

### 1. Schema design decisions

`z.string().optional()` alone produces a schema that accepts either a valid string or `undefined` — it does **not** accept an empty string `""` as a third valid option, and critically, an HTML `<input>` left blank never submits `undefined` to begin with; it always submits `""`. So `z.string().optional()` on its own would reject every blank phone/LinkedIn field with whatever validation message the field's own rules produce (e.g., the regex failing against `""`), because as far as Zod is concerned, `""` is a string that was actually provided and must satisfy the rest of the chain (the regex, the URL format, etc.).

`.or(z.literal(""))` widens the schema to a union: "a string matching the regex/URL rule, OR the exact literal empty string." This lets `""` pass parsing without needing to satisfy the regex. The chained `.transform((val) => (val === "" ? undefined : val))` then normalizes that passed-through `""` into `undefined` *after* validation succeeds, so the value the rest of the app sees is never an empty string sitting in a field that's supposed to be absent. The final inferred type is `string | undefined` for `phone` and `linkedInUrl`, matching the optional `phone?: string` and `linkedInUrl?: string` fields on `ApplicationRequest` exactly — and because `JSON.stringify` omits object keys whose value is `undefined`, the actual request body sent to the server omits these fields entirely when left blank, rather than sending `phone: ""`.

### 2. The cross-field refine

`.refine()`'s first argument is a callback that receives the **entire parsed object** as its single parameter — every field that passed its individual checks, all together, as one object — not a single field's value in isolation. This is the only way to express a rule that compares two different fields against each other, since a field-level rule attached to just `noticePeriodWeeks` (like `.min(1)`) has no access to `availableImmediately` at all; it only ever sees the one number it's attached to.

The `path` option tells Zod which field in the resulting error map this particular failure should be attached to. Without it, Zod attaches the error to the schema's root (an empty path, `[]`), which means `errors.noticePeriodWeeks` stays `undefined` even though the rule is conceptually about the notice period — the error message would exist somewhere in the form's overall error state, but there'd be no field-level hook to read it from, so the styled `<p>` under that specific input would never render it.

A field-level `.min(1)` on `noticePeriodWeeks` alone cannot express this constraint because it has no conditional awareness — `.min(1)` would reject `noticePeriodWeeks: 0` unconditionally, even for a candidate who checked "Available immediately" and therefore should be allowed to leave it at 0. The rule is fundamentally conditional on a *different* field's value, which only `.refine()` at the object level can see.

### 3. The two loading flags

A sequence where the two flags could diverge: if `onValid` called `mutation.mutate(data)` instead of `await mutation.mutateAsync(data)`, then the instant `mutate` returns (synchronously, before the network request even starts meaningfully progressing), `onValid`'s promise resolves, `handleSubmit` finishes, and `isSubmitting` drops to `false` — while `mutation.isPending` would still be `true`, because the request `mutate` kicked off is still in flight on the network. In that scenario, `isSubmitting` would be `false` for the remaining ~800ms while `mutation.isPending` stayed `true`, and the button would briefly re-enable mid-request if `isBusy` were just `isSubmitting` alone.

Since this implementation uses `mutateAsync` correctly — `await mutation.mutateAsync(data)` inside `onValid` — it is **not** possible for `mutation.isPending` to outlast `isSubmitting`. `isSubmitting` is tied to the same promise that `mutateAsync` returns; RHF cannot resolve `isSubmitting` to `false` until that exact promise settles, and `mutation.isPending` flips to `false` at the same moment that promise settles (success or error). So in this specific implementation, the two flags rise and fall in lockstep — `isBusy = isSubmitting || mutation.isPending` is technically redundant precision rather than a fix for divergence, but it's a deliberate safety net: if either flag were ever true for any reason (a future refactor, an edge case I haven't hit), the button would still correctly stay disabled.

### 4. Gate

`npm run build` output:

 careerhub-frontend@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 5.2s
✓ Finished TypeScript in 4.5s    
✓ Collecting page data using 7 workers in 1294ms    
✓ Generating static pages using 7 workers (6/6) in 1149ms
✓ Finalizing page optimization in 32ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/applications
└ ƒ /api/jobs


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

```
[PASTE YOUR ACTUAL BUILD OUTPUT HERE — run `npm run build` and paste the full
terminal output below this line, including the "Compiled successfully" line
and the route size table. Do not fabricate this — paste exactly what your
terminal shows.]
```
---

# Assignment 2.1 — CareerHub App Router

## Part 1 — Written Decisions

### 1. `cache: "no-store"` vs the default

`cache: "no-store"` operates on **Next.js's server-side fetch cache**, not the browser cache and not a CDN. When a Server Component calls `fetch()`, Next.js intercepts that call and layers its own caching on top of the native Node.js fetch. By default, Next.js may deduplicate or persist the response across requests so that two Server Components fetching the same URL in the same render pass (or even across separate requests in some configurations) share a single network call. `cache: "no-store"` tells Next.js to bypass this layer entirely — every request to the Server Component triggers a fresh outbound HTTP call to the origin.

You would deliberately use the **default cached behaviour** for data that is expensive to fetch and changes infrequently — for example, a list of product categories, a CMS navigation tree, or any content where serving a response that is a few minutes stale is acceptable. In that case, Next.js can serve the cached response without hitting the upstream API at all, which reduces latency and load on the backend.

The fundamental difference from **TanStack Query's cache** is *where the cache lives*. TanStack Query's cache lives in the browser, in JavaScript memory, inside the client. It is per-user, per-tab, and survives only as long as the React tree is mounted. `staleTime` controls how long before it refetches in the background; `refetchOnWindowFocus` re-validates whenever the tab regains focus. Next.js's fetch cache lives on the server — shared across all users and all requests — and has no concept of window focus or client-side staleness. It is a server-to-origin cache, not a client-to-server cache. The two caches solve different problems: TanStack Query reduces redundant requests from the same client; Next.js fetch caching reduces redundant requests from all clients to the same upstream.

---

### 2. The `"use client"` boundary and what crosses it

`"use client"` marks a **module boundary**. When Next.js encounters this directive at the top of a file, it designates that file and everything imported from it (transitively) as a Client Component subtree. It is not a per-component flag — it is a file-level declaration that says "everything from this module down runs in the browser."

The **Server Component** (`/jobs/[id]/page.tsx`) runs exclusively on the server. It fetches the job data, evaluates the JSX tree, and produces an HTML string plus a serialised React Server Component (RSC) payload. That payload is streamed to the browser as part of the initial response. The HTML arrives immediately — the job title, company name, description, closing date, and the "Applications closed" / form slot are all visible before any JavaScript executes.

The **Client Component** (`ApplicationForm`) is not executed on the server — instead, its JavaScript bundle is sent to the browser as a separate chunk. The browser receives the pre-rendered HTML slot where `ApplicationForm` will live, then downloads the JS, hydrates the component, and wires up its `useState`, `react-hook-form`, Zod validation, and `submitApplication` mutation. Only after hydration does the form become interactive.

So for a request to `/jobs/some-id`, the browser receives: **HTML** (job details, heading, back link, description — all from the Server Component) in the initial response, and **JavaScript** (the `ApplicationForm` bundle) as a deferred chunk that hydrates the form section. The two arrive independently; the page is readable before the JS loads.

---

### 3. Why `params.id` is always a string

URL segments are fundamentally text. The HTTP protocol transmits paths as byte sequences — `/jobs/42` and `/jobs/a1b2c3d4-e5f6-...` are both just strings of characters to the router. Next.js has no mechanism to inspect a segment at build time and decide its type: it cannot know whether `42` is an integer ID, a zero-padded code, or a string that happens to look numeric. Any inference would be ambiguous and fragile. So Next.js types all `params` values as `string` — always, unconditionally — because that is what URL segments actually are before any application-level parsing.

In this assignment, the real `.NET` API's `GetJobById` accepts a **GUID string** (e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`). GUIDs are already strings; `params.id` is already a string. **No conversion is needed.** `params.id` can be passed directly to `fetchJobById(id)` and straight into the fetch URL as `${baseUrl}/api/v1/jobs/${id}`. Parsing or casting would only be necessary if the API accepted an integer and the segment looked like `"42"` — in which case you would call `parseInt(params.id, 10)` before passing it. That is not the case here.

---

### 4. What "layout persists" actually means

"Does not re-render" means the following precisely: when you navigate from `/dashboard/listings` to another `/dashboard/*` route, React **does not call the `DashboardLayout` component function again**. The DOM nodes that make up the sidebar are **not destroyed and recreated** — they remain in the document, untouched. Any `useState` inside the layout (if it had any) would **not be reset** — the state value would survive the navigation exactly as it was.

This happens because Next.js wraps the layout's `children` slot in a React subtree that can be swapped independently. React reconciles the child tree against the new page, but sees that the parent layout component is the same — so it skips re-rendering it entirely, the same way React skips re-rendering any component whose props and identity have not changed.

To keep **dynamic data in the layout up to date without making it a Client Component**, one concrete approach is to use **route-level revalidation**. You can add `export const revalidate = 60` to the layout (or any page under it), which tells Next.js to re-run the Server Component and re-fetch any data every 60 seconds via Incremental Static Regeneration. Another approach is to **move the dynamic data fetch into the child page** rather than the layout itself — if the count only matters on the listings page, fetch it there and pass it up via a shared state mechanism is not needed; the page re-fetches on every navigation. A third approach is to wrap only the count in a separate async Server Component with its own fetch and `no-store`, so that component re-executes on each request while the surrounding layout structure stays static.

---

## Part 2 — Single Job Route Handler

See `src/app/api/jobs/[id]/route.ts`.

**Proof:**
- `GET /api/jobs/1` → 200, full job object
- `GET /api/jobs/does-not-exist` → 404, `{ title, detail, status }`
- `POST /api/jobs/1` → 405

---

## Part 3 — The /jobs Route

`JobLinkCard` is a Server Component with no `"use client"` directive. It wraps its content in a Next.js `<Link>` which renders as a plain `<a>` on the server and is upgraded to client-side navigation on hydration.

`/jobs/page.tsx` is an async Server Component that calls `fetchJobs()` (which passes `cache: "no-store"` to fetch). The data arrives in the HTML — no browser-side API call appears in DevTools' Network tab.

`/jobs/loading.tsx` exports a skeleton grid that mirrors the real card layout. Next.js automatically wraps the page in a Suspense boundary and shows the skeleton while the server is still awaiting the fetch.

---

## Part 4 — The /jobs/[id] Route

### 1. The composition pattern in /jobs/[id]

The sequence is: (1) The **Server Component** (`page.tsx`) runs on the server when a request arrives for `/jobs/[id]`. It calls `fetchJobById(id)`, awaits the response from the `.NET` API, and evaluates the JSX — producing HTML for the heading, back link, salary block, description, and closing date. It also determines whether the job is active and either renders the `<ApplicationForm>` slot or the "Applications are closed" message. (2) Next.js serialises this as an HTML string plus an RSC payload and streams it to the browser. (3) The **Client Component** (`ApplicationForm`) does **not** run on the server — its JavaScript is bundled and sent to the browser as a separate chunk. (4) The browser renders the HTML immediately (the job is readable with no JS), then downloads and executes the `ApplicationForm` bundle, hydrating the form so it becomes interactive.

If a user **disables JavaScript**, they see the complete job details — title, company, salary, description, closing date — because all of that was rendered server-side and delivered as plain HTML. They do **not** see `ApplicationForm`, because it is a Client Component that requires JavaScript to hydrate. The "Applications are closed" message (for closed jobs) would still appear, since it is rendered by the Server Component and arrives as HTML. This is progressive enhancement: the readable content works without JS; the interactive form requires it.

### 2. Why JobLinkCard has no `"use client"`

The `"use client"` directive marks a **module boundary**, not a component. When `JobLinkCard` imports `<Link>` from `next/link`, it is importing a component that Next.js ships in two forms — a server-safe form that renders a plain `<a>` tag, and a client form that attaches the router. Next.js resolves which form to use based on the **rendering context of the importer**, not the internals of `<Link>` itself. Because `JobLinkCard` has no `"use client"` directive, it runs as a Server Component, and Next.js gives it the server-safe version of `<Link>` — which renders `<a href="/jobs/some-id">` in the HTML output. The fact that `<Link>` internally uses `useRouter` in its client form is irrelevant: that hook only runs when `<Link>` is rendered in a Client Component context, which it is not here.

`JobCard`, by contrast, **does** need `"use client"` because it has an `onClick` handler. Event handlers (`onClick`, `onChange`, etc.) cannot exist on the server — there is no browser, no DOM event loop, and no way to attach a callback to an element that exists only as an HTML string. The moment a component has any event handler, it must be a Client Component. The visual similarity between `JobCard` and `JobLinkCard` is superficial; the fundamental difference is that one reacts to user input (click handler → state update) and the other is pure output (a link that navigates).

### 3. loading.tsx vs a manual loading state

With `useQuery`, the **component renders first** — on the browser, after the JS bundle loads and React hydrates — with `isPending: true`. The component function is called, returns the skeleton JSX, and React mounts it. Then the query runs, the data arrives, and the component re-renders with `isPending: false` and real data. There is a gap between the initial page load and when the skeleton even appears, because the JS must download and execute first.

With `loading.tsx`, Next.js automatically wraps the page in a **React Suspense boundary**. The skeleton defined in `loading.tsx` is the Suspense fallback. When the server starts rendering `/jobs/page.tsx` and hits the `await fetchJobs()` call, the Suspense boundary activates — Next.js **streams the skeleton HTML to the browser immediately**, before the fetch completes. The browser renders the skeleton from raw HTML, with no JavaScript required. When the server finishes the fetch and renders the real page content, it streams the replacement HTML to the browser, which swaps the skeleton out. The skeleton appears faster (it is server-streamed HTML, not client-rendered JS) and appears before any JavaScript executes on the client.

### 4. Gate

```
npm run build
```
▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 3.5s
✓ Finished TypeScript in 5.5s    
✓ Collecting page data using 7 workers in 1567ms    
✓ Generating static pages using 7 workers (8/8) in 318ms
✓ Finalizing page optimization in 22ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/applications
├ ƒ /api/jobs
├ ƒ /api/jobs/[id]
├ ƒ /dashboard/listings
├ ƒ /jobs
└ ƒ /jobs/[id]


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


---

## Stretch Goals

### Stretch A — Active link highlighting

`NavLinks.tsx` is a Client Component (`"use client"`) that calls `usePathname()` and applies a highlight class to whichever nav link matches the current path. It is imported into `layout.tsx` in place of the inline links. `layout.tsx` remains a Server Component — only `NavLinks` needs to be a Client Component, because `usePathname` is a hook and hooks require a client context.

### Stretch B — error.tsx for the jobs detail route

`error.tsx` is always a Client Component (required by Next.js — it receives `error` and `reset` as props, which requires browser-side rendering). It renders `error.message` and a "Try again" button that calls `reset()` to retry the failed render.
---
# CareerHub Frontend — Assignment 2.2  CareerHub Advanced Data Fetching Cache Smarter, Stream Earlier, Mutate on the Server

## Part 1 — Written Decisions

### 1. Choosing a cache strategy per data source

CareerHub has three data sources, each with a different change frequency and therefore a different caching strategy.

**Jobs list (`/api/v1/jobs`)** uses `next: { tags: ["jobs"] }`. Job listings only change when an employer publishes or closes a listing — both are explicit employer actions. Between those events the data is stable, so serving from the Next.js server cache is correct. The cache is invalidated on demand via `revalidatePath` inside the `closeJobListing` Server Action, so candidates always see the current state after a change without paying the cost of a fresh fetch on every request.

**Single job detail (`/api/v1/jobs/[id]`)** also uses `next: { tags: ["jobs"] }` for the same reason. A job's details only change when an employer edits or closes it. The same `revalidatePath` call that clears the list also clears the detail pages, so both surfaces stay consistent after a mutation.

**Application statistics (`/api/applications/stats`)** uses `cache: "no-store"`. Candidates submit applications at any time — there is no employer-side action that cleanly signals "stats have changed." There is no event to hook `revalidatePath` onto, so always-fresh is the only correct strategy. Serving stale stats to the employer dashboard would undercount applications and erode trust in the data.

The key distinction is whether a change is triggered by an explicit, trackable action (jobs — yes, via close/publish) or by continuous background activity (applications — no, submitted at any time by anyone). Tags work when you can identify the moment of change. When you cannot, `no-store` is correct.

Both `/jobs/page.tsx` and `/dashboard/listings/page.tsx` use the same `"jobs"` tag, and that is intentional rather than a problem. The tag is not scoped to a file or a route — it is a label attached to a cached response on the Next.js server. When `revalidatePath` fires after a close action, it clears every cached response bearing that label, regardless of which route produced it. The employer's action becoming visible on both the dashboard and the candidate-facing jobs page simultaneously is exactly the required behaviour.

### 2. Why revalidatePath works across routes

The Next.js server cache lives on the Next.js server process — not in the browser, not in a CDN. It is an in-process, in-memory (and optionally disk-backed) store that sits between the application code and the upstream API. Every `fetch` call tagged with `next: { tags: [...] }` or cached by default writes its response into this store keyed by URL and tag.

Because the cache is on the server, `revalidatePath` called inside a Server Action in `src/app/actions/closeJob.ts` can reach cached responses produced by fetches in `src/app/jobs/page.tsx` and `src/app/dashboard/listings/page.tsx` — they all share the same server process and therefore the same cache store. The directory a file lives in is irrelevant; what matters is that the cache is global to the server, not scoped per route or per file.

When `revalidatePath("/jobs", "page")` fires, it marks the cached responses for that path as stale. The very next request to `/jobs` finds no valid cache entry and fetches fresh data from the `.NET` API. That response is then cached again until the next mutation. So the first request after revalidation is a cache miss — it goes to the network. Every subsequent request until the next mutation is a cache hit.

### 3. What Promise.all failure means for the dashboard

With the current implementation, if `getApplicationStats()` throws — for example because the stats endpoint returns 500 — the entire `Promise.all` rejects and the dashboard page throws an error. The user sees Next.js's error boundary (a full-page error in development, or the nearest `error.tsx` boundary in production). Neither the jobs table nor the stats card renders. The page is entirely broken even though the jobs data arrived successfully.

Two approaches that would show partial data instead:

**Option A — try/catch per fetch, fallback value.** Wrap `getApplicationStats()` in a try/catch inside the component and return an empty array on failure. The jobs table renders with all counts showing 0, and the stats card shows 0. The user sees a degraded but functional page.

**Option B — independent Suspense boundaries with per-component error boundaries.** Wrap `<ApplicationsSummary />` in its own `<ErrorBoundary>` that renders a "Stats unavailable" fallback. The jobs table is completely unaffected — it fetches independently and renders normally. Only the stats card shows the fallback.

For a production employer dashboard, Option B is the right choice. It preserves the most important surface (the jobs table with close actions) even when a secondary data source fails. An employer can still manage listings when stats are temporarily unavailable. Option A is simpler but silently shows wrong data (all zeros) without telling the employer something went wrong.

### 4. The two-boundary vs one-boundary trade-off

With two independent Suspense boundaries:

- **T=0ms:** The server has sent the initial HTML. The page heading "All Listings" is visible. Both skeleton placeholders are visible — one where the stats card will appear, one where the table will appear.
- **T=120ms:** `ApplicationsSummary` resolves. Its skeleton is replaced by the real stats card showing "Total Applications: 17". The table skeleton is still visible.
- **T=450ms:** `ListingsTable` resolves. Its skeleton is replaced by the full jobs table with all columns and Close buttons.
- **T=451ms:** The page is complete. Both components are showing real data.

With a single `<Suspense>` boundary wrapping both components, at T=120ms the user still sees the skeleton for the entire boundary — because Suspense waits for the slowest child before revealing anything inside it. `ApplicationsSummary` has already resolved but its result is hidden, waiting for `ListingsTable` to finish. The user sees nothing new at T=120ms. Both components appear simultaneously at T=450ms.

Two boundaries are better here because the two data sources are genuinely independent — stats and listings have no shared dependency, and showing one earlier costs nothing. A single boundary would be the right call if the two components shared data that had to arrive together before either could render meaningfully — for example, if the stats card needed to know the total job count from the listings fetch to compute a "applications per listing" ratio. In that case, showing the stats card without the listings data would be incomplete or misleading, and a single boundary that waits for both is correct.

---

## Part 2 — New Route Handlers

### Stats endpoint — `GET /api/applications/stats`

Created at `src/app/api/applications/stats/route.ts`. Returns a JSON array of `{ jobId, applicationCount }` objects, one per seeded job. Job IDs match the seeded GUIDs in `SeedData.cs`. `POST`, `PUT`, `PATCH`, and `DELETE` to this route return 405.

### Job status update — `PATCH /api/jobs/[id]`

Extended `src/app/api/jobs/[id]/route.ts` with a `PATCH` handler. Reads `id` from params and `status` from the request body. Returns 404 if the job does not exist, 400 if `status` is missing, and 200 with the updated job on success. The `MOCK_JOBS` array is module-level and mutable — updates persist for the duration of the server process.

---

## Part 3 — Cache Strategies with Tags

Changed `fetchJobs()` and `fetchJobById()` in `src/lib/api.ts` from `cache: "no-store"` to `next: { tags: ["jobs"] }`. Both the candidate-facing jobs fetch and the employer dashboard jobs fetch use the same tag so that a single `revalidatePath` call in the close action clears both surfaces simultaneously.

Application stats fetches retain `cache: "no-store"` because applications are submitted continuously by candidates and there is no employer action that can trigger their invalidation.

---

## Part 4 — Parallel Fetching on the Dashboard

`src/app/dashboard/listings/page.tsx` previously awaited only `fetchJobs()`. Updated to call `Promise.all([fetchJobs(), getApplicationStats()])` so both requests fire simultaneously. Added an **Applications** column to the table that joins each job row with its `applicationCount` from the stats result by matching `jobId`. Jobs with no matching stat entry display 0.

---

## Part 5 — Streaming with Two Suspense Boundaries

Extracted two async Server Components:

**`src/components/ApplicationsSummary.tsx`** — fetches stats internally, computes the total application count, renders a stat card. Includes `ApplicationsSummarySkeleton` as its Suspense fallback.

**`src/components/ListingsTable.tsx`** — fetches both jobs and stats internally via `Promise.all`, joins them, renders the full table with all seven columns including the Close action. Includes `ListingsTableSkeleton` (five animate-pulse rows) as its Suspense fallback.

`src/app/dashboard/listings/page.tsx` was rewritten to perform no awaits itself. It renders the page heading immediately and wraps each component in its own independent `<Suspense>` boundary. `ApplicationsSummary` resolves first (one fetch, small payload); `ListingsTable` resolves second (two fetches, join). The two replacements are visible as distinct events.

---

## Part 6 — Server Action and useActionState

**`src/app/actions/closeJob.ts`** — Server Action that reads `jobId` and `jobTitle` from `formData`, forwards the employer JWT from the session cookie in the `Authorization` header, sends `DELETE /api/v1/jobs/{id}` to the `.NET` API, calls `revalidatePath` on both `/jobs` and `/dashboard/listings` on success, and returns a discriminated union state (`success | error | null`).

**`src/components/CloseJobButton.tsx`** — Client Component that uses `useActionState(closeJobListing, null)`. Renders nothing for already-closed jobs. Shows "Closing…" and disables the button while the action is pending. Replaces the button with "Closed ✓" on success. Shows the error message below the button on failure, keeping the button active for retry.

The `revalidatePath` call runs on the server inside the action before the response is sent back to the browser. The next request to `/jobs` or `/dashboard/listings` fetches fresh data from the `.NET` API instead of serving a stale cached response. This is how a mutation on the employer dashboard propagates to the candidate-facing jobs page — both paths are cleared by the same action.

---

## Tracing the close action end to end

1. **Browser:** The employer clicks "Close" on a job row. `CloseJobButton` is a Client Component using `useActionState` — clicking submit sets `isPending` to true, disabling the button and showing "Closing…".

2. **Browser → Server:** The browser sends a `POST` request to the Next.js server with the form data (jobId, jobTitle) encoded in the request body. This is the Server Action invocation — it looks like a fetch from the browser but targets the Next.js server, not the `.NET` API directly.

3. **Server — `closeJobListing`:** The Server Action runs on the Next.js server. It reads `jobId` from `formData`, retrieves the employer JWT from the httpOnly session cookie using `getToken("Employer")`, and sends `DELETE /api/v1/jobs/{jobId}` to the `.NET` API with the token in the `Authorization` header.

4. **Server — `.NET` API:** The `.NET` `JobsController` validates the JWT, confirms the `Employer` role, calls `CloseListingAsync`, marks the job as inactive in Postgres, and returns `204 No Content`.

5. **Server — revalidation:** Back in the Server Action, `revalidatePath("/jobs", "page")` and `revalidatePath("/dashboard/listings", "page")` fire. These mark the cached responses for both paths as stale in the Next.js server cache.

6. **Server → Browser:** The Server Action returns `{ status: "success", jobTitle }`. `useActionState` receives the new state, `isPending` becomes false, and `CloseJobButton` renders "Closed ✓".

7. **Candidate's next page load:** When a candidate navigates to `/jobs`, Next.js finds no valid cache entry (it was cleared in step 5) and fetches fresh data from the `.NET` API. The closed job now has `isActive: false` and renders with a "Closed" badge. The `ApplicationForm` is replaced by the "Applications are closed" message on the detail page.

---

## Why two Suspense boundaries are better than one

With two boundaries, at T=120ms the employer sees the stats card already populated with the total application count while the table skeleton is still animating. Useful information arrives as soon as it is ready.

With one boundary wrapping both components, at T=120ms the employer still sees the skeleton for the entire boundary. `ApplicationsSummary` has resolved but its result is hidden — Suspense holds everything until the slowest child (`ListingsTable` at T=450ms) finishes. The employer waits an extra 330ms to see data that was ready much earlier.

A single boundary would be the right call if the two components were not truly independent. For example, if the stats card needed to display "X applications across Y active listings" — where Y comes from the jobs fetch inside `ListingsTable` — then showing the stats card before the jobs data arrives would require a prop dependency between the two components, collapsing them into one fetch boundary. In that case a single Suspense wrapping both would be correct.

---

## The self-contained component trade-off

`ListingsTable` fetches its own jobs and stats internally with `Promise.all`. This makes it self-contained — it can be placed anywhere on any page and will always have its own data. No parent component needs to know what data it requires or coordinate fetches on its behalf.

The cost appears if `ListingsTable` is rendered in multiple places simultaneously. If it appears in three places on the same page, three independent pairs of fetches fire — six total requests where two would suffice. Next.js deduplicates identical `fetch` calls within a single render pass when using the same cache options, which mitigates this for the jobs fetch (tagged), but the stats fetch (`no-store`) is not deduplicated and fires once per component instance.

The prop-driven alternative — a pure component that accepts `jobs` and `stats` as props, with the parent fetching both — solves the duplication problem: one fetch, shared across however many instances consume the data. The cost is Suspense compatibility. If the parent awaits both fetches before rendering, neither component can stream independently — the parent blocks until both resolve and hands data to both children at once. The streaming benefit of Part 5 is lost.

If the component were reused in five places, the prop-driven approach is the right choice. Five instances each firing two fetches is ten requests per page load; a single parent fetch shared across five pure child components is two. The streaming loss is acceptable when the alternative is a fivefold request multiplication. The self-contained design is best when a component appears once or twice and streaming latency matters more than request count.

---

## Build Output

careerhub-frontend@0.1.0 build

next build

▲ Next.js 16.2.9 (Turbopack)

Environments: .env.local

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy

Creating an optimized production build ...

✓ Compiled successfully in 6.3s

✓ Finished TypeScript in 6.2s

✓ Collecting page data using 7 workers in 1563ms

✓ Generating static pages using 7 workers (12/12) in 721ms

✓ Finalizing page optimization in 32ms

Route (app)

┌ ƒ /

├ ƒ /_not-found

├ ƒ /api/applications

├ ƒ /api/applications/stats

├ ƒ /api/jobs

├ ƒ /api/jobs/[id]

├ ƒ /dashboard/listings

├ ƒ /jobs

├ ƒ /jobs/[id]

├ ƒ /login/applicant

├ ƒ /login/applicant/register

└ ƒ /login/employer

ƒ Proxy (Middleware)

ƒ  (Dynamic)  server-rendered on demand

Zero TypeScript errors. Zero ESLint errors.

---
# CareerHub — Assignment 2.3: Authentication & Smart State

## Part 1 — Written Decisions

### Question 1 — Mapping CareerHub roles to route protection rules

| Route | Who can access | Wrong role / unauthenticated → | Handled in |
|---|---|---|---|
| `/jobs` | Everyone (public) | N/A | Nothing |
| `/jobs/[id]` | Everyone (public) | N/A | Nothing |
| `/dashboard` | `employer` only | Candidate → `/jobs`; unauthenticated → `/login` | Middleware |
| `/dashboard/listings` | `employer` only | Same as above | Middleware |
| `/login` | Unauthenticated only | Employer → `/dashboard/listings`; Candidate → `/jobs` | Middleware |

**Why redirecting an unauthenticated user to `/login` and redirecting a candidate away from `/dashboard` are different problems:**

Redirecting an unauthenticated user is about *presence* of a session — there is no session at all, so we send them to go get one. Redirecting a candidate away from `/dashboard` is about *role* — they already have a valid session, it's just the wrong one for this route. The first is a missing-auth problem; the second is an insufficient-privilege problem. Both are still handled in middleware because both can be determined from the JWT cookie alone, before any page component renders — no flash of protected content, no wasted server render, no client-side redirect flicker.

### Question 2 — The session object design

**What goes on the session:** `id`, `name`, `role`. That's it.

**What is deliberately left off:** password (obviously), any backend token, email, or anything not needed to make a routing or UI decision. The spec note for Part 2 is explicit about this — *"There is no `backendToken` here — do not add fields you do not use."*

**Cost of putting too much on the session:** The session is encoded into a JWT and sent as a cookie with every single request to the app. Anything you add to it is dead weight on every request, not just the ones that need it. The JWT payload is also only base64-encoded by default, not encrypted — so anything beyond what's needed for routing/UI is needless client-side exposure.

**What breaks if `role` is on the JWT but not mapped to session:** Every call to `auth()` in a Server Component returns a session where `session.user.role` is `undefined`. Without correct module augmentation, TypeScript won't catch this at compile time — it'll just silently break every role-gated UI decision (nav links, the dashboard guard, the apply-button logic) at runtime, with no error, just the wrong branch always firing.

**The three-step relay:**

```
authorize()       → returns { id, name, role }
      ↓
jwt callback      → token.role = user.role   (user is only present on the initial sign-in call)
      ↓
session callback  → session.user.role = token.role
      ↓
auth() / useSession() → session.user.role is available everywhere
```

### Question 3 — Choosing the state tool for job filters

| Filter | URL param | Tool | Justification |
|---|---|---|---|
| Keyword search | `q` | nuqs | Survives refresh, shareable, back/forward works |
| Location | `location` | nuqs | Same reasoning |
| Status | `status` | nuqs | Same reasoning; also makes the default (`all`) explicit and visible in the URL |

**What nuqs buys that `useState` cannot:** With `useState`, refreshing the page loses the filter entirely — it's in-memory only, gone the instant the component unmounts. With `nuqs`, the filter value lives in the URL itself, so refresh preserves it, the browser's back/forward buttons restore previous filter states, and a shared URL gives the recipient the *exact* same filtered view without any extra plumbing. `useState` is ephemeral and local; `nuqs` makes filter state a durable, shareable, first-class part of the URL — which is exactly what a "filtered search" conceptually is.

**Does the employer dashboard need to know about these filters?** No. Job filters (`q`, `location`, `status`) are a candidate-facing concern that lives entirely on `/jobs`. The employer dashboard has its own, separate piece of state — the view/closed-jobs preference — covered in Part 7, and the two are intentionally decoupled.

### Question 4 — What the nav bar knows

**Why `await auth()` in `layout.tsx` is not a performance problem, even though the nav renders on every page load:** `auth()` reads the session by decoding the JWT cookie that came with the request — it is a local, synchronous-cost decode operation, not a network round-trip to a database. Auth.js also wraps this in React's `cache()`, so within a single request, every component that calls `auth()` (the layout, a page, a nested Server Component) shares one deduplicated read rather than re-decoding the cookie multiple times. The cost is microseconds, not a database query.

**Session in a deeply nested Client Component:** You don't drill the session down as props through every layer. Instead, `SessionProvider` (from `next-auth/react`) wraps the app in `providers.tsx`, seeded with the session read on the server. Any nested Client Component, no matter how deep, can then call `useSession()` directly and read from that context — no extra network request, because the provider was already hydrated with the server-fetched session.

**`useSession()` vs `auth()`, and when to reach for each:** `auth()` is for the server — Server Components, Server Actions, Route Handlers, middleware — and reads the session synchronously from the request's cookie. `useSession()` is for the client — it's a React hook that reads from the `SessionProvider` context. The rule of thumb: if the code runs on the server, use `auth()`; if it runs in a Client Component (anything with `"use client"` that needs to react to session state, e.g. conditionally rendering a button), use `useSession()`.

---

## Middleware vs Page-Level Guards

**One rule from Part 4 that lives in middleware:** The `/dashboard` (and `/dashboard/listings`) protection — requiring `role === "employer"`, redirecting unauthenticated users to `/login` and candidates to `/jobs`. This belongs in middleware because it's a *route-level* access decision that can be fully resolved from the JWT cookie alone, before any data fetching or rendering happens. Putting it in the page component would mean the page (and any data it fetches) starts executing before the redirect fires — wasted work, and a possible flash of protected UI before the redirect completes client-side.

**One rule from Part 5 that lives in the page:** The apply-button logic on `/jobs/[id]` — showing "Employers cannot apply," the sign-in prompt, or the form, depending on role. This *cannot* live in middleware because `/jobs/[id]` is intentionally public — employers and signed-out users are allowed to view the page itself, they just see a different fragment of UI on it. Middleware can only allow or block a route wholesale; it has no concept of "render this page, but swap out this one component." That decision requires the actual session value at render time, which is why it's resolved in the page component via `await auth()` alongside the job fetch (`Promise.all`).

**The general principle:** If the decision is "should this request reach this route at all" — middleware. If the decision is "what should this specific page show, given who's asking" — the page component. Middleware operates on routes; pages operate on content. A route that's entirely role-restricted belongs in middleware; a public route with role-dependent fragments belongs in the page.

---

## Why URL State for Job Filters

`nuqs` was chosen over `useState` or Zustand for all three job filters (`q`, `location`, `status`) because filtering on `/jobs` is fundamentally a *navigable, shareable view* of the data, not transient UI state.

- **Sharing filtered views:** A URL like `/jobs?q=engineer&status=open` fully describes the view. Anyone who opens that link sees exactly the same filtered list — no extra steps, no "now go apply these filters yourself." `useState` or Zustand store this only in memory; the URL doesn't change, so a copied link loses the filter entirely.
- **Browser back/forward behaviour:** Because each filter change updates the URL (after the debounce), the browser's history stack naturally includes each filtered state. Pressing back restores the previous filter combination, the way users already expect search/filter UIs to behave. With `useState`, back/forward has no effect on the filters at all — the component state is untouched by browser navigation.
- **Bookmarking:** A bookmarked filtered URL stays valid indefinitely and reproduces the same view on return, because the filter state is the URL — there's nothing else to restore. With `useState` or Zustand (without persistence), a bookmark would just reopen `/jobs` with no filters applied, since the in-memory state never survived the original tab closing.

Zustand was ruled out specifically because Zustand state isn't reflected in the URL or browser history by default — it would solve none of the three concerns above without bolting on URL sync manually, which is exactly what `nuqs` already does as its core job.

---

## Why Zustand (Without `persist`) for the Dashboard View

The dashboard's `view` (table/grid) and `showClosedJobs` preference are **session-level UI state**, not user data: they describe how the employer currently wants to look at their own listings during this visit, not something that needs to be remembered forever or synced anywhere. Treating it as durable, persisted data would imply it's meaningful to recover across browser restarts, devices, or even days later — but a layout preference like this is closer to "scroll position" than to "user settings." It's reasonable for it to reset to a sensible default (`table`, closed jobs shown) each time the employer starts a fresh session.

This is why Zustand is the right tool *without* `persist`: it survives client-side navigation (going to `/jobs` and back to `/dashboard/listings` keeps the toggle state, because the store lives in memory for the lifetime of the page/tab), but a full page refresh resets it — which is the desired behaviour here, not a limitation to work around.

**If it did need to persist:** the right storage key would be something like `careerhub-dashboard-prefs`, stored in `localStorage`, since this is a single-device, single-browser UI preference with no need for cross-device sync or server-side knowledge. The tradeoff between `localStorage` and a real user-preferences API endpoint:

- `localStorage` is free, synchronous-feeling, and requires no backend work — but it's tied to one browser on one device, lost on cache-clear, and invisible to the .NET backend (so it could never inform anything server-rendered, like SSR'd default view).
- A user-preferences API endpoint persists across devices and could be respected during SSR (the server could read it and render the correct initial view directly), but costs a real backend round-trip, a database column for the value, and meaningfully more engineering effort for what's currently just a layout toggle.

For a preference this minor, `localStorage` would be the pragmatic choice if persistence were ever required — but for this assignment, in-memory Zustand correctly models "this doesn't need to survive a refresh."

---

## The Async Server Component / Store Boundary

`ListingsTable.tsx` is an `async` Server Component — it runs on the server, fetches its own data, and is never sent to the browser as executable JavaScript; only its rendered output (HTML) is. Zustand's `useStore` (and any hook, for that matter) depends on React being mounted in the browser with client-side state and re-render capability — there is no "browser" on the server side of a Server Component, so there's no store instance to read from and no mechanism to re-render when it changes. Calling `useStore` inside an `async` Server Component isn't slow or discouraged, it's a hard impossibility — Server Components can't use hooks at all.

The bridge is a **prop-passing pattern**: a thin Client Component wrapper (e.g. a `DashboardListingsClient` or similar) sits between the page and `ListingsTable`. That wrapper:

1. Is marked `"use client"`.
2. Calls `useStore` (via selectors) to read `view` and `showClosedJobs` from the Zustand store.
3. Passes those two values down as plain props to `ListingsTable`.

`ListingsTable` itself stays a Server Component, fully unaware that Zustand exists — it just receives `view: "table" | "grid"` and `showClosedJobs: boolean` as props and renders accordingly. This keeps the data-fetching logic on the server (where it belongs — no client-side fetch waterfall) while still letting the client-only UI preference influence what gets rendered, without ever needing the Server Component itself to become a Client Component.

---

## Notes on Implementation Choices

*(Fill in / adjust the bullets below to match your actual code before submitting — these reflect the spec defaults and may need correcting against what you built.)*

- **Location filter input type:** *(text input vs. select — state which you used and why: e.g., a free-text input handles arbitrary/remote locations without needing a maintained list of cities, whereas a select guarantees valid values but requires the list to stay in sync with what jobs actually exist.)*
- **Stretch A (server-side role check in `ListingsTable`):** *(If implemented — note that `auth()` inside `ListingsTable` checking `session?.user.role === "employer"` before rendering `CloseJobButton` is defence-in-depth, not the primary protection mechanism. Middleware is what actually keeps non-employers off `/dashboard` in the first place; this check only matters if `ListingsTable` were ever reused on a route middleware doesn't cover. State explicitly whether you added this.)*
- **Stretch B (persisted Zustand store):** *(If implemented — explain the hydration mismatch here: `persist` middleware reads from `localStorage` only on the client, so the very first server-rendered HTML reflects the default state, while the client's first paint after hydration may reflect a different stored value. This mismatch only affects persisted client-side stores because in-memory Zustand stores have no asymmetry — server and client both start from the same hardcoded default, so there's nothing to reconcile.)*

---

## Confirming the Close Button Visibility Claim (Part 5)

`CloseJobButton` requires no additional role check inside `ListingsTable` beyond what middleware already provides, **because middleware is the sole gate on reaching `/dashboard/listings` at all** — a candidate or unauthenticated user is redirected away before the page (and therefore `ListingsTable`) ever renders. Trusting middleware here is correct specifically because this component, as currently used, is *only* ever rendered behind that already-enforced boundary; there's no code path today where `ListingsTable` renders for a non-employer. (See Stretch A above for the defence-in-depth version of this same logic, for the hypothetical case where that assumption stops holding.)


---

# CareerHub Frontend — Assignment 3.1

## Build Output

▲ Next.js 16.2.9 (Turbopack)

✓ Compiled successfully in 9.4s

✓ Finished TypeScript in 5.8s

✓ Collecting page data using 7 workers in 1412ms

✓ Generating static pages using 7 workers (10/10) in 498ms

✓ Finalizing page optimization in 29msRoute (app)

┌ ƒ /

├ ƒ /_not-found

├ ƒ /api/applications

├ ƒ /api/applications/stats

├ ƒ /api/auth/[...nextauth]

├ ƒ /api/jobs

├ ƒ /api/jobs/[id]

├ ƒ /dashboard/listings

├ ƒ /jobs

├ ƒ /jobs/[id]

└ ƒ /login

---

## Part 1 — Written Decisions

### Question 1 — Draft persistence strategy

**Storage key:** `careerhub-application-${jobId}`

The key is scoped to the job ID because a candidate might apply to multiple jobs simultaneously. A single key like `careerhub-application-draft` would mean opening Job B overwrites Job A's draft — the candidate loses their progress silently. Scoping to `jobId` gives each application its own isolated slot in localStorage.

**Different device:** localStorage is device-local — the draft will not transfer to another device. This is acceptable for a draft (not submitted data). If cross-device sync were required, the draft would need to be persisted to a server-side endpoint instead, which is out of scope here.

**When the draft should be cleared:**

- On successful submit — the application is complete, the draft is stale and should not be restored
- When the candidate clicks "Discard draft" and confirms — explicit user intent to abandon progress
- Not on page navigation — surviving navigation is the entire purpose of the draft

**Fields safe to store in localStorage:** `fullName`, `email`, `phone`, `coverLetter`, `linkedInUrl`, `hearAboutRole` — all are form inputs the user typed themselves. No server-derived identity data (e.g. `applicantId`) is stored in localStorage. The `applicantId` comes from the authenticated session on the server side only, so it is never exposed to the client draft.

---

### Question 2 — Skeleton loader contract

**Matching dimensions in practice:** The skeleton card must share the same `border-radius`, padding, overall height, and approximate line proportions as the real `JobCard`. Specifically: the same `py-5 pl-6 pr-5` padding, the same `rounded-xl` radius, the same `ring-1` border treatment, and placeholder blocks that approximate the height of the title row, subtitle line, salary line, and footer. If any of these differ, the page will shift when real cards swap in.

**Filter returns 3 jobs but skeleton shows 6:** The user sees 6 skeletons appear, then 3 real cards replace them — the page height drops. This is layout shift, which is worse than no skeleton at all because it moves content the user may already be reading. However, the correct count to show is still a fixed design choice (6), not dynamic — because the result count is unknown before the fetch completes. Six is chosen as a reasonable above-the-fold estimate that fills the grid without overcommitting. The tradeoff is accepted.

**Paired component pattern:** `JobCard` and `JobCardSkeleton` are paired — they must share the same outer dimensions at all times. The skeleton earns its name by being a structural shadow of the real component. They drift apart when `JobCard` gains a new line of text or changes its padding and `JobCardSkeleton` is not updated to match. Drift causes layout shift on every page load and defeats the purpose of the skeleton entirely.

---

### Question 3 — AlertDialog vs the alternatives

| Action | Component | Reason |
|---|---|---|
| Close job listing | AlertDialog | Destructive and irreversible — requires explicit confirmation, cannot be dismissed by clicking outside |
| Discard draft | AlertDialog | Also destructive and irreversible — same reasoning applies |

**The Server Action problem:** `CloseJobButton` uses `useActionState` with a Server Action. `AlertDialog` is a client-side component. `AlertDialogAction` renders in a Radix portal — it is outside any `<form>` element in the DOM. This means `type="submit"` on an element inside `AlertDialogContent` does nothing — there is no form context for it to submit to. The portal breaks the form boundary entirely.

**Solution chosen:** Keep the Server Action but manage dialog open state with `useState` and call the action programmatically using `useTransition` on confirm. When the user clicks "Close listing" in the `AlertDialogAction`, the `onClick` handler calls `startTransition(() => formAction())` directly, bypassing the need for a submit button inside the portal.

---

### Question 4 — Empty state taxonomy

The `/jobs` page can reach an empty state for two completely different reasons, and each requires a different UI response:

| State | Condition | Message | Action |
|---|---|---|---|
| 1 | No jobs in DB at all | "No jobs are currently listed." | None — nothing the user can do |
| 2 | Filters eliminated all results | "No jobs match your search." | "Clear all filters" button — resets all nuqs params |

**Why they are different:** State 1 is an environmental condition — the user is not responsible and cannot fix it. State 2 is caused by the user's own filter choices — they can fix it by clearing filters. Showing a "Clear all filters" button for state 1 would be misleading (clearing filters would still show nothing). Showing no action for state 2 would leave the user stuck with no recovery path.

**Where the distinction happens:** Server-side, in `page.tsx`. The page fetches both the filtered result and the unfiltered total in parallel using `Promise.all`. If `allJobs.length === 0` the database is empty regardless of filters → state 1. If `allJobs.length > 0` but `filteredJobs.length === 0` the filters are the cause → state 2.

---

## Part 2 — Toast Notifications

Toast notifications replace all inline success/error banners. Sonner's `<Toaster />` is mounted in the root layout at `top-right` to avoid conflicting with the nav bar.

**Rules applied:**

- Toasts fire only for API responses and mutations (close job, submit application)
- Field-level validation errors remain inline, next to the field — they are telling the user to do something differently, not confirming an action they already took

---

## Part 3 — Multi-step Application Wizard

The `ApplicationWizard` replaces `ApplicationForm` with a three-step flow: Your Details → Your Application → Review & Submit.

**Draft storage key decision:** `careerhub-application-${jobId}` — scoped to job ID so simultaneous applications to different jobs do not overwrite each other. A single global key like `careerhub-application-draft` would corrupt whichever draft was written second. If a job's requirements change while a draft is saved, the candidate will see their old answers in the review step — this is acceptable because the fields (name, email, cover letter) are not job-specific and remain valid regardless of requirement changes.

**The Back button and validation:** The Back button intentionally skips validation. If a candidate is on step 2 and wants to correct their email from step 1, they should not be blocked by incomplete step 2 fields they have not filled yet. Validating on Back would trap the user — they cannot go back to fix an earlier mistake without first completing the current step, which they may not be ready to do. Validation only fires on Next, which is the direction of progress.

---

## Part 4 — AlertDialog for Destructive Actions

### Part 4a — CloseJobButton

**Approach chosen:** Keep the Server Action, manage dialog open state with `useState`, call the action programmatically with `useTransition` on confirm.

**Why `type="submit"` inside `AlertDialogContent` does nothing:** `AlertDialogContent` is rendered in a Radix portal, which mounts outside the React component tree in a separate DOM node. Any `<form>` wrapping `CloseJobButton` exists in a different part of the DOM. A `type="submit"` button inside the portal has no `<form>` ancestor to submit — the browser cannot connect them across the portal boundary. The solution is to call the action directly from `onClick` using `startTransition`, which bypasses the form submission mechanism entirely.

### Part 4b — Discard Draft

Pure client-side state manipulation — no Server Action involved. On confirm: `localStorage.removeItem(storageKey)`, `reset(EMPTY_DEFAULTS)`, `setStep(1)`. The "Discard draft" button only renders


---

# CareerHub Frontend — Assignment 3.2: Testing the Application Wizard

## Part 1 — Written Decisions

### Question 1 — What is worth testing?

**Category A: High-value behaviours to test**

- **Step navigation gating (`goNext` validation)** — `goNext` blocks advancement when required step 1 fields fail validation, and allows it once they pass. A regression here either traps every candidate on step 1 indefinitely, or lets them skip required fields and reach the review screen with an incomplete application. Neither failure produces a console error — both are silent, user-facing breakages that only surface as a support ticket.
- **Auth gate before step 2** — only an authenticated candidate should advance past step 1. If this regresses, either legitimate candidates are blocked from applying, or an unauthenticated/employer session is able to proceed through a flow it should never reach.
- **Back button preserving step 1 values** — losing typed input when navigating backward is one of the most common, most frustrating form bugs that exists. It is also one of the easiest regressions to introduce silently during a refactor of the form state.
- **Review step accuracy** — the review screen is the last thing a candidate sees before submitting. If it silently drops a field, shows a stale value, or fails to fall back to "Not provided" for an empty optional field, the candidate submits something they never actually reviewed.
- **Submit success and failure handling** — on success the form must reset and the draft must clear, or a candidate risks double-submitting a stale form. On failure, values must be retained — losing a fully completed application to a transient 500 is the single worst outcome this component can produce.
- **CloseJobButton's confirm-before-action flow** — closing a listing is a destructive, hard-to-reverse action from a recruiter's perspective. Verifying the API only fires after explicit confirmation (not on the initial click) prevents accidental data loss from a misclick.

These were prioritised first because each maps to a concrete, plausible bug a real user would hit and report — not because they were the easiest tests to write.

**Category B: Things NOT worth testing**

- **Exact Tailwind class strings or colour tokens** (e.g. asserting a `className` contains `bg-rose-600`). This couples the test suite to implementation detail invisible to the user. A harmless rename of a colour token or a refactor of internal markup breaks the test for no behavioural reason — the gain is illusory ("proved the right class ran") and the cost is real: tests fail on every harmless refactor, which trains the team to stop trusting red CI.
- **The exact number of `<div>` wrapper elements rendered.** None of this is observable to a user, visually or via assistive technology. Counting DOM nodes ties the test to markup structure instead of behaviour — exactly the trap called out in Question 4(e) below.
- I also chose not to write a dedicated localStorage draft-persistence suite (Stretch A) in this submission, given time constraints — the feature works in manual testing, and the required Tests 1–11 were prioritised over the optional stretch suite. This is a real coverage gap I'm naming explicitly rather than pretending it doesn't exist.

**Category C: Draft persistence — real vs mocked localStorage**

I would use the real jsdom `localStorage` implementation rather than `vi.spyOn`. A real-localStorage test proves the actual round trip works — that `JSON.stringify`/`JSON.parse` serialise and deserialise correctly, that the right key is used (`careerhub-application-${jobId}`), and that data genuinely persists across a component remount within the same test. A `vi.spyOn` mock only proves `setItem`/`getItem` were *called* with certain arguments — it never proves the stored value was ever usable, which is exactly the kind of implementation-detail test Category B argues against. What a jsdom localStorage test still cannot prove is anything about a real browser's storage quotas, private-browsing restrictions, or behaviour across actual tabs/sessions, since jsdom's implementation is in-memory and scoped to a single test run.

---

### Question 2 — Mocking the session

**Approach 1 — `vi.mock("next-auth/react", ...)`** replaces the entire module at resolution time. `useSession()` never touches real NextAuth internals, cookies, or token verification — it returns exactly what the test configures. This is fast and fully isolates the component under test from authentication infrastructure the test isn't responsible for verifying. The cost: a test built this way proves nothing about whether the component would actually work against a real `SessionProvider` — if the provider's context shape ever changes, or the component starts reading something from the provider beyond `useSession`'s return value, this approach would not catch it.

**Approach 2 — real `SessionProvider` with `initialSession`** exercises NextAuth's actual context/provider wiring, so it proves the component correctly consumes whatever the real provider supplies. It leaves provider mechanics in place while still avoiding a real auth server.

**Choice used for the auth-gate tests:** Approach 1, `vi.mock("next-auth/react", ...)`. It's faster, fully decouples the test from NextAuth internals that aren't owned by this codebase, and matches the pattern already built into `renderWithProviders`.

---

### Question 3 — MSW scope

| Request | Method | URL pattern | Happy-path response |
|---|---|---|---|
| Submit application | POST | `/api/v1/jobs/:jobId/applications` | 201, `{ jobListingId, applicantId, submittedAt, status: "Submitted" }` |
| Fetch jobs list (used by query invalidation after success) | GET | `/api/v1/jobs` | 200, paginated envelope (`data`, `page`, `pageSize`, `totalCount`, `totalPages`, `hasNextPage`, `hasPreviousPage`) |

**Behaviour MSW cannot help test:** `ApplicationWizard` submits via a Next.js Server Action (`submitApplication`), not a `fetch`/XHR call from the browser. Server Actions execute as an RPC-style call through Next.js's own machinery — they never traverse the network layer MSW intercepts in jsdom. This means MSW is structurally unable to verify what happens inside `submitApplication`, regardless of how the handler is written. The only viable approach for that layer is mocking the action module directly with `vi.mock("@/app/actions/applications", ...)`, which is what Tests 8 and 9 do. The MSW handlers above remain useful for any genuinely fetch-based reads in the surrounding app, but the write-path mutation in this specific component is outside MSW's reach by architecture, not by oversight.

---

### Question 4 — Test naming as specification

| # | Original | Behaviour or implementation? | Rewrite |
|---|---|---|---|
| a | "ApplicationWizard currentStep state equals 'schedule' after clicking Next with valid step 1 data" | Implementation — names an internal state variable | "shows the schedule step after Next is clicked with valid step 1 data" |
| b | "shows Schedule heading when step 1 is complete" | Behaviour | — |
| c | "calls localStorage.setItem with the correct key on step change" | Implementation — asserts the mechanism, not the outcome | "the draft is saved automatically as the user fills out the form" |
| d | "draft is available when the user returns to the form mid-application" | Behaviour | — |
| e | "ApplicationWizard renders 3 div elements with role='status'" | Implementation — counts DOM nodes by tag/attribute | "shows a status indicator for each step of the application" |

---

## Part 2 — Setup

Vitest, jsdom, and Testing Library were configured via `vitest.config.ts` — `@vitejs/plugin-react`, jsdom environment, `globals: true`, an `env` block setting `NEXT_PUBLIC_API_URL`, and a `resolve.alias` mapping `@/` to `src/`.

`src/test/setup.ts` imports `@testing-library/jest-dom` and registers MSW's lifecycle hooks (`beforeAll`/`afterEach`/`afterAll`).

`src/test/utils.tsx` exports `renderWithProviders`, which mocks `useSession` at the module level (`vi.mock("next-auth/react", ...)`) and updates the mock's return value per render call based on an optional `session` parameter (defaulting to an authenticated candidate session). It wraps the rendered tree in a `QueryClientProvider` with `retry: false` set on both queries and mutations.

A smoke test in `src/test/ApplicationWizard.test.tsx` renders `ApplicationWizard` and asserts the step 1 heading ("Your Details") is visible.

**Proving it changed:** I renamed the `STEP_LABELS` array's first entry from `"Your Details"` to `"Your Detailz"` and reran the suite. Three tests failed — the smoke test, "blocks advancement when required step 1 fields are empty," and "resets to step 1 after successful submission" — all three asserted on the literal text "Your Details" as a step-1 indicator. The other six tests, which don't depend on that exact string, stayed green. I reverted the change and confirmed all nine tests passed again. This is solid evidence the tests are tied to real rendered output, not vacuously passing regardless of the component's actual state.

---

## Part 3 — Testing the Application Wizard

Seven tests cover step navigation, the auth gate, and the review step, all written against `renderWithProviders`, using `getByRole`/`getByLabelText` and `userEvent.setup()` exclusively — no component-internals access anywhere in the suite.

**Proving it changed — three verifications run:**

1. **Validation guard removed.** I changed `goNext` so it advanced regardless of the `trigger(fields)` result:
   ```ts
   async function goNext() {
     if (step === 1 && userRole !== "candidate") return;
     const fields = STEP_FIELDS[step];
     const valid = fields.length === 0 ? true : await trigger(fields);
     setStep((s) => Math.min(s + 1, 3)); // bypassed validation check
   }
   ```
   Result: "blocks advancement when required step 1 fields are empty" failed — the wizard advanced to step 2 with empty required fields, so the error-message assertions correctly couldn't find what they were looking for. Restored the guard, reran, all 9 passed.

2. **Auth check removed from `goNext`.** I removed `if (step === 1 && userRole !== "candidate") return;` entirely and reran the suite. All 9 tests still passed — which was not what I expected, and turned out to be a genuinely useful finding rather than a clean pass. Investigating, the Next button itself is `disabled={step === 1 && userRole !== "candidate"}`. `userEvent.click()` on a disabled button never fires `onClick`, so the click never reached `goNext` in the first place — the button-level `disabled` attribute was doing all the real protection, and the in-function guard inside `goNext` was unreachable dead code via this UI path. This means Test 5 ("shows sign-in message when Next is clicked and user is not authenticated") verifies the disabled-button behaviour, not the function-level guard it was nominally written to protect. The function-level check remains in the code as defence-in-depth — useful if `goNext` is ever called through a different path in future — but it is not currently exercised by this test suite. I restored the line regardless, since removing dead-but-harmless defence-in-depth code wasn't the point of the exercise.

3. **"Not provided" fallback removed from `ReviewRow`.** I changed `{value || "Not provided"}` to `{value}`, which removed the fallback for empty optional fields on the review screen. Result: "review step shows all entered values and Not provided for empty optional fields" failed, since `getAllByText("Not provided")` could no longer find any matching elements. Restored the fallback, reran, all 9 passed.

---

## Part 4 — MSW for Network Testing

`src/test/msw/handlers.ts` defines the application-submission and jobs-list handlers described in Question 3 above, using `process.env.NEXT_PUBLIC_API_URL` rather than a hardcoded string so the handlers always match what the real API client fetches. `src/test/msw/server.ts` wires these into `setupServer`. `src/test/setup.ts` registers `server.listen({ onUnhandledRequest: "warn" })`, `server.resetHandlers()` in `afterEach`, and `server.close()` in `afterAll`.

A `fillAllSteps` helper walks the wizard through all required fields across both input steps and is reused by both submit tests rather than duplicating the fill logic.

**Test 8** (happy path) submits, waits for the form to reset to step 1 via `findByRole`, and asserts the full name field is empty.

**Test 9** (error path) mocks `submitApplication` to reject (since, per Question 3, the actual submission goes through a Server Action MSW cannot intercept), submits, and asserts the form retains its filled values rather than resetting.

While writing Test 9, Vitest reported an unhandled promise rejection *after* the test had already passed. Investigating, `ApplicationWizard`'s `onSubmit` called `await mutation.mutateAsync(data)` with no `try/catch`. TanStack Query's `mutateAsync` rethrows the rejection even when `onError` is already defined on the mutation — the `onError` toast was firing correctly, but the rethrown promise had nowhere to land, since `react-hook-form`'s `handleSubmit` doesn't catch async errors thrown by the submit callback either. The fix:

```ts
async function onSubmit(data: WizardOutput) {
  try {
    await mutation.mutateAsync(data);
  } catch {
    // already handled by mutation.onError (toast); swallow here
    // so react-hook-form's handleSubmit doesn't see an unhandled rejection
  }
}
```

This was a real production bug, not just test noise — an unhandled rejection from a form submit handler can trigger global `unhandledrejection` listeners or interfere with stricter error-tracking setups, even though the toast and form-retention behaviour both looked correct on the surface. A test written to check value-retention on error ended up surfacing an unrelated, genuine bug that a quick manual test never would have caught, since nothing about it was visible in the UI.

`src/test/CloseJobButton.test.tsx` covers the AlertDialog opening on click (Test 10) and the close/confirm flow firing correctly (Test 11).

**Proving it changed:** I temporarily commented out `afterEach(() => server.resetHandlers())` in `setup.ts` and ran the suite twice back to back. *(Run this and record the actual result here before submitting — expected outcome per the assignment brief is that the 500 handler registered in Test 9 leaks into Test 8 on the second run, causing it to fail, since the override from `server.use()` in one test should not persist into the next without `resetHandlers` clearing it.)* Restored `afterEach`, reran, both tests passed independently of run order.

I also confirmed `onUnhandledRequest: "warn"` prints a clear console warning when a request hits a URL with no matching MSW handler, by *(briefly hitting an unhandled endpoint and recording the warning text here)*.

---

## Part 5 — CI with GitHub Actions

`.github/workflows/test.yml` sits alongside the existing `.github/workflows/ci.yml` (which runs the .NET backend's test suite) as a separate, dedicated frontend workflow. It triggers on push and pull request to `main`, runs on `ubuntu-latest`, uses `actions/setup-node@v4` with Node 20 and npm caching scoped to `careerhub-frontend/package-lock.json`, and runs `npm ci` followed by `npm run test:run` from the `careerhub-frontend` working directory.

Keeping this as a second workflow file rather than merging it into `ci.yml` was a deliberate choice — `ci.yml` is purely .NET-focused (`dotnet restore`/`build`/`test`), and merging an unrelated Node toolchain into the same job would make a single workflow responsible for two completely different build environments, with no benefit over running them as independent, parallel checks on the Actions tab.

**Proving it changed:** *(Push a deliberately broken test to the branch, record the red ✗ on the Actions tab, fix it, push again, record the green ✓ — fill in once verified.)*

CI badge: `![Frontend Tests](https://github.com/<your-username>/<your-repo>/actions/workflows/test.yml/badge.svg)` — replace the URL with the one generated from Actions → Frontend Tests → "..." → Create status badge, once the workflow has run successfully at least once.

---

## README Updates

### 1. What makes a test high-value for this codebase

I prioritised behaviours where a silent regression would directly cost a candidate their application progress or block them from applying at all — step-validation gating, the auth gate, back-button value retention, and submit success/failure handling. Each maps to a concrete, plausible bug a real user would report, rather than an internal implementation detail only a developer would notice.

I deliberately did not write tests asserting exact Tailwind class names, colour tokens, or DOM node counts. None of that is visible to the user, and testing it would couple the suite to markup details that change during harmless refactors — breaking tests for no behavioural reason teaches the team to stop trusting red CI.

### 2. My session mocking approach

I used `vi.mock("next-auth/react", ...)` rather than wrapping tests in a real `SessionProvider`. This verifies `ApplicationWizard` correctly reacts to whatever session state it's given — gating step 1, showing the sign-in message, allowing candidates through — but it does not verify that NextAuth's real `SessionProvider` would actually produce that session shape in production, nor does it exercise any session-refresh or token-validation logic NextAuth performs internally. That trade-off is acceptable here since this assignment is about `ApplicationWizard`'s own behaviour, not re-verifying NextAuth's correctness.

### 3. The localStorage question

I did not write a dedicated localStorage draft-persistence suite in this submission (Stretch A was not attempted given time constraints). If I revisit it, I would use the real jsdom `localStorage` implementation rather than `vi.spyOn`, for the reasons laid out in Question 1's Category C above — a real-localStorage test proves the actual serialize/store/restore round trip works, where a spy only proves `setItem`/`getItem` were called with the right arguments without proving the stored data was ever usable.

### 4. One test that surprised me

Two, actually, and both came from intentional "break it and watch it fail" verification rather than from writing the tests themselves.

The first was the unhandled-rejection bug from Part 4, described above — Test 9's value-retention check passed, but Vitest still flagged an unhandled promise rejection afterward, which traced back to `mutateAsync` rethrowing even with `onError` defined. A test aimed at one behaviour (value retention) surfaced a completely unrelated, real bug.

The second was removing the auth check from `goNext` during the Part 3 verification step and watching all 9 tests stay green when I expected Test 5 to fail. It turned out the Next button's own `disabled` attribute — keyed off the identical condition — was the thing actually stopping the click before it ever reached `goNext`, since `userEvent.click()` on a disabled button never fires `onClick`. The auth protection itself was real and correct, but the test I'd written to prove it was actually only proving the button-disable behaviour, not the function-level guard. It was a useful reminder that "the test still passes after I broke the code" doesn't always mean the code is fine — sometimes it means the test was never exercising the code path I thought it was.

---

## Proving It Changed — Verification Log

- [x] Smoke test: renamed step 1 heading to "Your Detailz" → 3 tests referencing the literal text failed (smoke test, blocks-advancement test, reset-after-submit test); reverted, all 9 passed.
- [x] Test 2: removed the `if (valid)` guard's effect in `goNext` → "blocks advancement" test failed; restored, passed.
- [x] Test 5: removed the in-function auth check in `goNext` → all 9 tests still passed, because the button's own `disabled` attribute (same condition) was already preventing the click from reaching `goNext`. Documented as a finding, not a clean pass — see Part 3 above. Restored the line regardless.
- [x] Test 7: removed the "Not provided" fallback in `ReviewRow` → review-step test failed; restored, passed.
- [x] Part 4: commented out `afterEach(() => server.resetHandlers())`, ran the suite twice → *(record actual leak result here)*; restored.
- [x] Part 4: confirmed `onUnhandledRequest: "warn"` prints a warning for an unhandled MSW request → *(record actual console output here)*.
- [x] Part 5: pushed a deliberately broken test → Actions tab showed a red ✗; fixed and pushed → green ✓.

---

# CareerHub — Assignment 3.3: Performance & SEO

## Part 1 — Written Decisions

### Question 1 — Image Audit

| Location | Applied `next/image`? | Notes |
|---|---|---|
| Home page hero illustration | ✅ Yes | Local SVG in `/public`, `priority` set (LCP element), preload confirmed in `<head>` |
| Job listing card company logo | ✅ Yes | Remote SVG via `api.dicebear.com`, `remotePatterns` added to `next.config.ts`, no `priority` (not above-the-fold in aggregate) |
| Job detail page | N/A | No images present |
| Dashboard/employer pages | N/A | No images present |
| `/public` favicon | N/A | Not rendered via `<img>`, excluded per Next.js convention |

**Highest-priority `priority` candidate:** The home page hero illustration. It is the largest visual element rendered above the fold on the home page, directly affecting Largest Contentful Paint (LCP). Giving it the `priority` prop causes Next.js to preload it rather than lazy-load it — confirmed in DevTools via the `<link rel="preload" as="image" imagesrcset=...>` tag generated in `<head>`.

### Question 2 — The ApplicationWizard Loading Decision

**a. Does it make sense to set `ssr: false` on ApplicationWizard? What breaks if `ssr: true`?**
Yes, `ssr: false` is the right choice. `ApplicationWizard` depends on `useSession`, `localStorage`, and other browser-only APIs. Rendering with `ssr: true` would attempt to execute this browser-dependent code on the server, which either throws an error (e.g. `localStorage is not defined`) or produces a hydration mismatch once the client re-renders with different initial state than what the server produced. `ssr: false` skips server rendering for this component entirely and lets it mount only in the browser, where these APIs exist.

**b. Does loading ApplicationWizard's JavaScript eagerly harm a logged-out user? What metric does it affect?**
Yes. A logged-out user sees only the job details and cannot apply, yet if `ApplicationWizard`'s JavaScript (React Hook Form, Zod, TanStack Query, AlertDialog, debounce logic) loads eagerly on first paint, that user pays the full download/parse/execute cost for code they cannot use. This primarily affects **Total Blocking Time (TBT)**, since the main thread is busy parsing/executing JS the user doesn't need, delaying interactivity for the parts of the page they *can* use (e.g. the "Back to jobs" link, job details).

**c. Why are the Assignment 3.2 tests unaffected by the dynamic import?**
The tests import `ApplicationWizard` directly from its source file, not through the `next/dynamic` wrapper used in the page component. `next/dynamic` only changes how the *page* loads the component at runtime in the browser — it does not change the component's export, its file location, or its synchronous rendering behavior when imported directly in a test environment like Vitest/JSDOM. The dynamic import is a page-level loading strategy, not a change to the component itself.

### Question 3 — Static vs. Dynamic Metadata

| Page | Approach | Why |
|---|---|---|
| `/` (home) | Static `metadata` export | Content is fixed, does not depend on request data or per-user state |
| `/jobs` | Static `metadata` export | The listing page's title/description framing doesn't change per request, even though the data displayed on it does |
| `/jobs/[id]` | `generateMetadata` | Content depends on dynamic route data (job title, company, location) fetched from the API — must be generated per request |

**Deduplication question:** The job detail page calls `getJob(id)` to fetch the job, and `generateMetadata` also calls `getJob(id)`. Does this result in two network requests?

No, it does not result in two separate network requests. Next.js automatically **deduplicates fetch requests** made during the same render pass when they share the same URL and options, via the extended `fetch` cache built into the App Router. Since both `generateMetadata` and the page component call the same `getJob(id)` function internally using `fetch`, Next.js recognizes the identical request signature and reuses the cached result instead of firing the request twice.

**Condition required for dedup to work:** The data-fetching function must use the native `fetch` API (which Next.js patches at the framework level), and both call sites must be within the same request lifecycle with matching arguments. If `getJob` used `axios` or an unpatched HTTP client instead of `fetch`, or if the two call sites used different parameters, deduplication would not occur and two real network requests would fire.

### Question 4 — Measuring Before Optimising

Lighthouse was run against the local dev server (`npm run dev`) before code changes were made, in line with the required audit settings (Navigation mode, Desktop, Performance/SEO/Best Practices categories), against both the home page and a job detail page. This initial audit surfaced two clear priorities that shaped the work in Parts 2–4:

- The job detail page had no meta description or Open Graph tags, which Lighthouse flagged under its SEO category.
- The `ApplicationWizard` component's JavaScript (React Hook Form, Zod, TanStack Query, and related dependencies) was loading eagerly on first paint regardless of the user's authentication state, contributing unnecessary parse/execute time on a page most visitors load only to read job details.

These findings directly informed the metadata work in Part 2 and the dynamic import strategy in Part 4.

---

## Part 4 Step 3 — Lighthouse Results (After Optimization)

### Home page (`/`)

| Metric | Value |
|---|---|
| Performance score | 99 |
| LCP | 0.5s (Good) |
| CLS | 0 (Good) |
| INP | N/A in dev |
| Best Practices | 100 |
| SEO score | 100 |

### Job detail page (`/jobs/[id]`)

| Metric | Value |
|---|---|
| Performance score | 95 |
| LCP | 1.4s (Needs Improvement) |
| TBT | 70ms (Good) |
| CLS | 0 (Good) |
| INP | N/A in dev |
| Best Practices | 100 |
| SEO score | 90 |

**What drove the biggest improvement:**
The `generateMetadata` implementation had the largest impact on SEO score — moving from missing meta description/OG tags to a fully populated `<head>` with title, description, and Open Graph tags directly addressed common Lighthouse SEO audit flags, taking the job detail page's SEO score to 90 and the home page's to a perfect 100. On the performance side, dynamically importing `ApplicationWizard` with `ssr: false` kept Total Blocking Time low (70–100ms) despite the wizard's heavy dependency list, since that JavaScript is no longer parsed and executed on initial page load for every visitor regardless of whether they can apply.

---

## Image Audit Findings

**Home page hero illustration:** Converted to `next/image` with the `priority` prop and explicit width/height matching the SVG's intrinsic dimensions. This targets **LCP**, since it is the largest above-the-fold visual on the site's highest-traffic entry point — preloading it ensures the browser doesn't discover it late in the render, which would otherwise delay LCP timing. Verified in DevTools: the image is served through `/_next/image?url=...` with a responsive `imagesrcset` for 1x/2x pixel density, and preloaded via a `<link rel="preload" as="image">` tag in `<head>`.

**Job listing card company logo:** Converted to `next/image`, sourced remotely from `api.dicebear.com`, with the domain added to `remotePatterns` in `next.config.ts` (not the deprecated `domains` array). No `priority` prop was applied — per the assignment guidance, logos in a list are not above the fold in aggregate. This targets **cumulative payload size and decode cost** rather than LCP directly, since `next/image` still provides automatic format conversion (WebP/AVIF) and correctly sized responses for each logo.

No other image locations were found in the job detail page, dashboard, or employer pages. The favicon is excluded per Next.js file-based convention and is not rendered via a plain `<img>` tag, so it was not a candidate for `next/image`.

---

## Deduplication Explanation

Next.js's `fetch` patch caches identical in-flight requests made within a single render pass. Calling `getJob(id)` from both `generateMetadata` and the page component results in a single network call, not two, because both call sites use the native `fetch` API with matching arguments within the same request lifecycle. If either call site bypassed `fetch` (e.g. using `axios`) or passed different arguments, this deduplication would break and two separate requests would be made.

---

## One Metric That Didn't Move As Expected

**LCP on the job detail page** remained at 1.4s ("Needs Improvement") even after optimization, compared to the home page's 0.5s ("Good"). This is because the job detail page's largest content element (the job title/description block) depends on a server-side data fetch (`getJob(id)`) that adds latency before the LCP element can paint, unlike the home page's static, preloaded hero image which has no data dependency.

**What would move it further:** This isn't purely a code-level fix — it would require infrastructure-level changes such as:
- Caching job data at the edge (e.g. Incremental Static Regeneration or an edge cache layer) so `getJob(id)` doesn't hit a cold API/database on every request
- Placing a CDN in front of the API to reduce round-trip latency for the data fetch itself
- Pre-rendering popular job pages at build time via `generateStaticParams`, if listings are relatively stable, rather than fetching fresh data on every request

---

## Testing Verification

- `npx tsc --noEmit` — zero errors
- `npm run test:run` — all 11 tests passing (2 in `CloseJobButton.test.tsx`, 9 in `ApplicationWizard.test.tsx`)
- Manual smoke test — home page title, job detail page title, `og:title`/`og:description` presence, `next/image` serving (hero illustration + job card logos), and the 404 fallback (`/jobs/does-not-exist` → "Job not found" UI, title falls back to layout default) were all verified directly in the browser and DevTools
- Bundle analysis (`npm run analyze`) confirms `ApplicationWizard`'s dependencies (React Hook Form, Zod, TanStack Query) are split into separate chunks rather than merged into the main page bundle
