-- CreateTable
CREATE TABLE "episodes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "airDate" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "odais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "episodeId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "odais_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "choices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "odaiId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "pointValue" INTEGER NOT NULL,
    CONSTRAINT "choices_odaiId_fkey" FOREIGN KEY ("odaiId") REFERENCES "odais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT
);

-- CreateTable
CREATE TABLE "user_answers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "choiceId" INTEGER NOT NULL,
    "earnedPoint" INTEGER NOT NULL,
    CONSTRAINT "user_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_answers_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "choices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "episodes_code_key" ON "episodes"("code");
