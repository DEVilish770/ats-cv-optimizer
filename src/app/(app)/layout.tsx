import BottomNav from "@/components/BottomNav";
import GeometricBg from "@/components/GeometricBg";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="noise-bg flex min-h-screen flex-col bg-black">
      <GeometricBg />
      <main className="relative z-10 flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
