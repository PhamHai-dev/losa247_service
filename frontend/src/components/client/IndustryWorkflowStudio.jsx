import { useEffect, useRef, useState } from 'react';
import { Bot, BrainCircuit, Check, CircleDollarSign, Clock3, ExternalLink, FileImage, FileText, History, MessageCircle, PackageCheck, Send, Sparkles, Tags, Truck, UserRoundCheck, Webhook, Zap } from 'lucide-react';
import '../../styles/client/industry-workflow-studio.css';
const BRANDS = { kiot: ['K', 'KiotViet', 'Kiểm tra tồn kho', '#087fdb', '/images/solutions/solution_10_section2_logoKiotViet.jpg'], nhanh: ['N', 'Nhanh.vn', 'Đồng bộ đơn hàng', '#ef4d35'], ghn: ['GHN', 'Giao Hàng Nhanh', 'Tính phí vận chuyển', '#f16622', '/images/solutions/solution_11_section2_logoGiaoHangNhanh.jpg'], zalo: ['Z', 'Zalo OA', 'Chuyển nhân viên', '#0877df', '/images/solutions/solution_16_section2_logoZaloOA.jpg'], sheet: ['G', 'Google Sheets', 'Đọc và ghi dữ liệu', '#19a463', '/images/solutions/solution_13_section2_logoGGSheet.jpg'], crm: ['CRM', 'CRM khách hàng', 'Đọc lịch sử & gán tag', '#7c5ce7'], invoice: ['HĐ', 'Hóa đơn điện tử', 'Tạo hóa đơn VAT', '#dd3f57', '/images/solutions/solution_12_section2_logoHoaDon.png'], api: ['</>', 'API doanh nghiệp', 'Kết nối dữ liệu riêng', '#12254b', '/images/solutions/solution_14_section2_logoAPI.jpg'], calendar: ['L', 'Lịch làm việc', 'Kiểm tra lịch trống', '#6b5de7', '/images/solutions/solution_15_section2_logoLich.png'], maps: ['M', 'Google Maps', 'Tính quãng đường', '#2a9d59', '/images/solutions/solution_17_section2_logoGGMap.png'] };
const BRAND_TASKS_EN = { kiot: 'Check inventory', nhanh: 'Sync orders', ghn: 'Calculate shipping', zalo: 'Transfer to staff', sheet: 'Read and write data', crm: 'Read history & assign tags', invoice: 'Create VAT invoice', api: 'Connect private data', calendar: 'Check availability', maps: 'Calculate distance' };
const common = {
    retail: { messengerUrl: 'https://www.facebook.com/BetyShop.ThoitrangHanQuoc', accent: '#1677ff', desc: 'AI kiểm tra sản phẩm, tồn kho, phí vận chuyển và dữ liệu khách hàng trước khi phản hồi.', person: ['Thanh Độ', 'TĐ', '/images/solutions/solution_6_section2_avatarDo.webp'], channel: 'Messenger', chat: [['user', 'Chào shop, bên mình cần mua máy lọc không khí cho văn phòng khoảng 60m². Công ty muốn loại chạy êm vì khu vực làm việc khá yên tĩnh.'], ['bot', 'Chào anh Độ. Em thấy lần trước công ty mình từng quan tâm dòng A2 Pro. Anh dự kiến cần bao nhiêu máy, giao tới khu vực nào và có cần xuất hóa đơn VAT không ạ?'], ['user', 'Bên anh cần 20 máy, giao tới Quận 7 trong tuần này. Nhờ em kiểm tra tồn kho, giá doanh nghiệp, phí vận chuyển, xuất báo giá VAT và lưu thông tin để bạn phụ trách liên hệ chốt đơn nhé.'], ['bot', 'Em đang đối chiếu tồn kho trên KiotViet, bảng giá doanh nghiệp trên Google Sheets và phí giao hàng từ GHN. Anh chờ em một chút nhé.'], ['bot', 'Kho hiện còn 28 máy A2 Pro, đủ số lượng anh cần. Giá doanh nghiệp là 4.690.000đ/máy; phí giao Quận 7 là 86.000đ và có thể giao trong 1–2 ngày.'], ['user', 'Thông tin ổn rồi. Em gửi hình ảnh thực tế và chuyển đầy đủ nội dung cho bạn phụ trách giúp anh nhé.'], ['bot', 'Em đã gửi bộ ảnh sản phẩm và báo giá VAT ngay trong hội thoại. Thông tin đơn hàng cũng đã được lưu để bộ phận phụ trách hỗ trợ anh liền mạch.']], apps: ['crm', 'kiot', 'sheet', 'ghn', 'invoice', 'zalo'], facts: ['Đã cập nhật hồ sơ', 'Còn 28 máy', 'Giá 4.690.000đ', 'Phí ship 86.000đ', 'Báo giá đã tạo', 'Đã chuyển sales'], actions: [[History, 'Đọc lịch sử chat', 'Đã nhận diện khách cũ'], [Tags, 'Gán tag khách hàng', 'Doanh nghiệp · Lead nóng'], [PackageCheck, 'Kiểm tra tồn kho', 'Còn 28 máy A2 Pro'], [Truck, 'Tính phí ship', 'GHN · 86.000đ'], [FileText, 'Xuất báo giá VAT', 'PDF đã sẵn sàng'], [FileImage, 'Gửi hình ảnh', 'Đã gửi 6 ảnh sản phẩm'], [UserRoundCheck, 'Chuyển CTV qua Zalo', 'Kèm toàn bộ ngữ cảnh'], [Clock3, 'Tạo lịch follow-up', 'Sau 24 giờ']] },
    education: { messengerUrl: 'https://www.facebook.com/tienghancungthayminh', accent: '#6d5dfc', desc: 'AI đọc mục tiêu học tập, đối chiếu lịch lớp và tự động chăm sóc hồ sơ tuyển sinh.', person: ['Sơn Tùng', 'ST', '/images/solutions/solution_7_section2_avatarSonTung.jpg'], channel: 'Website Chat', chat: [['user', 'Em muốn học tiếng Anh để giao tiếp với khách hàng và thuyết trình trong công việc, nhưng chỉ sắp xếp được thời gian buổi tối.'], ['bot', 'Chào Tùng. Mình đã đọc lịch sử và thấy bạn từng làm bài kiểm tra trình độ cơ bản. Bạn muốn bắt đầu từ tháng tới và có thể học mấy buổi mỗi tuần?'], ['user', 'Em học được ba buổi, ưu tiên thứ 2, 4, 6 sau 19 giờ. Nhờ mình kiểm tra lớp còn chỗ, học phí, gửi đề cương, giữ lịch đánh giá đầu vào tối mai và cập nhật hồ sơ giúp em.'], ['bot', 'Mình đang kiểm tra lịch lớp, bảng học phí trên Google Sheets và hồ sơ tuyển sinh để chọn lộ trình không trùng lịch của bạn.'], ['bot', 'Lớp Giao tiếp công sở K24 còn 4 chỗ, học 19:30 thứ 2, 4, 6 từ ngày 08/09. Học phí trọn khóa là 6.800.000đ.'], ['user', 'Lịch và học phí phù hợp rồi, bạn xác nhận giúp em nhé.'], ['bot', 'Mình đã gửi đề cương PDF, giữ lịch đánh giá lúc 19:30 ngày mai và tạo nhắc lịch qua Zalo. Hồ sơ của bạn đã được cập nhật đầy đủ.']], apps: ['crm', 'api', 'calendar', 'sheet', 'invoice', 'zalo'], facts: ['Đã cập nhật hồ sơ', 'Trình độ A2', 'Lớp K24 · 4 chỗ', 'Học phí 6.800.000đ', 'Phiếu đã tạo', 'Đã gửi nhắc lịch'], actions: [[History, 'Đọc lịch sử chat', 'Đã tìm thấy bài kiểm tra'], [Tags, 'Gán tag học viên', 'Giao tiếp · Học tối'], [Clock3, 'Kiểm tra lịch lớp', 'Còn 4 vị trí'], [FileText, 'Gửi tài liệu', 'Đề cương K24'], [CircleDollarSign, 'Tạo thông tin học phí', '6.800.000đ'], [UserRoundCheck, 'Chuyển tư vấn qua Zalo', 'Kèm hồ sơ học viên'], [Clock3, 'Nhắc lịch đánh giá', '19:30 ngày mai'], [Zap, 'Follow-up nhập học', 'Tự động sau 2 ngày']] },
    health: { messengerUrl: 'https://www.facebook.com/YogavaChualanh', accent: '#079a89', desc: 'AI tiếp nhận an toàn, tra lịch cơ sở và hỗ trợ khách hàng xuyên suốt trước và sau cuộc hẹn.', person: ['Thùy Linh', 'TL', '/images/solutions/solution_8_section2_avatarThuyLinh.jpg'], channel: 'Zalo', chat: [['user', 'Tôi muốn đặt lịch kiểm tra sức khỏe tổng quát vào chiều thứ Sáu, ưu tiên cơ sở gần Quận 7.'], ['bot', 'Chào chị Linh. Em có thể hỗ trợ thông tin dịch vụ và lịch hẹn. Chị có thể đến sau 15 giờ và muốn khám gói tiêu chuẩn hay chuyên sâu ạ?'], ['user', 'Khoảng 15:30 là phù hợp. Tôi chọn gói tiêu chuẩn; nhờ em kiểm tra lịch, hướng dẫn nhịn ăn, đặt hẹn, gửi địa chỉ và thiết lập nhắc lịch qua Zalo giúp tôi.'], ['bot', 'Em đang kiểm tra lịch trống của cơ sở, thông tin gói khám và hướng dẫn chuẩn bị đã được phê duyệt.'], ['bot', 'Cơ sở Nguyễn Thị Thập còn lịch lúc 15:30 thứ Sáu. Với gói tiêu chuẩn, chị nên nhịn ăn 8 giờ và chỉ uống nước lọc trước khi lấy mẫu.'], ['user', 'Khung giờ và hướng dẫn đều phù hợp, em xác nhận lịch giúp tôi nhé.'], ['bot', 'Lịch đã được giữ. Em đã gửi bản đồ, hướng dẫn chuẩn bị và thiết lập nhắc hẹn qua Zalo trước 24 giờ.']], apps: ['crm', 'sheet', 'maps', 'calendar', 'api', 'zalo'], facts: ['Đã lưu lịch hẹn', 'Đã đọc hướng dẫn', 'Cơ sở cách 3 km', 'Lịch 15:30', 'Đã tạo mã hẹn', 'Đã gửi nhắc hẹn'], actions: [[History, 'Đọc lịch sử tiếp nhận', 'Không yêu cầu hỏi lại'], [Tags, 'Phân loại nhu cầu', 'Khám tổng quát'], [Clock3, 'Tra lịch cơ sở', '15:30 thứ Sáu'], [FileText, 'Gửi hướng dẫn', 'Chuẩn bị trước khám'], [FileImage, 'Gửi bản đồ', 'Cơ sở Nguyễn Thị Thập'], [UserRoundCheck, 'Chuyển bộ phận tiếp nhận', 'Kèm đầy đủ ngữ cảnh'], [Clock3, 'Nhắc lịch tự động', 'Trước 24 giờ'], [Zap, 'Follow-up sau dịch vụ', 'Thu thập phản hồi']] },
    b2b: { messengerUrl: 'https://www.facebook.com/NetDecor.PhongcachsongnguoiViet', accent: '#b972bcff', desc: 'AI tiếp nhận yêu cầu dịch vụ, tính chi phí, kiểm tra lịch đội ngũ và điều phối công việc tự động.', person: ['Anh Quang', 'AQ', '/images/solutions/solution_9_section2_avatarAnhQuang.jpg'], channel: 'Messenger', chat: [['user', 'Công ty tôi cần dịch vụ vệ sinh văn phòng định kỳ tại Quận 3. Diện tích khoảng 450m², muốn làm ngoài giờ hành chính.'], ['bot', 'Chào anh Quang. Anh muốn thực hiện mấy buổi mỗi tuần, sau mấy giờ và văn phòng có khu vực kính hoặc thảm cần xử lý riêng không ạ?'], ['user', 'Ba buổi mỗi tuần sau 18:30, có 80m² thảm và hai mặt kính phía trước. Nhờ em tính chi phí, kiểm tra lịch đội phù hợp, quãng đường, tạo báo giá và xếp lịch khảo sát 16 giờ chiều mai.'], ['bot', 'Em đang đối chiếu bảng giá dịch vụ, quãng đường di chuyển và lịch các đội vệ sinh có thiết bị xử lý thảm.'], ['bot', 'Đội DV-03 còn lịch thứ 2, 4, 6 sau 18:30. Gói phù hợp có chi phí dự kiến 12.600.000đ/tháng.'], ['user', 'Phương án phù hợp rồi, em xác nhận và chuyển đầy đủ thông tin cho điều phối viên giúp tôi nhé.'], ['bot', 'Em đã gửi báo giá, lưu lịch khảo sát 16 giờ chiều mai và chuyển đầy đủ yêu cầu cùng lịch sử trao đổi cho điều phối viên qua Zalo.']], apps: ['crm', 'sheet', 'maps', 'calendar', 'api', 'zalo'], facts: ['Cơ hội · Chờ khảo sát', '12.600.000đ/tháng', 'Không phụ phí', 'Đội DV-03 trống', 'Đã tạo phiếu', 'Đã chuyển điều phối'], actions: [[History, 'Đọc lịch sử chat', 'Tóm tắt đủ yêu cầu'], [Tags, 'Gán tag cơ hội', 'Dịch vụ định kỳ · Lead nóng'], [CircleDollarSign, 'Tính phí dịch vụ', '12.600.000đ/tháng'], [Clock3, 'Kiểm tra lịch đội ngũ', 'Đội DV-03 sẵn sàng'], [FileText, 'Tạo báo giá', 'Đã gửi PDF chi tiết'], [FileImage, 'Gửi hình ảnh dịch vụ', 'Quy trình & thiết bị'], [UserRoundCheck, 'Chuyển điều phối qua Zalo', 'Kèm toàn bộ ngữ cảnh'], [Zap, 'Follow-up khảo sát', '16:00 ngày mai']] }
};
const commonEn = {
    retail: { ...common.retail, desc: 'AI checks products, inventory, shipping fees and customer data before responding.', chat: [['user', 'Hi, we need air purifiers for a 60m² office. We prefer a quiet model because the workspace is very calm.'], ['bot', 'Hello Mr. Độ. I see your company previously considered the A2 Pro. How many units do you need, where should we deliver them, and do you require a VAT invoice?'], ['user', 'We need 20 units delivered to District 7 this week. Please check inventory, business pricing and shipping, create a VAT quotation, and save the details for a representative to finalize the order.'], ['bot', 'I am checking KiotViet inventory, the business price list in Google Sheets and the GHN delivery fee. One moment, please.'], ['bot', 'There are 28 A2 Pro units in stock, enough for your order. The business price is 4,690,000 VND per unit; delivery to District 7 is 86,000 VND and takes 1–2 days.'], ['user', 'Everything looks good. Please send the actual product photos and pass the full context to the representative.'], ['bot', 'I have sent the product photos and VAT quotation in this conversation. The order information has also been saved so our representative can assist you seamlessly.']], facts: ['28 units in stock', 'Price list retrieved', 'Shipping: 86,000 VND', 'Business customer', 'VAT quote ready', 'API 200 OK'], actions: [[History, 'Read chat history', 'Returning customer identified'], [Tags, 'Assign customer tags', 'Business · Hot lead'], [PackageCheck, 'Check inventory', '28 A2 Pro units available'], [Truck, 'Calculate shipping', 'GHN · 86,000 VND'], [FileText, 'Generate VAT quote', 'PDF ready'], [FileImage, 'Send product images', '6 images sent'], [UserRoundCheck, 'Transfer to staff via Zalo', 'Full context included'], [Clock3, 'Schedule follow-up', 'After 24 hours']] },
    education: { ...common.education, desc: 'AI understands learning goals, checks class schedules and automatically nurtures enrollment profiles.', chat: [['user', 'I want to improve my English for customer conversations and presentations at work, but I am only available in the evening.'], ['bot', 'Hi Tùng. I found that you previously completed a basic placement test. Would you like to start next month, and how many sessions can you attend each week?'], ['user', 'I can attend three evenings a week, preferably Monday, Wednesday and Friday after 7 PM. Please check available classes and tuition, send the syllabus, reserve an assessment for tomorrow evening, and update my profile.'], ['bot', 'I am checking class schedules, the tuition table in Google Sheets and your enrollment profile to find a suitable program without schedule conflicts.'], ['bot', 'The K24 Business Communication class has 4 seats remaining. It meets at 7:30 PM on Monday, Wednesday and Friday starting September 8. Full-course tuition is 6,800,000 VND.'], ['user', 'The schedule and tuition work for me. Please confirm everything.'], ['bot', 'I have sent the PDF syllabus, reserved your assessment for 7:30 PM tomorrow and created a Zalo reminder. Your profile is now fully updated.']], facts: ['Profile retrieved', '4 seats available', '7:30 PM schedule', 'Reminder created', 'API 200 OK', 'Tuition recorded'], actions: [[History, 'Read chat history', 'Placement test found'], [Tags, 'Assign learner tags', 'Communication · Evening class'], [Clock3, 'Check class schedule', '4 seats available'], [FileText, 'Send materials', 'K24 syllabus'], [CircleDollarSign, 'Create tuition details', '6,800,000 VND'], [UserRoundCheck, 'Transfer advisor via Zalo', 'Learner profile included'], [Clock3, 'Schedule assessment reminder', '7:30 PM tomorrow'], [Zap, 'Enrollment follow-up', 'Automatic after 2 days']] },
    health: { ...common.health, desc: 'AI safely handles requests, checks facility schedules and supports customers before and after appointments.', chat: [['user', 'I would like to book a general health check on Friday afternoon, preferably at a facility near District 7.'], ['bot', 'Hello Ms. Linh. I can help with service information and scheduling. Are you available after 3 PM, and would you prefer the standard or comprehensive package?'], ['user', 'Around 3:30 PM works. I prefer the standard package; please check availability and fasting guidance, book the appointment, send the address, and set a Zalo reminder.'], ['bot', 'I am checking facility availability, package details and the approved preparation guidelines.'], ['bot', 'The Nguyễn Thị Thập facility has an opening at 3:30 PM on Friday. For the standard package, you should fast for 8 hours and drink only plain water before sample collection.'], ['user', 'The time and instructions work for me. Please confirm the appointment.'], ['bot', 'Your appointment has been reserved. I have sent the map and preparation guide, and scheduled a Zalo reminder 24 hours beforehand.']], facts: ['3:30 PM available', 'Profile retrieved', 'Appointment saved', 'Zalo sent', 'Location found', 'API 200 OK'], actions: [[History, 'Read intake history', 'No repeated questions needed'], [Tags, 'Classify request', 'General health check'], [Clock3, 'Check facility schedule', '3:30 PM Friday'], [FileText, 'Send instructions', 'Pre-examination preparation'], [FileImage, 'Send map', 'Nguyễn Thị Thập facility'], [UserRoundCheck, 'Transfer to intake team', 'Full context included'], [Clock3, 'Schedule reminder', '24 hours beforehand'], [Zap, 'Post-service follow-up', 'Collect feedback']] },
    b2b: { ...common.b2b, desc: 'AI receives service requests, calculates costs, checks team availability and automatically coordinates operations.', chat: [['user', 'Our company needs recurring office cleaning in District 3. The office is about 450m², and we would like the work done outside business hours.'], ['bot', 'Hello Mr. Quang. How many sessions would you like each week, after what time, and are there any glass or carpet areas requiring special treatment?'], ['user', 'Three sessions per week after 6:30 PM, with 80m² of carpet and two front glass panels. Please calculate the cost, check a suitable team and travel distance, prepare a quote, and schedule a 4 PM site survey tomorrow.'], ['bot', 'I am checking the service price list, travel distance and availability of cleaning teams equipped for carpet treatment.'], ['bot', 'Team DV-03 is available on Monday, Wednesday and Friday after 6:30 PM. The estimated package price is 12,600,000 VND per month.'], ['user', 'The plan works for us. Please confirm it and pass the full context to the coordinator.'], ['bot', 'I have sent the quotation, scheduled the survey for 4 PM tomorrow and transferred the full request and conversation history to the coordinator via Zalo.']], facts: ['Price list retrieved', 'Team DV-03 available', 'Distance calculated', 'Hot lead', 'Transferred via Zalo', 'API 200 OK'], actions: [[History, 'Read chat history', 'Requirements summarized'], [Tags, 'Assign opportunity tags', 'Recurring service · Hot lead'], [CircleDollarSign, 'Calculate service fee', '12,600,000 VND/month'], [Clock3, 'Check team availability', 'Team DV-03 available'], [FileText, 'Generate quotation', 'Detailed PDF sent'], [FileImage, 'Send service images', 'Process & equipment'], [UserRoundCheck, 'Transfer coordinator via Zalo', 'Full context included'], [Zap, 'Survey follow-up', '4 PM tomorrow']] }
};
const DEMO_VI = {
    retail: [
        { type: 'message', who: 'user', text: 'Chào em, bên anh đang cần máy lọc không khí cho văn phòng.' },
        { type: 'message', who: 'user', text: 'Khoảng 20 máy, phòng tầm 60m². Quan trọng nhất là chạy êm vì nhân viên ngồi làm việc cả ngày.' },
        { type: 'tool', app: 'crm', text: 'Đang kiểm tra lịch sử trao đổi của anh Độ…', mode: 'đọc' },
        { type: 'message', who: 'bot', text: 'Em thấy trước đây bên mình từng quan tâm dòng **A2 Pro**.' },
        { type: 'message', who: 'bot', text: 'Dòng này khá phù hợp văn phòng 60m² và ưu điểm là độ ồn thấp.' },
        { type: 'message', who: 'bot', text: 'Anh dự kiến cần hàng trong thời gian nào để em kiểm tra luôn tồn kho?' },
        { type: 'message', who: 'user', text: 'Trong tuần này nhé.' },
        { type: 'message', who: 'user', text: 'Nếu lấy 20 máy thì kiểm tra giúp anh giá doanh nghiệp luôn, bên anh cần xuất VAT.' },
        { type: 'tool', app: 'kiot', text: 'Đang kiểm tra tồn kho A2 Pro…', mode: '' },
        { type: 'message', who: 'bot', text: 'Kho hiện còn **28 máy A2 Pro**, nên đủ giao 20 máy trong tuần này.' },
        { type: 'message', who: 'bot', text: 'Để em kiểm tra luôn mức giá áp dụng cho đơn doanh nghiệp của anh.' },
        { type: 'tool', app: 'sheet', text: 'Đang kiểm tra chính sách giá doanh nghiệp…', mode: '' },
        { type: 'message', who: 'bot', text: 'Với số lượng **20 máy**, giá hiện tại là **4.690.000đ/máy**.' },
        { type: 'message', who: 'bot', text: 'Tổng tiền hàng tạm tính là **93.800.000đ**, chưa gồm phí giao.' },
        { type: 'message', who: 'user', text: 'Giá này ổn.' },
        { type: 'message', who: 'user', text: 'Giao Quận 7 thì mất bao lâu và phí khoảng bao nhiêu em?' },
        { type: 'tool', app: 'ghn', text: 'Đang kiểm tra phí và thời gian giao đến Quận 7…', mode: '' },
        { type: 'message', who: 'bot', text: 'Phí giao dự kiến **86.000đ**.' },
        { type: 'message', who: 'bot', text: 'Thời gian nhận hàng khoảng **1–2 ngày**.' },
        { type: 'message', who: 'bot', text: 'Nếu anh đồng ý mức này, em tạo luôn báo giá VAT để anh gửi kế toán duyệt nhé?' },
        { type: 'message', who: 'user', text: 'Ok em.' },
        { type: 'message', who: 'user', text: 'Làm báo giá rồi chuyển giúp anh cho bạn sales phụ trách luôn.' },
        { type: 'tool', app: 'invoice', text: 'Đang tạo báo giá VAT…', mode: '' },
        { type: 'message', who: 'bot', text: 'Báo giá đã tạo xong rồi anh.' },
        { type: 'message', who: 'bot', text: 'Em lưu lại toàn bộ nhu cầu và báo giá này vào hồ sơ để lần sau mình không phải trao đổi lại từ đầu.' },
        { type: 'tool', app: 'crm', text: 'Đang lưu báo giá và cập nhật trạng thái cơ hội…', mode: 'ghi' },
        { type: 'message', who: 'bot', text: 'Hồ sơ đã được cập nhật trạng thái **Đã gửi báo giá**.' },
        { type: 'message', who: 'bot', text: 'Em cũng đặt lịch chăm sóc lại sau **24 giờ** để bên mình không bỏ sót tiến độ.' },
        { type: 'tool', app: 'zalo', text: 'Đang chuyển hồ sơ cho tư vấn viên…', mode: '' },

    ],
    education: [
        { type: 'message', who: 'user', text: 'Mình muốn học tiếng Anh giao tiếp để dùng trong công việc.' },
        { type: 'message', who: 'user', text: 'Nhưng mình chỉ rảnh tối thứ 2, 4, 6 sau 7 giờ thôi.' },
        { type: 'message', who: 'bot', text: 'Được nhé.' },
        { type: 'message', who: 'bot', text: 'Bạn muốn bắt đầu **tháng này hay tháng sau**?' },
        { type: 'message', who: 'bot', text: 'Nếu trước đây bạn đã làm bài test trên website thì mình cũng có thể kiểm tra luôn, không cần làm lại.' },
        { type: 'message', who: 'user', text: 'Mình muốn học tháng sau.' },
        { type: 'message', who: 'user', text: 'Tuần trước hình như mình có làm một bài kiểm tra trên web rồi.' },
        { type: 'tool', app: 'crm', text: 'Đang tìm hồ sơ của bạn…', mode: 'đọc' },
        { type: 'message', who: 'bot', text: 'Mình đã tìm thấy hồ sơ.' },
        { type: 'message', who: 'bot', text: 'Có ghi nhận một bài kiểm tra đầu vào gần đây, để mình lấy kết quả nhé.' },
        { type: 'tool', app: 'api', text: 'Đang kiểm tra kết quả đầu vào…', mode: '' },
        { type: 'message', who: 'bot', text: 'Kết quả hiện tại của bạn là **A2**.' },
        { type: 'message', who: 'bot', text: 'Với mục tiêu giao tiếp trong công việc, mình nghĩ lộ trình **Giao tiếp công sở** sẽ hợp hơn học lại từ đầu.' },
        { type: 'message', who: 'bot', text: 'Để mình tìm lớp khớp với lịch thứ 2, 4, 6 sau 19:00 của bạn.' },
        { type: 'tool', app: 'calendar', text: 'Đang tìm lớp phù hợp…', mode: '' },
        { type: 'message', who: 'bot', text: 'Có lớp **K24**, học lúc **19:30 thứ 2, 4, 6**.' },
        { type: 'message', who: 'bot', text: 'Lớp khai giảng ngày **08/10** và hiện còn **4 chỗ**.' },
        { type: 'message', who: 'user', text: 'Lịch này được đó.' },
        { type: 'message', who: 'user', text: 'Học phí bao nhiêu và học trong bao lâu vậy?' },
        { type: 'tool', app: 'sheet', text: 'Đang kiểm tra học phí và chương trình K24…', mode: '' },
        { type: 'message', who: 'bot', text: 'Khóa học kéo dài **12 tuần**.' },
        { type: 'message', who: 'bot', text: 'Học phí trọn khóa là **6.800.000đ**.' },
        { type: 'message', who: 'bot', text: 'Hiện trung tâm còn một buổi đánh giá trực tiếp lúc **19:30 tối mai**. Bạn muốn mình giữ lịch luôn không?' },
        { type: 'message', who: 'user', text: 'Có nhé.' },
        { type: 'message', who: 'user', text: 'Gửi thông tin và nhắc lịch qua Zalo giúp mình luôn.' },
        { type: 'tool', app: 'invoice', text: 'Đang tạo phiếu thông tin học phí…', mode: '' },
        { type: 'tool', app: 'crm', text: 'Đang lưu lớp quan tâm và lịch đánh giá…', mode: 'ghi' },
        { type: 'message', who: 'bot', text: 'Mình đã lưu lớp **K24** vào hồ sơ của bạn.' },
        { type: 'message', who: 'bot', text: 'Trạng thái hiện tại là **Đã tư vấn**, đồng thời lịch đánh giá tối mai cũng đã được ghi nhận.' },
        { type: 'tool', app: 'zalo', text: 'Đang gửi xác nhận và thiết lập nhắc lịch…', mode: '' },
        { type: 'message', who: 'bot', text: 'Xong rồi nhé.' },
        { type: 'message', who: 'bot', text: 'Bạn sẽ nhận trên Zalo **thông tin lớp, học phí và lịch 19:30 tối mai**.' },
        { type: 'message', who: 'bot', text: 'Trước giờ hẹn hệ thống cũng sẽ tự nhắc để bạn không bị quên.' }
    ],
    health: [
        { type: 'message', who: 'user', text: 'Tôi muốn đặt lịch kiểm tra sức khỏe tổng quát chiều thứ Sáu.' },
        { type: 'message', who: 'user', text: 'Tôi ở Quận 7 nên ưu tiên cơ sở nào gần một chút nhé.' },
        { type: 'tool', app: 'crm', text: 'Đang kiểm tra lịch sử đặt hẹn của chị…', mode: 'đọc' },
        { type: 'message', who: 'bot', text: 'Em đã kiểm tra, hiện chị không có lịch nào đang chờ xác nhận.' },
        { type: 'message', who: 'bot', text: 'Chị muốn chọn **gói tiêu chuẩn** hay muốn tham khảo thêm các gói mở rộng?' },
        { type: 'message', who: 'bot', text: 'Chiều thứ Sáu chị có thể đến sau 15:00 không ạ?' },
        { type: 'message', who: 'user', text: 'Gói tiêu chuẩn thôi.' },
        { type: 'message', who: 'user', text: 'Khoảng 15:30 là đẹp.' },
        { type: 'tool', app: 'sheet', text: 'Đang kiểm tra thông tin gói tiêu chuẩn…', mode: '' },
        { type: 'message', who: 'bot', text: 'Gói tiêu chuẩn gồm các hạng mục kiểm tra cơ bản.' },
        { type: 'message', who: 'bot', text: 'Theo hướng dẫn của cơ sở, chị cần **nhịn ăn 8 giờ trước khi lấy mẫu** và có thể uống nước lọc.' },
        { type: 'message', who: 'bot', text: 'Em tìm cơ sở thuận tiện nhất cho chị nhé.' },
        { type: 'tool', app: 'maps', text: 'Đang tìm cơ sở gần Quận 7…', mode: '' },
        { type: 'message', who: 'bot', text: 'Cơ sở **Nguyễn Thị Thập** là lựa chọn thuận tiện nhất.' },
        { type: 'message', who: 'bot', text: 'Khoảng cách từ khu vực trung tâm Quận 7 khoảng **3 km**.' },
        { type: 'message', who: 'bot', text: 'Em kiểm tra luôn khung 15:30 thứ Sáu cho chị.' },
        { type: 'tool', app: 'calendar', text: 'Đang kiểm tra lịch 15:30 thứ Sáu…', mode: '' },
        { type: 'message', who: 'bot', text: 'Khung **15:30 thứ Sáu** vẫn còn chỗ.' },
        { type: 'message', who: 'bot', text: 'Chị xác nhận lịch này để em đặt luôn nhé?' },
        { type: 'message', who: 'user', text: 'Được em.' },
        { type: 'message', who: 'user', text: 'Gửi địa chỉ, hướng dẫn chuẩn bị và nhắc lịch qua Zalo giúp tôi luôn nhé.' },
        { type: 'tool', app: 'api', text: 'Đang tạo mã lịch hẹn…', mode: '' },
        { type: 'message', who: 'bot', text: 'Lịch hẹn đã được tạo thành công.' },
        { type: 'tool', app: 'crm', text: 'Đang lưu lịch hẹn và thông tin dịch vụ…', mode: 'ghi' },
        { type: 'message', who: 'bot', text: 'Hồ sơ của chị đã được cập nhật trạng thái **Đã đặt lịch**.' },
        { type: 'message', who: 'bot', text: 'Em cũng thiết lập lịch chăm sóc sau buổi kiểm tra.' },
        { type: 'tool', app: 'zalo', text: 'Đang gửi xác nhận và thiết lập nhắc hẹn…', mode: '' },
        { type: 'message', who: 'bot', text: 'Hoàn tất rồi chị.' },
        { type: 'message', who: 'bot', text: 'Zalo sẽ gửi chị **địa chỉ, thời gian, mã lịch hẹn và hướng dẫn chuẩn bị**.' },
        { type: 'message', who: 'bot', text: 'Hệ thống sẽ nhắc lại trước lịch **24 giờ**.' }
    ],
    b2b: [
        { type: 'message', who: 'user', text: 'Công ty tôi đang tìm đơn vị vệ sinh văn phòng định kỳ ở Quận 3.' },
        { type: 'message', who: 'user', text: 'Diện tích khoảng 450m² và phải làm ngoài giờ vì ban ngày nhân viên vẫn làm việc.' },
        { type: 'tool', app: 'crm', text: 'Đang kiểm tra lịch sử làm việc với công ty…', mode: 'đọc' },
        { type: 'message', who: 'bot', text: 'Em chưa thấy bên mình có yêu cầu vệ sinh định kỳ nào đang xử lý.' },
        { type: 'message', who: 'bot', text: 'Anh cho em thêm một chút thông tin nhé.' },
        { type: 'message', who: 'bot', text: 'Mỗi tuần cần bao nhiêu buổi, bắt đầu sau mấy giờ và văn phòng có thảm hoặc kính cần vệ sinh riêng không ạ?' },
        { type: 'message', who: 'user', text: 'Ba buổi mỗi tuần, sau 18:30.' },
        { type: 'message', who: 'user', text: 'Có khoảng 80m² thảm với hai mặt kính phía trước nữa.' },
        { type: 'tool', app: 'sheet', text: 'Đang tính định mức dịch vụ…', mode: '' },
        { type: 'message', who: 'bot', text: 'Với **450m² văn phòng + 80m² thảm + khu vực kính**, chi phí dự kiến khoảng **12.600.000đ/tháng**.' },
        { type: 'message', who: 'bot', text: 'Mức này áp dụng cho lịch **3 buổi/tuần**.' },
        { type: 'message', who: 'bot', text: 'Thiết bị xử lý thảm đã được tính trong phương án.' },
        { type: 'message', who: 'user', text: 'Có phát sinh thêm phí di chuyển không?' },
        { type: 'message', who: 'user', text: 'Với khung giờ sau 18:30 thì bên em có đội làm được chứ?' },
        { type: 'tool', app: 'maps', text: 'Đang kiểm tra khu vực phục vụ…', mode: '' },
        { type: 'message', who: 'bot', text: 'Văn phòng ở Quận 3 nằm trong **khu vực phục vụ tiêu chuẩn**.' },
        { type: 'message', who: 'bot', text: 'Vì vậy hiện không phát sinh thêm phí di chuyển.' },
        { type: 'message', who: 'bot', text: 'Để em kiểm tra đội ngũ còn lịch sau 18:30.' },
        { type: 'tool', app: 'calendar', text: 'Đang kiểm tra lịch đội dịch vụ…', mode: '' },
        { type: 'message', who: 'bot', text: 'Đội **DV-03** còn lịch **thứ 2, 4, 6 sau 18:30**.' },
        { type: 'message', who: 'bot', text: 'Đội này cũng có đầy đủ thiết bị xử lý thảm.' },
        { type: 'message', who: 'bot', text: 'Tuy nhiên với diện tích 450m², em khuyên nên khảo sát thực tế trước khi chốt báo giá chính thức.' },
        { type: 'message', who: 'user', text: 'Hợp lý.' },
        { type: 'message', who: 'user', text: 'Bên em có thể khảo sát lúc nào?' },
        { type: 'message', who: 'bot', text: 'Hiện có khung **16:00 chiều mai**.' },
        { type: 'message', who: 'bot', text: 'Nếu anh thuận tiện, em có thể tạo yêu cầu khảo sát luôn.' },
        { type: 'message', who: 'user', text: 'Được, đặt lịch đó đi.' },
        { type: 'message', who: 'user', text: 'Và chuyển giúp thông tin cho điều phối viên nhé.' },
        { type: 'tool', app: 'crm', text: 'Đang tạo cơ hội và lưu yêu cầu dịch vụ…', mode: 'ghi' },
        { type: 'message', who: 'bot', text: 'Em đã lưu đầy đủ **diện tích, tần suất, thời gian làm, phần thảm, kính và mức chi phí dự kiến**.' },
        { type: 'message', who: 'bot', text: 'Cơ hội hiện được chuyển sang trạng thái **Chờ khảo sát**.' },
        { type: 'tool', app: 'api', text: 'Đang tạo yêu cầu khảo sát…', mode: '' },
        { type: 'message', who: 'bot', text: 'Phiếu khảo sát **16:00 chiều mai** đã được tạo.' },
        { type: 'tool', app: 'zalo', text: 'Đang chuyển hồ sơ cho điều phối viên…', mode: '' },
        { type: 'message', who: 'bot', text: 'Xong rồi anh.' },
        { type: 'message', who: 'bot', text: 'Điều phối viên đã nhận toàn bộ thông tin của công ty.' },
        { type: 'message', who: 'bot', text: 'Khi liên hệ, bên em có thể đi thẳng vào bước khảo sát và chốt phương án, anh không cần trình bày lại từ đầu.' }
    ]
};

