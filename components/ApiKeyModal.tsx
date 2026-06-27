import React, { useState, useEffect } from 'react';
import type { ModalMessageState } from '../types';

interface ApiKeyModalProps {
    show: boolean;
    onClose: () => void;
    setModalMessage: (message: ModalMessageState) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ show, onClose, setModalMessage }) => {
    const [apiKey, setApiKey] = useState('');
    const [currentKey, setCurrentKey] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            const storedKey = localStorage.getItem('gemini_api_key');
            setCurrentKey(storedKey);
            setApiKey(''); // Clear input on open
        }
    }, [show]);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
            setModalMessage({
                show: true,
                title: 'Thành Công',
                content: 'API Key đã được lưu thành công. Các yêu cầu tới AI sẽ sử dụng key này.',
                type: 'success'
            });
            onClose();
        } else {
             setModalMessage({
                show: true,
                title: 'Lỗi',
                content: 'Vui lòng nhập một API Key hợp lệ.',
                type: 'error'
            });
        }
    };
    
    const handleClear = () => {
        localStorage.removeItem('gemini_api_key');
        setModalMessage({
            show: true,
            title: 'Đã Xóa',
            content: 'API Key đã được xóa. Ứng dụng sẽ sử dụng key mặc định (nếu có).',
            type: 'info'
        });
        onClose();
    }

    if (!show) return null;

    const maskKey = (key: string | null): string => {
        if (!key) return "Chưa có key nào được cấu hình.";
        if (key.length <= 8) return "Key quá ngắn để ẩn.";
        return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-yellow-700/50">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4">🔑 Cấu Hình API Key</h2>
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-300">Key hiện tại:</p>
                    <p className="text-lg font-mono text-yellow-400 break-all">{maskKey(currentKey)}</p>
                </div>

                <label htmlFor="apiKeyInput" className="block text-lg font-medium text-gray-300 mb-2">Nhập API Key mới:</label>
                <input
                    id="apiKeyInput"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Nhập Google AI API Key của bạn vào đây"
                    className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-white"
                />
                 <p className="text-xs text-gray-400 mt-2 italic">
                    Key của bạn sẽ được lưu trữ cục bộ trong trình duyệt của bạn và sẽ không được gửi đi bất cứ đâu ngoài các máy chủ của Google AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                        Lưu Key
                    </button>
                    {currentKey && (
                        <button onClick={handleClear} className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                            Xóa Key Đã Lưu
                        </button>
                    )}
                </div>
                 <button onClick={onClose} className="mt-3 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
};