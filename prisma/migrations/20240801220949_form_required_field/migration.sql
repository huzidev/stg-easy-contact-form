/*
  Warnings:

  - You are about to drop the column `isHeadingHide` on the `Form` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopify_url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "heading" TEXT,
    "description" TEXT,
    "showTitle" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Form" ("description", "heading", "id", "name", "shopify_url") SELECT "description", "heading", "id", "name", "shopify_url" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
