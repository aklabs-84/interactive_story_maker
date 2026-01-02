import React, { useState } from 'react';
import { Card, Input, Textarea, Button } from '../../components/common/UI';
import { useEditorStore } from '../../store/useEditorStore';
import { Plus, Trash2, ChevronDown, ChevronRight, Flag, Image as ImageIcon, X } from 'lucide-react';
import { imageHandler } from '../../utils/imageHandler';

const StoryNode = ({ nodeId, parentId, level = 0 }) => {
    const node = useEditorStore((state) => state.nodes[nodeId]);
    const { updateNode, addChoice, deleteNode } = useEditorStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!node) return null;

    const handleAddChoice = (letter) => {
        addChoice(nodeId, letter);
        setIsCollapsed(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64 = await imageHandler.processImage(file);
            updateNode(nodeId, { image: base64 });
        } catch (err) {
            alert('이미지 업로드에 실패했습니다: ' + err.message);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Card className={`relative ${level > 0 ? 'ml-8' : ''} border-l-4 ${node.id === 'start' ? 'border-l-cyan-500' : 'border-l-indigo-500'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 hover:bg-white/5 rounded transition"
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <span className="text-xl">{node.id === 'start' ? '🌟' : '📄'}</span>
                        <h4 className="font-bold text-slate-200">
                            {node.id === 'start' ? '시작 지점' : `선택지 분기 (Level ${level})`}
                        </h4>
                    </div>

                    {node.id !== 'start' && (
                        <Button variant="danger" size="sm" onClick={() => deleteNode(nodeId, parentId)}>
                            <Trash2 size={14} className="mr-1" /> 삭제
                        </Button>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="space-y-4">
                        <Textarea
                            label="이야기 텍스트"
                            placeholder="이 장면에서 벌어지는 일을 적어주세요..."
                            className="h-28"
                            value={node.text}
                            onChange={(e) => updateNode(nodeId, { text: e.target.value })}
                        />

                        {/* Node Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">배경 이미지 (선택)</label>
                            {node.image ? (
                                <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/20">
                                    <img src={node.image} alt="Node Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
                                            <ImageIcon size={20} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        <button
                                            onClick={() => updateNode(nodeId, { image: '' })}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 transition"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 hover:border-white/10 rounded-xl cursor-pointer transition bg-white/[0.02] hover:bg-white/[0.04] text-slate-500 hover:text-slate-400">
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-xs">이미지 업로드</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {(node.choices?.length ?? 0) < 2 && !node.isEnding && (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => handleAddChoice('a')}>
                                        <Plus size={14} className="mr-1" /> 선택지 A 추가
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleAddChoice('b')}>
                                        <Plus size={14} className="mr-1" /> 선택지 B 추가
                                    </Button>
                                </>
                            )}

                            <Button
                                variant={node.isEnding ? 'success' : 'outline'}
                                size="sm"
                                onClick={() => updateNode(nodeId, { isEnding: !node.isEnding })}
                            >
                                <Flag size={14} className="mr-1" /> {node.isEnding ? '엔딩 설정됨' : '엔딩으로 설정'}
                            </Button>
                        </div>

                        {node.isEnding && (
                            <div className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 space-y-3">
                                <Input
                                    label="엔딩 제목"
                                    placeholder="예: 영웅의 귀환"
                                    value={node.ending.title}
                                    onChange={(e) => updateNode(nodeId, { ending: { ...node.ending, title: e.target.value } })}
                                />
                                <Textarea
                                    label="엔딩 메시지"
                                    placeholder="마지막 메시지..."
                                    value={node.ending.message}
                                    onChange={(e) => updateNode(nodeId, { ending: { ...node.ending, message: e.target.value } })}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {!isCollapsed && (node.choices?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-8 relative pb-8">
                    {/* Visual path line */}
                    <div className="absolute left-4 top-0 bottom-8 w-px bg-white/10 ml-[2px]"></div>

                    {node.choices?.map((choice, idx) => (
                        <div key={choice.nextId} className="relative">
                            {/* Connector line */}
                            <div className="absolute left-4 top-8 w-4 h-px bg-white/10 ml-[2px]"></div>

                            <div className="ml-12 mb-2 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${choice.letter === 'a' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                    Option {choice.letter}
                                </span>
                                <input
                                    type="text"
                                    placeholder="선택지 라벨 입력..."
                                    className="bg-transparent border-none text-sm text-slate-300 focus:ring-0 p-0 w-full"
                                    value={choice.label}
                                    onChange={(e) => {
                                        const newChoices = [...(node.choices || [])];
                                        if (newChoices[idx]) {
                                            newChoices[idx].label = e.target.value;
                                            updateNode(nodeId, { choices: newChoices });
                                        }
                                    }}
                                />
                            </div>
                            <StoryNode
                                nodeId={choice.nextId}
                                parentId={nodeId}
                                level={level + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoryNode;
