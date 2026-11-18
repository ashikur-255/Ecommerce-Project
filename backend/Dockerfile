# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY EcommerceAPI.csproj ./
RUN dotnet restore EcommerceAPI.csproj

# Copy the rest of the source code and publish
COPY . ./
RUN dotnet publish EcommerceAPI.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Ensure static upload directory exists
RUN mkdir -p /app/wwwroot/uploads/products

COPY --from=build /app/publish ./

# Default port for container (Program.cs also honors Render's PORT env var)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "EcommerceAPI.dll"]
