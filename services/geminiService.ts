import { GoogleGenAI, HarmCategory, HarmBlockThreshold, type GenerateContentResponse, FinishReason } from "@google/genai";

const getApiKey = (): string => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set. Please configure the API key.");
    }
    return apiKey;
};

const handleApiError = (error: any): never => {
    let errorMessage = "An unknown error occurred while contacting the AI.";
    if (error.message) {
        try {
            // The error message might be a JSON string from the API proxy
            const errorJson = JSON.parse(error.message);
            if (errorJson.error && errorJson.error.message) {
                if (errorJson.error.status === "RESOURCE_EXHAUSTED") {
                    errorMessage = `Bạn đã vượt quá giới hạn yêu cầu API (rate limit). Vui lòng thử lại sau ít phút hoặc kiểm tra gói cước của bạn. Chi tiết: ${errorJson.error.message}`;
                } else {
                    errorMessage = `Lỗi từ AI: ${errorJson.error.message}`;
                }
            } else {
                errorMessage = error.message;
            }
        } catch (parseError) {
            // Not a JSON string, use the raw message.
            errorMessage = error.message;
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    throw new Error(errorMessage);
};

const handleEmptyResponse = (response: GenerateContentResponse): never => {
    const candidate = response.candidates?.[0];
    let errorMessage = "API returned an empty response.";
    
    // Kiểm tra nếu prompt bị chặn (ví dụ: do chứa nội dung quá nhạy cảm)
    if (response.promptFeedback?.blockReason) {
        errorMessage = `Hệ thống an toàn của AI đã chặn yêu cầu này do chứa nội dung nhạy cảm (Lý do: ${response.promptFeedback.blockReason}). Vui lòng dùng từ ngữ nói giảm nói tránh hoặc chuyển cảnh (fade-to-black).`;
    } else if (candidate?.finishReason && candidate.finishReason !== FinishReason.STOP && candidate.finishReason !== FinishReason.FINISH_REASON_UNSPECIFIED) {
        if (candidate.finishReason === FinishReason.SAFETY) {
            errorMessage = `Hệ thống an toàn của AI đã chặn phản hồi do chứa nội dung nhạy cảm. Vui lòng dùng từ ngữ nói giảm nói tránh hoặc chuyển cảnh (fade-to-black).`;
            if (candidate.safetyRatings) {
                const harmfulRatings = candidate.safetyRatings
                    .filter(r => r.probability !== 'NEGLIGIBLE' && r.probability !== 'LOW')
                    .map(r => `${r.category.replace('HARM_CATEGORY_', '')}: ${r.probability}`)
                    .join(', ');
                if (harmfulRatings) {
                     errorMessage += ` (Chi tiết: ${harmfulRatings})`;
                }
            }
        } else {
            errorMessage = `Request was blocked or generation failed. Reason: ${candidate.finishReason}.`;
        }
    } else {
        // Trường hợp API trả về rỗng nhưng không có lý do rõ ràng (có thể do lỗi server hoặc model từ chối ngầm)
        errorMessage = "API trả về phản hồi rỗng (có thể do nội dung quá nhạy cảm khiến model từ chối trả lời). Vui lòng thử lại với hành động khác hoặc dùng từ ngữ nhẹ nhàng hơn.";
    }
    
    throw new Error(errorMessage);
};

export const callGeminiAPI = async (prompt: string, chatHistory: any[], shortActionText?: string) => {
    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ 
            apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });

        const msgToSend = { role: "user", parts: [{ text: prompt }] };
        
        let historyToSend = chatHistory.map(msg => {
            if (msg.role === 'user' && msg.parts?.[0]?.text) {
                const text = msg.parts[0].text;
                // Nếu lịch sử cũ chứa đoạn prompt khổng lồ, cố gắng trích xuất nguyên hành động
                const match = text.match(/--- HÀNH ĐỘNG CỦA NGƯỜI CHƠI \(HIỆN TẠI\) ---\n"([\s\S]*?)"\n\n--- NHẮC NHỞ QUAN TRỌNG/);
                if (match && match[1]) {
                    return { ...msg, parts: [{ text: `[Hành động]: ${match[1]}` }] };
                }
                if (text.includes('--- YÊU CẦU KHỞI TẠO ---')) {
                     return { ...msg, parts: [{ text: '[Bắt đầu câu chuyện mới]' }] };
                }
                // Nếu vẫn quá dài thì lược bớt để tránh tràn Token
                if(text.length > 2000) {
                     return { ...msg, parts: [{ text: text.substring(0, 2000) + '... (Lược bớt do quá dài)' }] };
                }
            }
            return msg;
        });

        // Add the current full prompt
        historyToSend = [...historyToSend, msgToSend];

        const MAX_CONTEXT_WINDOW = 50; // Context Window for Gemini
        if (historyToSend.length > MAX_CONTEXT_WINDOW) {
            historyToSend = historyToSend.slice(-MAX_CONTEXT_WINDOW);
        }

        const responseStage1 = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: historyToSend,
            config: {
                temperature: 0.9,
                maxOutputTokens: 8192,
                topP: 0.95,
                topK: 64,
                systemInstruction: "Bạn là nhà văn sáng tạo (hãy viết truyện thật bay bổng), nhưng bắt buộc phải bọc toàn bộ nội dung câu chuyện vào trong cấu trúc và các thẻ định dạng hệ thống được yêu cầu (như <AI_INTERNAL_THOUGHT>, [STORY_START], [MEMORY_ADD], ...). Không được tự ý thêm thắt ký tự lạ ngoài định dạng.",
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ],
            },
        });

        const stage1RawText = responseStage1.text;
        if (!stage1RawText) {
            handleEmptyResponse(responseStage1);
        }

        // Bước 2: Định dạng và Chuẩn hóa (Gọi API lần 2 với temperature = 0.0 để đảm bảo tính chuẩn xác tuyệt đối)
        const formatPrompt = `
Bạn là Game Engine Tối Cao kiêm Chuyên gia Định dạng dữ liệu chuẩn xác tuyệt đối.
Dưới đây là bản thảo truyện vừa được viết bởi nhà văn sáng tạo:
---
${stage1RawText}
---

Nhiệm vụ của bạn:
Hãy phân tích đoạn truyện trên và bóc tách nó thành định dạng chuẩn mực mà hệ thống yêu cầu dưới đây. Bạn không được tự ý sửa đổi nội dung truyện hay viết tiếp cốt truyện. Bạn chỉ làm nhiệm vụ chuẩn hóa cấu trúc thẻ định dạng.

ĐỊNH DẠNG CƠ BẢN YÊU CẦU:
1. Bắt đầu bằng khối <AI_INTERNAL_THOUGHT>...</AI_INTERNAL_THOUGHT> ghi nhận các suy luận logic và tính toán thời gian.
2. Đọc và chỉnh sửa các thẻ lệnh hệ thống (ví dụ: [MEMORY_ADD: content="..."], [ITEM_AQUIRED: ...], [NPC_UPDATE: ...], [SKILL_LEARNED: ...], [LOCATION_DISCOVERED: ...], [LORE_ITEM_DISCOVERED: ...]) cho hoàn toàn chuẩn cú pháp, đầy đủ dấu ngoặc, đóng mở thẻ hoàn hảo, không bị khuyết thiếu hay rách rưới do phản hồi trước bị cắt cụt.
3. Đặt thẻ [STORY_START] ngay sau phần AI_INTERNAL_THOUGHT.
4. Giữ nguyên câu chuyện nguyên văn kịch tính từ bản thảo.
5. Đảm bảo danh sách lựa chọn (ví dụ: 1. ... , 2. ... , 3. ...) ở cuối câu chuyện được định dạng chuẩn xác từng dòng.
6. Trả về cấu trúc văn bản chuẩn xác và hoàn chỉnh này. Tuyệt đối không thêm thắt ký tự lạ ngoài định dạng yêu cầu.
`;

        const responseStage2 = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: "user", parts: [{ text: formatPrompt }] }],
            config: {
                temperature: 0.0,
                maxOutputTokens: 8192,
                topP: 0.95,
                topK: 64,
                systemInstruction: "Bạn là Game Engine Tối Cao kiêm Chuyên gia Định dạng dữ liệu chuẩn xác tuyệt đối. Nhiệm vụ duy nhất của bạn là chuẩn hóa cấu trúc thẻ định dạng từ bản thảo cốt truyện đã có mà không sửa đổi hay kéo dài nội dung câu chuyện.",
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ],
            },
        });

        const rawText = responseStage2.text || stage1RawText || "";
        
        // Chỉ lưu text rút gọn vào mảng lịch sử (để tránh phình to localStorage và file Save)
        const textToSave = shortActionText || (prompt.length > 1000 ? '[Người chơi hành động]' : prompt);
        const newFullHistory = [
            ...chatHistory, 
            { role: "user", parts: [{ text: textToSave }] }, 
            { role: "model", parts: [{ text: rawText }] }
        ];
        
        let truncatedHistory = newFullHistory;
        const MAX_SAVE_HISTORY = 100;
        if (newFullHistory.length > MAX_SAVE_HISTORY) {
            truncatedHistory = newFullHistory.slice(-MAX_SAVE_HISTORY);
        }
        
        return { rawText, updatedChatHistory: truncatedHistory };
    } catch (error) {
        handleApiError(error);
    }
};

export const fetchGenericGeminiText = async (promptText: string): Promise<string> => {
    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ 
            apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            config: {
                temperature: 0.8,
                maxOutputTokens: 8192,
                topP: 0.95,
                topK: 64,
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ],
            },
        });
        
        const text = response.text;
        if (text) {
            return text.trim();
        } else {
            handleEmptyResponse(response);
        }
    } catch (error) {
        handleApiError(error);
    }
};