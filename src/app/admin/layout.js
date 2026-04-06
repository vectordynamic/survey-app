'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        label: 'Questions',
        path: '/admin/questions',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
        ),
    },
    {
        label: 'Analytics',
        path: '/admin/analytics',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
    },
    {
        label: 'Participants',
        path: '/admin/participants',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-2.533-4.126 9.354 9.354 0 00-5.463 0 4.125 4.125 0 00-2.533 4.126 9.354 9.354 0 004.121.952zm-9-9.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-2.533-4.126 9.354 9.354 0 00-5.463 0 4.125 4.125 0 00-2.533 4.126 9.354 9.354 0 004.121.952zm12 0a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6 10a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM15 13.5a2.25 2.25 0 014.5 0v.75m0 0l-3-3m3 3l-3 3" />
            </svg>
        ),
    },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) return;
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setIsAuth(true);
    }, [router, isLoginPage]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    // Login page renders without sidebar
    if (isLoginPage) return <>{children}</>;

    if (!isAuth) return null;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <h2>Survey Admin</h2>
                    <p>Research Management</p>
                </div>
                <nav className="admin-nav">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`admin-nav-item ${pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div style={{ padding: '0.75rem' }}>
                    <button
                        onClick={handleLogout}
                        className="admin-nav-item"
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ width: 18, height: 18 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
