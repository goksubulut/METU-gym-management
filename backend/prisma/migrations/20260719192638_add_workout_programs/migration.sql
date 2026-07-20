-- CreateEnum
CREATE TYPE "ProgramItemType" AS ENUM ('MACHINE', 'EXERCISE');

-- CreateTable
CREATE TABLE "WorkoutProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutProgramItem" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "itemType" "ProgramItemType" NOT NULL,
    "machineId" TEXT,
    "exerciseId" TEXT,

    CONSTRAINT "WorkoutProgramItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutProgramItem_programId_sortOrder_idx" ON "WorkoutProgramItem"("programId", "sortOrder");

-- AddForeignKey
ALTER TABLE "WorkoutProgram" ADD CONSTRAINT "WorkoutProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutProgramItem" ADD CONSTRAINT "WorkoutProgramItem_programId_fkey" FOREIGN KEY ("programId") REFERENCES "WorkoutProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutProgramItem" ADD CONSTRAINT "WorkoutProgramItem_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutProgramItem" ADD CONSTRAINT "WorkoutProgramItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
