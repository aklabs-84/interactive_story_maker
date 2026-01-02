import React from 'react';
import Navbar from '../common/Navbar';

const CommonLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
            {/* Background Effect */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>

                <footer className="py-12 border-t border-white/5 text-center">
                    <p className="text-sm text-slate-500">© 2025 인터랙티브 스토리 메이커 · 교육용 프로젝트</p>
                    <p className="mt-2">
                        <a
                            href="https://litt.ly/aklabs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition text-sm"
                        >
                            🚀 AK Labs 홈페이지 방문하기
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default CommonLayout;
