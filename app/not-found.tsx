import type { Metadata } from "next";
import { NotFoundContent } from "@/components/sections/not-found-content";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Damon Guan",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return <NotFoundContent />;
}
