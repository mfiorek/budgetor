/*
  Warnings:

  - You are about to drop the column `iconSrc` on the `Category` table. All the data in the column will be lost.
  - Added the required column `icon` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isExpense` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "iconSrc",
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "isExpense" BOOLEAN NOT NULL;
