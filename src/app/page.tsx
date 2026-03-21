import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Search, FileCheck } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Smart CV Scan",
    description:
      "Snap a photo, upload an image, or select a PDF. We extract and structure your CV instantly.",
  },
  {
    icon: Search,
    title: "Auto Job Match",
    description:
      "We search thousands of listings to find jobs that match your skills and experience.",
  },
  {
    icon: FileCheck,
    title: "ATS Optimization",
    description:
      "Tailor your CV for each job with the right keywords to pass automated screening systems.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            AI-Powered CV Optimization
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            ATS CV Optimizer
          </h1>
          <p className="mb-8 text-lg text-slate-300 sm:text-xl">
            Upload your CV. Find matching jobs. Get hired.
          </p>
          <Link href="/upload">
            <Button
              size="lg"
              className="h-12 w-full max-w-xs rounded-full bg-blue-600 text-base font-semibold text-white hover:bg-blue-500 sm:w-auto sm:px-8"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto mt-16 grid w-full max-w-lg gap-4 sm:max-w-3xl sm:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-slate-700 bg-slate-800/50 backdrop-blur"
            >
              <CardContent className="flex flex-col items-center p-6 text-center sm:items-start sm:text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500">
        ATS CV Optimizer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
