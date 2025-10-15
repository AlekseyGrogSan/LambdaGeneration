FROM mcr.microsoft.com/dotnet/sdk:9.0 AS base
WORKDIR /app

# Копируем файл проекта (правильный путь)
COPY *.csproj .
RUN dotnet restore

# Копируем весь код
COPY . .
RUN dotnet build -c Release --no-restore

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "run"]