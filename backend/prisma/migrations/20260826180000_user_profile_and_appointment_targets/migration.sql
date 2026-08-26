-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "gender" "Gender",
ADD COLUMN "birthDate" DATE;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "targetMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[];
