namespace FinancePlanner.Data.Models;

public record UserModel(string Id, string Name, string Email)
{
    public string Id { get; set; } = Id;
    public string Name { get; set; } = Name;
    public string Email { get; set; } = Email;
}