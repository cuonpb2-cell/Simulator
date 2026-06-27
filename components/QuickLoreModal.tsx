
import React from 'react';

interface QuickLoreModalProps {
    loreItem: any;
    show: boolean;
    onClose: () => void;
}

export const QuickLoreModal: React.FC<QuickLoreModalProps> = ({ loreItem, show, onClose }) => {
    if (!show || !loreItem) return null;
    let icon = 'ℹ️';
    const category = loreItem.category?.toLowerCase();

    if (category === 'npcs') icon = '👥';
    else if (category === 'items' || category === 'inventory') icon = '✨';
    else if (category === 'playerskills') icon = '⚡';
    else if (category === 'playerstatus') {
        switch (loreItem.type?.toLowerCase()) {
            case 'buff': icon = '✅'; break;
            case 'debuff': icon = '💔'; break;
            case 'injury': icon = '⚠️'; break;
            default: icon = 'ℹ️'; break;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[80]" onClick={onClose}>
            <div className="bg-gray-700 p-5 rounded-lg shadow-xl w-full max-w-sm border border-cyan-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start mb-2">
                    <span className="text-xl mr-2 mt-1">{icon}</span>
                    <h4 className="text-lg font-semibold text-cyan-300">{loreItem.Name || loreItem.NPC || loreItem.name || loreItem.title || "Không rõ tên"}</h4>
                </div>
                <p className="text-sm text-gray-200 bg-gray-600 p-3 rounded max-h-40 overflow-y-auto whitespace-pre-line scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-600">
                    {loreItem.Description || loreItem.Standing || loreItem.description || "Không có mô tả chi tiết."}
                </p>
                {loreItem.Personality && <p className="text-xs text-gray-300 mt-1"><strong>Tính cách:</strong> {loreItem.Personality}</p>}
                {(loreItem.Appearance || loreItem.appearance) && <p className="text-xs text-indigo-300 mt-1"><strong>Ngoại hình:</strong> {loreItem.Appearance || loreItem.appearance}</p>}
                {loreItem.duration && <p className="text-xs text-gray-300 mt-1"><strong>Thời gian:</strong> {loreItem.duration}</p>}
                {loreItem.effects && <p className="text-xs text-gray-300 mt-1"><strong>Ảnh hưởng:</strong> {loreItem.effects}</p>}
                <button onClick={onClose} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md text-sm">
                    Đóng
                </button>
            </div>
        </div>
    );
};
