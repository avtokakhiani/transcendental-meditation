BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[meeting_registrations] ADD [adminEmailId] NVARCHAR(100),
[holdReason] NVARCHAR(40),
[holdUntil] DATETIME2,
[participantEmailId] NVARCHAR(100),
[processingRestrictedAt] DATETIME2,
[retentionExpiresAt] DATETIME2 NOT NULL CONSTRAINT [meeting_registrations_retentionExpiresAt_df] DEFAULT DATEADD(month, 12, SYSUTCDATETIME());

-- CreateTable
CREATE TABLE [dbo].[corporate_inquiries] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [deduplicationKey] VARCHAR(64) NOT NULL,
    [name] NVARCHAR(150) NOT NULL,
    [organization] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(254) NOT NULL,
    [phone] NVARCHAR(40) NOT NULL,
    [contactMethod] NVARCHAR(40) NOT NULL,
    [message] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [corporate_inquiries_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [lastBusinessContactAt] DATETIME2 NOT NULL,
    [retentionExpiresAt] DATETIME2 NOT NULL,
    [processingRestrictedAt] DATETIME2,
    [holdUntil] DATETIME2,
    [holdReason] NVARCHAR(40),
    [adminNotifiedAt] DATETIME2,
    [adminEmailId] NVARCHAR(100),
    CONSTRAINT [corporate_inquiries_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [corporate_inquiries_deduplicationKey_key] UNIQUE NONCLUSTERED ([deduplicationKey])
);

-- CreateTable
CREATE TABLE [dbo].[privacy_audit] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [actorId] UNIQUEIDENTIFIER,
    [scope] NVARCHAR(30) NOT NULL,
    [targetId] UNIQUEIDENTIFIER,
    [action] NVARCHAR(40) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [privacy_audit_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [privacy_audit_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[privacy_erasures] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [scope] NVARCHAR(30) NOT NULL,
    [targetId] UNIQUEIDENTIFIER NOT NULL,
    [externalEmailIds] NVARCHAR(500),
    [externalDoneAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [privacy_erasures_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [privacy_erasures_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [corporate_inquiries_retentionExpiresAt_idx] ON [dbo].[corporate_inquiries]([retentionExpiresAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [privacy_audit_createdAt_idx] ON [dbo].[privacy_audit]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [privacy_erasures_createdAt_idx] ON [dbo].[privacy_erasures]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [meeting_registrations_retentionExpiresAt_idx] ON [dbo].[meeting_registrations]([retentionExpiresAt]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

