import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, Search, FileCheck, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Smart CV Scan",
    description:
      "Snap a photo, upload an image, or select a PDF. We extract and structure your CV instantly using AI.",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Search,
    title: "Auto Job Match",
    description:
      "We search thousands of listings across major job boards to find roles that match your profile.",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: FileCheck,
    title: "ATS Optimization",
    description:
      "Tailor your CV for each job with the right keywords to pass automated screening systems.",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
  },
];

export default function LandingPage() {
  return (
    <div className="noise-bg flex flex-1 flex-col bg-[#08090d] overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-[#c9a55c]/8 blur-[100px]" />
        <div className="animate-pulse-slow absolute -right-24 top-1/3 h-48 w-48 rounded-full bg-blue-500/6 blur-[80px]" />
        <div className="animate-float absolute bottom-1/4 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#c9a55c]/5 blur-[100px]" />
      </div>

      <main className="relative flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a55c]/20 bg-[#c9a55c]/8 px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#c9a55c] animate-pulse" />
            <span className="text-sm font-medium text-[#c9a55c]">
              AI-Powered CV Optimization
            </span>
          </div>

          <h1 className="mb-5 font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Land Your Dream Job
          </h1>
          <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-[#7a7a92] sm:text-xl">
            Upload your CV. We find matching jobs and optimize your resume to pass ATS filters.
          </p>

          <Link href="/upload">
            <Button
              size="lg"
              className="group h-13 rounded-full bg-[#c9a55c] px-8 text-base font-semibold text-[#0a0b10] transition-all hover:bg-[#d4b36a] hover:shadow-[0_0_30px_-5px_rgba(201,165,92,0.4)]"
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
              className="gradient-border group cursor-default rounded-xl bg-[#101118] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_-12px_rgba(201,165,92,0.12)]"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
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
