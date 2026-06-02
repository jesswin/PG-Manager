import "./globals.css";
import { OnboardingProvider } from "@/store/OnboardingContext";
import { PlanProvider } from "@/store/PlanContext";
import { SettingsProvider } from "@/store/SettingsContext";
import { AppProvider } from "@/store/AppContext";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "PG Manager – Admin Panel",
  description: "PG Management SaaS Application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-gray-50">
        <OnboardingProvider>
          <PlanProvider>
            <SettingsProvider>
              <AppProvider>
                <AppShell>{children}</AppShell>
              </AppProvider>
            </SettingsProvider>
          </PlanProvider>
        </OnboardingProvider>
      </body>
    </html>
  );
}
