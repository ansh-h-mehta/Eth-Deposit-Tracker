-- CreateTable
CREATE TABLE "DepositEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pubkey" TEXT NOT NULL,
    "withdrawalCredentials" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
