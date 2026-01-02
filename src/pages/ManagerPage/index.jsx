import React, { useState } from 'react';
import CommonLayout from '../../components/layout/CommonLayout';
import { Card, Button, Input } from '../../components/common/UI';
import { useStoryStore } from '../../store/useStoryStore';
import { Play, Trash2, Share2, Download, Upload, ExternalLink, Search, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/ApiService';
import { useEditorStore } from '../../store/useEditorStore';

const ManagerPage = () => {
    const { stories, removeStory, addStory } = useStoryStore();
    const { loadStory } = useEditorStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    const filteredStories = stories.filter(s =>
        s.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.metadata.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = (story) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(story, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${story.metadata.title}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const story = JSON.parse(event.target.result);
                if (story.metadata && story.nodes) {
                    addStory(story);
                    alert('스토리가 성공적으로 불러와졌습니다!');
                } else {
                    alert('올바른 스토리 파일 형식이 아닙니다.');
                }
            } catch (err) {
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        };
        reader.readAsText(file);
    };

    const handleShare = async (story) => {
        setIsSharing(true);
        const url = `${window.location.origin}/player?story=${story.id}`;

        try {
            // Copy right away while we have user gesture
            await navigator.clipboard.writeText(url);

            // Then save to backend
            await apiService.saveStory(story);

            alert('공유 링크가 클립보드에 복사되었습니다! (서버 저장 완료)');
        } catch (err) {
            console.error('Share/Save error:', err);
            if (err.name === 'NotAllowedError') {
                prompt('클립보드 접근이 차단되었습니다. 아래 링크를 직접 복사해주세요:', url);
            } else {
                alert('공유 링크 생성 중 서버 저장에 실패했습니다. 하지만 링크는 복사되었습니다.');
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <CommonLayout>
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-white">💾 내 스토리 보관함</h2>
                        <p className="text-slate-400 mt-1">저장된 스토리를 관리하고 다른 사람들과 공유해보세요.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="cursor-pointer">
                            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition cursor-pointer">
                                <Upload size={16} /> JSON 불러오기
                            </div>
                        </label>
                        <Button onClick={() => navigate('/editor')}>
                            새 스토리 만들기
                        </Button>
                    </div>
                </header>

                <div className="mb-8 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all">
                    <Search size={20} className="text-slate-500 mr-3" />
                    <input
                        type="text"
                        placeholder="스토리 제목이나 작가 이름으로 검색..."
                        className="bg-transparent border-none text-white placeholder:text-slate-500 w-full focus:ring-0 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredStories.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-slate-400 text-lg">저장된 스토리가 없습니다.</p>
                        <Button variant="ghost" className="mt-4" onClick={() => navigate('/editor')}>
                            첫 번째 스토리를 만들어보세요!
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredStories.map(story => (
                            <StoryCard
                                key={story.id}
                                story={story}
                                onPlay={() => navigate(`/player?story=${story.id}`)}
                                onEdit={() => {
                                    loadStory(story);
                                    navigate('/editor');
                                }}
                                onDelete={() => {
                                    if (confirm('정말 삭제하시겠습니까?')) removeStory(story.id);
                                }}
                                onShare={() => handleShare(story)}
                                isSharing={isSharing}
                                onExport={() => handleExport(story)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CommonLayout>
    );
};

const StoryCard = ({ story, onPlay, onEdit, onDelete, onShare, onExport, isSharing }) => {
    return (
        <Card className="hover:border-white/20 transition-all">
            <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{story.metadata.title}</h3>
                        <p className="text-sm text-slate-400">by {story.metadata.author || '익명'}</p>
                    </div>
                    <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {story.metadata.theme || 'default'}
                    </div>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                    {story.metadata.description || '설명이 없습니다.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1">
                        <IconButton onClick={onPlay} icon={<Play size={16} />} title="플레이" color="text-cyan-400 hover:bg-cyan-500/10" />
                        <IconButton onClick={onEdit} icon={<Edit3 size={16} />} title="편집" color="text-amber-400 hover:bg-amber-500/10" />
                        <IconButton onClick={onExport} icon={<Download size={16} />} title="JSON 내보내기" />
                        <IconButton
                            onClick={onShare}
                            icon={isSharing ? <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent animate-spin rounded-full"></div> : <Share2 size={16} />}
                            title="링크 공유"
                            disabled={isSharing}
                        />
                    </div>
                    <IconButton onClick={onDelete} icon={<Trash2 size={16} />} title="삭제" color="text-red-400 hover:bg-red-500/10" />
                </div>
            </div>
        </Card>
    );
};

const IconButton = ({ onClick, icon, title, disabled, color = "text-slate-400 hover:bg-white/5 hover:text-white" }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all ${color} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {icon}
    </button>
);

export default ManagerPage;
