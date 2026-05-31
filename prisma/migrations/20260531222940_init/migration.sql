-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SEEKER', 'PRACTITIONER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('IN_PERSON', 'HYBRID', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'GROUP_PRACTICE', 'TREATMENT_CENTER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SEEKER',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practitioners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" TEXT,
    "display_name" TEXT,
    "photo_url" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "social_links" JSONB,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modality" "Modality",
    "region" TEXT,
    "insurance_accepted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gender" TEXT,
    "values" TEXT,
    "field_values" JSONB,
    "visibility" "ProfileVisibility" NOT NULL DEFAULT 'DRAFT',
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "account_type" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
    "tier" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practitioners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_views" (
    "id" TEXT NOT NULL,
    "practitioner_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "practitioners_user_id_key" ON "practitioners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "practitioners_slug_key" ON "practitioners"("slug");

-- CreateIndex
CREATE INDEX "practitioners_visibility_idx" ON "practitioners"("visibility");

-- CreateIndex
CREATE INDEX "profile_views_practitioner_id_idx" ON "profile_views"("practitioner_id");

-- CreateIndex
CREATE INDEX "profile_views_viewed_at_idx" ON "profile_views"("viewed_at");

-- AddForeignKey
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_practitioner_id_fkey" FOREIGN KEY ("practitioner_id") REFERENCES "practitioners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
