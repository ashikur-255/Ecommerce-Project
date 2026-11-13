using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EcommerceAPI.Migrations
{
    /// <inheritdoc />
    public partial class initialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Images = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sizes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Colors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<decimal>(type: "decimal(3,1)", nullable: false, defaultValue: 0m),
                    ReviewCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsNew = table.Column<bool>(type: "bit", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "customer"),
                    Avatar = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Size = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AddedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartItems_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ShipFullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShipAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    ShipCity = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ShipPostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShipCountry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ShipPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ShippingCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Tax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PaymentIntentId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OrderStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProductImage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Size = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Brand", "Category", "Colors", "CreatedAt", "Description", "Images", "IsFeatured", "IsNew", "Name", "OriginalPrice", "Price", "Rating", "ReviewCount", "Sizes", "Stock", "Tags" },
                values: new object[,]
                {
                    { 1, "adidas", "T-Shirts", "White|Black|Navy", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Premium cotton blend t-shirt with iconic 3-stripe design. Comfortable fit for everyday wear.", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", true, true, "Adidas Classic T-Shirt", 750m, 550m, 4.5m, 12, "S|M|L|XL|XXL", 100, "casual|cotton|classic" },
                    { 2, "adidas", "Shorts", "Black|Grey|Blue", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Lightweight running shorts with moisture-wicking technology for peak performance.", "https://images.unsplash.com/photo-1562886812-a775d973cf59?w=600", true, true, "Adidas Running Shorts", 1100m, 850m, 4.3m, 8, "S|M|L|XL", 60, "running|sport|performance" },
                    { 3, "adidas", "Hoodies", "Black|Grey|Olive", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Warm fleece hoodie perfect for training sessions and casual outings.", "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600", true, false, "Adidas Hoodie Pro", 2400m, 1800m, 4.7m, 21, "S|M|L|XL|XXL", 45, "hoodie|fleece|warm" },
                    { 4, "adidas", "Jackets", "Navy|Black|Red", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Iconic track jacket with zip-up front and contrasting stripe detail.", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600", false, true, "Adidas Track Jacket", 2800m, 2200m, 4.6m, 15, "S|M|L|XL", 30, "track|jacket|sport" },
                    { 5, "adidas", "Accessories", "Black|White|Grey", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Adjustable snapback cap with embroidered logo. One size fits most.", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600", true, false, "Adidas Sport Cap", 600m, 450m, 4.2m, 6, "OneSize", 80, "cap|accessory|casual" },
                    { 6, "adidas", "Pants", "Black|Navy|Charcoal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Comfortable training pants with tapered fit and elastic waistband.", "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600", true, true, "Adidas Training Pants", 1600m, 1200m, 4.4m, 9, "S|M|L|XL|XXL", 50, "training|pants|sport" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Avatar", "CreatedAt", "Email", "Name", "PasswordHash", "Role" },
                values: new object[] { 1, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@adidas.com", "Admin", "$2a$11$ZeKw3WILLi.Jlo0h4s/g1Ojq3C2CsOO/Kj0JWUHOnVF4H1t/bFUkK", "admin" });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ProductId",
                table: "CartItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_UserId_ProductId_Size_Color",
                table: "CartItems",
                columns: new[] { "UserId", "ProductId", "Size", "Color" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ProductId",
                table: "OrderItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderStatus",
                table: "Orders",
                column: "OrderStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_PaymentStatus",
                table: "Orders",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Brand",
                table: "Products",
                column: "Brand");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Category",
                table: "Products",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsFeatured",
                table: "Products",
                column: "IsFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsNew",
                table: "Products",
                column: "IsNew");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ProductId",
                table: "Reviews",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId_ProductId",
                table: "Reviews",
                columns: new[] { "UserId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
