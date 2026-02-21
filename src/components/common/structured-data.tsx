// JSON-LD Structured Data for SEO
export function StructuredData() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "@id": "https://nextepedu.com/#organization",
        name: "NexTep Edu",
        alternateName: "NexTep Education Consultancy",
        url: "https://nextepedu.com",
        logo: {
            "@type": "ImageObject",
            url: "https://nextepedu.com/assets/logo.png",
            width: 512,
            height: 512,
        },
        description:
            "Leading study abroad consultancy in Bangladesh helping students achieve their dreams of international education in Germany, UK, USA, Canada, Australia and more.",
        address: {
            "@type": "PostalAddress",
            streetAddress: "1500, Munshiganj",
            addressLocality: "Dhaka",
            addressCountry: "BD",
        },
        areaServed: {
            "@type": "Country",
            name: "Bangladesh",
        },
        sameAs: [
            "https://www.facebook.com/nextepedu",
            "https://www.instagram.com/nextepedu",
            "https://www.linkedin.com/company/nextepedu",
        ],
        knowsAbout: [
            "Study abroad consultation",
            "Student visa assistance",
            "University admission",
            "Scholarship guidance",
            "IELTS preparation",
            "Study in Germany",
            "Study in UK",
            "Study in USA",
            "Study in Canada",
            "Study in Australia",
        ],
    };

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://nextepedu.com/#localbusiness",
        name: "NexTep Edu - Study Abroad Consultancy Dhaka",
        image: "https://nextepedu.com/assets/og-image.png",
        url: "https://nextepedu.com",
        telephone: "+880-XXXX-XXXXXX",
        priceRange: "$$",
        address: {
            "@type": "PostalAddress",
            streetAddress: "1500, Munshiganj",
            addressLocality: "Dhaka",
            addressRegion: "Dhaka Division",
            postalCode: "1500",
            addressCountry: "BD",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: 23.8103,
            longitude: 90.4125,
        },
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
                opens: "10:00",
                closes: "18:00",
            },
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Saturday",
                opens: "10:00",
                closes: "16:00",
            },
        ],
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://nextepedu.com/#website",
        url: "https://nextepedu.com",
        name: "NexTep Edu",
        description: "Study Abroad Consultancy for Bangladeshi Students",
        publisher: {
            "@id": "https://nextepedu.com/#organization",
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: "https://nextepedu.com/destinations/{search_term_string}",
            },
            "query-input": "required name=search_term_string",
        },
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How can I study abroad from Bangladesh?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "To study abroad from Bangladesh, you need to: 1) Choose your destination country and program, 2) Meet language requirements (IELTS/TOEFL), 3) Prepare required documents, 4) Apply to universities, 5) Get admission, 6) Apply for student visa. NexTep Edu guides you through every step.",
                },
            },
            {
                "@type": "Question",
                name: "Which countries offer free education for Bangladeshi students?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Germany and Norway offer tuition-free education at public universities for international students including Bangladeshi students. You only need to cover living expenses. NexTep Edu specializes in helping students apply to these countries.",
                },
            },
            {
                "@type": "Question",
                name: "What is the cost to study in Germany from Bangladesh?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Public universities in Germany are tuition-free. You need approximately €11,208 per year in a blocked account for living expenses, plus visa fees, health insurance, and semester contribution (€150-350). NexTep Edu provides detailed cost breakdowns.",
                },
            },
            {
                "@type": "Question",
                name: "Do I need IELTS to study abroad from Bangladesh?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Most universities require IELTS (usually 6.0-7.0) or equivalent English proficiency. However, some programs accept Duolingo or offer conditional admission. Germany has English-taught programs and also German-taught programs requiring TestDaF.",
                },
            },
            {
                "@type": "Question",
                name: "What scholarships are available for Bangladeshi students?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Popular scholarships include: DAAD (Germany), Chevening (UK), Fulbright (USA), Commonwealth Scholarships, Erasmus Mundus (Europe), and various university-specific scholarships. NexTep Edu helps identify and apply for suitable scholarships.",
                },
            },
        ],
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://nextepedu.com",
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />
        </>
    );
}
