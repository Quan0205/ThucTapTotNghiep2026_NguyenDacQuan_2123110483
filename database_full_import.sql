IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Branches] (
        [Id] int NOT NULL IDENTITY,
        [BranchCode] nvarchar(20) NOT NULL,
        [BranchName] nvarchar(150) NOT NULL,
        [Address] nvarchar(250) NOT NULL,
        [Phone] nvarchar(20) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Branches] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Roles] (
        [Id] int NOT NULL IDENTITY,
        [RoleName] nvarchar(100) NOT NULL,
        [Description] nvarchar(250) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Shifts] (
        [Id] int NOT NULL IDENTITY,
        [ShiftCode] nvarchar(20) NOT NULL,
        [ShiftName] nvarchar(100) NOT NULL,
        [StartTime] time NOT NULL,
        [EndTime] time NOT NULL,
        [GraceMinutes] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Shifts] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Trainings] (
        [Id] int NOT NULL IDENTITY,
        [TrainingCode] nvarchar(20) NOT NULL,
        [TrainingName] nvarchar(150) NOT NULL,
        [Description] nvarchar(500) NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NULL,
        [Instructor] nvarchar(100) NULL,
        [IsRequired] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Trainings] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Recruitments] (
        [Id] int NOT NULL IDENTITY,
        [BranchId] int NULL,
        [PositionTitle] nvarchar(150) NOT NULL,
        [OpenDate] datetime2 NOT NULL,
        [CloseDate] datetime2 NULL,
        [Status] nvarchar(30) NOT NULL,
        [Description] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Recruitments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Recruitments_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Employees] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeCode] nvarchar(20) NOT NULL,
        [FullName] nvarchar(100) NOT NULL,
        [Gender] nvarchar(20) NOT NULL,
        [DateOfBirth] datetime2 NULL,
        [Phone] nvarchar(20) NULL,
        [Email] nvarchar(150) NULL,
        [Address] nvarchar(250) NULL,
        [BranchId] int NOT NULL,
        [RoleId] int NOT NULL,
        [HireDate] datetime2 NOT NULL DEFAULT (GETDATE()),
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Employees] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Employees_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Employees_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Candidates] (
        [Id] int NOT NULL IDENTITY,
        [RecruitmentId] int NOT NULL,
        [FullName] nvarchar(100) NOT NULL,
        [Phone] nvarchar(20) NULL,
        [Email] nvarchar(150) NULL,
        [AppliedDate] datetime2 NOT NULL DEFAULT (GETDATE()),
        [Status] nvarchar(30) NOT NULL,
        [InterviewScore] decimal(5,2) NULL,
        [Note] nvarchar(250) NULL,
        CONSTRAINT [PK_Candidates] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Candidates_Recruitments_RecruitmentId] FOREIGN KEY ([RecruitmentId]) REFERENCES [Recruitments] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [EmployeeContracts] (
        [Id] int NOT NULL IDENTITY,
        [ContractNo] nvarchar(30) NOT NULL,
        [ContractType] nvarchar(50) NOT NULL,
        [EmployeeId] int NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NULL,
        [BaseSalary] decimal(18,2) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_EmployeeContracts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_EmployeeContracts_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [EmployeeTrainings] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [TrainingId] int NOT NULL,
        [AssignedDate] datetime2 NOT NULL DEFAULT (GETDATE()),
        [CompletedDate] datetime2 NULL,
        [Status] nvarchar(30) NOT NULL,
        [Score] decimal(5,2) NULL,
        CONSTRAINT [PK_EmployeeTrainings] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_EmployeeTrainings_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_EmployeeTrainings_Trainings_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [Trainings] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [KPIs] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [KpiYear] int NOT NULL,
        [KpiMonth] int NOT NULL,
        [Score] decimal(5,2) NOT NULL,
        [Target] decimal(5,2) NOT NULL,
        [Result] nvarchar(100) NOT NULL,
        [Note] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_KPIs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_KPIs_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Payrolls] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [PayrollMonth] int NOT NULL,
        [PayrollYear] int NOT NULL,
        [BaseSalary] decimal(18,2) NOT NULL,
        [TotalAllowance] decimal(18,2) NOT NULL,
        [TotalPenalty] decimal(18,2) NOT NULL,
        [TotalSalary] decimal(18,2) NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [PaidDate] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Payrolls] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Payrolls_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Schedules] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [ShiftId] int NOT NULL,
        [ScheduleDate] date NOT NULL,
        [Note] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Schedules] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Schedules_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Schedules_Shifts_ShiftId] FOREIGN KEY ([ShiftId]) REFERENCES [Shifts] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [UserAccounts] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [RoleId] int NOT NULL,
        [Username] nvarchar(50) NOT NULL,
        [PasswordHash] nvarchar(250) NOT NULL,
        [IsActive] bit NOT NULL,
        [LastLoginAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_UserAccounts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserAccounts_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserAccounts_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Allowances] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [PayrollId] int NULL,
        [AllowanceType] nvarchar(100) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [EffectiveDate] datetime2 NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Allowances] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Allowances_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Allowances_Payrolls_PayrollId] FOREIGN KEY ([PayrollId]) REFERENCES [Payrolls] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [PayrollDetails] (
        [Id] int NOT NULL IDENTITY,
        [PayrollId] int NOT NULL,
        [DetailType] nvarchar(50) NOT NULL,
        [ReferenceType] nvarchar(50) NULL,
        [ReferenceId] int NULL,
        [Description] nvarchar(250) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_PayrollDetails] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_PayrollDetails_Payrolls_PayrollId] FOREIGN KEY ([PayrollId]) REFERENCES [Payrolls] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Penalties] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [PayrollId] int NULL,
        [PenaltyType] nvarchar(100) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Reason] nvarchar(250) NULL,
        [EffectiveDate] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Penalties] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Penalties_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Penalties_Payrolls_PayrollId] FOREIGN KEY ([PayrollId]) REFERENCES [Payrolls] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [Attendances] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [ShiftId] int NULL,
        [ScheduleId] int NULL,
        [AttendanceDate] date NOT NULL,
        [CheckInAt] datetime2 NULL,
        [CheckOutAt] datetime2 NULL,
        [LateMinutes] int NOT NULL,
        [WorkingMinutes] int NOT NULL,
        [Note] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Attendances] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Attendances_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Attendances_Schedules_ScheduleId] FOREIGN KEY ([ScheduleId]) REFERENCES [Schedules] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Attendances_Shifts_ShiftId] FOREIGN KEY ([ShiftId]) REFERENCES [Shifts] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE TABLE [AuditLogs] (
        [Id] int NOT NULL IDENTITY,
        [UserAccountId] int NULL,
        [Action] nvarchar(100) NOT NULL,
        [TableName] nvarchar(100) NOT NULL,
        [RecordId] nvarchar(50) NOT NULL,
        [OldValues] nvarchar(2000) NULL,
        [NewValues] nvarchar(2000) NULL,
        [IpAddress] nvarchar(50) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AuditLogs_UserAccounts_UserAccountId] FOREIGN KEY ([UserAccountId]) REFERENCES [UserAccounts] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Allowances_EmployeeId] ON [Allowances] ([EmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Allowances_PayrollId] ON [Allowances] ([PayrollId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Attendances_EmployeeId_AttendanceDate] ON [Attendances] ([EmployeeId], [AttendanceDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Attendances_ScheduleId] ON [Attendances] ([ScheduleId]) WHERE [ScheduleId] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Attendances_ShiftId] ON [Attendances] ([ShiftId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_UserAccountId] ON [AuditLogs] ([UserAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Branches_BranchCode] ON [Branches] ([BranchCode]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Candidates_RecruitmentId] ON [Candidates] ([RecruitmentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_EmployeeContracts_ContractNo] ON [EmployeeContracts] ([ContractNo]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_EmployeeContracts_EmployeeId] ON [EmployeeContracts] ([EmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Employees_BranchId] ON [Employees] ([BranchId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Employees_Email] ON [Employees] ([Email]) WHERE [Email] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Employees_EmployeeCode] ON [Employees] ([EmployeeCode]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Employees_RoleId] ON [Employees] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_EmployeeTrainings_EmployeeId_TrainingId] ON [EmployeeTrainings] ([EmployeeId], [TrainingId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_EmployeeTrainings_TrainingId] ON [EmployeeTrainings] ([TrainingId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_KPIs_EmployeeId_KpiMonth_KpiYear] ON [KPIs] ([EmployeeId], [KpiMonth], [KpiYear]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_PayrollDetails_PayrollId] ON [PayrollDetails] ([PayrollId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Payrolls_EmployeeId_PayrollMonth_PayrollYear] ON [Payrolls] ([EmployeeId], [PayrollMonth], [PayrollYear]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Penalties_EmployeeId] ON [Penalties] ([EmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Penalties_PayrollId] ON [Penalties] ([PayrollId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Recruitments_BranchId] ON [Recruitments] ([BranchId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_RoleName] ON [Roles] ([RoleName]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Schedules_EmployeeId_ScheduleDate] ON [Schedules] ([EmployeeId], [ScheduleDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Schedules_ShiftId] ON [Schedules] ([ShiftId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Shifts_ShiftCode] ON [Shifts] ([ShiftCode]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Trainings_TrainingCode] ON [Trainings] ([TrainingCode]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserAccounts_EmployeeId] ON [UserAccounts] ([EmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserAccounts_RoleId] ON [UserAccounts] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserAccounts_Username] ON [UserAccounts] ([Username]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319082211_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260319082211_InitialCreate', N'8.0.13');
END;
GO

COMMIT;
GO


BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DROP TABLE [Allowances];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DROP TABLE [Penalties];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DROP INDEX [IX_Schedules_ShiftId] ON [Schedules];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DROP INDEX [IX_EmployeeContracts_EmployeeId] ON [EmployeeContracts];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DROP INDEX [IX_Candidates_RecruitmentId] ON [Candidates];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PayrollDetails]') AND [c].[name] = N'ReferenceType');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [PayrollDetails] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [PayrollDetails] DROP COLUMN [ReferenceType];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    EXEC sp_rename N'[Payrolls].[TotalPenalty]', N'WorkingHours', N'COLUMN';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    EXEC sp_rename N'[Payrolls].[TotalAllowance]', N'PenaltyAmount', N'COLUMN';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    EXEC sp_rename N'[Payrolls].[BaseSalary]', N'OvertimeAmount', N'COLUMN';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    EXEC sp_rename N'[PayrollDetails].[ReferenceId]', N'SourceReferenceId', N'COLUMN';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[UserAccounts]') AND [c].[name] = N'IsActive');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [UserAccounts] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [UserAccounts] ADD DEFAULT CAST(1 AS bit) FOR [IsActive];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[UserAccounts]') AND [c].[name] = N'CreatedAt');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [UserAccounts] DROP CONSTRAINT [' + @var2 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [UserAccounts] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var3 sysname;
    SELECT @var3 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Trainings]') AND [c].[name] = N'IsRequired');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Trainings] DROP CONSTRAINT [' + @var3 + '];');
    ALTER TABLE [Trainings] ADD DEFAULT CAST(0 AS bit) FOR [IsRequired];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var4 sysname;
    SELECT @var4 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Trainings]') AND [c].[name] = N'IsActive');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Trainings] DROP CONSTRAINT [' + @var4 + '];');
    ALTER TABLE [Trainings] ADD DEFAULT CAST(1 AS bit) FOR [IsActive];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var5 sysname;
    SELECT @var5 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Trainings]') AND [c].[name] = N'CreatedAt');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Trainings] DROP CONSTRAINT [' + @var5 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Trainings] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var6 sysname;
    SELECT @var6 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Shifts]') AND [c].[name] = N'IsActive');
    IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [Shifts] DROP CONSTRAINT [' + @var6 + '];');
    ALTER TABLE [Shifts] ADD DEFAULT CAST(1 AS bit) FOR [IsActive];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var7 sysname;
    SELECT @var7 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Shifts]') AND [c].[name] = N'GraceMinutes');
    IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [Shifts] DROP CONSTRAINT [' + @var7 + '];');
    ALTER TABLE [Shifts] ADD DEFAULT 0 FOR [GraceMinutes];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var8 sysname;
    SELECT @var8 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Shifts]') AND [c].[name] = N'CreatedAt');
    IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [Shifts] DROP CONSTRAINT [' + @var8 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Shifts] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var9 sysname;
    SELECT @var9 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Schedules]') AND [c].[name] = N'CreatedAt');
    IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [Schedules] DROP CONSTRAINT [' + @var9 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Schedules] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var10 sysname;
    SELECT @var10 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Roles]') AND [c].[name] = N'IsActive');
    IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [Roles] DROP CONSTRAINT [' + @var10 + '];');
    ALTER TABLE [Roles] ADD DEFAULT CAST(1 AS bit) FOR [IsActive];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var11 sysname;
    SELECT @var11 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Roles]') AND [c].[name] = N'CreatedAt');
    IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [Roles] DROP CONSTRAINT [' + @var11 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Roles] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var12 sysname;
    SELECT @var12 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Recruitments]') AND [c].[name] = N'Status');
    IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [Recruitments] DROP CONSTRAINT [' + @var12 + '];');
    ALTER TABLE [Recruitments] ALTER COLUMN [Status] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var13 sysname;
    SELECT @var13 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Recruitments]') AND [c].[name] = N'CreatedAt');
    IF @var13 IS NOT NULL EXEC(N'ALTER TABLE [Recruitments] DROP CONSTRAINT [' + @var13 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Recruitments] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var14 sysname;
    SELECT @var14 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Payrolls]') AND [c].[name] = N'Status');
    IF @var14 IS NOT NULL EXEC(N'ALTER TABLE [Payrolls] DROP CONSTRAINT [' + @var14 + '];');
    ALTER TABLE [Payrolls] ALTER COLUMN [Status] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var15 sysname;
    SELECT @var15 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Payrolls]') AND [c].[name] = N'CreatedAt');
    IF @var15 IS NOT NULL EXEC(N'ALTER TABLE [Payrolls] DROP CONSTRAINT [' + @var15 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [AllowanceAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [BaseAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [BonusAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [EmployeeContractId] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [HourlyRate] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var16 sysname;
    SELECT @var16 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PayrollDetails]') AND [c].[name] = N'DetailType');
    IF @var16 IS NOT NULL EXEC(N'ALTER TABLE [PayrollDetails] DROP CONSTRAINT [' + @var16 + '];');
    ALTER TABLE [PayrollDetails] ALTER COLUMN [DetailType] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var17 sysname;
    SELECT @var17 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PayrollDetails]') AND [c].[name] = N'CreatedAt');
    IF @var17 IS NOT NULL EXEC(N'ALTER TABLE [PayrollDetails] DROP CONSTRAINT [' + @var17 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD [AttendanceId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD [Note] nvarchar(250) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD [ScheduleId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var18 sysname;
    SELECT @var18 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[KPIs]') AND [c].[name] = N'CreatedAt');
    IF @var18 IS NOT NULL EXEC(N'ALTER TABLE [KPIs] DROP CONSTRAINT [' + @var18 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [KPIs] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var19 sysname;
    SELECT @var19 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[EmployeeTrainings]') AND [c].[name] = N'Status');
    IF @var19 IS NOT NULL EXEC(N'ALTER TABLE [EmployeeTrainings] DROP CONSTRAINT [' + @var19 + '];');
    ALTER TABLE [EmployeeTrainings] ALTER COLUMN [Status] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var20 sysname;
    SELECT @var20 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[EmployeeTrainings]') AND [c].[name] = N'AssignedDate');
    IF @var20 IS NOT NULL EXEC(N'ALTER TABLE [EmployeeTrainings] DROP CONSTRAINT [' + @var20 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeTrainings] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeTrainings] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var21 sysname;
    SELECT @var21 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Employees]') AND [c].[name] = N'IsActive');
    IF @var21 IS NOT NULL EXEC(N'ALTER TABLE [Employees] DROP CONSTRAINT [' + @var21 + '];');
    ALTER TABLE [Employees] ADD DEFAULT CAST(1 AS bit) FOR [IsActive];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var22 sysname;
    SELECT @var22 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Employees]') AND [c].[name] = N'Gender');
    IF @var22 IS NOT NULL EXEC(N'ALTER TABLE [Employees] DROP CONSTRAINT [' + @var22 + '];');
    ALTER TABLE [Employees] ALTER COLUMN [Gender] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var23 sysname;
    SELECT @var23 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Employees]') AND [c].[name] = N'CreatedAt');
    IF @var23 IS NOT NULL EXEC(N'ALTER TABLE [Employees] DROP CONSTRAINT [' + @var23 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Employees] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var24 sysname;
    SELECT @var24 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[EmployeeContracts]') AND [c].[name] = N'IsActive');
    IF @var24 IS NOT NULL EXEC(N'ALTER TABLE [EmployeeContracts] DROP CONSTRAINT [' + @var24 + '];');
    ALTER TABLE [EmployeeContracts] ADD DEFAULT CAST(1 AS bit) FOR [IsActive];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var25 sysname;
    SELECT @var25 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[EmployeeContracts]') AND [c].[name] = N'CreatedAt');
    IF @var25 IS NOT NULL EXEC(N'ALTER TABLE [EmployeeContracts] DROP CONSTRAINT [' + @var25 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var26 sysname;
    SELECT @var26 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[EmployeeContracts]') AND [c].[name] = N'ContractType');
    IF @var26 IS NOT NULL EXEC(N'ALTER TABLE [EmployeeContracts] DROP CONSTRAINT [' + @var26 + '];');
    ALTER TABLE [EmployeeContracts] ALTER COLUMN [ContractType] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [EarlyLeavePenaltyPerMinute] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [HourlyRate] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [LatePenaltyPerMinute] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [OvertimeRateMultiplier] decimal(18,2) NOT NULL DEFAULT 1.5;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [StandardDailyHours] decimal(5,2) NOT NULL DEFAULT 8.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var27 sysname;
    SELECT @var27 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Candidates]') AND [c].[name] = N'Status');
    IF @var27 IS NOT NULL EXEC(N'ALTER TABLE [Candidates] DROP CONSTRAINT [' + @var27 + '];');
    ALTER TABLE [Candidates] ALTER COLUMN [Status] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var28 sysname;
    SELECT @var28 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Candidates]') AND [c].[name] = N'AppliedDate');
    IF @var28 IS NOT NULL EXEC(N'ALTER TABLE [Candidates] DROP CONSTRAINT [' + @var28 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Candidates] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Candidates] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var29 sysname;
    SELECT @var29 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Branches]') AND [c].[name] = N'IsActive');
    IF @var29 IS NOT NULL EXEC(N'ALTER TABLE [Branches] DROP CONSTRAINT [' + @var29 + '];');
    ALTER TABLE [Branches] ADD DEFAULT CAST(1 AS bit) FOR [IsActive];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var30 sysname;
    SELECT @var30 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Branches]') AND [c].[name] = N'CreatedAt');
    IF @var30 IS NOT NULL EXEC(N'ALTER TABLE [Branches] DROP CONSTRAINT [' + @var30 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Branches] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [AuditLogs] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var31 sysname;
    SELECT @var31 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Attendances]') AND [c].[name] = N'WorkingMinutes');
    IF @var31 IS NOT NULL EXEC(N'ALTER TABLE [Attendances] DROP CONSTRAINT [' + @var31 + '];');
    ALTER TABLE [Attendances] ADD DEFAULT 0 FOR [WorkingMinutes];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var32 sysname;
    SELECT @var32 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Attendances]') AND [c].[name] = N'LateMinutes');
    IF @var32 IS NOT NULL EXEC(N'ALTER TABLE [Attendances] DROP CONSTRAINT [' + @var32 + '];');
    ALTER TABLE [Attendances] ADD DEFAULT 0 FOR [LateMinutes];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    DECLARE @var33 sysname;
    SELECT @var33 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Attendances]') AND [c].[name] = N'CreatedAt');
    IF @var33 IS NOT NULL EXEC(N'ALTER TABLE [Attendances] DROP CONSTRAINT [' + @var33 + '];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Attendances] ADD [EarlyLeaveMinutes] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Attendances] ADD [OvertimeMinutes] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Attendances] ADD [Status] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Attendances] ADD [UpdatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_Schedules_ShiftId_ScheduleDate] ON [Schedules] ([ShiftId], [ScheduleDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_Recruitments_Status] ON [Recruitments] ([Status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_Payrolls_EmployeeContractId] ON [Payrolls] ([EmployeeContractId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_PayrollDetails_AttendanceId] ON [PayrollDetails] ([AttendanceId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_PayrollDetails_PayrollId_DetailType] ON [PayrollDetails] ([PayrollId], [DetailType]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_PayrollDetails_ScheduleId] ON [PayrollDetails] ([ScheduleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_EmployeeContracts_EmployeeId_IsActive] ON [EmployeeContracts] ([EmployeeId], [IsActive]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Candidates_RecruitmentId_Email] ON [Candidates] ([RecruitmentId], [Email]) WHERE [Email] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_TableName_RecordId] ON [AuditLogs] ([TableName], [RecordId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD CONSTRAINT [FK_PayrollDetails_Attendances_AttendanceId] FOREIGN KEY ([AttendanceId]) REFERENCES [Attendances] ([Id]) ON DELETE SET NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD CONSTRAINT [FK_PayrollDetails_Schedules_ScheduleId] FOREIGN KEY ([ScheduleId]) REFERENCES [Schedules] ([Id]) ON DELETE SET NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    ALTER TABLE [Payrolls] ADD CONSTRAINT [FK_Payrolls_EmployeeContracts_EmployeeContractId] FOREIGN KEY ([EmployeeContractId]) REFERENCES [EmployeeContracts] ([Id]) ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319085553_RefactorHrm'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260319085553_RefactorHrm', N'8.0.13');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [UserAccounts] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [UserAccounts] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [UserAccounts] ADD [SystemRoleId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Trainings] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Trainings] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Shifts] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Shifts] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Schedules] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Schedules] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Roles] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Roles] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Recruitments] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Recruitments] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [PayrollDetails] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [KPIs] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [KPIs] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [EmployeeTrainings] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [EmployeeTrainings] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Employees] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Employees] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [EmployeeContracts] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Candidates] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Candidates] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Branches] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Branches] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [AuditLogs] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [AuditLogs] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Attendances] ADD [DeletedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [Attendances] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE TABLE [Permissions] (
        [Id] int NOT NULL IDENTITY,
        [Code] nvarchar(80) NOT NULL,
        [Name] nvarchar(120) NOT NULL,
        [Description] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_Permissions] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] int NOT NULL IDENTITY,
        [UserAccountId] int NOT NULL,
        [TokenHash] nvarchar(128) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [RevokedAt] datetime2 NULL,
        [ReplacedByTokenHash] nvarchar(max) NULL,
        [CreatedByIp] nvarchar(50) NULL,
        [RevokedByIp] nvarchar(50) NULL,
        [IsUsed] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_UserAccounts_UserAccountId] FOREIGN KEY ([UserAccountId]) REFERENCES [UserAccounts] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE TABLE [SystemRoles] (
        [Id] int NOT NULL IDENTITY,
        [Code] nvarchar(50) NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(250) NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_SystemRoles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE TABLE [SystemRolePermissions] (
        [SystemRoleId] int NOT NULL,
        [PermissionId] int NOT NULL,
        CONSTRAINT [PK_SystemRolePermissions] PRIMARY KEY ([SystemRoleId], [PermissionId]),
        CONSTRAINT [FK_SystemRolePermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [Permissions] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_SystemRolePermissions_SystemRoles_SystemRoleId] FOREIGN KEY ([SystemRoleId]) REFERENCES [SystemRoles] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE INDEX [IX_UserAccounts_SystemRoleId] ON [UserAccounts] ([SystemRoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Permissions_Code] ON [Permissions] ([Code]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_TokenHash] ON [RefreshTokens] ([TokenHash]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserAccountId_ExpiresAt] ON [RefreshTokens] ([UserAccountId], [ExpiresAt]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE INDEX [IX_SystemRolePermissions_PermissionId] ON [SystemRolePermissions] ([PermissionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SystemRoles_Code] ON [SystemRoles] ([Code]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SystemRoles_Name] ON [SystemRoles] ([Name]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    ALTER TABLE [UserAccounts] ADD CONSTRAINT [FK_UserAccounts_SystemRoles_SystemRoleId] FOREIGN KEY ([SystemRoleId]) REFERENCES [SystemRoles] ([Id]) ON DELETE SET NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409070623_AddSecuritySoftDelete'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260409070623_AddSecuritySoftDelete', N'8.0.13');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [ApprovedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [ApprovedByUserAccountId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [ClosedAt] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [ClosedByUserAccountId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [InsuranceAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [IsClosed] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [Note] nvarchar(250) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD [TaxAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE TABLE [AttendanceAdjustments] (
        [Id] int NOT NULL IDENTITY,
        [AttendanceId] int NOT NULL,
        [EmployeeId] int NOT NULL,
        [RequestedCheckInAt] datetime2 NULL,
        [RequestedCheckOutAt] datetime2 NULL,
        [RequestedStatus] int NULL,
        [Reason] nvarchar(500) NULL,
        [Status] int NOT NULL,
        [ReviewedByUserAccountId] int NULL,
        [ReviewedAt] datetime2 NULL,
        [DecisionNote] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_AttendanceAdjustments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AttendanceAdjustments_Attendances_AttendanceId] FOREIGN KEY ([AttendanceId]) REFERENCES [Attendances] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AttendanceAdjustments_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AttendanceAdjustments_UserAccounts_ReviewedByUserAccountId] FOREIGN KEY ([ReviewedByUserAccountId]) REFERENCES [UserAccounts] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE TABLE [LeaveRequests] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [StartDate] date NOT NULL,
        [EndDate] date NOT NULL,
        [LeaveType] nvarchar(50) NOT NULL,
        [Reason] nvarchar(500) NULL,
        [TotalDays] decimal(5,2) NOT NULL,
        [Status] int NOT NULL,
        [ReviewedByUserAccountId] int NULL,
        [ReviewedAt] datetime2 NULL,
        [DecisionNote] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_LeaveRequests] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LeaveRequests_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_LeaveRequests_UserAccounts_ReviewedByUserAccountId] FOREIGN KEY ([ReviewedByUserAccountId]) REFERENCES [UserAccounts] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE TABLE [PayrollClosePeriods] (
        [Id] int NOT NULL IDENTITY,
        [PayrollMonth] int NOT NULL,
        [PayrollYear] int NOT NULL,
        [IsClosed] bit NOT NULL,
        [ClosedAt] datetime2 NULL,
        [ClosedByUserAccountId] int NULL,
        [Note] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_PayrollClosePeriods] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_PayrollClosePeriods_UserAccounts_ClosedByUserAccountId] FOREIGN KEY ([ClosedByUserAccountId]) REFERENCES [UserAccounts] ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE TABLE [ShiftSwapRequests] (
        [Id] int NOT NULL IDENTITY,
        [RequestEmployeeId] int NOT NULL,
        [TargetEmployeeId] int NOT NULL,
        [RequestScheduleId] int NOT NULL,
        [TargetScheduleId] int NOT NULL,
        [Reason] nvarchar(500) NULL,
        [Status] int NOT NULL,
        [ReviewedByUserAccountId] int NULL,
        [ReviewedAt] datetime2 NULL,
        [DecisionNote] nvarchar(250) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_ShiftSwapRequests] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ShiftSwapRequests_Employees_RequestEmployeeId] FOREIGN KEY ([RequestEmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ShiftSwapRequests_Employees_TargetEmployeeId] FOREIGN KEY ([TargetEmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ShiftSwapRequests_Schedules_RequestScheduleId] FOREIGN KEY ([RequestScheduleId]) REFERENCES [Schedules] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ShiftSwapRequests_Schedules_TargetScheduleId] FOREIGN KEY ([TargetScheduleId]) REFERENCES [Schedules] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ShiftSwapRequests_UserAccounts_ReviewedByUserAccountId] FOREIGN KEY ([ReviewedByUserAccountId]) REFERENCES [UserAccounts] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_Payrolls_ApprovedByUserAccountId] ON [Payrolls] ([ApprovedByUserAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_Payrolls_ClosedByUserAccountId] ON [Payrolls] ([ClosedByUserAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_Payrolls_PayrollMonth_PayrollYear_IsClosed] ON [Payrolls] ([PayrollMonth], [PayrollYear], [IsClosed]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_AttendanceAdjustments_AttendanceId_Status] ON [AttendanceAdjustments] ([AttendanceId], [Status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_AttendanceAdjustments_EmployeeId] ON [AttendanceAdjustments] ([EmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_AttendanceAdjustments_ReviewedByUserAccountId] ON [AttendanceAdjustments] ([ReviewedByUserAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_LeaveRequests_EmployeeId_StartDate_EndDate] ON [LeaveRequests] ([EmployeeId], [StartDate], [EndDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_LeaveRequests_ReviewedByUserAccountId] ON [LeaveRequests] ([ReviewedByUserAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_PayrollClosePeriods_ClosedByUserAccountId] ON [PayrollClosePeriods] ([ClosedByUserAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PayrollClosePeriods_PayrollMonth_PayrollYear] ON [PayrollClosePeriods] ([PayrollMonth], [PayrollYear]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_ShiftSwapRequests_RequestEmployeeId] ON [ShiftSwapRequests] ([RequestEmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_ShiftSwapRequests_RequestScheduleId_TargetScheduleId] ON [ShiftSwapRequests] ([RequestScheduleId], [TargetScheduleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_ShiftSwapRequests_ReviewedByUserAccountId] ON [ShiftSwapRequests] ([ReviewedByUserAccountId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_ShiftSwapRequests_TargetEmployeeId] ON [ShiftSwapRequests] ([TargetEmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    CREATE INDEX [IX_ShiftSwapRequests_TargetScheduleId] ON [ShiftSwapRequests] ([TargetScheduleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD CONSTRAINT [FK_Payrolls_UserAccounts_ApprovedByUserAccountId] FOREIGN KEY ([ApprovedByUserAccountId]) REFERENCES [UserAccounts] ([Id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    ALTER TABLE [Payrolls] ADD CONSTRAINT [FK_Payrolls_UserAccounts_ClosedByUserAccountId] FOREIGN KEY ([ClosedByUserAccountId]) REFERENCES [UserAccounts] ([Id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260409080846_AddAdvancedHrmWorkflow'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260409080846_AddAdvancedHrmWorkflow', N'8.0.13');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260416095230_AddShiftOpenSlots'
)
BEGIN
    ALTER TABLE [Schedules] ADD [OpenShiftSlotId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260416095230_AddShiftOpenSlots'
)
BEGIN
    CREATE TABLE [ShiftOpenSlots] (
        [Id] int NOT NULL IDENTITY,
        [BranchId] int NOT NULL,
        [ShiftId] int NOT NULL,
        [SlotDate] date NOT NULL,
        [Capacity] int NOT NULL DEFAULT 1,
        [Note] nvarchar(250) NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        CONSTRAINT [PK_ShiftOpenSlots] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ShiftOpenSlots_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ShiftOpenSlots_Shifts_ShiftId] FOREIGN KEY ([ShiftId]) REFERENCES [Shifts] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260416095230_AddShiftOpenSlots'
)
BEGIN
    CREATE INDEX [IX_Schedules_OpenShiftSlotId] ON [Schedules] ([OpenShiftSlotId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260416095230_AddShiftOpenSlots'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ShiftOpenSlots_BranchId_ShiftId_SlotDate] ON [ShiftOpenSlots] ([BranchId], [ShiftId], [SlotDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260416095230_AddShiftOpenSlots'
)
BEGIN
    CREATE INDEX [IX_ShiftOpenSlots_ShiftId] ON [ShiftOpenSlots] ([ShiftId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260416095230_AddShiftOpenSlots'
)
BEGIN
    ALTER TABLE [Schedules] ADD CONSTRAINT [FK_Schedules_ShiftOpenSlots_OpenShiftSlotId] FOREIGN KEY ([OpenShiftSlotId]) REFERENCES [ShiftOpenSlots] ([Id]) ON DELETE SET NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260416095230_AddShiftOpenSlots'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260416095230_AddShiftOpenSlots', N'8.0.13');
END;
GO

COMMIT;
GO

/* -------------------------------------------------------------------------
   CoffeeHRM demo data for hosting import
   - Safe to run more than once: rows are matched by natural keys.
   - Default demo accounts:
     admin/admin123, hr/hr123, manager/manager123, accountant/accountant123,
     employee/employee123, employee2/employee123, lead/lead123,
     barista/barista123.
   ------------------------------------------------------------------------- */

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @now datetime2 = SYSUTCDATETIME();
    DECLARE @today date = CONVERT(date, GETDATE());
    DECLARE @month int = MONTH(@today);
    DECLARE @year int = YEAR(@today);

    DECLARE @PermissionSeeds TABLE
    (
        Code nvarchar(80) NOT NULL PRIMARY KEY,
        Name nvarchar(120) NOT NULL,
        Description nvarchar(250) NULL
    );

    INSERT INTO @PermissionSeeds (Code, Name, Description)
    VALUES
        (N'dashboard.view', N'View dashboard', N'Access overview dashboard and quick metrics.'),
        (N'master.branches.manage', N'Manage branches', N'Create, update and disable company branches.'),
        (N'master.positions.manage', N'Manage positions', N'Manage business job roles and positions.'),
        (N'master.shifts.manage', N'Manage shifts', N'Manage working shifts and grace minutes.'),
        (N'hr.employees.manage', N'Manage employees', N'Create and update employee profiles.'),
        (N'hr.contracts.manage', N'Manage contracts', N'Manage labor contracts and salary settings.'),
        (N'security.accounts.manage', N'Manage accounts', N'Manage application user accounts.'),
        (N'ops.schedules.manage', N'Manage schedules', N'Create and review work schedules.'),
        (N'ops.attendance.manage', N'Manage attendance', N'Check attendance and working time.'),
        (N'payroll.manage', N'Manage payroll', N'Generate, approve and close payroll.'),
        (N'recruitment.manage', N'Manage recruitment', N'Manage job openings and candidates.'),
        (N'training.manage', N'Manage training', N'Manage training courses and results.'),
        (N'kpi.manage', N'Manage KPI', N'Manage monthly employee KPI records.'),
        (N'audit.view', N'View audit log', N'View system activity logs.'),
        (N'self.attendance', N'Self attendance', N'Employee self check-in and check-out.'),
        (N'self.payroll.view', N'View own payroll', N'Employee payroll self-service.'),
        (N'self.shift.view', N'View open shifts', N'Employee view for open shifts.'),
        (N'self.shift.select', N'Select open shifts', N'Employee registers for open shifts.'),
        (N'profile.view', N'View profile', N'View current account profile.'),
        (N'leave.manage', N'Manage leave', N'Create and approve leave requests.'),
        (N'shift.swap.manage', N'Manage shift swaps', N'Create and approve shift swap requests.'),
        (N'attendance.adjust.manage', N'Manage attendance adjustments', N'Create and approve attendance correction requests.'),
        (N'reports.view', N'View reports', N'View business reports.'),
        (N'reports.export', N'Export reports', N'Export report data.'),
        (N'operations.manage', N'Manage operations', N'Close payroll periods and run operation tasks.');

    INSERT INTO [Permissions] ([Code], [Name], [Description], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT s.Code, s.Name, s.Description, @now, @now, 0
    FROM @PermissionSeeds s
    WHERE NOT EXISTS (SELECT 1 FROM [Permissions] p WHERE p.[Code] = s.Code);

    UPDATE p
    SET p.[Name] = s.[Name],
        p.[Description] = s.[Description],
        p.[UpdatedAt] = @now,
        p.[IsDeleted] = 0,
        p.[DeletedAt] = NULL
    FROM [Permissions] p
    INNER JOIN @PermissionSeeds s ON s.Code = p.Code;

    DECLARE @SystemRoleSeeds TABLE
    (
        Code nvarchar(50) NOT NULL PRIMARY KEY,
        Name nvarchar(100) NOT NULL,
        Description nvarchar(250) NULL
    );

    INSERT INTO @SystemRoleSeeds (Code, Name, Description)
    VALUES
        (N'ADMIN', N'Administrator', N'Full system permission.'),
        (N'HR', N'HR Manager', N'Human resource and payroll management.'),
        (N'MANAGER', N'Store Manager', N'Branch operation management.'),
        (N'EMPLOYEE', N'Employee', N'Employee self-service permission.');

    INSERT INTO [SystemRoles] ([Code], [Name], [Description], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT s.Code, s.Name, s.Description, 1, @now, @now, 0
    FROM @SystemRoleSeeds s
    WHERE NOT EXISTS (SELECT 1 FROM [SystemRoles] sr WHERE sr.[Code] = s.Code);

    UPDATE sr
    SET sr.[Name] = s.[Name],
        sr.[Description] = s.[Description],
        sr.[IsActive] = 1,
        sr.[UpdatedAt] = @now,
        sr.[IsDeleted] = 0,
        sr.[DeletedAt] = NULL
    FROM [SystemRoles] sr
    INNER JOIN @SystemRoleSeeds s ON s.Code = sr.Code;

    DECLARE @RolePermissionSeeds TABLE (RoleCode nvarchar(50) NOT NULL, PermissionCode nvarchar(80) NOT NULL);
    INSERT INTO @RolePermissionSeeds (RoleCode, PermissionCode)
    SELECT N'ADMIN', Code FROM @PermissionSeeds;

    INSERT INTO @RolePermissionSeeds (RoleCode, PermissionCode)
    VALUES
        (N'HR', N'dashboard.view'), (N'HR', N'master.branches.manage'), (N'HR', N'master.positions.manage'),
        (N'HR', N'master.shifts.manage'), (N'HR', N'hr.employees.manage'), (N'HR', N'hr.contracts.manage'),
        (N'HR', N'security.accounts.manage'), (N'HR', N'ops.schedules.manage'), (N'HR', N'ops.attendance.manage'),
        (N'HR', N'payroll.manage'), (N'HR', N'recruitment.manage'), (N'HR', N'training.manage'),
        (N'HR', N'kpi.manage'), (N'HR', N'audit.view'), (N'HR', N'profile.view'),
        (N'HR', N'leave.manage'), (N'HR', N'shift.swap.manage'), (N'HR', N'attendance.adjust.manage'),
        (N'HR', N'reports.view'), (N'HR', N'reports.export'), (N'HR', N'operations.manage'),
        (N'MANAGER', N'dashboard.view'), (N'MANAGER', N'ops.schedules.manage'), (N'MANAGER', N'ops.attendance.manage'),
        (N'MANAGER', N'payroll.manage'), (N'MANAGER', N'self.payroll.view'), (N'MANAGER', N'self.attendance'),
        (N'MANAGER', N'profile.view'), (N'MANAGER', N'leave.manage'), (N'MANAGER', N'shift.swap.manage'),
        (N'MANAGER', N'attendance.adjust.manage'), (N'MANAGER', N'reports.view'),
        (N'EMPLOYEE', N'dashboard.view'), (N'EMPLOYEE', N'self.attendance'), (N'EMPLOYEE', N'self.payroll.view'),
        (N'EMPLOYEE', N'self.shift.view'), (N'EMPLOYEE', N'self.shift.select'), (N'EMPLOYEE', N'profile.view'),
        (N'EMPLOYEE', N'ops.schedules.manage'), (N'EMPLOYEE', N'hr.employees.manage'),
        (N'EMPLOYEE', N'leave.manage'), (N'EMPLOYEE', N'shift.swap.manage'), (N'EMPLOYEE', N'attendance.adjust.manage');

    INSERT INTO [SystemRolePermissions] ([SystemRoleId], [PermissionId])
    SELECT sr.Id, p.Id
    FROM @RolePermissionSeeds rps
    INNER JOIN [SystemRoles] sr ON sr.Code = rps.RoleCode
    INNER JOIN [Permissions] p ON p.Code = rps.PermissionCode
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM [SystemRolePermissions] existing
        WHERE existing.SystemRoleId = sr.Id AND existing.PermissionId = p.Id
    );

    DECLARE @BranchSeeds TABLE
    (
        BranchCode nvarchar(20) NOT NULL PRIMARY KEY,
        BranchName nvarchar(150) NOT NULL,
        Address nvarchar(250) NOT NULL,
        Phone nvarchar(20) NULL
    );

    INSERT INTO @BranchSeeds (BranchCode, BranchName, Address, Phone)
    VALUES
        (N'BR-HEAD', N'Head Office', N'12 Nguyen Van Bao, Go Vap, HCMC', N'0280000001'),
        (N'BR-HRM', N'CoffeeHRM HR Office', N'86 Nguyen Thai Son, Go Vap, HCMC', N'0280000002'),
        (N'BR-STORE', N'CoffeeHRM District 1 Store', N'45 Le Loi, District 1, HCMC', N'0280000003'),
        (N'BR-D2', N'CoffeeHRM Thu Duc Store', N'21 Vo Van Ngan, Thu Duc, HCMC', N'0280000004'),
        (N'BR-TD', N'CoffeeHRM Tan Dinh Store', N'78 Hai Ba Trung, District 3, HCMC', N'0280000005'),
        (N'BR-GV', N'CoffeeHRM Go Vap Store', N'120 Phan Van Tri, Go Vap, HCMC', N'0280000006');

    INSERT INTO [Branches] ([BranchCode], [BranchName], [Address], [Phone], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT s.BranchCode, s.BranchName, s.Address, s.Phone, 1, @now, @now, 0
    FROM @BranchSeeds s
    WHERE NOT EXISTS (SELECT 1 FROM [Branches] b WHERE b.BranchCode = s.BranchCode);

    UPDATE b
    SET b.BranchName = s.BranchName,
        b.Address = s.Address,
        b.Phone = s.Phone,
        b.IsActive = 1,
        b.UpdatedAt = @now,
        b.IsDeleted = 0,
        b.DeletedAt = NULL
    FROM [Branches] b
    INNER JOIN @BranchSeeds s ON s.BranchCode = b.BranchCode;

    DECLARE @BusinessRoleSeeds TABLE
    (
        RoleName nvarchar(100) NOT NULL PRIMARY KEY,
        Description nvarchar(250) NULL
    );

    INSERT INTO @BusinessRoleSeeds (RoleName, Description)
    VALUES
        (N'System Admin', N'Default administrator role.'),
        (N'HR Specialist', N'Manages employee profiles and HR workflows.'),
        (N'Department Manager', N'Reviews store operations and schedules.'),
        (N'Accountant', N'Reviews payroll periods and salary reports.'),
        (N'Sales Staff', N'Frontline sales and customer service staff.'),
        (N'Shift Lead', N'Coordinates daily shift operations.'),
        (N'Barista', N'Prepares drinks and supports store service.'),
        (N'Cashier', N'Handles cashier and order processing.'),
        (N'Recruiter', N'Manages job openings and candidate pipeline.'),
        (N'Trainer', N'Manages onboarding and internal training.');

    INSERT INTO [Roles] ([RoleName], [Description], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT s.RoleName, s.Description, 1, @now, @now, 0
    FROM @BusinessRoleSeeds s
    WHERE NOT EXISTS (SELECT 1 FROM [Roles] r WHERE r.RoleName = s.RoleName);

    UPDATE r
    SET r.Description = s.Description,
        r.IsActive = 1,
        r.UpdatedAt = @now,
        r.IsDeleted = 0,
        r.DeletedAt = NULL
    FROM [Roles] r
    INNER JOIN @BusinessRoleSeeds s ON s.RoleName = r.RoleName;

    DECLARE @ShiftSeeds TABLE
    (
        ShiftCode nvarchar(20) NOT NULL PRIMARY KEY,
        ShiftName nvarchar(100) NOT NULL,
        StartTime time NOT NULL,
        EndTime time NOT NULL,
        GraceMinutes int NOT NULL
    );

    INSERT INTO @ShiftSeeds (ShiftCode, ShiftName, StartTime, EndTime, GraceMinutes)
    VALUES
        (N'MORNING', N'Morning Shift', '08:00:00', '16:00:00', 10),
        (N'AFTERNOON', N'Afternoon Shift', '13:00:00', '21:00:00', 10),
        (N'OPEN', N'Opening Shift', '06:30:00', '14:30:00', 5),
        (N'CLOSE', N'Closing Shift', '14:00:00', '22:00:00', 10);

    INSERT INTO [Shifts] ([ShiftCode], [ShiftName], [StartTime], [EndTime], [GraceMinutes], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT s.ShiftCode, s.ShiftName, s.StartTime, s.EndTime, s.GraceMinutes, 1, @now, @now, 0
    FROM @ShiftSeeds s
    WHERE NOT EXISTS (SELECT 1 FROM [Shifts] sh WHERE sh.ShiftCode = s.ShiftCode);

    UPDATE sh
    SET sh.ShiftName = s.ShiftName,
        sh.StartTime = s.StartTime,
        sh.EndTime = s.EndTime,
        sh.GraceMinutes = s.GraceMinutes,
        sh.IsActive = 1,
        sh.UpdatedAt = @now,
        sh.IsDeleted = 0,
        sh.DeletedAt = NULL
    FROM [Shifts] sh
    INNER JOIN @ShiftSeeds s ON s.ShiftCode = sh.ShiftCode;

    DECLARE @EmployeeSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL PRIMARY KEY,
        FullName nvarchar(100) NOT NULL,
        Gender int NOT NULL,
        DateOfBirth date NULL,
        Phone nvarchar(20) NULL,
        Email nvarchar(150) NULL,
        Address nvarchar(250) NULL,
        BranchCode nvarchar(20) NOT NULL,
        RoleName nvarchar(100) NOT NULL,
        HireDate date NOT NULL
    );

    INSERT INTO @EmployeeSeeds (EmployeeCode, FullName, Gender, DateOfBirth, Phone, Email, Address, BranchCode, RoleName, HireDate)
    VALUES
        (N'EMP-ADMIN', N'System Administrator', 3, '1995-01-01', N'0900000000', N'admin.demo@coffeehrm.local', N'Head Office', N'BR-HEAD', N'System Admin', '2026-01-01'),
        (N'EMP-HR001', N'Nguyen Thi HR', 2, '1996-04-12', N'0901000001', N'hr.demo@coffeehrm.local', N'Go Vap, HCMC', N'BR-HRM', N'HR Specialist', '2026-01-02'),
        (N'EMP-MGR001', N'Tran Van Manager', 1, '1992-08-20', N'0901000002', N'manager.demo@coffeehrm.local', N'District 1, HCMC', N'BR-STORE', N'Department Manager', '2026-01-02'),
        (N'EMP-ACC001', N'Le Thi Accountant', 2, '1994-03-15', N'0901000003', N'accountant.demo@coffeehrm.local', N'Binh Thanh, HCMC', N'BR-HRM', N'Accountant', '2026-01-02'),
        (N'EMP-NV001', N'Pham Van Employee', 1, '1999-11-09', N'0901000004', N'employee.demo@coffeehrm.local', N'District 1, HCMC', N'BR-STORE', N'Sales Staff', '2026-01-02'),
        (N'EMP-NV002', N'Do Thi Employee', 2, '2000-05-18', N'0901000005', N'employee2.demo@coffeehrm.local', N'District 1, HCMC', N'BR-STORE', N'Sales Staff', '2026-01-02'),
        (N'EMP-LEAD001', N'Vo Minh Lead', 1, '1997-07-11', N'0901000006', N'lead.demo@coffeehrm.local', N'Thu Duc, HCMC', N'BR-D2', N'Shift Lead', '2026-01-10'),
        (N'EMP-BAR001', N'Hoang Anh Barista', 1, '2001-02-22', N'0901000007', N'barista.demo@coffeehrm.local', N'Thu Duc, HCMC', N'BR-D2', N'Barista', '2026-01-12'),
        (N'EMP-BAR002', N'Mai Linh Barista', 2, '2002-09-04', N'0901000008', N'barista2.demo@coffeehrm.local', N'Tan Dinh, HCMC', N'BR-TD', N'Barista', '2026-01-12'),
        (N'EMP-CASH001', N'Bui Quang Cashier', 1, '2000-12-30', N'0901000009', N'cashier.demo@coffeehrm.local', N'Go Vap, HCMC', N'BR-GV', N'Cashier', '2026-01-15'),
        (N'EMP-CASH002', N'Pham Thu Cashier', 2, '1998-06-14', N'0901000010', N'cashier2.demo@coffeehrm.local', N'District 3, HCMC', N'BR-TD', N'Cashier', '2026-01-15'),
        (N'EMP-REC001', N'Dang Khoa Recruiter', 1, '1993-10-05', N'0901000011', N'recruiter.demo@coffeehrm.local', N'Go Vap, HCMC', N'BR-HRM', N'Recruiter', '2026-01-20'),
        (N'EMP-TRAIN001', N'Trinh My Trainer', 2, '1991-01-26', N'0901000012', N'trainer.demo@coffeehrm.local', N'Binh Thanh, HCMC', N'BR-HRM', N'Trainer', '2026-01-20'),
        (N'EMP-INT001', N'Nguyen Bao Intern', 1, '2004-04-03', N'0901000013', N'intern.demo@coffeehrm.local', N'Thu Duc, HCMC', N'BR-D2', N'Sales Staff', '2026-02-01'),
        (N'EMP-PT001', N'Lam Nhi Parttime', 2, '2003-08-08', N'0901000014', N'parttime.demo@coffeehrm.local', N'Go Vap, HCMC', N'BR-GV', N'Sales Staff', '2026-02-01');

    INSERT INTO [Employees] ([EmployeeCode], [FullName], [Gender], [DateOfBirth], [Phone], [Email], [Address], [BranchId], [RoleId], [HireDate], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT e.EmployeeCode, e.FullName, e.Gender, e.DateOfBirth, e.Phone, e.Email, e.Address, b.Id, r.Id, e.HireDate, 1, @now, @now, 0
    FROM @EmployeeSeeds e
    INNER JOIN [Branches] b ON b.BranchCode = e.BranchCode
    INNER JOIN [Roles] r ON r.RoleName = e.RoleName
    WHERE NOT EXISTS (SELECT 1 FROM [Employees] existing WHERE existing.EmployeeCode = e.EmployeeCode);

    UPDATE emp
    SET emp.FullName = e.FullName,
        emp.Gender = e.Gender,
        emp.DateOfBirth = e.DateOfBirth,
        emp.Phone = e.Phone,
        emp.Email = e.Email,
        emp.Address = e.Address,
        emp.BranchId = b.Id,
        emp.RoleId = r.Id,
        emp.IsActive = 1,
        emp.UpdatedAt = @now,
        emp.IsDeleted = 0,
        emp.DeletedAt = NULL
    FROM [Employees] emp
    INNER JOIN @EmployeeSeeds e ON e.EmployeeCode = emp.EmployeeCode
    INNER JOIN [Branches] b ON b.BranchCode = e.BranchCode
    INNER JOIN [Roles] r ON r.RoleName = e.RoleName;

    DECLARE @AccountSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL,
        Username nvarchar(50) NOT NULL PRIMARY KEY,
        PasswordHash nvarchar(250) NOT NULL,
        SystemRoleCode nvarchar(50) NOT NULL
    );

    INSERT INTO @AccountSeeds (EmployeeCode, Username, PasswordHash, SystemRoleCode)
    VALUES
        (N'EMP-ADMIN', N'admin', N'5uPlMZYrlVPl9tulqUTjwoHAUb1ZbuG2ci/o2xnbEpU=', N'ADMIN'),
        (N'EMP-HR001', N'hr', N'uWKmEYh734nevWwLZ8xiSKfkphtxm5ZUiPSjarCSJ1k=', N'HR'),
        (N'EMP-MGR001', N'manager', N'feVJ0gcuxBPkoiV+fwpeA/DOtHRUvqULhquO0mUrE1M=', N'MANAGER'),
        (N'EMP-ACC001', N'accountant', N'hLhVPbKe67E444UOfEajlpHb5zjhLJZO4QOn2Kkng8M=', N'HR'),
        (N'EMP-NV001', N'employee', N'RG8iB1lxFZu3dsvNifRUILKWb8LBS4Zd02eIJ7Xrnzw=', N'EMPLOYEE'),
        (N'EMP-NV002', N'employee2', N'RG8iB1lxFZu3dsvNifRUILKWb8LBS4Zd02eIJ7Xrnzw=', N'EMPLOYEE'),
        (N'EMP-LEAD001', N'lead', N'j5B26MDKYkZVcaa+TcNrMPBSW/aCpIWOpLY76WwWvvM=', N'MANAGER'),
        (N'EMP-BAR001', N'barista', N'Ay4s+bY/ztnaNJB9HzuN8TxokQrQOOd78SncXeaif6U=', N'EMPLOYEE');

    INSERT INTO [UserAccounts] ([EmployeeId], [RoleId], [SystemRoleId], [Username], [PasswordHash], [IsActive], [LastLoginAt], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT emp.Id, emp.RoleId, sr.Id, a.Username, a.PasswordHash, 1, NULL, @now, @now, 0
    FROM @AccountSeeds a
    INNER JOIN [Employees] emp ON emp.EmployeeCode = a.EmployeeCode
    INNER JOIN [SystemRoles] sr ON sr.Code = a.SystemRoleCode
    WHERE NOT EXISTS (SELECT 1 FROM [UserAccounts] ua WHERE ua.Username = a.Username);

    UPDATE ua
    SET ua.EmployeeId = emp.Id,
        ua.RoleId = emp.RoleId,
        ua.SystemRoleId = sr.Id,
        ua.PasswordHash = a.PasswordHash,
        ua.IsActive = 1,
        ua.UpdatedAt = @now,
        ua.IsDeleted = 0,
        ua.DeletedAt = NULL
    FROM [UserAccounts] ua
    INNER JOIN @AccountSeeds a ON a.Username = ua.Username
    INNER JOIN [Employees] emp ON emp.EmployeeCode = a.EmployeeCode
    INNER JOIN [SystemRoles] sr ON sr.Code = a.SystemRoleCode;

    DECLARE @ContractSeeds TABLE
    (
        ContractNo nvarchar(30) NOT NULL PRIMARY KEY,
        EmployeeCode nvarchar(20) NOT NULL,
        ContractType int NOT NULL,
        BaseSalary decimal(18,2) NOT NULL,
        HourlyRate decimal(18,2) NOT NULL
    );

    INSERT INTO @ContractSeeds (ContractNo, EmployeeCode, ContractType, BaseSalary, HourlyRate)
    VALUES
        (N'HD-ADMIN-2026', N'EMP-ADMIN', 1, 25000000, 125000),
        (N'HD-HR001-2026', N'EMP-HR001', 1, 16000000, 80000),
        (N'HD-MGR001-2026', N'EMP-MGR001', 1, 18000000, 90000),
        (N'HD-ACC001-2026', N'EMP-ACC001', 1, 15000000, 75000),
        (N'HD-NV001-2026', N'EMP-NV001', 1, 12000000, 60000),
        (N'HD-NV002-2026', N'EMP-NV002', 1, 11000000, 55000),
        (N'HD-LEAD001-2026', N'EMP-LEAD001', 1, 13500000, 67500),
        (N'HD-BAR001-2026', N'EMP-BAR001', 1, 10500000, 52500),
        (N'HD-BAR002-2026', N'EMP-BAR002', 1, 10200000, 51000),
        (N'HD-CASH001-2026', N'EMP-CASH001', 1, 9800000, 49000),
        (N'HD-CASH002-2026', N'EMP-CASH002', 1, 9800000, 49000),
        (N'HD-REC001-2026', N'EMP-REC001', 1, 14500000, 72500),
        (N'HD-TRAIN001-2026', N'EMP-TRAIN001', 1, 14800000, 74000),
        (N'HD-INT001-2026', N'EMP-INT001', 4, 5000000, 25000),
        (N'HD-PT001-2026', N'EMP-PT001', 2, 6500000, 32500);

    INSERT INTO [EmployeeContracts] ([ContractNo], [ContractType], [EmployeeId], [StartDate], [EndDate], [BaseSalary], [HourlyRate], [OvertimeRateMultiplier], [LatePenaltyPerMinute], [EarlyLeavePenaltyPerMinute], [StandardDailyHours], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT c.ContractNo, c.ContractType, emp.Id, DATEFROMPARTS(@year, 1, 2), NULL, c.BaseSalary, c.HourlyRate, 1.5, 1000, 1000, 8, 1, @now, @now, 0
    FROM @ContractSeeds c
    INNER JOIN [Employees] emp ON emp.EmployeeCode = c.EmployeeCode
    WHERE NOT EXISTS (SELECT 1 FROM [EmployeeContracts] ec WHERE ec.ContractNo = c.ContractNo);

    UPDATE ec
    SET ec.ContractType = c.ContractType,
        ec.EmployeeId = emp.Id,
        ec.BaseSalary = c.BaseSalary,
        ec.HourlyRate = c.HourlyRate,
        ec.IsActive = 1,
        ec.UpdatedAt = @now,
        ec.IsDeleted = 0,
        ec.DeletedAt = NULL
    FROM [EmployeeContracts] ec
    INNER JOIN @ContractSeeds c ON c.ContractNo = ec.ContractNo
    INNER JOIN [Employees] emp ON emp.EmployeeCode = c.EmployeeCode;

    DECLARE @TrainingSeeds TABLE
    (
        TrainingCode nvarchar(20) NOT NULL PRIMARY KEY,
        TrainingName nvarchar(150) NOT NULL,
        Description nvarchar(500) NULL,
        Instructor nvarchar(100) NULL,
        IsRequired bit NOT NULL
    );

    INSERT INTO @TrainingSeeds (TrainingCode, TrainingName, Description, Instructor, IsRequired)
    VALUES
        (N'TRN-ONBOARD', N'Employee onboarding', N'Company process, HR policy and basic system usage.', N'Trinh My Trainer', 1),
        (N'TRN-SERVICE', N'Customer service standard', N'Store service workflow and customer experience.', N'Trinh My Trainer', 1),
        (N'TRN-PAYROLL', N'Payroll operation', N'Payroll generation, approval and closing process.', N'Le Thi Accountant', 0),
        (N'TRN-SAFETY', N'Workplace safety', N'Store safety and incident prevention.', N'Vo Minh Lead', 1),
        (N'TRN-BARISTA', N'Barista foundation', N'Drink recipes, equipment cleaning and quality check.', N'Hoang Anh Barista', 0);

    INSERT INTO [Trainings] ([TrainingCode], [TrainingName], [Description], [StartDate], [EndDate], [Instructor], [IsRequired], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT t.TrainingCode, t.TrainingName, t.Description, DATEADD(day, -20, @today), DATEADD(day, 20, @today), t.Instructor, t.IsRequired, 1, @now, @now, 0
    FROM @TrainingSeeds t
    WHERE NOT EXISTS (SELECT 1 FROM [Trainings] tr WHERE tr.TrainingCode = t.TrainingCode);

    UPDATE tr
    SET tr.TrainingName = t.TrainingName,
        tr.Description = t.Description,
        tr.Instructor = t.Instructor,
        tr.IsRequired = t.IsRequired,
        tr.IsActive = 1,
        tr.UpdatedAt = @now,
        tr.IsDeleted = 0,
        tr.DeletedAt = NULL
    FROM [Trainings] tr
    INNER JOIN @TrainingSeeds t ON t.TrainingCode = tr.TrainingCode;

    DECLARE @EmployeeTrainingSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL,
        TrainingCode nvarchar(20) NOT NULL,
        Status int NOT NULL,
        Score decimal(5,2) NULL
    );

    INSERT INTO @EmployeeTrainingSeeds (EmployeeCode, TrainingCode, Status, Score)
    VALUES
        (N'EMP-NV001', N'TRN-ONBOARD', 3, 92), (N'EMP-NV001', N'TRN-SERVICE', 3, 88),
        (N'EMP-NV002', N'TRN-ONBOARD', 3, 90), (N'EMP-NV002', N'TRN-SERVICE', 2, NULL),
        (N'EMP-BAR001', N'TRN-BARISTA', 3, 94), (N'EMP-BAR002', N'TRN-BARISTA', 2, NULL),
        (N'EMP-CASH001', N'TRN-SAFETY', 3, 86), (N'EMP-LEAD001', N'TRN-SERVICE', 3, 91),
        (N'EMP-HR001', N'TRN-PAYROLL', 3, 89), (N'EMP-ACC001', N'TRN-PAYROLL', 3, 95);

    INSERT INTO [EmployeeTrainings] ([EmployeeId], [TrainingId], [AssignedDate], [CompletedDate], [Status], [Score], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT emp.Id, tr.Id, DATEADD(day, -15, @today), CASE WHEN ets.Status = 3 THEN DATEADD(day, -5, @today) ELSE NULL END, ets.Status, ets.Score, @now, @now, 0
    FROM @EmployeeTrainingSeeds ets
    INNER JOIN [Employees] emp ON emp.EmployeeCode = ets.EmployeeCode
    INNER JOIN [Trainings] tr ON tr.TrainingCode = ets.TrainingCode
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [EmployeeTrainings] et
        WHERE et.EmployeeId = emp.Id AND et.TrainingId = tr.Id
    );

    DECLARE @RecruitmentSeeds TABLE
    (
        BranchCode nvarchar(20) NULL,
        PositionTitle nvarchar(150) NOT NULL,
        Status int NOT NULL,
        Description nvarchar(500) NULL
    );

    INSERT INTO @RecruitmentSeeds (BranchCode, PositionTitle, Status, Description)
    VALUES
        (N'BR-STORE', N'Sales Staff - District 1 Store', 2, N'Hiring two sales staff for busy evening shifts.'),
        (N'BR-D2', N'Barista - Thu Duc Store', 3, N'Barista pipeline for new product launch.'),
        (N'BR-HRM', N'HR Intern - Head Office', 2, N'Internship role supporting HR operations.');

    INSERT INTO [Recruitments] ([BranchId], [PositionTitle], [OpenDate], [CloseDate], [Status], [Description], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT b.Id, r.PositionTitle, DATEADD(day, -14, @today), DATEADD(day, 20, @today), r.Status, r.Description, @now, @now, 0
    FROM @RecruitmentSeeds r
    LEFT JOIN [Branches] b ON b.BranchCode = r.BranchCode
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [Recruitments] existing
        WHERE existing.PositionTitle = r.PositionTitle
    );

    DECLARE @CandidateSeeds TABLE
    (
        PositionTitle nvarchar(150) NOT NULL,
        FullName nvarchar(100) NOT NULL,
        Phone nvarchar(20) NULL,
        Email nvarchar(150) NULL,
        Status int NOT NULL,
        InterviewScore decimal(5,2) NULL,
        Note nvarchar(250) NULL
    );

    INSERT INTO @CandidateSeeds (PositionTitle, FullName, Phone, Email, Status, InterviewScore, Note)
    VALUES
        (N'Sales Staff - District 1 Store', N'Nguyen Minh Anh', N'0912000001', N'candidate.anh@coffeehrm.local', 2, NULL, N'Passed CV screening.'),
        (N'Sales Staff - District 1 Store', N'Tran Bao Chau', N'0912000002', N'candidate.chau@coffeehrm.local', 3, 82, N'Interview scheduled.'),
        (N'Sales Staff - District 1 Store', N'Le Quang Huy', N'0912000003', N'candidate.huy@coffeehrm.local', 6, 60, N'Not suitable for schedule.'),
        (N'Barista - Thu Duc Store', N'Pham Gia Bao', N'0912000004', N'candidate.bao@coffeehrm.local', 4, 88, N'Offer prepared.'),
        (N'Barista - Thu Duc Store', N'Do Thuy Linh', N'0912000005', N'candidate.linh@coffeehrm.local', 3, 79, N'Practical test needed.'),
        (N'Barista - Thu Duc Store', N'Ho Minh Quan', N'0912000006', N'candidate.quan@coffeehrm.local', 1, NULL, N'New application.'),
        (N'HR Intern - Head Office', N'Vu Khanh Vy', N'0912000007', N'candidate.vy@coffeehrm.local', 5, 91, N'Hired for HR internship.'),
        (N'HR Intern - Head Office', N'Bui Tuan Kiet', N'0912000008', N'candidate.kiet@coffeehrm.local', 2, NULL, N'Waiting for interview.');

    INSERT INTO [Candidates] ([RecruitmentId], [FullName], [Phone], [Email], [AppliedDate], [Status], [InterviewScore], [Note], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT rec.Id, c.FullName, c.Phone, c.Email, DATEADD(day, -7, @today), c.Status, c.InterviewScore, c.Note, @now, @now, 0
    FROM @CandidateSeeds c
    INNER JOIN [Recruitments] rec ON rec.PositionTitle = c.PositionTitle
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [Candidates] existing
        WHERE existing.RecruitmentId = rec.Id AND existing.Email = c.Email
    );

    DECLARE @OpenSlotSeeds TABLE
    (
        BranchCode nvarchar(20) NOT NULL,
        ShiftCode nvarchar(20) NOT NULL,
        DayOffset int NOT NULL,
        Capacity int NOT NULL,
        Note nvarchar(250) NULL
    );

    INSERT INTO @OpenSlotSeeds (BranchCode, ShiftCode, DayOffset, Capacity, Note)
    VALUES
        (N'BR-STORE', N'MORNING', 1, 3, N'Morning open slot for District 1.'),
        (N'BR-STORE', N'AFTERNOON', 1, 2, N'Afternoon open slot for District 1.'),
        (N'BR-D2', N'OPEN', 2, 2, N'Opening slot for Thu Duc.'),
        (N'BR-D2', N'CLOSE', 2, 2, N'Closing slot for Thu Duc.'),
        (N'BR-GV', N'MORNING', 3, 2, N'Go Vap weekend support.'),
        (N'BR-TD', N'AFTERNOON', 3, 2, N'Tan Dinh weekend support.');

    INSERT INTO [ShiftOpenSlots] ([BranchId], [ShiftId], [SlotDate], [Capacity], [Note], [IsActive], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT b.Id, sh.Id, DATEADD(day, os.DayOffset, @today), os.Capacity, os.Note, 1, @now, @now, 0
    FROM @OpenSlotSeeds os
    INNER JOIN [Branches] b ON b.BranchCode = os.BranchCode
    INNER JOIN [Shifts] sh ON sh.ShiftCode = os.ShiftCode
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [ShiftOpenSlots] existing
        WHERE existing.BranchId = b.Id
          AND existing.ShiftId = sh.Id
          AND existing.SlotDate = DATEADD(day, os.DayOffset, @today)
    );

    DECLARE @ScheduleSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL,
        ShiftCode nvarchar(20) NOT NULL,
        DayOffset int NOT NULL,
        Note nvarchar(250) NULL
    );

    INSERT INTO @ScheduleSeeds (EmployeeCode, ShiftCode, DayOffset, Note)
    VALUES
        (N'EMP-NV001', N'MORNING', -5, N'Completed schedule - present.'),
        (N'EMP-NV001', N'MORNING', -4, N'Completed schedule - late.'),
        (N'EMP-NV001', N'AFTERNOON', -3, N'Completed schedule - overtime.'),
        (N'EMP-NV001', N'MORNING', 1, N'Upcoming self-service demo schedule.'),
        (N'EMP-NV002', N'AFTERNOON', -5, N'Completed schedule.'),
        (N'EMP-NV002', N'AFTERNOON', -4, N'Completed schedule.'),
        (N'EMP-NV002', N'MORNING', 1, N'Upcoming shift swap target.'),
        (N'EMP-LEAD001', N'OPEN', -2, N'Lead opening shift.'),
        (N'EMP-LEAD001', N'CLOSE', 2, N'Lead closing shift.'),
        (N'EMP-BAR001', N'OPEN', -2, N'Barista morning prep.'),
        (N'EMP-BAR001', N'CLOSE', 2, N'Barista closing support.'),
        (N'EMP-BAR002', N'AFTERNOON', -1, N'Barista afternoon service.'),
        (N'EMP-CASH001', N'MORNING', -1, N'Cashier morning shift.'),
        (N'EMP-CASH002', N'AFTERNOON', -1, N'Cashier afternoon shift.'),
        (N'EMP-PT001', N'MORNING', 3, N'Part-time open slot registration.'),
        (N'EMP-INT001', N'AFTERNOON', 3, N'Intern weekend support.');

    INSERT INTO [Schedules] ([EmployeeId], [ShiftId], [OpenShiftSlotId], [ScheduleDate], [Note], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT emp.Id, sh.Id, os.Id, DATEADD(day, ss.DayOffset, @today), ss.Note, @now, @now, 0
    FROM @ScheduleSeeds ss
    INNER JOIN [Employees] emp ON emp.EmployeeCode = ss.EmployeeCode
    INNER JOIN [Shifts] sh ON sh.ShiftCode = ss.ShiftCode
    LEFT JOIN [ShiftOpenSlots] os ON os.BranchId = emp.BranchId
        AND os.ShiftId = sh.Id
        AND os.SlotDate = DATEADD(day, ss.DayOffset, @today)
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [Schedules] existing
        WHERE existing.EmployeeId = emp.Id AND existing.ScheduleDate = DATEADD(day, ss.DayOffset, @today)
    );

    DECLARE @AttendanceSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL,
        ShiftCode nvarchar(20) NOT NULL,
        DayOffset int NOT NULL,
        CheckInTime time NULL,
        CheckOutTime time NULL,
        Status int NOT NULL,
        LateMinutes int NOT NULL,
        WorkingMinutes int NOT NULL,
        OvertimeMinutes int NOT NULL,
        EarlyLeaveMinutes int NOT NULL,
        Note nvarchar(250) NULL
    );

    INSERT INTO @AttendanceSeeds (EmployeeCode, ShiftCode, DayOffset, CheckInTime, CheckOutTime, Status, LateMinutes, WorkingMinutes, OvertimeMinutes, EarlyLeaveMinutes, Note)
    VALUES
        (N'EMP-NV001', N'MORNING', -5, '07:58:00', '16:03:00', 2, 0, 485, 0, 0, N'Present demo attendance.'),
        (N'EMP-NV001', N'MORNING', -4, '08:25:00', '16:02:00', 3, 15, 457, 0, 0, N'Late demo attendance.'),
        (N'EMP-NV001', N'AFTERNOON', -3, '12:55:00', '21:45:00', 5, 0, 530, 45, 0, N'Overtime demo attendance.'),
        (N'EMP-NV002', N'AFTERNOON', -5, '12:59:00', '21:00:00', 2, 0, 481, 0, 0, N'Present demo attendance.'),
        (N'EMP-NV002', N'AFTERNOON', -4, '13:20:00', '20:45:00', 3, 10, 445, 0, 15, N'Late and early leave demo.'),
        (N'EMP-LEAD001', N'OPEN', -2, '06:25:00', '14:35:00', 2, 0, 490, 0, 0, N'Opening shift completed.'),
        (N'EMP-BAR001', N'OPEN', -2, '06:35:00', '14:30:00', 3, 5, 475, 0, 0, N'Barista slightly late.'),
        (N'EMP-BAR002', N'AFTERNOON', -1, '13:00:00', '21:25:00', 5, 0, 505, 25, 0, N'Overtime support.'),
        (N'EMP-CASH001', N'MORNING', -1, '08:01:00', '16:00:00', 2, 0, 479, 0, 0, N'Cashier present.'),
        (N'EMP-CASH002', N'AFTERNOON', -1, NULL, NULL, 6, 0, 0, 0, 0, N'Absent demo attendance.');

    INSERT INTO [Attendances] ([EmployeeId], [ShiftId], [ScheduleId], [AttendanceDate], [CheckInAt], [CheckOutAt], [LateMinutes], [WorkingMinutes], [OvertimeMinutes], [EarlyLeaveMinutes], [Status], [Note], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT emp.Id,
           sh.Id,
           sched.Id,
           DATEADD(day, a.DayOffset, @today),
           CASE WHEN a.CheckInTime IS NULL THEN NULL ELSE DATEADD(minute, DATEDIFF(minute, CAST('00:00:00' AS time), a.CheckInTime), CAST(DATEADD(day, a.DayOffset, @today) AS datetime2)) END,
           CASE WHEN a.CheckOutTime IS NULL THEN NULL ELSE DATEADD(minute, DATEDIFF(minute, CAST('00:00:00' AS time), a.CheckOutTime), CAST(DATEADD(day, a.DayOffset, @today) AS datetime2)) END,
           a.LateMinutes,
           a.WorkingMinutes,
           a.OvertimeMinutes,
           a.EarlyLeaveMinutes,
           a.Status,
           a.Note,
           @now,
           @now,
           0
    FROM @AttendanceSeeds a
    INNER JOIN [Employees] emp ON emp.EmployeeCode = a.EmployeeCode
    INNER JOIN [Shifts] sh ON sh.ShiftCode = a.ShiftCode
    LEFT JOIN [Schedules] sched ON sched.EmployeeId = emp.Id AND sched.ScheduleDate = DATEADD(day, a.DayOffset, @today)
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [Attendances] existing
        WHERE existing.EmployeeId = emp.Id AND existing.AttendanceDate = DATEADD(day, a.DayOffset, @today)
    );

    DECLARE @PayrollSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL,
        Status int NOT NULL,
        BaseAmount decimal(18,2) NOT NULL,
        WorkingHours decimal(18,2) NOT NULL,
        HourlyRate decimal(18,2) NOT NULL,
        OvertimeAmount decimal(18,2) NOT NULL,
        AllowanceAmount decimal(18,2) NOT NULL,
        BonusAmount decimal(18,2) NOT NULL,
        PenaltyAmount decimal(18,2) NOT NULL,
        InsuranceAmount decimal(18,2) NOT NULL,
        TaxAmount decimal(18,2) NOT NULL,
        Note nvarchar(250) NULL
    );

    INSERT INTO @PayrollSeeds (EmployeeCode, Status, BaseAmount, WorkingHours, HourlyRate, OvertimeAmount, AllowanceAmount, BonusAmount, PenaltyAmount, InsuranceAmount, TaxAmount, Note)
    VALUES
        (N'EMP-HR001', 3, 16000000, 176, 80000, 0, 800000, 500000, 0, 420000, 350000, N'Approved HR payroll demo.'),
        (N'EMP-MGR001', 3, 18000000, 184, 90000, 600000, 1000000, 700000, 0, 500000, 500000, N'Approved manager payroll demo.'),
        (N'EMP-ACC001', 3, 15000000, 176, 75000, 0, 700000, 400000, 0, 390000, 300000, N'Approved accountant payroll demo.'),
        (N'EMP-NV001', 3, 12000000, 172, 60000, 450000, 500000, 300000, 15000, 300000, 120000, N'Approved employee payroll demo.'),
        (N'EMP-NV002', 2, 11000000, 168, 55000, 0, 450000, 200000, 20000, 280000, 100000, N'Generated employee payroll demo.'),
        (N'EMP-LEAD001', 2, 13500000, 176, 67500, 350000, 650000, 300000, 0, 340000, 180000, N'Generated shift lead payroll demo.'),
        (N'EMP-BAR001', 2, 10500000, 168, 52500, 250000, 300000, 150000, 10000, 250000, 70000, N'Generated barista payroll demo.'),
        (N'EMP-CASH001', 4, 9800000, 176, 49000, 0, 300000, 100000, 0, 230000, 50000, N'Paid cashier payroll demo.');

    INSERT INTO [Payrolls] ([EmployeeId], [EmployeeContractId], [PayrollMonth], [PayrollYear], [BaseAmount], [WorkingHours], [HourlyRate], [OvertimeAmount], [AllowanceAmount], [BonusAmount], [PenaltyAmount], [InsuranceAmount], [TaxAmount], [TotalSalary], [Status], [PaidDate], [ApprovedAt], [ApprovedByUserAccountId], [IsClosed], [ClosedAt], [ClosedByUserAccountId], [Note], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT emp.Id,
           ec.Id,
           @month,
           @year,
           p.BaseAmount,
           p.WorkingHours,
           p.HourlyRate,
           p.OvertimeAmount,
           p.AllowanceAmount,
           p.BonusAmount,
           p.PenaltyAmount,
           p.InsuranceAmount,
           p.TaxAmount,
           p.BaseAmount + p.OvertimeAmount + p.AllowanceAmount + p.BonusAmount - p.PenaltyAmount - p.InsuranceAmount - p.TaxAmount,
           p.Status,
           CASE WHEN p.Status = 4 THEN @now ELSE NULL END,
           CASE WHEN p.Status IN (3, 4) THEN @now ELSE NULL END,
           reviewer.Id,
           0,
           NULL,
           NULL,
           p.Note,
           @now,
           @now,
           0
    FROM @PayrollSeeds p
    INNER JOIN [Employees] emp ON emp.EmployeeCode = p.EmployeeCode
    CROSS APPLY
    (
        SELECT TOP (1) activeContract.Id
        FROM [EmployeeContracts] activeContract
        WHERE activeContract.EmployeeId = emp.Id
          AND activeContract.IsActive = 1
          AND activeContract.IsDeleted = 0
        ORDER BY activeContract.StartDate DESC, activeContract.Id DESC
    ) ec
    LEFT JOIN [UserAccounts] reviewer ON reviewer.Username = N'accountant'
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [Payrolls] existing
        WHERE existing.EmployeeId = emp.Id AND existing.PayrollMonth = @month AND existing.PayrollYear = @year
    );

    INSERT INTO [PayrollDetails] ([PayrollId], [DetailType], [AttendanceId], [ScheduleId], [SourceReferenceId], [Description], [Amount], [Note], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT pay.Id, detail.DetailType, NULL, NULL, NULL, detail.Description, detail.Amount, N'Seeded payroll detail', @now, @now, 0
    FROM [Payrolls] pay
    INNER JOIN [Employees] emp ON emp.Id = pay.EmployeeId
    INNER JOIN @PayrollSeeds seed ON seed.EmployeeCode = emp.EmployeeCode
    CROSS APPLY
    (
        VALUES
            (1, N'Meal and transport allowance', seed.AllowanceAmount),
            (2, N'Monthly performance bonus', seed.BonusAmount),
            (4, N'Overtime payment', seed.OvertimeAmount),
            (5, N'Social insurance deduction', seed.InsuranceAmount * -1),
            (6, N'Personal income tax deduction', seed.TaxAmount * -1)
    ) detail(DetailType, Description, Amount)
    WHERE pay.PayrollMonth = @month
      AND pay.PayrollYear = @year
      AND detail.Amount <> 0
      AND NOT EXISTS
      (
          SELECT 1 FROM [PayrollDetails] existing
          WHERE existing.PayrollId = pay.Id AND existing.Description = detail.Description
      );

    INSERT INTO [PayrollClosePeriods] ([PayrollMonth], [PayrollYear], [IsClosed], [ClosedAt], [ClosedByUserAccountId], [Note], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT CASE WHEN @month = 1 THEN 12 ELSE @month - 1 END,
           CASE WHEN @month = 1 THEN @year - 1 ELSE @year END,
           1,
           @now,
           ua.Id,
           N'Previous payroll period closed for demo data.',
           @now,
           @now,
           0
    FROM [UserAccounts] ua
    WHERE ua.Username = N'accountant'
      AND NOT EXISTS
      (
          SELECT 1 FROM [PayrollClosePeriods] pcp
          WHERE pcp.PayrollMonth = CASE WHEN @month = 1 THEN 12 ELSE @month - 1 END
            AND pcp.PayrollYear = CASE WHEN @month = 1 THEN @year - 1 ELSE @year END
      );

    DECLARE @KpiSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL,
        Score decimal(5,2) NOT NULL,
        Target decimal(5,2) NOT NULL,
        Result nvarchar(100) NOT NULL,
        Note nvarchar(250) NULL
    );

    INSERT INTO @KpiSeeds (EmployeeCode, Score, Target, Result, Note)
    VALUES
        (N'EMP-HR001', 94, 90, N'Exceeded', N'HR workflow completed on time.'),
        (N'EMP-MGR001', 91, 90, N'Exceeded', N'Store operation stable.'),
        (N'EMP-ACC001', 89, 90, N'Near target', N'Payroll review completed.'),
        (N'EMP-NV001', 87, 85, N'Passed', N'Good attendance and service result.'),
        (N'EMP-NV002', 82, 85, N'Need improvement', N'Late records require follow-up.'),
        (N'EMP-LEAD001', 92, 90, N'Exceeded', N'Covered opening and closing shifts.'),
        (N'EMP-BAR001', 90, 88, N'Passed', N'Good drink quality score.'),
        (N'EMP-BAR002', 84, 88, N'Need training', N'Continue barista foundation training.'),
        (N'EMP-CASH001', 88, 85, N'Passed', N'Cashier accuracy stable.'),
        (N'EMP-CASH002', 78, 85, N'Need improvement', N'Absent record affected KPI.');

    INSERT INTO [KPIs] ([EmployeeId], [KpiYear], [KpiMonth], [Score], [Target], [Result], [Note], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT emp.Id, @year, @month, k.Score, k.Target, k.Result, k.Note, @now, @now, 0
    FROM @KpiSeeds k
    INNER JOIN [Employees] emp ON emp.EmployeeCode = k.EmployeeCode
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [KPIs] existing
        WHERE existing.EmployeeId = emp.Id AND existing.KpiMonth = @month AND existing.KpiYear = @year
    );

    DECLARE @LeaveSeeds TABLE
    (
        EmployeeCode nvarchar(20) NOT NULL,
        StartOffset int NOT NULL,
        EndOffset int NOT NULL,
        LeaveType nvarchar(50) NOT NULL,
        Reason nvarchar(500) NULL,
        Status int NOT NULL,
        ReviewerUsername nvarchar(50) NULL,
        DecisionNote nvarchar(250) NULL
    );

    INSERT INTO @LeaveSeeds (EmployeeCode, StartOffset, EndOffset, LeaveType, Reason, Status, ReviewerUsername, DecisionNote)
    VALUES
        (N'EMP-NV001', -8, -8, N'Annual Leave', N'Family appointment.', 2, N'hr', N'Approved demo leave.'),
        (N'EMP-NV001', 7, 8, N'Annual Leave', N'Planned personal leave.', 1, NULL, NULL),
        (N'EMP-NV002', 8, 8, N'Personal Leave', N'Personal schedule.', 3, N'hr', N'Rejected because of peak shift.'),
        (N'EMP-BAR001', 5, 5, N'Sick Leave', N'Medical check.', 1, NULL, NULL),
        (N'EMP-CASH001', -3, -3, N'Compensatory Leave', N'Compensation for overtime.', 2, N'manager', N'Approved by store manager.');

    INSERT INTO [LeaveRequests] ([EmployeeId], [StartDate], [EndDate], [LeaveType], [Reason], [TotalDays], [Status], [ReviewedByUserAccountId], [ReviewedAt], [DecisionNote], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT emp.Id,
           DATEADD(day, l.StartOffset, @today),
           DATEADD(day, l.EndOffset, @today),
           l.LeaveType,
           l.Reason,
           DATEDIFF(day, DATEADD(day, l.StartOffset, @today), DATEADD(day, l.EndOffset, @today)) + 1,
           l.Status,
           reviewer.Id,
           CASE WHEN l.Status IN (2, 3) THEN @now ELSE NULL END,
           l.DecisionNote,
           @now,
           @now,
           0
    FROM @LeaveSeeds l
    INNER JOIN [Employees] emp ON emp.EmployeeCode = l.EmployeeCode
    LEFT JOIN [UserAccounts] reviewer ON reviewer.Username = l.ReviewerUsername
    WHERE NOT EXISTS
    (
        SELECT 1 FROM [LeaveRequests] existing
        WHERE existing.EmployeeId = emp.Id
          AND existing.StartDate = DATEADD(day, l.StartOffset, @today)
          AND existing.EndDate = DATEADD(day, l.EndOffset, @today)
    );

    INSERT INTO [ShiftSwapRequests] ([RequestEmployeeId], [TargetEmployeeId], [RequestScheduleId], [TargetScheduleId], [Reason], [Status], [ReviewedByUserAccountId], [ReviewedAt], [DecisionNote], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT reqEmp.Id, targetEmp.Id, reqSchedule.Id, targetSchedule.Id,
           N'Need to swap because of personal appointment.',
           1,
           NULL,
           NULL,
           NULL,
           @now,
           @now,
           0
    FROM [Employees] reqEmp
    INNER JOIN [Employees] targetEmp ON targetEmp.EmployeeCode = N'EMP-NV002'
    INNER JOIN [Schedules] reqSchedule ON reqSchedule.EmployeeId = reqEmp.Id AND reqSchedule.ScheduleDate = DATEADD(day, 1, @today)
    INNER JOIN [Schedules] targetSchedule ON targetSchedule.EmployeeId = targetEmp.Id AND targetSchedule.ScheduleDate = DATEADD(day, 1, @today)
    WHERE reqEmp.EmployeeCode = N'EMP-NV001'
      AND NOT EXISTS
      (
          SELECT 1 FROM [ShiftSwapRequests] existing
          WHERE existing.RequestScheduleId = reqSchedule.Id AND existing.TargetScheduleId = targetSchedule.Id
      );

    INSERT INTO [AttendanceAdjustments] ([AttendanceId], [EmployeeId], [RequestedCheckInAt], [RequestedCheckOutAt], [RequestedStatus], [Reason], [Status], [ReviewedByUserAccountId], [ReviewedAt], [DecisionNote], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT att.Id,
           emp.Id,
           DATEADD(minute, 8 * 60 + 5, CAST(att.AttendanceDate AS datetime2)),
           att.CheckOutAt,
           2,
           N'Employee requested correction because the check-in device was slow.',
           1,
           NULL,
           NULL,
           NULL,
           @now,
           @now,
           0
    FROM [Attendances] att
    INNER JOIN [Employees] emp ON emp.Id = att.EmployeeId
    WHERE emp.EmployeeCode = N'EMP-NV001'
      AND att.AttendanceDate = DATEADD(day, -4, @today)
      AND NOT EXISTS
      (
          SELECT 1 FROM [AttendanceAdjustments] existing
          WHERE existing.AttendanceId = att.Id AND existing.Status = 1
      );

    INSERT INTO [AuditLogs] ([UserAccountId], [Action], [TableName], [RecordId], [OldValues], [NewValues], [IpAddress], [CreatedAt], [UpdatedAt], [IsDeleted])
    SELECT ua.Id, N'DemoSeed', N'Database', N'DEMO-SEED', NULL, N'CoffeeHRM demo data imported', N'127.0.0.1', @now, @now, 0
    FROM [UserAccounts] ua
    WHERE ua.Username = N'admin'
      AND NOT EXISTS
      (
          SELECT 1 FROM [AuditLogs] al
          WHERE al.Action = N'DemoSeed' AND al.RecordId = N'DEMO-SEED'
      );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;
GO

