import { Navbar } from '@/components/globals/Navbar';
import { Sidebar } from '@/components/globals/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <TooltipProvider>
                <div className="flex h-screen w-full overflow-hidden">
                    <Sidebar />

                    <div className="flex flex-col flex-1 min-w-0 h-dvh bg-neutral-50">
                        <Navbar />
                        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
                    </div>
                </div>
            </TooltipProvider>
        </SidebarProvider>
    );
}
