import { db } from "./db";
import * as schema from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(schema.purchaseNotifications);
  await db.delete(schema.reviews);
  await db.delete(schema.deals);
  await db.delete(schema.cartItems);
  await db.delete(schema.wishlistItems);
  await db.delete(schema.products);
  await db.delete(schema.categories);

  // Seed Categories with new ones
  const categories = [
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
      name: "Furniture",
      slug: "furniture",
      imageUrl: "/images/categories/furniture.jpg",
      description: "Premium furniture for your home and office",
    },
    {
      name: "Food & Spices",
      slug: "food-spices",
      imageUrl: "/images/categories/spices.jpg",
      description: "Authentic Indian spices and gourmet food products",
    },
    {
      name: "Toys & Handicrafts",
      slug: "toys-handicrafts",
      imageUrl: "/images/categories/toys.jpg",
      description: "Traditional Indian handicrafts and handmade toys",
    },
    {
      name: "Pet Products",
      slug: "pet-products",
      imageUrl: "/images/categories/pets.jpg",
      description: "Premium products for your furry friends",
    },
    {
      name: "Healthcare & Supplements",
      slug: "healthcare",
      imageUrl: "/images/categories/healthcare.jpg",
      description: "Ayurvedic and natural health supplements",
    },
    {
      name: "Western Wear",
      slug: "western-wear",
      imageUrl: "/images/categories/western.jpg",
      description: "Trendy tops, dresses, jeans and more",
    },
  ];

  const insertedCategories = await db.insert(schema.categories).values(categories).returning();
  console.log(`✓ Inserted ${insertedCategories.length} categories`);

  // Seed Products (prices converted to USD from INR, ~83 INR = 1 USD)
  const products = [
    // Sarees
    {
      name: "Banarasi Silk Saree with Golden Zari",
      description: "Luxurious Banarasi silk saree featuring intricate golden zari work, perfect for weddings and special occasions",
      price: "60.00",
      originalPrice: "108.00",
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
      variants: ["Red", "Blue", "Green", "Maroon"],
    },
    {
      name: "Cotton Saree with Floral Print",
      description: "Comfortable cotton saree with beautiful floral prints, ideal for daily wear and casual events",
      price: "15.00",
      originalPrice: "24.00",
      discount: 35,
      category: "Sarees",
      imageUrl: "/images/products/saree-2.jpg",
      rating: "4.5",
      reviewCount: 156,
      inStock: true,
      tags: ["recommended"],
      freeShipping: true,
      variants: ["Pink", "Yellow", "White", "Light Blue"],
    },

    // Kurtas
    {
      name: "Anarkali Kurta Set with Dupatta",
      description: "Elegant Anarkali style kurta set with embroidered dupatta, perfect for festive occasions",
      price: "45.00",
      originalPrice: "72.00",
      discount: 38,
      category: "Kurtas & Suits",
      imageUrl: "/images/products/kurta-1.jpg",
      rating: "4.6",
      reviewCount: 189,
      inStock: true,
      stockCount: 25,
      tags: ["trending"],
      badge: "New",
      freeShipping: true,
      variants: ["S", "M", "L", "XL", "XXL"],
    },

    // Furniture
    {
      name: "Handcrafted Wooden Coffee Table",
      description: "Beautiful sheesham wood coffee table with intricate carvings, perfect centerpiece for your living room",
      price: "180.00",
      originalPrice: "300.00",
      discount: 40,
      category: "Furniture",
      imageUrl: "/images/products/furniture-1.jpg",
      rating: "4.8",
      reviewCount: 145,
      inStock: true,
      stockCount: 8,
      tags: ["bestseller"],
      badge: "Premium",
      freeShipping: true,
      variants: ["Natural Wood", "Dark Walnut", "Honey Finish"],
    },
    {
      name: "Teak Wood Rocking Chair",
      description: "Comfortable traditional rocking chair made from solid teak wood with cushioned seat",
      price: "120.00",
      originalPrice: "200.00",
      discount: 40,
      category: "Furniture",
      imageUrl: "/images/products/furniture-2.jpg",
      rating: "4.7",
      reviewCount: 98,
      inStock: true,
      stockCount: 12,
      freeShipping: true,
      variants: ["With Cushion", "Without Cushion"],
    },

    // Food & Spices
    {
      name: "Premium Garam Masala Blend",
      description: "Authentic blend of roasted spices including cardamom, cinnamon, cloves, and cumin - 200g pack",
      price: "8.00",
      originalPrice: "12.00",
      discount: 33,
      category: "Food & Spices",
      imageUrl: "/images/products/spices-1.jpg",
      rating: "4.9",
      reviewCount: 567,
      inStock: true,
      stockCount: 150,
      tags: ["bestseller", "organic"],
      badge: "Bestseller",
      freeShipping: false,
      variants: ["100g", "200g", "500g"],
    },
    {
      name: "Organic Turmeric Powder",
      description: "Pure organic turmeric powder from Sangli, Maharashtra - Premium quality with high curcumin content",
      price: "6.00",
      originalPrice: "10.00",
      discount: 40,
      category: "Food & Spices",
      imageUrl: "/images/products/spices-2.jpg",
      rating: "4.8",
      reviewCount: 423,
      inStock: true,
      stockCount: 200,
      tags: ["organic", "trending"],
      freeShipping: false,
      variants: ["100g", "250g", "500g", "1kg"],
    },
    {
      name: "Kashmiri Red Chili Powder",
      description: "Premium Kashmiri chili powder for vibrant color and mild heat, perfect for curries and marinades",
      price: "7.00",
      originalPrice: "11.00",
      discount: 36,
      category: "Food & Spices",
      imageUrl: "/images/products/spices-3.jpg",
      rating: "4.7",
      reviewCount: 312,
      inStock: true,
      stockCount: 180,
      freeShipping: false,
      variants: ["100g", "250g", "500g"],
    },

    // Toys & Handicrafts
    {
      name: "Hand-Painted Wooden Elephant",
      description: "Traditional Rajasthani hand-painted wooden elephant, perfect decorative piece for home",
      price: "25.00",
      originalPrice: "40.00",
      discount: 38,
      category: "Toys & Handicrafts",
      imageUrl: "/images/products/handicraft-1.jpg",
      rating: "4.6",
      reviewCount: 89,
      inStock: true,
      stockCount: 35,
      tags: ["handmade"],
      badge: "Handcrafted",
      freeShipping: false,
      variants: ["Small (6 inch)", "Medium (10 inch)", "Large (14 inch)"],
    },
    {
      name: "Channapatna Wooden Toy Set",
      description: "Eco-friendly lacquered wooden toys from Karnataka, safe for children - Set of 5 toys",
      price: "18.00",
      originalPrice: "30.00",
      discount: 40,
      category: "Toys & Handicrafts",
      imageUrl: "/images/products/toys-1.jpg",
      rating: "4.8",
      reviewCount: 156,
      inStock: true,
      stockCount: 45,
      tags: ["eco-friendly", "bestseller"],
      freeShipping: false,
      variants: ["Animal Set", "Vehicle Set", "Mixed Set"],
    },

    // Pet Products
    {
      name: "Premium Dog Food - Chicken & Rice",
      description: "Nutritious dog food with real chicken and brown rice, rich in proteins and essential nutrients - 5kg pack",
      price: "35.00",
      originalPrice: "50.00",
      discount: 30,
      category: "Pet Products",
      imageUrl: "/images/products/pet-1.jpg",
      rating: "4.7",
      reviewCount: 234,
      inStock: true,
      stockCount: 60,
      tags: ["bestseller"],
      badge: "Bestseller",
      freeShipping: true,
      variants: ["1kg", "3kg", "5kg", "10kg"],
    },
    {
      name: "Cat Scratching Post with Toys",
      description: "Multi-level cat scratching post with hanging toys and cozy perch, keeps cats entertained and active",
      price: "45.00",
      originalPrice: "75.00",
      discount: 40,
      category: "Pet Products",
      imageUrl: "/images/products/pet-2.jpg",
      rating: "4.6",
      reviewCount: 145,
      inStock: true,
      stockCount: 25,
      freeShipping: true,
      variants: ["Small", "Medium", "Large"],
    },
    {
      name: "Pet Grooming Kit - Complete Set",
      description: "Professional pet grooming kit with brush, comb, nail clipper, and scissors - suitable for dogs and cats",
      price: "22.00",
      originalPrice: "35.00",
      discount: 37,
      category: "Pet Products",
      imageUrl: "/images/products/pet-3.jpg",
      rating: "4.5",
      reviewCount: 178,
      inStock: true,
      stockCount: 80,
      freeShipping: false,
      variants: ["Basic Kit", "Premium Kit", "Professional Kit"],
    },

    // Healthcare & Supplements
    {
      name: "Ashwagandha Capsules - Stress Relief",
      description: "Pure Ashwagandha root extract capsules for stress relief and improved energy - 60 capsules",
      price: "15.00",
      originalPrice: "25.00",
      discount: 40,
      category: "Healthcare & Supplements",
      imageUrl: "/images/products/health-1.jpg",
      rating: "4.7",
      reviewCount: 456,
      inStock: true,
      stockCount: 120,
      tags: ["ayurvedic", "bestseller"],
      badge: "Bestseller",
      freeShipping: false,
      variants: ["30 Capsules", "60 Capsules", "120 Capsules"],
    },
    {
      name: "Triphala Powder - Digestive Health",
      description: "Traditional Ayurvedic Triphala powder for digestive health and detoxification - 200g pack",
      price: "10.00",
      originalPrice: "16.00",
      discount: 38,
      category: "Healthcare & Supplements",
      imageUrl: "/images/products/health-2.jpg",
      rating: "4.6",
      reviewCount: 289,
      inStock: true,
      stockCount: 150,
      tags: ["ayurvedic", "organic"],
      freeShipping: false,
      variants: ["100g", "200g", "500g"],
    },
    {
      name: "Omega-3 Fish Oil Capsules",
      description: "Premium Omega-3 fish oil capsules for heart and brain health - 90 softgels",
      price: "20.00",
      originalPrice: "32.00",
      discount: 38,
      category: "Healthcare & Supplements",
      imageUrl: "/images/products/health-3.jpg",
      rating: "4.8",
      reviewCount: 367,
      inStock: true,
      stockCount: 100,
      freeShipping: false,
      variants: ["30 Softgels", "60 Softgels", "90 Softgels"],
    },

    // Western Wear
    {
      name: "Denim Jacket - Classic Blue",
      description: "Trendy denim jacket with modern fit, perfect for casual outings and layering",
      price: "40.00",
      originalPrice: "65.00",
      discount: 38,
      category: "Western Wear",
      imageUrl: "/images/products/western-1.jpg",
      rating: "4.5",
      reviewCount: 178,
      inStock: true,
      stockCount: 40,
      tags: ["trending"],
      freeShipping: true,
      variants: ["XS", "S", "M", "L", "XL"],
    },
  ];

  const insertedProducts = await db.insert(schema.products).values(products).returning();
  console.log(`✓ Inserted ${insertedProducts.length} products`);

  // Seed Deals
  const deals = [
    {
      productId: insertedProducts[0].id,
      title: "Flash Sale - 44% Off",
      endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 1523,
      isActive: true,
    },
    {
      productId: insertedProducts[3].id,
      title: "Furniture Sale - 40% Off",
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 892,
      isActive: true,
    },
  ];

  const insertedDeals = await db.insert(schema.deals).values(deals).returning();
  console.log(`✓ Inserted ${insertedDeals.length} deals`);

  // Seed Reviews
  const reviews = [
    {
      productId: insertedProducts[0].id,
      customerName: "Priya Sharma",
      customerLocation: "Mumbai, Maharashtra",
      rating: 5,
      comment: "Absolutely stunning saree! The quality is exceptional and the zari work is beautiful.",
      date: "2025-10-15",
      verified: true,
    },
    {
      productId: insertedProducts[5].id,
      customerName: "Rajesh Kumar",
      customerLocation: "Delhi",
      rating: 5,
      comment: "Best garam masala I've ever used! Authentic flavor and aroma.",
      date: "2025-10-18",
      verified: true,
    },
  ];

  const insertedReviews = await db.insert(schema.reviews).values(reviews).returning();
  console.log(`✓ Inserted ${insertedReviews.length} reviews`);

  // Seed Purchase Notifications
  const notifications = [
    {
      customerName: "Anita M.",
      location: "Bangalore",
      productName: "Banarasi Silk Saree",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      customerName: "Vikram S.",
      location: "Pune",
      productName: "Premium Garam Masala",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ];

  await db.insert(schema.purchaseNotifications).values(notifications);
  console.log(`✓ Inserted ${notifications.length} purchase notifications`);

  console.log("✅ Database seeding completed!");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
