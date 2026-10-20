BEGIN TRY
BEGIN TRAN;

ALTER TABLE [dbo].[book_pages] ADD [status] NVARCHAR(20) NOT NULL CONSTRAINT [book_pages_status_df] DEFAULT 'published';

CREATE TABLE [dbo].[homepage_settings] (
    [id] INT NOT NULL CONSTRAINT [homepage_settings_id_df] DEFAULT 1,
    [featuredBookId] UNIQUEIDENTIFIER,
    CONSTRAINT [homepage_settings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [homepage_settings_singleton] CHECK ([id] = 1),
    CONSTRAINT [homepage_settings_featuredBookId_fkey] FOREIGN KEY ([featuredBookId]) REFERENCES [dbo].[books]([id]) ON DELETE SET NULL ON UPDATE NO ACTION
);

-- Preserve the currently showcased book once. Future publications never change this selection.
INSERT INTO [dbo].[homepage_settings] ([id], [featuredBookId])
VALUES (1, (SELECT TOP 1 [id] FROM [dbo].[books] WHERE [status] = 'published' ORDER BY [publishedAt] DESC, [id] DESC));

COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH
