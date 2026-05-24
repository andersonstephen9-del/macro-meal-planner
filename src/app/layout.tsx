import type { Metadata, Viewport } from "next";
import { MealPlannerProvider } from "@/context/MealPlannerProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Macro & Budget Meal Planner",
  description:
    "Hit exact dinner macros per profile and minimize grocery costs with ingredient cross-utilization.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MealPlannerProvider>{children}</MealPlannerProvider>
      </body>
    </html>
  );
}
