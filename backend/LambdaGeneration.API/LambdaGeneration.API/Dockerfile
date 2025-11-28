FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# Этот этап используется для сборки проекта службы
FROM mcr.microsoft.com/dotnet/sdk:9.0-noble AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["LambdaGeneration.API/LambdaGeneration.API.csproj", "LambdaGeneration.API/"]
COPY ["LambdaGeneration.API.Application/LambdaGeneration.API.Application.csproj", "LambdaGeneration.API.Application/"]
COPY ["LambdaGeneration.API.Core/LambdaGeneration.API.Core.csproj", "LambdaGeneration.API.Core/"]
COPY ["LambdaGeneration.API.Date/LambdaGeneration.API.Date.csproj", "LambdaGeneration.API.Date/"]
COPY ["LambdaGeneration.API.Infrastructure/LambdaGeneration.API.Infrastructure.csproj", "LambdaGeneration.API.Infrastructure/"]
RUN dotnet restore "./LambdaGeneration.API/LambdaGeneration.API.csproj"
COPY . .
WORKDIR "/src/LambdaGeneration.API"
RUN dotnet build "./LambdaGeneration.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Этот этап используется для публикации проекта службы, который будет скопирован на последний этап
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./LambdaGeneration.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Этот этап используется в рабочей среде или при запуске из VS в обычном режиме (по умолчанию, когда конфигурация отладки не используется)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LambdaGeneration.API.dll"]