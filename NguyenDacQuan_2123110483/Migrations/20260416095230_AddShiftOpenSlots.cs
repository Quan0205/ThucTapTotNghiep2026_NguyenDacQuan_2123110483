using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NguyenDacQuan_2123110483.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftOpenSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OpenShiftSlotId",
                table: "Schedules",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ShiftOpenSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    ShiftId = table.Column<int>(type: "int", nullable: false),
                    SlotDate = table.Column<DateTime>(type: "date", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    Note = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftOpenSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShiftOpenSlots_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShiftOpenSlots_Shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "Shifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_OpenShiftSlotId",
                table: "Schedules",
                column: "OpenShiftSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftOpenSlots_BranchId_ShiftId_SlotDate",
                table: "ShiftOpenSlots",
                columns: new[] { "BranchId", "ShiftId", "SlotDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShiftOpenSlots_ShiftId",
                table: "ShiftOpenSlots",
                column: "ShiftId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_ShiftOpenSlots_OpenShiftSlotId",
                table: "Schedules",
                column: "OpenShiftSlotId",
                principalTable: "ShiftOpenSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_ShiftOpenSlots_OpenShiftSlotId",
                table: "Schedules");

            migrationBuilder.DropTable(
                name: "ShiftOpenSlots");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_OpenShiftSlotId",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "OpenShiftSlotId",
                table: "Schedules");
        }
    }
}
