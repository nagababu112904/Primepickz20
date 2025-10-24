import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type {
  Product,
  InsertProduct,
  Category,
  InsertCategory,
  Deal,
  InsertDeal,
  Review,
  InsertReview,
  CartItem,
  InsertCartItem,
  PurchaseNotification,
  CartItemWithProduct,
  DealWithProduct,
  User,
  UpsertUser,
  WishlistItem,
  InsertWishlistItem,
  WishlistItemWithProduct,
  Address,
  InsertAddress,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  OrderWithItems,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Deals
  getAllDeals(): Promise<DealWithProduct[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  
  // Reviews
  getAllReviews(): Promise<Review[]>;
  getReviewsByProduct(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  
  // Purchase Notifications
  getAllNotifications(): Promise<PurchaseNotification[]>;
  
  // Wishlist
  getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;
  
  // Addresses
  getUserAddresses(userId: string): Promise<Address[]>;
  getAddress(id: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(userId: string, id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(userId: string, id: string): Promise<boolean>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private categories: Map<string, Category>;
  private deals: Map<string, Deal>;
  private reviews: Map<string, Review>;
  private cartItems: Map<string, CartItem>;
  private wishlistItems: Map<string, WishlistItem>;
  private notifications: PurchaseNotification[];

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.deals = new Map();
    this.reviews = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    this.notifications = [];
    this.seedData();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  private seedData() {
    // Seed Categories
    const categories: InsertCategory[] = [
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
    ];

    categories.forEach(cat => {
      const id = randomUUID();
      this.categories.set(id, { ...cat, id });
    });

    // Seed Products
    const products: InsertProduct[] = [
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
    ];

    products.forEach(prod => {
      const id = randomUUID();
      this.products.set(id, { ...prod, id });
    });

    // Seed Deals (flash deals use some products)
    const productArray = Array.from(this.products.values());
    const deals: InsertDeal[] = [
      {
        productId: productArray[0]?.id || "",
        title: "Flash Sale - Banarasi Silk Saree",
        endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        viewCount: 156,
        isActive: true,
      },
      {
        productId: productArray[3]?.id || "",
        title: "Limited Time - Anarkali Kurta Set",
        endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        viewCount: 89,
        isActive: true,
      },
      {
        productId: productArray[9]?.id || "",
        title: "Wedding Special - Premium Lehenga",
        endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        viewCount: 234,
        isActive: true,
      },
      {
        productId: productArray[13]?.id || "",
        title: "Designer Deal - Kundan Necklace",
        endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        viewCount: 67,
        isActive: true,
      },
    ];

    deals.forEach(deal => {
      const id = randomUUID();
      this.deals.set(id, { ...deal, id });
    });

    // Seed Reviews
    const reviews: InsertReview[] = [
      {
        productId: productArray[0]?.id || "",
        customerName: "Priya Sharma",
        customerLocation: "Mumbai",
        rating: 5,
        comment: "Absolutely stunning saree! The quality is exceptional and the zari work is beautiful. Received so many compliments at my friend's wedding!",
        date: "2 days ago",
        verified: true,
      },
      {
        productId: productArray[0]?.id || "",
        customerName: "Anjali Reddy",
        customerLocation: "Hyderabad",
        rating: 5,
        comment: "Perfect saree for special occasions. The silk is genuine and drapes beautifully. Worth every rupee!",
        date: "1 week ago",
        verified: true,
      },
      {
        productId: productArray[3]?.id || "",
        customerName: "Sneha Patel",
        customerLocation: "Ahmedabad",
        rating: 5,
        comment: "Lovely Anarkali set! The fit is perfect and the fabric quality is great. Very comfortable to wear all day.",
        date: "3 days ago",
        verified: true,
      },
      {
        productId: productArray[3]?.id || "",
        customerName: "Divya Iyer",
        customerLocation: "Chennai",
        rating: 4,
        comment: "Beautiful kurta set. The embroidery is nice but the color was slightly different from the picture. Still very happy with the purchase!",
        date: "5 days ago",
        verified: true,
      },
      {
        productId: productArray[6]?.id || "",
        customerName: "Riya Gupta",
        customerLocation: "Delhi",
        rating: 5,
        comment: "Love this maxi dress! Perfect for summer. The floral print is vibrant and the fabric is breathable.",
        date: "1 day ago",
        verified: true,
      },
      {
        productId: productArray[8]?.id || "",
        customerName: "Meera Shah",
        customerLocation: "Pune",
        rating: 5,
        comment: "These jeans fit like a dream! Finally found the perfect high-waisted jeans. Ordering in more colors!",
        date: "4 days ago",
        verified: true,
      },
    ];

    reviews.forEach(review => {
      const id = randomUUID();
      this.reviews.set(id, { ...review, id });
    });

    // Seed Purchase Notifications
    this.notifications = [
      {
        id: randomUUID(),
        customerName: "Priya",
        location: "Mumbai",
        productName: "Banarasi Silk Saree",
        timestamp: "2 minutes ago",
      },
      {
        id: randomUUID(),
        customerName: "Anjali",
        location: "Bangalore",
        productName: "Anarkali Kurta Set",
        timestamp: "5 minutes ago",
      },
      {
        id: randomUUID(),
        customerName: "Sneha",
        location: "Delhi",
        productName: "Designer Handbag",
        timestamp: "8 minutes ago",
      },
      {
        id: randomUUID(),
        customerName: "Divya",
        location: "Chennai",
        productName: "Floral Maxi Dress",
        timestamp: "12 minutes ago",
      },
    ];
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Deals
  async getAllDeals(): Promise<DealWithProduct[]> {
    const deals = Array.from(this.deals.values());
    const dealsWithProducts: DealWithProduct[] = [];

    for (const deal of deals) {
      const product = await this.getProduct(deal.productId);
      if (product) {
        dealsWithProducts.push({
          ...deal,
          product,
        });
      }
    }

    return dealsWithProducts;
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const newDeal: Deal = { ...deal, id };
    this.deals.set(id, newDeal);
    return newDeal;
  }

  // Reviews
  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.productId === productId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { ...review, id };
    this.reviews.set(id, newReview);
    return newReview;
  }

  // Cart
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      item => item.sessionId === sessionId
    );

    const itemsWithProducts: CartItemWithProduct[] = [];

    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        itemsWithProducts.push({
          ...item,
          product,
        });
      }
    }

    return itemsWithProducts;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      cartItem =>
        cartItem.productId === item.productId &&
        cartItem.sessionId === item.sessionId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += item.quantity;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const newItem: CartItem = { ...item, id };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItemQuantity(
    id: string,
    quantity: number
  ): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  // Purchase Notifications
  async getAllNotifications(): Promise<PurchaseNotification[]> {
    return this.notifications;
  }

  // Wishlist
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const items = Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
    const itemsWithProducts: WishlistItemWithProduct[] = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        itemsWithProducts.push({
          ...item,
          product,
        });
      }
    }
    
    return itemsWithProducts;
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const id = randomUUID();
    const wishlistItem: WishlistItem = {
      id,
      ...item,
      createdAt: new Date(),
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const item = Array.from(this.wishlistItems.entries()).find(
      ([_, item]) => item.userId === userId && item.productId === productId
    );
    if (item) {
      this.wishlistItems.delete(item[0]);
      return true;
    }
    return false;
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.wishlistItems.values()).some(
      item => item.userId === userId && item.productId === productId
    );
  }
}

