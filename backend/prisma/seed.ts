import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts: Array<{
  title: string;
  slug: string;
  description: string;
  basePrice: Prisma.Decimal;
  currency: string;
  isPublished: boolean;
  stock: number;
  reservedStock: number;
}> = [
  {
    title: 'Aether Aura Wireless ANC Headphones',
    slug: 'aether-aura-wireless-anc-headphones',
    description:
      'Engineered with custom planar magnetic drivers, adaptive active noise cancellation, and 45-hour battery life.',
    basePrice: new Prisma.Decimal('299.99'),
    currency: 'USD',
    isPublished: true,
    stock: 50,
    reservedStock: 2,
  },
  {
    title: 'Aether Apex Ergonomic Split Mechanical Keyboard',
    slug: 'aether-apex-ergonomic-mechanical-keyboard',
    description:
      'Gasket-mounted hot-swappable tactile switches, per-key RGB backlight, and integrated OLED status display.',
    basePrice: new Prisma.Decimal('219.50'),
    currency: 'USD',
    isPublished: true,
    stock: 35,
    reservedStock: 0,
  },
  {
    title: 'Aether Horizon 34-Inch Curved QD-OLED Monitor',
    slug: 'aether-horizon-34-curved-oled-monitor',
    description:
      'Ultrawide 3440x1440 resolution, 175Hz refresh rate, 0.03ms response time, and 99.3% DCI-P3 color gamut.',
    basePrice: new Prisma.Decimal('899.00'),
    currency: 'USD',
    isPublished: true,
    stock: 20,
    reservedStock: 1,
  },
  {
    title: 'Aether Pulse Smart Fitness Watch',
    slug: 'aether-pulse-smart-fitness-watch',
    description:
      'Titanium chassis with sapphire glass, dual-frequency GPS, HRV tracking, and 14-day battery life in smartwatch mode.',
    basePrice: new Prisma.Decimal('249.99'),
    currency: 'USD',
    isPublished: true,
    stock: 75,
    reservedStock: 5,
  },
  {
    title: 'Aether Nebula Studio Condenser Microphone',
    slug: 'aether-nebula-studio-condenser-microphone',
    description:
      'Large diaphragm condenser capsule with switchable polar patterns and ultra-low noise discrete analog circuitry.',
    basePrice: new Prisma.Decimal('179.00'),
    currency: 'USD',
    isPublished: true,
    stock: 40,
    reservedStock: 3,
  },
  {
    title: 'Aether Orbit Wireless Precision Gaming Mouse',
    slug: 'aether-orbit-wireless-precision-mouse',
    description:
      'Ultra-lightweight 49g honeycomb chassis, 26,000 DPI optical sensor, and 4000Hz polling rate wireless connectivity.',
    basePrice: new Prisma.Decimal('119.95'),
    currency: 'USD',
    isPublished: true,
    stock: 60,
    reservedStock: 0,
  },
  {
    title: 'Aether Quantum USB-C High-Power Docking Hub',
    slug: 'aether-quantum-usbc-docking-hub',
    description:
      '14-in-1 dual 4K60Hz display support, 100W Power Delivery pass-through, SD Express reader, and 2.5GbE Ethernet.',
    basePrice: new Prisma.Decimal('159.00'),
    currency: 'USD',
    isPublished: true,
    stock: 45,
    reservedStock: 4,
  },
  {
    title: 'Aether Shield Merino Wool Desk Mat',
    slug: 'aether-shield-merino-wool-desk-mat',
    description:
      '100% natural organic merino wool felt top with anti-slip natural cork base for minimal modern workspaces.',
    basePrice: new Prisma.Decimal('49.00'),
    currency: 'USD',
    isPublished: true,
    stock: 120,
    reservedStock: 8,
  },
  {
    title: 'Aether Lumos Smart LED Lightbar',
    slug: 'aether-lumos-smart-led-lightbar',
    description:
      'Asymmetric optical design screenbar with wireless rotary dial control and ambient auto-dimming light sensor.',
    basePrice: new Prisma.Decimal('89.99'),
    currency: 'USD',
    isPublished: true,
    stock: 80,
    reservedStock: 2,
  },
  {
    title: 'Aether Nova Active Noise Cancelling Earbuds',
    slug: 'aether-nova-anc-earbuds',
    description:
      'True wireless in-ear monitors with lossless audio support, dual transparency modes, and Qi wireless charging case.',
    basePrice: new Prisma.Decimal('189.00'),
    currency: 'USD',
    isPublished: true,
    stock: 90,
    reservedStock: 6,
  },
];

async function main() {
  console.log('[seed]: Starting database seed...');

  for (const item of sampleProducts) {
    const { stock, reservedStock, ...productData } = item;

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData,
      },
      create: {
        ...productData,
      },
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {
        stock,
        reservedStock,
      },
      create: {
        productId: product.id,
        stock,
        reservedStock,
      },
    });

    console.log(`[seed]: Seeded product "${product.title}" with ${stock} stock.`);
  }

  console.log(`[seed]: Successfully seeded ${sampleProducts.length} products with inventories!`);
}

main()
  .catch((e) => {
    console.error('[seed]: Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
