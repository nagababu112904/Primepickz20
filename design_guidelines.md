# Prime Pickz E-Commerce Landing Page - Design Guidelines (Updated)

## Design Approach

**Reference-Based Approach**: Drawing inspiration from India's biggest shopping festivals (Flipkart Big Billion Days, Amazon Great Indian Festival, Myntra EORS) with maximum visual energy and conversion-focused design. This high-octane approach prioritizes excitement, urgency, and festive shopping energy.

**Core Design Principles**:
- Festival shopping energy - bold, vibrant, can't-miss-it
- Mobile-first with thumb-optimized interactions
- Maximum visual impact through gradients and effects
- Urgency-driven layouts with animated elements
- Cultural celebration meets modern e-commerce

---

## Color System

**Primary Palette**:
- Electric Pink: Use HSL(340, 85%, 55%) to HSL(340, 90%, 65%) range
- Vibrant Purple: Use HSL(280, 75%, 55%) to HSL(280, 85%, 65%) range
- Gradient combinations: Pink-to-purple, purple-to-pink, multi-stop gradients

**Application Strategy**:
- Hero backgrounds: Diagonal or radial gradients (pink-purple)
- CTAs: Gradient fills with hover intensity shifts
- Section backgrounds: Alternating solid colors with gradient overlays
- Product cards: Gradient borders on hover (2px, pink-to-purple)
- Badges/tags: Solid vibrant pink or purple with white text
- Text overlays: White text with gradient text-fill for headlines
- Glowing effects: Pink/purple box-shadows with blur values 20-40px

**Contrast Requirements**:
- All text on gradients: White with text-shadow for readability
- Cards on vibrant backgrounds: White cards with subtle shadow
- Icons on colored backgrounds: White or light fills

---

## Typography System

**Font Families**:
- **Display**: Poppins or Montserrat (bold, impactful for headlines)
- **UI/Body**: Inter or DM Sans (clean readability)
- **Accent**: Bebas Neue or Archivo Black (for mega-sale announcements)

**Type Scale (Bold Emphasis)**:
- Mega headlines (flash sale): text-6xl to text-8xl (extrabold, uppercase)
- Hero headline: text-5xl to text-7xl (bold/extrabold)
- Section headers: text-4xl to text-5xl (bold, gradient text possible)
- Promotional banners: text-2xl to text-3xl (bold, all caps, tight tracking)
- Product titles: text-xl (semibold)
- Body: text-base to text-lg (regular/medium)
- Badges/countdown: text-sm to text-base (bold, uppercase)

**Typography Effects**:
- Gradient text fills for hero headlines
- Text shadows on light text over images (0 2px 4px rgba(0,0,0,0.3))
- Letter spacing: -0.02em for large headlines, 0.05em for uppercase labels

---

## Layout & Spacing System

**Spacing Primitives**: Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24

**Container Strategy**:
- Full-width gradient sections: w-full with inner max-w-7xl
- Product grids: max-w-screen-2xl for maximum density
- Content padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)

**Vertical Rhythm**:
- Section spacing: py-16 (mobile), py-20 (tablet), py-24 to py-32 (desktop)
- Flash sale banners: py-3 to py-4 (compact, urgent)
- Component spacing: space-y-10 to space-y-16

**Grid Systems**:
- Product cards: grid-cols-2 (mobile), grid-cols-3 (tablet), grid-cols-4 to grid-cols-5 (desktop)
- Category tiles: grid-cols-2 (mobile), grid-cols-3 (tablet), grid-cols-6 (desktop for maximum impact)
- Gaps: gap-4 to gap-6 with hover expansion

---

## Component Library

### Flash Sale Top Banner
- Height: h-12 to h-14, gradient background (pink-to-purple)
- Animated text scroll or ticker effect
- Countdown timer: inline, bold digits with separator colons
- Close button: absolute right, white icon

### Header & Navigation
- Sticky header: h-20, white background, shadow-xl on scroll
- Logo: h-10 to h-12, positioned left
- Search bar: Prominent center, rounded-full, h-12, gradient border on focus
- Icon cluster: Cart/wishlist/account, w-10 h-10 each, badge counters (pink circles)
- Mega menu: Full-width overlay, grid-cols-6, gradient hover states on categories

### Hero Section
- **Full-width with gradient background** (diagonal pink-to-purple)
- Height: min-h-[600px] (mobile), min-h-[700px] (desktop)
- **Large lifestyle image**: 1920x1080px, positioned right or center, slight parallax effect
- **Text content**: Positioned left or center-left with max-w-xl
- **Hero headline**: text-6xl to text-7xl, white with gradient text-fill effect
- **Subheadline**: text-xl to text-2xl, white with opacity-90
- **CTA buttons**: Large (h-14 to h-16), rounded-xl, gradient backgrounds with backdrop-blur, glowing shadow (pink), scale-110 on hover
- **Trust badges row**: Bottom section, flex layout, white icons with text, space-x-8
- **Animated elements**: Floating product badges, pulsing "NEW" indicators

### Product Carousels
- Horizontal scroll with snap-x, overflow indicators
- Card width: w-48 (mobile), w-64 (desktop)
- Navigation arrows: w-12 h-12, rounded-full, gradient fill, absolute positioning, scale-110 hover
- Auto-scroll with pause on hover
- Gap: gap-6 for breathing room

