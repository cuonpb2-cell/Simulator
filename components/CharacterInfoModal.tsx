
import React, { useState, useEffect } from 'react';
import type { KnowledgeBase, WorldKnowledgeRule, Chapter } from '../types';

interface CharacterInfoModalProps {
    knowledge: KnowledgeBase;
    worldKnowledge: WorldKnowledgeRule[];
    show: boolean;
    onClose: () => void;
    characterName: string;
    characterAppearance?: string;
    finalPersonality: string;
    characterBackstory?: string;
    onUpdateBasicInfo: (name: string, personality: string, appearance: string, backstory: string) => void;
    handleRemoveStatus: (status: any) => void;
    handleRemoveItem: (item: any) => void;
    handleRemoveSkill: (skill: any) => void;
    handleRemoveNpc: (npc: any) => void;
    handleRemoveDna: (dna: any) => void;
    handleUpdateKnowledgeItem: (id: string, category: keyof KnowledgeBase, updatedData: any) => void;
    handleAddKnowledgeItem: (category: keyof KnowledgeBase, newItem: any) => void;
    chapters: Chapter[];
    chapterGoal: string;
    setChapterGoal: (goal: string) => void;
    collapsedSections: { [key: string]: boolean };
    toggleSectionCollapse: (sectionKey: string) => void;
}

