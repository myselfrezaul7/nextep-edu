import { Metadata } from "next";
import { NotFoundContent } from "@/components/common/NotFoundContent";

export const metadata: Metadata = {
    title: "Page Not Found | NexTep Edu",
    description: "The page you are looking for could not be found.",
};

export default function NotFound() {
    return <NotFoundContent />;
}
