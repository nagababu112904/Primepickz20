import { db } from "./db";
import * as schema from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(schema.cartItems);
  await db.delete(schema.reviews);
  await db.delete(schema.deals);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.purchaseNotifications);

  // Seed Categories
  const categories = await db.insert(schema.categories).values([
    {
      name: "Sarees",
      slug: "sarees",
      imageUrl: "/images/categories/sarees.jpg",
      description: "Traditional and contemporary sarees in silk, cotton, and more",
    },
    {
      name: "Kurtas & Suits",
      slug: "kurtas",
      imageUrl: "/images/categories/kurtas.jpg",
      description: "Elegant kurta sets and salwar suits for every occasion",
    },
    {
      name: "Western Wear",
      slug: "western-wear",
      imageUrl: "/images/categories/western.jpg",
      description: "Trendy tops, dresses, jeans and more",
    },
    {
      name: "Lehengas",
      slug: "lehengas",
      imageUrl: "/images/categories/lehengas.jpg",
      description: "Stunning lehengas for weddings and festivities",
    },
    {
      name: "Footwear",
      slug: "footwear",
      imageUrl: "/images/categories/footwear.jpg",
      description: "Stylish footwear from casual to festive",
    },
    {
      name: "Accessories",
      slug: "accessories",
      imageUrl: "/images/categories/accessories.jpg",
      description: "Beautiful jewelry, bags, and fashion accessories",
    },
    {
      name: "Beauty & Makeup",
      slug: "beauty",
      imageUrl: "/images/categories/beauty.jpg",
      description: "Premium beauty and makeup products",
    },
    {
      name: "Home & Living",
      slug: "home-living",
      imageUrl: "/images/categories/home.jpg",
      description: "Decor and essentials for your home",
    },
  ]).returning();

  console.log(`✅ Seeded ${categories.length} categories`);

  // Seed Products
  const products = await db.insert(schema.products).values([
    // Sarees
    {
      name: "Banarasi Silk Saree with Golden Zari",
      description: "Luxurious Banarasi silk saree featuring intricate golden zari work, perfect for weddings and special occasions",
      price: "4999",
      originalPrice: "8999",
      discount: 44,
      category: "Sarees",
      imageUrl: "/images/products/saree-1.jpg",
      rating: "4.7",
      reviewCount: 234,
      inStock: true,
      stockCount: 15,
      tags: ["trending", "bestseller"],
      badge: "Bestseller",
      freeShipping: true,
    },
    {
      name: "Cotton Saree with Floral Print",
      description: "Comfortable cotton saree with beautiful floral prints, ideal for daily wear and casual events",
      price: "1299",
      originalPrice: "1999",
      discount: 35,
      category: "Sarees",
      imageUrl: "/images/products/saree-2.jpg",
      rating: "4.5",
      reviewCount: 156,
      inStock: true,
      tags: ["recommended"],
      freeShipping: true,
    },
    {
      name: "Designer Georgette Saree",
      description: "Elegant georgette saree with contemporary design and subtle embellishments",
      price: "2799",
      originalPrice: "4499",
      discount: 38,
      category: "Sarees",
      imageUrl: "/images/products/saree-3.jpg",
      rating: "4.8",
      reviewCount: 189,
      inStock: true,
      stockCount: 8,
      tags: ["trending"],
      badge: "New",
      freeShipping: true,
    },
    // Kurtas & Suits
    {
      name: "Anarkali Kurta Set with Dupatta",
      description: "Graceful Anarkali kurta set in premium fabric with matching dupatta and palazzo",
      price: "2499",
      originalPrice: "4999",
      discount: 50,
      category: "Kurtas",
      imageUrl: "/images/products/kurta-1.jpg",
      rating: "4.6",
      reviewCount: 312,
      inStock: true,
      tags: ["bestseller", "trending"],
      badge: "Hot Deal",
      freeShipping: true,
    },
    {
      name: "Straight Cut Cotton Kurta",
      description: "Comfortable straight cut kurta in pure cotton, perfect for everyday elegance",
      price: "899",
      originalPrice: "1499",
      discount: 40,
      category: "Kurtas",
      imageUrl: "/images/products/kurta-2.jpg",
      rating: "4.4",
      reviewCount: 201,
      inStock: true,
      tags: ["recommended"],
      freeShipping: false,
    },
    {
      name: "Embroidered Salwar Suit",
      description: "Beautiful embroidered salwar suit with mirror work and vibrant colors",
      price: "3299",
      originalPrice: "5999",
      discount: 45,
      category: "Kurtas",
      imageUrl: "/images/products/kurta-3.jpg",
      rating: "4.7",
      reviewCount: 178,
      inStock: true,
      stockCount: 12,
      tags: ["trending"],
      badge: "New",
      freeShipping: true,
    },
    // Western Wear
    {
      name: "Floral Print Maxi Dress",
      description: "Flowing maxi dress with vibrant floral print, perfect for summer outings",
      price: "1699",
      originalPrice: "2999",
      discount: 43,
      category: "Western Wear",
      imageUrl: "/images/products/western-1.jpg",
      rating: "4.5",
      reviewCount: 145,
      inStock: true,
      tags: ["trending", "recommended"],
      freeShipping: true,
    },
    {
      name: "Denim Jacket - Blue",
      description: "Classic blue denim jacket with a modern fit, a wardrobe essential",
      price: "1999",
      originalPrice: "3499",
      discount: 43,
      category: "Western Wear",
      imageUrl: "/images/products/western-2.jpg",
      rating: "4.6",
      reviewCount: 267,
      inStock: true,
      tags: ["bestseller"],
      badge: "Trending",
      freeShipping: true,
    },
    {
      name: "High-Waisted Jeans",
      description: "Comfortable high-waisted jeans in premium denim with perfect fit",
      price: "1499",
      originalPrice: "2499",
      discount: 40,
      category: "Western Wear",
      imageUrl: "/images/products/western-3.jpg",
      rating: "4.7",
      reviewCount: 423,
      inStock: true,
      tags: ["bestseller", "recommended"],
      freeShipping: true,
    },
    // Lehengas
    {
      name: "Wedding Lehenga with Heavy Embroidery",
      description: "Stunning bridal lehenga with intricate embroidery and premium fabrics",
      price: "12999",
      originalPrice: "24999",
      discount: 48,
      category: "Lehengas",
      imageUrl: "/images/products/lehenga-1.jpg",
      rating: "4.9",
      reviewCount: 89,
      inStock: true,
      stockCount: 5,
      tags: ["trending"],
      badge: "Premium",
      freeShipping: true,
    },
    {
      name: "Festive Lehenga Choli",
      description: "Beautiful festive lehenga choli with mirror work and sequins",
      price: "5999",
      originalPrice: "11999",
      discount: 50,
      category: "Lehengas",
      imageUrl: "/images/products/lehenga-2.jpg",
      rating: "4.6",
      reviewCount: 134,
      inStock: true,
      tags: ["recommended"],
      freeShipping: true,
    },
    // Footwear
    {
      name: "Embellished Ethnic Sandals",
      description: "Comfortable ethnic sandals with beautiful embellishments, perfect for festive wear",
      price: "799",
      originalPrice: "1499",
      discount: 47,
      category: "Footwear",
      imageUrl: "/images/products/footwear-1.jpg",
      rating: "4.3",
      reviewCount: 256,
      inStock: true,
      tags: ["bestseller"],
      freeShipping: false,
    },
    {
      name: "Casual Sneakers - White",
      description: "Trendy white sneakers for everyday comfort and style",
      price: "1299",
      originalPrice: "1999",
      discount: 35,
      category: "Footwear",
      imageUrl: "/images/products/footwear-2.jpg",
      rating: "4.5",
      reviewCount: 389,
      inStock: true,
      tags: ["trending", "recommended"],
      badge: "New",
      freeShipping: true,
    },
    // Accessories
    {
      name: "Kundan Necklace Set",
      description: "Exquisite kundan necklace set with matching earrings, perfect for weddings",
      price: "2499",
      originalPrice: "4999",
      discount: 50,
      category: "Accessories",
      imageUrl: "/images/products/accessory-1.jpg",
      rating: "4.7",
      reviewCount: 167,
      inStock: true,
      stockCount: 18,
      tags: ["trending"],
      badge: "Hot",
      freeShipping: true,
    },
    {
      name: "Designer Handbag - Brown",
      description: "Elegant designer handbag in premium faux leather with multiple compartments",
      price: "1899",
      originalPrice: "3499",
      discount: 46,
      category: "Accessories",
      imageUrl: "/images/products/accessory-2.jpg",
      rating: "4.6",
      reviewCount: 234,
      inStock: true,
      tags: ["bestseller", "recommended"],
      freeShipping: true,
    },
    {
      name: "Oxidized Silver Jhumkas",
      description: "Traditional oxidized silver jhumkas with intricate patterns",
      price: "499",
      originalPrice: "999",
      discount: 50,
      category: "Accessories",
      imageUrl: "/images/products/accessory-3.jpg",
      rating: "4.8",
      reviewCount: 456,
      inStock: true,
      tags: ["bestseller"],
      badge: "Bestseller",
      freeShipping: false,
    },
  ]).returning();

  console.log(`✅ Seeded ${products.length} products`);

  // Seed Deals
  const deals = await db.insert(schema.deals).values([
    {
      productId: products[0].id,
      title: "Flash Sale - Banarasi Silk Saree",
      endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      viewCount: 156,
      isActive: true,
    },
    {
      productId: products[3].id,
      title: "Limited Time - Anarkali Kurta Set",
      endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      viewCount: 89,
      isActive: true,
    },
    {
      productId: products[9].id,
      title: "Wedding Special - Premium Lehenga",
      endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      viewCount: 234,
      isActive: true,
    },
    {
      productId: products[13].id,
      title: "Designer Deal - Kundan Necklace",
      endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      viewCount: 67,
      isActive: true,
    },
  ]).returning();

  console.log(`✅ Seeded ${deals.length} deals`);

  // Seed Reviews
  const reviews = await db.insert(schema.reviews).values([
    {
      productId: products[0].id,
      customerName: "Priya Sharma",
      customerLocation: "Mumbai",
      rating: 5,
      comment: "Absolutely stunning saree! The quality is exceptional and the zari work is beautiful. Received so many compliments at my friend's wedding!",
      date: "2 days ago",
      verified: true,
    },
    {
      productId: products[0].id,
      customerName: "Anjali Reddy",
      customerLocation: "Hyderabad",
      rating: 5,
      comment: "Perfect saree for special occasions. The silk is genuine and drapes beautifully. Worth every rupee!",
      date: "1 week ago",
      verified: true,
    },
    {
      productId: products[3].id,
      customerName: "Sneha Patel",
      customerLocation: "Ahmedabad",
      rating: 5,
      comment: "Lovely Anarkali set! The fit is perfect and the fabric quality is great. Very comfortable to wear all day.",
      date: "3 days ago",
      verified: true,
    },
    {
      productId: products[3].id,
      customerName: "Divya Iyer",
      customerLocation: "Chennai",
      rating: 4,
      comment: "Beautiful kurta set. The embroidery is nice but the color was slightly different from the picture. Still very happy with the purchase!",
      date: "5 days ago",
      verified: true,
    },
    {
      productId: products[6].id,
      customerName: "Riya Gupta",
      customerLocation: "Delhi",
      rating: 5,
      comment: "Love this maxi dress! Perfect for summer. The floral print is vibrant and the fabric is breathable.",
      date: "1 day ago",
      verified: true,
    },
    {
      productId: products[8].id,
      customerName: "Meera Shah",
      customerLocation: "Pune",
      rating: 5,
      comment: "These jeans fit like a dream! Finally found the perfect high-waisted jeans. Ordering in more colors!",
      date: "4 days ago",
      verified: true,
    },
  ]).returning();

  console.log(`✅ Seeded ${reviews.length} reviews`);

  // Seed Purchase Notifications
  const notifications = await db.insert(schema.purchaseNotifications).values([
    {
      customerName: "Priya",
      location: "Mumbai",
      productName: "Banarasi Silk Saree",
      timestamp: "2 minutes ago",
    },
    {
      customerName: "Anjali",
      location: "Bangalore",
      productName: "Anarkali Kurta Set",
      timestamp: "5 minutes ago",
    },
    {
      customerName: "Sneha",
      location: "Delhi",
      productName: "Designer Handbag",
      timestamp: "8 minutes ago",
    },
    {
      customerName: "Divya",
      location: "Chennai",
      productName: "Floral Maxi Dress",
      timestamp: "12 minutes ago",
    },
  ]).returning();

  console.log(`✅ Seeded ${notifications.length} purchase notifications`);
  console.log("🎉 Database seeding complete!");
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
