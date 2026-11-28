-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "introductory_meetings" (
    "id" UUID NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "format" VARCHAR(20) NOT NULL,
    "location" VARCHAR(500),
    "joiningInstructions" VARCHAR(2000),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "capacity" INTEGER,
    "registrationClosesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "introductory_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_registrations" (
    "id" UUID NOT NULL,
    "meetingId" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminNotifiedAt" TIMESTAMP(3),
    "participantNotifiedAt" TIMESTAMP(3),
    "adminEmailId" VARCHAR(100),
    "participantEmailId" VARCHAR(100),
    "retentionExpiresAt" TIMESTAMP(3) NOT NULL DEFAULT dateadd(month,(12),sysutcdatetime()),
    "processingRestrictedAt" TIMESTAMP(3),
    "holdUntil" TIMESTAMP(3),
    "holdReason" VARCHAR(40),

    CONSTRAINT "meeting_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_inquiries" (
    "id" UUID NOT NULL,
    "deduplicationKey" VARCHAR(64) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "organization" VARCHAR(200) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "contactMethod" VARCHAR(40) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastBusinessContactAt" TIMESTAMP(3) NOT NULL,
    "retentionExpiresAt" TIMESTAMP(3) NOT NULL,
    "processingRestrictedAt" TIMESTAMP(3),
    "holdUntil" TIMESTAMP(3),
    "holdReason" VARCHAR(40),
    "adminNotifiedAt" TIMESTAMP(3),
    "adminEmailId" VARCHAR(100),

    CONSTRAINT "corporate_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_audit" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "scope" VARCHAR(30) NOT NULL,
    "targetId" UUID,
    "action" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privacy_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_erasures" (
    "id" UUID NOT NULL,
    "scope" VARCHAR(30) NOT NULL,
    "targetId" UUID NOT NULL,
    "externalEmailIds" VARCHAR(500),
    "externalDoneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privacy_erasures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'editor',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "excerpt" VARCHAR(500),
    "coverImageUrl" VARCHAR(2048),
    "content" TEXT NOT NULL,
    "contentFormat" VARCHAR(10) NOT NULL DEFAULT 'markdown',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "authorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kind" VARCHAR(20) NOT NULL DEFAULT 'article',
    "version" INTEGER NOT NULL DEFAULT 0,
    "draftRevisionId" UUID,
    "draftRevisionPostId" UUID,
    "publishedRevisionId" UUID,
    "publishedRevisionPostId" UUID,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_revisions" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "sourceHash" VARCHAR(64) NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "displayHeading" VARCHAR(300),
    "cardTitle" VARCHAR(300),
    "excerpt" VARCHAR(500),
    "cardExcerpt" VARCHAR(500),
    "editorialByline" VARCHAR(300),
    "category" VARCHAR(150),
    "coverImageUrl" VARCHAR(2048),
    "coverImageAlt" VARCHAR(1000),
    "seoTitle" VARCHAR(300),
    "seoDescription" VARCHAR(2000),
    "socialImageUrl" VARCHAR(2048),
    "layoutKey" VARCHAR(80) NOT NULL DEFAULT 'standard-v1',
    "content" TEXT NOT NULL,
    "contentFormat" VARCHAR(10) NOT NULL,
    "document" TEXT,
    "documentVersion" INTEGER,
    "presentation" TEXT,
    "plainText" TEXT,
    "readingMinutes" INTEGER,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_slug_aliases" (
    "slug" VARCHAR(120) NOT NULL,
    "postId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_slug_aliases_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "post_revision_media" (
    "revisionId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,

    CONSTRAINT "post_revision_media_pkey" PRIMARY KEY ("revisionId","mediaId")
);

-- CreateTable
CREATE TABLE "books" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "author" VARCHAR(200),
    "description" VARCHAR(4000),
    "coverImageUrl" VARCHAR(2048),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_pages" (
    "id" UUID NOT NULL,
    "bookId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(300),
    "content" TEXT NOT NULL,
    "contentFormat" VARCHAR(10) NOT NULL DEFAULT 'markdown',
    "status" VARCHAR(20) NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "featuredBookId" UUID,

    CONSTRAINT "homepage_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "blobName" VARCHAR(400) NOT NULL,
    "contentType" VARCHAR(100) NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "originalName" VARCHAR(260) NOT NULL,
    "uploadedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "introductory_meetings_status_startsAt_idx" ON "introductory_meetings"("status", "startsAt");

-- CreateIndex
CREATE INDEX "meeting_registrations_retentionExpiresAt_idx" ON "meeting_registrations"("retentionExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_registrations_meetingId_email_key" ON "meeting_registrations"("meetingId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_inquiries_deduplicationKey_key" ON "corporate_inquiries"("deduplicationKey");

-- CreateIndex
CREATE INDEX "corporate_inquiries_retentionExpiresAt_idx" ON "corporate_inquiries"("retentionExpiresAt");

-- CreateIndex
CREATE INDEX "privacy_audit_createdAt_idx" ON "privacy_audit"("createdAt");

-- CreateIndex
CREATE INDEX "privacy_erasures_createdAt_idx" ON "privacy_erasures"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_status_publishedAt_idx" ON "posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "posts_kind_status_publishedAt_idx" ON "posts"("kind", "status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "post_revisions_postId_number_key" ON "post_revisions"("postId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "post_revisions_postId_sourceHash_key" ON "post_revisions"("postId", "sourceHash");

-- CreateIndex
CREATE UNIQUE INDEX "post_revisions_postId_id_key" ON "post_revisions"("postId", "id");

-- CreateIndex
CREATE INDEX "post_slug_aliases_postId_idx" ON "post_slug_aliases"("postId");

-- CreateIndex
CREATE INDEX "post_revision_media_mediaId_idx" ON "post_revision_media"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "books_slug_key" ON "books"("slug");

-- CreateIndex
CREATE INDEX "books_status_publishedAt_idx" ON "books"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "book_pages_bookId_number_key" ON "book_pages"("bookId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "media_blobName_key" ON "media"("blobName");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- AddForeignKey
ALTER TABLE "meeting_registrations" ADD CONSTRAINT "meeting_registrations_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "introductory_meetings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_draftRevisionPostId_draftRevisionId_fkey" FOREIGN KEY ("draftRevisionPostId", "draftRevisionId") REFERENCES "post_revisions"("postId", "id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_publishedRevisionPostId_publishedRevisionId_fkey" FOREIGN KEY ("publishedRevisionPostId", "publishedRevisionId") REFERENCES "post_revisions"("postId", "id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_slug_aliases" ADD CONSTRAINT "post_slug_aliases_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_revision_media" ADD CONSTRAINT "post_revision_media_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "post_revisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_revision_media" ADD CONSTRAINT "post_revision_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "book_pages" ADD CONSTRAINT "book_pages_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_featuredBookId_fkey" FOREIGN KEY ("featuredBookId") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE NO ACTION;


-- Rules Prisma cannot express in schema.prisma, ported from the SQL Server migrations.

-- homepage_settings is a singleton row; the app upserts id = 1.
ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_singleton" CHECK ("id" = 1);
INSERT INTO "homepage_settings" ("id", "featuredBookId") VALUES (1, NULL);

ALTER TABLE "introductory_meetings" ADD CONSTRAINT "introductory_meetings_format_check" CHECK ("format" IN ('online', 'in_person'));
ALTER TABLE "introductory_meetings" ADD CONSTRAINT "introductory_meetings_status_check" CHECK ("status" IN ('draft', 'open', 'closed'));
ALTER TABLE "introductory_meetings" ADD CONSTRAINT "introductory_meetings_capacity_check" CHECK ("capacity" IS NULL OR "capacity" > 0);
ALTER TABLE "introductory_meetings" ADD CONSTRAINT "introductory_meetings_location_check" CHECK ("format" <> 'in_person' OR ("location" IS NOT NULL AND length("location") > 0));

ALTER TABLE "posts" ADD CONSTRAINT "posts_kind_check" CHECK ("kind" IN ('article', 'evergreen'));
ALTER TABLE "posts" ADD CONSTRAINT "posts_version_check" CHECK ("version" >= 0);
ALTER TABLE "posts" ADD CONSTRAINT "posts_draft_owner_check" CHECK (
  ("draftRevisionId" IS NULL AND "draftRevisionPostId" IS NULL) OR
  ("draftRevisionId" IS NOT NULL AND "draftRevisionPostId" IS NOT NULL AND "draftRevisionPostId" = "id"));
ALTER TABLE "posts" ADD CONSTRAINT "posts_published_owner_check" CHECK (
  ("publishedRevisionId" IS NULL AND "publishedRevisionPostId" IS NULL) OR
  ("publishedRevisionId" IS NOT NULL AND "publishedRevisionPostId" IS NOT NULL AND "publishedRevisionPostId" = "id"));

ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_number_check" CHECK ("number" > 0);
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_readingMinutes_check" CHECK ("readingMinutes" IS NULL OR "readingMinutes" > 0);
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_presentation_check" CHECK ("presentation" IS NULL OR "presentation" IS JSON);
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_document_check" CHECK (
    ("contentFormat" IN ('markdown', 'html') AND "document" IS NULL AND "documentVersion" IS NULL)
    OR
    ("contentFormat" = 'document' AND "content" = '' AND "document" IS NOT NULL
     AND "documentVersion" IS NOT NULL AND "documentVersion" = 1
     AND "document" IS JSON)
);

-- Snapshots are append-only; deletion still cascades with the existing admin delete action.
CREATE FUNCTION "post_revisions_reject_update"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Article revisions are immutable; append a new revision.';
END;
$$;
CREATE TRIGGER "post_revisions_immutable" BEFORE UPDATE ON "post_revisions"
  FOR EACH ROW EXECUTE FUNCTION "post_revisions_reject_update"();
