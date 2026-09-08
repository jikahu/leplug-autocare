import type { Product } from "@/lib/types";

const VEHICLE_MAKES = ["Toyota", "Subaru", "Nissan", "Mazda", "Mitsubishi", "Ford"];

type ProductSeed = {
  name: string;
  subcategory: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  makes?: string[];
  tags?: Product["tags"];
  stock?: Product["stock"];
  stockCount?: number;
  rating?: number;
  reviewCount?: number;
  features: string[];
  description: string;
  image?: string;
};

const SEEDS: Record<string, ProductSeed[]> = {
  exterior: [
    { name: "All-Weather Car Cover (Sedan)", subcategory: "car-covers", brand: "ShieldPro", price: 3200, features: ["UV-resistant polyester", "Elastic hem for a snug fit", "Machine washable"], description: "Full-body protection from sun, dust, and rain for sedans parked outdoors.", stock: "in_stock", rating: 4.5, reviewCount: 18, image: "https://images.pexels.com/photos/16438961/pexels-photo-16438961.jpeg" },
    { name: "LED Fog Light Kit", subcategory: "lighting", brand: "BrightBeam", price: 4500, compareAtPrice: 5500, makes: ["Toyota", "Subaru"], tags: ["Sale"], features: ["6000K white LED", "Plug-and-play harness", "IP67 waterproof"], description: "Bright, focused fog lighting for low-visibility driving conditions.", stock: "in_stock", rating: 4.7, reviewCount: 31, image: "https://images.pexels.com/photos/9793498/pexels-photo-9793498.jpeg" },
    { name: "Sport Rear Spoiler", subcategory: "spoilers", brand: "AeroForm", price: 8900, makes: ["Nissan", "Mazda"], features: ["ABS plastic construction", "Paint-ready primer finish", "Includes mounting hardware"], description: "A subtle aerodynamic addition that sharpens the rear profile.", stock: "low_stock", stockCount: 2, rating: 4.2, reviewCount: 9, image: "https://images.pexels.com/photos/17489891/pexels-photo-17489891.jpeg" },
    { name: "Heavy-Duty Mud Flaps (Set of 4)", subcategory: "mud-flaps", brand: "TerraGuard", price: 1800, features: ["Flexible rubber compound", "No-drill mounting", "Fits most sedans and SUVs"], description: "Keeps mud and road spray off your paintwork on Nairobi's unpaved roads.", stock: "in_stock", rating: 4.4, reviewCount: 22, image: "https://images.pexels.com/photos/31574041/pexels-photo-31574041.jpeg" },
    { name: "Wind Deflector Set (Front Windows)", subcategory: "wind-breakers", brand: "ClearAir", price: 2600, features: ["Smoke-tint acrylic", "3M adhesive mount", "Reduces cabin wind noise"], description: "Crack your windows for airflow without the wind noise or rain.", stock: "in_stock", rating: 4.1, reviewCount: 14, image: "https://images.pexels.com/photos/9784181/pexels-photo-9784181.jpeg" },
    { name: "Frameless Wiper Blades (Pair)", subcategory: "wipers", brand: "ClearView", price: 1500, tags: ["Bestseller"], features: ["Aerodynamic frameless design", "All-season silicone edge", "Universal J-hook adapter"], description: "Streak-free wiping in Nairobi's rainy season.", stock: "in_stock", rating: 4.6, reviewCount: 47, image: "https://images.pexels.com/photos/15389084/pexels-photo-15389084.jpeg" },
    { name: "Bonnet Bra Protector", subcategory: "car-covers", brand: "ShieldPro", price: 2900, makes: ["Toyota"], features: ["Scratch-resistant vinyl", "Adjustable straps", "Custom sedan fit"], description: "Protects your bonnet's paint from chips on long highway drives.", stock: "in_stock", rating: 4.1, reviewCount: 10, image: "https://images.pexels.com/photos/12920563/pexels-photo-12920563.jpeg" },
  ],
  interior: [
    { name: "Premium Leatherette Seat Covers (Full Set)", subcategory: "seat-covers", brand: "LuxeFit", price: 12500, makes: ["Toyota", "Nissan"], tags: ["Bestseller"], features: ["Water-resistant leatherette", "Airbag-compatible design", "Fits 5-seater sedans"], description: "A full interior refresh with a premium leather look and easy-clean surface.", stock: "in_stock", rating: 4.8, reviewCount: 63, image: "https://images.pexels.com/photos/7762716/pexels-photo-7762716.jpeg" },
    { name: "3D Molded Floor Mats", subcategory: "floor-mats", brand: "TerraGuard", price: 4200, makes: ["Subaru", "Mazda"], features: ["Raised edges trap mud and water", "Odorless TPE material", "Custom-fit per model"], description: "Full coverage floor protection built for Nairobi's rainy commutes.", stock: "in_stock", rating: 4.6, reviewCount: 38, image: "https://images.pexels.com/photos/5378419/pexels-photo-5378419.jpeg" },
    { name: "Carbon-Fiber Dashboard Cover", subcategory: "dashboard-covers", brand: "AeroForm", price: 3100, features: ["Anti-glare matte finish", "UV-protective layer", "No-drill adhesive install"], description: "Cuts dashboard glare and protects against sun damage.", stock: "in_stock", rating: 4.0, reviewCount: 11, image: "https://images.pexels.com/photos/29054556/pexels-photo-29054556.jpeg" },
    { name: "Backseat Organizer with Tablet Holder", subcategory: "organizers", brand: "TidyRide", price: 2200, tags: ["New"], features: ["Multiple storage pockets", "Adjustable tablet mount", "Waterproof lining"], description: "Keeps the back seat tidy on longer family trips.", stock: "in_stock", rating: 4.3, reviewCount: 7, image: "https://images.pexels.com/photos/30563031/pexels-photo-30563031.jpeg" },
    { name: "Suede Steering Wheel Cover", subcategory: "steering-covers", brand: "GripTech", price: 1600, features: ["Non-slip suede grip", "Breathable microfiber lining", "Fits 36-38cm wheels"], description: "A better grip and a premium feel on every drive.", stock: "in_stock", rating: 4.4, reviewCount: 25, image: "https://images.pexels.com/photos/5180905/pexels-photo-5180905.jpeg" },
    { name: "Car Fragrance Set (4 Scents)", subcategory: "car-fragrance", brand: "PureAir", price: 950, tags: ["Bestseller"], features: ["Long-lasting vent clips", "4 scent variety pack", "Adjustable intensity"], description: "Keep the cabin smelling fresh on every drive.", stock: "in_stock", rating: 4.5, reviewCount: 54, image: "https://images.pexels.com/photos/8281437/pexels-photo-8281437.jpeg" },
    { name: "Memory Foam Lumbar Cushion", subcategory: "seat-covers", brand: "LuxeFit", price: 2400, features: ["Ergonomic lumbar support", "Breathable mesh cover", "Adjustable strap mount"], description: "Reduces back fatigue on long drives or daily traffic.", stock: "low_stock", stockCount: 4, rating: 4.2, reviewCount: 16, image: "https://images.pexels.com/photos/8387437/pexels-photo-8387437.jpeg" },
  ],
  "performance-service-parts": [
    { name: "Ceramic Brake Pads (Front Set)", subcategory: "brake-pads", brand: "StopSure", price: 5400, makes: ["Toyota", "Nissan"], tags: ["Bestseller"], features: ["Low-dust ceramic compound", "Reduced brake noise", "OEM fitment"], description: "Reliable stopping power with less brake dust on your rims.", stock: "in_stock", rating: 4.7, reviewCount: 41, image: "https://images.pexels.com/photos/14231682/pexels-photo-14231682.jpeg" },
    { name: "High-Flow Oil Filter", subcategory: "oil-filters", brand: "FlowMax", price: 850, makes: ["Toyota", "Subaru", "Mazda"], features: ["Anti-drainback valve", "High dirt-holding capacity", "Fits most 4-cylinder engines"], description: "Keeps engine oil clean between service intervals.", stock: "in_stock", rating: 4.5, reviewCount: 29, image: "https://images.pexels.com/photos/16539587/pexels-photo-16539587.jpeg" },
    { name: "Iridium Spark Plugs (Set of 4)", subcategory: "spark-plugs", brand: "IgniPro", price: 3600, makes: ["Toyota", "Mitsubishi"], features: ["Iridium center electrode", "Improved fuel efficiency", "100,000km rated lifespan"], description: "Smoother idling and better fuel economy from a cleaner spark.", stock: "in_stock", rating: 4.6, reviewCount: 33, image: "https://images.pexels.com/photos/30674526/pexels-photo-30674526.jpeg" },
    { name: "Maintenance-Free Car Battery 12V 65Ah", subcategory: "batteries", brand: "VoltCore", price: 9800, tags: ["Bestseller"], features: ["Sealed maintenance-free design", "2-year warranty", "High cold-cranking amps"], description: "Dependable starting power, even on cold mornings.", stock: "in_stock", rating: 4.8, reviewCount: 52, image: "https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg" },
    { name: "LED Headlight Bulbs H4 (Pair)", subcategory: "bulbs", brand: "BrightBeam", price: 3400, compareAtPrice: 4200, tags: ["Sale"], features: ["6500K daylight white", "Plug-and-play CANbus ready", "50,000-hour lifespan"], description: "A brighter, whiter upgrade over stock halogen bulbs.", stock: "in_stock", rating: 4.4, reviewCount: 27, image: "https://images.pexels.com/photos/995468/pexels-photo-995468.jpeg" },
    { name: "Performance Air Filter", subcategory: "oil-filters", brand: "FlowMax", price: 2100, makes: ["Nissan", "Ford"], features: ["Washable and reusable", "Increased airflow", "Direct OEM replacement"], description: "A reusable upgrade that improves throttle response.", stock: "out_of_stock", rating: 4.1, reviewCount: 8, image: "https://images.pexels.com/photos/20094998/pexels-photo-20094998.jpeg" },
  ],
  "car-care-detailing": [
    { name: "Premium Car Shampoo (1L)", subcategory: "cleaning-products", brand: "ShineWorks", price: 1200, tags: ["Bestseller"], features: ["pH-balanced formula", "Rich foam, safe on wax", "Concentrated — up to 40 washes"], description: "A gentle, high-foam wash that won't strip existing wax.", stock: "in_stock", rating: 4.7, reviewCount: 66, image: "https://images.pexels.com/photos/6872575/pexels-photo-6872575.jpeg" },
    { name: "Carnauba Wax Polish (500ml)", subcategory: "polish", brand: "ShineWorks", price: 2400, features: ["Deep gloss carnauba blend", "UV protection layer", "Lasts up to 3 months"], description: "A show-quality shine with lasting weather protection.", stock: "in_stock", rating: 4.6, reviewCount: 34, image: "https://images.pexels.com/photos/4969923/pexels-photo-4969923.jpeg" },
    { name: "Tire Shine Gel (500ml)", subcategory: "tire-shine", brand: "ShineWorks", price: 950, features: ["Long-lasting matte-to-gloss finish", "No sling formula", "UV-resistant"], description: "A rich, non-greasy shine that resists flinging onto your paint.", stock: "in_stock", rating: 4.3, reviewCount: 19, image: "https://images.pexels.com/photos/5236129/pexels-photo-5236129.jpeg" },
    { name: "Complete Detailing Kit (8-Piece)", subcategory: "protection-kits", brand: "DetailPro", price: 6500, tags: ["New"], features: ["Shampoo, wax, microfiber towels, applicator pads", "All-in-one storage case", "Suitable for full exterior + interior detailing"], description: "Everything needed for a full weekend detailing session.", stock: "in_stock", rating: 4.5, reviewCount: 12, image: "https://images.pexels.com/photos/6873020/pexels-photo-6873020.jpeg" },
    { name: "Ceramic Paint Sealant (250ml)", subcategory: "protection-kits", brand: "DetailPro", price: 4800, features: ["9H hardness ceramic coating", "Hydrophobic finish", "Up to 6 months protection"], description: "Long-term paint protection with an easy DIY application.", stock: "low_stock", stockCount: 3, rating: 4.4, reviewCount: 15, image: "https://images.pexels.com/photos/10557902/pexels-photo-10557902.jpeg" },
    { name: "Vent-Clip Air Freshener (Citrus)", subcategory: "air-fresheners", brand: "PureAir", price: 450, features: ["30-day scent release", "Adjustable fragrance intensity", "Discreet vent-clip design"], description: "A clean citrus scent that doesn't overpower the cabin.", stock: "in_stock", rating: 4.2, reviewCount: 21, image: "https://images.pexels.com/photos/26561324/pexels-photo-26561324.jpeg" },
    { name: "Interior Trim Cleaner (500ml)", subcategory: "cleaning-products", brand: "ShineWorks", price: 1100, features: ["Anti-static formula", "UV-fade protection for plastics", "Streak-free finish"], description: "Restores faded interior plastics without a greasy residue.", stock: "in_stock", rating: 4.3, reviewCount: 12, image: "https://images.pexels.com/photos/4218861/pexels-photo-4218861.jpeg" },
    { name: "Glass Cleaner (500ml)", subcategory: "cleaning-products", brand: "ShineWorks", price: 700, tags: ["Bestseller"], features: ["Ammonia-free formula", "Streak-free on tinted windows", "Anti-fog additive"], description: "A safe, streak-free clean for windshields and tinted glass.", stock: "in_stock", rating: 4.5, reviewCount: 28, image: "https://images.pexels.com/photos/7154632/pexels-photo-7154632.jpeg" },
    { name: "Leather Conditioner (250ml)", subcategory: "polish", brand: "DetailPro", price: 1900, features: ["UV-protective conditioning oils", "Restores suppleness to worn leather", "Non-greasy finish"], description: "Keeps leather seats supple and crack-free in Nairobi's sun.", stock: "in_stock", rating: 4.4, reviewCount: 17, image: "https://images.pexels.com/photos/29293845/pexels-photo-29293845.jpeg" },
  ],
  "electronics-security": [
    { name: "1080p Dual Dash Cam", subcategory: "dash-cams", brand: "ViewGuard", price: 7200, tags: ["Bestseller"], features: ["Front and rear 1080p recording", "Night vision sensor", "Loop recording with G-sensor"], description: "Front and rear coverage for evidence you can trust.", stock: "in_stock", rating: 4.6, reviewCount: 44, image: "https://images.pexels.com/photos/3683938/pexels-photo-3683938.jpeg" },
    { name: "Car Alarm & Immobilizer System", subcategory: "alarms", brand: "SecureDrive", price: 5600, makes: ["Toyota", "Subaru", "Nissan"], features: ["Remote arm/disarm", "Shock sensor with adjustable sensitivity", "Engine immobilizer relay"], description: "An extra layer of theft deterrence for street parking.", stock: "in_stock", rating: 4.5, reviewCount: 23, image: "https://images.pexels.com/photos/4930676/pexels-photo-4930676.jpeg" },
    { name: "Rear Parking Sensor Kit (4 Sensors)", subcategory: "parking-sensors", brand: "SecureDrive", price: 3900, features: ["4-sensor rear coverage", "In-cabin audio + display alert", "Simple bumper-mount install"], description: "Confident reversing in tight Nairobi parking spots.", stock: "in_stock", rating: 4.3, reviewCount: 17, image: "https://images.pexels.com/photos/167630/pexels-photo-167630.jpeg" },
    { name: "Bluetooth Car Stereo (Double-DIN)", subcategory: "car-stereo-speakers", brand: "SoundDrive", price: 8900, tags: ["New"], features: ["Bluetooth + USB + AUX input", "7-inch touchscreen display", "Steering wheel control compatible"], description: "Modern connectivity for older stereo units.", stock: "in_stock", rating: 4.4, reviewCount: 13, image: "https://images.pexels.com/photos/6817002/pexels-photo-6817002.jpeg" },
    { name: "6.5-inch Coaxial Speakers (Pair)", subcategory: "car-stereo-speakers", brand: "SoundDrive", price: 4200, features: ["Full-range coaxial design", "Easy factory mount replacement", "Balanced mid and treble response"], description: "A clear upgrade over factory-standard door speakers.", stock: "in_stock", rating: 4.5, reviewCount: 20, image: "https://images.pexels.com/photos/9604953/pexels-photo-9604953.jpeg" },
    { name: "Steering Wheel Lock", subcategory: "alarms", brand: "SecureDrive", price: 2200, features: ["High-visibility red finish", "Hardened steel bar", "Universal steering wheel fit"], description: "A visible theft deterrent for street parking overnight.", stock: "in_stock", rating: 4.2, reviewCount: 15, image: "https://images.pexels.com/photos/1672004/pexels-photo-1672004.jpeg" },
    { name: "GPS Vehicle Tracker", subcategory: "alarms", brand: "ViewGuard", price: 6800, tags: ["New"], makes: ["Toyota", "Nissan"], features: ["Real-time location via app", "Geofence alerts", "Hidden wiring install"], description: "Track your vehicle's location in real time from your phone.", stock: "in_stock", rating: 4.6, reviewCount: 9, image: "https://images.pexels.com/photos/13062233/pexels-photo-13062233.jpeg" },
  ],
  safety: [
    { name: "Heavy-Duty Jumper Cables (3m)", subcategory: "jumper-cables", brand: "VoltCore", price: 1800, tags: ["Bestseller"], features: ["Copper-clad aluminum core", "Insulated color-coded clamps", "500A peak capacity"], description: "Reliable jump-starts without the guesswork.", stock: "in_stock", rating: 4.6, reviewCount: 36, image: "https://images.pexels.com/photos/6907042/pexels-photo-6907042.jpeg" },
    { name: "Reflective Warning Triangles (Set of 2)", subcategory: "reflectors", brand: "SafeRoad", price: 900, features: ["High-visibility reflective panels", "Foldable for compact storage", "Meets standard road safety specs"], description: "Essential roadside visibility for breakdowns at night.", stock: "in_stock", rating: 4.4, reviewCount: 18, image: "https://images.pexels.com/photos/5056745/pexels-photo-5056745.jpeg" },
    { name: "Adjustable Safety Seat Belt Extender", subcategory: "safety-belts", brand: "SafeRoad", price: 650, features: ["Universal buckle fit", "Reinforced webbing", "Easy snap-in install"], description: "A comfortable, secure fit for every passenger.", stock: "in_stock", rating: 4.0, reviewCount: 6, image: "https://images.pexels.com/photos/38053876/pexels-photo-38053876.jpeg" },
    { name: "Roadside Emergency Kit (22-Piece)", subcategory: "emergency-kits", brand: "SafeRoad", price: 3200, tags: ["New"], features: ["Jumper cables, tow rope, gloves, first aid basics", "Compact storage bag", "Reflective vest included"], description: "One kit covering the essentials for common roadside issues.", stock: "in_stock", rating: 4.5, reviewCount: 14, image: "https://images.pexels.com/photos/5664736/pexels-photo-5664736.jpeg" },
    { name: "Portable Tire Inflator (12V)", subcategory: "emergency-kits", brand: "VoltCore", price: 4500, features: ["Digital pressure gauge", "12V cigarette lighter plug", "LED work light"], description: "Top up tire pressure anywhere, no compressor needed.", stock: "low_stock", stockCount: 2, rating: 4.3, reviewCount: 22, image: "https://images.pexels.com/photos/3807450/pexels-photo-3807450.jpeg" },
    { name: "Fire Extinguisher (1kg, Car-Mount)", subcategory: "emergency-kits", brand: "SafeRoad", price: 2100, features: ["ABC dry powder type", "Compact car-mount bracket", "Pressure gauge indicator"], description: "A compact, mountable extinguisher sized for car interiors.", stock: "in_stock", rating: 4.5, reviewCount: 11, image: "https://images.pexels.com/photos/4805958/pexels-photo-4805958.jpeg" },
  ],
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const products: Product[] = Object.entries(SEEDS).flatMap(([category, seeds]) =>
  seeds.map((seed, index) => {
    const slug = slugify(seed.name);
    return {
      id: `${category}-${index + 1}`,
      slug,
      sku: `LP-${category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      name: seed.name,
      category,
      subcategory: seed.subcategory,
      compatibleMakes: seed.makes,
      brand: seed.brand,
      price: seed.price,
      compareAtPrice: seed.compareAtPrice,
      images: [seed.image ?? `/images/products/${slug}.jpg`],
      description: seed.description,
      keyFeatures: seed.features,
      stock: seed.stock ?? "in_stock",
      stockCount: seed.stockCount,
      rating: seed.rating,
      reviewCount: seed.reviewCount,
      tags: seed.tags,
    };
  })
);

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export const ALL_VEHICLE_MAKES = VEHICLE_MAKES;
