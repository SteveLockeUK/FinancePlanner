using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using FinancePlanner.Domain.Models;
using System.Security.Claims;
using FinancePlanner.Data.Models;

namespace FinancePlanner.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", Register);
        group.MapPost("/login", Login);
        group.MapPost("/logout", Logout);
        group.MapGet("/user", GetCurrentUser).RequireAuthorization();
    }

    private static async Task<IResult> Register(
        [FromBody] RegisterRequest request,
        UserManager<ApplicationUser> userManager)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { message = "Email and password are required." });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return Results.BadRequest(new
            {
                message = "Registration failed.",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        return Results.Ok(new { message = "User registered successfully." });
    }
    
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserModel))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]   
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    private static async Task<IResult> Login(
        [FromBody] LoginRequest request,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { message = "Email and password are required." });
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Results.Unauthorized();
        }

        var result = await signInManager.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: request.RememberMe,
            lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new UserModel(
            user.Id,
            user.Name!,
            user.Email!
        ));
    }

    private static async Task<IResult> Logout(SignInManager<ApplicationUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return Results.Ok(new { message = "Logged out successfully." });
    }

    private static async Task<IResult> GetCurrentUser(
        ClaimsPrincipal user,
        UserManager<ApplicationUser> userManager)
    {
        var appUser = await userManager.GetUserAsync(user);
        if (appUser == null)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new { message = "User logged out successfully." });
    }
}

public record RegisterRequest(
    string Email,
    string Password,
    string Name);

public record LoginRequest(
    string Email,
    string Password,
    bool RememberMe = false);