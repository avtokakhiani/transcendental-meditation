BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[posts] ADD [draftRevisionId] UNIQUEIDENTIFIER,
[draftRevisionPostId] UNIQUEIDENTIFIER,
[kind] NVARCHAR(20) NOT NULL CONSTRAINT [posts_kind_df] DEFAULT 'article',
[publishedRevisionId] UNIQUEIDENTIFIER,
[publishedRevisionPostId] UNIQUEIDENTIFIER,
[version] INT NOT NULL CONSTRAINT [posts_version_df] DEFAULT 0;

-- CreateTable
CREATE TABLE [dbo].[post_revisions] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [postId] UNIQUEIDENTIFIER NOT NULL,
    [number] INT NOT NULL,
    [sourceHash] VARCHAR(64) NOT NULL,
    [sourceUpdatedAt] DATETIME2 NOT NULL,
    [title] NVARCHAR(300) NOT NULL,
    [displayHeading] NVARCHAR(300),
    [cardTitle] NVARCHAR(300),
    [excerpt] NVARCHAR(500),
    [cardExcerpt] NVARCHAR(500),
    [editorialByline] NVARCHAR(300),
    [category] NVARCHAR(150),
    [coverImageUrl] NVARCHAR(2048),
    [coverImageAlt] NVARCHAR(1000),
    [seoTitle] NVARCHAR(300),
    [seoDescription] NVARCHAR(2000),
    [socialImageUrl] NVARCHAR(2048),
    [layoutKey] NVARCHAR(80) NOT NULL CONSTRAINT [post_revisions_layoutKey_df] DEFAULT 'standard-v1',
    [content] NVARCHAR(max) NOT NULL,
    [contentFormat] NVARCHAR(10) NOT NULL,
    [document] NVARCHAR(max),
    [documentVersion] INT,
    [presentation] NVARCHAR(max),
    [plainText] NVARCHAR(max),
    [readingMinutes] INT,
    [createdById] UNIQUEIDENTIFIER,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [post_revisions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [post_revisions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [post_revisions_postId_number_key] UNIQUE NONCLUSTERED ([postId],[number]),
    CONSTRAINT [post_revisions_postId_sourceHash_key] UNIQUE NONCLUSTERED ([postId],[sourceHash]),
    CONSTRAINT [post_revisions_postId_id_key] UNIQUE NONCLUSTERED ([postId],[id])
);

-- CreateTable
CREATE TABLE [dbo].[post_slug_aliases] (
    [slug] NVARCHAR(120) NOT NULL,
    [postId] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [post_slug_aliases_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [post_slug_aliases_pkey] PRIMARY KEY CLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[post_revision_media] (
    [revisionId] UNIQUEIDENTIFIER NOT NULL,
    [mediaId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [post_revision_media_pkey] PRIMARY KEY CLUSTERED ([revisionId],[mediaId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [post_slug_aliases_postId_idx] ON [dbo].[post_slug_aliases]([postId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [post_revision_media_mediaId_idx] ON [dbo].[post_revision_media]([mediaId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [posts_kind_status_publishedAt_idx] ON [dbo].[posts]([kind], [status], [publishedAt]);

-- AddForeignKey
ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_draftRevisionPostId_draftRevisionId_fkey] FOREIGN KEY ([draftRevisionPostId], [draftRevisionId]) REFERENCES [dbo].[post_revisions]([postId],[id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_publishedRevisionPostId_publishedRevisionId_fkey] FOREIGN KEY ([publishedRevisionPostId], [publishedRevisionId]) REFERENCES [dbo].[post_revisions]([postId],[id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post_revisions] ADD CONSTRAINT [post_revisions_postId_fkey] FOREIGN KEY ([postId]) REFERENCES [dbo].[posts]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post_slug_aliases] ADD CONSTRAINT [post_slug_aliases_postId_fkey] FOREIGN KEY ([postId]) REFERENCES [dbo].[posts]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post_revision_media] ADD CONSTRAINT [post_revision_media_revisionId_fkey] FOREIGN KEY ([revisionId]) REFERENCES [dbo].[post_revisions]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post_revision_media] ADD CONSTRAINT [post_revision_media_mediaId_fkey] FOREIGN KEY ([mediaId]) REFERENCES [dbo].[media]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Foundation-only constraints; no legacy content/status columns are rewritten.
-- SQL Server binds checks on an existing table before ALTER ADD in the same batch.
EXEC(N'ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_kind_check] CHECK ([kind] IN (''article'', ''evergreen''))');
EXEC(N'ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_version_check] CHECK ([version] >= 0)');
EXEC(N'ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_draft_owner_check] CHECK (
  ([draftRevisionId] IS NULL AND [draftRevisionPostId] IS NULL) OR
  ([draftRevisionId] IS NOT NULL AND [draftRevisionPostId] IS NOT NULL AND [draftRevisionPostId] = [id]))');
EXEC(N'ALTER TABLE [dbo].[posts] ADD CONSTRAINT [posts_published_owner_check] CHECK (
  ([publishedRevisionId] IS NULL AND [publishedRevisionPostId] IS NULL) OR
  ([publishedRevisionId] IS NOT NULL AND [publishedRevisionPostId] IS NOT NULL AND [publishedRevisionPostId] = [id]))');
ALTER TABLE [dbo].[post_revisions] ADD CONSTRAINT [post_revisions_number_check] CHECK ([number] > 0);
ALTER TABLE [dbo].[post_revisions] ADD CONSTRAINT [post_revisions_readingMinutes_check] CHECK ([readingMinutes] IS NULL OR [readingMinutes] > 0);
ALTER TABLE [dbo].[post_revisions] ADD CONSTRAINT [post_revisions_presentation_check] CHECK ([presentation] IS NULL OR ISJSON([presentation]) = 1);
ALTER TABLE [dbo].[post_revisions] ADD CONSTRAINT [post_revisions_document_check] CHECK (
    ([contentFormat] IN ('markdown', 'html') AND [document] IS NULL AND [documentVersion] IS NULL)
    OR
    ([contentFormat] = 'document' AND [content] = '' AND [document] IS NOT NULL
     AND [documentVersion] IS NOT NULL AND [documentVersion] = 1
     AND ISJSON([document]) = 1)
);

-- Application validation handles the document's internal version and registry contracts.
-- Snapshots are append-only; deletion still cascades with the existing admin delete action.
EXEC(N'CREATE TRIGGER [dbo].[post_revisions_immutable] ON [dbo].[post_revisions]
INSTEAD OF UPDATE AS BEGIN
  SET NOCOUNT ON;
  THROW 51000, ''Article revisions are immutable; append a new revision.'', 1;
END');

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
