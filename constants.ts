
import type { ChangelogEntry } from './types';

export const PLAYER_PERSONALITIES: string[] = [
    'Tùy chỉnh...',
    "Dũng Cảm, Bộc Trực", "Thận Trọng, Đa Nghi", "Lạnh Lùng, Ít Nói", "Hài Hước, Thích Trêu Chọc",
    "Nhân Hậu, Vị Tha", "Trầm Tính, Thích Quan Sát", "Nhút Nhát, Hay Lo Sợ", "Tò Mò, Thích Khám Phá",
    "Trung Thành, Đáng Tin Cậy", "Lãng Mạn, Mơ Mộng", "Thực Dụng, Coi Trọng Lợi Ích", "Chính Trực, Ghét Sự Giả Dối",
    "Hoài Nghi, Luôn Đặt Câu Hỏi", "Lạc Quan, Luôn Nhìn Về Phía Trước", "Lý Trí, Giỏi Phân Tích",
    "Nghệ Sĩ, Tâm Hồn Bay Bổng", "Thích Phiêu Lưu, Không Ngại Mạo Hiểm", "Cẩn Thận Từng Chi Tiết, Cầu Toàn",
    "Hào Sảng, Thích Giúp Đỡ Người Khác", "Kiên Định, Không Dễ Bỏ Cuộc", "Khiêm Tốn, Không Khoe Khoang",
    "Sáng Tạo, Nhiều Ý Tưởng Độc Đáo", "Mưu Mẹo, Gian Xảo", "Tham Lam, Ích Kỷ", "Khó Lường, Bí Ẩn", 
    "Nóng Nảy, Liều Lĩnh", "Kiêu Ngạo, Tự Phụ", "Đa Sầu Đa Cảm, Dễ Tổn Thương", "Cố Chấp, Bảo Thủ", 
    "Lười Biếng, Thích Hưởng Thụ", "Ghen Tị, Hay So Sánh", "Thù Dai, Khó Tha Thứ", "Ba Phải, Không Có Chính Kiến"
];
export const NARRATOR_PRONOUNS: string[] = [
    'Để AI quyết định',
    `Người kể là nhân vật trong truyện – thường là nhân vật chính – xưng “Tôi”, “Ta”, “Mình”, “Bản tọa”, “Lão phu”, v.v.`,
    `Người đọc/chơi chính là nhân vật chính – dùng “Bạn”, “Ngươi”, “Mày”, “Mi”, hoặc xưng hô cá biệt như “Tiểu tử”, “Cô nương”, v.v.`,
    `Người kể đứng ngoài câu chuyện, gọi nhân vật là “Anh ta”, “Cô ấy”, “Hắn”, “Nàng”, “Gã”, v.v.`,
];