### Category Tiles
- Grid layout, aspect-ratio-square
- Image overlay: Gradient (bottom to transparent, purple/pink tint)
- Category name: Absolute bottom, text-2xl, bold, white
- Hover: scale-105, gradient border appears (4px), shadow-2xl
- Transition: transform duration-300

### Product Cards (High-Energy Version)
- Structure: Vertical, rounded-2xl, white background
- Image container: Aspect-ratio-square, overflow-hidden
- **Hover effects**: 
  - Image: scale-110 transform
  - Card: shadow-2xl with pink glow
  - Border: gradient border appears (2px pink-to-purple)
- **Badge stack**: Absolute top-3 left-3, colorful pills (pink/purple), bold text-xs
- **Wishlist icon**: Absolute top-3 right-3, w-10 h-10, white bg with pink heart, scale-125 on click
- **Discount percentage**: Large badge, text-2xl, bold, gradient background
- **Rating**: Star icons (text-yellow-400), inline count
- **Price section**: Current price (text-2xl, bold, gradient text), strikethrough original
- **Add to Cart**: Full-width, h-12, rounded-xl, gradient background, scale-105 hover, shadow glow

### Flash Deals Section
- Background: Gradient or vibrant solid pink/purple
- **Countdown timer**: Grid-cols-4, large digits (text-4xl to text-5xl), each unit in rounded container
- Deal cards: Grid layout, gradient borders, pulsing animation on "Almost Gone" items
- Progress bar: h-3, rounded-full, gradient fill showing stock depletion
- Urgency badges: "Only 3 left!", red background, pulse animation

### Promotional Banners (Between Sections)
- Full-width, h-24 to h-32
- Gradient backgrounds with diagonal stripes or patterns
- Bold text-3xl to text-4xl announcements
- Animated: Slide-in from sides, subtle bounce
- Multiple stacked if needed for different offers

### Testimonials & Social Proof
- Card design: p-6 to p-8, rounded-2xl, white, shadow-lg
- Customer photo: w-16 h-16, rounded-full, gradient border (3px)
- Star rating: Large (w-6 h-6), gold filled
- Quote: text-lg, medium weight
- Purchase popup notifications: Fixed bottom-6 left-6, slide-in animation, gradient background, auto-dismiss

### Footer
- Dark background (purple-900 or deep gradient)
- Multi-column grid: grid-cols-1 md:grid-cols-3 lg:grid-cols-5
- White text, links with pink hover
- Newsletter signup: Input with gradient border, button with pink gradient
- Social icons: w-10 h-10, gradient backgrounds, rounded-full
- Bottom bar: White text, centered or flex justify-between

### Mobile Bottom Navigation Bar
- Fixed bottom-0, h-16, white background, shadow-2xl
- Grid-cols-5: Home/Categories/Deals/Cart/Account
- Icons: w-6 h-6, active state with gradient color
- Badge counters on cart (pink circle)

---

## Images

**Hero Section Image**:
- Large lifestyle photograph (1920x1080px minimum)
- Features Indian models in vibrant Prime Pickz fashion
- Dynamic poses, energetic composition
- Positioned right side or full-width with text overlay left
- Mobile: Portrait crop (1080x1920px) with text bottom-positioned

**Category Tiles**:
- Square images (1000x1000px)
- Vibrant product photography with solid colored backgrounds (complementary to pink/purple)
- Consistent lighting and styling

**Product Cards**:
- Square format (1000x1000px)
- White or light neutral backgrounds
- Multiple angles for hover/quick-view
- Lifestyle shots showing products worn

**Banner Images**:
- Promotional graphics (1920x400px)
- Bold typography integrated into image design
- High contrast for visibility

**Social Proof**:
- Customer photos (200x200px minimum), authentic UGC style
- Circular crops for avatars

---

## Animation Strategy (Extensive)

**Page Load**:
- Hero elements: Stagger fade-in (headline → CTA → image)
- Product cards: Fade-in on scroll with 50ms stagger per item

**Hover Effects**:
- Product cards: Scale-105, shadow glow (pink), gradient border reveal (300ms ease)
- Buttons: Scale-105, brightness-110, shadow intensity increase
- Category tiles: Scale-105, gradient overlay shift
- Navigation links: Gradient underline slide-in

**Continuous Animations**:
- Flash sale badges: Gentle pulse (scale 1 to 1.05, 2s infinite)
- "New Arrival" tags: Subtle bounce every 3s
- Countdown timer digits: Flip animation on change
- Gradient backgrounds: Slow shift animation (10-15s infinite)

**Interaction Animations**:
- Add to Cart: Button transforms to checkmark, product flies to cart icon (500ms)
- Wishlist toggle: Heart fills with pink, scale bounce
- Cart badge: Number increment with scale bounce
- Image zoom: Smooth scale-125 on product hover

**Scroll Animations**:
- Section reveals: Fade-up (translate-y-10 to 0) on enter viewport
- Parallax: Hero image slight upward scroll (0.3x speed)

**Transition Properties**:
- Default: transition-all duration-300 ease-in-out
- Shadows: duration-300
- Transforms: duration-300
- Colors: duration-200

---

## Accessibility & Performance

- Touch targets: Minimum h-12 w-12 (mobile)
- Focus states: ring-2 ring-pink-500 ring-offset-2
- Reduced motion: Disable animations for users with prefers-reduced-motion
- Alt text: Descriptive product names
- Semantic HTML: Proper heading hierarchy
- Lazy loading: Images below fold
- Skeleton screens: Gradient pulse for loading states (pink-purple shimmer)