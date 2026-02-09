import { CreateSidebar } from "@/src/components/CreateSidebar";
import "@/src/styles/LaunchPage.css";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-draconis-dark min-h-[calc(100vh-162px)]">
      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row gap-[20px] md:gap-[29px] pt-[20px] md:pt-[60px] pb-[100px] md:pb-[80px] px-[16px] md:pl-[56px] md:pr-[56px] relative z-10">
        <CreateSidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 md:sticky md:top-[72px] self-start">
          {children}
        </main>
      </div>
    </div>
  );
}
