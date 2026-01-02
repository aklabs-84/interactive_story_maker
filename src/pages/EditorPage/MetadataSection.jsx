import React from 'react';
import { Card, Input, Textarea } from '../../components/common/UI';
import { useEditorStore } from '../../store/useEditorStore';

const MetadataSection = () => {
    const { metadata, setMetadata } = useEditorStore();

    return (
        <Card className="mb-8 p-8">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📋</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">기본 정보</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="스토리 제목"
                    placeholder="예: 마법의 숲 모험"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ title: e.target.value })}
                />
                <Input
                    label="작성자 이름"
                    placeholder="예: 홍길동"
                    value={metadata.author}
                    onChange={(e) => setMetadata({ author: e.target.value })}
                />
                <div className="md:col-span-2">
                    <Textarea
                        label="스토리 설명"
                        placeholder="이 스토리에 대한 간단한 설명을 입력하세요"
                        className="h-24"
                        value={metadata.description}
                        onChange={(e) => setMetadata({ description: e.target.value })}
                    />
                </div>
            </div>
        </Card>
    );
};

export default MetadataSection;
