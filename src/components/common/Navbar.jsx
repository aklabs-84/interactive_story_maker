import { Home, Edit3, Play, Folder, Map, Compass, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfigStore } from '../../store/useConfigStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Navbar = () => {
    const { isDarkMode, toggleDarkMode, soundEnabled, toggleSound } = useConfigStore();

    return (
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20 gap-4">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                            <span className="text-xl">📖</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold tracking-tight text-white">스토리 메이커</h1>
                            <p className="text-xs text-slate-400">인터랙티브 스토리 월드</p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2 md:gap-4">
                        <div className="hidden lg:flex items-center gap-1">
                            <NavLink to="/" icon={<Home size={18} />} label="홈" />
                            <NavLink to="/editor" icon={<Edit3 size={18} />} label="만들기" />
                            <NavLink to="/player" icon={<Play size={18} />} label="체험" />
                            <NavLink to="/manager" icon={<Folder size={18} />} label="보관함" />
                        </div>

                        <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

                        <div className="flex items-center gap-2">
                            <IconButton
                                onClick={toggleDarkMode}
                                icon={isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                                title={isDarkMode ? "라이트 모드" : "다크 모드"}
                            />
                            <IconButton
                                onClick={toggleSound}
                                icon={soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                title={soundEnabled ? "사운드 끄기" : "사운드 켜기"}
                            />
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

const NavLink = ({ to, icon, label }) => (
    <Link
        to={to}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
    >
        {icon}
        <span>{label}</span>
    </Link>
);

const IconButton = ({ onClick, icon, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition"
    >
        {icon}
    </button>
);

export default Navbar;
