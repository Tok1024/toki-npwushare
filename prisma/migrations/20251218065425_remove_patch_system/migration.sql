/*
  Warnings:

  - You are about to drop the `patch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_alias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_company_relation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_rating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_rating_like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_rating_stat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_resource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patch_tag_relation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_patch_comment_like_relation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_patch_favorite_folder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_patch_favorite_folder_relation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_patch_resource_like_relation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."patch" DROP CONSTRAINT "patch_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_alias" DROP CONSTRAINT "patch_alias_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_comment" DROP CONSTRAINT "patch_comment_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_comment" DROP CONSTRAINT "patch_comment_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_comment" DROP CONSTRAINT "patch_comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_company" DROP CONSTRAINT "patch_company_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_company_relation" DROP CONSTRAINT "patch_company_relation_company_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_company_relation" DROP CONSTRAINT "patch_company_relation_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_rating" DROP CONSTRAINT "patch_rating_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_rating" DROP CONSTRAINT "patch_rating_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_rating_like" DROP CONSTRAINT "patch_rating_like_patch_rating_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_rating_like" DROP CONSTRAINT "patch_rating_like_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_rating_stat" DROP CONSTRAINT "patch_rating_stat_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_resource" DROP CONSTRAINT "patch_resource_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_resource" DROP CONSTRAINT "patch_resource_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_tag" DROP CONSTRAINT "patch_tag_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_tag_relation" DROP CONSTRAINT "patch_tag_relation_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."patch_tag_relation" DROP CONSTRAINT "patch_tag_relation_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_patch_comment_like_relation" DROP CONSTRAINT "user_patch_comment_like_relation_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_patch_comment_like_relation" DROP CONSTRAINT "user_patch_comment_like_relation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_patch_favorite_folder" DROP CONSTRAINT "user_patch_favorite_folder_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_patch_favorite_folder_relation" DROP CONSTRAINT "user_patch_favorite_folder_relation_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_patch_favorite_folder_relation" DROP CONSTRAINT "user_patch_favorite_folder_relation_patch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_patch_resource_like_relation" DROP CONSTRAINT "user_patch_resource_like_relation_resource_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_patch_resource_like_relation" DROP CONSTRAINT "user_patch_resource_like_relation_user_id_fkey";

-- DropTable
DROP TABLE "public"."patch";

-- DropTable
DROP TABLE "public"."patch_alias";

-- DropTable
DROP TABLE "public"."patch_comment";

-- DropTable
DROP TABLE "public"."patch_company";

-- DropTable
DROP TABLE "public"."patch_company_relation";

-- DropTable
DROP TABLE "public"."patch_rating";

-- DropTable
DROP TABLE "public"."patch_rating_like";

-- DropTable
DROP TABLE "public"."patch_rating_stat";

-- DropTable
DROP TABLE "public"."patch_resource";

-- DropTable
DROP TABLE "public"."patch_tag";

-- DropTable
DROP TABLE "public"."patch_tag_relation";

-- DropTable
DROP TABLE "public"."user_patch_comment_like_relation";

-- DropTable
DROP TABLE "public"."user_patch_favorite_folder";

-- DropTable
DROP TABLE "public"."user_patch_favorite_folder_relation";

-- DropTable
DROP TABLE "public"."user_patch_resource_like_relation";
