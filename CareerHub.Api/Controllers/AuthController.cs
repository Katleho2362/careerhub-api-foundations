using CareerHub.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace CareerHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    // Used to read values from appsettings.Development.json
    private readonly IConfiguration _configuration;

    // Constructor Injection
    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // ==========================================
    // POST: api/auth/login
    // ==========================================
    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        // STEP 1:
        // Validate username and password
        if (
            request.Username != "employer" ||
            request.Password != "password123"
        )
        {
            // Returns 401 Unauthorized
            return Unauthorized();
        }

        // STEP 2:
        // Create claims to store inside JWT
        var claims = new[]
        {
            // Subject claim (username)
            new Claim(
                ClaimTypes.Name,
                request.Username),

            // Role claim
            new Claim(
                ClaimTypes.Role,
                "Employer")
        };

        // STEP 3:
        // Read Secret Key from appsettings.Development.json
        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:SecretKey"]!));

        // STEP 4:
        // Create signing credentials using HmacSha256
        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        // STEP 5:
        // Generate JWT Token
        var token =
            new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

        // STEP 6:
        // Convert token object into string
        var tokenString =
            new JwtSecurityTokenHandler()
                .WriteToken(token);

        // STEP 7:
        // Return token to user
        return Ok(
            new LoginResponse(tokenString));
    }

    // ==========================================
    // GET: api/auth/me
    // ==========================================
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        // Read username from JWT
        var username =
            User.FindFirstValue(ClaimTypes.Name);
               // JwtRegisteredClaimNames.Sub);

        // Read role from JWT
        var role =
            User.FindFirstValue(
                ClaimTypes.Role);

        return Ok(new
        {
            Username = username,
            Role = role
        });
    }
}