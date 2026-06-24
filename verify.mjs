import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.user.updateMany({
    data: { emailVerified: true, onboardingComplete: true }
  })
  console.log('All users verified and onboarded.')
}
main()
