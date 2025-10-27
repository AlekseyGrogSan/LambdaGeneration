FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Копируем ТОЛЬКО файлы проектов сначала
COPY *.csproj .
RUN dotnet restore --disable-parallel

# Затем копируем весь код
COPY . .
RUN dotnet build -c Release --no-restore

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "run"]