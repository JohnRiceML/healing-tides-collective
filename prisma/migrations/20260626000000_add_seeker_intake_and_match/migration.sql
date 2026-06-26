-- CreateEnum
CREATE TYPE "SeekerIntakeStatus" AS ENUM ('NEW', 'REVIEWING', 'MATCHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SUGGESTED', 'SENT', 'DECLINED');

-- CreateTable
CREATE TABLE "seeker_intakes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "lookingFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" TEXT,
    "format" TEXT,
    "age_group" TEXT,
    "gender_preference" TEXT,
    "uses_insurance" BOOLEAN,
    "budget_note" TEXT,
    "availability" TEXT,
    "urgency" TEXT,
    "field_values" JSONB,
    "user_id" TEXT,
    "status" "SeekerIntakeStatus" NOT NULL DEFAULT 'NEW',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seeker_intakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "seeker_intake_id" TEXT NOT NULL,
    "practitioner_id" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SUGGESTED',
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seeker_intakes_status_idx" ON "seeker_intakes"("status");

-- CreateIndex
CREATE INDEX "seeker_intakes_created_at_idx" ON "seeker_intakes"("created_at");

-- CreateIndex
CREATE INDEX "matches_seeker_intake_id_idx" ON "matches"("seeker_intake_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_seeker_intake_id_practitioner_id_key" ON "matches"("seeker_intake_id", "practitioner_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_seeker_intake_id_fkey" FOREIGN KEY ("seeker_intake_id") REFERENCES "seeker_intakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_practitioner_id_fkey" FOREIGN KEY ("practitioner_id") REFERENCES "practitioners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
