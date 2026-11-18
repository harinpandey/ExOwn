export interface Attribute {
  id: string;
  label: string;
  type: "chips" | "buttons" | "toggle" | "dropdown";
  options?: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  attributes?: Attribute[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
  commonAttributes: Attribute[];
}

export const CATEGORIES: Category[] = [
  {
    id: "mobiles",
    name: "Mobiles & Gadgets",
    slug: "mobiles-gadgets",
    icon: "Smartphone",
    commonAttributes: [
      { id: "brand", label: "Brand", type: "chips", options: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Other"] },
      { id: "screen_condition", label: "Screen Condition", type: "buttons", options: ["Pristine", "Minor Scratches", "Cracked"] },
      { id: "accessories", label: "Accessories Included", type: "chips", options: ["Charger", "Box", "Case", "Bill"] }
    ],
    subcategories: [
      { 
        id: "iphones", 
        name: "iPhones",
        attributes: [
          { id: "storage", label: "Storage", type: "chips", options: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
          { id: "battery_health", label: "Battery Health", type: "buttons", options: ["90%+", "80-90%", "Below 80%"] }
        ]
      },
      { 
        id: "android-phones", 
        name: "Android Phones",
        attributes: [
          { id: "storage", label: "Storage", type: "chips", options: ["64GB", "128GB", "256GB", "512GB"] },
          { id: "ram", label: "RAM", type: "chips", options: ["4GB", "6GB", "8GB", "12GB+"] }
        ]
      },
      { id: "tablets", name: "Tablets" },
      { id: "smartwatch", name: "Smartwatch" },
      { id: "earbuds", name: "Earbuds" },
      { id: "chargers", name: "Chargers" },
      { id: "power-banks", name: "Power Banks" },
      { id: "mobile-accessories", name: "Mobile Accessories" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "electronics",
    name: "Electronics & Appliances",
    slug: "electronics-appliances",
    icon: "Tv",
    commonAttributes: [
      { id: "brand", label: "Brand", type: "dropdown", options: ["Sony", "Samsung", "LG", "HP", "Dell", "Other"] },
      { id: "working_condition", label: "Working Condition", type: "buttons", options: ["Perfect", "Minor Issues", "Parts Only"] },
      { id: "warranty", label: "Warranty Remaining", type: "buttons", options: ["None", "< 6 Months", "6+ Months"] }
    ],
    subcategories: [
      { id: "tv", name: "TV" },
      { id: "speaker", name: "Speaker" },
      { id: "camera", name: "Camera" },
      { id: "fan", name: "Fan" },
      { id: "fridge", name: "Fridge" },
      { id: "ac", name: "AC" },
      { id: "washing-machine", name: "Washing Machine" },
      { id: "kitchen-appliances", name: "Kitchen Appliances" },
      { id: "cooler", name: "Cooler" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "computers",
    name: "Computers & Laptops",
    slug: "computers-laptops",
    icon: "Laptop",
    commonAttributes: [
      { id: "brand", label: "Brand", type: "chips", options: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Other"] },
      { id: "processor", label: "Processor", type: "chips", options: ["M1/M2/M3", "Intel i7/i9", "Intel i5", "AMD Ryzen 7/9", "AMD Ryzen 5"] }
    ],
    subcategories: [
      { 
        id: "laptop", 
        name: "Laptop",
        attributes: [
          { id: "ram", label: "RAM", type: "chips", options: ["8GB", "16GB", "32GB+"] },
          { id: "storage", label: "Storage", type: "chips", options: ["256GB SSD", "512GB SSD", "1TB SSD"] },
          { id: "battery_health", label: "Battery Health", type: "buttons", options: ["Good", "Normal", "Service Required"] }
        ]
      },
      { id: "desktop", name: "Desktop" },
      { id: "monitor", name: "Monitor" },
      { id: "printer", name: "Printer" },
      { id: "keyboard", name: "Keyboard" },
      { id: "mouse", name: "Mouse" },
      { id: "router", name: "Router" },
      { id: "hard-drive", name: "Hard Drive" },
      { id: "ssd", name: "SSD" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "furniture",
    name: "Furniture & Hostel Essentials",
    slug: "furniture-hostel",
    icon: "Bed",
    commonAttributes: [
      { id: "material", label: "Material", type: "chips", options: ["Wood", "Metal", "Plastic", "Fabric"] },
      { id: "condition", label: "Physical Condition", type: "buttons", options: ["Like New", "Good", "Used"] },
      { id: "usage", label: "Usage Duration", type: "dropdown", options: ["< 6 Months", "6-12 Months", "1-2 Years", "2+ Years"] }
    ],
    subcategories: [
      { id: "chair", name: "Chair" },
      { id: "study-table", name: "Study Table" },
      { id: "bed", name: "Bed" },
      { id: "mattress", name: "Mattress" },
      { id: "storage-rack", name: "Storage Rack" },
      { id: "lamp", name: "Lamp" },
      { id: "fan", name: "Fan" },
      { id: "mirror", name: "Mirror" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    icon: "Shirt",
    commonAttributes: [
      { id: "brand", label: "Brand", type: "dropdown", options: ["Nike", "Adidas", "Zara", "H&M", "Puma", "Other"] },
      { id: "condition", label: "Condition", type: "buttons", options: ["New with Tags", "Gently Used", "Well Worn"] },
      { id: "packaging", label: "Original Packaging", type: "toggle" }
    ],
    subcategories: [
      { id: "shoes", name: "Shoes", attributes: [{ id: "size", label: "Size (UK/US)", type: "chips", options: ["7", "8", "9", "10", "11"] }] },
      { id: "bags", name: "Bags" },
      { id: "watches", name: "Watches" },
      { id: "jackets", name: "Jackets" },
      { id: "mens-wear", name: "Men's Wear" },
      { id: "womens-wear", name: "Women's Wear" },
      { id: "accessories", name: "Accessories" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "books",
    name: "Books, Sports & Hobbies",
    slug: "books-sports-hobbies",
    icon: "BookOpen",
    commonAttributes: [
      { id: "condition", label: "Condition", type: "buttons", options: ["Pristine", "Good", "Worn"] },
      { id: "marks", label: "Highlights/Marks", type: "toggle" }
    ],
    subcategories: [
      { 
        id: "textbooks", 
        name: "Textbooks",
        attributes: [
          { id: "subject", label: "Subject", type: "dropdown", options: ["CSE", "ECE", "ME", "Civil", "Management", "Other"] },
          { id: "edition", label: "Edition/Year", type: "chips", options: ["Latest", "2023", "2022", "Older"] }
        ]
      },
      { id: "notes", name: "Notes" },
      { id: "calculators", name: "Calculators" },
      { id: "sports-gear", name: "Sports Equipment" },
      { id: "musical-instruments", name: "Musical Instruments" },
      { id: "hobby-kits", name: "Hobby Kits" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "vehicles",
    name: "Vehicles",
    slug: "vehicles",
    icon: "Car",
    commonAttributes: [
      { id: "brand", label: "Brand", type: "dropdown", options: ["Hero", "Hercules", "Firefox", "Decathlon", "Honda", "TVS", "Bajaj", "Royal Enfield", "Yamaha", "Suzuki", "Maruti Suzuki", "Hyundai", "Tata", "Other"] },
      { id: "vehicle_type", label: "Vehicle Type", type: "chips", options: ["Cycle", "E-bike", "Scooter", "Motorcycle", "Car"] },
      { id: "model_year", label: "Model / Purchase Year", type: "dropdown", options: ["2026", "2025", "2024", "2023", "2022", "2021 or older", "Not sure"] }
    ],
    subcategories: [
      {
        id: "cycles",
        name: "Cycles",
        attributes: [
          { id: "gear_type", label: "Gear Type", type: "chips", options: ["Non-Geared", "7 Speed", "21 Speed", "Other"] },
          { id: "frame_size", label: "Frame Size", type: "chips", options: ["Small", "Medium", "Large", "Not sure"] }
        ]
      },
      {
        id: "e-bikes",
        name: "E-Bikes",
        attributes: [
          { id: "battery_range", label: "Approx. Range", type: "chips", options: ["Below 25 km", "25–50 km", "50–75 km", "75+ km", "Not sure"] }
        ]
      },
      {
        id: "motorcycles",
        name: "Motorcycles",
        attributes: [
          { id: "engine_cc", label: "Engine Capacity", type: "chips", options: ["Below 125 cc", "125–200 cc", "200–350 cc", "350+ cc"] },
          { id: "fuel_type", label: "Fuel Type", type: "chips", options: ["Petrol", "Electric"] }
        ]
      },
      {
        id: "scooters",
        name: "Scooters",
        attributes: [
          { id: "fuel_type", label: "Fuel Type", type: "chips", options: ["Petrol", "Electric"] }
        ]
      },
      {
        id: "cars",
        name: "Cars",
        attributes: [
          { id: "fuel_type", label: "Fuel Type", type: "chips", options: ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"] },
          { id: "transmission", label: "Transmission", type: "chips", options: ["Manual", "Automatic"] }
        ]
      },
      { id: "helmets", name: "Helmets" },
      { id: "locks", name: "Locks" },
      { id: "tyres", name: "Tyres" },
      { id: "spare-parts", name: "Spare Parts" },
      { id: "accessories", name: "Accessories" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "properties",
    name: "Properties",
    slug: "properties",
    icon: "Home",
    commonAttributes: [
      { id: "furnishing", label: "Furnishing", type: "chips", options: ["Fully Furnished", "Semi-Furnished", "Unfurnished"] },
      { id: "bedrooms", label: "Bedrooms", type: "chips", options: ["1 RK", "1 BHK", "2 BHK", "3 BHK+"] },
      { id: "parking", label: "Parking", type: "toggle" }
    ],
    subcategories: [
      { id: "room", name: "Room" },
      { id: "pg", name: "PG" },
      { id: "flat", name: "Flat" },
      { id: "hostel-transfer", name: "Hostel Transfer" },
      { id: "shared", name: "Shared Accommodation" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "jobs",
    name: "Jobs",
    slug: "jobs",
    icon: "Briefcase",
    commonAttributes: [
      { id: "remote", label: "Remote Available", type: "toggle" },
      { id: "salary", label: "Salary/Stipend", type: "dropdown", options: ["Unpaid", "< 5k", "5k-10k", "10k-20k", "20k+"] }
    ],
    subcategories: [
      { id: "internship", name: "Internship" },
      { id: "part-time", name: "Part-Time" },
      { id: "freelance", name: "Freelance" },
      { id: "campus-ambassador", name: "Campus Ambassador" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "services",
    name: "Services",
    slug: "services",
    icon: "Wrench",
    commonAttributes: [
      { id: "pricing", label: "Pricing Model", type: "chips", options: ["Fixed", "Negotiable", "Per Hour"] },
      { id: "same_day", label: "Same Day Available", type: "toggle" }
    ],
    subcategories: [
      { id: "repair", name: "Repair" },
      { id: "tutoring", name: "Tutoring" },
      { id: "printing", name: "Printing" },
      { id: "assignment-help", name: "Assignment Help" },
      { id: "delivery-help", name: "Delivery Help" },
      { id: "event-help", name: "Event Help" },
      { id: "other", name: "Other" }
    ]
  },
  {
    id: "gaming",
    name: "Gaming & Entertainment",
    slug: "gaming-entertainment",
    icon: "Gamepad2",
    commonAttributes: [
      { id: "brand", label: "Brand", type: "chips", options: ["Sony", "Microsoft", "Nintendo", "Logitech", "Razer", "Other"] },
      { id: "working_condition", label: "Working Condition", type: "buttons", options: ["Perfect", "Drift Issues", "Not Working"] },
      { id: "warranty", label: "Warranty", type: "toggle" }
    ],
    subcategories: [
      { id: "consoles", name: "Consoles" },
      { id: "controllers", name: "Controllers" },
      { id: "gaming-keyboard", name: "Gaming Keyboard" },
      { id: "gaming-mouse", name: "Gaming Mouse" },
      { id: "headsets", name: "Headsets" },
      { id: "gaming-chair", name: "Gaming Chair" },
      { id: "other", name: "Other" }
    ]
  }
];