export const CharacterInfoModal: React.FC<CharacterInfoModalProps> = ({
    knowledge, worldKnowledge, show, onClose, characterName, characterAppearance, finalPersonality, characterBackstory, onUpdateBasicInfo,
    handleRemoveStatus, handleRemoveItem, handleRemoveSkill, handleRemoveNpc, handleRemoveDna, handleUpdateKnowledgeItem, handleAddKnowledgeItem, chapters, chapterGoal, setChapterGoal,
    collapsedSections, toggleSectionCollapse
}) => {
    const [activeTab, setActiveTab] = useState('character');
    const [editingItem, setEditingItem] = useState<{ id: string, category: keyof KnowledgeBase } | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [basicInfoForm, setBasicInfoForm] = useState({ name: '', personality: '', appearance: '', backstory: '' });

    useEffect(() => {
        if (show) {
            setActiveTab('character');
            setBasicInfoForm({ name: characterName, personality: finalPersonality, appearance: characterAppearance || '', backstory: characterBackstory || '' });
            setIsEditingBasicInfo(false);
        }
    }, [show, characterName, finalPersonality, characterAppearance, characterBackstory]);

    if (!show) return null;

    const getStatusIcon = (statusType?: string) => {
        switch (statusType?.toLowerCase()) {
            case 'buff': return '✅';
            case 'debuff': return '💔';
            case 'injury': return '⚠️';
            default: return 'ℹ️';
        }
    };

    const handleEditClick = (item: any, category: keyof KnowledgeBase) => {
        setEditingItem({ id: item.id, category });
        setEditForm({
            Name: item.Name || item.name || '',
            Description: item.Description || item.description || '',
            Personality: item.Personality || '',
            Appearance: item.Appearance || item.appearance || '',
            Type: item.Type || item.type || '',
            Affinity: item.Affinity || item.affinity || '',
            Quantity: item.Quantity || '',
        });
    };

    const handleCreateNew = (category: keyof KnowledgeBase) => {
        setEditingItem({ id: 'new', category });
        setEditForm({
            Name: '',
            Description: '',
            Personality: '',
            Appearance: '',
            Type: '',
            Affinity: '',
            Quantity: '',
        });
    };

    const handleEditSave = () => {
        if (editingItem) {
            if (editingItem.id === 'new') {
                handleAddKnowledgeItem(editingItem.category, editForm);
            } else {
                handleUpdateKnowledgeItem(editingItem.id, editingItem.category, editForm);
            }
            setEditingItem(null);
        }
    };

    const toggleSection = (title: string) => {
        toggleSectionCollapse('modal_' + title);
    };

    const handleTogglePin = (item: any, category: keyof KnowledgeBase | null) => {
        if (!category) return;
        handleUpdateKnowledgeItem(item.id, category, { pinned: !item.pinned });
    };

    const handleEditCancel = () => {
        setEditingItem(null);
    };

    const renderSection = (title: string, items: any[] | undefined, category: keyof KnowledgeBase | null, icon: string, itemColor = "text-green-300", renderItem: (item: any, index: number, color: string) => React.ReactNode, emptyText = "Chưa có thông tin.") => {
        const hasItems = Array.isArray(items) && items.length > 0;
        const isCollapsed = collapsedSections['modal_' + title] || false;
        
        let sortedItems = items || [];
        if (hasItems) {
            sortedItems = [...items].sort((a, b) => {
                const aPinned = a.pinned ? 1 : 0;
                const bPinned = b.pinned ? 1 : 0;
                return bPinned - aPinned;
            });
        }
        
        return (
            <div className="mb-4">
                <button 
                    onClick={() => toggleSection(title)}
                    className={`w-full text-left text-lg font-semibold ${itemColor} mb-2 flex items-center gap-2 justify-between cursor-pointer hover:opacity-80 transition-opacity`}
                >
                    <span className="flex items-center gap-2">{icon} {title}</span>
                    <span className="text-sm">{isCollapsed ? '▼' : '▲'}</span>
                </button>
                {hasItems ? (
                    <ul className="space-y-1.5 text-sm list-none p-0 flex flex-col gap-1.5">
                        {sortedItems.map((item, index) => {
                            if (isCollapsed && !item.pinned) return null;
                            return (
                                <li key={item.id || `${title}-${index}`} className="relative group block">
                                    {renderItem(item, index, itemColor)}
                                    {category && (
                                        <button
                                            onClick={() => handleTogglePin(item, category)}
                                            className={`absolute top-3 right-16 z-10 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${item.pinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-300 opacity-0 group-hover:opacity-100'}`}
                                            title={item.pinned ? "Bỏ ghim" : "Ghim lên đầu"}
                                        >
                                            📌
                                        </button>
                                    )}
                                    {category && (
                                        <button
                                            onClick={() => handleEditClick(item, category)}
                                            className="absolute top-3 right-8 text-gray-400 hover:text-yellow-400 p-1 w-6 h-6 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Chỉnh sửa"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    !isCollapsed && <p className="text-gray-400 italic text-sm pl-2">{emptyText}</p>
                )}
            </div>
        );
    };
    
    interface TabButtonProps {
        tabName: string;
        label: string;
        icon: string;
    }

    const TabButton: React.FC<TabButtonProps> = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-t-lg transition-all focus:outline-none
                ${activeTab === tabName ? 'bg-gray-700 text-purple-300 border-b-2 border-purple-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50 hover:text-purple-400'}`}
        >
            {icon} <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-1.5 sm:p-2 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-purple-700/50 relative">
                <div className="p-4 flex justify-between items-center bg-gray-900/50 rounded-t-lg">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">
                        📝 Bảng Thông Tin
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="flex border-b border-gray-700 bg-gray-800/70">
                    <TabButton tabName="character" label="Nhân Vật" icon="👤" />
                    <TabButton tabName="interaction" label="Tương Tác" icon="👥" />
                    <TabButton tabName="world" label="Thế Giới" icon="🌍" />
                </div>

                <div className="overflow-y-auto flex-grow p-4 sm:p-6 bg-gray-700/50 rounded-b-lg scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                    {activeTab === 'character' && (
                         <div className="space-y-6">
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/50 relative group">
                                <h4 className="text-lg font-semibold text-amber-400 mb-2 flex items-center justify-between gap-2">
                                    <span>👤 Thông Tin Cơ Bản</span>
                                    {!isEditingBasicInfo && (
                                        <button
                                            onClick={() => setIsEditingBasicInfo(true)}
                                            className="text-gray-400 hover:text-yellow-400 p-1 w-6 h-6 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Chỉnh sửa thông tin cơ bản"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                </h4>
                                {isEditingBasicInfo ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Tên:</label>
                                            <input type="text" value={basicInfoForm.name} onChange={e => setBasicInfoForm(prev => ({...prev, name: e.target.value}))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Tính cách:</label>
                                            <input type="text" value={basicInfoForm.personality} onChange={e => setBasicInfoForm(prev => ({...prev, personality: e.target.value}))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Ngoại hình:</label>
                                            <input type="text" value={basicInfoForm.appearance} onChange={e => setBasicInfoForm(prev => ({...prev, appearance: e.target.value}))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Tiểu sử:</label>
                                            <textarea value={basicInfoForm.backstory} onChange={e => setBasicInfoForm(prev => ({...prev, backstory: e.target.value}))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500" rows={3}></textarea>
                                        </div>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <button onClick={() => { onUpdateBasicInfo(basicInfoForm.name, basicInfoForm.personality, basicInfoForm.appearance, basicInfoForm.backstory); setIsEditingBasicInfo(false); }} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded text-sm font-medium">Lưu</button>
                                            <button onClick={() => { setBasicInfoForm({ name: characterName, personality: finalPersonality, appearance: characterAppearance || '', backstory: characterBackstory || '' }); setIsEditingBasicInfo(false); }} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm font-medium">Hủy</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {characterName && <p className="text-gray-300 text-sm pl-2"><strong>Tên:</strong> {characterName}</p>}
                                        <p className="text-gray-300 text-sm pl-2"><strong>Tính cách:</strong> {finalPersonality || "Chưa xác định"}</p>
                                        <p className="text-gray-300 text-sm pl-2"><strong>Ngoại hình:</strong> {characterAppearance || "Chưa xác định"}</p>
                                        <p className="text-gray-300 text-sm pl-2"><strong>Tiểu sử:</strong> {characterBackstory || "Chưa có"}</p>
                                    </>
                                )}
                            </div>
                            {renderSection("Trạng Thái", knowledge.playerStatus, 'playerStatus', 'ℹ️', "text-indigo-400", (item, index, color) => (
                                <div key={`status-${index}`} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-start border-l-4 border-indigo-500 pr-24">
                                    <div className="flex-grow">
                                        <strong className={color}>{getStatusIcon(item.type)} {item.name || "Trạng thái không tên"}</strong>: {item.description || "Không có mô tả."}
                                        <div className="text-xs text-gray-400 mt-1 ml-3">
                                            {item.duration && <span><strong>Thời gian:</strong> {item.duration}. </span>}
                                            {item.effects && <span><strong>Ảnh hưởng:</strong> {item.effects}. </span>}
                                            {item.source && <span><strong>Nguồn:</strong> {item.source}.</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveStatus(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                </div>
                            ), "Không có trạng thái nào đang hoạt động.")}
                            {renderSection("Balo Đồ", knowledge.inventory, 'inventory', '🎒', "text-orange-400", (item, index, color) => (
                                <div key={`inventory-${index}`} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-start border-l-4 border-orange-500 pr-24">
                                    <div className="flex-grow">
                                        <strong className={color}>{item.Name || "Vật phẩm không tên"}</strong>: {item.Description || "Không có mô tả."}
                                        <span className="block text-xs text-gray-400 mt-1">
                                            ({item.Type || "Chưa rõ loại"}) - Số lượng: {item.Quantity || 1}
                                            {item.Equippable ? " (Có thể trang bị)" : ""}
                                            {item.Usable ? " (Có thể sử dụng)" : ""}
                                            {item.Consumable ? " (Tiêu hao)" : ""}
                                            {typeof item.Uses !== 'undefined' ? ` (Còn ${item.Uses} lần)` : ""}
                                        </span>
                                    </div>
                                    <button onClick={() => handleRemoveItem(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                </div>
                            ))}
                            {renderSection("Kỹ Năng", knowledge.playerSkills, 'playerSkills', '⚡', "text-yellow-400", (item, index, color) => (
                                <div key={`skill-${index}`} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-start border-l-4 border-yellow-500 pr-24">
                                    <div className="flex-grow">
                                        <strong className={color}>{item.Name || "Kỹ năng không tên"}</strong>: {item.Description || "Không có mô tả."}
                                        {item.Type && <span className="text-xs text-gray-400 ml-1">({item.Type})</span>}
                                    </div>
                                    <button onClick={() => handleRemoveSkill(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                </div>
                            ))}

                            <div className="bg-gradient-to-r from-teal-900/40 to-emerald-950/40 p-4 rounded-lg border border-teal-600/30 mt-6 shadow-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-400 flex items-center gap-2">
                                        🧬 DNA Nhân Vật (Người Chơi Tự Định Nghĩa)
                                    </h4>
                                    <button 
                                        onClick={() => handleCreateNew('characterDna')}
                                        className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded text-xs transition-all shadow-md font-semibold flex items-center gap-1.5 border border-teal-400/20 active:scale-95 cursor-pointer"
                                    >
                                        <span className="text-sm font-bold">+</span> Thêm Đặc Tính DNA
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mb-4 pl-1">
                                    Thêm các đặc điểm bất biến của bạn như: <strong>Phong cách chiến đấu</strong>, <strong>Đặc điểm vẻ ngoài</strong>, <strong>Hệ/Nguồn gốc sức mạnh</strong>... AI sẽ luôn tôn trọng và tuân theo DNA này của bạn! (Chỉ bạn mới có quyền tự thêm hay sửa đổi mục này).
                                </p>
                                {renderSection("DNA Đặc Tính", knowledge.characterDna || [], 'characterDna', '🧬', "text-teal-300", (item, index, color) => (
                                    <div key={`dna-${index}`} className="bg-gray-800/75 p-3 rounded-md flex justify-between items-start border-l-4 border-teal-500 pr-24 hover:bg-gray-800 transition-colors">
                                        <div className="flex-grow">
                                            <strong className={color}>{item.Name || "Đặc tính không tên"}</strong>
                                            {item.Type && <span className="text-xs text-teal-400 ml-2 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-600/30">{item.Type}</span>}
                                            <div className="text-gray-300 text-sm mt-1 whitespace-pre-line leading-relaxed">{item.Description || "Không có mô tả chi tiết."}</div>
                                        </div>
                                        <button onClick={() => handleRemoveDna(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                    </div>
                                ), "Chưa có đặc tính DNA nào được thiết lập. Hãy thêm đặc điểm riêng của bạn!")}
                            </div>
                        </div>
                    )}
                    {activeTab === 'interaction' && (
                        <div className="space-y-6">
                            <div className="flex justify-end mb-2">
                                <button 
                                    onClick={() => handleCreateNew('npcs')}
                                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-sm transition-colors flex items-center shadow-md font-medium"
                                >
                                    <span className="mr-1 text-lg leading-none">+</span> Thêm NPC
                                </button>
                            </div>
                            {renderSection("Nhân Vật Đã Gặp", knowledge.npcs, 'npcs', '👥', "text-sky-400", (item, index, color) => {
                                return (
                                    <div key={`npc-${index}`} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-start border-l-4 border-sky-500 pr-24">
                                        <div className="flex-grow">
                                            <strong className={color}>{item.Name || "Không rõ tên"}</strong>
                                            {item.Personality && <span className="text-gray-400 text-xs"> (Tính cách: {item.Personality})</span>}
                                            {item.Affinity && <span className="text-pink-400 text-xs ml-2"> (Hảo cảm: {item.Affinity})</span>}
                                            {item.Appearance && <p className="text-xs text-indigo-300 mt-1"><strong>Ngoại hình:</strong> {item.Appearance}</p>}
                                            <p className="text-xs text-gray-300 mt-1 whitespace-pre-line">{item.Description || "Chưa có mô tả."}</p>
                                            {item.statuses && item.statuses.length > 0 && (
                                                <div className="text-xs text-gray-400 ml-3 mt-1">
                                                    <strong>Trạng thái NPC:</strong> {item.statuses.map((s: any) => `${s.name} (${s.type})`).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => handleRemoveNpc(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                    </div>
                                );
                            }, "Chưa gặp gỡ nhân vật nào.")}
                        </div>
                    )}
                     {activeTab === 'world' && (
                        <div className="space-y-6">
                            <div className="flex justify-end mb-2 space-x-2">
                                <button 
                                    onClick={() => handleCreateNew('items')}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm transition-colors shadow-md font-medium flex items-center"
                                >
                                    <span className="mr-1 text-lg leading-none">+</span> Thêm Vật Phẩm
                                </button>
                                <button 
                                    onClick={() => handleCreateNew('locations')}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors shadow-md font-medium flex items-center"
                                >
                                    <span className="mr-1 text-lg leading-none">+</span> Thêm Địa Điểm
                                </button>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center gap-2">🎯 Sườn Cốt Truyện / Mục Tiêu Chương</h4>
                                <div className="bg-gray-800/60 p-4 rounded-lg border border-yellow-600/40">
                                    <p className="text-xs text-gray-400 mb-2 italic">Ghi chú sườn cốt truyện hoặc mục tiêu bạn muốn AI hướng tới trong chương này (VD: "Tập trung rèn luyện sức mạnh", "Gặp gỡ nhân vật X", "Trận chiến kết thúc hòa").</p>
                                    <textarea
                                        value={chapterGoal}
                                        onChange={(e) => setChapterGoal(e.target.value)}
                                        placeholder="Nhập sườn cốt truyện hoặc mục tiêu..."
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-yellow-500 focus:border-yellow-500 min-h-[100px] resize-y"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center gap-2">📚 Cốt Truyện (Chương Hồi)</h4>
                                {chapters.length > 0 ? (
                                    <div className="space-y-4">
                                        {chapters.map((chapter, index) => (
                                            <div key={chapter.id} className="bg-gray-800/60 p-4 rounded-lg border border-yellow-600/40">
                                                <h5 className="text-md font-bold text-yellow-200 mb-1 border-b border-gray-600 pb-1">{chapter.title}</h5>
                                                <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{chapter.content}</p>
                                                {chapter.timestamp && <p className="text-xs text-gray-500 mt-2 text-right italic">Được ghi lại lúc: {new Date(chapter.timestamp).toLocaleString('vi-VN')}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-sm pl-2">Chưa có chương truyện nào được hoàn thành.</p>
                                )}
                            </div>

                            {renderSection("Vật Phẩm Thế Giới (Lore)", knowledge.items, 'items', '✨', "text-amber-300", (item, index, color) => (
                                <div key={`loreitem-${index}`} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border-l-4 border-amber-500 pr-24">
                                    <strong className={color}>{item.Name || "Không rõ tên"}:</strong> {item.Description || "Chưa có mô tả."}
                                </div>
                            ))}
                            {renderSection("Địa Điểm Đã Khám Phá", knowledge.locations, 'locations', '🗺️', "text-blue-400", (item, index, color) => (
                                <div key={`location-${index}`} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border-l-4 border-blue-500 pr-24">
                                    <strong className={color}>{item.Name || "Không rõ tên"}:</strong> {item.Description || "Chưa có mô tả."}
                                </div>
                            ))}
                            {renderSection("Tri Thức Thế Giới Áp Dụng", worldKnowledge.filter(r => r.enabled), null, '🌍', "text-green-400", (rule, index) => (
                                <div key={`wk-${index}`} className="text-gray-300 p-2 bg-gray-800/50 rounded-md border-l-4 border-green-500">{rule.content}</div>
                            ), "Không có tri thức nào đang được áp dụng.")}
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="mt-2 w-full bg-purple-600/80 hover:bg-purple-700/90 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                    Đóng
                </button>

                {/* Edit Modal Overlay */}
                {editingItem && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center p-6 rounded-xl z-[60]">
                        <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg border border-yellow-600 shadow-2xl overflow-y-auto max-h-[80vh]">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4">
                                {editingItem.id === 'new' ? '✨ Thêm Mới' : '✏️ Chỉnh Sửa Thông Tin'}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Tên:</label>
                                    <input
                                        type="text"
                                        value={editForm.Name}
                                        onChange={(e) => setEditForm({...editForm, Name: e.target.value})}
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>

                                {(editingItem.category === 'npcs') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Tính Cách:</label>
                                            <input
                                                type="text"
                                                value={editForm.Personality}
                                                onChange={(e) => setEditForm({...editForm, Personality: e.target.value})}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Ngoại Hình:</label>
                                            <input
                                                type="text"
                                                value={editForm.Appearance}
                                                onChange={(e) => setEditForm({...editForm, Appearance: e.target.value})}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                                placeholder="VD: Tóc bạc, đeo mặt nạ..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Hảo Cảm / Thái Độ:</label>
                                            <input
                                                type="text"
                                                value={editForm.Affinity}
                                                onChange={(e) => setEditForm({...editForm, Affinity: e.target.value})}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                                placeholder="VD: Ưa thích, Căm thù, Xã giao..."
                                            />
                                        </div>
                                    </>
                                )}

                                {(editingItem.category === 'items' || editingItem.category === 'inventory' || editingItem.category === 'playerSkills' || editingItem.category === 'playerStatus') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Loại:</label>
                                        <input
                                            type="text"
                                            value={editForm.Type}
                                            onChange={(e) => setEditForm({...editForm, Type: e.target.value})}
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                        />
                                    </div>
                                )}

                                {editingItem.category === 'characterDna' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Loại Đặc Điểm DNA:</label>
                                        <select
                                            value={editForm.Type || ''}
                                            onChange={(e) => setEditForm({...editForm, Type: e.target.value})}
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                        >
                                            <option value="">Chọn loại đặc điểm...</option>
                                            <option value="⚔️ Phong cách chiến đấu">⚔️ Phong cách chiến đấu</option>
                                            <option value="🎨 Đặc điểm vẻ ngoài">🎨 Đặc điểm vẻ ngoài</option>
                                            <option value="🔥 Sức mạnh & Kỹ năng">🔥 Sức mạnh & Kỹ năng</option>
                                            <option value="🧠 Tính cách ẩn">🧠 Tính cách ẩn</option>
                                            <option value="✨ Khác">✨ Khác</option>
                                        </select>
                                    </div>
                                )}

                                {editingItem.category === 'inventory' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Số Lượng:</label>
                                        <input
                                            type="text"
                                            value={editForm.Quantity}
                                            onChange={(e) => setEditForm({...editForm, Quantity: e.target.value})}
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Mô Tả:</label>
                                    <textarea
                                        value={editForm.Description}
                                        onChange={(e) => setEditForm({...editForm, Description: e.target.value})}
                                        rows={4}
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={handleEditSave} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg">
                                    Lưu Thay Đổi
                                </button>
                                <button onClick={handleEditCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg">
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
