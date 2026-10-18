BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[book_pages] ADD [contentFormat] NVARCHAR(10) NOT NULL CONSTRAINT [book_pages_contentFormat_df] DEFAULT 'markdown';

-- AlterTable
ALTER TABLE [dbo].[posts] ADD [contentFormat] NVARCHAR(10) NOT NULL CONSTRAINT [posts_contentFormat_df] DEFAULT 'markdown';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
