'use client';

import { ChevronRight, GitBranch, LayoutDashboard, Rocket, Settings, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useUIStore } from '@/lib/store/ui-store';

const navItems = [
    { icon: GitBranch, label: 'Repositories', route: 'repositories' },
    { icon: LayoutDashboard, label: 'Dashboard', route: 'dashboard' },
    { icon: Settings, label: 'Review history', route: 'review-history' },
    { icon: UserCog, label: 'Account Settings', route: 'settings' },
];

export function Sidebar() {
    const { sidebarOpen } = useUIStore();
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const user = session?.user;
    if (!sidebarOpen) return null;

    return (
        <aside
            className="flex flex-col h-full shrink-0"
            style={{
                width: 268,
                background: '#ffffff',
                borderRight: '1px solid #e4e4e7',
            }}
        >
            <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: '1px solid #e4e4e7', height: 52 }}
            >
                <div
                    className="flex items-center justify-center rounded"
                    style={{
                        width: 28,
                        height: 28,
                        background: '#ff6240',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                    }}
                >
                    AI
                </div>
                <span className="flex-1 text-sm font-semibold" style={{ color: '#18181b' }}>
                    {user?.name}
                </span>
                <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{
                        background: '#f4f4f5',
                        color: '#71717a',
                        border: '1px solid #e4e4e7',
                        fontSize: 10,
                    }}
                >
                    PRO
                </span>
            </div>

            <nav className="flex-1 px-2 py-2 overflow-y-auto">
                {navItems.map(({ icon: Icon, label, route }) => {
                    const active = pathname.includes(route);
                    return (
                        <Link
                            key={label}
                            href={`/${route}`}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm mb-0.5 transition-all"
                            style={{
                                background: active ? '#f4f4f5' : 'transparent',
                                color: active ? '#18181b' : '#71717a',
                                fontWeight: active ? 500 : 400,
                            }}
                        >
                            <Icon size={15} style={{ flexShrink: 0 }} />
                            <span className="flex-1">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 pb-3">
                <div
                    className="rounded-lg p-3"
                    style={{
                        background: '#fafafa',
                        border: '1px solid #e4e4e7',
                    }}
                >
                    <div className="flex items-start gap-2">
                        <Rocket size={14} style={{ color: '#ff6240', marginTop: 1, flexShrink: 0 }} />
                        <div>
                            <p className="text-xs mb-1" style={{ color: '#3f3f46' }}>
                                Get started with <span style={{ color: '#ff6240', fontWeight: 600 }}>AI Review</span>
                            </p>
                            <p className="text-xs" style={{ color: '#a1a1aa' }}>
                                <span style={{ color: '#71717a' }}>Up Next:</span> Checkout your first AI review
                            </p>
                        </div>
                        <ChevronRight size={13} style={{ color: '#a1a1aa', marginTop: 1, flexShrink: 0 }} />
                    </div>
                </div>
            </div>
        </aside>
    );
}
