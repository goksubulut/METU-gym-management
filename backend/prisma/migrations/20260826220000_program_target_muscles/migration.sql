-- AlterTable
ALTER TABLE "WorkoutProgram" ADD COLUMN "targetMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[];
