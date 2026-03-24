import { Navbar } from '@/components/globals/Navbar';
import { Sidebar } from '@/components/globals/Sidebar';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0 h-dvh" style={{ background: '#0e0e0e' }}>
                <Navbar />
                <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
