import { LucideIcon, MapPin, GraduationCap, Building2, Globe2, Wallet, Clock, Users, BookOpen, Trophy, Sun, Coffee, Landmark, Train, DollarSign, Briefcase, Award, Globe } from "lucide-react";

export interface University {
    name: string;
}

export interface Benefit {
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface Destination {
    slug: string;
    name: string;
    heroImage: string;
    hero: {
        title: string;
        description: string;
        icon: LucideIcon;
    };
    benefits: Benefit[];
    universities: University[];
}

export const destinations: Record<string, Destination> = {
    uk: {
        slug: "uk",
        name: "United Kingdom",
        heroImage: "/assets/uk_hero_blend_1769798778947.png",
        hero: {
            title: "Study in the UK",
            description: "Home to some of the world's oldest and most prestigious universities. A degree from the UK is recognized globally.",
            icon: Building2,
        },
        benefits: [
            { title: "World-Class Education", description: "Home to 4 of the top 10 universities in the world.", icon: Trophy },
            { title: "Short Duration", description: "Complete your Master's in just 1 year.", icon: Clock },
            { title: "Work Opportunities", description: "2-year Post-Study Work Visa (PSW) available.", icon: Users },
            { title: "Cultural Hub", description: "Experience a rich history and diverse culture.", icon: Globe2 },
        ],
        universities: [
            { name: "University of Oxford" },
            { name: "University of Cambridge" },
            { name: "Imperial College London" },
            { name: "University of Manchester" },
            { name: "University of Edinburgh" },
        ],
    },
    usa: {
        slug: "usa",
        name: "USA",
        heroImage: "/assets/usa_hero_blend_1769798792932.png",
        hero: {
            title: "Study in the USA",
            description: "The dream destination for international students. Limitless opportunities and cutting-edge research.",
            icon: Landmark,
        },
        benefits: [
            { title: "Academic Excellence", description: "Home to the majority of the world's top universities.", icon: BookOpen },
            { title: "Flexible Education", description: "Choose from a vast range of majors and minors.", icon: MapPin },
            { title: "Career Growth", description: "Optional Practical Training (OPT) for up to 3 years.", icon: Wallet },
            { title: "Innovation Hub", description: "Be at the center of technological advancement.", icon: Sun },
        ],
        universities: [
            { name: "Harvard University" },
            { name: "Stanford University" },
            { name: "MIT" },
            { name: "University of California, Berkeley" },
            { name: "Columbia University" },
        ],
    },
    canada: {
        slug: "canada",
        name: "Canada",
        heroImage: "/assets/canada_hero_blend_1769798822200.png",
        hero: {
            title: "Study in Canada",
            description: "High quality of life, welcoming environment, and excellent post-study work options.",
            icon: MapPin,
        },
        benefits: [
            { title: "High Quality of Life", description: "Consistently ranked as one of the best places to live.", icon: Sun },
            { title: "Post-Grad Work Permit", description: "Work for up to 3 years after graduation.", icon: Wallet },
            { title: "Affordable Education", description: "Lower tuition fees compared to US and UK.", icon: Wallet },
            { title: "Multicultural Society", description: "A diverse and inclusive community.", icon: Users },
        ],
        universities: [
            { name: "University of Toronto" },
            { name: "University of British Columbia" },
            { name: "McGill University" },
            { name: "McMaster University" },
            { name: "University of Montreal" },
        ],
    },
    australia: {
        slug: "australia",
        name: "Australia",
        heroImage: "/assets/australia_hero_blend_1769798807824.png",
        hero: {
            title: "Study in Australia",
            description: "Beautiful landscapes, laid-back culture, and a world-class education system.",
            icon: Sun,
        },
        benefits: [
            { title: "Global Recognition", description: "Degrees are recognized worldwide.", icon: Globe2 },
            { title: "Work while Studying", description: "Work up to 48 hours per fortnight.", icon: Clock },
            { title: "Post-Study Work", description: "Stay and work for 2-4 years after graduation.", icon: Wallet },
            { title: "Great Lifestyle", description: "Enjoy beaches, cities, and the outback.", icon: Coffee },
        ],
        universities: [
            { name: "University of Melbourne" },
            { name: "University of Sydney" },
            { name: "Australian National University" },
            { name: "University of Queensland" },
            { name: "Monash University" },
        ],
    },
    germany: {
        slug: "germany",
        name: "Germany",
        heroImage: "/assets/germany_hero_blend_1769798837339.png",
        hero: {
            title: "Study in Germany",
            description: "Tuition-free education at public universities and a hub for engineering and technology.",
            icon: Building2,
        },
        benefits: [
            { title: "Low/No Tuition", description: "Most public universities are tuition-free.", icon: Wallet },
            { title: "Strong Economy", description: "Largest economy in Europe with many job opportunities.", icon: Trophy },
            { title: "Research Focus", description: "Emphasis on practical and theoretical research.", icon: BookOpen },
            { title: "Central Europe", description: "Easy travel to other European countries.", icon: Train },
        ],
        universities: [
            { name: "Technical University of Munich" },
            { name: "Ludwig Maximilian University of Munich" },
            { name: "Heidelberg University" },
            { name: "Humboldt University of Berlin" },
            { name: "RWTH Aachen University" },
        ],
    },
    france: {
        slug: "france",
        name: "France",
        heroImage: "/assets/france_hero_blend_1769798860272.png",
        hero: {
            title: "Study in France",
            description: "Art, culture, and prestige. France offers a unique study experience in the heart of Europe.",
            icon: Coffee,
        },
        benefits: [
            { title: "Cultural Heritage", description: "Immerse yourself in art, fashion, and history.", icon: Landmark },
            { title: "Affordable Education", description: "Public universities have low tuition fees.", icon: Wallet },
            { title: "Research & Innovation", description: "Strong focus on science and research.", icon: BookOpen },
            { title: "Language", description: "Learn one of the most spoken languages in the world.", icon: Users },
        ],
        universities: [
            { name: "Sorbonne University" },
            { name: "École Polytechnique" },
            { name: "PSL Research University" },
            { name: "University of Paris-Saclay" },
            { name: "Sciences Po" },
        ],
    },
    china: {
        slug: "china",
        name: "China",
        heroImage: "/assets/china_hero_blend_1769798874661.png",
        hero: {
            title: "Study in China",
            description: "A blend of ancient tradition and modern innovation. Rapidly growing education sector.",
            icon: Globe2,
        },
        benefits: [
            { title: "Economic Powerhouse", description: "Experience the world's second-largest economy.", icon: Trophy },
            { title: "Scholarships", description: "Numerous government and university scholarships.", icon: Wallet },
            { title: "Language & Culture", description: "Learn Mandarin and explore Chinese history.", icon: Users },
            { title: "Modern Facilities", description: "Universities have state-of-the-art infrastructure.", icon: Building2 },
        ],
        universities: [
            { name: "Tsinghua University" },
            { name: "Peking University" },
            { name: "Fudan University" },
            { name: "Shanghai Jiao Tong University" },
            { name: "Zhejiang University" },
        ],
    },
    netherlands: {
        slug: "netherlands",
        name: "Netherlands",
        heroImage: "/assets/netherlands_hero_blend_1769798889972.png",
        hero: {
            title: "Study in Netherlands",
            description: "Innovative teaching, English-taught programs, and an open, international society.",
            icon: Users,
        },
        benefits: [
            { title: "English Programs", description: "Largest range of English-taught programs in Europe.", icon: BookOpen },
            { title: "Interactive Teaching", description: "Student-centered learning style.", icon: Users },
            { title: "International Environment", description: "Home to many international students and companies.", icon: Globe2 },
            { title: "Cycling Culture", description: "Easy and eco-friendly way to get around.", icon: Sun },
        ],
        universities: [
            { name: "University of Amsterdam" },
            { name: "Delft University of Technology" },
            { name: "Utrecht University" },
            { name: "Wageningen University & Research" },
            { name: "Leiden University" },
        ],
    },
    norway: {
        slug: "norway",
        name: "Norway",
        heroImage: "/assets/norway_hero_blend_1769798903469.png",
        hero: {
            title: "Study in Norway",
            description: "Spectacular nature, high standard of living, and tuition-free education for many.",
            icon: Sun,
        },
        benefits: [
            { title: "No Tuition Fees", description: "Public universities are free for all students (mostly).", icon: Wallet },
            { title: "High Quality of Life", description: "One of the safest and happiest countries.", icon: Sun },
            { title: "Nature", description: "Fjords, mountains, and northern lights.", icon: MapPin },
            { title: "Modern Society", description: "Technologically advanced and progressive.", icon: Building2 },
        ],
        universities: [
            { name: "University of Oslo" },
            { name: "University of Bergen" },
            { name: "Norwegian University of Science and Technology" },
            { name: "UiT The Arctic University of Norway" },
            { name: "Norwegian University of Life Sciences" },
        ],
    },
    portugal: {
        slug: "portugal",
        name: "Portugal",
        heroImage: "/assets/portugal_hero_blend_1769798919189.png",
        hero: {
            title: "Study in Portugal",
            description: "Affordable living, sunny weather, and a welcoming atmosphere in historic cities.",
            icon: Sun,
        },
        benefits: [
            { title: "Affordable", description: "Low cost of living and tuition fees.", icon: Wallet },
            { title: "Weather", description: "Sunny climate year-round.", icon: Sun },
            { title: "History", description: "Study in some of the oldest universities in Europe.", icon: Landmark },
            { title: "Safety", description: "Ranked as one of the safest countries in the world.", icon: Trophy },
        ],
        universities: [
            { name: "University of Lisbon" },
            { name: "University of Porto" },
            { name: "University of Coimbra" },
            { name: "NOVA University Lisbon" },
            { name: "University of Aveiro" },
        ],
    },
    austria: {
        slug: "austria",
        name: "Austria",
        heroImage: "/assets/austria_hero_blend_1769798933623.png",
        hero: {
            title: "Study in Austria",
            description: "Quality education in the heart of Europe, known for its rich musical and cultural history.",
            icon: Landmark,
        },
        benefits: [
            { title: "High Education Standards", description: "Universities known for academic excellence.", icon: BookOpen },
            { title: "Music & Arts", description: "The music capital of the world.", icon: Users },
            { title: "Safe & Stable", description: "High security and social stability.", icon: Trophy },
            { title: "Quality of Life", description: "Vienna is consistently ranked top for livability.", icon: Sun },
        ],
        universities: [
            { name: "University of Vienna" },
            { name: "Vienna University of Technology" },
            { name: "University of Innsbruck" },
            { name: "Graz University of Technology" },
            { name: "Johannes Kepler University Linz" },
        ],
    },
    belgium: {
        slug: "belgium",
        name: "Belgium",
        heroImage: "/assets/destinations/belgium.png",
        hero: {
            title: "Study in Belgium",
            description: "The heart of the EU, multicultural environment, and high-quality education.",
            icon: Building2,
        },
        benefits: [
            { title: "International Hub", description: "Home to EU institutions and NATO.", icon: Globe2 },
            { title: "Multilingual", description: "Opportunity to learn French, Dutch, and German.", icon: Users },
            { title: "Central Location", description: "Easy travel to Paris, London, Amsterdam.", icon: Train },
            { title: "Quality Education", description: "Excellent research universities.", icon: BookOpen },
        ],
        universities: [
            { name: "KU Leuven" },
            { name: "Ghent University" },
            { name: "Université catholique de Louvain" },
            { name: "Vrije Universiteit Brussel" },
            { name: "University of Antwerp" },
        ],
    },
    "south-korea": {
        slug: "south-korea",
        name: "South Korea",
        heroImage: "/assets/south_korea_hero_blend.png",
        hero: {
            title: "Study in South Korea",
            description: "Leading technology, vibrant pop culture, and world-class universities.",
            icon: Trophy,
        },
        benefits: [
            { title: "Technology Leader", description: "Global leader in IT and robotics.", icon: Sun },
            { title: "Culture", description: "Experience K-Pop, K-Drama and rich traditions.", icon: Users },
            { title: "Scholarships", description: "Generous government scholarships (GKS).", icon: Wallet },
            { title: "Safety", description: "Very safe environment for students.", icon: Trophy },
        ],
        universities: [
            { name: "Seoul National University" },
            { name: "KAIST" },
            { name: "Yonsei University" },
            { name: "Korea University" },
            { name: "Sungkyunkwan University" },
        ],
    },
    malaysia: {
        slug: "malaysia",
        name: "Malaysia",
        heroImage: "/assets/malaysia_hero_blend.png",
        hero: {
            title: "Study in Malaysia",
            description: "World-class education at an affordable cost in a vibrant, multicultural setting.",
            icon: Globe2,
        },
        benefits: [
            { title: "Affordability", description: "Low tuition fees and living costs.", icon: Wallet },
            { title: "Quality Education", description: "Twinning programs with UK, US, and Australian universities.", icon: Trophy },
            { title: "Multicultural", description: "Diverse culture with Malay, Chinese, and Indian influences.", icon: Users },
            { title: "English-Friendly", description: "English is widely spoken and used in education.", icon: BookOpen },
        ],
        universities: [
            { name: "Universiti Malaya (UM)" },
            { name: "Universiti Putra Malaysia (UPM)" },
            { name: "Universiti Kebangsaan Malaysia (UKM)" },
            { name: "Universiti Sains Malaysia (USM)" },
            { name: "Universiti Teknologi Malaysia (UTM)" },
        ],
    },
    turkey: {
        slug: "turkey",
        name: "Turkey",
        heroImage: "/assets/turkey_hero_blend.png",
        hero: {
            title: "Study in Turkey",
            description: "A bridge between East and West, offering quality education and rich history.",
            icon: Landmark,
        },
        benefits: [
            { title: "Strategic Location", description: "Gateway between Europe and Asia.", icon: MapPin },
            { title: "Quality Education", description: "Part of the Bologna Process, ensuring European standards.", icon: Award },
            { title: "Culture & History", description: "Immerse yourself in thousands of years of history.", icon: Landmark },
            { title: "Scholarships", description: "Government scholarships (Türkiye Bursları) available.", icon: Wallet },
        ],
        universities: [
            { name: "Koç University" },
            { name: "Sabancı University" },
            { name: "Middle East Technical University (METU)" },
            { name: "Bilkent University" },
            { name: "Boğaziçi University" },
        ],
    },
    cyprus: {
        slug: "cyprus",
        name: "Cyprus",
        heroImage: "/assets/cyprus_hero_blend.png",
        hero: {
            title: "Study in Cyprus",
            description: "Mediterranean climate, affordable tuition, and a gateway between Europe, Asia, and Africa.",
            icon: Sun,
        },
        benefits: [
            { title: "Affordable", description: "Low tuition fees and cost of living compared to Western Europe.", icon: Wallet },
            { title: "English Programs", description: "Wide range of English-taught degree programs.", icon: BookOpen },
            { title: "Weather", description: "Enjoy over 300 days of sunshine per year.", icon: Sun },
            { title: "Safety", description: "One of the safest countries in Europe.", icon: Trophy },
        ],
        universities: [
            { name: "University of Cyprus" },
            { name: "Cyprus University of Technology" },
            { name: "European University Cyprus" },
            { name: "University of Nicosia" },
            { name: "Frederick University" },
        ],
    },
    latvia: {
        slug: "latvia",
        name: "Latvia",
        heroImage: "/assets/latvia_hero_blend.png",
        hero: {
            title: "Study in Latvia",
            description: "Affordable European education in the heart of the Baltics with rich cultural heritage.",
            icon: Landmark,
        },
        benefits: [
            { title: "Affordable", description: "Low tuition and living costs in the EU.", icon: Wallet },
            { title: "English Programs", description: "Many programs taught in English at all levels.", icon: BookOpen },
            { title: "Central Location", description: "Easy access to Scandinavia, Western Europe, and Russia.", icon: Train },
            { title: "Quality Education", description: "EU-recognized degrees with strong academic traditions.", icon: Trophy },
        ],
        universities: [
            { name: "University of Latvia" },
            { name: "Riga Technical University" },
            { name: "Riga Stradiņš University" },
            { name: "Latvia University of Life Sciences" },
            { name: "Turiba University" },
        ],
    }
};
