-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OddsSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalA" INTEGER NOT NULL,
    "totalB" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marketId" TEXT NOT NULL,
    CONSTRAINT "OddsSnapshot_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Market" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "detailA" TEXT NOT NULL,
    "detailB" TEXT NOT NULL,
    "endDate" DATETIME NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "winner" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "totalA" INTEGER NOT NULL DEFAULT 0,
    "totalB" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Market_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Market" ("createdAt", "creatorId", "description", "detailA", "detailB", "endDate", "id", "optionA", "optionB", "resolved", "title", "totalA", "totalB", "winner") SELECT "createdAt", "creatorId", "description", "detailA", "detailB", "endDate", "id", "optionA", "optionB", "resolved", "title", "totalA", "totalB", "winner" FROM "Market";
DROP TABLE "Market";
ALTER TABLE "new_Market" RENAME TO "Market";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
