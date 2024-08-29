-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Field" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopify_url" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "min" INTEGER,
    "max" INTEGER,
    "totalLines" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "formId" INTEGER NOT NULL,
    CONSTRAINT "Field_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Field" ("defaultValue", "fieldLabel", "fieldName", "fieldType", "formId", "id", "isRequired", "max", "min", "placeholder", "shopify_url", "totalLines") SELECT "defaultValue", "fieldLabel", "fieldName", "fieldType", "formId", "id", "isRequired", "max", "min", "placeholder", "shopify_url", "totalLines" FROM "Field";
DROP TABLE "Field";
ALTER TABLE "new_Field" RENAME TO "Field";
CREATE TABLE "new_Option" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "fieldId" INTEGER NOT NULL,
    CONSTRAINT "Option_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Option" ("fieldId", "id", "label") SELECT "fieldId", "id", "label" FROM "Option";
DROP TABLE "Option";
ALTER TABLE "new_Option" RENAME TO "Option";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
