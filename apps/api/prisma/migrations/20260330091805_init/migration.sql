/*
  Warnings:

  - You are about to drop the `Healthcheck` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Healthcheck";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "transportType" TEXT NOT NULL,
    "baseUrl" TEXT,
    "command" TEXT,
    "argsJson" JSONB,
    "envJson" JSONB,
    "extension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CapabilitySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "discoveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toolsCount" INTEGER NOT NULL DEFAULT 0,
    "resourcesCount" INTEGER NOT NULL DEFAULT 0,
    "promptsCount" INTEGER NOT NULL DEFAULT 0,
    "snapshotJson" JSONB NOT NULL,
    "extension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CapabilitySnapshot_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToolPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "requireConfirm" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "extension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ToolPolicy_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputJson" JSONB NOT NULL,
    "latestRunId" TEXT,
    "extension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recipe_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recipe_latestRunId_fkey" FOREIGN KEY ("latestRunId") REFERENCES "Run" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "capabilitySnapshotId" TEXT,
    "recipeId" TEXT,
    "toolName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "riskLevel" TEXT,
    "requestJson" JSONB NOT NULL,
    "responseJson" JSONB,
    "errorJson" JSONB,
    "durationMs" INTEGER,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "extension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Run_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Run_capabilitySnapshotId_fkey" FOREIGN KEY ("capabilitySnapshotId") REFERENCES "CapabilitySnapshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Run_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RunEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "message" TEXT,
    "payloadJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RunEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "runId" TEXT,
    "recipeId" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "extension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShareLink_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShareLink_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "actor" TEXT,
    "source" TEXT,
    "serverId" TEXT,
    "runId" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadataJson" JSONB,
    "extension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AuditLog_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Server_name_idx" ON "Server"("name");

-- CreateIndex
CREATE INDEX "Server_transportType_idx" ON "Server"("transportType");

-- CreateIndex
CREATE INDEX "CapabilitySnapshot_serverId_discoveredAt_idx" ON "CapabilitySnapshot"("serverId", "discoveredAt");

-- CreateIndex
CREATE UNIQUE INDEX "CapabilitySnapshot_serverId_version_key" ON "CapabilitySnapshot"("serverId", "version");

-- CreateIndex
CREATE INDEX "ToolPolicy_serverId_riskLevel_idx" ON "ToolPolicy"("serverId", "riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "ToolPolicy_serverId_toolName_key" ON "ToolPolicy"("serverId", "toolName");

-- CreateIndex
CREATE INDEX "Recipe_serverId_toolName_idx" ON "Recipe"("serverId", "toolName");

-- CreateIndex
CREATE INDEX "Recipe_name_idx" ON "Recipe"("name");

-- CreateIndex
CREATE INDEX "Recipe_latestRunId_idx" ON "Recipe"("latestRunId");

-- CreateIndex
CREATE INDEX "Run_serverId_createdAt_idx" ON "Run"("serverId", "createdAt");

-- CreateIndex
CREATE INDEX "Run_status_createdAt_idx" ON "Run"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Run_toolName_createdAt_idx" ON "Run"("toolName", "createdAt");

-- CreateIndex
CREATE INDEX "Run_recipeId_idx" ON "Run"("recipeId");

-- CreateIndex
CREATE INDEX "RunEvent_runId_createdAt_idx" ON "RunEvent"("runId", "createdAt");

-- CreateIndex
CREATE INDEX "RunEvent_eventType_createdAt_idx" ON "RunEvent"("eventType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_targetType_createdAt_idx" ON "ShareLink"("targetType", "createdAt");

-- CreateIndex
CREATE INDEX "ShareLink_token_isRevoked_idx" ON "ShareLink"("token", "isRevoked");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_serverId_createdAt_idx" ON "AuditLog"("serverId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_runId_createdAt_idx" ON "AuditLog"("runId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
