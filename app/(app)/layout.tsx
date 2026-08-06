import AppShell from "@/components/app-shell";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed right-4 top-4 z-[9999]">
        <ThemeToggle />
      </div>

      <AppShell>{children}</AppShell>
    </>
  );
}

