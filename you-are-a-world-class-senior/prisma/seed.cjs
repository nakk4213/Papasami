const { PrismaClient, RoleName } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const categories = [
  "Social Media Flyers",
  "Religious Flyers",
  "Political Flyers",
  "Business Flyers",
  "Logo Design",
  "Letterheads",
  "Certificates",
  "Invitation Cards",
  "Clothing Design",
  "Brochures",
  "Brand Kits",
  "Packaging Design",
  "Banners",
  "Web Graphics",
  "UI Design",
  "Custom Design Requests"
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  const passwordHash = await bcrypt.hash("PapaSami@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@papasamistudio.local" },
    update: {},
    create: { email: "admin@papasamistudio.local", name: "Papa Sami Studio Admin", role: RoleName.ADMIN, passwordHash, emailVerified: new Date() }
  });

  const designer = await prisma.user.upsert({
    where: { email: "designer@papasamistudio.local" },
    update: {},
    create: { email: "designer@papasamistudio.local", name: "Papa Sami Creative", role: RoleName.DESIGNER, passwordHash, emailVerified: new Date() }
  });

  await prisma.designerProfile.upsert({
    where: { userId: designer.id },
    update: {},
    create: {
      userId: designer.id,
      headline: "Senior brand and campaign designer",
      specialties: ["Brand Kits", "Social Media Flyers", "Packaging Design"],
      hourlyRate: 75,
      ratingAverage: 4.9,
      ratingCount: 42,
      completedJobs: 128
    }
  });

  await prisma.user.upsert({
    where: { email: "client@papasamistudio.local" },
    update: {},
    create: { email: "client@papasamistudio.local", name: "Demo Client", role: RoleName.CLIENT, passwordHash, emailVerified: new Date() }
  });

  for (const name of categories) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), icon: "Sparkles", description: `Premium ${name.toLowerCase()} crafted for polished brands and campaigns.` }
    });

    const service = await prisma.service.upsert({
      where: { slug: `${category.slug}-design` },
      update: {},
      create: {
        categoryId: category.id,
        name: `${name} Design`,
        slug: `${category.slug}-design`,
        description: `Strategy-led ${name.toLowerCase()} with production-ready files and revision support.`,
        basePrice: 49,
        turnaround: 3,
        featured: ["Logo Design", "Brand Kits", "Social Media Flyers", "Packaging Design"].includes(name)
      }
    });

    for (const tier of [
      { name: "Starter", description: "Lean launch package for fast, polished assets.", price: 49, revisions: 2, deliveryDays: 3, features: ["One concept", "Source file", "Commercial use"] },
      { name: "Growth", description: "Campaign package with multiple concepts and priority delivery.", price: 129, revisions: 4, deliveryDays: 5, features: ["Three concepts", "Priority queue", "Social variants"] },
      { name: "Signature", description: "Full creative direction package for premium launches.", price: 299, revisions: 8, deliveryDays: 7, features: ["Creative direction", "Full asset pack", "Launch support"] }
    ]) {
      await prisma.servicePackage.upsert({
        where: { serviceId_name: { serviceId: service.id, name: tier.name } },
        update: {},
        create: { serviceId: service.id, ...tier }
      });
    }
  }

  const portfolio = [
    ["Midnight Gospel Conference", "Religious Flyers"],
    ["Vertex Brand Identity", "Logo Design"],
    ["Civic Voice Campaign", "Political Flyers"],
    ["Luxe Bottle Packaging", "Packaging Design"],
    ["NOVA App UI Kit", "UI Design"],
    ["Harvest Festival Invite", "Invitation Cards"]
  ];

  for (const [title, category] of portfolio) {
    await prisma.portfolioItem.upsert({
      where: { slug: slugify(title) },
      update: {},
      create: {
        title,
        slug: slugify(title),
        description: `A premium ${category.toLowerCase()} project designed by Papa Sami Studio.`,
        category,
        tags: [category, "Premium", "Campaign"],
        imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
        likes: 120,
        saves: 38,
        featured: true
      }
    });
  }

  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: { key: "site", group: "global", value: { maintenance: false, brand: "Papa Sami Studio", currency: "GHS" } }
  });

  console.log(`Seeded Papa Sami Studio with admin ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
