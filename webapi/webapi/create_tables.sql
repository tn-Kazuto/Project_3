-- ==============================================================
-- DATABASE CREATION & TABLES SCRIPT CHO COREDB (.NET 10 BACKEND)
-- ==============================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CoreDB')
BEGIN
    CREATE DATABASE CoreDB;
END
GO

USE CoreDB;
GO

-- 1. Roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL
);
GO

-- 2. Permissions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permissions')
CREATE TABLE Permissions (
    PermissionId INT IDENTITY(1,1) PRIMARY KEY,
    PermissionCode NVARCHAR(100) NOT NULL UNIQUE,
    PermissionName NVARCHAR(150) NOT NULL
);
GO

-- 3. RolePermissions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RolePermissions')
CREATE TABLE RolePermissions (
    RoleId INT NOT NULL,
    PermissionId INT NOT NULL,
    PRIMARY KEY (RoleId, PermissionId),
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId) ON DELETE CASCADE,
    FOREIGN KEY (PermissionId) REFERENCES Permissions(PermissionId) ON DELETE CASCADE
);
GO

-- 4. Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    Phone NVARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsLocked BIT NOT NULL DEFAULT 0,
    FailedLogins INT NOT NULL DEFAULT 0,
    LastLoginAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- 5. UserProfiles (1 - 1 with Users)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserProfiles')
CREATE TABLE UserProfiles (
    UserId INT PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Gender NVARCHAR(10) NULL,
    BirthDate DATETIME2 NULL,
    Address NVARCHAR(255) NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);
GO

-- 6. UserRoles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
CREATE TABLE UserRoles (
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    PRIMARY KEY (UserId, RoleId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId) ON DELETE CASCADE
);
GO

-- 7. UserSessions (Refresh Token & Session Tracker)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserSessions')
CREATE TABLE UserSessions (
    SessionId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Token NVARCHAR(500) NOT NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2 NOT NULL,
    IsRevoked BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);
GO

-- 8. LoginHistory
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LoginHistory')
CREATE TABLE LoginHistory (
    LoginId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Username NVARCHAR(100) NOT NULL,
    IsSuccess BIT NOT NULL,
    IpAddress NVARCHAR(50) NULL,
    LoginAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL
);
GO

-- 9. AuditLogs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
CREATE TABLE AuditLogs (
    LogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Action NVARCHAR(50) NOT NULL,
    TableName NVARCHAR(100) NOT NULL,
    RecordId NVARCHAR(100) NOT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL
);
GO

-- 10. ErrorLogs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ErrorLogs')
CREATE TABLE ErrorLogs (
    ErrorId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Source NVARCHAR(255) NULL,
    Message NVARCHAR(MAX) NOT NULL,
    StackTrace NVARCHAR(MAX) NULL,
    UserId INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL
);
GO

-- 11. Notifications
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
CREATE TABLE Notifications (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);
GO

-- 12. SystemSettings
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemSettings')
CREATE TABLE SystemSettings (
    SettingKey NVARCHAR(100) PRIMARY KEY,
    SettingValue NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(255) NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- 13. Statuses
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Statuses')
CREATE TABLE Statuses (
    StatusId INT IDENTITY(1,1) PRIMARY KEY,
    GroupCode NVARCHAR(50) NOT NULL,
    StatusCode NVARCHAR(50) NOT NULL,
    StatusName NVARCHAR(100) NOT NULL,
    CONSTRAINT UQ_Status_Group_Code UNIQUE (GroupCode, StatusCode)
);
GO

-- 14. Categories
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(150) NOT NULL,
    ParentId INT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    FOREIGN KEY (ParentId) REFERENCES Categories(CategoryId)
);
GO

-- 15. Provinces
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Provinces')
CREATE TABLE Provinces (
    ProvinceId INT IDENTITY(1,1) PRIMARY KEY,
    ProvinceName NVARCHAR(150) NOT NULL
);
GO

-- 16. Districts
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Districts')
CREATE TABLE Districts (
    DistrictId INT IDENTITY(1,1) PRIMARY KEY,
    DistrictName NVARCHAR(150) NOT NULL,
    ProvinceId INT NOT NULL,
    FOREIGN KEY (ProvinceId) REFERENCES Provinces(ProvinceId) ON DELETE CASCADE
);
GO

-- 17. Attachments
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Attachments')
CREATE TABLE Attachments (
    AttachmentId INT IDENTITY(1,1) PRIMARY KEY,
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    ContentType NVARCHAR(100) NOT NULL,
    FileSize BIGINT NOT NULL,
    EntityName NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
