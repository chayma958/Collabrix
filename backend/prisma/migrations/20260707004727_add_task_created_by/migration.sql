-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "createdById" TEXT;

-- Backfill from the activity log's earliest 'created' event per task
UPDATE "Task" t
SET "createdById" = sub."actorId"
FROM (
  SELECT DISTINCT ON ("entityId") "entityId", "actorId"
  FROM "ActivityLog"
  WHERE "entityType" = 'TASK' AND "action" = 'created'
  ORDER BY "entityId", "createdAt" ASC
) sub
WHERE t."id" = sub."entityId";

-- CreateIndex
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
