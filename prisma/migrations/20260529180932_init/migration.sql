-- CreateTable
CREATE TABLE "College" (
    "id" SERIAL NOT NULL,
    "nirf_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "type" TEXT NOT NULL,
    "established_year" INTEGER NOT NULL,
    "nirf_rank" INTEGER NOT NULL,
    "nirf_score" DOUBLE PRECISION NOT NULL,
    "naac_grade" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "logo_url" TEXT,
    "total_seats" INTEGER NOT NULL,
    "campus_size_acres" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "duration_years" DOUBLE PRECISION NOT NULL,
    "fees_per_year" INTEGER NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "entrance_exams_accepted" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "average_package_lpa" DOUBLE PRECISION NOT NULL,
    "highest_package_lpa" DOUBLE PRECISION NOT NULL,
    "median_package_lpa" DOUBLE PRECISION NOT NULL,
    "placement_rate_percent" DOUBLE PRECISION NOT NULL,
    "top_recruiters" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cutoff" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "exam" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "branch" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "opening_rank" DOUBLE PRECISION NOT NULL,
    "closing_rank" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cutoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Infrastructure" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "hostel_available" BOOLEAN NOT NULL DEFAULT false,
    "hostel_fees_per_year" INTEGER,
    "library" TEXT,
    "labs" TEXT,
    "sports" TEXT,
    "wifi_available" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Infrastructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "overall_rating" DOUBLE PRECISION NOT NULL,
    "academics_rating" DOUBLE PRECISION NOT NULL,
    "placement_rating" DOUBLE PRECISION NOT NULL,
    "infrastructure_rating" DOUBLE PRECISION NOT NULL,
    "faculty_rating" DOUBLE PRECISION NOT NULL,
    "review_text" TEXT NOT NULL,
    "pros" TEXT NOT NULL,
    "cons" TEXT NOT NULL,
    "batch_year" INTEGER NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCollege" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "college_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'shortlisted',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedCollege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "college_id" INTEGER,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealTalkCache" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "college_name" TEXT NOT NULL,
    "pros" TEXT[],
    "cons" TEXT[],
    "hidden_gems" TEXT[],
    "complaints" TEXT[],
    "sentiment" TEXT NOT NULL,
    "sources" TEXT[],
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealTalkCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "College_nirf_id_key" ON "College"("nirf_id");

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

-- CreateIndex
CREATE INDEX "College_nirf_rank_idx" ON "College"("nirf_rank");

-- CreateIndex
CREATE INDEX "College_state_idx" ON "College"("state");

-- CreateIndex
CREATE INDEX "College_type_idx" ON "College"("type");

-- CreateIndex
CREATE INDEX "Course_college_id_idx" ON "Course"("college_id");

-- CreateIndex
CREATE INDEX "Placement_college_id_idx" ON "Placement"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_college_id_year_key" ON "Placement"("college_id", "year");

-- CreateIndex
CREATE INDEX "Cutoff_college_id_idx" ON "Cutoff"("college_id");

-- CreateIndex
CREATE INDEX "Cutoff_exam_year_category_idx" ON "Cutoff"("exam", "year", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Infrastructure_college_id_key" ON "Infrastructure"("college_id");

-- CreateIndex
CREATE INDEX "Review_college_id_idx" ON "Review"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "SavedCollege_user_id_idx" ON "SavedCollege"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCollege_user_id_college_id_key" ON "SavedCollege"("user_id", "college_id");

-- CreateIndex
CREATE INDEX "Question_college_id_idx" ON "Question"("college_id");

-- CreateIndex
CREATE INDEX "Question_user_id_idx" ON "Question"("user_id");

-- CreateIndex
CREATE INDEX "Answer_question_id_idx" ON "Answer"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "RealTalkCache_college_id_key" ON "RealTalkCache"("college_id");

-- CreateIndex
CREATE INDEX "RealTalkCache_college_id_idx" ON "RealTalkCache"("college_id");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cutoff" ADD CONSTRAINT "Cutoff_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infrastructure" ADD CONSTRAINT "Infrastructure_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCollege" ADD CONSTRAINT "SavedCollege_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCollege" ADD CONSTRAINT "SavedCollege_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
