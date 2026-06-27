
import React, { useMemo, useState, useEffect } from 'react';
import type { GameSettings, KnowledgeBase, StoryItem, Chapter } from '../types';

const StoryItemComponent = React.memo(({ item, formatStoryText }: { item: StoryItem; formatStoryText: (text: string) => React.ReactNode }) => {
    return (
        <div className={`story-item mb-3 p-3 rounded-lg shadow-sm
            ${item.type === 'story' ? 'bg-gray-700/80' : 
              item.type === 'user_choice' ? 'bg-blue-900/70 text-blue-200 ring-1 ring-blue-700' : 
              item.type === 'user_custom_action' ? 'bg-indigo-900/70 text-indigo-200 ring-1 ring-indigo-700' :
              'bg-yellow-800/70 text-yellow-200 ring-1 ring-yellow-700'}`}>
            {item.type === 'user_choice' && <p className="font-semibold text-blue-300">Ngươi đã chọn:</p>}
            {item.type === 'user_custom_action' && <p className="font-semibold text-indigo-300">Hành động của ngươi:</p>}
            {item.type === 'system' && <p className="font-semibold text-yellow-300">Thông báo hệ thống:</p>}
            <div className="prose prose-sm prose-invert max-w-none text-gray-200">{formatStoryText(item.content)}</div>
        </div>
    );
});

