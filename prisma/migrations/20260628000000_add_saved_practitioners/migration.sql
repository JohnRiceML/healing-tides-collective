-- AlterTable: seeker welcome-email idempotency flag
ALTER TABLE "users" ADD COLUMN "welcomed_at" TIMESTAMP(3);

-- CreateTable: a signed-in seeker's persisted "basket"
CREATE TABLE "saved_practitioners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "practitioner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_practitioners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_practitioners_user_id_practitioner_id_key" ON "saved_practitioners"("user_id", "practitioner_id");

-- CreateIndex
CREATE INDEX "saved_practitioners_user_id_idx" ON "saved_practitioners"("user_id");

-- AddForeignKey
ALTER TABLE "saved_practitioners" ADD CONSTRAINT "saved_practitioners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_practitioners" ADD CONSTRAINT "saved_practitioners_practitioner_id_fkey" FOREIGN KEY ("practitioner_id") REFERENCES "practitioners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
