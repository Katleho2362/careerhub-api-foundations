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

---

## Project Structure

| Folder/File | Purpose |
|---|---|
| Models/ | Contains model classes |
| Stores/ | Contains fake in-memory data |
| Program.cs | Main API configuration and endpoints |

---

## API Structure Choice

This project uses Minimal APIs instead of Controllers.

Minimal APIs were chosen because the assignment only requires a small number of simple GET endpoints. Minimal APIs provide a lightweight and clean approach for building small REST APIs with less boilerplate code.

This structure keeps the routing logic simple and easy to understand while still supporting asynchronous endpoint handling and OpenAPI integration.

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