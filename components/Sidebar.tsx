'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
    Home,
    Users,
    BarChart3,
    Settings,
    CheckSquare,

    X,
    UserPlus,
    Plus,
    Calendar,
    Mail,
    FileText,
    Phone,
    MessageSquare,
    Users as UsersIcon,
    Video,
    Clock,
    ChevronDown,
    ChevronRight,
    Bell,
    LogOut,
    User
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    divider?: boolean;
    adminOnly?: boolean;
    employeeOnly?: boolean;
    children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Profile', href: '/?tab=profile', icon: User, employeeOnly: true },
    { name: 'Attendance', href: '/?tab=attendance', icon: Clock, employeeOnly: true },
    { name: 'Notifications', href: '/?tab=notifications', icon: Bell, employeeOnly: true },

    { name: 'Tasks', href: '/tasks', icon: CheckSquare, adminOnly: true },
    { name: 'Add Task', href: '/create-task', icon: Plus, adminOnly: true },
    { name: 'Calendar', href: '/calendar', icon: Calendar, adminOnly: true },

    // Attendance Section for Admin
    {
        name: 'Attendance Admin',
        href: '/attendance',
        icon: Clock,
        adminOnly: true,
        children: [
            { name: "Today's Attendance", href: '/attendance/today', icon: Clock },
            { name: 'Attendance Record', href: '/attendance/record', icon: FileText },
        ]
    },

    { name: 'Emails', href: '/emails', icon: Mail, adminOnly: true },
    { name: 'Forms', href: '/forms', icon: FileText, adminOnly: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, adminOnly: true },

    // RingCentral Integration
    { name: 'RingCentral', href: '/dashboard/ringcentral', icon: Phone, divider: true, adminOnly: true },
    { name: 'Calls', href: '/calls', icon: Phone, adminOnly: true },
    { name: 'Messages', href: '/messages', icon: MessageSquare, adminOnly: true },
    { name: 'Team Chat', href: '/teams', icon: UsersIcon, adminOnly: true },
    { name: 'Meetings', href: '/meetings', icon: Video, adminOnly: true },

    { name: 'Settings', href: '/settings', icon: Settings },
];

function SidebarContent({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, isAdmin, isEmployee, logout } = useAuth();
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        'Attendance Admin': true // Default expanded
    });

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const filteredNavigationItems = navigationItems
        .filter(item => {
            if (item.adminOnly && !isAdmin) return false;
            if (item.employeeOnly && !isEmployee) return false;
            return true;
        })
        .map(item => {
            if (item.children) {
                return {
                    ...item,
                    children: item.children.filter(child => {
                        if (child.adminOnly && !isAdmin) return false;
                        if (child.employeeOnly && !isEmployee) return false;
                        return true;
                    })
                };
            }
            return item;
        });

    const isActive = (href: string) => {
        const [targetPath, targetQuery] = href.split('?');
        const currentTab = searchParams.get('tab');

        // Page matches the target path exactly
        const isPathMatch = pathname === targetPath;

        if (targetQuery) {
            const targetParams = new URLSearchParams(targetQuery);
            const targetTab = targetParams.get('tab');
            return isPathMatch && currentTab === targetTab;
        }

        // For the main Dashboard link (/), only active if NO tab is selected
        if (href === '/') {
            return isPathMatch && !currentTab;
        }

        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            await logout();
            window.location.href = '/login';
        }
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
        >
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-600">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'L'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold text-slate-900 truncate w-32">{user?.name || 'Lead CRM'}</h1>
                        <span className="text-xs text-slate-500 capitalize">{user?.role || 'Employee'}</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            <nav className="mt-6 px-3 flex-1 overflow-y-auto">
                <div className="space-y-1">
                    {filteredNavigationItems.map((item, index) => {
                        const Icon = item.icon;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus[item.name];
                        const active = isActive(item.href) || (hasChildren && item.children?.some(child => isActive(child.href)));

                        return (
                            <div key={item.name}>
                                {item.divider && index > 0 && (
                                    <div className="my-2 border-t border-slate-200"></div>
                                )}

                                {hasChildren ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.name)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${active
                                                ? 'text-slate-900 bg-slate-50'
                                                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <Icon
                                                    className={`h-5 w-5 mr-3 ${active ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'
                                                        }`}
                                                />
                                                {item.name}
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-1 ml-4 pl-4 border-l border-slate-100 space-y-1">
                                                {item.children?.map(child => {
                                                    const ChildIcon = child.icon;
                                                    const childActive = isActive(child.href);
                                                    return (
                                                        <Link
                                                            key={child.name}
                                                            href={child.href}
                                                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${childActive
                                                                ? 'text-white bg-slate-900 shadow-sm'
                                                                : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                                                                }`}
                                                        >
                                                            <ChildIcon className={`h-4 w-4 mr-3 ${childActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                            {child.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${active
                                            ? 'text-white bg-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                            }`}
                                    >
                                        <Icon
                                            className={`h-5 w-5 mr-3 ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-600'
                                                }`}
                                        />
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export default function Sidebar(props: SidebarProps) {
    return (
        <Suspense fallback={
            <div className="w-64 bg-white border-r border-slate-200 h-screen hidden lg:flex flex-col animate-pulse">
                <div className="h-16 border-b border-slate-100 flex items-center px-6">
                    <div className="w-8 h-8 bg-slate-100 rounded-full" />
                    <div className="ml-3 h-4 bg-slate-100 rounded w-24" />
                </div>
                <div className="mt-6 px-3 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 bg-slate-50 rounded-lg" />
                    ))}
                </div>
            </div>
        }>
            <SidebarContent {...props} />
        </Suspense>
    );
}

