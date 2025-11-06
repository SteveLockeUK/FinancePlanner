using System.Security.Claims;
using FinancePlanner.Data;
using FinancePlanner.Data.Models.Accounts;
using FinancePlanner.Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Currency = FinancePlanner.Domain.Entities.Currency;
using AccountType = FinancePlanner.Domain.Entities.AccountType;

namespace FinancePlanner.API.Endpoints;

public static class AccountEndpoints
{
    public static void MapAccountEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/accounts");
        group.MapGet("/", GetAll).RequireAuthorization();
        group.MapGet("/{id}", Get).RequireAuthorization();
        group.MapPost("/", Create).RequireAuthorization();
        group.MapPut("/{id}", Update).RequireAuthorization();
        group.MapDelete("/{id}", Delete).RequireAuthorization();
    }

    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<AccountModel>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> GetAll(
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var accounts = await db.Accounts
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .Select(x => new AccountModel(x))
            .ToArrayAsync(cancellationToken);

        return Results.Ok(accounts);
    }

    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AccountModel))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Get([FromRoute] long id,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var account =
            await db.Accounts
                .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        // ReSharper disable once ConvertIfStatementToReturnStatement
        if (account == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(new AccountModel(account));
    }

    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(AccountModel))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(BadRequest))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Create([FromBody] CreateAccountRequest request,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var existingAccount = await db.Accounts
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(x => x.Name == request.Name, cancellationToken);
        if (existingAccount != null)
        {
            return Results.BadRequest(new { message = "Account already exists." });
        }

        var account = new Account
        {
            Name = request.Name,
            Currency = (Currency)request.Currency,
            Type = (AccountType)request.Type,
            StartingBalance = request.StartingBalance,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier)!
        };

        await db.Accounts.AddAsync(account, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new AccountModel(account));
    }

    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Created<AccountModel>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(BadRequest))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Update(
        [FromRoute] long id,
        [FromBody] UpdateAccountRequest request,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var account = await db.Accounts
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (account == null)
        {
            return Results.NotFound();
        }
        
        account.Name = request.Name;
        account.Currency = (Currency)request.Currency;
        account.Type = (AccountType)request.Type;
        account.StartingBalance = request.StartingBalance;
        account.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return Results.Created(new Uri($"accounts/{account.Id}"), new AccountModel(account));
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Delete(
        [FromRoute] long id,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var account = await db.Accounts
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (account == null)
        {
            return Results.NotFound();
        }

        db.Remove(account);
        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok();
    }
}