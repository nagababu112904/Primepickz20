# Prime Pickz E-Commerce Landing Page - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from leading e-commerce platforms (Amazon India, Flipkart, Myntra, ASOS) while creating a distinctive identity for Prime Pickz. This approach balances familiar e-commerce patterns with unique visual personality suited for Indian lifestyle shopping.

**Core Design Principles**:
- Mobile-first, thumb-optimized layouts
- Information density balanced with breathing room
- Trust-building through visual hierarchy
- Cultural relevance for Indian shoppers
- Conversion-focused visual flow

---

## Typography System

**Font Families**:
- **Primary**: Inter or DM Sans (clean, modern, excellent for UI)
- **Accent/Display**: Poppins or Manrope (friendly, slightly rounded for warmth)
- **Supporting**: Noto Sans Devanagari (for Hindi multilingual support)

**Type Scale**:
- Hero headline: text-5xl to text-6xl (bold/extrabold)
- Section headers: text-3xl to text-4xl (bold)
- Card titles/product names: text-lg to text-xl (semibold)
- Body/descriptions: text-base (regular)
- Captions/metadata: text-sm (medium)
- Micro-copy (badges, labels): text-xs to text-sm (medium/semibold)

**Hierarchy Rules**:
- All CTAs: semibold to bold weight
- Product prices: bold weight, larger than surrounding text
- Discount percentages: bold, all caps
- Trust badges: medium weight, uppercase tracking

---

## Layout & Spacing System

**Spacing Primitives**: Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24

**Container Strategy**:
- Full-width: Sections with background treatments
- Max-width container: max-w-7xl for content areas
- Product grids: max-w-screen-2xl for wide layouts
- Padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)

**Vertical Rhythm**:
- Section spacing: py-12 (mobile), py-16 (tablet), py-20 to py-24 (desktop)
- Component spacing within sections: space-y-8 to space-y-12
- Card internal padding: p-4 to p-6

**Grid Systems**:
- Product cards: grid-cols-2 (mobile), grid-cols-3 (tablet), grid-cols-4 to grid-cols-5 (desktop)
- Category tiles: grid-cols-2 (mobile), grid-cols-3 (tablet), grid-cols-4 (desktop)
- Feature icons: grid-cols-2 (mobile), grid-cols-4 (desktop)
- Gap spacing: gap-4 to gap-6

---

## Component Library

### Header & Navigation
- **Sticky header**: h-16 to h-20, shadow-md on scroll
- **Top bar** (flash sale): h-10, text-sm, centered message with timer
- **Search bar**: Prominent, rounded-lg, with icon positioning (left: search, right: voice/microphone)
- **Icon buttons**: w-10 h-10, relative positioning for badge counters
- **Mega menu dropdown**: Full-width overlay, grid-cols-4 to grid-cols-6, rich with category images (size: 80x80px to 120x120px)
- **Mobile hamburger**: Three-line icon, opens full-screen overlay menu

### Hero Section
- **Layout**: Full-width with max-w-7xl inner container
- **Height**: min-h-[500px] (mobile), min-h-[600px] (desktop)
- **CTA placement**: Absolute positioning or flexbox centering, buttons with backdrop-blur-md bg-white/90
- **Trust badges row**: Flex layout, space-x-6, icons + text inline
- **Live stats ticker**: Positioned at bottom, subtle animation, text-sm

### Product Carousels
- **Container**: Horizontal scroll (snap-x snap-mandatory) or library-based slider
- **Card dimensions**: w-40 to w-48 (mobile), w-56 to w-64 (desktop)
- **Spacing**: gap-4 between cards
- **Navigation arrows**: Absolute positioned, w-10 h-10, rounded-full, -left-5/-right-5
- **Scroll indicators**: Dots below carousel, gap-2, w-2 h-2

### Category Tiles
- **Layout**: Grid with aspect-ratio-square or aspect-[4/3]
- **Overlay treatment**: Gradient overlay (linear-gradient bottom to transparent)
- **Text positioning**: Absolute bottom, p-4 to p-6
- **Hover state**: Scale-105 transform, subtle shadow increase

