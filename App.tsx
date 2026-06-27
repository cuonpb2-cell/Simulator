
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import localforage from 'localforage';
import { callGeminiAPI, fetchGenericGeminiText } from './services/geminiService';
import { constructPrompt } from './utils/promptHelper';
import { parseKeyValueString } from './utils/helpers';

import { InitialScreen } from './components/InitialScreen';
import { GameSetupScreen } from './components/GameSetupScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { UpdateLogModal } from './components/UpdateLogModal';
import { LoadGameModal } from './components/LoadGameModal';
import { CharacterInfoModal } from './components/CharacterInfoModal';
import { QuickLoreModal } from './components/QuickLoreModal';
import { SuggestedActionsModal } from './components/SuggestedActionsModal';
import { SuggestionsModal } from './components/SuggestionsModal';
import { MemoryModal } from './components/MemoryModal';
import { WorldKnowledgeModal } from './components/WorldKnowledgeModal';
import { MessageModal } from './components/MessageModal';
import { ConfirmationModal } from './components/ConfirmationModal';

import { changelogData, PLAYER_PERSONALITIES } from './constants';
import type { GameSettings, KnowledgeBase, StoryItem, SavedGame, Memory, WorldKnowledgeRule, SuggestionModalState, ModalMessageState, ConfirmationModalState, Chapter } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('initial');
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    theme: '', setting: '', narratorPronoun: 'Để AI quyết định', 
    pacingStyle: 'Novel',
    characterName: '', characterAppearance: '', characterPersonality: PLAYER_PERSONALITIES[0], customCharacterPersonality: '',
    characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', 
    difficulty: 'Thường', difficultyDescription: '', allowNsfw: false, nsfwMode: 'Off',
    randomEventFrequency: 'Thấp',
    initialWorldElements: [], initialWorldKnowledge: [], useCharacterGoal: false, characterGoal: '',   
    allowCustomActionInput: true,
    initialScene: '',
    initialChapterGoal: '',
  });
  const [storyHistory, setStoryHistory] = useState<StoryItem[]>([]); 
  const [currentStory, setCurrentStory] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);
  const [showUpdateLogModal, setShowUpdateLogModal] = useState(false);
  const [chatHistoryForGemini, setChatHistoryForGemini] = useState<any[]>([]);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [showLoadGameModal, setShowLoadGameModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<ModalMessageState>({ show: false, title: '', content: '', type: 'info' });
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({ show: false, title: '', content: '', onConfirm: () => {}, onCancel: null, confirmText: 'Xác nhận', cancelText: 'Hủy'});
  const [customActionInput, setCustomActionInput] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({ 
    npcs: [], items: [], locations: [], 
    inventory: [], playerSkills: [],
    playerStatus: [],
    playerAttributes: {},
    characterDna: [],
  });
  const [showCharacterInfoModal, setShowCharacterInfoModal] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState<SuggestionModalState>({ show: false, fieldType: null, suggestions: [], isLoading: true, title: '' });
  const [isGeneratingContent, setIsGeneratingContent] = useState(false); 
  const [isGeneratingDifficultyDesc, setIsGeneratingDifficultyDesc] = useState(false);
  const [isGeneratingInitialElementDesc, setIsGeneratingInitialElementDesc] = useState<{[key: string]: boolean}>({});
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false); 
  const [isGeneratingSuggestedActions, setIsGeneratingSuggestedActions] = useState(false);
  const [suggestedActionsList, setSuggestedActionsList] = useState<string[]>([]);
  const [showSuggestedActionsModal, setShowSuggestedActionsModal] = useState(false);
  const [isGeneratingCharacterName, setIsGeneratingCharacterName] = useState(false);
  const [isGeneratingInitialSkill, setIsGeneratingInitialSkill] = useState(false);
  const [showQuickLoreModal, setShowQuickLoreModal] = useState(false);
  const [quickLoreContent, setQuickLoreContent] = useState<any | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  // Thay thế longTermMemories bằng chapters
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterGoal, setChapterGoal] = useState<string>('');
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [worldKnowledge, setWorldKnowledge] = useState<WorldKnowledgeRule[]>([]);
  const [showWorldKnowledgeModal, setShowWorldKnowledgeModal] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [undoStack, setUndoStack] = useState<any[]>([]);

  
  const [storySummary, setStorySummary] = useState('');

  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});

  const toggleSectionCollapse = useCallback((sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  }, []);
  
  const finalPersonality = gameSettings.characterPersonality === 'Tùy chỉnh...'
  ? gameSettings.customCharacterPersonality?.trim() || "Không rõ"
  : gameSettings.characterPersonality;

  const sanitizeDataForFirestore = (data: any): any => {
    if (data === null || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(item => sanitizeDataForFirestore(item));
    const sanitizedObject: {[key: string]: any} = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (value !== undefined) sanitizedObject[key] = sanitizeDataForFirestore(value);
        }
    }
    return sanitizedObject;
  };

  const openQuickLoreModal = useCallback((item: any, category: string) => {
    if (item) {
        setQuickLoreContent({...item, category: category.toLowerCase()}); 
        setShowQuickLoreModal(true);
    } else {
        console.error("openQuickLoreModal was called with an invalid item.");
        setModalMessage({show: true, title: "Lỗi Hiển Thị", content: `Không thể hiển thị thông tin chi tiết.`, type: 'error'});
    }
  }, []); 

  const addWorldKnowledge = () => {
    setWorldKnowledge(prev => [...prev, { id: crypto.randomUUID(), content: '', enabled: true }]);
  };
  const updateWorldKnowledge = (id: string, content: string) => {
    setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, content } : rule));
  };
  const toggleWorldKnowledge = (id: string) => {
    setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  };
  const deleteWorldKnowledge = (id: string) => {
    setWorldKnowledge(prev => prev.filter(rule => rule.id !== id));
  };
  
  // Load games from localforage (and migrate from localStorage if needed)
  useEffect(() => {
    const loadSavedGames = async () => {
      try {
        // 1. Migrate existing localStorage data to localforage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ai_adventure_game_')) {
            const data = localStorage.getItem(key);
            if (data) {
              await localforage.setItem(key, data);
              localStorage.removeItem(key); // Clean up after migration
            }
          }
        }

        // 2. Load games from localforage
        const games: SavedGame[] = [];
        const keys = await localforage.keys();
        for (const key of keys) {
          if (key.startsWith('ai_adventure_game_')) {
            const gameDataStr = await localforage.getItem<string>(key);
            if (gameDataStr) {
              try {
                games.push(JSON.parse(gameDataStr));
              } catch (e) {
                console.error("Error parsing game data for key", key, e);
              }
            }
          }
        }
        
        // Sort by updatedAt desc
        games.sort((a, b) => {
            const dateA = new Date(a.updatedAt as any).getTime();
            const dateB = new Date(b.updatedAt as any).getTime();
            return dateB - dateA;
        });
        setSavedGames(games);
      } catch (error) {
        console.error("Error loading saved games from localforage:", error);
      }
    };

    loadSavedGames();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === "nsfwMode") {
        setGameSettings(prev => ({ 
            ...prev, 
            nsfwMode: value as any, 
            allowNsfw: value !== 'Off' 
        }));
    } else {
        setGameSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        
        if (name === "difficulty" && value !== "Tuỳ Chỉnh AI") setGameSettings(prev => ({ ...prev, difficultyDescription: '' }));
        if (name === "useCharacterGoal" && !checked) setGameSettings(prev => ({ ...prev, characterGoal: '' }));
    }
  }, []);

  const addInitialWorldElement = () => setGameSettings(prev => ({ ...prev, initialWorldElements: [...prev.initialWorldElements, { id: crypto.randomUUID(), type: 'NPC', name: '', description: '', personality: '', appearance: '' }] }));
  const removeInitialWorldElement = (id: string) => setGameSettings(prev => ({ ...prev, initialWorldElements: prev.initialWorldElements.filter(el => el.id !== id) }));
  const handleInitialElementChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setGameSettings(prev => {
        const updatedElements = [...prev.initialWorldElements];
        updatedElements[index] = { ...updatedElements[index], [name]: value };
        return { ...prev, initialWorldElements: updatedElements };
    });
  };

  const addInitialWorldKnowledgeRule = () => {
    setGameSettings(prev => ({
        ...prev,
        initialWorldKnowledge: [...prev.initialWorldKnowledge, { id: crypto.randomUUID(), content: '', enabled: true }]
    }));
  };

  const updateInitialWorldKnowledgeRule = (id: string, content: string) => {
      setGameSettings(prev => ({
          ...prev,
          initialWorldKnowledge: prev.initialWorldKnowledge.map(rule => rule.id === id ? { ...rule, content } : rule)
      }));
  };

  const removeInitialWorldKnowledgeRule = (id: string) => {
      setGameSettings(prev => ({
          ...prev,
          initialWorldKnowledge: prev.initialWorldKnowledge.filter(rule => rule.id !== id)
      }));
  };

  const handleGenerateInitialElementDescription = async (index: number) => {
    const element = gameSettings.initialWorldElements[index];
    if (!element || !element.name) { setModalMessage({show: true, title: "Thiếu Tên", content: "Vui lòng nhập tên thực thể trước khi tạo mô tả.", type: "info"}); return; }
    setIsGeneratingInitialElementDesc(prev => ({...prev, [element.id]: true}));
    const { theme, setting } = gameSettings; 
    const personalityInfo = element.type === 'NPC' && element.personality ? `Tính cách NPC đã cho: ${element.personality}.` : 'Tính cách NPC: AI tự quyết định.';
    const appearanceInfo = element.type === 'NPC' && element.appearance ? `Ngoại hình: ${element.appearance}.` : '';
    const promptText = `Chủ đề: '${theme || "Chưa rõ"}', Bối cảnh: '${setting || "Chưa rõ"}', Tên: '${element.name}', Loại: '${element.type}', ${personalityInfo} ${appearanceInfo}. Viết một mô tả ngắn (1-3 câu) bằng tiếng Việt cho thực thể này, phong cách tiểu thuyết mạng. Chỉ trả về mô tả.`;
    try {
        const generatedText = await fetchGenericGeminiText(promptText);
        if (generatedText) {
            setGameSettings(prev => {
                const updatedElements = [...prev.initialWorldElements];
                updatedElements[index] = { ...updatedElements[index], description: generatedText };
                return { ...prev, initialWorldElements: updatedElements };
            });
        }
    } catch(e: any){
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
    }
    setIsGeneratingInitialElementDesc(prev => ({...prev, [element.id]: false}));
  };
  
  const handleFetchSuggestions = async (fieldType: 'theme' | 'setting') => {
    setIsFetchingSuggestions(true);
    setShowSuggestionsModal({ show: true, fieldType, suggestions: [], isLoading: true, title: fieldType === 'theme' ? "✨ Gợi Ý Chủ Đề" : "✨ Gợi Ý Bối Cảnh" });
    let promptText = '';
    if (fieldType === 'theme') {
        promptText = "Gợi ý 5 chủ đề độc đáo (tiếng Việt) cho game phiêu lưu văn bản, phong cách tiểu thuyết mạng. Mỗi chủ đề trên một dòng. Chỉ trả về chủ đề.";
    } else if (fieldType === 'setting') {
      const currentTheme = gameSettings.theme || 'phiêu lưu chung';
      promptText = `Gợi ý 5 bối cảnh (tiếng Việt) cho game có chủ đề '${currentTheme}', phong cách tiểu thuyết mạng. Mỗi bối cảnh trên một dòng. Chỉ trả về bối cảnh.`;
    }
    try {
        const suggestionsText = await fetchGenericGeminiText(promptText);
        if (suggestionsText) {
          const suggestionsArray = suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
          setShowSuggestionsModal(prev => ({ ...prev, suggestions: suggestionsArray, isLoading: false }));
        } else {
          setShowSuggestionsModal(prev => ({ ...prev, suggestions: [], isLoading: false })); 
        }
    } catch (e: any){
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
        setShowSuggestionsModal(prev => ({ ...prev, suggestions: [], isLoading: false }));
    }
    setIsFetchingSuggestions(false);
  };
  
  const handleGenerateBackstory = async () => {
    setIsGeneratingContent(true);
    const { characterName, characterGender, theme, setting } = gameSettings; 
    const promptText = `Tên='${characterName || 'NV chính'}', Giới tính='${characterGender}', Tính cách='${finalPersonality}', Chủ đề='${theme || 'Chưa rõ'}', Bối cảnh='${setting || 'Chưa rõ'}. Viết một tiểu sử ngắn (2-3 câu, tiếng Việt) cho nhân vật này, văn phong tiểu thuyết mạng. Chỉ trả về tiểu sử.`;
    try {
        const backstoryText = await fetchGenericGeminiText(promptText);
        if (backstoryText) setGameSettings(prev => ({ ...prev, characterBackstory: backstoryText }));
    } catch(e: any) {
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
    }
    setIsGeneratingContent(false);
  };

  const handleGenerateDifficultyDescription = async () => {
    setIsGeneratingDifficultyDesc(true);
    const { theme, setting } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', bối cảnh='${setting || "Chưa rõ"}'. Viết mô tả ngắn (1-2 câu, tiếng Việt) về độ khó "Tuỳ Chỉnh AI" cho game, văn phong tiểu thuyết mạng. Chỉ trả về mô tả.`;
    try {
        const descText = await fetchGenericGeminiText(promptText);
        if (descText) setGameSettings(prev => ({ ...prev, difficultyDescription: descText }));
    } catch(e: any) {
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
    }
    setIsGeneratingDifficultyDesc(false);
  };

  const handleGenerateGoal = async () => {
    setIsGeneratingGoal(true);
    const { theme, setting, characterBackstory } = gameSettings; 
    const promptText = `Chủ đề='${theme}', Bối cảnh='${setting}', Tính cách='${finalPersonality}', Tiểu sử='${characterBackstory}'. Gợi ý 3-4 mục tiêu/động lực (tiếng Việt) cho nhân vật. Mỗi mục tiêu trên một dòng.`;
    try {
        const generatedText = await fetchGenericGeminiText(promptText);
        if (generatedText) {
            const suggestionsArray = generatedText.split('\n').map(s => s.trim()).filter(s => s);
            setShowSuggestionsModal({ show: true, fieldType: 'characterGoal', suggestions: suggestionsArray, isLoading: false, title: "✨ Gợi Ý Mục Tiêu/Động Lực" });
        }
    } catch(e: any) {
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
    }
    setIsGeneratingGoal(false);
  };

  const handleGenerateCharacterName = async () => {
    setIsGeneratingCharacterName(true);
    const { theme, setting, characterGender, characterBackstory } = gameSettings;
    const promptText = `
    Vai trò: Bạn là một nhà ngôn ngữ học và tác giả tiểu thuyết đại tài, có tư duy đặt tên bứt phá, độc bản và đầy chiều sâu.
    Nhiệm vụ: Hãy đặt một cái tên cực kỳ đặc sắc, lôi cuốn, mang đậm chất văn học, sử thi hoặc chất thơ cho nhân vật chính.
    Thông tin:
    - Chủ đề/Thể loại: '${theme || "Chưa rõ"}'
    - Bối cảnh thế giới: '${setting || "Chưa rõ"}'
    - Giới tính: '${characterGender}'
    - Sơ lược tiểu sử: '${characterBackstory || "Chưa rõ"}'

    YÊU CẦU NGHIÊM NGẶT ĐỂ TRÁNH NHÀM CHÁN:
    1. TUYỆT ĐỐI CẤM sử dụng các tên quá phổ biến, rập khuôn bấy lâu nay trong giới hư cấu (Ví dụ: Cấm tuyệt đối Lyra, Elara, Kael, Aria, Seraphina, Eldrin, Evelyn, Leo, Claire...).
    2. CŨNG CẤM các cái tên kiếm hiệp, tiên hiệp Hán-Việt hay ngôn tình quá đại trà và sáo rỗng (Ví dụ: Cấm Diệp Phàm, Hàn Lập, Lâm Phong, Tiêu Viêm, Tiêu Mị, Tuyết Kỳ...).
    3. NGUYÊN TẮC ĐẶT TÊN:
       - Nếu bối cảnh mang phong cách phương Tây / thần thoại cổ điển / viễn tưởng: Sử dụng các gốc từ cổ của tiếng Latin, tiếng Celtic, tiếng Bắc Âu (Norse), Hy Lạp cổ hoặc kết hợp âm tiết đầy gai góc, bí ẩn, uy nghiêm hoặc thanh nhã ẩn mật (như Vespera, Alistair, Cassian, Isolde, Lysander, Garrick...).
       - Nếu bối cảnh mang phong cách phương Đông / Tiên hiệp / Cổ trang: Sự lựa chọn từ ngữ Hán Việt phải mang tính thơ, tượng hình và triết học sâu, đại diện cho thiên nhiên u tịch, hào khí sử thi hay nội tâm thâm trầm (như Thương Hải, Huyền Diệp, Dực Phong, Mộ Phong, Ám Hương, Tịch Nguyệt...).
    4. Cú pháp trả về: Chỉ trả về DUY NHẤT một cái tên (không có bất kỳ từ giải thích nào, không dấu ngoặc kép, không có chú thích phụ).
    `;
    try {
        const generatedName = await fetchGenericGeminiText(promptText);
        if (generatedName) setGameSettings(prev => ({ ...prev, characterName: generatedName.split('\n')[0].trim().replace(/^["']|["']$/g, '') }));
    } catch(e: any) {
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
    }
    setIsGeneratingCharacterName(false);
  };

  const handleGenerateInitialSkill = async () => {
    setIsGeneratingInitialSkill(true);
    const { theme, characterBackstory } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', tiểu sử='${characterBackstory || "Chưa rõ"}'. Gợi ý MỘT kỹ năng khởi đầu phù hợp (tiếng Việt). Chỉ trả về tên kỹ năng.`;
    try {
        const generatedSkill = await fetchGenericGeminiText(promptText);
        if (generatedSkill) setGameSettings(prev => ({ ...prev, preferredInitialSkill: generatedSkill.split('\n')[0].trim() }));
    } catch(e: any) {
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
    }
    setIsGeneratingInitialSkill(false);
  };

  const handleGenerateSuggestedActions = async () => {
    setIsGeneratingSuggestedActions(true);
    setSuggestedActionsList([]);
    const lastStoryItem = storyHistory.filter(item => item.type === 'story').pop()?.content || "Chưa có diễn biến.";
    const promptText = `Bối cảnh: ${lastStoryItem}. Tính cách NV: ${finalPersonality}. Mục tiêu: ${gameSettings.characterGoal || 'Chưa rõ'}. Gợi ý 3-4 hành động ngắn gọn, phù hợp (tiếng Việt). Mỗi gợi ý trên một dòng.`;
    try {
        const suggestionsText = await fetchGenericGeminiText(promptText);
        if (suggestionsText) {
            const suggestionsArray = suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
            setSuggestedActionsList(suggestionsArray);
            setShowSuggestedActionsModal(true);
        }
    } catch(e: any) {
        setModalMessage({ show: true, title: 'Lỗi AI', content: e.message, type: 'error' });
    }
    setIsGeneratingSuggestedActions(false);
  };

  const addMemory = useCallback((memoryContent: string) => {
    if (!memoryContent || memoryContent.trim() === '') return;
    const newMemory: Memory = { 
        id: crypto.randomUUID(), 
        content: memoryContent, 
        pinned: false, 
        timestamp: Date.now(),
        summarized: false
    };

    setMemories(prevMemories => {
        const updatedMemories = [newMemory, ...prevMemories];
        
        const pinned = updatedMemories.filter(m => m.pinned);
        const unpinned = updatedMemories.filter(m => !m.pinned);
        
        pinned.sort((a, b) => b.timestamp - a.timestamp);
        unpinned.sort((a, b) => b.timestamp - a.timestamp);

        // Giữ lại 50 ký ức gần nhất để làm ngữ cảnh (sliding window).
        // ĐỒNG THỜI giữ lại TẤT CẢ các ký ức CHƯA ĐƯỢC TÓM TẮT để không bị mất dữ liệu trước khi ghép thành Chương.
        const memoriesToKeep = unpinned.filter((m, index) => index < 50 || !m.summarized);
        
        return [...pinned, ...memoriesToKeep];
    });
  }, []);

  const togglePinMemory = (id: string) => {
      setMemories(mems => mems.map(mem => mem.id === id ? { ...mem, pinned: !mem.pinned } : mem).sort((a, b) => b.timestamp - a.timestamp));
  };

  const clearAllMemories = () => {
      setConfirmationModal({
          show: true,
          title: 'Xóa Tất Cả Ký Ức?',
          content: 'Bạn có chắc muốn xóa toàn bộ ký ức tạm thời không? Hành động này không thể hoàn tác.',
          onConfirm: () => setMemories([]),
          onCancel: null,
          confirmText: "Xóa Tất Cả",
          cancelText: "Hủy"
      });
  };
  
  const createPeriodicSummaryPrompt = (memoriesToSummarize: Memory[], currentChapterCount: number) => {
    const memoryContent = memoriesToSummarize.map((m, index) => `${index + 1}. ${m.content}`).join('\n');

    return `
        //--- NHIỆM VỤ HỆ THỐNG: TỔNG KẾT CHƯƠNG TRUYỆN ---//
        Dưới đây là chuỗi sự kiện vừa xảy ra:
        ---
        ${memoryContent}
        ---
        NHIỆM VỤ CỦA NGƯƠI:
        Hãy tổng hợp các sự kiện trên thành một "Chương" truyện (Chương thứ ${currentChapterCount + 1}).
        1. Đặt một **Tên Chương** (Title) thật hấp dẫn, đậm chất tiểu thuyết.
        2. Viết phần **Nội Dung** (Content) tóm tắt lại các diễn biến chính một cách súc tích.

        **ĐỊNH DẠNG TRẢ VỀ (BẮT BUỘC):**
        Tên Chương: <Viết tên chương tại đây>
        Nội Dung: <Viết nội dung tóm tắt tại đây>
    `;
  };

  const TURNS_PER_SUMMARY = 50;

  const handlePeriodicSummarization = async () => {
    // Chỉ tóm tắt những ký ức chưa được tóm tắt
    const unsummarizedMemories = memories.filter(m => !m.pinned && !m.summarized);
    
    // Đảo ngược lại do memories đang xếp mới nhất lên đầu, còn lúc đưa cho AI tóm tắt thì phải đưa cũ nhất lên đầu
    const memoriesToSummarize = [...unsummarizedMemories].reverse();

    if (memoriesToSummarize.length === 0) return;

    try {
        const summaryPrompt = createPeriodicSummaryPrompt(memoriesToSummarize, chapters.length);
        const summaryText = await fetchGenericGeminiText(summaryPrompt);

        if (summaryText) {
            // Phân tích phản hồi để tách Tên Chương và Nội Dung
            const titleMatch = summaryText.match(/Tên Chương:\s*(.*)/i);
            const contentMatch = summaryText.match(/Nội Dung:\s*([\s\S]*)/i);

            const title = titleMatch ? titleMatch[1].trim() : `Chương ${chapters.length + 1}`;
            const content = contentMatch ? contentMatch[1].trim() : summaryText;

            const newChapter: Chapter = { 
                id: crypto.randomUUID(), 
                title: title,
                content: content, 
                timestamp: Date.now() 
            };

            setChapters(prev => [...prev, newChapter]);
            // Theo yêu cầu của người chơi: Đánh dấu các ký ức này đã tóm tắt thay vì xóa đi. 
            // Cửa sổ trượt ở hàm addMemory sẽ tự động đẩy các ký ức cũ ra ngoài dần dần sau này.
            setMemories(prev => prev.map(m => 
                unsummarizedMemories.some(um => um.id === m.id) ? { ...m, summarized: true } : m
            ));
            setModalMessage({ show: true, title: 'Hệ Thống', content: `Đã hoàn thành "${title}". Ký ức này bắt đầu trượt đi từ từ trong những lượt tới.`, type: 'info' });
        }
    } catch (error: any) {
        console.error("Lỗi khi tóm tắt định kỳ:", error);
        setModalMessage({ show: true, title: 'Lỗi Ký Ức', content: `Không thể tạo chương mới: ${error.message}`, type: 'error' });
    }
  };
 
const parseGeminiResponseAndUpdateState = useCallback(async (text: string, currentKnowledgeBase: KnowledgeBase) => {
    let storyContent = text;
    
    // IMPROVED PARSING LOGIC (FALLBACK-SAFE)
    const storyStartTag = '[STORY_START]';
    const storyStartIndex = storyContent.indexOf(storyStartTag);
    const thoughtBlockRegex = /<AI_INTERNAL_THOUGHT>[\s\S]*?<\/AI_INTERNAL_THOUGHT>/g;

    if (storyStartIndex !== -1) {
        storyContent = storyContent.substring(storyStartIndex + storyStartTag.length).trim();
    } else {
        const contentWithoutThought = storyContent.replace(thoughtBlockRegex, "").trim();
        if (contentWithoutThought.length > 0) {
            storyContent = contentWithoutThought;
        }
    }
    
    storyContent = storyContent.replace(/^\s*<\/AI_INTERNAL_THOUGHT>/, "").trim();

    const commandTagRegex = /\[([A-Z_]+)\s*([^\]]*)\]/gi; 
    let match;
    const tagsToRemove: string[] = [];
    let tempKnowledgeBase = JSON.parse(JSON.stringify(currentKnowledgeBase));

    const acquiredSkills: string[] = [];
    const acquiredItems: string[] = [];
    const renamedNPCs: string[] = [];
    const updatedNPCs: string[] = [];
    const discoveredLoreItems: string[] = []; // Track discovered lore items for notification
    
    const processedMemories = new Set<string>();

    while ((match = commandTagRegex.exec(storyContent)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toUpperCase(); 
        const attributesString = match[2];
        let attributes = parseKeyValueString(attributesString);

        const normalizeKeys = (attrs: any) => {
            const newAttrs: any = { ...attrs };
            if (newAttrs.name) newAttrs.Name = newAttrs.name;
            else if (newAttrs.Name) newAttrs.name = newAttrs.Name;

            if (newAttrs.description) newAttrs.Description = newAttrs.description;
            else if (newAttrs.desc) newAttrs.Description = newAttrs.desc;
            else if (newAttrs.Description) newAttrs.description = newAttrs.Description;
            
            if (newAttrs.type) newAttrs.Type = newAttrs.type;
            else if (newAttrs.Type) newAttrs.type = newAttrs.Type;

            if (newAttrs.personality) newAttrs.Personality = newAttrs.personality;
            else if (newAttrs.Personality) newAttrs.personality = newAttrs.Personality;

            if (newAttrs.appearance) newAttrs.Appearance = newAttrs.appearance;
            else if (newAttrs.Appearance) newAttrs.appearance = newAttrs.Appearance;

            if (newAttrs.affinity) newAttrs.Affinity = newAttrs.affinity;
            else if (newAttrs.Affinity) newAttrs.affinity = newAttrs.Affinity;

            if (newAttrs.Status) newAttrs.name = newAttrs.Status;
            if (newAttrs.Label) newAttrs.name = newAttrs.Label;

            if (newAttrs.oldname && !newAttrs.OldName) newAttrs.OldName = newAttrs.oldname;
            if (newAttrs.newname && !newAttrs.NewName) newAttrs.NewName = newAttrs.newname;
            return newAttrs;
        };
        attributes = normalizeKeys(attributes);

        tagsToRemove.push(fullTag);

        switch (tagName) {
            case 'MEMORY_ADD': 
                let memContent = attributes.content;
                if (!memContent && attributesString) {
                    memContent = attributesString.trim();
                    if ((memContent.startsWith('"') && memContent.endsWith('"')) || (memContent.startsWith("'") && memContent.endsWith("'"))) {
                        memContent = memContent.slice(1, -1);
                    }
                }
                if (memContent && !processedMemories.has(memContent)) {
                    addMemory(memContent);
                    processedMemories.add(memContent);
                }
                break;
            case 'MEMORIZE_LONG_TERM':
                // Chuyển thành ký ức được ghim (pinned memory) thay vì longTermMemories cũ
                let ltmContent = attributes.content || attributesString;
                 if ((ltmContent.startsWith('"') && ltmContent.endsWith('"')) || (ltmContent.startsWith("'") && ltmContent.endsWith("'"))) {
                    ltmContent = ltmContent.slice(1, -1);
                }
                if (ltmContent) {
                     setMemories(prev => [{ id: crypto.randomUUID(), content: `[GHI NHỚ] ${ltmContent}`, pinned: true, timestamp: Date.now() }, ...prev]);
                }
                break;
            case 'TIME_UPDATE':
                if (attributes.Time) {
                    tempKnowledgeBase.playerAttributes['Thời gian hiện tại'] = attributes.Time;
                }
                break;
            case 'ITEM_AQUIRED': 
                if (attributes.Name) {
                    const existingItemIndex = tempKnowledgeBase.inventory.findIndex((item: any) => item.Name === attributes.Name);
                    const parsedQuantity = parseInt(attributes.Quantity) || 1;
                    if (existingItemIndex > -1) {
                        const existingItem = tempKnowledgeBase.inventory[existingItemIndex];
                        const count = parseInt(existingItem.Quantity) || 1;
                        tempKnowledgeBase.inventory[existingItemIndex] = {
                            ...existingItem,
                            ...attributes,
                            Quantity: (count + parsedQuantity).toString(),
                            id: existingItem.id
                        };
                    } else {
                        tempKnowledgeBase.inventory.push({ id: crypto.randomUUID(), Quantity: parsedQuantity.toString(), ...attributes }); 
                    }
                    if (!acquiredItems.includes(attributes.Name)) acquiredItems.push(attributes.Name);
                } 
                break;
            case 'ITEM_REMOVED':
            case 'ITEM_CONSUMED': 
                if (attributes.Name) {
                    const existingItemIndex = tempKnowledgeBase.inventory.findIndex((item: any) => item.Name === attributes.Name);
                    if (existingItemIndex > -1) {
                        const parsedQuantity = parseInt(attributes.Quantity) || 1;
                        const existingItem = tempKnowledgeBase.inventory[existingItemIndex];
                        const count = parseInt(existingItem.Quantity) || 1;
                        if (count <= parsedQuantity) {
                            tempKnowledgeBase.inventory.splice(existingItemIndex, 1);
                        } else {
                            tempKnowledgeBase.inventory[existingItemIndex] = {
                                ...existingItem,
                                Quantity: (count - parsedQuantity).toString()
                            };
                        }
                    }
                }
                break;
            case 'ITEM_UPDATED': if (attributes.Name) tempKnowledgeBase.inventory = tempKnowledgeBase.inventory.map((item: any) => item.Name === attributes.Name ? { ...item, ...attributes, Quantity: attributes.Quantity || item.Quantity || 1 } : item); break;
            case 'SKILL_LEARNED': 
                if (attributes.Name) {
                    tempKnowledgeBase.playerSkills.push({ id: crypto.randomUUID(), ...attributes });
                    acquiredSkills.push(attributes.Name);
                }
                break;
            case 'SKILL_UPDATED': if (attributes.Name) tempKnowledgeBase.playerSkills = tempKnowledgeBase.playerSkills.map((skill: any) => skill.Name === attributes.Name ? { ...skill, ...attributes } : skill); break;
            
            case 'STATUS_APPLIED_SELF': 
                if (attributes.name && !tempKnowledgeBase.playerStatus.some((s: any) => s.name === attributes.name)) {
                    tempKnowledgeBase.playerStatus.push({ id: crypto.randomUUID(), ...attributes });
                }
                break;
            case 'STATUS_CURED_SELF': 
            case 'STATUS_EXPIRED_SELF': 
                if (attributes.name) {
                    tempKnowledgeBase.playerStatus = tempKnowledgeBase.playerStatus.filter((status: any) => status.name !== attributes.name);
                }
                break;
                
            case 'STATUS_APPLIED_NPC':
                if (attributes.Name) {
                     const searchName = attributes.Name.toLowerCase().trim();
                     const statusName = attributes.name || attributes.Status || attributes.Label || "Trạng thái";
                     const newStatus = {
                         id: crypto.randomUUID(),
                         name: statusName,
                         type: attributes.Type || attributes.type || "Debuff",
                         description: attributes.Description || attributes.description || "",
                         duration: attributes.Duration || attributes.duration,
                         effects: attributes.Effects || attributes.effects
                     };
                     
                     // Apply to NPCs
                     const npcIndex = tempKnowledgeBase.npcs.findIndex((n: any) => n.Name && n.Name.toLowerCase().trim() === searchName);
                     if (npcIndex !== -1) {
                          if (!tempKnowledgeBase.npcs[npcIndex].statuses) tempKnowledgeBase.npcs[npcIndex].statuses = [];
                          if (!tempKnowledgeBase.npcs[npcIndex].statuses.some((s: any) => s.name === statusName)) {
                               tempKnowledgeBase.npcs[npcIndex].statuses.push(newStatus);
                          }
                     }
                }
                break;
            case 'STATUS_CURED_NPC':
            case 'STATUS_EXPIRED_NPC':
                if (attributes.Name) {
                     const searchName = attributes.Name.toLowerCase().trim();
                     const statusName = attributes.name || attributes.Status || attributes.Label;
                     if (statusName) {
                         // Cure from NPCs
                         const npcIndex = tempKnowledgeBase.npcs.findIndex((n: any) => n.Name && n.Name.toLowerCase().trim() === searchName);
                         if (npcIndex !== -1 && tempKnowledgeBase.npcs[npcIndex].statuses) {
                              tempKnowledgeBase.npcs[npcIndex].statuses = tempKnowledgeBase.npcs[npcIndex].statuses.filter((s: any) => s.name !== statusName);
                         }
                     }
                }
                break;
            case 'NPC_ADD': 
                if (attributes.Name && !tempKnowledgeBase.npcs.some((n: any) => n.Name === attributes.Name)) {
                    tempKnowledgeBase.npcs.push({ id: crypto.randomUUID(), ...attributes }); 
                }
                break;
            case 'NPC_UPDATE': 
                if (attributes.Name) {
                    const searchName = attributes.Name.toLowerCase().trim();
                    let updated = false;
                    
                    // Cập nhật trong danh sách NPCs
                    tempKnowledgeBase.npcs = tempKnowledgeBase.npcs.map((npc: any) => {
                        if (npc.Name && npc.Name.toLowerCase().trim() === searchName) {
                            updated = true;
                            if (!updatedNPCs.includes(npc.Name)) updatedNPCs.push(npc.Name);
                            return { ...npc, ...attributes, Name: npc.Name }; // Giữ nguyên tên gốc
                        }
                        return npc;
                    });
                    
                    // Nếu không tìm thấy, có thể AI đang cố cập nhật một NPC mới xuất hiện
                    if (!updated) {
                        tempKnowledgeBase.npcs.push({ id: crypto.randomUUID(), ...attributes });
                        updatedNPCs.push(attributes.Name);
                    }
                }
                break;
            case 'NPC_DEATH': if (attributes.Name) tempKnowledgeBase.npcs = tempKnowledgeBase.npcs.filter((npc: any) => npc.Name !== attributes.Name); break;
            
            case 'NPC_RENAME':
                if (attributes.OldName && attributes.NewName) {
                    const searchOldName = attributes.OldName.toLowerCase().trim();
                    
                    // Rename in NPCs
                    const npcIndex = tempKnowledgeBase.npcs.findIndex((n: any) => n.Name && n.Name.toLowerCase().trim() === searchOldName);
                    if (npcIndex !== -1) {
                         const oldRealName = tempKnowledgeBase.npcs[npcIndex].Name;
                         if (oldRealName !== attributes.NewName) {
                            tempKnowledgeBase.npcs[npcIndex].Name = attributes.NewName;
                            renamedNPCs.push(`${oldRealName} ➔ ${attributes.NewName}`);
                         }
                    }
                }
                break;
                
            case 'LOCATION_DISCOVERED':
                if (attributes.Name && !tempKnowledgeBase.locations.some((loc: any) => loc.Name === attributes.Name)) {
                    tempKnowledgeBase.locations.push({ id: crypto.randomUUID(), ...attributes });
                }
                break;
            case 'LORE_ITEM_DISCOVERED':
                if (attributes.Name) {
                    const typeLower = (attributes.Type || "").toLowerCase();
                    const isActuallyNPC = typeLower.includes('human') || typeLower.includes('npc') || typeLower.includes('person') || typeLower.includes('character') || typeLower.includes('người');
                    
                    if (isActuallyNPC) {
                         if (!tempKnowledgeBase.npcs.some((n: any) => n.Name === attributes.Name)) {
                            tempKnowledgeBase.npcs.push({ id: crypto.randomUUID(), ...attributes }); 
                         }
                    } else {
                        if (!tempKnowledgeBase.items.some((item: any) => item.Name === attributes.Name)) {
                            tempKnowledgeBase.items.push({ id: crypto.randomUUID(), ...attributes });
                            discoveredLoreItems.push(attributes.Name);
                        }
                    }
                }
                break;
        }
    }
    setKnowledgeBase(tempKnowledgeBase);
    
    tagsToRemove.forEach(tag => { storyContent = storyContent.replace(tag, ""); });
    // Remove only system tags that might have been missed, not all brackets
    storyContent = storyContent.replace(/\[[A-Z_]+([^\]]*)?\]/g, '').trim();

    let story = storyContent;
    let choices: string[] = [];
    const lines = story.split('\n');
    let firstChoiceIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) { if (lines[i].trim().match(/^\d+\.\s/)) firstChoiceIndex = i; else if (firstChoiceIndex !== -1 && lines[i].trim() !== "") break; }

    if (firstChoiceIndex !== -1) {
        const choiceLines = lines.slice(firstChoiceIndex).filter(line => line.trim().match(/^\d+\.\s/));
        if (choiceLines.length > 0) {
            story = lines.slice(0, firstChoiceIndex).join('\n').trim();
            choices = choiceLines.map(line => line.trim().replace(/^\d+\.\s*/, ''));
        }
    }

    const notifications = [];
    if (acquiredSkills.length > 0) notifications.push(`[Đã lĩnh ngộ: ${acquiredSkills.join(', ')}]`);
    if (acquiredItems.length > 0) notifications.push(`[Đã nhận: ${acquiredItems.join(', ')}]`);
    if (discoveredLoreItems.length > 0) notifications.push(`[Đã ghi chép thông tin: ${discoveredLoreItems.join(', ')}]`);
    if (renamedNPCs.length > 0) notifications.push(`[Cập nhật danh tính: ${renamedNPCs.join(', ')}]`);
    if (updatedNPCs.length > 0) notifications.push(`[Cập nhật thông tin: ${updatedNPCs.join(', ')}]`);

    if (notifications.length > 0) {
        story += `\n\n> [HỆ THỐNG]: ${notifications.join(' ')}`;
    }
    
    return { story, choices };
}, [addMemory]);
  
const initializeGame = async () => {
    if (!gameSettings.theme || !gameSettings.setting || !gameSettings.characterName || !gameSettings.characterBackstory) { 
        setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng điền đủ Chủ đề, Bối cảnh, Tên và Tiểu sử.', type: 'error' }); 
        return; 
    }
    if (gameSettings.characterPersonality === 'Tùy chỉnh...' && !gameSettings.customCharacterPersonality.trim()) {
        setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập tính cách tùy chỉnh của bạn.', type: 'error' });
        return;
    }

    const initialKnowledgeBase: KnowledgeBase = {
        npcs: [], items: [], locations: [], 
        inventory: [], playerSkills: [], playerStatus: [], playerAttributes: {},
        characterDna: [],
    };

    gameSettings.initialWorldElements.forEach(el => {
        const newItem = {
            id: el.id,
            Name: el.name,
            Description: el.description,
        };
        switch (el.type) {
            case 'NPC':
                initialKnowledgeBase.npcs.push({ ...newItem, Personality: el.personality, Appearance: el.appearance });
                break;
            case 'LOCATION':
                initialKnowledgeBase.locations.push(newItem);
                break;
            case 'ITEM':
                initialKnowledgeBase.items.push(newItem);
                break;
        }
    });
    
    setKnowledgeBase(initialKnowledgeBase);
    setWorldKnowledge(gameSettings.initialWorldKnowledge);
    setStorySummary('');
    setTurnCount(0); 
    setMemories([]);
    setChapters([]);
    setUndoStack([]);
    setChapterGoal(gameSettings.initialChapterGoal || '');

    const initialPrompt = constructPrompt(gameSettings, initialKnowledgeBase, gameSettings.initialWorldKnowledge, [], '', [], finalPersonality, "Bắt đầu", [], true, gameSettings.initialChapterGoal || '');
    setCurrentScreen('gameplay');
    
    try {
        const newGameId = crypto.randomUUID();
        const newGameData = {
            id: newGameId,
            settings: gameSettings, storyHistory: [], currentStory: "Đang khởi tạo...", currentChoices: [],
            chatHistoryForGemini: [], memories: [], chapters: [], worldKnowledge: gameSettings.initialWorldKnowledge,
            storySummary: '', turnCount: 0,
            knowledgeBase: initialKnowledgeBase, 
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "active" 
        };
        
        await localforage.setItem(`ai_adventure_game_${newGameId}`, JSON.stringify(newGameData));
        setCurrentGameId(newGameId);
        setSavedGames(prev => [newGameData as any, ...prev]);

        await runGameTurn(initialPrompt, true, initialKnowledgeBase, "[Bắt đầu Game Mới]"); 
    } catch (error: any) {
        setModalMessage({ show: true, title: 'Lỗi Tạo Game', content: `Không thể tạo game mới: ${error.message}`, type: 'error' });
        setCurrentScreen('setup'); 
    }
};
  
const runGameTurn = async (prompt: string, isInitialCall = false, initialKnowledgeBase?: KnowledgeBase, shortActionText?: string) => {
    setIsLoading(true);
    let historyForAPI = isInitialCall ? [] : chatHistoryForGemini;

    try {
        const { rawText, updatedChatHistory } = await callGeminiAPI(prompt, historyForAPI, shortActionText);
        setChatHistoryForGemini(updatedChatHistory);
        const kbForParsing = initialKnowledgeBase || knowledgeBase;
        const { story, choices: newChoices } = await parseGeminiResponseAndUpdateState(rawText, kbForParsing);
        setCurrentStory(story);
        setChoices(newChoices);
        const newStoryEntry: StoryItem = { type: 'story', content: story, id: crypto.randomUUID() };
        setStoryHistory(prev => [...prev, newStoryEntry]);

    } catch (error: any) {
        console.error('Error in runGameTurn:', error);
        const errorMessage = error.message || "Đã xảy ra lỗi không xác định.";
        setStoryHistory(prev => [...prev, { type: 'system', content: errorMessage, id: crypto.randomUUID() }]);
        setModalMessage({ show: true, title: 'Lỗi', content: errorMessage, type: 'error' });
    } finally {
        setIsLoading(false);
    }
};

  const pushUndoState = () => {
      const currentState = {
          storyHistory: JSON.parse(JSON.stringify(storyHistory)),
          currentStory,
          choices: JSON.parse(JSON.stringify(choices)),
          chatHistoryForGemini: JSON.parse(JSON.stringify(chatHistoryForGemini)),
          knowledgeBase: JSON.parse(JSON.stringify(knowledgeBase)),
          memories: JSON.parse(JSON.stringify(memories)),
          chapters: JSON.parse(JSON.stringify(chapters)),
          worldKnowledge: JSON.parse(JSON.stringify(worldKnowledge)),
          storySummary,
          turnCount,
          chapterGoal
      };
      setUndoStack(prev => {
          const newStack = [...prev, currentState];
          if (newStack.length > 20) return newStack.slice(newStack.length - 20); // Keep last 20 turns max
          return newStack;
      });
  };

  const handleUndo = async () => {
      if (undoStack.length === 0) return;
      
      const previousState = undoStack[undoStack.length - 1];
      
      setStoryHistory(previousState.storyHistory);
      setCurrentStory(previousState.currentStory);
      setChoices(previousState.choices);
      setChatHistoryForGemini(previousState.chatHistoryForGemini);
      setKnowledgeBase(previousState.knowledgeBase);
      setMemories(previousState.memories);
      setChapters(previousState.chapters);
      setWorldKnowledge(previousState.worldKnowledge);
      setStorySummary(previousState.storySummary);
      setTurnCount(previousState.turnCount);
      setChapterGoal(previousState.chapterGoal);
      
      setUndoStack(prev => prev.slice(0, -1));
  };

  const handleChoice = async (choiceText: string) => {    
    pushUndoState();
    const userChoiceEntry: StoryItem = { type: 'user_choice', content: choiceText, id: crypto.randomUUID() };
    setStoryHistory(prev => [...prev, userChoiceEntry]);
    setCurrentStory(''); 
    setChoices([]);
    setIsLoading(true);

    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);
    if (nextTurn > 0 && nextTurn % TURNS_PER_SUMMARY === 0) {
        handlePeriodicSummarization();
    }

    const subsequentPrompt = constructPrompt(gameSettings, knowledgeBase, worldKnowledge, chapters, storySummary, memories, finalPersonality, choiceText, [...storyHistory, userChoiceEntry], false, chapterGoal);
    
    runGameTurn(subsequentPrompt, false, undefined, choiceText);
  };

  const handleCustomAction = async (actionText: string) => {
    if (!actionText.trim()) return;
    pushUndoState();
    const customActionEntry: StoryItem = { type: 'user_custom_action', content: actionText, id: crypto.randomUUID() };
    setStoryHistory(prev => [...prev, customActionEntry]);
    setCurrentStory(''); 
    setChoices([]); 
    setCustomActionInput(''); 
    setIsLoading(true);

    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);
    if (nextTurn > 0 && nextTurn % TURNS_PER_SUMMARY === 0) {
        handlePeriodicSummarization();
    }

    const subsequentPrompt = constructPrompt(gameSettings, knowledgeBase, worldKnowledge, chapters, storySummary, memories, finalPersonality, actionText, [...storyHistory, customActionEntry], false, chapterGoal);

    runGameTurn(subsequentPrompt, false, undefined, actionText);
  };

  const saveGameProgress = useCallback(async () => {
    if (!currentGameId || storyHistory.length === 0) return;
    setIsSaving(true);
    try {
        const historyToSave = storyHistory.filter(item => !(item as any).transient);
        const dataToSave = {
            id: currentGameId,
            currentStory, currentChoices: choices, storyHistory: historyToSave,
            chatHistoryForGemini, knowledgeBase, settings: gameSettings, 
            memories, chapters, chapterGoal, worldKnowledge, storySummary, turnCount,
            undoStack,
            updatedAt: new Date().toISOString(),
        };
        
        const existingDataStr = await localforage.getItem<string>(`ai_adventure_game_${currentGameId}`);
        const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
        const mergedData = { ...existingData, ...dataToSave };
        
        await localforage.setItem(`ai_adventure_game_${currentGameId}`, JSON.stringify(mergedData));
        
        setSavedGames(prev => prev.map(g => g.id === currentGameId ? { ...g, ...dataToSave } : g) as any);
    } catch (error) {
        console.error("Error saving game progress:", error);
    } finally {
        setTimeout(() => setIsSaving(false), 1000);
    }
  }, [currentGameId, storyHistory, currentStory, choices, chatHistoryForGemini, knowledgeBase, gameSettings, memories, chapters, chapterGoal, worldKnowledge, storySummary, turnCount, undoStack]);

  useEffect(() => {
      if (currentScreen === 'gameplay' && storyHistory.length > 0 && currentGameId) {
          const timer = setTimeout(() => saveGameProgress(), 2000); // Debounce save
          return () => clearTimeout(timer);
      }
  }, [storyHistory, saveGameProgress, currentScreen, currentGameId]);

  const loadGame = async (gameData: SavedGame) => {
    if (!gameData) return;
    
    const defaultSettings: GameSettings = { 
        theme: '', setting: '', narratorPronoun: 'Để AI quyết định', characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], customCharacterPersonality: '', characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', difficulty: 'Thường', difficultyDescription: '', 
        allowNsfw: false, nsfwMode: 'Off', randomEventFrequency: 'Thấp',
        initialWorldElements: [], initialWorldKnowledge: [], useCharacterGoal: false, characterGoal: '', allowCustomActionInput: true, initialScene: '', initialChapterGoal: ''
    };
    const defaultKnowledgeBase: KnowledgeBase = { npcs: [], items: [], locations: [], inventory: [], playerSkills: [], playerStatus: [], playerAttributes: {}, characterDna: [] };
    
    const loadedSettings = { ...defaultSettings, ...(gameData.settings || {}) };
    
    if (loadedSettings.allowNsfw && (!loadedSettings.nsfwMode || loadedSettings.nsfwMode === 'Off')) {
        loadedSettings.nsfwMode = 'Uncensored';
    } else if (!loadedSettings.allowNsfw) {
        loadedSettings.nsfwMode = 'Off';
    }

    let loadedKnowledgeBase = { ...defaultKnowledgeBase, ...(gameData.knowledgeBase || {}) };
    
    for (const key in defaultKnowledgeBase) {
        if (!loadedKnowledgeBase[key as keyof KnowledgeBase]) {
            loadedKnowledgeBase[key as keyof KnowledgeBase] = defaultKnowledgeBase[key as keyof KnowledgeBase] as any;
        }
    }
    
    const cleanStoryHistory = (gameData.storyHistory || []).filter(item => item && typeof item === 'object' && item.id);
    setGameSettings(loadedSettings);
    setKnowledgeBase(loadedKnowledgeBase);
    setMemories(gameData.memories || []);
    setChapterGoal(gameData.chapterGoal || '');
    
    // Xử lý chuyển đổi từ longTermMemories cũ sang chapters
    if (gameData.chapters && gameData.chapters.length > 0) {
        setChapters(gameData.chapters);
    } else if (gameData.longTermMemories && gameData.longTermMemories.length > 0) {
        // Migration: Gộp tất cả LTM cũ thành 1 chương "Ký Ức Cũ"
        const migratedContent = gameData.longTermMemories.map(m => m.content).join('\n');
        setChapters([{
            id: crypto.randomUUID(),
            title: "Chương 0: Ký Ức Đã Qua",
            content: migratedContent,
            timestamp: Date.now()
        }]);
    } else {
        setChapters([]);
    }

    setWorldKnowledge(gameData.worldKnowledge || []);
    setStorySummary(gameData.storySummary || '');
    setTurnCount(gameData.turnCount || 0);
    setCurrentStory(gameData.currentStory || "");
    setChoices(gameData.currentChoices || []);
    setStoryHistory(cleanStoryHistory);
    setChatHistoryForGemini(gameData.chatHistoryForGemini || []); 
    setUndoStack(gameData.undoStack || []);
    
    // Nếu gameData không có id (ví dụ: tải từ file), tạo id mới
    const gameId = gameData.id || crypto.randomUUID();
    setCurrentGameId(gameId);
    
    // Nếu tải từ file (id ban đầu là null), lưu ngay vào localforage
    if (!gameData.id) {
        const newGameData = {
            ...gameData,
            id: gameId,
            updatedAt: new Date().toISOString()
        };
        await localforage.setItem(`ai_adventure_game_${gameId}`, JSON.stringify(newGameData));
        setSavedGames(prev => [newGameData as any, ...prev]);
    }

    setCurrentScreen('gameplay');
    setShowLoadGameModal(false);
    setModalMessage({ show: true, title: 'Tải Game Thành Công', content: 'Game đã được tải lại trọn vẹn. AI sẽ tiếp tục câu chuyện với đầy đủ ngữ cảnh và trí nhớ từ phiên chơi trước.', type: 'success' });
  };

  const handleSaveGameToFile = () => {
    if (storyHistory.length === 0) {
        setModalMessage({ show: true, title: 'Không Thể Lưu', content: 'Không có gì để lưu. Hãy bắt đầu cuộc phiêu lưu trước.', type: 'info' });
        return;
    }
    const gameState = {
        settings: gameSettings, storyHistory, currentStory, currentChoices: choices,
        chatHistoryForGemini, knowledgeBase, memories, chapters, chapterGoal, worldKnowledge, storySummary, turnCount,
        savedAt: new Date().toISOString(), version: "5.2.0-chapter-system"
    };
    const jsonString = JSON.stringify(gameState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${(gameSettings.theme || 'phieu-luu').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setModalMessage({ show: true, title: 'Đã Lưu', content: `Game đã được lưu vào tệp "${fileName}".`, type: 'success' });
  };

  const handleLoadGameFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const gameData = JSON.parse(text);
            if (!gameData.settings || !gameData.storyHistory) throw new Error("Tệp lưu không hợp lệ hoặc bị hỏng.");
            loadGame({ ...gameData, id: null });
        } catch (error: any) {
            console.error("Error loading game from file:", error);
            setModalMessage({ show: true, title: 'Lỗi Tải Game', content: `Không thể tải game từ tệp: ${error.message}`, type: 'error' });
        } finally {
            if (event.target) event.target.value = '';
        }
    };
    reader.onerror = () => setModalMessage({ show: true, title: 'Lỗi Đọc Tệp', content: 'Không thể đọc tệp đã chọn.', type: 'error' });
    reader.readAsText(file);
  };

  const handleSaveSetupToFile = () => {
    const jsonString = JSON.stringify(gameSettings, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai_simulator_setup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setModalMessage({ show: true, title: "Đã Lưu", content: `Thiết lập thế giới đã được lưu vào tệp.`, type: "success" });
  };

  const handleLoadSetupFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedSettings = JSON.parse(e.target?.result as string);
        if (typeof loadedSettings.theme !== 'string' || typeof loadedSettings.characterName !== 'string') {
          throw new Error("Tệp thiết lập không hợp lệ.");
        }
        setGameSettings(prev => ({ ...prev, ...loadedSettings }));
        setModalMessage({ show: true, title: "Tải Thành Công", content: `Đã tải thiết lập từ tệp "${file.name}".`, type: "success" });
      } catch (error: any) {
        setModalMessage({ show: true, title: "Lỗi Tải Thiết Lập", content: `Không thể tải: ${error.message}`, type: "error" });
      } finally {
        if(event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSaveKnowledgeToFile = () => {
    if (worldKnowledge.length === 0) {
      setModalMessage({ show: true, title: "Không có gì để lưu", content: "Chưa có tri thức nào được thêm.", type: "info" });
      return;
    }
    const jsonString = JSON.stringify(worldKnowledge, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai_simulator_knowledge_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setModalMessage({ show: true, title: "Đã Lưu", content: `Tri thức thế giới đã được lưu vào tệp.`, type: "success" });
  };

  const handleLoadKnowledgeFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedKnowledge = JSON.parse(e.target?.result as string);
        if (!Array.isArray(loadedKnowledge) || (loadedKnowledge.length > 0 && (typeof loadedKnowledge[0].content !== 'string' || typeof loadedKnowledge[0].enabled !== 'boolean'))) {
          throw new Error("Tệp tri thức không hợp lệ.");
        }
        const knowledgeWithIds = loadedKnowledge.map(rule => ({ ...rule, id: rule.id || crypto.randomUUID() }));
        setWorldKnowledge(knowledgeWithIds);
        setModalMessage({ show: true, title: "Tải Thành Công", content: `Đã tải tri thức từ tệp "${file.name}".`, type: "success" });
      } catch (error: any) {
        setModalMessage({ show: true, title: "Lỗi Tải Tri Thức", content: `Không thể tải: ${error.message}`, type: "error" });
      } finally {
        if(event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleStartNewGame = () => {
    setCurrentStory('');
    setChoices([]);
    setStoryHistory([]);
    setChatHistoryForGemini([]);
    setKnowledgeBase({ 
      npcs: [], items: [], locations: [], 
      inventory: [], playerSkills: [],
      playerStatus: [], playerAttributes: {},
      characterDna: []
    });
    setMemories([]);
    setChapters([]);
    setWorldKnowledge([]);
    setStorySummary('');
    setCustomActionInput('');
    setCurrentGameId(null);
    setTurnCount(0);
    setGameSettings({
      theme: '', setting: '', narratorPronoun: 'Để AI quyết định', 
      characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], customCharacterPersonality: '',
      characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', 
      difficulty: 'Thường', difficultyDescription: '', 
      allowNsfw: false, nsfwMode: 'Off',
      randomEventFrequency: 'Thấp',
      initialWorldElements: [], initialWorldKnowledge: [], useCharacterGoal: false, characterGoal: '',   
      allowCustomActionInput: true,
      initialScene: '',
      initialChapterGoal: '',
    });
    setCurrentScreen('setup');
  };
  
  const removeKnowledgeBaseItem = (item: any, category: keyof KnowledgeBase, categoryNameForMessage: string) => {
      if (!item || !item.id) return;
      setKnowledgeBase(prev => ({
          ...prev,
          [category]: (prev[category] as any[]).filter(i => i.id !== item.id)
      }));
  };

  const updateKnowledgeBaseItem = useCallback((id: string, category: keyof KnowledgeBase, updatedData: any) => {
    setKnowledgeBase(prev => {
      const currentItems = prev[category] as any[];
      const currentItem = currentItems.find(item => item.id === id);
      const oldName = currentItem?.Name || currentItem?.name || "Mục";
      
      const updatedItems = currentItems.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      );
      
      if (updatedData.Name && updatedData.Name !== oldName) {
         setStoryHistory(hist => [...hist, { 
            type: 'system', 
            content: `Thông tin "${oldName}" đã được chỉnh sửa thành "${updatedData.Name}".`, 
            id: crypto.randomUUID() 
        }]);
      }

      return { ...prev, [category]: updatedItems };
    });
  }, []);

  const handleAddKnowledgeItem = useCallback((category: keyof KnowledgeBase, newItem: any) => {
      setKnowledgeBase(prev => {
          const newKb = { ...prev };
          const list = newKb[category] as any[];
          newKb[category] = [...list, { id: crypto.randomUUID(), ...newItem }];
          return newKb;
      });
      setStoryHistory(hist => [...hist, { 
          type: 'system', 
          content: `Đã thêm mới "${newItem.Name || 'Mục không tên'}" vào danh sách.`, 
          id: crypto.randomUUID() 
      }]);
  }, []);

  const handleRemoveStatus = (status: any) => removeKnowledgeBaseItem(status, 'playerStatus', 'Trạng thái');
  const handleRemoveItem = (item: any) => removeKnowledgeBaseItem(item, 'inventory', 'Vật phẩm');
  const handleRemoveSkill = (skill: any) => removeKnowledgeBaseItem(skill, 'playerSkills', 'Kỹ năng');
  const handleRemoveNpc = (npc: any) => removeKnowledgeBaseItem(npc, 'npcs', 'Nhân vật');

  const restartGame = () => {
    setConfirmationModal({
        show: true, title: 'Bắt Đầu Lại?', content: 'Lưu tiến trình hiện tại trước khi bắt đầu lại?',
        onConfirm: async () => { 
            if (currentGameId) await saveGameProgress();
            handleStartNewGame();
        },
        onCancel: () => handleStartNewGame(),
        confirmText: 'Lưu và Bắt đầu lại', cancelText: 'Bắt đầu lại (Không lưu)'
    });
  };

  const goHome = () => {
    if (currentScreen === 'gameplay' && storyHistory.length > 0) { 
         setConfirmationModal({
            show: true, title: 'Về Trang Chủ?', content: 'Lưu tiến trình game trước khi về trang chủ?',
            onConfirm: async () => {
                if (currentGameId) await saveGameProgress();
                setCurrentScreen('initial');
            },
            onCancel: () => setCurrentScreen('initial'),
            confirmText: 'Lưu và Về Home', cancelText: 'Về Home (Không lưu)'
        });
    } else setCurrentScreen('initial');
  };

  const knowledgeBaseFingerprint = useMemo(() => {
      let fp = '';
      if (knowledgeBase) {
          const allLoreCategories: (keyof KnowledgeBase)[] = ['npcs', 'items', 'locations', 'inventory', 'playerSkills', 'playerStatus'];
          allLoreCategories.forEach(category => {
              (knowledgeBase[category] as any[] || []).forEach(loreItem => {
                  const itemName = loreItem.Name || loreItem.name || loreItem.title || ''; 
                  if (itemName.trim() !== '') {
                      const desc = (loreItem.Description || loreItem.description || '').substring(0, 50);
                      fp += `${category}:${loreItem.id}:${itemName.trim()}:${desc}|`;
                  }
              });
          });
      }
      return fp;
  }, [knowledgeBase]);

  const loreCacheRef = useRef<{loreRegex: RegExp | null, lookupMap: Map<string, any>}>({ loreRegex: null, lookupMap: new Map() });

  useEffect(() => {
      const allLoreEntries: {name: string, category: string, originalItem: any}[] = [];
      if (knowledgeBase) {
          const allLoreCategories: (keyof KnowledgeBase)[] = ['npcs', 'items', 'locations', 'inventory', 'playerSkills', 'playerStatus'];
          allLoreCategories.forEach(category => {
              (knowledgeBase[category] as any[] || []).forEach(loreItem => {
                  const itemName = loreItem.Name || loreItem.name || loreItem.title; 
                  if (itemName && itemName.trim() !== "") {
                      allLoreEntries.push({ name: itemName.trim(), category, originalItem: loreItem });
                  }
              });
          });
      }

      allLoreEntries.sort((a, b) => b.name.length - a.name.length);
      const lMap = new Map();
      allLoreEntries.forEach(entry => {
          const lowerName = entry.name.toLowerCase();
          if (!lMap.has(lowerName)) {
              lMap.set(lowerName, entry);
          }
      });

      let regex: RegExp | null = null;
      if (allLoreEntries.length > 0) {
          const pattern = allLoreEntries
              .map(e => e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
              .join('|');
          regex = new RegExp(`(\\b(?:${pattern})\\b)`, 'gi');
      }

      loreCacheRef.current = { loreRegex: regex, lookupMap: lMap };
  }, [knowledgeBaseFingerprint]);

  const formatStoryText = useCallback((text: string) => {
    if (!text) return null;

    const processLine = (lineContent: string) => {
        let segments: any[] = [];
        const { loreRegex, lookupMap } = loreCacheRef.current;
        if (loreRegex) {
            const parts = lineContent.split(loreRegex);
            parts.forEach(part => {
                const lowerPart = part.toLowerCase();
                if (lookupMap.has(lowerPart)) {
                    const entry = lookupMap.get(lowerPart);
                    segments.push({ type: 'lore', text: part, category: entry.category, originalItem: entry.originalItem });
                } else if (part !== "") {
                    segments.push({ type: 'text', content: part });
                }
            });
        } else {
            segments = [{ type: 'text', content: lineContent }];
        }
        
        return segments.map((segment, index) => {
            if (segment.type === 'text') {
                let formattedSegment = segment.content || '';
                formattedSegment = formattedSegment.replace(/\((.*?)\)/g, '<span class="text-gray-400 italic">($1)</span>');
                formattedSegment = formattedSegment.replace(/^([\w\u00C0-\u017F]+):\s*"(.*?)"/gm, `<strong class="text-blue-400">$1:</strong> "$2"`);
                formattedSegment = formattedSegment.replace(/\*\*\*(?!\*)(.+?)(?<!\*)\*\*\*/g, '<span class="text-purple-400 italic">"$1"</span>');
                formattedSegment = formattedSegment.replace(/\*\*(?!\*)(.+?)(?<!\*)\*\*/g, '<span class="text-purple-400">$1</span>');
                formattedSegment = formattedSegment.replace(/(?<!\w)\*(?!\*)(.+?)(?<!\*)\*(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>'); 
                formattedSegment = formattedSegment.replace(/(?<!\w)_(?!_)(.+?)(?<!_)_(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>'); 
                formattedSegment = formattedSegment.replace(/\[(?!PLAYER_PERSONALITY|LORE_|ITEM_AQUIRED|SKILL_LEARNED|SKILL_UPDATED|ITEM_CONSUMED|ITEM_REMOVED|ITEM_UPDATED|STATUS_APPLIED_SELF|STATUS_CURED_SELF|STATUS_EXPIRED_SELF|STATUS_APPLIED_NPC|STATUS_CURED_NPC|STATUS_EXPIRED_NPC|QUEST_ASSIGNED|QUEST_UPDATED|QUEST_OBJECTIVE_COMPLETED|WORLD_EVENT|NPC_DEATH|MEMORIZE_LONG_TERM|TIME_UPDATE)(.*?)\]/g, '<span class="text-yellow-400 font-semibold">[$1]</span>'); 
                
                // Clean up empty or stray markdown
                formattedSegment = formattedSegment.replace(/\*\*\s*\*\*/g, '');
                formattedSegment = formattedSegment.replace(/__\s*__/g, '');
                formattedSegment = formattedSegment.replace(/(^|\s)(\*{2}|_{2})(?=\s|$|[.,;:!?])/g, '');

                return <span key={`segment-${index}`} dangerouslySetInnerHTML={{ __html: formattedSegment }} />;
            } else if (segment.type === 'lore') {
                return <span key={`lore-${segment.originalItem.id}-${index}`} className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold" onClick={(e) => { e.stopPropagation(); openQuickLoreModal(segment.originalItem, segment.category || ''); }}>{segment.text}</span>;
            }
            return null; 
        });
    };

    return text.split(/\n\s*\n/).filter(p => p.trim() !== '').map((paragraph, pIndex) => {
        const lines = paragraph.split('\n').filter(line => {
            const trimmed = line.trim();
            // Filter out empty lines or lines that are just markdown symbols
            return trimmed !== '' && !/^(\*|_)+$/.test(trimmed);
        });

        if (lines.length === 0) return null;

        return (
            <p key={`p-${pIndex}`} className="mb-3 leading-relaxed">
                {lines.map((line, lineIndex) => (
                    <React.Fragment key={`line-${lineIndex}`}>
                        {processLine(line)}
                        {lineIndex < lines.length - 1 && <br />} 
                    </React.Fragment>
                ))}
            </p>
        );
    });
  }, [openQuickLoreModal]); 

  return (
    <div className="font-sans text-white">
      {currentScreen === 'initial' && <InitialScreen onStartNewGame={handleStartNewGame} setShowLoadGameModal={setShowLoadGameModal} savedGames={savedGames} userId={null} setShowUpdateLogModal={setShowUpdateLogModal} handleLoadGameFromFile={handleLoadGameFromFile} />}
      {currentScreen === 'setup' && <GameSetupScreen 
          goHome={goHome} 
          gameSettings={gameSettings} 
          handleInputChange={handleInputChange} 
          initializeGame={initializeGame} 
          isLoading={isLoading} 
          handleFetchSuggestions={handleFetchSuggestions} 
          isFetchingSuggestions={isFetchingSuggestions} 
          handleGenerateBackstory={handleGenerateBackstory} 
          isGeneratingContent={isGeneratingContent} 
          handleGenerateDifficultyDescription={handleGenerateDifficultyDescription} 
          isGeneratingDifficultyDesc={isGeneratingDifficultyDesc} 
          addInitialWorldElement={addInitialWorldElement} 
          removeInitialWorldElement={removeInitialWorldElement} 
          handleInitialElementChange={handleInitialElementChange} 
          handleGenerateInitialElementDescription={handleGenerateInitialElementDescription} 
          isGeneratingInitialElementDesc={isGeneratingInitialElementDesc} 
          handleGenerateGoal={handleGenerateGoal} 
          isGeneratingGoal={isGeneratingGoal} 
          handleGenerateCharacterName={handleGenerateCharacterName} 
          isGeneratingCharacterName={isGeneratingCharacterName} 
          handleGenerateInitialSkill={handleGenerateInitialSkill} 
          isGeneratingInitialSkill={isGeneratingInitialSkill} 
          handleSaveSetupToFile={handleSaveSetupToFile} 
          handleLoadSetupFromFile={handleLoadSetupFromFile} 
          addInitialWorldKnowledgeRule={addInitialWorldKnowledgeRule}
          updateInitialWorldKnowledgeRule={updateInitialWorldKnowledgeRule}
          removeInitialWorldKnowledgeRule={removeInitialWorldKnowledgeRule}
      />}
      {currentScreen === 'gameplay' && <GameplayScreen 
          goHome={goHome} 
          gameSettings={gameSettings} 
          restartGame={restartGame} 
          storyHistory={storyHistory} 
          isLoading={isLoading} 
          currentStory={currentStory} 
          choices={choices} 
          handleChoice={handleChoice} 
          formatStoryText={formatStoryText} 
          customActionInput={customActionInput} 
          setCustomActionInput={setCustomActionInput} 
          handleCustomAction={handleCustomAction} 
          knowledgeBase={knowledgeBase} 
          setShowCharacterInfoModal={setShowCharacterInfoModal} 
          handleGenerateSuggestedActions={handleGenerateSuggestedActions} 
          isGeneratingSuggestedActions={isGeneratingSuggestedActions} 
          canUndo={undoStack.length > 0}
          handleUndo={handleUndo}
          isSaving={isSaving} 
          setShowMemoryModal={setShowMemoryModal} 
          setShowWorldKnowledgeModal={setShowWorldKnowledgeModal} 
          finalPersonality={finalPersonality} 
          handleSaveGameToFile={handleSaveGameToFile} 
          handleRemoveStatus={handleRemoveStatus} 
          collapsedSections={collapsedSections}
          toggleSectionCollapse={toggleSectionCollapse}
          handleUpdateKnowledgeItem={updateKnowledgeBaseItem}
          chapters={chapters}
      />}
      <UpdateLogModal show={showUpdateLogModal} onClose={() => setShowUpdateLogModal(false)} changelog={changelogData} />
      {showLoadGameModal && <LoadGameModal savedGames={savedGames} loadGame={loadGame} setShowLoadGameModal={setShowLoadGameModal} setConfirmationModal={setConfirmationModal} userId={null} setModalMessage={setModalMessage} setSavedGames={setSavedGames} />}
      {showCharacterInfoModal && <CharacterInfoModal 
          knowledge={knowledgeBase} 
          worldKnowledge={worldKnowledge} 
          show={showCharacterInfoModal} 
          onClose={() => setShowCharacterInfoModal(false)} 
          characterName={gameSettings.characterName} 
          characterAppearance={gameSettings.characterAppearance}
          finalPersonality={finalPersonality} 
          characterBackstory={gameSettings.characterBackstory}
          onUpdateBasicInfo={(name, personality, appearance, backstory) => {
              setGameSettings(prev => ({
                  ...prev,
                  characterName: name,
                  characterAppearance: appearance,
                  characterBackstory: backstory,
                  characterPersonality: 'Tùy chỉnh...',
                  customCharacterPersonality: personality
              }));
          }}
          handleRemoveStatus={handleRemoveStatus}
          handleRemoveItem={handleRemoveItem}
          handleRemoveSkill={handleRemoveSkill}
          handleRemoveNpc={handleRemoveNpc}
          handleRemoveDna={(dna) => removeKnowledgeBaseItem(dna, 'characterDna', 'DNA')}
          handleUpdateKnowledgeItem={updateKnowledgeBaseItem}
          handleAddKnowledgeItem={handleAddKnowledgeItem}
          chapters={chapters}
          chapterGoal={chapterGoal}
          setChapterGoal={setChapterGoal}
          collapsedSections={collapsedSections}
          toggleSectionCollapse={toggleSectionCollapse}
      />}
      {showQuickLoreModal && <QuickLoreModal loreItem={quickLoreContent} show={showQuickLoreModal} onClose={() => setShowQuickLoreModal(false)} />}
      {showMemoryModal && <MemoryModal show={showMemoryModal} onClose={() => setShowMemoryModal(false)} memories={memories} togglePinMemory={togglePinMemory} clearAllMemories={clearAllMemories} />}
      {showWorldKnowledgeModal && <WorldKnowledgeModal show={showWorldKnowledgeModal} onClose={() => setShowWorldKnowledgeModal(false)} worldKnowledge={worldKnowledge} addRule={addWorldKnowledge} updateRule={updateWorldKnowledge} toggleRule={toggleWorldKnowledge} deleteRule={deleteWorldKnowledge} handleSaveKnowledgeToFile={handleSaveKnowledgeToFile} handleLoadKnowledgeFromFile={handleLoadKnowledgeFromFile} />}
      <SuggestionsModal show={showSuggestionsModal.show} title={showSuggestionsModal.title || "✨ Gợi Ý"} suggestions={showSuggestionsModal.suggestions} isLoading={showSuggestionsModal.isLoading} onSelect={(suggestion) => { if (showSuggestionsModal.fieldType) setGameSettings(prev => ({ ...prev, [showSuggestionsModal.fieldType]: suggestion })); }} onClose={() => setShowSuggestionsModal({ show: false, fieldType: null, suggestions: [], isLoading: false, title: '' })} />
      <SuggestedActionsModal show={showSuggestedActionsModal} suggestions={suggestedActionsList} isLoading={isGeneratingSuggestedActions} onSelect={(action) => { setCustomActionInput(action); setShowSuggestedActionsModal(false); }} onClose={() => setShowSuggestedActionsModal(false)} />
      <MessageModal show={modalMessage.show} title={modalMessage.title} content={modalMessage.content} type={modalMessage.type} onClose={() => setModalMessage({ show: false, title: '', content: '', type: 'info' })} />
      <ConfirmationModal show={confirmationModal.show} title={confirmationModal.title} content={confirmationModal.content} onConfirm={confirmationModal.onConfirm} onCancel={confirmationModal.onCancel} confirmText={confirmationModal.confirmText} cancelText={confirmationModal.cancelText} setConfirmationModal={setConfirmationModal} />
    </div>
  );
};

export default App;
