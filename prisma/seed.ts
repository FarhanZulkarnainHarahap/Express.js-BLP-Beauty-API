import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();
const images = {
  lips: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=85",
  face: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85",
  eyes: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85",
  everyday:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
};

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@beauty.local" },
    update: { role: Role.SUPER_ADMIN },
    create: { name: "Super Admin", email: "admin@beauty.local", role: Role.SUPER_ADMIN },
  });
  await prisma.user.upsert({
    where: { email: "content@beauty.local" },
    update: { role: Role.ADMIN },
    create: { name: "Content Admin", email: "content@beauty.local", role: Role.ADMIN },
  });
  const categoryData = [
    ["Lips", "lips", images.lips],
    ["Face", "face", images.face],
    ["Eyes", "eyes", images.eyes],
    ["Everyday", "everyday", images.everyday],
  ] as const;
  const categories = new Map<string, string>();
  for (const [name, slug, imageUrl] of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        imageUrl,
        description: `${name} essentials for effortless everyday beauty.`,
      },
    });
    categories.set(slug, category.id);
  }
  const products = [
    ["Power Lash", "power-lash", "eyes", 139000, "BEST SELLER", images.eyes],
    ["Lip Liner", "lip-liner", "lips", 99000, "NEW", images.lips],
    [
      "Lip Coat Butter Fudge",
      "lip-coat-butter-fudge",
      "lips",
      129000,
      "BEST SELLER",
      images.everyday,
    ],
    ["Airbrush Powder", "airbrush-powder", "face", 189000, "ICONIC", images.face],
  ] as const;
  for (const [name, slug, category, price, badge, imageUrl] of products) {
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        description: `${name} is a high-performance formula made comfortable enough for every day.`,
        price,
        imageUrl,
        categoryId: categories.get(category)!,
        badge,
        stock: 40,
        isBestSeller: badge === "BEST SELLER",
        isPublished: true,
      },
    });
  }
  if (!(await prisma.banner.findFirst({ where: { title: "Beauty for Every Version of You" } }))) {
    await prisma.banner.create({
      data: {
        title: "Beauty for Every Version of You",
        subtitle:
          "Discover everyday beauty essentials made for every mood, every look, and every version of you.",
        imageUrl: images.everyday,
        buttonText: "Shop Best Sellers",
        buttonLink: "/products",
        isActive: true,
      },
    });
  }
  await prisma.campaign.upsert({
    where: { slug: "everyday-beauty-made-effortless" },
    update: {},
    create: {
      title: "Everyday Beauty, Made Effortless",
      slug: "everyday-beauty-made-effortless",
      description: "A modern beauty experience designed for every version of you.",
      imageUrl: images.face,
      buttonText: "Discover the edit",
      buttonLink: "/products",
      isPublished: true,
    },
  });
  await prisma.article.upsert({
    where: { slug: "how-to-choose-your-everyday-shade" },
    update: {},
    create: {
      title: "How to Choose Your Everyday Shade",
      slug: "how-to-choose-your-everyday-shade",
      excerpt: "A considered guide to finding shades that feel naturally yours.",
      content: [
        "Start by identifying your undertone in natural light.",
        "Warm undertones often glow in peach, coral, and caramel; cool undertones feel",
        "at home in rose and berry; neutral undertones can move easily between both.",
        "Test colour near the face, give it a moment to settle, and choose the shade",
        "that makes your skin look rested—not covered.",
      ].join(" "),
      imageUrl: images.lips,
      isPublished: true,
    },
  });
}
main().finally(() => prisma.$disconnect());
