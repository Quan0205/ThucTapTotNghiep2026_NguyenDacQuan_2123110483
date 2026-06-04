using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoffeeHRM.Models;

public class ShiftOpenSlot : AuditableEntity
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(Branch))]
    public int BranchId { get; set; }

    [ForeignKey(nameof(Shift))]
    public int ShiftId { get; set; }

    [DataType(DataType.Date)]
    public DateTime SlotDate { get; set; }

    public int Capacity { get; set; } = 1;

    [StringLength(250)]
    public string? Note { get; set; }

    public bool IsActive { get; set; } = true;

    public Branch? Branch { get; set; }
    public Shift? Shift { get; set; }
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
