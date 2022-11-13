/*
  Warnings:

  - Added the required column `name` to the `Credentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credentials" ADD COLUMN     "name" TEXT NOT NULL;
