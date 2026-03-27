import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, Search, FileCheck, ArrowRight } from "lucide-react";
import GeometricBg from "@/components/GeometricBg";

const features = [
  {
    icon: Camera,
    title: "Smart CV Scan",
    description:
      "Snap a photo, upload an image, or select a PDF. We extract and structure your CV instantly using AI.",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: Search,
    title: "Auto Job Match",
    description:
      "We search thousands of listings across major job boards to find roles that match your profile.",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: FileCheck,
    title: "ATS Optimization",
    description:
      "Tailor your CV for each job with the right keywords to pass automated screening systems.",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
];

export default function LandingPage() {
  return (
    <div className="noise-bg flex flex-1 flex-col bg-black overflow-hidden">
      <GeometricBg />

      <main className="relative flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a55c]/20 bg-[#c9a55c]/8 px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#c9a55c] animate-pulse" />
            <span className="text-sm font-medium text-[#c9a55c]">
              AI-Powered CV Optimization
            </span>
          </div>

          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Land Your Dream Job
          </h1>
          <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-[#7a7a92] sm:text-xl">
            Upload your CV. We find matching jobs and optimize your resume to pass ATS filters.
          </p>

          <Link href="/upload">
            <Button
              size="lg"
              className="group h-13 rounded-full bg-[#c9a55c] px-8 text-base font-semibold text-black transition-all hover:bg-[#d4b36a] hover:shadow-[0_0_30px_-5px_rgba(201,165,92,0.4)]"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto mt-20 grid w-full max-w-lg gap-4 sm:max-w-4xl sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-border group cursor-default bg-[#0a0a0a] p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.iconBg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#7a7a92]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center text-sm text-[#3a3a4a]">
        <div className="mb-2 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[#c9a55c]/20 to-transparent" />
        ATS CV Optimizer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