// Database Storage Implementation
export class DBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return results[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const results = await db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return results[0];
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(schema.products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const results = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return results[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const results = await db.insert(schema.products).values(product).returning();
    return results[0];
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(schema.categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const results = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return results[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const results = await db.insert(schema.categories).values(category).returning();
    return results[0];
  }

  // Deals
  async getAllDeals(): Promise<DealWithProduct[]> {
    const dealsResult = await db.select().from(schema.deals).where(eq(schema.deals.isActive, true));
    
    const dealsWithProducts: DealWithProduct[] = [];
    for (const deal of dealsResult) {
      const product = await this.getProduct(deal.productId);
      if (product) {
        dealsWithProducts.push({
          ...deal,
          product,
        });
      }
    }
    
    return dealsWithProducts;
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const results = await db.select().from(schema.deals).where(eq(schema.deals.id, id));
    return results[0];
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const results = await db.insert(schema.deals).values(deal).returning();
    return results[0];
  }

  // Reviews
  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(schema.reviews);
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return await db.select().from(schema.reviews).where(eq(schema.reviews.productId, productId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const results = await db.insert(schema.reviews).values(review).returning();
    return results[0];
  }

  // Cart
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = await db.select().from(schema.cartItems).where(eq(schema.cartItems.sessionId, sessionId));
    
    const itemsWithProducts: CartItemWithProduct[] = [];
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        itemsWithProducts.push({
          ...item,
          product,
        });
      }
    }
    
    return itemsWithProducts;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = await db.select().from(schema.cartItems)
      .where(and(
        eq(schema.cartItems.productId, item.productId),
        eq(schema.cartItems.sessionId, item.sessionId)
      ));

    if (existing.length > 0) {
      // Update quantity
      const updated = await db.update(schema.cartItems)
        .set({ quantity: existing[0].quantity + item.quantity })
        .where(eq(schema.cartItems.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const results = await db.insert(schema.cartItems).values(item).returning();
    return results[0];
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const results = await db.update(schema.cartItems)
      .set({ quantity })
      .where(eq(schema.cartItems.id, id))
      .returning();
    return results[0];
  }

  async removeFromCart(id: string): Promise<boolean> {
    const results = await db.delete(schema.cartItems).where(eq(schema.cartItems.id, id)).returning();
    return results.length > 0;
  }

  // Purchase Notifications
  async getAllNotifications(): Promise<PurchaseNotification[]> {
    return await db.select().from(schema.purchaseNotifications);
  }

  // Wishlist
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const items = await db.select().from(schema.wishlistItems).where(eq(schema.wishlistItems.userId, userId));
    
    const itemsWithProducts: WishlistItemWithProduct[] = [];
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        itemsWithProducts.push({
          ...item,
          product,
        });
      }
    }
    
    return itemsWithProducts;
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const existing = await db.select().from(schema.wishlistItems)
      .where(and(
        eq(schema.wishlistItems.userId, item.userId),
        eq(schema.wishlistItems.productId, item.productId)
      ));

    if (existing.length > 0) {
      return existing[0];
    }

    const results = await db.insert(schema.wishlistItems).values(item).returning();
    return results[0];
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const results = await db.delete(schema.wishlistItems)
      .where(and(
        eq(schema.wishlistItems.userId, userId),
        eq(schema.wishlistItems.productId, productId)
      ))
      .returning();
    return results.length > 0;
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const results = await db.select().from(schema.wishlistItems)
      .where(and(
        eq(schema.wishlistItems.userId, userId),
        eq(schema.wishlistItems.productId, productId)
      ));
    return results.length > 0;
  }

  // Addresses
  async getUserAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(schema.addresses).where(eq(schema.addresses.userId, userId));
  }

  async getAddress(id: string): Promise<Address | undefined> {
    const results = await db.select().from(schema.addresses).where(eq(schema.addresses.id, id));
    return results[0];
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const results = await db.insert(schema.addresses).values(address).returning();
    return results[0];
  }

  async updateAddress(userId: string, id: string, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const existing = await this.getAddress(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    const { userId: _, ...updateData } = address;
    const results = await db.update(schema.addresses)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(
        eq(schema.addresses.id, id),
        eq(schema.addresses.userId, userId)
      ))
      .returning();
    return results[0];
  }

  async deleteAddress(userId: string, id: string): Promise<boolean> {
    const existing = await this.getAddress(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    const results = await db.delete(schema.addresses)
      .where(and(
        eq(schema.addresses.id, id),
        eq(schema.addresses.userId, userId)
      ))
      .returning();
    return results.length > 0;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const targetAddress = await this.getAddress(addressId);
    if (!targetAddress || targetAddress.userId !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    await db.update(schema.addresses)
      .set({ isDefault: false })
      .where(eq(schema.addresses.userId, userId));
    
    await db.update(schema.addresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(schema.addresses.id, addressId));
  }

  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const address = await this.getAddress(order.shippingAddressId);
    if (!address) {
      throw new Error("Shipping address not found");
    }
    
    if (address.userId !== order.userId) {
      throw new Error("Shipping address does not belong to user");
    }

    const orderResult = await db.insert(schema.orders).values(order).returning();
    const createdOrder = orderResult[0];

    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId: createdOrder.id,
    }));

    const orderItemsResult = await db.insert(schema.orderItems).values(itemsWithOrderId).returning();

    return {
      ...createdOrder,
      items: orderItemsResult,
      shippingAddress: address,
    };
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId));
    
    const ordersWithItems: OrderWithItems[] = [];
    for (const order of userOrders) {
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
      const address = await this.getAddress(order.shippingAddressId);
      
      ordersWithItems.push({
        ...order,
        items,
        shippingAddress: address!,
      });
    }
    
    return ordersWithItems;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const results = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    if (results.length === 0) return undefined;
    
    const order = results[0];
    const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
    const address = await this.getAddress(order.shippingAddressId);
    
    return {
      ...order,
      items,
      shippingAddress: address!,
    };
  }

  async updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<Order | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const results = await db.update(schema.orders)
      .set(updateData)
      .where(eq(schema.orders.id, id))
      .returning();
    return results[0];
  }
}

export const storage = new DBStorage();
