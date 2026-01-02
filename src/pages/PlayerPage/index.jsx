import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CommonLayout from '../../components/layout/CommonLayout';
import { Card, Button } from '../../components/common/UI';
import { useStoryStore } from '../../store/useStoryStore';
import { useSound } from '../../hooks/useSound';
import { RotateCcw, ChevronLeft, ArrowRight, BookOpen } from 'lucide-react';
import { apiService } from '../../services/ApiService';

const PlayerPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const storyId = searchParams.get('story');

    const { getStoryById } = useStoryStore();
    const { playTyping, playButtonClick, playEnding, playTransition } = useSound();

    const [story, setStory] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [history, setHistory] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const typewriterRef = useRef(null);

    // Load story
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);

            // Handle temporary preview story first
            const isTemp = searchParams.get('temp') === 'true';
            const temp = localStorage.getItem('tempPlayStory');

            if (isTemp && temp) {
                try {
                    const parsed = JSON.parse(temp);
                    setStory(parsed);
                    setCurrentNodeId(parsed.startNodeId || 'start');
                    setIsLoading(false);
                    return;
                } catch (e) {
                    console.error('Temp story parse error:', e);
                }
            }

            if (!storyId) {
                // Find latest local story if no ID provided
                const latest = useStoryStore.getState().stories[0];
                if (latest) {
                    setStory(latest);
                    setCurrentNodeId(latest.startNodeId || 'start');
                }
            } else {
                // Try local first
                let found = getStoryById(storyId);
                if (!found) {
                    // Try API
                    found = await apiService.loadStory(storyId);
                }
                if (found) {
                    setStory(found);
                    setCurrentNodeId(found.startNodeId || 'start');
                }
            }
            setIsLoading(false);
        };
        load();
    }, [storyId, searchParams, getStoryById]);

    const currentNode = story?.nodes?.[currentNodeId];

    // Typewriter effect
    useEffect(() => {
        if (!currentNode || !currentNode.text) return;

        if (typewriterRef.current) clearInterval(typewriterRef.current);

        setDisplayText('');
        let index = 0;
        const text = currentNode.text;

        typewriterRef.current = setInterval(() => {
            if (index < text.length) {
                const nextIndex = index + 1;
                setDisplayText(text.slice(0, nextIndex));
                if (index % 3 === 0) playTyping();
                index = nextIndex;
            } else {
                clearInterval(typewriterRef.current);
            }
        }, 30);

        return () => clearInterval(typewriterRef.current);
    }, [currentNodeId, story?.id, playTyping]); // Use story.id instead of full object for stability

    const handleChoice = (nextId, label, emoji) => {
        playTransition();
        setHistory([...history, { nodeId: currentNodeId, label, emoji }]);
        setCurrentNodeId(nextId);
    };

    const handleBack = () => {
        if (history.length === 0) return;
        playButtonClick();
        const newHistory = [...history];
        const last = newHistory.pop();
        setHistory(newHistory);
        setCurrentNodeId(last.nodeId);
    };

    const handleRestart = () => {
        playButtonClick();
        setHistory([]);
        setCurrentNodeId(story.startNodeId || 'start');
    };

    if (isLoading) {
        return (
            <CommonLayout>
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    <span className="ml-3 text-slate-400">스토리를 불러오는 중...</span>
                </div>
            </CommonLayout>
        );
    }

    if (!story || !currentNode) {
        return (
            <CommonLayout>
                <div className="text-center py-20">
                    <div className="text-6xl mb-6">🎮</div>
                    <h2 className="text-2xl font-bold mb-4">체험할 스토리가 없습니다</h2>
                    <Button onClick={() => navigate('/editor')}>스토리 만들러 가기</Button>
                </div>
            </CommonLayout>
        );
    }

    return (
        <CommonLayout>
            <div className="max-w-3xl mx-auto">
                {/* History Breadcrumbs */}
                {history.length > 0 && (
                    <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-slate-500 w-full mb-1">📜 지금까지의 여정</span>
                        {history.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1 text-slate-300">
                                <span>{item.emoji || '➡️'}</span>
                                <span>{item.label}</span>
                            </span>
                        ))}
                    </div>
                )}

                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Node Content */}
                    <div className="space-y-6">
                        {currentNode.image && (
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-cyan-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                                <img
                                    src={currentNode.image}
                                    alt="Story"
                                    className="relative w-full rounded-3xl shadow-2xl border border-white/10 object-cover max-h-[400px]"
                                />
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className="text-5xl mt-1">{currentNode.emoji || '📖'}</div>
                            <div className="flex-1">
                                <p className="text-xl md:text-2xl leading-relaxed text-slate-100 font-medium">
                                    {displayText}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Choices or Ending */}
                    <div className="pt-8 border-t border-white/5">
                        {currentNode.isEnding ? (
                            <div className={`p-8 rounded-3xl border bg-gradient-to-br text-center space-y-4 ${currentNode.ending?.type === 'happy' ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' :
                                currentNode.ending?.type === 'sad' ? 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' :
                                    'from-purple-500/20 to-violet-500/20 border-purple-500/30'
                                }`}>
                                <div className="text-6xl mb-4">
                                    {currentNode.ending?.type === 'happy' ? '🎉' : currentNode.ending?.type === 'sad' ? '😢' : '🏁'}
                                </div>
                                <h2 className="text-3xl font-bold text-white">{currentNode.ending?.title || '완결'}</h2>
                                <p className="text-slate-300 text-lg">{currentNode.ending?.message || '이야기가 끝났습니다.'}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-500 mb-4 px-1">어떤 선택을 하시겠습니까?</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {currentNode.choices.map((choice, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleChoice(choice.nextId, choice.label, choice.emoji)}
                                            className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all text-left flex items-center gap-4 group"
                                        >
                                            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                                {choice.emoji || (choice.letter === 'a' ? '🅰️' : '🅱️')}
                                            </span>
                                            <span className="flex-1 font-medium text-lg">{choice.label || '다음'}</span>
                                            <ArrowRight className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 pt-4">
                        {history.length > 0 && (
                            <Button variant="outline" onClick={handleBack}>
                                <ChevronLeft size={18} className="mr-2" /> 이전 선택으로
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleRestart}>
                            <RotateCcw size={18} className="mr-2" /> 처음부터 다시
                        </Button>
                    </div>
                </div>
            </div>
        </CommonLayout>
    );
};

export default PlayerPage;
