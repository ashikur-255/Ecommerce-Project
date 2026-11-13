using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSteadfastDeliveryFieldsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConsignmentId",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryStatus",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrackingCode",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$X3zMeZGV1sj74gnr4Y9A8uxQlJj5lipGb7UZ3e2nL0KruUJpAf8VG");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConsignmentId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TrackingCode",
                table: "Orders");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$kHLxo3VRE7wDyA1z7EmVk.V6jn/E9l5FZ3s6dAfalza0//DKMGiZy");
        }
    }
}