interface GameplayScreenProps {
    goHome: () => void;
    gameSettings: GameSettings;
    restartGame: () => void;
    storyHistory: StoryItem[];
    isLoading: boolean;
    currentStory: string;
    choices: string[];
    handleChoice: (choice: string) => void;
    formatStoryText: (text: string) => React.ReactNode;
    customActionInput: string;
    setCustomActionInput: (value: string) => void;
    handleCustomAction: (action: string) => void;
    knowledgeBase: KnowledgeBase;
    setShowCharacterInfoModal: (show: boolean) => void;
    handleGenerateSuggestedActions: () => void;
    isGeneratingSuggestedActions: boolean;
    isSaving: boolean;
    setShowMemoryModal: (show: boolean) => void;
    setShowWorldKnowledgeModal: (show: boolean) => void;
    handleSaveGameToFile: () => void;
    finalPersonality: string;
    handleRemoveStatus: (status: any) => void;
    collapsedSections: { [key: string]: boolean };
    toggleSectionCollapse: (sectionKey: string) => void;
    handleUpdateKnowledgeItem: (id: string, category: keyof KnowledgeBase, updatedData: any) => void;
    chapters: Chapter[];
    canUndo: boolean;
    handleUndo: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
    goHome, gameSettings, restartGame, storyHistory, isLoading,
    currentStory, choices, handleChoice, formatStoryText, customActionInput,
    setCustomActionInput, handleCustomAction, knowledgeBase, setShowCharacterInfoModal,
    handleGenerateSuggestedActions, isGeneratingSuggestedActions,
    canUndo, handleUndo,
    isSaving, setShowMemoryModal, setShowWorldKnowledgeModal, handleSaveGameToFile,
    finalPersonality, handleRemoveStatus,
    collapsedSections, toggleSectionCollapse, handleUpdateKnowledgeItem, chapters
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const combinedStatusAndAttributes = useMemo(() => {
        const statuses = knowledgeBase.playerStatus || [];
        const attributes = knowledgeBase.playerAttributes
            ? Object.entries(knowledgeBase.playerAttributes).map(([key, value]) => ({
                id: `attr-${key}`,
                name: `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`,
                type: 'attribute',
                description: `Thuộc tính cốt lõi của nhân vật.`
            }))
            : [];
        return [...attributes, ...statuses];
    }, [knowledgeBase.playerStatus, knowledgeBase.playerAttributes]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-2 md:p-4 font-sans">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2 p-2 bg-gray-800/50 rounded-lg shadow-md">
                <button onClick={goHome} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-colors flex items-center self-start sm:self-center text-sm">
                    ↩️ Về Trang Chủ
                </button>
                <div className="text-center flex-1 mx-2 order-first sm:order-none max-w-md sm:max-w-full">
                    <h1 className="text-lg md:text-xl font-bold text-purple-300" title={gameSettings.theme || "Cuộc Phiêu Lưu"}>
                        {gameSettings.theme || "Cuộc Phiêu Lưu"}
                    </h1>
                    {gameSettings.characterPersonality && (
                        <p className="text-xs text-sky-300 flex items-center justify-center mt-0.5" title={`Tính cách: ${gameSettings.characterPersonality}`}>
                            <span className="mr-1">🎭</span>
                            <span className="leading-tight">Tính cách: {finalPersonality}</span>
                        </p>
                    )}
                    {gameSettings.useCharacterGoal && gameSettings.characterGoal && (
                        <div className="text-xs text-red-300 flex items-start justify-center text-center mt-0.5" title={`Mục tiêu: ${gameSettings.characterGoal}`}>
                            <span className="mr-1">🎯</span>
                            <span className="ml-1 leading-tight">Mục tiêu: {gameSettings.characterGoal}</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-1.5 self-end sm:self-center flex-wrap justify-end items-center">
                    {isSaving && <div className="text-xs text-gray-400 italic mr-2 animate-pulse">Đang lưu...</div>}
                    <button onClick={toggleFullscreen} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs" title={isFullscreen ? "Thoát toàn màn hình" : "Bật toàn màn hình"}>
                        {isFullscreen ? '🔽 Thu Nhỏ' : '⛶ Toàn Màn Hình'}
                    </button>
                    <button onClick={handleSaveGameToFile} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                        📥 Lưu Vào Tệp
                    </button>
                    <button onClick={() => setShowWorldKnowledgeModal(true)} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                        🌍 Tri Thức
                    </button>
                    <button onClick={() => setShowMemoryModal(true)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                        🧠 Ký Ức
                    </button>
                    <button onClick={() => setShowCharacterInfoModal(true)} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                        📝 Thông Tin
                    </button>
                    <button onClick={restartGame} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                        🔄 Bắt Đầu Lại
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-700/40 p-3 rounded-xl shadow-lg border border-indigo-700/50 h-full flex flex-col">
                    <h4 className="text-md font-semibold text-indigo-400 mb-1.5 flex items-center justify-between cursor-pointer" onClick={() => toggleSectionCollapse('status')}>
                        <span className="flex items-center">ℹ️ Trạng Thái & Thuộc Tính</span>
                        <button className="text-xs p-1 rounded-full hover:bg-gray-600 focus:outline-none" title={collapsedSections['status'] ? "Mở rộng" : "Thu gọn"}>
                            {collapsedSections['status'] ? '🔽' : '🔼'}
                        </button>
                    </h4>
                    {!collapsedSections['status'] && (
                        (combinedStatusAndAttributes.length > 0) ? (
                            <div className="flex flex-wrap gap-2 text-xs">
                                {combinedStatusAndAttributes.map((item, index) => {
                                    let icon, textColor = "text-gray-300";
                                    switch (item.type?.toLowerCase()) {
                                        case 'buff': icon = '✅'; textColor = "text-green-300"; break;
                                        case 'debuff': icon = '💔'; textColor = "text-red-300"; break;
                                        case 'injury': icon = '⚠️'; textColor = "text-yellow-300"; break;
                                        case 'attribute': icon = '✨'; textColor = "text-amber-300"; break;
                                        default: icon = 'ℹ️'; textColor = "text-blue-300"; break;
                                    }
                                    return (
                                        <div key={item.id || `item-${index}`} className={`flex items-center justify-between bg-gray-700 p-1.5 rounded-md shadow ${textColor}`} title={item.description || item.name}>
                                            <div className="flex items-center">
                                                <span className="mr-1.5">{icon}</span>
                                                {item.name || (item as any).Name}
                                            </div>
                                            {item.type !== 'attribute' && (
                                                <button onClick={() => handleRemoveStatus(item)} className="ml-2 text-red-400 hover:text-red-200 text-sm font-bold leading-none flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-500/30 transition-colors">
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic mt-1">Không có trạng thái nào.</p>
                        )
                    )}
                </div>
            </div>

            <div className="flex-grow bg-gray-800 p-3 md:p-5 rounded-xl shadow-2xl overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700" style={{ maxHeight: '60vh', minHeight: '300px' }} id="story-content-area">
                <h2 className="text-lg font-semibold text-green-400 mb-2">Diễn biến câu chuyện:</h2>
                {storyHistory.map((item) => (
                    <StoryItemComponent key={item.id} item={item} formatStoryText={formatStoryText} />
                ))}
                {isLoading && currentStory === '' && (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                        <p className="mt-3 text-purple-300">AI đang viết tiếp câu chuyện...</p>
                    </div>
                )}
            </div>

            {!isLoading && (
                <div className="bg-gray-800 p-3 md:p-5 rounded-xl shadow-xl mt-auto">
                    {choices.length > 0 && (
                        <>
                            <h3 className="text-lg font-semibold text-green-400 mb-3">Lựa chọn của ngươi:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {choices.map((choice, index) => (
                                    <button key={index} onClick={() => handleChoice(choice)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
                                        {index + 1}. {choice}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {gameSettings.allowCustomActionInput && (
                        <div>
                            <label htmlFor="customActionInput" className="block text-md font-medium text-gray-300 mb-1">Hoặc nhập hành động tùy ý:</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="customActionInput"
                                    value={customActionInput}
                                    onChange={(e) => setCustomActionInput(e.target.value)}
                                    placeholder="Ví dụ: Nhìn xung quanh, (Nghĩ thầm: Hắn thật đáng ngờ), (Yêu cầu AI: Tả kỹ khung cảnh)..."
                                    className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCustomAction(customActionInput)}
                                />
                                <button
                                    onClick={() => handleCustomAction(customActionInput)}
                                    disabled={isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:shadow-lg transition-colors disabled:bg-gray-500"
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={handleGenerateSuggestedActions} disabled={isGeneratingSuggestedActions || isLoading} className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md disabled:bg-gray-500 flex items-center justify-center" title="AI Gợi Ý Hành Động">
                            {isGeneratingSuggestedActions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <span className="mr-2">💡</span>}
                            AI Gợi Ý Hành Động
                        </button>
                        {canUndo && (
                            <button onClick={handleUndo} disabled={isLoading} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md disabled:bg-gray-500 flex items-center justify-center" title="Đi lại lượt vừa rồi">
                                <span className="mr-2">↩️</span>
                                Hoàn Tác
                            </button>
                        )}
                    </div>
                </div>
            )}
            {isLoading && choices.length === 0 && currentStory !== '' && (
                <div className="text-center py-5">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                    <p className="mt-2 text-purple-300">Đang tạo lựa chọn...</p>
                </div>
            )}
        </div>
    );
};