export const changelogData: ChangelogEntry[] = [
    {
        version: "5.4.0 (Anti-Overreaction on Sparring/Tests Across Genres)",
        date: "11/06/2026",
        changes: [
            { type: "AI", text: "Chống quá khích trong tỷ thí (Anti-Overreaction on Sparring/Tests Across Genres): Áp dụng cho mọi bối cảnh (Tu Tiên, Khoa học viễn tưởng, Cyberpunk, Zombie/Hậu tận thế...). Nghiêm cấm đối thủ và các NPC sử dụng những chiêu thức cực đoan để hiến tế sinh mạng, thiêu đốt tu vi, phá hủy lò phản ứng cơ thể hoặc sử dụng cấm dược kích thích phá hủy bản thân trong các cuộc giao hữu, tỷ thí cọ sát, thi đấu thể thao học đường hoặc kiểm tra học viện/bang hội thông thường không có sự kiện sinh tử chiến thực sự." },
            { type: "IMPROVE", text: "Hành xử lý trí (Rational Opponents): Cốt truyện tỷ thí đài đấu hay kiểm tra chuyên môn nay sẽ logic và chân thực hơn, đối thủ biết tiến biết lui, biết đầu hàng danh dự, giữ khí chất tôn nghiêm và khí độ chuyên nghiệp, thể hiện rõ trình độ bản thân mà không tự sát phi lý." }
        ],
    },
    {
        version: "5.3.0 (Anti-Lazy AI & Multi-Genre World Diversity)",
        date: "03/06/2026",
        changes: [
            { type: "AI", text: "Chống đồng điệu cơ duyên đa bối cảnh (Anti-Attribute Matching): Áp dụng cho mọi thể loại (Tu Tiên, Cyberpunk, Zombie, Viễn tưởng...). Nghiêm cấm AI giới hạn thế giới và phần thưởng/cơ duyên xoay quanh thuộc tính gốc của nhân vật chính (VD: MC hệ Hỏa đi đâu cũng nhặt đồ hệ Hỏa; MC Hacker đi đâu cũng chỉ nhặt chip hack/súng cảm ứng). Thế giới khách quan giờ đây mở rộng hơn với đầy đủ các vật phẩm, thiết bị, phe phái và cơ duyên xung đột đa diện phong phú bản sắc của bối cảnh tương thích." },
            { type: "IMPROVE", text: "Chống trùng lặp biến tấu vật phẩm/võ học/kỹ năng (No Lazy Technique/Item Cloning): Áp dụng cho mọi thể loại. Buộc AI phải sáng tạo phi tuyến tính, cấm hoàn toàn hành vi sao chép vật phẩm hay kỹ năng cũ của người chơi để sửa tên lặp một cách lười biếng (VD: Đang có 'Trường Sinh Quyết cơ bản' lại nhận thêm 'Thanh Vân Trường Sinh Quyết'; đang có 'Súng điện từ Mk.1' lại nhặt được 'Súng điện từ Thanh Vân Ngự thế Mk.2'). Các vật phẩm, trang bị và kỹ năng mới phải mang danh xưng hoàn toàn độc lập độc bản, mang đậm bản sắc sự kiện tương thích bối cảnh bấy giờ." }
        ],
    },
    {
        version: "5.2.29 (Undo Action)",
        date: "14/05/2026",
        changes: [
            { type: "TÍNH NĂNG", text: "Thêm chức năng Hoàn Tác (Undo): Cho phép người chơi quay lại trạng thái ngay trước lựa chọn hoặc hành động cuối cùng, giúp khắc phục những quyết định sai lầm. Bạn có thể hoàn tác lên đến 20 lượt trước đó." }
        ],
    },
    {
        version: "5.2.28 (Fix HMR Disconnect)",
        date: "10/05/2026",
        changes: [
            { type: "FIX", text: "Khắc phục lỗi '[vite] server connection lost. Polling for restart...' gây kết nối lại, làm gián đoạn trải nghiệm chơi game." }
        ],
    },
    {
        version: "5.2.27 (Strict NPC Creation)",
        date: "07/05/2026",
        changes: [
            { type: "FIX", text: "Siết chặt tính năng ghi nhận hồ sơ NPC, AI giờ đây bị nghiêm cấm ghi nhớ các NPC quần chúng qua đường, lính canh râu ria hoặc nhân vật không quan trọng vào hệ thống. Việc này giúp giữ cho danh sách Nhân vật gặp gỡ được sạch sẽ hơn và lưu vào file Save nhẹ nhàng hơn." }
        ],
    },
    {
        version: "5.2.26 (NPC Profile Refinement)",
        date: "04/05/2026",
        changes: [
            { type: "FIX", text: "Khắc phục lỗi mô tả sai thuộc tính Ngoại hình (Appearance) của NPC. AI sẽ không còn ghi đè những hành động, biểu cảm nhất thời (như \"đang quỳ\", \"đang khóc\") vào mục Ngoại hình trong Hồ sơ Nhân Vật nữa." },
            { type: "IMPROVE", text: "Nhấn mạnh với AI rằng thuộc tính Ngoại hình chỉ dành cho các miêu tả vật lý, trang phục hoặc nhận dạng cố định." }
        ],
    },
    {
        version: "5.2.25 (Inventory Quantity Support)",
        date: "02/05/2026",
        changes: [
            { type: "TÍNH NĂNG", text: "Nâng cấp hệ thống Balo: Bổ sung khả năng quản lý Số Lượng cho vật phẩm. Khi nhận thêm hoặc tiêu thụ vật phẩm, AI và hệ thống sẽ tự động cộng dồn hoặc trừ đi đúng số lượng được chỉ định thay vì mất hoàn toàn vật phẩm." },
            { type: "CẢI TIẾN", text: "Thẻ lệnh của AI giờ đây hỗ trợ thuộc tính Quantity cho cả ITEM_AQUIRED và ITEM_CONSUMED." }
        ],
    },
    {
        version: "5.2.24 (Memory Cycle Fix)",
        date: "01/05/2026",
        changes: [
            { type: "Logic", text: "Sửa lỗi chu kỳ ký ức: Áp dụng cơ chế 'Cửa Sổ Trượt' (Sliding Window) cho ký ức tạm thời theo góp ý người chơi. Thay vì xóa toàn bộ 50 ký ức sau khi tóm tắt, hệ thống sẽ giữ lại 50 ký ức gần nhất và đẩy dần từng ký ức cũ ra ngoài sau mỗi lượt (như lượt 51 xoá lượt 1, lượt 52 xoá lượt 2...). Điều này giúp AI chuyển tiếp mượt mà, không gặp tình trạng 'đột ngột mất trí nhớ' ngay sau khi tóm tắt chương." }
        ],
    },
    {
        version: "5.2.23 (Quick Delete)",
        date: "01/05/2026",
        changes: [
            { type: "UI", text: "Tối ưu hóa thao tác xóa thủ công: Gỡ bỏ hộp thoại bắt buộc xác nhận và loại bỏ dòng thông báo hệ thống tốn diện tích, giúp việc dọn dẹp các mục rác trong túi đồ, trạng thái hoặc NPC nhanh và rảnh tay hơn hẳn." }
        ],
    },
    {
        version: "5.2.22 (Collapsible & Pinned Knowledge)",
        date: "26/04/2026",
        changes: [
            { type: "NEW", text: "Thêm chức năng thu gọn (collapse) các mục lớn trong bảng thông tin nhân vật (Trạng thái, Balo đồ, Kỹ năng, NPC...)." },
            { type: "NEW", text: "Thêm biểu tượng ghim (📌). Các mục được ghim sẽ luôn xuất hiện ở đầu danh sách và nằm ngoài phần bị ẩn đi khi thu gọn mục nhập." }
        ],
    },
    {
        version: "5.2.21 (Inventory & Balo Logic)",
        date: "19/04/2026",
        changes: [
            { type: "IMPROVE", text: "Khắc phục lỗi logic túi đồ: AI được huấn luyện lại cách ghi nhận vật phẩm. Việc cầm/mặc/trang bị đồ sẽ KHÔNG tự động xóa đồ khỏi balo nữa. AI cũng hiểu rõ khái niệm bán, tặng, đánh rơi buộc phải gọi hàm xóa đồ." },
            { type: "FIX", text: "Sửa lỗi balo không cập nhật khi người chơi nhận đồ từ \"Lựa chọn khả dụng\" thay vì tự gõ khung chat." }
        ]
    },
    {
        version: "5.2.20 (Markdown UI Fix)",
        date: "19/04/2026",
        changes: [
            { type: "UI", text: "Khắc phục lỗi font chữ: Các đoạn text được AI nhấn mạnh (in đậm) giờ đây sẽ hiển thị màu tím nhạt với kích thước bình thường, không còn bị phóng to hoặc in đậm gây khó chịu." }
        ]
    },
    {
        version: "5.2.19 (Token Quota Fix)",
        date: "19/04/2026",
        changes: [
            { type: "FIX", text: "Khắc phục triệt để lỗi 'The input token count exceeds the maximum number of tokens allowed 1048576' do tràn bộ nhớ ngữ cảnh của AI." },
            { type: "SYSTEM", text: "Tối ưu hóa cấu trúc lưu trữ lịch sử AI: Tự động trích xuất và lưu trữ đoạn văn bản cốt lõi thay vì lưu toàn bộ lượng Prompt khổng lồ mỗi lượt qua hàng trăm lượt chơi. Bản lưu cũ sẽ tự được lược bớt khi load game, giúp tăng tuổi thọ của tệp Save lên gấp nhiều lần." }
        ]
    },
    {
        version: "5.2.18 (Anti-Rush Chapter Goal)",
        date: "19/04/2026",
        changes: [
            { type: "FIX", text: "Điều chỉnh lại cách AI nhìn nhận 'Sườn Cốt Truyện'. AI giờ đây xem đây là mục tiêu của CẢ MỘT CHƯƠNG LỚN, thay vì một nhiệm vụ cần hoàn thành ngay lập tức trong 1 lượt." },
            { type: "IMPROVE", text: "AI sẽ từ từ 'mở đường', rải manh mối và tạo thêm chướng ngại vật/các thử thách nhỏ bên lề để kéo dài thời gian tiếp cận mục tiêu chính một cách tự nhiên như viết tiểu thuyết chậm." }
        ]
    },
    {
        version: "5.2.17 (Logic & Timeline Consistency)",
        date: "18/04/2026",
        changes: [
            { type: "FIX", text: "Thêm lệnh bắt buộc AI phải 'tự vấn nội tâm' (cross-check logic) bên trong thẻ <AI_INTERNAL_THOUGHT> trước khi viết tiếp cốt truyện, nhằm loại bỏ lỗi mâu thuẫn sự kiện và nhân vật trong quá trình Timeskip." },
            { type: "IMPROVE", text: "Siết chặt quy định về tính nhất quán dòng thời gian (Timeline Consistency), buộc AI kiểm tra lại mốc thời gian để tránh lặp lại sự kiện hoặc sinh ra tình tiết phi lý." }
        ],
    },
    {
        version: "5.2.16 (Adaptive Chapter Pacing)",
        date: "16/04/2026",
        changes: [
            { type: "IMPROVE", text: "Tối ưu hóa nhịp độ Sườn Cốt Truyện (Adaptive Pacing): AI giờ đây tự động phân tích bối cảnh để điều chỉnh nhịp độ thay vì lúc nào cũng ép chướng ngại vật." },
            { type: "AI", text: "Nếu lệnh yêu cầu đột nhập, ám sát, đánh boss hoặc người chơi dặn dò 'cần cẩn trọng': AI sẽ tự động kích hoạt chế độ siêu khó, bẻ nhỏ mục tiêu, quẳng lính gác và bẫy rập trên từng bước di chuyển.\nNếu lệnh chỉ là dạo phố, nói chuyện đơn giản: AI sẽ cho qua mượt mà tự nhiên." }
        ],
    },
    {
        version: "5.2.15 (Strict Chapter Pacing)",
        date: "16/04/2026",
        changes: [
            { type: "FIX", text: "Sửa lỗi AI xử lý Sườn Cốt Truyện quá nhanh (Rushing): Áp dụng 'Cảnh Báo Đỏ' ép AI phải chia nhỏ mục tiêu, liên tục tạo ra chướng ngại vật (bẫy rập, lính canh, cửa khóa,...) và kéo dài hành trình qua nhiều lượt chơi. Tuyệt đối cấm AI hoàn thành toàn bộ Sườn Cốt Truyện chỉ trong vài lượt ngắn ngủi." }
        ],
    },
    {
        version: "5.2.14 (Absolute Chapter Goal)",
        date: "14/04/2026",
        changes: [
            { type: "IMPROVE", text: "Nâng cấp Sườn Cốt Truyện (Chapter Goal): Mục tiêu chương giờ đây được coi là 'Lệnh Tối Cao'. AI bị ép buộc phải tạo ra kết quả đúng như bạn ghi trong Sườn Cốt Truyện, kể cả khi phải tạo ra tình huống bất khả kháng (VD: bạn ghi 'bị bắt', AI sẽ cử kẻ thù áp đảo để bắt bạn bằng được)." }
        ],
    },
    {
        version: "5.2.13 (Event Looping Fix)",
        date: "14/04/2026",
        changes: [
            { type: "FIX", text: "Sửa lỗi lặp sự kiện (Event Looping): AI giờ đây bị ép buộc phải kiểm tra các sự kiện đã hoàn thành trong quá khứ trước khi phản hồi. Các sự kiện như talkshow, cuộc thi đã kết thúc sẽ không bao giờ bị lặp lại một cách vô lý vào ngày hôm sau." },
            { type: "IMPROVE", text: "Tăng cường nhận thức thời gian: Củng cố thêm khả năng ghi nhớ mốc thời gian của AI, đặc biệt là phân biệt rõ ràng giữa 'hôm qua' và các sự kiện đã diễn ra từ nhiều ngày trước." }
        ],
    },
    {
        version: "5.2.12 (NPC Logic & Realism)",
        date: "13/04/2026",
        changes: [
            { type: "IMPROVE", text: "Siết chặt logic hành xử của NPC: Cấm tuyệt đối các hành vi thái quá như tự ý đến nhà, ghen tuông vô cớ khi chưa đủ độ thân thiết." },
            { type: "AI", text: "NPC giờ đây sẽ giữ khoảng cách thực tế hơn, có cuộc sống riêng và không xoay quanh người chơi ở giai đoạn đầu." },
        ],
    },
    {
        version: "5.2.11 (Timeline & Timeskip Fix)",
        date: "10/04/2026",
        changes: [
            { type: "FIX", text: "Sửa lỗi lú lẫn thời gian (Timeskip Confusion): AI giờ đây bắt buộc phải tính toán và ghi chú lại thời gian hiện tại trong game một cách tường minh (Explicit Time Tracking) trước khi phản hồi. Điều này giúp loại bỏ hoàn toàn tình trạng NPC gọi sự kiện của 'tuần trước' là 'hôm qua'." }
        ],
    },
    {
        version: "5.2.10 (Pronouns & Dialogue Fix)",
        date: "09/04/2026",
        changes: [
            { type: "FIX", text: "Sửa lỗi xưng hô (Pronouns): AI giờ đây bắt buộc phải tuân thủ nghiêm ngặt cách xưng hô trong tiếng Việt dựa trên tuổi tác, địa vị và mức độ thân thiết. Loại bỏ hoàn toàn các lỗi như học sinh gọi nhau là 'trò', bạn bè cùng tuổi xưng 'anh/em' vô lý, hoặc người lớn xưng hô sai bối cảnh." }
        ],
    },
    {
        version: "5.2.9 (Ultimate Logic & Agency Update)",
        date: "05/04/2026",
        changes: [
            { type: "IMPROVE", text: "Quyền lực người chơi (Player Agency): AI bị cấm tuyệt đối việc miêu tả cảm xúc nội tâm, nhịp tim hay suy nghĩ của người chơi. Trải nghiệm nhập vai giờ đây hoàn toàn thuộc về bạn." },
            { type: "IMPROVE", text: "Nhân quả & Thực tế (Strict Causality): Loại bỏ hoàn toàn 'Plot Armor'. Mọi hành động đều dẫn đến hậu quả logic tương xứng. Lời thoại NPC được tinh chỉnh để tự nhiên và đời thực hơn." },
            { type: "FIX", text: "Sửa lỗi AI tự ý hành động: AI không còn tự ý tạo ra các hành động (như tự động nhắn tin, tự động trả lời) thay cho người chơi." },
            { type: "FIX", text: "Sửa lỗi Timeline: Thêm cơ chế kiểm tra chéo (Cross-check) để đảm bảo các mốc thời gian và sự kiện khớp nhau tuyệt đối, tránh tình trạng 'lộn thời gian tùm lum'." }
        ],
    },
    {
        version: "5.2.8 (Logic & Pacing Improvements)",
        date: "05/04/2026",
        changes: [
            { type: "IMPROVE", text: "Cải thiện nhịp độ cốt truyện (Pacing): AI giờ đây sẽ xử lý các bí mật, thân phận ẩn của người chơi một cách chậm rãi và logic hơn (Slow Burn). Tránh việc NPC phát hiện bí mật quá nhanh chỉ qua vài manh mối nhỏ." },
            { type: "FIX", text: "Sửa lỗi NPC suy luận thiếu logic: NPC không còn khả năng 'biết tuốt' hay suy luận như thần. Mọi sự nghi ngờ sẽ được xây dựng từ từ dựa trên bằng chứng thực tế, tránh các tình huống ép buộc drama (Cliché)." },
        ],
    },
    {
        version: "5.2.7 (Fix Random Events)",
        date: "01/04/2026",
        changes: [
            { type: "FIX", text: "Sửa lỗi AI vẫn tự động tạo ra nhiều sự kiện ngẫu nhiên (thời tiết, tai nạn, khách không mời) ngay cả khi người chơi đã chọn 'Thấp' hoặc 'Tắt'." },
            { type: "IMPROVE", text: "Tối ưu hóa bộ quy tắc hệ thống: AI giờ đây sẽ tuân thủ nghiêm ngặt cài đặt Tần Suất Sự Kiện của người chơi. Chế độ 'Tắt' sẽ hoàn toàn tập trung vào hành động của người chơi mà không tự vẽ thêm rắc rối." },
        ],
    },
    {
        version: "5.2.6 (NPC Drama & Difficulty)",
        date: "30/03/2026",
        changes: [
            { type: "AI", text: "Tăng độ khó khi chinh phục NPC: NPC không còn dễ dãi, cần nhiều thời gian và thử thách hơn để xây dựng mối quan hệ." },
            { type: "IMPROVE", text: "Thêm yếu tố Drama: NPC có suy nghĩ, mục tiêu riêng, có thể nghi ngờ, từ chối hoặc tạo ra các tình huống hiểu lầm, mâu thuẫn." },
            { type: "FIX", text: "Phản ứng tâm lý phức tạp hơn: NPC có rào cản tâm lý, không còn tình trạng 'vừa gặp đã yêu' hay sẵn sàng hy sinh vô lý." },
        ],
    },
    {
        version: "5.2.5 (Smart Realism NSFW)",
        date: "30/08/2025",
        changes: [
            { type: "AI", text: "Điều chỉnh chế độ 'Không kiểm duyệt': Bình thường sẽ hoàn toàn nghiêm túc như chế độ thường." },
            { type: "AI", text: "Cơ chế Trigger: Chỉ kích hoạt cảnh nóng khi người chơi CHỦ ĐỘNG (tán tỉnh, ra lệnh, đụng chạm)." },
            { type: "IMPROVE", text: "Quy tắc 'Slow Burn & No Skip': Khi đã vào cảnh nóng, AI bị cấm tuyệt đối tua nhanh (time-skip). Phải miêu tả từng bước một cách chi tiết." },
        ],
    },
    {
        version: "5.2.4 (Fix Logic Uncensored)",
        date: "30/08/2025",
        changes: [
            { type: "AI", text: "Sửa lỗi AI hay 'lướt qua' (Time-skip) các cảnh nhạy cảm trong chế độ Uncensored." },
            { type: "IMPROVE", text: "Tối ưu hóa prompt: Yêu cầu AI miêu tả chi tiết từng hành động, cảm giác, cử chỉ thay vì tóm tắt kiểu 'sau một hồi...'." },
            { type: "FIX", text: "Tăng tính nhập vai (Roleplay): AI sẽ phản hồi táo bạo và chi tiết hơn khi người chơi đã chủ động dẫn dắt." },
        ],
    },
    {
        version: "5.2.3 (Cải Thiện Logic & Hiện Thực)",
        date: "29/08/2025",
        changes: [
            { type: "IMPROVE", text: "Siết chặt quy tắc Logic & Hậu cần: Ngăn chặn tình trạng quân địch 'spawn' vô lý, 50 vạn quân chết là hết, cần thời gian hồi phục." },
            { type: "AI", text: "Trí tuệ NPC: Tướng lĩnh biết sợ và rút lui khi thua đậm. NPC dân thường (bán mì, nông dân) sẽ không còn biết bí mật quốc gia hay chuyện cung đình." },
            { type: "FIX", text: "Khắc phục lỗi quân địch dịch chuyển tức thời: Hành quân phải tốn thời gian di chuyển hợp lý." },
        ],
    },
    {
        version: "5.2.2 (Tinh chỉnh Uncensored)",
        date: "28/08/2025",
        changes: [
            { type: "AI", text: "Điều chỉnh chế độ 'Uncensored' thành 'Cân Bằng & Phản Hồi': AI sẽ không tự ý khởi xướng nội dung NSFW trong tình huống bình thường." },
            { type: "IMPROVE", text: "AI chỉ được phép 'bung lụa' (không che) khi người chơi chủ động dẫn dắt hoặc cốt truyện bắt buộc." },
            { type: "FIX", text: "Ngăn chặn tình trạng NPC trở nên quá gợi dục một cách vô lý." },
        ],
    },
    {
        version: "5.2.1 (Fix Uncensored Cut)",
        date: "27/08/2025",
        changes: [
            { type: "AI", text: "Điều chỉnh mạnh mẽ chế độ 'Uncensored': Loại bỏ hoàn toàn việc AI lướt qua (fade-to-black) các cảnh nhạy cảm." },
            { type: "IMPROVE", text: "Cấm AI dùng từ ngữ ẩn dụ để che đậy. AI giờ sẽ miêu tả trực diện, chi tiết nhưng vẫn giữ văn phong tiểu thuyết (không thô tục như Hardcore)." },
        ],
    },
    {
        version: "5.1.3 (Fix NSFW Interruption)",
        date: "26/08/2025",
        changes: [
            { type: "AI", text: "Cải thiện logic 'Thế Giới Sống': AI sẽ không chèn sự kiện ngẫu nhiên vô duyên khi đang trong cảnh cao trào (chiến đấu, NSFW, hội thoại quan trọng)." },
            { type: "IMPROVE", text: "Bảo vệ mạch cảm xúc: Cảnh nóng và cảnh hành động sẽ được diễn ra trọn vẹn mà không bị gián đoạn bởi các yếu tố bên ngoài." },
        ],
    },
    {
        version: "5.1.2 (Chế độ Hardcore)",
        date: "26/08/2025",
        changes: [
            { type: "NEW", text: "Thêm tùy chọn Chế Độ Nội Dung 18+ (NSFW Mode) với 3 mức độ." },
            { type: "AI", text: "Chế độ 'Hardcore': Quay lại phong cách cũ, cực kỳ chi tiết, thô tục và cấm tua nhanh (Time-skip)." },
            { type: "AI", text: "Chế độ 'Uncensored': Cân bằng, tự nhiên, tập trung vào mạch truyện." },
            { type: "UI", text: "Thay thế hộp kiểm 'Cho phép NSFW' bằng menu thả xuống để chọn chế độ rõ ràng hơn." },
        ],
    },
    {
        version: "5.1.1 (Cân Bằng NSFW)",
        date: "26/08/2025",
        changes: [
            { type: "AI", text: "Điều chỉnh prompt NSFW: Giảm bớt độ 'Hardcore' cưỡng ép. AI giờ đây sẽ viết cảnh nóng/bạo lực tự nhiên hơn, bám sát mạch truyện thay vì cố nhồi nhét từ ngữ thô tục." },
            { type: "IMPROVE", text: "Tối ưu hóa hướng dẫn hệ thống để AI tập trung vào chất lượng văn phong hơn là số lượng từ ngữ nhạy cảm." },
        ],
    },
    {
        version: "5.1.0 (Thế Giới Sống - Living World)",
        date: "25/08/2025",
        changes: [
            { type: "AI", text: "Nâng cấp AI: Thế giới giờ đây tự vận hành ngay cả khi bạn không làm gì." },
            { type: "NEW", text: "Sự Kiện Ngẫu Nhiên: Thời tiết thay đổi, NPC lạ xuất hiện, hoặc tai nạn bất ngờ có thể xảy ra bất cứ lúc nào." },
            { type: "IMPROVE", text: "NPC Chủ Động: NPC sẽ tự động bắt chuyện, chế giễu, giao thương hoặc tấn công bạn trước thay vì đứng chờ." },
            { type: "IMPROVE", text: "Hệ thống Phục Kích: Tại các khu vực nguy hiểm, kẻ địch sẽ tấn công ngay lập tức để tăng độ kịch tính." },
        ],
    },
];
