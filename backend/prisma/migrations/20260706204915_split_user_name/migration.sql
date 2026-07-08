-- Split User.name into firstName/lastName
ALTER TABLE "User" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';

UPDATE "User"
SET
  "firstName" = COALESCE(NULLIF(SPLIT_PART("name", ' ', 1), ''), 'User'),
  "lastName" = CASE
    WHEN POSITION(' ' IN "name") > 0 THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
    ELSE ''
  END;

ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT;

ALTER TABLE "User" DROP COLUMN "name";
