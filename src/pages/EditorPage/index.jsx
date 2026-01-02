import React from 'react';
import CommonLayout from '../../components/layout/CommonLayout';
import MetadataSection from './MetadataSection';
import StoryNode from './StoryNode';
import { Button } from '../../components/common/UI';
import { Save, Eye, Play, Trash2, Upload } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useStoryStore } from '../../store/useStoryStore';

import { jsonConverter } from '../../utils/jsonConverter';

import { apiService } from '../../services/ApiService';

const EditorPage = () => {
    const { nodes, metadata, editingStoryId, resetEditor, loadStory } = useEditorStore();
    const { addStory } = useStoryStore();

    const handleSave = async () => {
        if (!metadata.title) {
            alert('스토리 제목을 입력해주세요!');
            return;
        }

        const story = {
            id: editingStoryId || `story-${Date.now()}`,
            metadata: {
                ...metadata,
                updatedAt: new Date().toISOString(),
                createdAt: metadata.createdAt || new Date().toISOString(),
            },
            nodes: nodes,
            startNodeId: 'start'
        };

        // Save locally
        addStory(story);

        // Save to backend
        try {
            await apiService.saveStory(story);
        } catch (err) {
            console.error('Backend save failed:', err);
        }

        alert('저장되었습니다!');
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const rawData = JSON.parse(event.target.result);
                const story = jsonConverter.convertToAppFormat(rawData);

                if (story.metadata && story.nodes) {
                    loadStory(story);
                    alert('스토리를 성공적으로 불러왔습니다!');
                } else {
                    alert('올바른 스토리 파일 형식이 아닙니다.');
                }
            } catch (err) {
                console.error(err);
                alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const handlePreview = () => {
        const story = {
            id: 'temp-preview',
            metadata: { ...metadata, title: `[미리보기] ${metadata.title}` },
            nodes: nodes,
            startNodeId: 'start'
        };
        localStorage.setItem('tempPlayStory', JSON.stringify(story));
        window.open('/player?temp=true', '_blank');
    };

    const handlePlay = () => {
        const story = {
            id: 'temp-preview',
            metadata: { ...metadata },
            nodes: nodes,
            startNodeId: 'start'
        };
        localStorage.setItem('tempPlayStory', JSON.stringify(story));
        window.location.href = '/player?temp=true';
    };

    return (
        <CommonLayout>
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">✏️ 스토리 만들기</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                            {editingStoryId ? '기존 스토리를 수정 중입니다.' : '상상력을 발휘해 매력적인 분기점들을 만들어보세요.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <label className="cursor-pointer">
                            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium transition cursor-pointer text-slate-600 dark:text-slate-300">
                                <Upload size={14} /> JSON 불러오기
                            </div>
                        </label>
                        <Button variant="outline" size="sm" onClick={() => {
                            if (confirm('모든 내용을 지우시겠습니까?')) resetEditor();
                        }}>
                            <Trash2 size={16} className="mr-2" /> 초기화
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSave}>
                            <Save size={16} className="mr-2" /> 저장하기
                        </Button>
                    </div>
                </header>

                <MetadataSection />

                <div className="mt-12 mb-20">
                    <div className="flex items-center gap-2 mb-6 px-1">
                        <span className="text-xl">🌟</span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">스토리 구조 설계</h3>
                    </div>

                    <StoryNode nodeId="start" />
                </div>

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 py-4 px-6 z-40 transition-colors duration-300">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <Button variant="danger" size="sm" onClick={() => {
                            if (confirm('정말 모든 내용을 지우시겠습니까?')) resetEditor();
                        }}>
                            <Trash2 size={16} className="mr-2" /> 전체 지우기
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={handlePreview}>
                                <Eye size={16} className="mr-2" /> 미리보기
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handlePlay} className="bg-purple-600 hover:bg-purple-700">
                                <Play size={16} className="mr-2" /> 체험하기
                            </Button>
                            <Button variant="primary" size="md" onClick={handleSave} className="px-8 bg-green-500 hover:bg-green-600 text-slate-950 font-bold">
                                <Save size={18} className="mr-2" /> 저장하기
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </CommonLayout>
    );
};

export default EditorPage;
