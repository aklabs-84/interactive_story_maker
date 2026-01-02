import React from 'react';
import { Link } from 'react-router-dom';
import CommonLayout from '../components/layout/CommonLayout';
import { Edit3, Play, Folder, Compass, Map } from 'lucide-react';

const HomePage = () => {
    return (
        <CommonLayout>
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        🎭 나만의 인터랙티브 스토리
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                        선택에 따라 이야기가 달라지는 나만의 시나리오를 설계하고, 직접 체험하며 전 세계와 공유해보세요!
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full max-w-6xl">
                    <FeatureCard
                        to="/editor"
                        emoji="✏️"
                        title="스토리 만들기"
                        description="직관적인 에디터에서 분기되는 이야기를 설계하세요"
                        color="hover:border-cyan-400/50"
                    />
                    <FeatureCard
                        to="/player"
                        emoji="▶️"
                        title="스토리 체험"
                        description="내가 만든 이야기를 직접 플레이해보세요"
                        color="hover:border-purple-400/50"
                    />
                    <FeatureCard
                        to="/manager"
                        emoji="💾"
                        title="내 스토리"
                        description="저장된 스토리 목록을 관리하고 공유 링크를 생성하세요"
                        color="hover:border-green-400/50"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mt-6">
                    <FeatureCard
                        to="https://gemini.google.com/gem/1nW0ghsBuhUtO_O2cJo2ORGtoMJVB-t5_?usp=sharing"
                        emoji="🧭"
                        title="스토리 설계 GEM"
                        description="AI 도구로 아이디어를 구체화하고 다듬어보세요"
                        color="hover:border-amber-400/50"
                        external
                    />
                    <FeatureCard
                        to="https://storywaver.vercel.app/"
                        emoji="🗺️"
                        title="스토리 맵"
                        description="이야기의 흐름을 한눈에 설계 맵으로 확인하세요"
                        color="hover:border-sky-400/50"
                        external
                    />
                </div>

                <div className="mt-20 px-8 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
                    <p className="text-slate-600 dark:text-slate-500 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        💡 지금 바로 첫 장면을 작성하고 친구들에게 공유해보세요!
                    </p>
                </div>
            </div>
        </CommonLayout>
    );
};

const FeatureCard = ({ to, emoji, title, description, color, external }) => {
    const CardContent = (
        <div className={`p-8 h-full rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all group ${color} shadow-sm dark:shadow-none hover:shadow-xl dark:hover:bg-white/10`}>
            <div className="text-center">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 transform-gpu">
                    {emoji}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );

    if (external) {
        return (
            <a href={to} target="_blank" rel="noopener noreferrer" className="block h-full">
                {CardContent}
            </a>
        );
    }

    return (
        <Link to={to} className="block h-full">
            {CardContent}
        </Link>
    );
};

export default HomePage;