function Avatar({ bot, d }) { const image = !bot && d.person[2]; return <span className={`iws-avatar ${bot ? 'is-bot' : ''}`}>{bot ? <Bot /> : image ? <img src={image} alt={`Ảnh ${d.person[0]}`} loading="lazy" /> : d.person[1]}</span> }
function App({ id, status, fact, en = false }) { const [mark, name, task, color, image] = BRANDS[id]; return <div className={`iws-app-node ${status}`} style={{ '--brand': color }}><i className="iws-port in" /><span className="iws-brand">{image ? <img src={image} alt={`Logo ${name}`} loading="lazy" /> : mark}</span><div><b>{name}</b><small>{status === 'active' ? (en ? 'Querying…' : 'Đang truy vấn…') : status === 'done' ? fact : en ? BRAND_TASKS_EN[id] : task}</small></div>{status === 'done' && <Check className="iws-check" />}<i className="iws-port out" /></div> }
function MessageText({ text }) { return <>{text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</> }
function splitEnglishMessage(text) {
    const clauses = text.match(/[^.!?]+[.!?]?/g)?.flatMap(sentence => {
        const clean = sentence.trim();
        if (clean.length <= 88) return [clean];
        return clean.split(/(?<=,|;)\s+/).map(part => part.trim()).filter(Boolean);
    }) || [text];
    const bubbles = [];
    clauses.forEach(clause => {
        const last = bubbles[bubbles.length - 1];
        if (last && `${last} ${clause}`.length <= 88) bubbles[bubbles.length - 1] = `${last} ${clause}`;
        else bubbles.push(clause);
    });
    if (bubbles.length <= 3) return bubbles;
    return [bubbles[0], bubbles[1], bubbles.slice(2).join(' ')];
}
function Node({ icon: Icon, title, text, status, cn = '' }) { return <div className={`iws-flow-node ${cn} ${status}`}><i className="iws-port in" /><span><Icon /></span><div><b>{title}</b><small>{text}</small></div>{status === 'done' && <Check className="iws-check" />}<i className="iws-port out" /></div> }
export function IndustryWorkflowStudio({ industryId, en = false }) {
    const d = (en ? commonEn[industryId] : null) || common[industryId] || common.retail;
    const [phase, setPhase] = useState(0);
    const [visible, setVisible] = useState(false);
    const root = useRef();
    const chat = useRef();
    const follow = useRef(true);


    const fallbackSequence = d.chat.flatMap(([who, text]) => splitEnglishMessage(text).map(part => ({ type: 'message', who, text: part })));
    const sequence = en ? fallbackSequence : (DEMO_VI[industryId] || DEMO_VI.retail);
    const timeline = [...sequence, { type: 'synthesis' }, { type: 'reply' }];
    const currentEvent = timeline[phase] || timeline[0];
    const visibleMessages = sequence.slice(0, phase + 1).flatMap((event, index, visibleSequence) => event.type === 'message' ? [{
        ...event,
        groupStart: visibleSequence[index - 1]?.type !== 'message' || visibleSequence[index - 1]?.who !== event.who,
        groupEnd: visibleSequence[index + 1]?.type !== 'message' || visibleSequence[index + 1]?.who !== event.who
    }] : []);
    const activeToolId = currentEvent.type === 'tool' ? currentEvent.app : null;
    const synthesisIndex = sequence.length;
    const replyIndex = synthesisIndex + 1;

    useEffect(() => {
        setPhase(0);
        follow.current = true;
        if (chat.current) chat.current.scrollTop = 0;
    }, [industryId, en]);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .12 });
        if (root.current) observer.observe(root.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return undefined;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setPhase(replyIndex);
            return undefined;
        }
        const delay = currentEvent.type === 'message'
            ? (currentEvent.who === 'user' ? 1500 : 1850)
            : currentEvent.type === 'tool' ? 2100
                : currentEvent.type === 'synthesis' ? 1300 : 900;
        const timer = setTimeout(() => setPhase(index => index >= timeline.length - 1 ? 0 : index + 1), delay);
        return () => clearTimeout(timer);
    }, [currentEvent, replyIndex, timeline.length, visible]);

    useEffect(() => {
        if (chat.current && follow.current) chat.current.scrollTo({ top: chat.current.scrollHeight, behavior: 'smooth' });
    }, [phase]);

    const toolState = id => {
        if (activeToolId === id) return 'active';
        const hasCompleted = sequence.slice(0, phase).some(event => event.type === 'tool' && event.app === id);
        return hasCompleted ? 'done' : 'wait';
    };
    const flowState = target => phase > target ? 'done' : phase === target ? 'active' : 'wait';

    return <article ref={root} className="iws" style={{ '--accent': d.accent }} id={`industry-panel-${industryId}`} role="tabpanel" aria-labelledby={`industry-tab-${industryId}`}>
        <div className="iws-toolbar"><p><Sparkles />{d.desc}</p><div><a href={d.messengerUrl} target="_blank" rel="noopener noreferrer"><MessageCircle />{en ? 'Try it on Messenger' : 'Chat thử trên Messenger'}<ExternalLink /></a></div></div>
        <div className="iws-layout">
            <section className="iws-chat">
                <header><Avatar bot d={d} /><div><b>Losa AI</b><small><i />{en ? 'Online' : 'Đang hoạt động'} · {d.channel}</small></div></header>
                <div className="iws-chat-note"><History />{en ? 'AI uses history to provide seamless consulting' : 'AI sử dụng lịch sử để tư vấn liền mạch'}</div>
                <div className="iws-messages" ref={chat} onScroll={event => { const element = event.currentTarget; follow.current = element.scrollHeight - element.scrollTop - element.clientHeight < 70 }}>
                    {visibleMessages.map(({ who, text, groupStart, groupEnd }, index) => <div className={`iws-message ${who} ${groupStart ? 'group-start' : ''} ${groupEnd ? 'group-end' : ''}`} key={`${who}-${index}`}><span className="iws-avatar-slot">{groupEnd && <Avatar bot={who === 'bot'} d={d} />}</span><div>{groupStart && <small>{who === 'bot' ? 'Losa AI' : d.person[0]}</small>}<p><MessageText text={text} /></p></div></div>)}
                    {(currentEvent.type === 'tool' || currentEvent.type === 'synthesis') && <div className="iws-typing"><Avatar bot d={d} /><div className="iws-typing-state"><span aria-label={en ? 'Losa AI is typing' : 'Losa AI đang nhập'}><i /><i /><i /></span>{currentEvent.type === 'tool' && <small>{currentEvent.text}</small>}</div></div>}
                </div>
                <footer><span>{en ? 'Type a message…' : 'Nhập tin nhắn…'}</span><Send /></footer>
            </section>
            <section className="iws-workflow">
                <header><div><BrainCircuit /><span><b>{en ? 'Losa AI workflow' : 'Luồng vận hành Losa AI'}</b><small>{en ? 'Connected and processed in real time' : 'Kết nối và xử lý theo thời gian thực'}</small></span></div><em><i />LIVE</em></header>
                <div className="iws-canvas">
                    <label className="z1">01 · {en ? 'INTAKE & UNDERSTAND' : 'TIẾP NHẬN & HIỂU'}</label><label className="z2">02 · {en ? 'CONNECT APPLICATIONS' : 'KẾT NỐI ỨNG DỤNG'}</label><label className="z3">03 · {en ? 'RESPOND' : 'PHẢN HỒI'}</label>
                    <Node icon={MessageCircle} title={en ? 'New message' : 'Tin nhắn mới'} text={d.channel} status={phase === 0 ? 'active' : 'done'} cn="trigger" />
                    <div className="iws-app-frame"><div className="iws-app-title"><Webhook />{en ? 'Applications & data' : 'Ứng dụng & dữ liệu'} <span>{d.apps.length} {en ? 'connections' : 'kết nối'}</span></div><div className="iws-app-grid">{d.apps.map((id, index) => <App id={id} fact={d.facts[index]} en={en} key={id} status={toolState(id)} />)}</div></div>
                    <Node icon={Sparkles} title={en ? 'AI synthesis' : 'AI tổng hợp'} text={en ? 'Cross-check data' : 'Đối chiếu dữ liệu'} status={flowState(synthesisIndex)} cn="core" />
                    <Node icon={Send} title={en ? 'Customer response' : 'Phản hồi khách'} text={en ? 'Contextually accurate' : 'Đúng ngữ cảnh'} status={flowState(replyIndex)} cn="reply" />
                    <svg className="iws-wires" viewBox="0 0 1000 430" preserveAspectRatio="none"><path d="M180 218H210M580 218H610M770 218H820" /><path className="packet" d="M180 218H210M580 218H610M770 218H820" /></svg>
                </div>
            </section>
        </div>
    </article>
}
