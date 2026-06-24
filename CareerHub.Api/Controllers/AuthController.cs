using BCrypt.Net;
using CareerHub.Api.Data;
using CareerHub.Api.DTOs;
using CareerHub.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CareerHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly CareerHubDbContext _db;

    // CareerHubDbContext injected here — only AuthController needs it,
    // so there's no point creating a whole IApplicantRepository just for
    // two auth queries. Direct DbContext use in a controller is fine for
    // this scope.
    public AuthController(IConfiguration configuration, CareerHubDbContext db)
    {
        _configuration = configuration;
        _db = db;
    }

    // ── Shared helper ────────────────────────────────────────────────────
    // Builds and signs a JWT. Extracted so Login and Register don't
    // duplicate the key/credentials/token block.
    private string BuildApplicantToken(Guid applicantId, string username)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, "Applicant"),
            new Claim("applicantId", applicantId.ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ==========================================
    // POST: api/auth/login  (employer)
    // ==========================================
    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        if (
            request.Username != "employer" ||
            request.Password != "password123"
        )
        {
            return Unauthorized();
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, request.Username),
            new Claim(ClaimTypes.Role, "Employer")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials);

        return Ok(new LoginResponse(
            new JwtSecurityTokenHandler().WriteToken(token)));
    }

    // ==========================================
    // POST: api/auth/login/applicant
    // ==========================================
    [HttpPost("login/applicant")]
    public async Task<IActionResult> LoginAsApplicant(LoginRequest request)
    {
        // ── Dev shortcut ─────────────────────────────────────────────────
        // The hardcoded applicant/password123 path remains so the seeded
        // dev applicant (no PasswordHash) still works without registration.
        if (request.Username == "applicant" && request.Password == "password123")
        {
            var devApplicantId = Guid.Parse("33333333-0000-0000-0000-000000000099");
            return Ok(new LoginResponse(BuildApplicantToken(devApplicantId, request.Username)));
        }

        // ── Real applicant lookup — email used as username ───────────────
        // Registered applicants log in with their email address.
        // FirstOrDefaultAsync is safe here: email has a unique index so
        // there can never be more than one match.
        var applicant = await _db.Applicants
            .FirstOrDefaultAsync(a => a.Email == request.Username);

        // Reject if not found, or found but registered without a password
        // (i.e. a seeded row that isn't the dev shortcut above).
        if (applicant is null || applicant.PasswordHash is null)
            return Unauthorized();

        // BCrypt.Verify does the constant-time comparison — never compare
        // hashes with == (timing attacks).
        if (!BCrypt.Net.BCrypt.Verify(request.Password, applicant.PasswordHash))
            return Unauthorized();

        return Ok(new LoginResponse(
            BuildApplicantToken(applicant.Id, applicant.Email)));
    }

    // ==========================================
    // POST: api/auth/register
    // ==========================================
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        // Validate inputs — minimal, since the form does the heavy lifting.
        // We still check server-side so the API is safe to call directly.
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { title = "All fields are required." });
        }

        if (request.Password.Length < 8)
        {
            return BadRequest(new { title = "Password must be at least 8 characters." });
        }

        // Duplicate email check — the unique index would catch this anyway,
        // but catching it here lets us return a clear 409 Conflict with a
        // human-readable message instead of a raw DB exception.
        var emailTaken = await _db.Applicants
            .AnyAsync(a => a.Email == request.Email);

        if (emailTaken)
        {
            return Conflict(new { title = "An account with that email already exists." });
        }

        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            // WorkFactor 12 is the current recommended minimum for BCrypt —
            // high enough to be slow for attackers, fast enough for login UX
            // (~300ms on modern hardware).
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12)
        };

        _db.Applicants.Add(applicant);
        await _db.SaveChangesAsync();

        // Return a token immediately — the user is logged in right after
        // registering, no separate login step needed.
        return Ok(new LoginResponse(
            BuildApplicantToken(applicant.Id, applicant.Email)));
    }

    // ==========================================
    // GET: api/auth/me
    // ==========================================
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var username = User.FindFirstValue(ClaimTypes.Name);
        var role = User.FindFirstValue(ClaimTypes.Role);
        return Ok(new { Username = username, Role = role });
    }
}