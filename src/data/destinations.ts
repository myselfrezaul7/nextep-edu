import { Award, Clock, Briefcase, Globe, GraduationCap, MapPin, DollarSign, Sun, BookOpen, Users, Landmark } from "lucide-react";

export type Destination = {
    slug: string;
    name: string;
    hero: {
        title: string;
        description: string;
        icon: any; // Lucide Icon
    };
    benefits: {
        title: string;
        description: string;
        icon: any;
    }[];
    universities: {
        name: string;
        campusImage: string;
        atmosphereImage: string;
    }[];
};

export const destinations: Record<string, Destination> = {
    uk: {
        slug: "uk",
        name: "United Kingdom",
        hero: {
            title: "Study in the UK",
            description: "There's a reason people have been flocking to British universities for centuries. The education is solid, the culture is rich, and honestly? That accent doesn't hurt either.",
            icon: Landmark,
        },
        benefits: [
            {
                title: "Degrees That Open Doors",
                description: "A UK degree carries weight everywhere. Employers worldwide recognize the rigorous standards, and you'll be learning from some seriously brilliant minds.",
                icon: Award,
            },
            {
                title: "Finish Faster",
                description: "Three-year bachelor's degrees and one-year master's programs mean you'll save both time and money compared to other countries. Win-win.",
                icon: Clock,
            },
            {
                title: "Stay and Work",
                description: "The Graduate Route visa lets you stick around for 2 years after graduating to find work. Plus, you can work 20 hours a week while studying.",
                icon: Briefcase,
            },
            {
                title: "A Proper Mix of Cultures",
                description: "London alone has people from over 180 countries. You'll make friends from everywhere and experience cultures you never knew existed.",
                icon: Globe,
            },
        ],
        universities: [
            { name: "University of Oxford", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "University of Cambridge", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "Imperial College London", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "UCL (University College London)", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "University of Edinburgh", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "King's College London", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "University of Manchester", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
        ],
    },
    usa: {
        slug: "usa",
        name: "USA",
        hero: {
            title: "Study in the USA",
            description: "Home to the Ivy League and Silicon Valley. If you want to dream big and hustle hard, this is the place to be.",
            icon: GraduationCap,
        },
        benefits: [
            {
                title: "World-Class Education",
                description: "US universities dominate global rankings. You're not just getting a degree; you're getting a brand name on your resume.",
                icon: Award,
            },
            {
                title: "Flexibility",
                description: "Change your major, double major, take weird electives. The US system lets you explore before you commit.",
                icon: BookOpen,
            },
            {
                title: "Campus Life",
                description: "It's exactly like the movies. Sports, clubs, Greek life — US campuses are their own little cities.",
                icon: Users,
            },
            {
                title: "OPT Opportunities",
                description: "Work for up to 3 years after graduation in STEM fields. It's a massive leg up for your career.",
                icon: Briefcase,
            },
        ],
        universities: [
            { name: "Harvard University", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "Stanford University", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
            { name: "MIT", campusImage: "/assets/austria-uni.png", atmosphereImage: "/assets/austria-atm.png" },
        ],
    },
};
