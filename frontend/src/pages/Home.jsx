/**
 * Home Page
 * Public landing page with hero, features, and blog section
 */

import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Home = () => {
    const features = [
        {
            icon: '🧠',
            title: 'AI-Powered Analysis',
            description: 'Deep learning models trained on thousands of spine X-rays for accurate detection.'
        },
        {
            icon: '⚡',
            title: 'Instant Results',
            description: 'Get comprehensive analysis results in seconds, not hours.'
        },
        {
            icon: '📊',
            title: 'Detailed Reports',
            description: 'Generate professional PDF reports ready for clinical use.'
        },
        {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'HIPAA-compliant encryption to protect patient data.'
        }
    ];

    const blogPosts = [
        {
            id: 1,
            title: 'Understanding Lumbar Spine Disorders',
            excerpt: 'Learn about common conditions affecting the lower back and how AI can help in early detection.',
            date: 'January 15, 2026',
            image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=250&fit=crop',
            category: 'Education'
        },
        {
            id: 2,
            title: 'How AI is Revolutionizing Medical Imaging',
            excerpt: 'Discover the latest advances in artificial intelligence for radiology and diagnostics.',
            date: 'January 10, 2026',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop',
            category: 'Technology'
        },
        {
            id: 3,
            title: 'Early Detection Saves Lives',
            excerpt: 'Why timely diagnosis of spinal conditions is crucial for patient outcomes.',
            date: 'January 5, 2026',
            image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=250&fit=crop',
            category: 'Healthcare'
        }
    ];

    const stats = [
        { value: '10,000+', label: 'Scans Analyzed' },
        { value: '95%', label: 'Accuracy Rate' },
        { value: '500+', label: 'Healthcare Providers' },
        { value: '24/7', label: 'Availability' }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={logo} alt="SpineVision AI" className="h-10 w-auto" />
                            <span className="text-xl font-bold text-gray-800">SPINEVISION AI</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors">Features</a>
                            <a href="#blog" className="text-gray-600 hover:text-teal-600 transition-colors">Blog</a>
                            <a href="#about" className="text-gray-600 hover:text-teal-600 transition-colors">About</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-4 py-2 text-teal-600 font-medium hover:text-teal-700 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-gray-50 via-white to-teal-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                                AI-Powered Diagnostic Tool
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Detect Spine Diseases with{' '}
                                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                    AI Precision
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Upload X-ray images and get instant AI-powered analysis for spinal conditions.
                                Helping healthcare professionals make faster, more accurate diagnoses.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200 text-center">
                                    Start Free Trial
                                </Link>
                                <a href="#features" className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-teal-300 hover:text-teal-600 transition-all text-center">
                                    Learn More
                                </a>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-72 h-72 bg-teal-200 rounded-full filter blur-3xl opacity-30"></div>
                            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-cyan-200 rounded-full filter blur-3xl opacity-30"></div>
                            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl">
                                <div className="bg-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-teal-500/30 rounded w-full"></div>
                                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                        <div className="h-20 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg mt-4 flex items-center justify-center">
                                            <span className="text-teal-400 font-mono text-sm">AI Analysis Complete ✓</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-gradient-to-r from-teal-600 to-cyan-600">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                                <p className="text-teal-100">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose SPINEVISION AI?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our advanced AI technology provides accurate, fast, and reliable spine analysis.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section id="blog" className="py-20 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest from Our Blog</h2>
                            <p className="text-xl text-gray-600">Insights on spine health and AI technology</p>
                        </div>
                        <Link to="/blog" className="hidden md:flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors">
                            View All Posts
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                                            {post.category}
                                        </span>
                                        <span className="text-sm text-gray-400">{post.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                                    <button className="text-teal-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                        Read More
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                About SPINEVISION AI
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                SPINEVISION AI is a cutting-edge medical imaging platform developed to assist
                                healthcare professionals in detecting and diagnosing spinal conditions with
                                unprecedented accuracy and speed.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Our deep learning models are trained on extensive datasets of spine X-rays,
                                enabling detection of conditions like disc narrowing, spondylolisthesis,
                                degenerative changes, and more.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-800">FDA Compliant</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-800">HIPAA Secure</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop"
                                alt="Medical Team"
                                className="rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-teal-600 to-cyan-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Diagnostic Process?
                    </h2>
                    <p className="text-xl text-teal-100 mb-8">
                        Join hundreds of healthcare providers already using SPINEVISION AI.
                    </p>
                    <Link to="/register" className="inline-block px-10 py-4 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg">
                        Get Started Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img src={logo} alt="SpineVision AI" className="h-10 w-auto" />
                                <span className="text-xl font-bold text-white">SPINEVISION AI</span>
                            </div>
                            <p className="text-gray-400">
                                AI-powered spine disease detection for healthcare professionals.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#features" className="hover:text-teal-400">Features</a></li>
                                <li><a href="#" className="hover:text-teal-400">Pricing</a></li>
                                <li><a href="#" className="hover:text-teal-400">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Resources</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#blog" className="hover:text-teal-400">Blog</a></li>
                                <li><a href="#" className="hover:text-teal-400">Documentation</a></li>
                                <li><a href="#" className="hover:text-teal-400">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-teal-400">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-teal-400">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>© 2026 SPINEVISION AI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
