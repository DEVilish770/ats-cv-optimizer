import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="noise-bg flex min-h-screen flex-col bg-black">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
