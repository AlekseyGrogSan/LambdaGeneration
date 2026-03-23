FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8080
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# -------------------------------------------------------------------
# ЭТАП 1: СБОРКА (BUILD STAGE)
# -------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0-noble AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# 1. КОПИРУЕМ ВЕСЬ КОД БЭКЕНДА СРАЗУ
# Копируем локальную папку 'backend' в контейнер /src/backend.
COPY backend backend 

# 2. УСТАНАВЛИВАЕМ РАБОЧУЮ ДИРЕКТОРИЮ
# ЭТО КРИТИЧЕСКИЙ ШАГ: УКАЗЫВАЕТ НА ПАПКУ, ГДЕ ЛЕЖИТ ГЛАВНЫЙ .csproj
# Путь внутри контейнера: /src/backend/LambdaGeneration.API/LambdaGeneration.API
WORKDIR "/src/backend/LambdaGeneration.API/LambdaGeneration.API"

# 3. RESTORE (Находит все .csproj в текущей директории и поддиректориях)
RUN dotnet restore

# 4. BUILD
# Собирает главный проект LambdaGeneration.API.csproj в текущей WORKDIR
RUN dotnet build "LambdaGeneration.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# -------------------------------------------------------------------
# ЭТАП 2: ПУБЛИКАЦИЯ (PUBLISH STAGE)
# -------------------------------------------------------------------
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
# Путь к проекту уже находится в WORKDIR
RUN dotnet publish "LambdaGeneration.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# -------------------------------------------------------------------
# ЭТАП 3: ФИНАЛЬНЫЙ ОБРАЗ (FINAL IMAGE)
# -------------------------------------------------------------------
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Prepare writable upload directories for runtime user.
RUN mkdir -p /app/wwwroot/uploads /app/wwwroot/temp /app/wwwroot/articles_uploads \
	&& chown -R $APP_UID:0 /app/wwwroot \
	&& chmod -R g+rwX /app/wwwroot

USER $APP_UID
ENTRYPOINT ["dotnet", "LambdaGeneration.API.dll"]