BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [username] NVARCHAR(80) NOT NULL,
    [email] NVARCHAR(320) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [firstName] NVARCHAR(100) NOT NULL,
    [lastName] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'editor',
    [isActive] BIT NOT NULL CONSTRAINT [users_isActive_df] DEFAULT 1,
    [lastLoginAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[posts] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [slug] NVARCHAR(120) NOT NULL,
    [title] NVARCHAR(300) NOT NULL,
    [excerpt] NVARCHAR(500),
    [coverImageUrl] NVARCHAR(2048),
    [content] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [posts_status_df] DEFAULT 'draft',
    [publishedAt] DATETIME2,
    [authorId] UNIQUEIDENTIFIER,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [posts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [posts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [posts_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[books] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [slug] NVARCHAR(120) NOT NULL,
    [title] NVARCHAR(300) NOT NULL,
    [author] NVARCHAR(200),
    [description] NVARCHAR(4000),
    [coverImageUrl] NVARCHAR(2048),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [books_status_df] DEFAULT 'draft',
    [publishedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [books_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [books_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [books_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[book_pages] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [bookId] UNIQUEIDENTIFIER NOT NULL,
    [number] INT NOT NULL,
    [title] NVARCHAR(300),
    [content] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [book_pages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [book_pages_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [book_pages_bookId_number_key] UNIQUE NONCLUSTERED ([bookId],[number])
);

-- CreateTable
CREATE TABLE [dbo].[media] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [blobName] NVARCHAR(400) NOT NULL,
    [contentType] NVARCHAR(100) NOT NULL,
    [byteSize] INT NOT NULL,
    [originalName] NVARCHAR(260) NOT NULL,
    [uploadedById] UNIQUEIDENTIFIER,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [media_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [media_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [media_blobName_key] UNIQUE NONCLUSTERED ([blobName])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [posts_status_publishedAt_idx] ON [dbo].[posts]([status], [publishedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [books_status_publishedAt_idx] ON [dbo].[books]([status], [publishedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [media_createdAt_idx] ON [dbo].[media]([createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[book_pages] ADD CONSTRAINT [book_pages_bookId_fkey] FOREIGN KEY ([bookId]) REFERENCES [dbo].[books]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

