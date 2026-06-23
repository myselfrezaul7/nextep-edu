// JSON-LD Structured Data for SEO
import { destinations } from "@/data/destinations";

export function StructuredData() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "@id": "https://www.nextepedu.com/#organization",
        name: "NexTep Edu",
        alternateName: "NexTep Education Consultancy",
        url: "https://www.nextepedu.com",
        logo: {
            "@type": "ImageObject",
            url: "https://www.nextepedu.com/assets/logo.png",
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
        foundingDate: "2018",
        contactPoint: {
            "@type": "ContactPoint",
            telephone: "+4915147483493",
            contactType: "customer service"
        }
    };

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://www.nextepedu.com/#localbusiness",
        name: "NexTep Edu - Study Abroad Consultancy Dhaka",
        image: "https://www.nextepedu.com/assets/og-image.png",
        url: "https://www.nextepedu.com",
        telephone: "+4915147483493",
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
        "@id": "https://www.nextepedu.com/#website",
        url: "https://www.nextepedu.com",
        name: "NexTep Edu",
        description: "Study Abroad Consultancy for Bangladeshi Students",
        datePublished: "2024-01-01T08:00:00+08:00",
        dateModified: new Date().toISOString(),
        publisher: {
            "@id": "https://www.nextepedu.com/#organization",
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: "https://www.nextepedu.com/destinations/{search_term_string}",
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
                item: "https://www.nextepedu.com",
            },
        ],
    };

    const aggregateRatingSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "@id": "https://www.nextepedu.com/#organization",
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            reviewCount: "58",
            bestRating: "5",
            worstRating: "1"
        }
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Study Abroad Consulting",
        provider: {
            "@id": "https://www.nextepedu.com/#organization"
        },
        areaServed: {
            "@type": "Country",
            name: "Bangladesh"
        },
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Study Abroad Services",
            itemListElement: [
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Service",
                        name: "University Admission Assistance"
                    }
                },
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Service",
                        name: "Student Visa Processing"
                    }
                },
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Service",
                        name: "SOP & Document Preparation"
                    }
                }
            ]
        }
    };

    const destinationListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: Object.values(destinations).map((dest, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Country",
                name: dest.name,
                url: `https://nextepedu.com/destinations/${dest.slug}`
            }
        }))
    };

    const reviewsSchema = [
        {
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: {
                "@type": "EducationalOrganization",
                name: "NexTep Edu"
            },
            author: {
                "@type": "Person",
                name: "Mehedi Drubok"
            },
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
                bestRating: "5"
            },
            reviewBody: "NexTep Edu guided me through every step of my application to Germany. From document preparation to university selection, their support was invaluable."
        },
        {
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: {
                "@type": "EducationalOrganization",
                name: "NexTep Edu"
            },
            author: {
                "@type": "Person",
                name: "Jannatul Ferdous"
            },
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
                bestRating: "5"
            },
            reviewBody: "I couldn't have imagined studying in Germany without NexTep Edu's help. They made the complex admission process feel simple and were always there to answer my questions."
        }
    ];

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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(aggregateRatingSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(serviceSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(destinationListSchema),
                }}
            />
            {reviewsSchema.map((review, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(review),
                    }}
                />
            ))}
        </>
    );
}
