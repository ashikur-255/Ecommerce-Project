# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["EcommerceAPI.csproj", "./"]
RUN dotnet restore "EcommerceAPI.csproj"

# Copy everything else and build release
COPY . .
RUN dotnet publish "EcommerceAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create directory for persistent uploads
RUN mkdir -p /app/wwwroot/uploads

COPY --from=build /app/publish .

# Environment settings
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000
ENTRYPOINT ["dotnet", "EcommerceAPI.dll"]

