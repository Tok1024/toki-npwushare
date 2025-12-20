-- CreateTable
CREATE TABLE "public"."course_favorite" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_favorite_user_id_created_idx" ON "public"."course_favorite"("user_id", "created");

-- CreateIndex
CREATE INDEX "course_favorite_course_id_idx" ON "public"."course_favorite"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_favorite_user_id_course_id_key" ON "public"."course_favorite"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "public"."course_favorite" ADD CONSTRAINT "course_favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_favorite" ADD CONSTRAINT "course_favorite_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
