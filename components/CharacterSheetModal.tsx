
import React, { useState } from 'react';
import type { KnowledgeBase } from '../types';

interface CharacterSheetModalProps {
    show: boolean;
    onClose: () => void;
    knowledge: KnowledgeBase;
    characterName: string;
    finalPersonality: string;
    handleRemoveStatus: (status: any) => void;
    handleRemoveItem: (item: any) => void;
    handleRemoveSkill: (skill: any) => void;
    handleUpdateKnowledgeItem: (id: string, category: keyof KnowledgeBase, updatedData: any) => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
    show, onClose, knowledge, characterName, finalPersonality,
    handleRemoveStatus, handleRemoveItem, handleRemoveSkill, handleUpdateKnowledgeItem
}) => {
    const [editingItem, setEditingItem] = useState<{ item: any, category: keyof KnowledgeBase } | null>(null);
    const [editForm, setEditForm] = useState<any>({});

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
        setEditingItem({ item, category });
        setEditForm({
            Name: item.Name || item.name || '',
            Description: item.Description || item.description || '',
            Type: item.Type || item.type || '',
            duration: item.duration || '',
            effects: item.effects || '',
            source: item.source || ''
        });
    };

    const handleEditSave = () => {
        if (editingItem) {
            handleUpdateKnowledgeItem(editingItem.item.id, editingItem.category, editForm);
            setEditingItem(null);
        }
    };

    const handleEditCancel = () => {
        setEditingItem(null);
    };

    const renderSection = (title: string, items: any[] | undefined, category: keyof KnowledgeBase, icon: string, itemColor = "text-green-300", renderItem: (item: any, index: number, color: string) => React.ReactNode, emptyText = "Chưa có thông tin.") => {
        const hasItems = Array.isArray(items) && items.length > 0;
        return (
            <div className="mb-6">
                <h4 className={`text-lg font-semibold ${itemColor} mb-3 flex items-center gap-2 border-b border-gray-700 pb-2`}>{icon} {title}</h4>
                {hasItems ? (
                    <ul className="space-y-2 text-sm">
                        {items.map((item, index) => (
                            <div key={`${title}-${index}`} className="relative group">
                                {renderItem(item, index, itemColor)}
                                <button
                                    onClick={() => handleEditClick(item, category)}
                                    className="absolute top-3 right-10 text-gray-400 hover:text-yellow-400 p-1 rounded-full hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Chỉnh sửa"
                                >
                                    ✏️
                                </button>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic text-sm pl-2">{emptyText}</p>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[105]">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-1.5 sm:p-2 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-yellow-600/50 relative">
                <div className="p-4 flex justify-between items-center bg-gray-900/50 rounded-t-lg border-b border-yellow-700/30">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                        👤 Hồ Sơ Nhân Vật
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="overflow-y-auto flex-grow p-4 sm:p-6 bg-gray-800/30 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-gray-900">
                    
                    {/* Basic Info Block */}
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 shadow-md mb-6 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0 bg-gray-700 rounded-full h-16 w-16 flex items-center justify-center text-3xl border-2 border-yellow-500">
                            👤
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white mb-1">{characterName || "Vô Danh"}</h4>
                            <p className="text-gray-300 text-sm"><strong>Tính cách:</strong> <span className="text-yellow-200">{finalPersonality || "Chưa xác định"}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1: Status & Skills */}
                        <div>
                            {renderSection("Trạng Thái", knowledge.playerStatus, 'playerStatus', '❤️', "text-red-400", (item, index, color) => (
                                <li key={`status-${index}`} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-start border-l-4 border-red-500 pr-8 hover:bg-gray-700 transition-colors">
                                    <div className="flex-grow">
                                        <strong className={color}>{getStatusIcon(item.type)} {item.name || "Trạng thái không tên"}</strong>
                                        <div className="text-gray-300 text-sm mt-1">{item.description || "Không có mô tả."}</div>
                                        <div className="text-xs text-gray-400 mt-1 pl-2 border-l border-gray-600">
                                            {item.duration && <span className="block">⏱️ {item.duration}</span>}
                                            {item.effects && <span className="block">⚡ {item.effects}</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveStatus(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                </li>
                            ), "Sức khỏe bình thường.")}

                            {renderSection("Kỹ Năng / Phép Thuật", knowledge.playerSkills, 'playerSkills', '⚡', "text-yellow-400", (item, index, color) => (
                                <li key={`skill-${index}`} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-start border-l-4 border-yellow-500 pr-8 hover:bg-gray-700 transition-colors">
                                    <div className="flex-grow">
                                        <strong className={color}>{item.Name || "Kỹ năng không tên"}</strong>
                                        {item.Type && <span className="text-xs text-gray-400 ml-1">[{item.Type}]</span>}
                                        <div className="text-gray-300 text-sm mt-1">{item.Description || "Không có mô tả."}</div>
                                    </div>
                                    <button onClick={() => handleRemoveSkill(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                </li>
                            ))}
                        </div>

                        {/* Column 2: Inventory */}
                        <div>
                            {renderSection("Hành Trang (Balo)", knowledge.inventory, 'inventory', '🎒', "text-orange-400", (item, index, color) => (
                                <li key={`inventory-${index}`} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-start border-l-4 border-orange-500 pr-8 hover:bg-gray-700 transition-colors">
                                    <div className="flex-grow">
                                        <strong className={color}>{item.Name || "Vật phẩm không tên"}</strong>
                                        <div className="text-gray-300 text-sm mt-1">{item.Description || "Không có mô tả."}</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {item.Type && <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-600">{item.Type}</span>}
                                            {typeof item.Uses === 'number' && <span className="text-xs bg-gray-800 text-orange-300 px-1.5 py-0.5 rounded border border-gray-600">x{item.Uses}</span>}
                                            {item.Equippable && <span className="text-xs text-green-400 px-1.5 py-0.5">⚔️ Trang bị</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveItem(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                </li>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="mt-2 w-full bg-yellow-700 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-colors">
                    Đóng Hồ Sơ
                </button>

                {/* Edit Modal Overlay (Duplicated logic for independence) */}
                {editingItem && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center p-6 rounded-xl z-[110]">
                        <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg border border-yellow-600 shadow-2xl overflow-y-auto max-h-[80vh]">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4">✏️ Chỉnh Sửa: {editForm.Name}</h3>
                            
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
                                
                                {editingItem.category === 'playerStatus' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Thời gian (Duration):</label>
                                            <input
                                                type="text"
                                                value={editForm.duration}
                                                onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Hiệu ứng (Effects):</label>
                                            <input
                                                type="text"
                                                value={editForm.effects}
                                                onChange={(e) => setEditForm({...editForm, effects: e.target.value})}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Loại (Type):</label>
                                    <input
                                        type="text"
                                        value={editForm.Type}
                                        onChange={(e) => setEditForm({...editForm, Type: e.target.value})}
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Mô Tả:</label>
                                    <textarea
                                        value={editForm.Description}
                                        onChange={(e) => setEditForm({...editForm, Description: e.target.value})}
                                        rows={4}
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={handleEditSave} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg">
                                    Lưu
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
