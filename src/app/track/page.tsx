import { Metadata } from "next";
import { TrackPageClient } from "./TrackPageClient";

export const metadata: Metadata = {
    title: "Track Your Application | NexTep Edu",
    description:
        "Track your study abroad application status in real-time. Enter your tracking code and phone number to see the latest updates on your NexTep Edu application.",
    alternates: {
        canonical: "https://www.nextepedu.com/track",
    },
};

export default function TrackPage() {
    return <TrackPageClient />;
}
