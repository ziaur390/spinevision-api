/**
 * Sidebar Component
 * Professional navigation sidebar
 */

import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Upload X-ray',
            path: '/upload',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
        },
        {
            name: 'History',
            path: '/history',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                    Main Menu
                </p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-100">
                {/* AI Status Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">AI Model</h4>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-400">Active</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Deep learning model ready to analyze spine X-rays
                    </p>
                </div>

                {/* Version */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    SPINEVISION-AI v1.0
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