### Product Cards
- **Structure**: Vertical flex layout
- **Image container**: Aspect-ratio-square with rounded-t-lg
- **Wishlist icon**: Absolute top-2 right-2, w-8 h-8
- **Badge positioning**: Absolute top-2 left-2, multiple badges stacked with space-y-1
- **Content padding**: p-3 to p-4
- **Rating display**: Flex row, star icons + count, text-xs to text-sm
- **Price layout**: Flex row with items-baseline, gap-2
- **CTA button**: Full-width, rounded-lg, h-10 to h-12

### Flash Deals Section
- **Timer display**: Large digits (text-2xl to text-3xl), grid-cols-4 (Days:Hours:Mins:Secs)
- **Card treatment**: Border accent, shadow-lg, rounded-xl
- **Urgency indicators**: Inline badges, text-xs, semibold
- **Progress bar**: h-2, rounded-full, relative positioning for percentage fill

### Social Proof Elements
- **Testimonial cards**: p-6, rounded-xl, shadow-md, min-h-48
- **Customer photo**: w-12 h-12, rounded-full, border-2
- **Star ratings**: Flex row, gap-0.5, w-4 h-4 per star
- **Purchase notifications**: Fixed bottom-4 left-4, slide-in animation, max-w-sm

### Mini-Cart Dropdown
- **Dimensions**: w-80 to w-96, max-h-96
- **Positioning**: Absolute right-0, top-full, mt-2
- **Shadow**: shadow-2xl for depth
- **Item layout**: Flex row, gap-3, p-3, border-b last:border-0
- **Thumbnail**: w-16 h-16, rounded

### Footer
- **Layout**: Multi-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- **Column spacing**: gap-8 to gap-12
- **Link styling**: text-sm, space-y-2 to space-y-3
- **Social icons**: Flex row, gap-3, w-8 h-8
- **Bottom bar**: Border-top, py-6, flex justify-between

### Mobile-Specific Components
- **Bottom navigation**: Fixed bottom-0, h-16, grid-cols-4 or grid-cols-5
- **Sticky CTA bar**: Fixed bottom-0, p-4, shadow-2xl
- **Hamburger menu**: Full-screen overlay, slide-in animation
- **Touch targets**: Minimum h-12 w-12 for all interactive elements

---

## Images

**Hero Section**:
- Large banner image (1920x1080px minimum, 16:9 aspect ratio)
- Professional lifestyle photography featuring Indian models wearing Prime Pickz products
- Vibrant, energetic composition with clear focal point
- Text overlay with readability ensured through gradient/blur treatment
- Mobile version: portrait orientation (9:16) cropped appropriately

**Category Tiles**:
- Square or 4:3 ratio images (800x800px or 800x600px)
- Clean product photography on solid or minimal backgrounds
- Consistent styling across all category images

**Product Images**:
- Square format (800x800px minimum)
- Multiple angles available for quick-view
- Lifestyle shots showing products in use
- Zoom capability on hover (desktop)

**Social Proof**:
- Customer photos: 120x120px minimum, circular crop
- UGC-style authentic photography

**Trust Badges & Icons**:
- Vector-based icons from Heroicons or Font Awesome
- Payment logos: Official brand assets
- Certification badges: High-resolution PNG/SVG

---

## Accessibility & Performance

- All interactive elements: Minimum 44x44px touch targets (mobile)
- Focus states: ring-2 ring-offset-2 for keyboard navigation
- Image alt text: Descriptive product names and features
- Semantic HTML: Proper heading hierarchy (h1 > h2 > h3)
- Loading states: Skeleton screens with pulse animation for carousels and product grids
- Lazy loading: Images below fold use loading="lazy"

---

## Animation Strategy (Minimal)

- Hover effects: Scale-105, opacity changes, subtle shadow growth
- Page transitions: Fade-in for content sections (on scroll, once)
- Cart actions: Slide-in notifications, badge number increments
- Carousels: Smooth auto-scroll with user control
- Loading: Skeleton pulse, spinner for data fetching
- **Avoid**: Excessive parallax, complex scroll-triggered animations, distracting motion