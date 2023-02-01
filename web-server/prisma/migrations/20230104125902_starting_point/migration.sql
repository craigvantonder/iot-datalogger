-- CreateTable
CREATE TABLE "device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chipId" INTEGER NOT NULL,
    "chipModel" TEXT NOT NULL,
    "chipRevision" INTEGER NOT NULL,
    "chipCores" INTEGER NOT NULL,
    "macAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "readingInterval" TEXT NOT NULL,
    "manualReadingInterval" INTEGER NOT NULL,
    "userLed" BOOLEAN NOT NULL,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "config_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "telemetry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" BIGINT NOT NULL,
    "temperature" REAL NOT NULL,
    "humidity" INTEGER NOT NULL,
    "heatIndex" REAL NOT NULL,
    "soilMoisture" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "telemetry_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "config_deviceId_key" ON "config"("deviceId");
