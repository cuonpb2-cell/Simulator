
export interface InitialWorldElement {
  id: string;
  type: 'NPC' | 'LOCATION' | 'ITEM';
  name: string;
  description: string;
  personality?: string;
  appearance?: string; // Thêm trường ngoại hình
}

export interface WorldKnowledgeRule {
  id: string;
  content: string;
  enabled: boolean;
}

export interface GameSettings {
  theme: string;
  setting: string;
  narratorPronoun: string;
  pacingStyle?: 'Classic' | 'Novel'; // Kiểu nhịp độ kể: Cận cảnh RPG từng bước hoặc Kiểu Tiểu thuyết cuốn hút
  characterName: string;
  characterAppearance: string;
  characterPersonality: string;
  customCharacterPersonality: string;
  characterGender: string;
  characterBackstory: string;
  preferredInitialSkill: string;
  difficulty: string;
  difficultyDescription: string;
  allowNsfw: boolean; // Giữ lại để tương thích ngược, nhưng logic chính sẽ dùng nsfwMode
  nsfwMode: 'Off' | 'Uncensored' | 'Hardcore'; // Thêm chế độ mới
  randomEventFrequency: 'Tắt' | 'Thấp' | 'Thường' | 'Cao'; // Mới: Kiểm soát tần suất sự kiện
  initialWorldElements: InitialWorldElement[];
  initialWorldKnowledge: WorldKnowledgeRule[];
  useCharacterGoal: boolean;
  characterGoal: string;
  allowCustomActionInput: boolean;
  initialScene: string;
  initialChapterGoal: string;
}

export interface KnowledgeBaseItem {
  id: string;
  Name?: string; // For items, npcs, skills
  name?: string; // for status
  title?: string; // for quests
  Description?: string;
  description?: string;
  Appearance?: string; // Thêm trường ngoại hình cho KB
  appearance?: string;
  Affinity?: string; // Thêm trường hảo cảm
  affinity?: string;
  [key: string]: any;
}

export interface KnowledgeBase {
  npcs: KnowledgeBaseItem[];
  items: KnowledgeBaseItem[];
  locations: KnowledgeBaseItem[];
  inventory: KnowledgeBaseItem[];
  playerSkills: KnowledgeBaseItem[];
  playerStatus: KnowledgeBaseItem[];
  playerAttributes: { [key: string]: string | number };
  characterDna?: KnowledgeBaseItem[];
}

export interface StoryItem {
  id: string;
  type: 'story' | 'user_choice' | 'user_custom_action' | 'system';
  content: string;
}

export interface Chapter {
    id: string;
    title: string;
    content: string;
    timestamp: number;
}

export interface SavedGame {
  id: string;
  settings: GameSettings;
  storyHistory: StoryItem[];
  currentStory: string;
  currentChoices: string[];
  chatHistoryForGemini: any[];
  knowledgeBase: KnowledgeBase;
  memories: Memory[];
  chapters: Chapter[]; // Thay thế longTermMemories bằng chapters
  longTermMemories?: Memory[]; // Giữ lại để tương thích ngược khi load save cũ
  worldKnowledge: WorldKnowledgeRule[];
  storySummary: string;
  turnCount: number;
  undoStack?: any[];
  updatedAt?: string | number | any;
}

export interface Memory {
    id: string;
    content: string;
    pinned: boolean;
    timestamp: number;
    summarized?: boolean;
}

export interface ChangelogChange {
    type: 'AI' | 'IMPROVE' | 'UI' | 'NEW' | 'FIX';
    text: string;
}

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: ChangelogChange[];
}

export interface SuggestionModalState {
    show: boolean;
    fieldType: keyof GameSettings | null;
    suggestions: string[];
    isLoading: boolean;
    title: string;
}

export interface ModalMessageState {
    show: boolean;
    title: string;
    content: string;
    type: 'info' | 'success' | 'error';
}

export interface ConfirmationModalState {
    show: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
    onCancel: (() => void) | null;
    confirmText?: string;
    cancelText?: string;
}