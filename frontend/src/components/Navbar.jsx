import { useState, useEffect } from 'react';
import {
    CodeBracketIcon,
    FolderIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        setUser(userData);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    const navigation = [
        { name: 'My Projects', href: '/my-projects', icon: FolderIcon },
        { name: 'Editor', href: '/editor', icon: CodeBracketIcon },
    ];

    const getUserInitials = () => {
        if (user?.name) {
            return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user?.email?.charAt(0).toUpperCase() || 'U';
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsUserDropdownOpen(false);
        };

        if (isUserDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isUserDropdownOpen]);

    return (
        <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <CodeBracketIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white font-semibold text-lg">CodeCollab</span>
                        </a>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
                            {navigation.map((item) => {
                                const isActive = window.location.pathname === item.href;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-gray-700 text-white'
                                                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Navigation - Fallback for medium screens */}
                    <div className="hidden md:block lg:hidden">
                        <div className="flex items-center space-x-2">
                            {navigation.map((item) => {
                                const isActive = window.location.pathname === item.href;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-gray-700 text-white'
                                                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Menu - Desktop */}
                    <div className="hidden md:block">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsUserDropdownOpen(!isUserDropdownOpen);
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {getUserInitials()}
                                    </span>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''
                                    }`} />
                            </button>

                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                                    <div className="p-3 border-b border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {getUserInitials()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate text-sm">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-gray-400 text-xs truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-1">
                                        {/* Add Profile Link */}
                                        <a
                                            href="/profile"
                                            className="flex items-center gap-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors text-sm"
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            <span>Profile</span>
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/10 rounded-md transition-colors text-sm"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <XMarkIcon className="block h-5 w-5" />
                            ) : (
                                <Bars3Icon className="block h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-800 border-t border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = window.location.pathname === item.href;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </a>
                            );
                        })}
                    </div>

                    {/* Mobile User Info */}
                    <div className="pt-4 pb-3 border-t border-gray-700 px-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {getUserInitials()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/10 rounded-md transition-colors text-sm"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}