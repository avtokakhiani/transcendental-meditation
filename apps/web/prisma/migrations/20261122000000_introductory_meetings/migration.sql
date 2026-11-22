BEGIN TRY
BEGIN TRAN;
CREATE TABLE [dbo].[introductory_meetings] (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [startsAt] DATETIME2 NOT NULL,
  [format] NVARCHAR(20) NOT NULL,
  [location] NVARCHAR(500),
  [joiningInstructions] NVARCHAR(2000),
  [status] NVARCHAR(20) NOT NULL CONSTRAINT [introductory_meetings_status_df] DEFAULT 'draft',
  [capacity] INT,
  [registrationClosesAt] DATETIME2,
  [createdAt] DATETIME2 NOT NULL CONSTRAINT [introductory_meetings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
  [updatedAt] DATETIME2 NOT NULL,
  CONSTRAINT [introductory_meetings_pkey] PRIMARY KEY CLUSTERED ([id]),
  CONSTRAINT [introductory_meetings_format_check] CHECK ([format] IN ('online', 'in_person')),
  CONSTRAINT [introductory_meetings_status_check] CHECK ([status] IN ('draft', 'open', 'closed')),
  CONSTRAINT [introductory_meetings_capacity_check] CHECK ([capacity] IS NULL OR [capacity] > 0),
  CONSTRAINT [introductory_meetings_location_check] CHECK ([format] <> 'in_person' OR ([location] IS NOT NULL AND LEN([location]) > 0))
);
CREATE INDEX [introductory_meetings_status_startsAt_idx] ON [dbo].[introductory_meetings]([status], [startsAt]);
CREATE TABLE [dbo].[meeting_registrations] (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [meetingId] UNIQUEIDENTIFIER NOT NULL,
  [firstName] NVARCHAR(100) NOT NULL,
  [lastName] NVARCHAR(100) NOT NULL,
  [email] NVARCHAR(254) NOT NULL,
  [phone] NVARCHAR(40) NOT NULL,
  [createdAt] DATETIME2 NOT NULL CONSTRAINT [meeting_registrations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
  [adminNotifiedAt] DATETIME2,
  [participantNotifiedAt] DATETIME2,
  CONSTRAINT [meeting_registrations_pkey] PRIMARY KEY CLUSTERED ([id]),
  CONSTRAINT [meeting_registrations_meetingId_email_key] UNIQUE NONCLUSTERED ([meetingId], [email]),
  CONSTRAINT [meeting_registrations_meetingId_fkey] FOREIGN KEY ([meetingId]) REFERENCES [dbo].[introductory_meetings]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION
);
COMMIT TRAN;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRAN;
  THROW;
END CATCH
