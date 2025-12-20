-- CreateEnum
CREATE TYPE "public"."content_status" AS ENUM ('draft', 'pending', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "public"."visibility" AS ENUM ('public', 'unlisted', 'private');

-- CreateEnum
CREATE TYPE "public"."resource_type" AS ENUM ('note', 'slides', 'assignment', 'exam', 'solution', 'link', 'other');

-- CreateEnum
CREATE TYPE "public"."resource_interaction_type" AS ENUM ('click', 'download');

-- CreateTable
CREATE TABLE "public"."admin_log" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" VARCHAR(10007) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."department" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "code" VARCHAR(64),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "code" VARCHAR(64),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "instructor_name" VARCHAR(255),
    "cover_url" VARCHAR(512),
    "tags" TEXT[],
    "resource_count" INTEGER NOT NULL DEFAULT 0,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "heart_count" INTEGER NOT NULL DEFAULT 0,
    "difficulty_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty_votes" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_feedback" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" INTEGER,
    "comment" VARCHAR(1007),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER,
    "name" VARCHAR(128) NOT NULL,
    "title" VARCHAR(64),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_teacher" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "year" VARCHAR(16),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary" VARCHAR(1000),
    "type" "public"."resource_type" NOT NULL,
    "links" TEXT[],
    "s3_key" VARCHAR(512),
    "mime" VARCHAR(64),
    "size_bytes" INTEGER,
    "hash_sha256" VARCHAR(128),
    "status" "public"."content_status" NOT NULL DEFAULT 'published',
    "visibility" "public"."visibility" NOT NULL DEFAULT 'public',
    "term" VARCHAR(32),
    "teacher_id" INTEGER,
    "teacher_name" VARCHAR(128),
    "author_id" INTEGER NOT NULL,
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_rating" (
    "id" SERIAL NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "usefulness" INTEGER,
    "comment" VARCHAR(1007),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" VARCHAR(100000) NOT NULL,
    "author_id" INTEGER,
    "term" VARCHAR(32),
    "teacher_id" INTEGER,
    "status" "public"."content_status" NOT NULL DEFAULT 'published',
    "visibility" "public"."visibility" NOT NULL DEFAULT 'public',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comment" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(10007) NOT NULL,
    "author_id" INTEGER,
    "course_id" INTEGER,
    "resource_id" INTEGER,
    "post_id" INTEGER,
    "parent_id" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_comment_like" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_comment_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_interaction" (
    "id" SERIAL NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "interaction" "public"."resource_interaction_type" NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."badge" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "min_points" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_badge" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "badge_id" INTEGER NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_comment" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(10007) NOT NULL DEFAULT '',
    "edit" TEXT NOT NULL DEFAULT '',
    "parent_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "patch_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_patch_comment_like_relation" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_patch_comment_like_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_company" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(107) NOT NULL,
    "introduction" VARCHAR(10007) NOT NULL DEFAULT '',
    "count" INTEGER NOT NULL DEFAULT 0,
    "primary_language" TEXT[],
    "official_website" TEXT[],
    "parent_brand" TEXT[],
    "alias" TEXT[],
    "user_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_company_relation" (
    "id" SERIAL NOT NULL,
    "patch_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_company_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_rating" (
    "id" SERIAL NOT NULL,
    "recommend" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "play_status" TEXT NOT NULL DEFAULT 'not_started',
    "short_summary" VARCHAR(1314) NOT NULL DEFAULT '',
    "spoiler_level" TEXT NOT NULL DEFAULT 'none',
    "user_id" INTEGER NOT NULL,
    "patch_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_rating_like" (
    "id" SERIAL NOT NULL,
    "patch_rating_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_rating_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_rating_stat" (
    "patch_id" INTEGER NOT NULL,
    "avg_overall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "count" INTEGER NOT NULL DEFAULT 0,
    "rec_strong_no" INTEGER NOT NULL DEFAULT 0,
    "rec_no" INTEGER NOT NULL DEFAULT 0,
    "rec_neutral" INTEGER NOT NULL DEFAULT 0,
    "rec_yes" INTEGER NOT NULL DEFAULT 0,
    "rec_strong_yes" INTEGER NOT NULL DEFAULT 0,
    "o1" INTEGER NOT NULL DEFAULT 0,
    "o2" INTEGER NOT NULL DEFAULT 0,
    "o3" INTEGER NOT NULL DEFAULT 0,
    "o4" INTEGER NOT NULL DEFAULT 0,
    "o5" INTEGER NOT NULL DEFAULT 0,
    "o6" INTEGER NOT NULL DEFAULT 0,
    "o7" INTEGER NOT NULL DEFAULT 0,
    "o8" INTEGER NOT NULL DEFAULT 0,
    "o9" INTEGER NOT NULL DEFAULT 0,
    "o10" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_rating_stat_pkey" PRIMARY KEY ("patch_id")
);

-- CreateTable
CREATE TABLE "public"."patch_resource" (
    "id" SERIAL NOT NULL,
    "storage" VARCHAR(107) NOT NULL,
    "section" VARCHAR(107) NOT NULL,
    "name" VARCHAR(300) NOT NULL DEFAULT '',
    "size" VARCHAR(107) NOT NULL DEFAULT '',
    "code" VARCHAR(1007) NOT NULL DEFAULT '',
    "password" VARCHAR(1007) NOT NULL DEFAULT '',
    "note" VARCHAR(10007) NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "type" TEXT[],
    "language" TEXT[],
    "platform" TEXT[],
    "download" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "patch_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_patch_resource_like_relation" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_patch_resource_like_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(107) NOT NULL,
    "introduction" VARCHAR(10007) NOT NULL DEFAULT '',
    "count" INTEGER NOT NULL DEFAULT 0,
    "alias" TEXT[],
    "user_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_tag_relation" (
    "id" SERIAL NOT NULL,
    "patch_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_tag_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch" (
    "id" SERIAL NOT NULL,
    "unique_id" VARCHAR(8) NOT NULL,
    "name" VARCHAR(1007) NOT NULL,
    "vndb_id" VARCHAR(107),
    "banner" VARCHAR(1007) NOT NULL DEFAULT '',
    "introduction" VARCHAR(100007) NOT NULL DEFAULT '',
    "released" VARCHAR(107) NOT NULL DEFAULT 'unknown',
    "status" INTEGER NOT NULL DEFAULT 0,
    "download" INTEGER NOT NULL DEFAULT 0,
    "view" INTEGER NOT NULL DEFAULT 0,
    "resource_update_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT[],
    "language" TEXT[],
    "engine" TEXT[],
    "platform" TEXT[],
    "user_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patch_alias" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(1007) NOT NULL,
    "patch_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patch_alias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(17) NOT NULL,
    "email" VARCHAR(1007) NOT NULL,
    "password" VARCHAR(1007) NOT NULL,
    "ip" VARCHAR(233) NOT NULL DEFAULT '',
    "avatar" VARCHAR(233) NOT NULL DEFAULT '',
    "role" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 0,
    "register_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "point" INTEGER NOT NULL DEFAULT 0,
    "bio" VARCHAR(107) NOT NULL DEFAULT '',
    "resource_upload_count" INTEGER NOT NULL DEFAULT 0,
    "resource_download_count" INTEGER NOT NULL DEFAULT 0,
    "contribution_score" INTEGER NOT NULL DEFAULT 0,
    "enable_email_notice" BOOLEAN NOT NULL DEFAULT true,
    "daily_image_count" INTEGER NOT NULL DEFAULT 0,
    "daily_check_in" INTEGER NOT NULL DEFAULT 0,
    "daily_upload_size" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_login_time" TEXT NOT NULL DEFAULT '',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_follow_relation" (
    "id" SERIAL NOT NULL,
    "follower_id" INTEGER NOT NULL,
    "following_id" INTEGER NOT NULL,

    CONSTRAINT "user_follow_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_message" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" VARCHAR(10007) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "link" VARCHAR(1007) NOT NULL DEFAULT '',
    "sender_id" INTEGER,
    "recipient_id" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_patch_favorite_folder" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL DEFAULT '',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_patch_favorite_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_patch_favorite_folder_relation" (
    "id" SERIAL NOT NULL,
    "folder_id" INTEGER NOT NULL,
    "patch_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_patch_favorite_folder_relation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_slug_key" ON "public"."department"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "public"."department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "course_code_key" ON "public"."course"("code");

-- CreateIndex
CREATE INDEX "course_department_id_created_idx" ON "public"."course"("department_id", "created");

-- CreateIndex
CREATE UNIQUE INDEX "course_department_id_slug_key" ON "public"."course"("department_id", "slug");

-- CreateIndex
CREATE INDEX "course_feedback_course_id_idx" ON "public"."course_feedback"("course_id");

-- CreateIndex
CREATE INDEX "course_feedback_user_id_idx" ON "public"."course_feedback"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_feedback_course_id_user_id_key" ON "public"."course_feedback"("course_id", "user_id");

-- CreateIndex
CREATE INDEX "teacher_department_id_name_idx" ON "public"."teacher"("department_id", "name");

-- CreateIndex
CREATE INDEX "course_teacher_teacher_id_idx" ON "public"."course_teacher"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_teacher_course_id_teacher_id_year_key" ON "public"."course_teacher"("course_id", "teacher_id", "year");

-- CreateIndex
CREATE INDEX "resource_course_id_created_idx" ON "public"."resource"("course_id", "created");

-- CreateIndex
CREATE INDEX "resource_course_id_type_created_idx" ON "public"."resource"("course_id", "type", "created");

-- CreateIndex
CREATE INDEX "resource_course_id_teacher_id_term_created_idx" ON "public"."resource"("course_id", "teacher_id", "term", "created");

-- CreateIndex
CREATE INDEX "resource_author_id_created_idx" ON "public"."resource"("author_id", "created");

-- CreateIndex
CREATE INDEX "resource_status_visibility_created_idx" ON "public"."resource"("status", "visibility", "created");

-- CreateIndex
CREATE INDEX "resource_rating_resource_id_idx" ON "public"."resource_rating"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_rating_resource_id_user_id_key" ON "public"."resource_rating"("resource_id", "user_id");

-- CreateIndex
CREATE INDEX "post_course_id_created_idx" ON "public"."post"("course_id", "created");

-- CreateIndex
CREATE INDEX "post_course_id_teacher_id_term_created_idx" ON "public"."post"("course_id", "teacher_id", "term", "created");

-- CreateIndex
CREATE INDEX "post_status_visibility_created_idx" ON "public"."post"("status", "visibility", "created");

-- CreateIndex
CREATE INDEX "comment_course_id_created_idx" ON "public"."comment"("course_id", "created");

-- CreateIndex
CREATE INDEX "comment_resource_id_created_idx" ON "public"."comment"("resource_id", "created");

-- CreateIndex
CREATE INDEX "comment_post_id_created_idx" ON "public"."comment"("post_id", "created");

-- CreateIndex
CREATE INDEX "comment_author_id_created_idx" ON "public"."comment"("author_id", "created");

-- CreateIndex
CREATE UNIQUE INDEX "course_comment_like_user_id_comment_id_key" ON "public"."course_comment_like"("user_id", "comment_id");

-- CreateIndex
CREATE INDEX "resource_interaction_resource_id_created_idx" ON "public"."resource_interaction"("resource_id", "created");

-- CreateIndex
CREATE INDEX "resource_interaction_user_id_created_idx" ON "public"."resource_interaction"("user_id", "created");

-- CreateIndex
CREATE UNIQUE INDEX "badge_slug_key" ON "public"."badge"("slug");

-- CreateIndex
CREATE INDEX "user_badge_badge_id_idx" ON "public"."user_badge"("badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_badge_user_id_badge_id_key" ON "public"."user_badge"("user_id", "badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_patch_comment_like_relation_user_id_comment_id_key" ON "public"."user_patch_comment_like_relation"("user_id", "comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "patch_company_relation_patch_id_company_id_key" ON "public"."patch_company_relation"("patch_id", "company_id");

-- CreateIndex
CREATE INDEX "patch_rating_patch_id_idx" ON "public"."patch_rating"("patch_id");

-- CreateIndex
CREATE UNIQUE INDEX "patch_rating_user_id_patch_id_key" ON "public"."patch_rating"("user_id", "patch_id");

-- CreateIndex
CREATE UNIQUE INDEX "patch_rating_like_patch_rating_id_user_id_key" ON "public"."patch_rating_like"("patch_rating_id", "user_id");

-- CreateIndex
CREATE INDEX "patch_rating_stat_avg_overall_idx" ON "public"."patch_rating_stat"("avg_overall");

-- CreateIndex
CREATE INDEX "patch_rating_stat_count_idx" ON "public"."patch_rating_stat"("count");

-- CreateIndex
CREATE UNIQUE INDEX "user_patch_resource_like_relation_user_id_resource_id_key" ON "public"."user_patch_resource_like_relation"("user_id", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "patch_tag_name_key" ON "public"."patch_tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "patch_tag_relation_patch_id_tag_id_key" ON "public"."patch_tag_relation"("patch_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "patch_unique_id_key" ON "public"."patch"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "patch_vndb_id_key" ON "public"."patch"("vndb_id");

-- CreateIndex
CREATE INDEX "patch_alias_patch_id_idx" ON "public"."patch_alias"("patch_id");

-- CreateIndex
CREATE INDEX "patch_alias_name_idx" ON "public"."patch_alias"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "public"."user"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_follow_relation_follower_id_following_id_key" ON "public"."user_follow_relation"("follower_id", "following_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_patch_favorite_folder_user_id_name_key" ON "public"."user_patch_favorite_folder"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "user_patch_favorite_folder_relation_folder_id_patch_id_key" ON "public"."user_patch_favorite_folder_relation"("folder_id", "patch_id");

-- AddForeignKey
ALTER TABLE "public"."admin_log" ADD CONSTRAINT "admin_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course" ADD CONSTRAINT "course_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_feedback" ADD CONSTRAINT "course_feedback_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_feedback" ADD CONSTRAINT "course_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher" ADD CONSTRAINT "teacher_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_teacher" ADD CONSTRAINT "course_teacher_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_teacher" ADD CONSTRAINT "course_teacher_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource" ADD CONSTRAINT "resource_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource" ADD CONSTRAINT "resource_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource" ADD CONSTRAINT "resource_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_rating" ADD CONSTRAINT "resource_rating_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_rating" ADD CONSTRAINT "resource_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_comment_like" ADD CONSTRAINT "course_comment_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_comment_like" ADD CONSTRAINT "course_comment_like_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_interaction" ADD CONSTRAINT "resource_interaction_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_interaction" ADD CONSTRAINT "resource_interaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badge" ADD CONSTRAINT "user_badge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badge" ADD CONSTRAINT "user_badge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patch_comment" ADD CONSTRAINT "patch_comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."patch_comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_comment" ADD CONSTRAINT "patch_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_comment" ADD CONSTRAINT "patch_comment_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_patch_comment_like_relation" ADD CONSTRAINT "user_patch_comment_like_relation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_patch_comment_like_relation" ADD CONSTRAINT "user_patch_comment_like_relation_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."patch_comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_company" ADD CONSTRAINT "patch_company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_company_relation" ADD CONSTRAINT "patch_company_relation_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_company_relation" ADD CONSTRAINT "patch_company_relation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."patch_company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_rating" ADD CONSTRAINT "patch_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patch_rating" ADD CONSTRAINT "patch_rating_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patch_rating_like" ADD CONSTRAINT "patch_rating_like_patch_rating_id_fkey" FOREIGN KEY ("patch_rating_id") REFERENCES "public"."patch_rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patch_rating_like" ADD CONSTRAINT "patch_rating_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patch_rating_stat" ADD CONSTRAINT "patch_rating_stat_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patch_resource" ADD CONSTRAINT "patch_resource_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_resource" ADD CONSTRAINT "patch_resource_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_patch_resource_like_relation" ADD CONSTRAINT "user_patch_resource_like_relation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_patch_resource_like_relation" ADD CONSTRAINT "user_patch_resource_like_relation_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."patch_resource"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_tag" ADD CONSTRAINT "patch_tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_tag_relation" ADD CONSTRAINT "patch_tag_relation_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_tag_relation" ADD CONSTRAINT "patch_tag_relation_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."patch_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch" ADD CONSTRAINT "patch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patch_alias" ADD CONSTRAINT "patch_alias_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_follow_relation" ADD CONSTRAINT "user_follow_relation_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_follow_relation" ADD CONSTRAINT "user_follow_relation_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_message" ADD CONSTRAINT "user_message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_message" ADD CONSTRAINT "user_message_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_patch_favorite_folder" ADD CONSTRAINT "user_patch_favorite_folder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_patch_favorite_folder_relation" ADD CONSTRAINT "user_patch_favorite_folder_relation_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."user_patch_favorite_folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_patch_favorite_folder_relation" ADD CONSTRAINT "user_patch_favorite_folder_relation_patch_id_fkey" FOREIGN KEY ("patch_id") REFERENCES "public"."patch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
