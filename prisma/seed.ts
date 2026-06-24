import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const skills = [
  // Design
  { name: "Graphic Design", category: "Design", description: "Visual communication through typography, imagery, and layout." },
  { name: "UI/UX Design", category: "Design", description: "User interface and experience design for digital products." },
  { name: "Brand Identity", category: "Design", description: "Creating visual brand identities, logos, and guidelines." },
  { name: "Illustration", category: "Design", description: "Custom artwork and digital illustrations." },
  { name: "Motion Graphics", category: "Design", description: "Animated graphic design and visual effects." },
  
  // Development
  { name: "Web Development", category: "Development", description: "Building websites and web applications." },
  { name: "Mobile App Development", category: "Development", description: "Creating native or cross-platform mobile apps." },
  { name: "Backend Development", category: "Development", description: "Server-side logic, databases, and APIs." },
  { name: "DevOps", category: "Development", description: "Infrastructure, CI/CD, and server management." },
  { name: "Data Science", category: "Development", description: "Data analysis, machine learning, and statistical modeling." },
  
  // Marketing
  { name: "Digital Marketing", category: "Marketing", description: "Online marketing strategies and execution." },
  { name: "SEO", category: "Marketing", description: "Search engine optimization to improve organic traffic." },
  { name: "Social Media Management", category: "Marketing", description: "Managing and growing social media presence." },
  { name: "Content Strategy", category: "Marketing", description: "Planning and managing content creation." },
  { name: "Email Marketing", category: "Marketing", description: "Creating and managing email campaigns." },
  
  // Writing
  { name: "Copywriting", category: "Writing", description: "Writing persuasive marketing and promotional materials." },
  { name: "Technical Writing", category: "Writing", description: "Creating technical documentation and manuals." },
  { name: "Blog Writing", category: "Writing", description: "Writing engaging articles and blog posts." },
  { name: "Editing & Proofreading", category: "Writing", description: "Reviewing and refining written content." },
  { name: "Grant Writing", category: "Writing", description: "Writing proposals for grants and funding." },
  
  // Business
  { name: "Business Strategy", category: "Business", description: "High-level business planning and growth strategies." },
  { name: "Project Management", category: "Business", description: "Organizing and executing projects effectively." },
  { name: "Financial Planning", category: "Business", description: "Business financial modeling and planning." },
  { name: "Business Analytics", category: "Business", description: "Analyzing business data to drive decisions." },
  { name: "Startup Consulting", category: "Business", description: "Advising early-stage companies and founders." },
  
  // Legal
  { name: "Contract Drafting", category: "Legal", description: "Creating legally binding agreements and contracts." },
  { name: "Legal Research", category: "Legal", description: "Researching legal precedents and regulations." },
  { name: "Compliance Advisory", category: "Legal", description: "Ensuring business practices meet regulatory requirements." },
  { name: "Intellectual Property", category: "Legal", description: "Advice on patents, trademarks, and copyright." },
  { name: "Business Formation", category: "Legal", description: "Assisting with company registration and structure." },
  
  // Finance
  { name: "Bookkeeping", category: "Finance", description: "Maintaining accurate financial records." },
  { name: "Tax Preparation", category: "Finance", description: "Preparing and filing tax returns." },
  { name: "Financial Modeling", category: "Finance", description: "Building detailed financial forecasts." },
  { name: "Investment Analysis", category: "Finance", description: "Evaluating investment opportunities and risks." },
  { name: "Budgeting", category: "Finance", description: "Creating and managing personal or business budgets." },
  
  // Education
  { name: "Tutoring", category: "Education", description: "One-on-one academic instruction." },
  { name: "Curriculum Design", category: "Education", description: "Developing educational courses and materials." },
  { name: "Online Course Creation", category: "Education", description: "Building digital learning experiences." },
  { name: "Language Teaching", category: "Education", description: "Instruction in foreign languages." },
  { name: "Academic Coaching", category: "Education", description: "Helping students develop study skills and habits." },
  
  // Video Production
  { name: "Video Editing", category: "Video Production", description: "Editing raw footage into polished videos." },
  { name: "Cinematography", category: "Video Production", description: "Professional video filming and lighting." },
  { name: "Animation", category: "Video Production", description: "2D or 3D animated video creation." },
  { name: "Sound Design", category: "Video Production", description: "Audio editing, mixing, and sound effects." },
  { name: "Scriptwriting", category: "Video Production", description: "Writing scripts for video content." }
]

async function main() {
  console.log("Seeding skills directory...")
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    })
  }
  console.log("Seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
