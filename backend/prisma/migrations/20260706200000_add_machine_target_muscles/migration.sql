-- AlterTable
ALTER TABLE "Machine" ADD COLUMN "targetMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "targetMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[];
