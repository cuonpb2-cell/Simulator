
import React, { useRef } from 'react';
import { NARRATOR_PRONOUNS, PLAYER_PERSONALITIES } from '../constants';
import type { GameSettings } from '../types';

interface GameSetupScreenProps {
  goHome: () => void;
  gameSettings: GameSettings;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  initializeGame: () => void;
  isLoading: boolean;
  handleFetchSuggestions: (fieldType: 'theme' | 'setting') => void;
  isFetchingSuggestions: boolean;
  handleGenerateBackstory: () => void;
  isGeneratingContent: boolean;
  handleGenerateDifficultyDescription: () => void;
  isGeneratingDifficultyDesc: boolean;
  addInitialWorldElement: () => void;
  removeInitialWorldElement: (id: string) => void;
  handleInitialElementChange: (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleGenerateInitialElementDescription: (index: number) => void;
  isGeneratingInitialElementDesc: {[key: string]: boolean};
  handleGenerateGoal: () => void;
  isGeneratingGoal: boolean;
  handleGenerateCharacterName: () => void;
  isGeneratingCharacterName: boolean;
  handleGenerateInitialSkill: () => void;
  isGeneratingInitialSkill: boolean;
  handleSaveSetupToFile: () => void;
  handleLoadSetupFromFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  addInitialWorldKnowledgeRule: () => void;
  updateInitialWorldKnowledgeRule: (id: string, content: string) => void;
  removeInitialWorldKnowledgeRule: (id: string) => void;
}

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({
    goHome, gameSettings, handleInputChange, initializeGame, isLoading, 
    handleFetchSuggestions, isFetchingSuggestions,
    handleGenerateBackstory, isGeneratingContent, handleGenerateDifficultyDescription, isGeneratingDifficultyDesc,
    addInitialWorldElement, removeInitialWorldElement, handleInitialElementChange, handleGenerateInitialElementDescription,
    isGeneratingInitialElementDesc, handleGenerateGoal, isGeneratingGoal,
    handleGenerateCharacterName, isGeneratingCharacterName, 
    handleGenerateInitialSkill, isGeneratingInitialSkill,
    handleSaveSetupToFile, handleLoadSetupFromFile,
    addInitialWorldKnowledgeRule, updateInitialWorldKnowledgeRule, removeInitialWorldKnowledgeRule
}) => {
    const setupFileInputRef = useRef<HTMLInputElement>(null);
    const handleLoadClick = () => {
        setupFileInputRef.current?.click();
    };

    return (
    <div className="min-h-screen bg-gray-800 text-white p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-gray-700 p-6 md:p-8 rounded-xl shadow-2xl relative">
        <button onClick={goHome} className="absolute top-4 left-4 text-purple-400 hover:text-purple-300 text-sm flex items-center bg-gray-600 hover:bg-gray-500 p-2 rounded-lg shadow transition-colors">
            ↩️ Về Trang Chủ
        </button>
        <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-8 text-center pt-10 sm:pt-0">Kiến Tạo Thế Giới Của Ngươi</h2>
                
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
            <div className="space-y-6">
                <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-pink-400 px-2">📜 Bối Cảnh Truyện</legend>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="theme" className="block text-lg font-medium text-gray-300 mb-1">Thể loại:</label>
                            <div className="flex items-center gap-2">
                                <input type="text" name="theme" id="theme" value={gameSettings.theme} onChange={handleInputChange} placeholder="VD: Tiên hiệp, Huyền huyễn..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-pink-500 focus:border-pink-500" />
                                <button onClick={() => handleFetchSuggestions('theme')} disabled={isFetchingSuggestions} className="p-3 bg-pink-600 hover:bg-pink-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Chủ đề">
                                    {isFetchingSuggestions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="setting" className="block text-lg font-medium text-gray-300 mb-1">Thế Giới/Bối Cảnh Chi Tiết:</label>
                            <div className="flex items-center gap-2">
                                <input type="text" name="setting" id="setting" value={gameSettings.setting} onChange={handleInputChange} placeholder="VD: Đại Lục Phong Vân..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-pink-500 focus:border-pink-500" />
                                <button onClick={() => handleFetchSuggestions('setting')} disabled={isFetchingSuggestions} className="p-3 bg-pink-600 hover:bg-pink-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Bối cảnh">
                                    {isFetchingSuggestions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-yellow-500 px-2">📖 Sườn Cốt Truyện</legend>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="initialChapterGoal" className="block text-lg font-medium text-gray-300 mb-1">Mục Tiêu Chương/Cốt Truyện Gốc:</label>
                            <textarea 
                                name="initialChapterGoal" 
                                id="initialChapterGoal" 
                                value={gameSettings.initialChapterGoal || ''} 
                                onChange={handleInputChange} 
                                rows={3} 
                                placeholder="VD: Khám phá bí ẩn của sơn động phía tây..." 
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" 
                            />
                            <p className="text-xs text-gray-400 mt-1 italic">Đây là định hướng chính để AI dẫn dắt câu chuyện trong chương hiện tại. Bạn có thể thay đổi sau này trong khi chơi.</p>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-pink-400 px-2">📜 Phong cách viết</legend>
                    <div className="mt-2 space-y-4">
                        <select name="narratorPronoun" value={gameSettings.narratorPronoun} onChange={handleInputChange} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500">
                            {NARRATOR_PRONOUNS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </fieldset>
                <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-teal-400 px-2">🎲 Độ Khó & Nội Dung</legend>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="difficulty" className="block text-lg font-medium text-gray-300 mb-1">Chọn Độ Khó:</label>
                            <select name="difficulty" id="difficulty" value={gameSettings.difficulty} onChange={handleInputChange} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-teal-500 focus:border-teal-500">
                                <option value="Dễ">Dễ - Dành cho người mới</option>
                                <option value="Thường">Thường - Cân bằng, phù hợp đa số</option>
                                <option value="Khó">Khó - Thử thách cao, cần tính toán</option>
                                <option value="Ác Mộng">Ác Mộng - Cực kỳ khó</option>
                                <option value="Tuỳ Chỉnh AI">Tuỳ Chỉnh AI - Để AI mô tả</option>
                            </select>
                        </div>
                        {(gameSettings.difficulty === "Tuỳ Chỉnh AI" || gameSettings.difficultyDescription) && (
                            <div>
                                <label htmlFor="difficultyDescription" className="block text-lg font-medium text-gray-300 mb-1">Mô Tả Độ Khó:</label>
                                <div className="flex items-center gap-2">
                                    <textarea name="difficultyDescription" id="difficultyDescription" value={gameSettings.difficultyDescription} onChange={handleInputChange} rows={2} placeholder="AI sẽ mô tả độ khó ở đây..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-teal-500 focus:border-teal-500" />
                                    {gameSettings.difficulty === "Tuỳ Chỉnh AI" && (
                                        <button onClick={handleGenerateDifficultyDescription} disabled={isGeneratingDifficultyDesc} className="p-3 bg-teal-600 hover:bg-teal-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Tạo Mô Tả Độ Khó">
                                            {isGeneratingDifficultyDesc ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="randomEventFrequency" className="block text-lg font-medium text-gray-300 mb-1">Tần Suất Sự Kiện Ngẫu Nhiên:</label>
                            <select 
                                name="randomEventFrequency" 
                                id="randomEventFrequency" 
                                value={gameSettings.randomEventFrequency || 'Thấp'} 
                                onChange={handleInputChange} 
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="Tắt">Tắt (Ổn định nhất)</option>
                                <option value="Thấp">Thấp (Thỉnh thoảng)</option>
                                <option value="Thường">Thường (Cân bằng)</option>
                                <option value="Cao">Cao (Hỗn loạn)</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1 italic">Kiểm soát mức độ AI tự động tạo ra các tình huống bất ngờ (thời tiết, quái vật, NPC lạ...).</p>
                        </div>
                        <div>
                            <label htmlFor="nsfwMode" className="block text-lg font-medium text-gray-300 mb-1">Chế Độ Nội Dung 18+ (NSFW):</label>
                            <select 
                                name="nsfwMode" 
                                id="nsfwMode" 
                                value={gameSettings.nsfwMode || 'Off'} 
                                onChange={handleInputChange} 
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors font-semibold
                                    ${gameSettings.nsfwMode === 'Hardcore' ? 'bg-red-900/50 border-red-500 text-red-200 focus:ring-red-500' : 
                                      gameSettings.nsfwMode === 'Uncensored' ? 'bg-orange-900/50 border-orange-500 text-orange-200 focus:ring-orange-500' : 
                                      'bg-gray-600 border-gray-500 text-gray-200 focus:ring-teal-500'}`}
                            >
                                <option value="Off">Tắt (An Toàn)</option>
                                <option value="Uncensored">Không Kiểm Duyệt (Cân Bằng - Khuyên Dùng)</option>
                                <option value="Hardcore">Hardcore (Cực Đoan - Cấm Tua Nhanh)</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-2 italic">
                                {gameSettings.nsfwMode === 'Off' && "An toàn cho mọi lứa tuổi. Không có nội dung tình dục hay bạo lực phản cảm."}
                                {gameSettings.nsfwMode === 'Uncensored' && "AI kể chuyện tự nhiên, không né tránh cảnh nóng/bạo lực nếu phù hợp mạch truyện, nhưng không quá lố."}
                                {gameSettings.nsfwMode === 'Hardcore' && "⚠️ CẢNH BÁO: AI sẽ dùng từ ngữ trần trụi, thô tục tối đa. Mô tả chi tiết từng cử động xác thịt/tra tấn. Không time-skip."}
                            </p>
                        </div>
                        <div className="p-3 bg-teal-950/40 border border-teal-800 rounded-lg">
                            <label className="block text-lg font-semibold text-teal-300 mb-1">📖 Mạch Truyện & Nhịp Độ Kể:</label>
                            <p className="text-sm text-gray-200 font-medium">Phong Cách Tiểu Thuyết Đại Tác</p>
                            <p className="text-xs text-gray-400 mt-2 italic leading-relaxed">
                                AI đóng vai một tiểu thuyết gia thực thụ, tự động viết các đoạn cắt cảnh (cutscene) điện ảnh bỏ qua các phân đoạn tẻ nhạt (ngủ, thiền, đi đường dài vắng lặng) và chủ động lồng ghép Ngoại truyện kịch tính góc nhìn khác (phản diện, NPC phụ) giúp cốt truyện sâu sắc hệt như tiểu thuyết!
                            </p>
                        </div>
                    </div>
                </fieldset>
            </div>

            <div className="space-y-6">
                 <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-sky-400 px-2">👤 Nhân Vật Chính</legend>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="characterName" className="block text-lg font-medium text-gray-300 mb-1">Danh Xưng/Tên:</label>
                             <div className="flex items-center gap-2">
                                <input type="text" name="characterName" id="characterName" value={gameSettings.characterName} onChange={handleInputChange} placeholder="VD: Diệp Phàm, Hàn Lập..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
                                <button onClick={handleGenerateCharacterName} disabled={isGeneratingCharacterName} className="p-3 bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Tên Nhân Vật">
                                    {isGeneratingCharacterName ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="characterAppearance" className="block text-lg font-medium text-gray-300 mb-1">Ngoại Hình:</label>
                             <div className="flex items-center gap-2">
                                <input type="text" name="characterAppearance" id="characterAppearance" value={gameSettings.characterAppearance || ''} onChange={handleInputChange} placeholder="VD: Tóc đen, mắt đỏ, thư sinh..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="characterPersonality" className="block text-lg font-medium text-gray-300 mb-1">Tính Cách:</label>
                            <select name="characterPersonality" value={gameSettings.characterPersonality} onChange={handleInputChange} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500">
                                {PLAYER_PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {gameSettings.characterPersonality === 'Tùy chỉnh...' && (
                                <input
                                    type="text"
                                    name="customCharacterPersonality"
                                    value={gameSettings.customCharacterPersonality || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tính cách của bạn (VD: Lạnh lùng bên ngoài, ấm áp bên trong)"
                                    className="w-full p-2 mt-2 bg-gray-900 border border-gray-500 rounded-md placeholder-gray-500"
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="characterGender" className="block text-lg font-medium text-gray-300 mb-1">Giới Tính:</label>
                            <select name="characterGender" id="characterGender" value={gameSettings.characterGender} onChange={handleInputChange} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500">
                                <option value="Không xác định">Không xác định / Để AI quyết định</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="characterBackstory" className="block text-lg font-medium text-gray-300 mb-1">Sơ Lược Tiểu Sử:</label>
                            <div className="flex items-center gap-2">
                                <textarea name="characterBackstory" id="characterBackstory" value={gameSettings.characterBackstory} onChange={handleInputChange} rows={3} placeholder="VD: Một phế vật mang huyết mạch thượng cổ..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500"></textarea>
                                <button onClick={handleGenerateBackstory} disabled={isGeneratingContent} className="p-3 bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ Tạo Tiểu sử">
                                    {isGeneratingContent ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="initialScene" className="block text-lg font-medium text-gray-300 mb-1">Phân Cảnh Mở Đầu (Tùy chọn):</label>
                            <textarea 
                                name="initialScene" 
                                id="initialScene" 
                                value={gameSettings.initialScene} 
                                onChange={handleInputChange} 
                                rows={3} 
                                placeholder="Mô tả chi tiết khoảnh khắc bắt đầu. VD: Một đứa bé sơ sinh được đặt trong chiếc giỏ trôi sông..." 
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                            ></textarea>
                            <p className="text-xs text-gray-400 mt-1 italic">Cung cấp chi tiết này sẽ buộc AI bắt đầu chính xác tại cảnh bạn mô tả.</p>
                        </div>
                        <div>
                            <label htmlFor="preferredInitialSkill" className="block text-lg font-medium text-gray-300 mb-1">Kỹ Năng Khởi Đầu (Tùy chọn):</label>
                            <div className="flex items-center gap-2">
                                <input type="text" name="preferredInitialSkill" id="preferredInitialSkill" value={gameSettings.preferredInitialSkill} onChange={handleInputChange} placeholder="VD: Thuật ẩn thân..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
                                <button onClick={handleGenerateInitialSkill} disabled={isGeneratingInitialSkill} className="p-3 bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Kỹ năng">
                                    {isGeneratingInitialSkill ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                             <p className="text-xs text-gray-400 mt-1 italic">Gợi ý cho AI về loại kỹ năng ngươi muốn bắt đầu.</p>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border border-red-500/70 p-4 rounded-lg bg-gray-700/20">
                    <legend className="text-xl font-semibold text-red-400 px-2 flex items-center">🎯 Mục Tiêu/Động Lực</legend>
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center">
                            <input type="checkbox" name="useCharacterGoal" id="useCharacterGoal" checked={gameSettings.useCharacterGoal} onChange={handleInputChange} className="h-5 w-5 text-red-500 bg-gray-600 border-gray-500 rounded focus:ring-red-600 focus:ring-offset-gray-800" />
                            <label htmlFor="useCharacterGoal" className="ml-2 text-sm font-medium text-gray-300">Thêm Mục Tiêu/Động Lực</label>
                        </div>
                        {gameSettings.useCharacterGoal && (
                            <div>
                                <label htmlFor="characterGoal" className="block text-lg font-medium text-gray-300 mb-1">Mục Tiêu/Động Lực:</label>
                                <div className="flex items-center gap-2">
                                    <textarea name="characterGoal" id="characterGoal" value={gameSettings.characterGoal} onChange={handleInputChange} rows={3} placeholder="VD: Trả thù cho gia tộc..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-red-500 focus:border-red-500" />
                                    <button onClick={handleGenerateGoal} disabled={isGeneratingGoal} className="p-3 bg-red-600 hover:bg-red-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Gợi Ý Mục Tiêu">
                                        {isGeneratingGoal ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 italic">Mục tiêu này sẽ ảnh hưởng đến suy nghĩ và hành động của nhân vật.</p>
                            </div>
                        )}
                    </div>
                </fieldset>
            </div>
        </div>

        <fieldset className="border-2 border-lime-600 p-4 rounded-lg mb-6 bg-gray-700/30">
            <legend className="text-xl font-semibold text-lime-300 px-2 flex items-center">
                🏛️ Kiến Tạo Thế Giới Ban Đầu (Tùy chọn)
            </legend>
            <div className="mt-3 space-y-4">
                {gameSettings.initialWorldElements.map((element, index) => (
                    <div key={element.id} className="p-3 bg-gray-600/50 rounded-lg border border-gray-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                                <label htmlFor={`elementName-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Tên Thực Thể:</label>
                                <input type="text" id={`elementName-${index}`} name="name" value={element.name} onChange={(e) => handleInitialElementChange(index, e)} placeholder="VD: Trưởng làng Eldric, Huyết Hận Ma Tôn..." className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor={`elementType-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Loại Thực Thể:</label>
                                <select id={`elementType-${index}`} name="type" value={element.type} onChange={(e) => handleInitialElementChange(index, e)} className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm">
                                    <option value="NPC">Nhân Vật (NPC)</option>
                                    <option value="LOCATION">Địa Điểm</option>
                                    <option value="ITEM">Vật Phẩm (Lore)</option>
                                </select>
                            </div>
                            {element.type === 'NPC' && (
                                <>
                                    <div className="md:col-span-1"> 
                                        <label htmlFor={`elementPersonality-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Tính Cách (Tùy chọn):</label>
                                        <input type="text" id={`elementPersonality-${index}`} name="personality" value={element.personality || ''} onChange={(e) => handleInitialElementChange(index, e)} placeholder="VD: Lạnh lùng, Đa nghi..." className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm" />
                                    </div>
                                    <div className="md:col-span-1"> 
                                        <label htmlFor={`elementAppearance-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Ngoại Hình (Tùy chọn):</label>
                                        <input type="text" id={`elementAppearance-${index}`} name="appearance" value={element.appearance || ''} onChange={(e) => handleInitialElementChange(index, e)} placeholder="VD: Tóc bạc, sẹo dài..." className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm" />
                                    </div>
                                </>
                            )}
                            <div className="md:col-span-2"> 
                                <label htmlFor={`elementDesc-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Mô Tả Thực Thể:</label>
                                <div className="flex items-start gap-2">
                                    <textarea id={`elementDesc-${index}`} name="description" value={element.description} onChange={(e) => handleInitialElementChange(index, e)} rows={2} placeholder="Mô tả chi tiết về thực thể này..." className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm" />
                                    <button onClick={() => handleGenerateInitialElementDescription(index)} disabled={isGeneratingInitialElementDesc[element.id] || !element.name} className="p-2.5 bg-lime-600 hover:bg-lime-700 rounded-md disabled:bg-gray-500 self-center" title="✨ AI Tạo Mô Tả Thực Thể">
                                        {isGeneratingInitialElementDesc[element.id] ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => removeInitialWorldElement(element.id)} className="mt-1 text-xs bg-red-700 hover:bg-red-800 text-white py-1 px-2 rounded-md flex items-center">
                           🗑️ Xóa
                        </button>
                    </div>
                ))}
                <button onClick={addInitialWorldElement} className="w-full mt-2 py-2 px-4 bg-lime-700 hover:bg-lime-800 text-white font-semibold rounded-lg shadow-md flex items-center justify-center text-sm">
                    ➕ Thêm Thực Thể
                </button>
            </div>
        </fieldset>

        <fieldset className="border-2 border-sky-600 p-4 rounded-lg mb-6 bg-gray-700/30">
            <legend className="text-xl font-semibold text-sky-300 px-2 flex items-center">
                🌍 Tri Thức Thế Giới Ban Đầu (Tùy chọn)
            </legend>
            <p className="text-xs text-gray-400 mb-3 px-2 italic">Thêm các quy tắc, luật lệ cốt lõi cho thế giới của ngươi. AI sẽ luôn tuân thủ các quy tắc này.</p>
            <div className="mt-3 space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sky-500 scrollbar-track-gray-700">
                {gameSettings.initialWorldKnowledge.map((rule) => (
                    <div key={rule.id} className="p-2 bg-gray-600/50 rounded-lg flex items-center gap-3">
                        <textarea
                            value={rule.content}
                            onChange={(e) => updateInitialWorldKnowledgeRule(rule.id, e.target.value)}
                            placeholder="VD: Mọi sinh vật trong Rừng Hắc Ám đều sợ lửa..."
                            className="flex-grow bg-gray-500 text-white p-2 rounded-md text-sm border border-gray-400 focus:ring-sky-500 focus:border-sky-500"
                            rows={2}
                        />
                        <button onClick={() => removeInitialWorldKnowledgeRule(rule.id)} className="bg-red-700 hover:bg-red-800 text-white font-semibold py-1 px-2 rounded-md text-xs self-center">
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addInitialWorldKnowledgeRule} className="w-full mt-3 py-2 px-4 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg shadow-md flex items-center justify-center text-sm">
                ➕ Thêm Quy Tắc Mới
            </button>
        </fieldset>

        <div className="flex items-center justify-center gap-4 mb-6">
            <button onClick={handleSaveSetupToFile} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors">
                💾 Lưu Thiết Lập
            </button>
            <button onClick={handleLoadClick} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors">
                📂 Tải Thiết Lập
            </button>
            <input type="file" ref={setupFileInputRef} onChange={handleLoadSetupFromFile} accept=".json" className="hidden" />
        </div>

        <button onClick={initializeGame} disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-xl disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
          ➕ {isLoading ? 'Đang Khởi Tạo...' : 'Khởi Tạo Thế Giới'}
        </button>
      </div>
    </div>
  );
}