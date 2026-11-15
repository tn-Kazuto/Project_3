FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["services/media/JamesThew.MediaService.csproj", "services/media/"]
RUN dotnet restore "services/media/JamesThew.MediaService.csproj"

COPY shared/ shared/
COPY services/media/ services/media/
WORKDIR /src/services/media
RUN dotnet publish "JamesThew.MediaService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
USER app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5006
EXPOSE 5006
ENTRYPOINT ["dotnet", "JamesThew.MediaService.dll"]
