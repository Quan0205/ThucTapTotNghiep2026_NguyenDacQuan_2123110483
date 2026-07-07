using CoffeeHRM.Data;
using CoffeeHRM.Models;
using Microsoft.EntityFrameworkCore;

namespace CoffeeHRM.Services;

public interface IRolePermissionService
{
    Task<List<string>> GetPermissionsAsync(UserAccount account, CancellationToken cancellationToken = default);
}

public sealed class RolePermissionService : IRolePermissionService
{
    private readonly AppDbContext _context;

    public RolePermissionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<string>> GetPermissionsAsync(UserAccount account, CancellationToken cancellationToken = default)
    {
        if (account.SystemRoleId == null)
        {
            return new List<string>();
        }

        var permissions = await _context.SystemRolePermissions
            .Where(x => x.SystemRoleId == account.SystemRoleId.Value)
            .Include(x => x.Permission)
            .Where(x => x.Permission != null)
            .Select(x => x.Permission!.Code)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (permissions.Count > 0)
        {
            return permissions;
        }

        var systemRoleCode = account.SystemRole?.Code
            ?? await _context.SystemRoles
                .Where(x => x.Id == account.SystemRoleId.Value)
                .Select(x => x.Code)
                .FirstOrDefaultAsync(cancellationToken);

        if (!string.Equals(systemRoleCode, "ADMIN", StringComparison.OrdinalIgnoreCase))
        {
            return permissions;
        }

        return await _context.Permissions
            .Where(x => !x.IsDeleted)
            .Select(x => x.Code)
            .Distinct()
            .ToListAsync(cancellationToken);
    }
}
