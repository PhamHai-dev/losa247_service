import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, Bot, BrainCircuit, Building2, Camera, Check, CheckCircle2, ChevronDown, Clock3, CloudCog, Database, FileText, Filter, Globe2, GraduationCap, HeartPulse, Image, Layers3, MessageCircle, PlugZap, Quote, ScanLine, Send, ShieldCheck, ShoppingBag, Sparkles, Store, Tag, Truck, UserRoundCheck, Zap, Users, Calendar, Mail, HelpCircle, BookOpen, Presentation, ClipboardCheck, BarChart, Settings, PlayCircle, Stethoscope, Pill, Hospital, Syringe, Heart, Video, CalendarClock, Shield, FileHeart, FlaskConical, Activity, ClipboardPlus, MapPin, Star, Search, Map, Bed, Wallet, Ticket, ArrowLeftRight, CreditCard, Headset } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { publicFaqsService } from '../../features/faqs/faqsService';
import { ClientFaqSection } from '../../components/client/ClientFaqSection';
import { IndustryWorkflowStudio } from '../../components/client/IndustryWorkflowStudio';
import '../../styles/client/chatbot-solutions-modern.css';
import '../../styles/client/industry-panel.css';
import { useI18n } from '../../hooks/useI18n';
import { PageSeo } from '../../components/seo/PageSeo';

const heroFadeUp = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: .55 } }
};
const heroStagger = { visible: { transition: { staggerChildren: .12 } } };

const customerBrands = [
    { name: 'Vinamilk', image: '/images/solutions/solution_1_section4_icon.webp' },
    { name: 'Viettel', image: '/images/solutions/solution_2_section4_icon.webp' },
    { name: 'FPT', image: '/images/solutions/solution_3_section4_icon.webp' },
    { name: 'Vingroup', image: '/images/solutions/solution_23_section4_icon.webp' },
    { name: 'Techcombank', image: '/images/solutions/solution_24_section4_icon.webp' },
    { name: 'Highlands Coffee', image: '/images/solutions/solution_27_section4_icon.png' },
    { name: 'PNJ', image: '/images/solutions/solution_25_section4_icon.webp' },
    { name: '', image: '/images/solutions/solution_26_section4_icon.webp' }
];

function CustomerMarquee({ en = false }) {
    const renderGroup = hidden => <div className="csp-customers__group" aria-hidden={hidden || undefined}>
        {customerBrands.map((brand) => <div className="csp-customers__brand-img" key={brand.name}>
            <img src={brand.image} alt={brand.name} loading="lazy" />
        </div>)}
    </div>;
    return <section className="csp-customers" id="chatbot-customers" aria-label={en ? 'Our customers' : 'Khách hàng của chúng tôi'}>
        <div className="csp-shell">
            <div className="csp-customers__band">
                <Heading
                    eyebrow={en ? 'OUR CUSTOMERS' : 'KHÁCH HÀNG CỦA CHÚNG TÔI'}
                    title={en ? 'More than 8,000 businesses use Losa' : 'Hơn 8.000 doanh nghiệp đang sử dụng Losa'}
                />
                <div className="csp-customers__marquee" role="region" aria-label={en ? 'Customer list' : 'Danh sách khách hàng'}>
                    <div className="csp-customers__track">{renderGroup(false)}{renderGroup(true)}</div>
                </div>
            </div>
        </div>
    </section>;
}

const caps = [{ id: 'lead', icon: BrainCircuit, kicker: 'Tiếp nhận & phân loại', title: 'Nhận diện khách hàng tiềm năng ngay từ tin nhắn đầu tiên', text: 'AI tìm hiểu nhu cầu, thu thập thông tin và ưu tiên những khách hàng có khả năng chuyển đổi cao.', bullets: ['Hiểu ý định và ngữ cảnh', 'Thu thập thông tin có cấu trúc', 'Gán nhãn và chấm điểm lead', 'Đẩy dữ liệu sang đội ngũ phụ trách'] }, { id: 'vision', icon: Camera, kicker: 'AI Vision & OCR', title: 'Đọc hình ảnh, nhận diện sản phẩm và phản hồi tức thì', text: 'Phân tích ảnh, đọc mã và xác định sản phẩm để phản hồi đúng ngữ cảnh khách hàng đang quan tâm.', bullets: ['Nhận diện sản phẩm và mẫu mã', 'Đọc chữ, mã hoặc hóa đơn', 'Phân tích chi tiết hình ảnh', 'Kết hợp ảnh với câu hỏi của khách'] }, { id: 'shipping', icon: Truck, kicker: 'Vận chuyển & chăm sóc', title: 'Tự động xử lý giao hàng và chăm sóc sau bán', text: 'Xác thực địa chỉ, tính phí vận chuyển, cập nhật đơn hàng và tiếp tục chăm sóc sau khi mua.', bullets: ['Nhận và xác thực địa chỉ', 'Tính phí vận chuyển', 'Cập nhật trạng thái đơn hàng', 'Follow-up khách cũ'] }, { id: 'handoff', icon: UserRoundCheck, kicker: 'AI & con người phối hợp', title: 'Chuyển đúng nhân viên mà khách không phải trình bày lại', text: 'AI chuyển toàn bộ lịch sử và nhu cầu đến đúng người phụ trách khi cần hỗ trợ chuyên sâu.', bullets: ['Chuyển đúng nhóm phụ trách', 'Đính kèm lịch sử hội thoại', 'Nhân viên tiếp quản bất kỳ lúc nào', 'Phân quyền và lưu lịch sử xử lý'] }, { id: 'integration', icon: PlugZap, kicker: 'Kết nối hệ thống', title: 'Biến câu trả lời thành hành động ngay lập tức', text: 'Kết nối CRM, đơn hàng, lịch hẹn và API để AI trực tiếp hoàn thành tác vụ trong hội thoại.', bullets: ['Đồng bộ hồ sơ với CRM', 'Kết nối API và hệ thống nội bộ', 'Tra cứu tồn kho và đơn hàng', 'Đo lường trên dashboard'] }];
const chats = { lead: [['customer', 'Shop mình nhận khoảng 2.000 tin nhắn mỗi tháng.'], ['ai', 'Shop đang bán trên kênh nào và cần AI hỗ trợ phần nào nhất?'], ['customer', 'Website và Messenger, mình muốn lọc khách có nhu cầu thật.'], ['ai', 'Mình đã ghi nhận và gán nhãn lead tiềm năng để đội ngũ tư vấn tiếp.']], quote: [['customer', 'Cho mình báo giá 20 máy lọc không khí mẫu A2 nhé.'], ['ai', 'Bạn cần giao một địa chỉ hay chia thành nhiều điểm giao?'], ['customer', 'Giao một địa chỉ tại Quận 7 trong tuần này.'], ['ai', 'Mình đã kiểm tra tồn kho và tạo báo giá theo yêu cầu.']], shipping: [['customer', 'Đơn A2 giao đến Quận 7 thì phí ship bao nhiêu?'], ['ai', 'Bạn gửi giúp mình phường và thời gian muốn nhận hàng nhé.'], ['customer', 'Phường Tân Phong, nhận trong 1–2 ngày.'], ['ai', 'Phí dự kiến 32.000đ. Mình đã lưu địa chỉ và thời gian giao.']], omnichannel: [['customer', 'Mình vừa hỏi mẫu A2 trên Website, giờ tư vấn tiếp ở đây nhé.'], ['ai', 'Mình đã tìm thấy cuộc trò chuyện trước của bạn trên Website.'], ['customer', 'Mình muốn xem thêm giá màng lọc thay thế.'], ['ai', 'Mình tiếp tục đúng ngữ cảnh và gửi thông tin ngay tại Messenger.']], handoff: [['customer', 'Bên mình cần tích hợp ERP nội bộ qua API riêng.'], ['ai', 'Yêu cầu này cần chuyên viên kỹ thuật. Mình xin phép chuyển đúng nhóm.'], ['customer', 'Bạn gửi kèm các yêu cầu mình đã trao đổi nhé.'], ['ai', 'Đã chuyển Minh Anh cùng toàn bộ lịch sử và thông tin hệ thống.']], integration: [['customer', 'Kiểm tra giúp mình đơn DH-2048 đang giao đến đâu?'], ['ai', 'Mình đang tra cứu trạng thái từ hệ thống đơn hàng.'], ['customer', 'Nếu chưa giao, cập nhật số điện thoại nhận hàng giúp mình.'], ['ai', 'Đơn đang tại kho Quận 7 và số mới đã được đồng bộ.']] };
const actions = { lead: ['Tiềm năng cao', 'Đã gán nhãn Lead nóng', Tag], quote: ['Báo giá #BG-2048', 'Tổng cộng 38.400.000đ', Quote], shipping: ['Giao hàng nhanh', 'Phí vận chuyển: 32.000đ', Truck], omnichannel: ['Đã đồng bộ hội thoại', 'Website → Messenger', Globe2], handoff: ['Minh Anh đã tiếp quản', 'Kèm 12 tin nhắn lịch sử', UserRoundCheck], integration: ['Đơn hàng #DH-2048', 'CRM và vận chuyển đã cập nhật', PlugZap] };
const growthCapabilities = [
    { id: 'always-on', icon: Clock3, kicker: 'Phản hồi 24/7', title: 'Phản hồi khách hàng 24/7, kể cả ngoài giờ', text: 'Tiếp nhận và tìm hiểu nhu cầu ngay cả khi đội ngũ đang bận hoặc đã hết giờ làm việc.', bullets: ['Tiếp nhận yêu cầu ngay lập tức', 'Không bỏ sót hội thoại ngoài giờ', 'Chuẩn bị đầy đủ ngữ cảnh cho đội ngũ'] },
    { id: 'right-time', icon: Send, kicker: 'Chăm sóc chủ động', title: 'Chủ động chăm sóc đúng người, đúng thời điểm', text: 'Tự động gửi nội dung phù hợp dựa trên nhu cầu, hành vi và thời điểm doanh nghiệp thiết lập.', bullets: ['Nhận diện đúng nhóm khách phù hợp', 'Kích hoạt nội dung vào đúng thời điểm', 'Chuẩn bị chính sách theo số lượng'] },
    { id: 'retention', icon: BrainCircuit, kicker: 'Tăng trưởng bền vững', title: 'Cá nhân hóa chăm sóc để khách hàng quay lại', text: 'Tận dụng lịch sử tương tác để follow-up, gợi ý và tạo cơ hội mua lại phù hợp với từng khách hàng.', bullets: ['Đối chiếu lịch sử quan tâm', 'Chọn nội dung phù hợp với từng khách', 'Tạo cơ hội chăm sóc và báo giá lại'] }
];
const englishGrowthCapabilities = [
    { id: 'always-on', icon: Clock3, kicker: '24/7 RESPONSE', title: 'Never keep a customer waiting', text: 'Losa welcomes, responds to and understands customer needs even when your team is busy or offline.', bullets: ['Receive requests immediately', 'Never miss after-hours conversations', 'Prepare complete context for the team'] },
    { id: 'right-time', icon: Send, kicker: 'PROACTIVE CARE', title: 'Be there when customers need you', text: 'Reach interested customers with relevant content at the time your business chooses.', bullets: ['Identify the relevant customer group', 'Activate content at the right time', 'Prepare volume-based policies'] },
    { id: 'retention', icon: BrainCircuit, kicker: 'SUSTAINABLE GROWTH', title: 'Give customers a reason to return', text: 'Nurture customers with available data and interaction history instead of generic messages.', bullets: ['Review interest history', 'Choose relevant content for each customer', 'Create follow-up and quotation opportunities'] }
];
const capabilityMedia = {
    lead: { image: '/images/solutions/image-function/lead.png', alt: 'AI Losa nhận diện nhu cầu và phân loại khách hàng tiềm năng' },
    vision: { image: '/images/solutions/image-function/vision.png', alt: 'AI Losa phân tích hình ảnh và nhận diện nội dung bằng OCR' },
    shipping: { image: '/images/solutions/image-function/shipping.png', alt: 'AI Losa hỗ trợ tính phí vận chuyển và chăm sóc sau bán' },
    handoff: { image: '/images/solutions/image-function/handoff.png', alt: 'AI Losa chuyển hội thoại cho nhân viên cùng đầy đủ ngữ cảnh' },
    integration: { image: '/images/solutions/image-function/integration.png', alt: 'AI Losa kết nối với CRM, API và hệ thống doanh nghiệp' },
    'always-on': { image: '/images/solutions/image-function/always-on.png', alt: 'AI Losa phản hồi khách hàng liên tục 24 giờ mỗi ngày' },
    'right-time': { image: '/images/solutions/image-function/right-time.png', alt: 'AI Losa chủ động chăm sóc khách hàng vào đúng thời điểm' },
    retention: { image: '/images/solutions/image-function/retention.png', alt: 'AI Losa chăm sóc khách hàng dựa trên lịch sử tương tác' }
};
const industries = [
    { id: 'retail', icon: Store, name: 'Bán lẻ & E-commerce', title: 'AI bán hàng từ tư vấn đến xác nhận đơn', text: 'Tìm đúng sản phẩm, kiểm tra tồn kho và tạo cơ hội bán hàng trong cùng một cuộc trò chuyện.', request: 'Mình cần 20 máy lọc không khí cho văn phòng, giao trong tuần này.', profile: 'Đơn hàng doanh nghiệp', score: '92% phù hợp', signals: [['SẢN PHẨM', 'Máy lọc A2 Pro'], ['SỐ LƯỢNG', '20 sản phẩm'], ['THỜI GIAN', 'Trong tuần'], ['KHU VỰC', 'Quận 7']], chat: [['customer', 'Bên mình cần 20 máy lọc cho văn phòng 60m².'], ['ai', 'Mình đã tìm thấy mẫu A2 Pro phù hợp. Bạn cần giao khi nào?'], ['customer', 'Trong tuần này, giao đến Quận 7 nhé.'], ['ai', 'Đã kiểm tra đủ tồn kho và chuẩn bị báo giá doanh nghiệp.']], steps: [[BrainCircuit, 'Hiểu nhu cầu', 'Xác định sản phẩm và số lượng'], [ShoppingBag, 'Kiểm tra dữ liệu', '20 sản phẩm đang sẵn sàng'], [Quote, 'Tạo hành động', 'Báo giá đã được khởi tạo']], result: 'Cơ hội bán hàng sẵn sàng xử lý', resultText: 'Đội sales nhận đủ nhu cầu, tồn kho và thời gian giao.', checklist: ['Sản phẩm và số lượng đã xác nhận', 'Tồn kho đã được kiểm tra', 'Báo giá sẵn sàng gửi'] },
    { id: 'education', icon: GraduationCap, name: 'Giáo dục', title: 'Tư vấn lộ trình đúng mục tiêu từng học viên', text: 'AI tìm hiểu mục tiêu, lịch học và trình độ để chuyển một hồ sơ chất lượng cho tư vấn viên.', request: 'Em muốn học IELTS để đạt 6.5, chỉ rảnh buổi tối.', profile: 'Hồ sơ học viên', score: 'Lead chất lượng', signals: [['MỤC TIÊU', 'IELTS 6.5'], ['TRÌNH ĐỘ', 'Đầu vào 4.5'], ['LỊCH HỌC', 'Buổi tối'], ['KHAI GIẢNG', 'Tháng tới']], chat: [['customer', 'Em cần IELTS 6.5 và chỉ học được buổi tối.'], ['ai', 'Bạn đã có điểm đầu vào và muốn bắt đầu vào thời gian nào?'], ['customer', 'Em đang khoảng 4.5, muốn học từ tháng tới.'], ['ai', 'Mình đã chọn lộ trình phù hợp và giữ lịch tư vấn tối mai.']], steps: [[Filter, 'Sàng lọc mục tiêu', 'Mục tiêu 6.5, đầu vào 4.5'], [Clock3, 'Đối chiếu lịch học', 'Có lớp tối phù hợp'], [UserRoundCheck, 'Đặt lịch tư vấn', 'Đã giữ lịch tối mai']], result: 'Học viên đã sẵn sàng tư vấn', resultText: 'Tư vấn viên nhận hồ sơ cùng mục tiêu và lịch học phù hợp.', checklist: ['Mục tiêu học tập đã rõ', 'Lớp phù hợp đã được chọn', 'Lịch tư vấn đã được giữ'] },
    { id: 'health', icon: HeartPulse, name: 'Y tế & phòng khám', title: 'Tiếp nhận nhu cầu và điều phối lịch hẹn an toàn', text: 'AI thu thập thông tin ban đầu, cung cấp thông tin dịch vụ và hỗ trợ đặt lịch với đúng chuyên khoa.', request: 'Tôi muốn đặt lịch tư vấn da liễu vào chiều thứ Sáu.', profile: 'Yêu cầu đặt lịch', score: 'Đã xác minh', signals: [['NHU CẦU', 'Tư vấn da liễu'], ['THỜI GIAN', 'Chiều thứ Sáu'], ['HÌNH THỨC', 'Khám trực tiếp'], ['TRẠNG THÁI', 'Chờ xác nhận']], chat: [['customer', 'Tôi muốn đặt lịch da liễu chiều thứ Sáu.'], ['ai', 'Mình có thể hỗ trợ kiểm tra lịch. Bạn muốn khám trực tiếp tại phòng khám?'], ['customer', 'Đúng rồi, khoảng sau 15 giờ.'], ['ai', 'Có lịch 15:30. Mình đã giữ chỗ và gửi thông tin xác nhận.']], steps: [[MessageCircle, 'Tiếp nhận an toàn', 'Ghi nhận nhu cầu, không chẩn đoán'], [Clock3, 'Kiểm tra lịch trống', 'Có lịch lúc 15:30'], [CheckCircle2, 'Xác nhận lịch hẹn', 'Thông tin đã được gửi']], result: 'Lịch hẹn đã được điều phối', resultText: 'Nhân viên phòng khám nhận yêu cầu rõ ràng và lịch đã xác nhận.', checklist: ['Nhu cầu ban đầu đã ghi nhận', 'Khung giờ đã được giữ', 'Khách đã nhận hướng dẫn'] },
    { id: 'b2b', icon: Building2, name: 'Dịch vụ B2B', title: 'Sàng lọc yêu cầu phức tạp trước khi tư vấn', text: 'AI thu thập quy mô, hệ thống và mục tiêu để chuyên gia bước vào cuộc gọi với đầy đủ ngữ cảnh.', request: 'Doanh nghiệp 200 nhân sự cần tích hợp chatbot với ERP nội bộ.', profile: 'Cơ hội doanh nghiệp', score: 'Ưu tiên cao', signals: [['QUY MÔ', '200 nhân sự'], ['HỆ THỐNG', 'ERP nội bộ'], ['MỤC TIÊU', 'Tự động hỗ trợ'], ['ƯU TIÊN', 'Triển khai Q4']], chat: [['customer', 'Bên mình có 200 nhân sự và cần chatbot kết nối ERP riêng.'], ['ai', 'Doanh nghiệp muốn ưu tiên quy trình nào và dự kiến triển khai khi nào?'], ['customer', 'Hỗ trợ nội bộ trước, dự kiến trong quý 4.'], ['ai', 'Mình đã tổng hợp yêu cầu và đặt lịch với chuyên gia tích hợp.']], steps: [[Building2, 'Khảo sát quy mô', '200 nhân sự, hỗ trợ nội bộ'], [PlugZap, 'Phân tích hệ thống', 'ERP riêng cần API tích hợp'], [UserRoundCheck, 'Phân công chuyên gia', 'Đã đặt lịch tư vấn kỹ thuật']], result: 'Cơ hội B2B có đầy đủ ngữ cảnh', resultText: 'Chuyên gia nhận quy mô, hệ thống và mục tiêu trước cuộc gọi.', checklist: ['Bài toán đã được chuẩn hóa', 'Yêu cầu tích hợp đã ghi nhận', 'Chuyên gia phù hợp đã tiếp nhận'] }
];
const industryMedia = {
    retail: { image: '/images/industries/retail-operation.webp', scene: 'Quầy bán hàng & xử lý đơn', person: 'Minh Anh', initials: 'MA', role: 'Khách hàng doanh nghiệp', position: 'center 55%', tone: 'retail' },
    education: { image: '/images/industries/education-consulting.webp', scene: 'Trung tâm tư vấn tuyển sinh', person: 'Hoàng Nam', initials: 'HN', role: 'Học viên tiềm năng', position: 'center 48%', tone: 'education' },
    health: { image: '/images/industries/clinic-reception.webp', scene: 'Phòng khám & tiếp nhận lịch', person: 'Thu Hà', initials: 'TH', role: 'Khách đặt lịch', position: 'center 45%', tone: 'health' },
    b2b: { image: '/images/industries/b2b-workshop.webp', scene: 'Buổi tư vấn giải pháp B2B', person: 'Quang Minh', initials: 'QM', role: 'Đại diện doanh nghiệp', position: 'center 50%', tone: 'b2b' }
};
const rollout = [
    { step: '01', title: 'Khảo sát', text: 'Làm rõ bài toán, hành vi khách hàng và mục tiêu ưu tiên trước khi bắt đầu triển khai.', duration: '1–2 ngày', icon: Search, tone: '#14b8d4', work: ['Phỏng vấn đội ngũ phụ trách', 'Phân tích kênh và hành trình khách hàng', 'Xác định mục tiêu và phạm vi ưu tiên'] },
    { step: '02', title: 'Chuẩn hóa dữ liệu', text: 'Biến dữ liệu rời rạc thành nguồn tri thức rõ ràng để AI phản hồi nhất quán.', duration: '2–4 ngày', icon: Database, tone: '#168cf0', work: ['Tập hợp tài liệu và dữ liệu nguồn', 'Chuẩn hóa nội dung và quy tắc trả lời', 'Thiết lập phạm vi tri thức được phép dùng'] },
    { step: '03', title: 'Thiết kế workflow', text: 'Thiết kế luồng nghiệp vụ để chatbot không chỉ trả lời mà còn hoàn thành tác vụ.', duration: '3–5 ngày', icon: Settings, tone: '#4f63e8', work: ['Phân tích yêu cầu theo từng tình huống', 'Thiết kế luồng nghiệp vụ và bàn giao', 'Xác định hệ thống, API cần kết nối'] },
    { step: '04', title: 'Kiểm thử', text: 'Đánh giá chatbot bằng tình huống thực tế trước khi đưa vào phục vụ khách hàng.', duration: '2–3 ngày', icon: ClipboardCheck, tone: '#6d50dc', work: ['Kiểm thử bộ câu hỏi thực tế', 'Đánh giá độ chính xác và ngữ cảnh', 'Tinh chỉnh các tình huống chuyển nhân viên'] },
    { step: '05', title: 'Vận hành', text: 'Theo dõi hiệu quả, cập nhật tri thức và tối ưu chatbot liên tục theo dữ liệu thật.', duration: 'Liên tục', icon: Activity, tone: '#334b72', work: ['Theo dõi hội thoại và chỉ số vận hành', 'Cập nhật dữ liệu theo thay đổi kinh doanh', 'Tối ưu phản hồi và workflow định kỳ'] }
];
const rolloutEn = [
    { ...rollout[0], title: 'Discovery', text: 'Clarify the challenge, customer behavior and priority goals before implementation.', duration: '1–2 days', work: ['Interview the responsible teams', 'Analyze channels and customer journeys', 'Define goals and priority scope'] },
    { ...rollout[1], title: 'Data preparation', text: 'Turn fragmented data into a clear knowledge source for consistent AI responses.', duration: '2–4 days', work: ['Collect source documents and data', 'Standardize content and response rules', 'Define approved knowledge boundaries'] },
    { ...rollout[2], title: 'Workflow design', text: 'Design business flows so the chatbot can complete tasks, not merely answer questions.', duration: '3–5 days', work: ['Analyze requirements by scenario', 'Design business and handoff flows', 'Identify systems and APIs to connect'] },
    { ...rollout[3], title: 'Testing', text: 'Evaluate the chatbot with real scenarios before it starts serving customers.', duration: '2–3 days', work: ['Test real question sets', 'Assess accuracy and context', 'Refine human-handoff scenarios'] },
    { ...rollout[4], title: 'Operations', text: 'Monitor performance, update knowledge and continuously optimize with real data.', duration: 'Ongoing', work: ['Monitor conversations and operating metrics', 'Update data as the business changes', 'Optimize responses and workflows'] }
];
function Heading({ eyebrow, title, text, light = false }) { return <header className={`csp-heading${light ? ' csp-heading--light' : ''}`}><div className="csp-eyebrow">{eyebrow}</div><h2>{title}</h2>{text && <p>{text}</p>}</header> }
function ChatHeader() { return <div className="csp-chat__top"><div className="csp-chat__avatar"><Bot /></div><div><strong>Losa AI Assistant</strong><span><i /> Đang hoạt động</span></div><span className="csp-chat__channel">AI</span></div> }
function Composer() { return <div className="csp-chat__composer"><span>Nhập tin nhắn...</span><button aria-label="Gửi tin nhắn minh họa"><Send /></button></div> }
function Conversation({ mode = 'quote', compact = false }) { const ref = useRef(null); useEffect(() => { const e = ref.current; if (!e) return; let a, b, c, stop = false; const clear = () => { clearTimeout(a); clearTimeout(b); clearTimeout(c) }, halt = () => { stop = true; clear() }, cycle = () => { if (stop || matchMedia('(prefers-reduced-motion: reduce)').matches || e.scrollHeight <= e.clientHeight) return; e.scrollTo({ top: 0, behavior: 'smooth' }); a = setTimeout(() => { if (stop) return; e.scrollTo({ top: e.scrollHeight, behavior: 'smooth' }); b = setTimeout(() => { if (stop) return; e.scrollTo({ top: 0, behavior: 'smooth' }); c = setTimeout(cycle, 2400) }, 4000) }, 2200) }; e.scrollTop = 0; const f = requestAnimationFrame(cycle); e.addEventListener('wheel', halt, { passive: true }); e.addEventListener('touchstart', halt, { passive: true }); return () => { cancelAnimationFrame(f); clear(); e.removeEventListener('wheel', halt); e.removeEventListener('touchstart', halt) } }, [mode]); if (mode === 'vision') return <div className="csp-chat csp-chat--compact"><ChatHeader /><div ref={ref} className="csp-chat__body"><div className="csp-vision-upload"><Image /><div><strong>product-a2.jpg</strong><small>Ảnh khách hàng vừa gửi</small></div></div><div className="csp-message csp-message--customer">Bạn xem giúp mình đây là mẫu máy nào?</div><div className="csp-message csp-message--ai"><Sparkles />Đây là máy lọc không khí A2, độ tin cậy 98%.</div><div className="csp-message csp-message--customer">Mẫu này còn màng lọc thay thế không?</div><div className="csp-action-card"><span><ScanLine /></span><div><b>Màng lọc HEPA H13 còn hàng</b><small>Đã đối chiếu mã A2 và tồn kho</small></div><CheckCircle2 /></div><div className="csp-message csp-message--ai"><Sparkles />Mình có thể gửi giá và hướng dẫn chọn đúng phiên bản.</div></div><Composer /></div>; const list = chats[mode] || chats.quote, [title, note, Icon] = actions[mode] || actions.quote; return <div className={`csp-chat${compact ? ' csp-chat--compact' : ''}`}><ChatHeader /><div ref={ref} className="csp-chat__body">{list.map(([sender, text], i) => <div key={i} className={`csp-message csp-message--${sender}`}>{sender === 'ai' && <Sparkles />}{text}</div>)}<div className="csp-action-card"><span><Icon /></span><div><b>{title}</b><small>{note}</small></div><CheckCircle2 /></div></div><Composer /></div> }
function HeroVisual({ en = false }) {
    const channels = [
        [Globe2, 'Website'],
        [MessageCircle, 'Messenger'],
        [Send, 'Zalo'],
        [Camera, 'Instagram'],
        [Send, 'Telegram']
    ];
    return <div className="csp-hero__visual" aria-label={en ? 'LOSA AI model connecting and synchronizing omnichannel conversations' : 'Mô hình LOSA AI kết nối và đồng bộ hội thoại đa kênh'}>
        <div className="csp-ai-hub">
            <div className="csp-ai-hub__orbit csp-ai-hub__orbit--outer" aria-hidden="true" />
            <div className="csp-ai-hub__orbit csp-ai-hub__orbit--inner" aria-hidden="true" />
            <div className="csp-ai-hub__handoff"><span>MA</span><div><small>{en ? 'AI HANDS OFF TO STAFF' : 'AI CHUYỂN NHÂN VIÊN'}</small><strong>{en ? 'Minh Anh · Context included' : 'Minh Anh · Kèm ngữ cảnh'}</strong></div><CheckCircle2 /></div>
            <div className="csp-ai-hub__automation"><div><span>{en ? 'Handled automatically by AI' : 'AI tự động xử lý'}</span><strong>96%</strong></div><i><b /></i></div>
            {channels.map(([Icon, label], i) => <div className={`csp-ai-hub__channel csp-ai-hub__channel--${i}`} key={label}><Icon /><span>{label}</span><small><i /> {en ? 'Connected' : 'Kết nối'}</small></div>)}
            <div className="csp-ai-hub__core"><span><Bot /></span><strong>LOSA AI</strong><small><i /> {en ? 'Smart omnichannel assistant' : 'Trợ lý thông minh đa kênh'}</small></div>
            <div className="csp-ai-hub__metric csp-ai-hub__metric--speed"><span><Zap /></span><div><small>{en ? 'AVERAGE RESPONSE' : 'PHẢN HỒI TRUNG BÌNH'}</small><strong>{en ? '4.8 seconds' : '4.8 giây'}</strong></div></div>
            <div className="csp-ai-hub__metric csp-ai-hub__metric--leads"><span><UserRoundCheck /></span><div><small>{en ? 'NEW LEADS TODAY' : 'LEAD MỚI HÔM NAY'}</small><strong>+24</strong></div></div>
            <div className="csp-ai-hub__flow"><span><BrainCircuit /> {en ? 'Understand needs' : 'Hiểu nhu cầu'}</span><ArrowRight /><span><Tag /> {en ? 'Assign tags' : 'Gán nhãn'}</span><ArrowRight /><span><Database /> {en ? 'Sync CRM' : 'Đồng bộ CRM'}</span></div>
        </div>
    </div>
}
const workflowSteps = [[BrainCircuit, 'Hiểu nhu cầu', 'Nhận diện sản phẩm và ý định mua'], [ShoppingBag, 'Gợi ý sản phẩm', 'Truy xuất giá và tồn kho'], [Quote, 'Tạo báo giá', 'Cá nhân hóa số lượng và ưu đãi'], [Truck, 'Tính phí ship', 'Tra cứu theo địa chỉ giao hàng'], [Tag, 'Gắn nhãn lead', 'Đánh dấu mức độ tiềm năng'], [Database, 'Lưu CRM', 'Tạo lịch follow-up tự động']];
const workflowTimeline = [{ type: 'customer', text: 'Mình cần 20 máy lọc không khí cho văn phòng khoảng 60m², giao đến Quận 7 trong tuần này.', step: 0 }, { type: 'ai', text: 'Mình đã hiểu nhu cầu: 20 máy, ưu tiên văn phòng 60m² và giao trong tuần.', step: 0 }, { type: 'action', title: 'Máy lọc không khí A2 Pro', note: 'Phù hợp 60m² · Còn đủ 20 sản phẩm', icon: ShoppingBag, step: 1 }, { type: 'ai', text: 'A2 Pro phù hợp nhất. Mình đã áp dụng mức giá doanh nghiệp theo số lượng.', step: 1 }, { type: 'action', title: 'Báo giá #BG-2048', note: '20 sản phẩm · Tổng cộng 38.400.000đ', icon: Quote, step: 2 }, { type: 'customer', text: 'Phí giao đến phường Tân Phong, Quận 7 bao nhiêu?', step: 3 }, { type: 'action', title: 'Giao hàng nhanh', note: 'Phí vận chuyển: 32.000đ · Giao trong 1–2 ngày', icon: Truck, step: 3 }, { type: 'action', title: 'Lead tiềm năng cao', note: 'Đã gắn nhãn và ưu tiên cho đội ngũ bán hàng', icon: Tag, step: 4 }, { type: 'action', title: 'Đã lưu vào CRM', note: 'Hồ sơ, báo giá và lịch follow-up đã đồng bộ', icon: Database, step: 5 }];
function WorkflowDemo() { const [visible, setVisible] = useState(1), [paused, setPaused] = useState(false), bodyRef = useRef(null), resumeRef = useRef(null); useEffect(() => { if (paused) return; const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduced) { setVisible(workflowTimeline.length); return } const delay = visible >= workflowTimeline.length ? 3200 : 1450; const timer = setTimeout(() => setVisible(v => v >= workflowTimeline.length ? 1 : v + 1), delay); return () => clearTimeout(timer) }, [visible, paused]); useEffect(() => { const e = bodyRef.current; if (!e) return; e.scrollTo({ top: visible === 1 ? 0 : e.scrollHeight, behavior: 'smooth' }) }, [visible]); useEffect(() => () => clearTimeout(resumeRef.current), []); const pause = () => { setPaused(true); clearTimeout(resumeRef.current); resumeRef.current = setTimeout(() => setPaused(false), 3500) }, activeStep = workflowTimeline[Math.max(0, visible - 1)].step, progress = Math.round(visible / workflowTimeline.length * 100); return <div id="workflow-live-demo" className="csp-workflow-demo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onWheel={pause} onTouchStart={pause}><div className="csp-chat csp-workflow-chat"><ChatHeader /><div className="csp-workflow-chat__progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div><div ref={bodyRef} className="csp-chat__body" aria-live="polite">{workflowTimeline.slice(0, visible).map((entry, i) => { if (entry.type === 'action') { const Icon = entry.icon; return <div className="csp-action-card csp-demo-enter" key={`${visible}-${i}`}><span><Icon /></span><div><b>{entry.title}</b><small>{entry.note}</small></div><CheckCircle2 /></div> } return <div className={`csp-message csp-message--${entry.type} csp-demo-enter`} key={`${visible}-${i}`}>{entry.type === 'ai' && <Sparkles />}{entry.text}</div> })}{visible === workflowTimeline.length && <div className="csp-workflow-chat__complete csp-demo-enter"><CheckCircle2 /> Hoàn tất hành trình — dữ liệu đã sẵn sàng cho đội ngũ bán hàng</div>}</div><Composer /></div><div className="csp-flow" role="list" aria-label="Các bước xử lý tự động">{workflowSteps.map(([Icon, title, text], i) => <article id={`workflow-step-${i + 1}`} role="listitem" className={`csp-flow__item${i === activeStep ? ' is-active' : ''}${i < activeStep || visible === workflowTimeline.length ? ' is-complete' : ''}`} key={title}><b>0{i + 1}</b><span><Icon /></span><div><h3>{title}</h3><p>{text}</p></div>{(i < activeStep || visible === workflowTimeline.length) && <CheckCircle2 className="csp-flow__check" />}</article>)}</div></div> }


function CapabilityTabs({ items, activeId, onSelect }) {
    const carouselRef = useRef(null);
    const draggedRef = useRef(false);
    const pointerStartRef = useRef(null);
    const isCarouselInView = useInView(carouselRef, { amount: .35 });
    const [isCardAreaHovered, setCardAreaHovered] = useState(false);
    const [isDragging, setDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const activeIndex = Math.max(0, items.findIndex(item => item.id === activeId));
    const canScrollUp = activeIndex > 0;
    const canScrollDown = activeIndex < items.length - 1;
    const visibleItems = [-1, 0, 1, 2]
        .map(offset => ({ item: items[activeIndex + offset], offset }))
        .filter(({ item }) => item);

    const selectAt = index => {
        const item = items[index];
        if (item) onSelect(item.id);
    };

    useEffect(() => {
        if (!isCarouselInView || isCardAreaHovered || isDragging || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        const timer = window.setInterval(() => {
            if (!document.hidden && activeIndex < items.length - 1) selectAt(activeIndex + 1);
        }, 3500);
        return () => window.clearInterval(timer);
    }, [activeIndex, items, isCarouselInView, isCardAreaHovered, isDragging]);

    const nudge = direction => {
        const nextIndex = activeIndex + direction;
        if (nextIndex >= 0 && nextIndex < items.length) selectAt(nextIndex);
    };

    const handlePointerDown = event => {
        if (event.button !== undefined && event.button !== 0) return;
        pointerStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
        draggedRef.current = false;
        setDragOffset(0);
        setDragging(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    };

    const handlePointerMove = event => {
        const start = pointerStartRef.current;
        if (!start || start.id !== event.pointerId) return;
        const mobile = window.matchMedia('(max-width: 980px)').matches;
        const distance = mobile ? event.clientX - start.x : event.clientY - start.y;
        if (Math.abs(distance) >= 4) draggedRef.current = true;
        setDragOffset(distance);
        event.preventDefault();
    };

    const finishPointerDrag = event => {
        const start = pointerStartRef.current;
        if (!start || start.id !== event.pointerId) return;
        const mobile = window.matchMedia('(max-width: 980px)').matches;
        const distance = mobile ? event.clientX - start.x : event.clientY - start.y;
        pointerStartRef.current = null;
        setDragging(false);
        setDragOffset(0);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        if (Math.abs(distance) >= 32) selectAt(activeIndex + (distance < 0 ? 1 : -1));
        window.setTimeout(() => { draggedRef.current = false; }, 80);
    };

    const cancelPointerDrag = event => {
        if (pointerStartRef.current?.id !== event.pointerId) return;
        pointerStartRef.current = null;
        setDragging(false);
        setDragOffset(0);
        window.setTimeout(() => { draggedRef.current = false; }, 80);
    };

    const wheelLockRef = useRef(false);
    const handleWheel = event => {
        const direction = event.deltaY > 0 ? 1 : -1;
        if (wheelLockRef.current || Math.abs(event.deltaY) < 4 || (direction > 0 && !canScrollDown) || (direction < 0 && !canScrollUp)) return;
        event.preventDefault();
        event.stopPropagation();
        wheelLockRef.current = true;
        selectAt(activeIndex + direction);
        window.setTimeout(() => { wheelLockRef.current = false; }, 450);
    };

    const mobileDrag = window.matchMedia('(max-width: 980px)').matches;

    return <div ref={carouselRef} className={`csp-capability-scroll${canScrollUp ? ' can-scroll-up' : ''}${canScrollDown ? ' can-scroll-down' : ''}`}>
        {canScrollUp && <button type="button" className="csp-capability-scroll__arrow csp-capability-scroll__arrow--up" aria-label="Xem chức năng trước" onClick={() => nudge(-1)}><ChevronDown /></button>}
        <motion.div
            key={activeId}
            className={`csp-capability-tabs${isDragging ? ' is-dragging' : ''}`}
            role="tablist"
            initial={{ opacity: .72 }}
            animate={{ opacity: 1 }}
            transition={{ duration: isDragging ? 0 : .35, ease: [0.22, 1, 0.36, 1] }}
            style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: mobileDrag ? `translate3d(${dragOffset}px, 0, 0)` : `translate3d(0, ${dragOffset}px, 0)`,
                transition: isDragging ? 'none' : 'transform .28s cubic-bezier(.22, 1, .36, 1)'
            }}
            onMouseEnter={() => setCardAreaHovered(true)}
            onMouseLeave={() => setCardAreaHovered(false)}
            onFocusCapture={() => setCardAreaHovered(true)}
            onBlurCapture={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setCardAreaHovered(false);
            }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerDrag}
            onPointerCancel={cancelPointerDrag}
        >
            {visibleItems.map(({ item, offset }) => {
                const Icon = item.icon;
                return <button draggable="false" id={`capability-tab-${item.id}`} role="tab" aria-selected={offset === 0} aria-controls="capability-media-panel" tabIndex={offset === 0 ? 0 : -1} key={`${item.id}-${offset}`} data-offset={offset} data-distance={Math.abs(offset)} className={offset === 0 ? 'is-active' : ''} onClick={() => { if (draggedRef.current) return; onSelect(item.id); }}><span><Icon /></span><div><strong>{item.title}</strong><small>{item.text}</small></div><ArrowRight /></button>;
            })}
        </motion.div>
        {canScrollDown && <button type="button" className="csp-capability-scroll__arrow csp-capability-scroll__arrow--down" aria-label="Xem chức năng tiếp theo" onClick={() => nudge(1)}><ChevronDown /></button>}
    </div>;
}

function IndustryJourney({ item }) {
    const Icon = item.icon;
    const media = industryMedia[item.id];
    const [activeStep, setActiveStep] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setActiveStep(item.steps.length);
        } else {
            setActiveStep(0);
        }
    }, [item.id, item.steps.length]);

    useEffect(() => {
        if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = setTimeout(
            () => setActiveStep(step => step >= item.steps.length ? 0 : step + 1),
            activeStep >= item.steps.length ? 2600 : 1450
        );
        return () => clearTimeout(timer);
    }, [item.id, item.steps.length, activeStep, paused]);

    const handleImageError = event => {
        event.currentTarget.hidden = true;
        event.currentTarget.parentElement?.classList.add('has-image-fallback');
    };

    return <div className="csp-industry-journey" key={item.id} role="tabpanel" tabIndex="0" id={`industry-panel-${item.id}`} aria-live="polite" aria-labelledby={`industry-tab-${item.id}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
        <header className="csp-industry-journey__intro"><div><small>AI THIẾT KẾ CHO {item.name.toUpperCase()}</small><h3>{item.title}</h3><p>{item.text}</p></div><Link to="/dang-ky">Thiết kế AI cho doanh nghiệp <ArrowRight /></Link></header>
        <div className="csp-industry-story">
            <section className={`csp-industry-scene csp-industry-scene--${media.tone}`}>
                <img src={media.image} alt={`Bối cảnh ${media.scene}`} style={{ objectPosition: media.position }} onError={handleImageError} />
                <div className="csp-industry-scene__shade" />
                <div className="csp-industry-scene__top"><span><Icon /> TÌNH HUỐNG THỰC TẾ</span><small><i /> Đang tiếp nhận</small></div>
                <div className="csp-industry-scene__caption"><small>{media.scene}</small><strong>{item.request}</strong></div>
                <div className="csp-industry-person"><span aria-hidden="true">{media.initials}</span><div><strong>{media.person}</strong><small>{media.role}</small></div><MessageCircle /></div>
            </section>

            <section className="csp-industry-process">
                <div className="csp-industry-engine__label"><Sparkles /> LOSA AI ĐANG XỬ LÝ</div>
                <div className="csp-industry-request"><span aria-hidden="true">{media.initials}</span><div><small>TIN NHẮN VỪA NHẬN</small><p>“{item.request}”</p></div></div>
                <div className="csp-industry-signals">{item.signals.map(([label, value], index) => <span className={activeStep >= 1 ? 'is-visible' : ''} style={{ '--signal-index': index }} key={label}><small>{label}</small>{value}</span>)}</div>
                <div className="csp-industry-pipeline" role="list" aria-label="Luồng xử lý AI"><div className="csp-industry-pipeline__line"><i style={{ height: `${Math.min(activeStep / item.steps.length * 100, 100)}%` }} /><b /></div>{item.steps.map(([StepIcon, title, text], i) => <button type="button" id={`industry-${item.id}-step-${i + 1}`} role="listitem" className={`csp-industry-pipeline__step${activeStep === i ? ' is-active' : ''}${activeStep > i ? ' is-complete' : ''}`} onClick={() => setActiveStep(i)} key={title}><b>0{i + 1}</b><span><StepIcon /></span><div><strong>{title}</strong><small>{text}</small></div>{activeStep > i && <CheckCircle2 className="csp-industry-pipeline__check" />}</button>)}</div>
            </section>

            <section className={`csp-industry-result${activeStep >= item.steps.length ? ' is-ready' : ''}`}>
                <span className="csp-industry-engine__status"><i /> {activeStep >= item.steps.length ? 'HOÀN TẤT' : 'ĐANG XỬ LÝ'}</span>
                <div className="csp-industry-result__icon"><UserRoundCheck /></div><small>KẾT QUẢ ĐẦU RA</small><h4>{item.result}</h4><p>{item.resultText}</p>
                <ul>{item.checklist.map((value, i) => <li style={{ '--result-index': i }} key={value}><CheckCircle2 />{value}</li>)}</ul>
                <div className="csp-industry-result__assignee"><span>MA</span><div><small>CHUYỂN ĐẾN ĐỘI NGŨ</small><strong>Đầy đủ dữ liệu & ngữ cảnh</strong></div><ArrowRight /></div>
            </section>
        </div>
    </div>;
}

const WORKFLOW_PHASES = ['customer', 'clarify', 'request', 'processing', 'response', 'outcome', 'complete'];
const WORKFLOW_DELAYS = [1800, 1900, 1500, 3000, 1800, 2600, 1800];

function useIndustryWorkflow() {
    const panelRef = useRef(null);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return undefined;
        const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.22 });
        observer.observe(panel);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        const timer = window.setTimeout(() => setPhaseIndex(index => (index + 1) % WORKFLOW_PHASES.length), WORKFLOW_DELAYS[phaseIndex]);
        return () => window.clearTimeout(timer);
    }, [isVisible, phaseIndex]);

    return { panelRef, phase: WORKFLOW_PHASES[phaseIndex], phaseIndex };
}

function CustomRetailJourney() {
    const { panelRef, phase, phaseIndex } = useIndustryWorkflow();

    return (
        <div ref={panelRef} className={`custom-industry-panel cip-workflow cip-phase-${phase}`}>
            {/* Header section */}
            <div className="cip-header">
                <div className="cip-header-left">
                    <span className="cip-eyebrow">AI CHO BÁN LẺ & E-COMMERCE</span>
                    <h3 className="cip-title">AI đồng hành trong mọi hành trình mua sắm</h3>
                    <p className="cip-subtitle">Tư vấn thông minh • Gợi ý sản phẩm • Hỗ trợ đặt hàng • Chăm sóc sau bán</p>
                </div>
                <div className="cip-header-right">
                    <button className="cip-btn-view">Xem chi tiết giải pháp <ArrowRight size={16} /></button>
                </div>
            </div>

            {/* 3 Columns Layout */}
            <div className="cip-columns">
                {/* Column 1 */}
                <div className={`cip-col cip-col-1 ${phaseIndex === 0 || phaseIndex === 1 ? 'is-active-col-1' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">01</span>
                        <div>
                            <h4>TIẾP NHẬN & TƯ VẤN</h4>
                            <p>AI trò chuyện, hiểu nhu cầu và tư vấn phù hợp</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-chat-demo">
                        <div className="cip-msg cip-msg-user">
                            <div className="cip-user-avatar">
                                {/* Placeholder cho avatar user */}
                                <img src="" alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            </div>
                            Mình cần máy xay sinh tố dung tích lớn, giá dưới 1 triệu<br /><span>10:30</span>
                        </div>
                        <div className="cip-msg cip-msg-ai">Dạ, tôi sẽ kiểm tra sản phẩm, tồn kho và ưu đãi phù hợp cho bạn.<br /><span>10:30</span></div>
                        <div className="cip-workflow-status"><PlugZap size={14} /> AI đang kiểm tra catalog, tồn kho và vận chuyển…</div>
                        <div className="cip-msg cip-msg-ai cip-final-reply">Tôi đã tìm thấy 3 lựa chọn phù hợp ngân sách của bạn:<br /><span>10:31</span></div>

                        {/* Product Cards */}
                        <div className="cip-products">
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh SP</div>
                                <h5>Máy xay Philips HR2041</h5>
                                <p className="price">890.000đ</p>
                                <a href="#">Xem chi tiết</a>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh SP</div>
                                <h5>Máy xay Bluestone BLB-5338</h5>
                                <p className="price">750.000đ</p>
                                <a href="#">Xem chi tiết</a>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh SP</div>
                                <h5>Máy xay Kangaroo KG3B6</h5>
                                <p className="price">650.000đ</p>
                                <a href="#">Xem chi tiết</a>
                            </div>
                        </div>
                    </div>
                    <div className="cip-col-footer">
                        <CheckCircle2 size={16} /> Thu thập thông tin & sở thích khách hàng
                    </div>
                </div>

                {/* Column 2 */}
                <div className={`cip-col cip-col-2 ${phaseIndex === 2 || phaseIndex === 3 ? 'is-active-col-2' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">02</span>
                        <div>
                            <h4>XỬ LÝ & KẾT NỐI HỆ THỐNG</h4>
                            <p>Gọi API đến các nguồn dữ liệu, hệ thống và đối tác</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-engine-demo">
                        <div className="cip-engine-top">
                            <div className="cip-data-list">
                                <span className="cip-data-item">Nhu cầu</span>
                                <span className="cip-data-item">Sở thích</span>
                                <span className="cip-data-item">Ngân sách</span>
                                <span className="cip-data-item">Lịch sử mua</span>
                                <span className="cip-data-item">Vị trí</span>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-engine-center">
                                <span>AI ENGINE</span>
                                <div className="cip-brain-icon">
                                    <BrainCircuit size={32} />
                                </div>
                                <p>Phân tích & xử lý</p>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-data-list">
                                <span className="cip-data-item">Gợi ý sản phẩm</span>
                                <span className="cip-data-item">Kiểm tra tồn kho</span>
                                <span className="cip-data-item">Tính giá & phí ship</span>
                                <span className="cip-data-item">Ưu đãi áp dụng</span>
                                <span className="cip-data-item">Tạo đơn hàng</span>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">KẾT NỐI & TÍCH HỢP</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><Database size={20} /><span>Hệ thống Sản phẩm</span></div>
                                <div className="cip-icon-box"><Store size={20} /><span>Kho hàng Tồn kho</span></div>
                                <div className="cip-icon-box"><Zap size={20} /><span>Cổng thanh toán</span></div>
                                <div className="cip-icon-box"><Truck size={20} /><span>Đơn vị vận chuyển</span></div>
                                <div className="cip-icon-box"><UserRoundCheck size={20} /><span>CRM Khách hàng</span></div>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">CÔNG CỤ & NGUỒN LỰC</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><Database size={20} /><span>Cơ sở dữ liệu Data</span></div>
                                <div className="cip-icon-box"><Tag size={20} /><span>Bộ máy khuyến mãi</span></div>
                                <div className="cip-icon-box"><MessageCircle size={20} /><span>CSKH (Nhân viên)</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3 */}
                <div className={`cip-col cip-col-3 ${phaseIndex === 4 || phaseIndex === 5 || phaseIndex === 6 ? 'is-active-col-3' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">03</span>
                        <div>
                            <h4>KẾT QUẢ & GIÁ TRỊ AI</h4>
                            <p>AI tư vấn đúng nhu cầu, tạo cơ hội bán hàng và tự động hóa vận hành</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-result-demo">
                        <div className="cip-success-card">
                            <div className="icon"><Check size={20} /></div>
                            <div>
                                <h5>Đặt hàng thành công!</h5>
                                <p>Đơn hàng của bạn đã được tạo.</p>
                            </div>
                        </div>

                        <div className="cip-order-table">
                            <div className="cip-order-row">
                                <span className="cip-order-label">Mã đơn hàng</span>
                                <span className="cip-order-value">#LS247-250509-001</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Sản phẩm</span>
                                <span className="cip-order-value">Máy xay Philips HR2041</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Số lượng</span>
                                <span className="cip-order-value">1</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Tổng tiền</span>
                                <span className="cip-order-value total">890.000đ</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Phương thức thanh toán</span>
                                <span className="cip-order-value">Ví Momo</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Phương thức giao hàng</span>
                                <span className="cip-order-value">Giao hàng tiêu chuẩn</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Dự kiến giao</span>
                                <span className="cip-order-value">Thứ 6, 15/05/2025</span>
                            </div>
                        </div>

                        <div className="cip-noti-card">
                            <div className="icon"><Bot size={20} /></div>
                            <div>
                                <h5>Thông báo & chăm sóc sau bán</h5>
                                <p>Theo dõi đơn hàng, hỗ trợ đổi trả, bảo hành...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Features */}
            <div className="cip-features">
                <div className="cip-feature-item">
                    <div className="icon"><MessageCircle size={24} /></div>
                    <div>
                        <h5>Tư vấn 24/7</h5>
                        <p>Không bỏ lỡ khách hàng</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Zap size={24} /></div>
                    <div>
                        <h5>Tăng chuyển đổi</h5>
                        <p>Gợi ý đúng - chốt nhanh</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Globe2 size={24} /></div>
                    <div>
                        <h5>Kết nối đa kênh</h5>
                        <p>Web, Facebook, Zalo, Tiktok...</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Store size={24} /></div>
                    <div>
                        <h5>Quản lý toàn diện</h5>
                        <p>Đơn hàng, kho, vận chuyển</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Database size={24} /></div>
                    <div>
                        <h5>Báo cáo thông minh</h5>
                        <p>Dữ liệu thời gian thực</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CustomEducationJourney() {
    const { panelRef, phase, phaseIndex } = useIndustryWorkflow();

    return (
        <div ref={panelRef} className={`custom-industry-panel cip-theme-edu cip-workflow cip-phase-${phase}`}>
            {/* Header section */}
            <div className="cip-header">
                <div className="cip-header-left">
                    <span className="cip-eyebrow">AI THIẾT KẾ CHO GIÁO DỤC</span>
                    <h3 className="cip-title">AI đồng hành trong mọi hoạt động giáo dục</h3>
                    <p className="cip-subtitle">Tự động hóa tuyển sinh • Hỗ trợ học tập • Quản lý lớp học • Chăm sóc học viên</p>
                </div>
                <div className="cip-header-right">
                    <button className="cip-btn-view">Thiết kế AI cho giáo dục <ArrowRight size={16} /></button>
                </div>
            </div>

            {/* 3 Columns Layout */}
            <div className="cip-columns">
                {/* Column 1 */}
                <div className={`cip-col cip-col-1 ${phaseIndex === 0 || phaseIndex === 1 ? 'is-active-col-1' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">01</span>
                        <div>
                            <h4>TIẾP NHẬN & TƯ VẤN</h4>
                            <p>AI trò chuyện, tư vấn và thu thập thông tin</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-chat-demo">
                        <div className="cip-chat-header">
                            <div className="icon"><Sparkles size={16} /></div>
                            <div>
                                <h5>AI Assistant</h5>
                                <p>Hỗ trợ 24/7</p>
                            </div>
                        </div>
                        {/* Chat Bubbles */}
                        <div className="cip-msg cip-msg-ai">Chào bạn! Bạn đang quan tâm khóa học nào tại Losa Academy ạ?</div>
                        <div className="cip-msg cip-msg-user">
                            <div className="cip-user-avatar">
                                <img src="" alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            </div>
                            Mình muốn học lập trình Python cho người mới bắt đầu.
                        </div>
                        <div className="cip-msg cip-msg-ai">Tuyệt vời! Đây là khóa học phù hợp cho người mới bắt đầu.</div>

                        {/* Product Cards */}
                        <div className="cip-products">
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Python Cơ bản cho người mới</h5>
                                <p className="price" style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal', margin: 0 }}>12 buổi</p>
                                <p className="price">2.490.000đ</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Thiết kế Web HTML, CSS</h5>
                                <p className="price" style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal', margin: 0 }}>10 buổi</p>
                                <p className="price">1.990.000đ</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>AI & Machine Learning cơ bản</h5>
                                <p className="price" style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal', margin: 0 }}>15 buổi</p>
                                <p className="price">3.490.000đ</p>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="cip-tags-grid">
                            <div className="cip-tag-item">
                                <small>NHU CẦU</small>
                                <span>Học lập trình Python</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>THỜI GIAN</small>
                                <span>Buổi tối (T2,4,6)</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>TRÌNH ĐỘ</small>
                                <span>Người mới bắt đầu</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>HÌNH THỨC</small>
                                <span>Online qua Zoom</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2 */}
                <div className={`cip-col cip-col-2 ${phaseIndex === 2 || phaseIndex === 3 ? 'is-active-col-2' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">02</span>
                        <div>
                            <h4>XỬ LÝ & KẾT NỐI HỆ THỐNG</h4>
                            <p>Gọi API đến các hệ thống, công cụ và dữ liệu</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-engine-demo">
                        <div className="cip-engine-top">
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{ marginBottom: '4px' }}>INPUT</span>
                                <span className="cip-data-item">Nhu cầu học tập</span>
                                <span className="cip-data-item">Thông tin cá nhân</span>
                                <span className="cip-data-item">Thời gian học</span>
                                <span className="cip-data-item">Ngân sách</span>
                                <span className="cip-data-item">Kênh đăng ký</span>
                            </div>
                            <ArrowRight className="text-indigo-400" size={20} />
                            <div className="cip-engine-center">
                                <span>AI ENGINE</span>
                                <div className="cip-brain-icon">
                                    <GraduationCap size={32} />
                                </div>
                                <p>Phân tích & xử lý</p>
                            </div>
                            <ArrowRight className="text-indigo-400" size={20} />
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{ marginBottom: '4px' }}>OUTPUT</span>
                                <span className="cip-data-item">Gợi ý khóa học</span>
                                <span className="cip-data-item">Lịch học phù hợp</span>
                                <span className="cip-data-item">Giảng viên phù hợp</span>
                                <span className="cip-data-item">Chương trình học</span>
                                <span className="cip-data-item">Ưu đãi & học phí</span>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">GỌI API / KẾT NỐI</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><Layers3 size={20} /><span>Hệ thống LMS</span></div>
                                <div className="cip-icon-box"><Users size={20} /><span>Cơ sở dữ liệu Học viên</span></div>
                                <div className="cip-icon-box"><Calendar size={20} /><span>Lịch học & Phòng học</span></div>
                                <div className="cip-icon-box"><Zap size={20} /><span>Thanh toán (VNPAY, Momo...)</span></div>
                                <div className="cip-icon-box"><Mail size={20} /><span>Email / SMS Marketing</span></div>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">CÔNG CỤ & NGUỒN LỰC</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><ClipboardCheck size={20} /><span>Kho bài giảng & tài liệu</span></div>
                                <div className="cip-icon-box"><HelpCircle size={20} /><span>Ngân hàng câu hỏi</span></div>
                                <div className="cip-icon-box"><Presentation size={20} /><span>Công cụ thi & chấm điểm</span></div>
                                <div className="cip-icon-box"><BarChart size={20} /><span>Báo cáo học tập & tiến độ</span></div>
                                <div className="cip-icon-box"><Users size={20} /><span>Hỗ trợ giáo vụ & giảng viên</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3 */}
                <div className={`cip-col cip-col-3 ${phaseIndex === 4 || phaseIndex === 5 || phaseIndex === 6 ? 'is-active-col-3' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">03</span>
                        <div>
                            <h4>KẾT QUẢ & GIÁ TRỊ AI</h4>
                            <p>AI cá nhân hóa tư vấn, tăng tốc tuyển sinh và đồng hành cùng học viên</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-result-demo">
                        <div className="cip-success-card">
                            <div className="icon"><Check size={20} /></div>
                            <div>
                                <h5>Đăng ký khóa học thành công!</h5>
                                <p>Chúng tôi đã gửi thông tin chi tiết đến bạn.</p>
                            </div>
                        </div>

                        <div className="cip-order-table">
                            <div className="cip-order-row">
                                <span className="cip-order-label">Khóa học</span>
                                <span className="cip-order-value">Python cơ bản cho người mới</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Mã đăng ký</span>
                                <span className="cip-order-value">#LSA247-EDU-250509-001</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Lịch học</span>
                                <span className="cip-order-value">T2, T4, T6 (19:00 - 21:00)</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Hình thức</span>
                                <span className="cip-order-value">Online qua Zoom</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Khai giảng</span>
                                <span className="cip-order-value">Thứ 2, 20/05/2025</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Học phí</span>
                                <span className="cip-order-value total">2.490.000đ</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Giảng viên</span>
                                <span className="cip-order-value">Nguyễn Hoàng Anh</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Thanh toán</span>
                                <span className="cip-order-value">Đã thanh toán qua VNPAY</span>
                            </div>
                        </div>

                        <div className="cip-noti-card">
                            <div className="icon"><Bot size={20} /></div>
                            <div>
                                <h5>Nhắc nhở lịch học</h5>
                                <p>Chúng tôi sẽ gửi lịch học, bài tập và thông báo qua Zalo & Email.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Features */}
            <div className="cip-features">
                <div className="cip-feature-item">
                    <div className="icon"><Bot size={24} /></div>
                    <div>
                        <h5>Tư vấn tuyển sinh 24/7</h5>
                        <p>Tự động tư vấn & giải đáp</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Calendar size={24} /></div>
                    <div>
                        <h5>Quản lý lớp học</h5>
                        <p>Theo dõi học viên & lịch học</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><BookOpen size={24} /></div>
                    <div>
                        <h5>Hỗ trợ học tập thông minh</h5>
                        <p>Giải đáp & gợi ý tài liệu</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><BarChart size={24} /></div>
                    <div>
                        <h5>Đánh giá & Báo cáo</h5>
                        <p>Theo dõi tiến độ học tập</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Users size={24} /></div>
                    <div>
                        <h5>CSKH & Giáo vụ tự động</h5>
                        <p>Hỗ trợ nhanh chóng, kịp thời</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CustomHealthJourney() {
    const { panelRef, phase, phaseIndex } = useIndustryWorkflow();

    return (
        <div ref={panelRef} className={`custom-industry-panel cip-theme-health cip-workflow cip-phase-${phase}`}>
            {/* Header section */}
            <div className="cip-header">
                <div className="cip-header-left">
                    <span className="cip-eyebrow">AI THIẾT KẾ CHO Y TẾ & PHÒNG KHÁM</span>
                    <h3 className="cip-title">AI đồng hành trong mọi hoạt động y tế & phòng khám</h3>
                    <p className="cip-subtitle">Tư vấn sức khỏe • Đặt lịch khám • Quản lý bệnh nhân • Chăm sóc sau khám</p>
                </div>
                <div className="cip-header-right">
                    <button className="cip-btn-view">Thiết kế AI cho y tế <ArrowRight size={16} /></button>
                </div>
            </div>

            {/* 3 Columns Layout */}
            <div className="cip-columns">
                {/* Column 1 */}
                <div className={`cip-col cip-col-1 ${phaseIndex <= 2 ? 'is-active-col-1' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">01</span>
                        <div>
                            <h4>TIẾP NHẬN & TƯ VẤN</h4>
                            <p>AI trò chuyện, thu thập triệu chứng và thông tin</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-chat-demo">
                        <div className="cip-chat-header">
                            <div className="icon"><Sparkles size={16} /></div>
                            <div>
                                <h5>AI Assistant</h5>
                                <p>Hỗ trợ 24/7</p>
                            </div>
                        </div>
                        <div className="cip-msg cip-msg-user">
                            <div className="cip-user-avatar">
                                <img src="" alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            </div>
                            Tôi bị đau đầu, chóng mặt và buồn nôn từ sáng nay.
                        </div>
                        <div className="cip-msg cip-msg-ai">
                            Tôi đã ghi nhận. Triệu chứng bắt đầu chính xác từ lúc nào, bạn có sốt hoặc đau mỏi cơ không?
                        </div>
                        <div className="cip-workflow-status"><PlugZap size={14} /> AI đang kiểm tra lịch bác sĩ và chuyên khoa phù hợp…</div>
                        <div className="cip-typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span style={{ marginLeft: '4px' }}>AI đang tổng hợp thông tin...</span>
                        </div>
                        <div className="cip-msg cip-msg-ai cip-final-reply">Tôi đã tìm thấy lịch khám phù hợp. Thông tin này nhằm hỗ trợ phân luồng, không thay thế chẩn đoán của bác sĩ.</div>

                        {/* Action Buttons */}
                        <div className="cip-chat-actions">
                            <button className="cip-chat-action-btn"><CalendarClock size={14} /> Đặt lịch khám</button>
                            <button className="cip-chat-action-btn"><Stethoscope size={14} /> Hỏi bác sĩ online</button>
                            <button className="cip-chat-action-btn"><FileHeart size={14} /> Xem kết quả cũ</button>
                        </div>

                        {/* Tags */}
                        <div className="cip-tags-grid">
                            <div className="cip-tag-item">
                                <small>HỌ TÊN</small>
                                <span>Nguyễn Văn A</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>SĐT</small>
                                <span>0901 234 567</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>NĂM SINH</small>
                                <span>1990</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>GIỚI TÍNH</small>
                                <span>Nam</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>TIỀN SỬ BỆNH</small>
                                <span>Không có</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>DỊ ỨNG</small>
                                <span>Phấn hoa</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2 */}
                <div className={`cip-col cip-col-2 ${phaseIndex >= 3 && phaseIndex <= 4 ? 'is-active-col-2' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">02</span>
                        <div>
                            <h4>XỬ LÝ & KẾT NỐI HỆ THỐNG</h4>
                            <p>Gọi API đến các hệ thống, công cụ và dữ liệu</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-engine-demo">
                        <div className="cip-engine-top">
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{ marginBottom: '4px' }}>INPUT</span>
                                <span className="cip-data-item">Triệu chứng</span>
                                <span className="cip-data-item">Tiền sử bệnh</span>
                                <span className="cip-data-item">Thông tin cá nhân</span>
                                <span className="cip-data-item">Kết quả xét nghiệm</span>
                                <span className="cip-data-item">Hình ảnh (nếu có)</span>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-engine-center">
                                <div className="cip-brain-icon">
                                    <BrainCircuit size={32} />
                                </div>
                                <span style={{ color: '#f97316', marginTop: '4px', fontSize: '12px' }}>AI ENGINE</span>
                                <p>Phân tích & xử lý</p>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{ marginBottom: '4px' }}>OUTPUT</span>
                                <span className="cip-data-item">Gợi ý chuyên khoa</span>
                                <span className="cip-data-item">Ưu tiên mức độ</span>
                                <span className="cip-data-item">Đặt lịch phù hợp</span>
                                <span className="cip-data-item">Lời nhắc & hướng dẫn</span>
                                <span className="cip-data-item">Hồ sơ bệnh án</span>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">GỌI API / KẾT NỐI</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><Hospital size={20} /><span>HIS<br />Bệnh viện</span></div>
                                <div className="cip-icon-box"><ClipboardPlus size={20} /><span>EMR<br />Hồ sơ bệnh án</span></div>
                                <div className="cip-icon-box"><Image size={20} /><span>PACS<br />Hình ảnh</span></div>
                                <div className="cip-icon-box"><FlaskConical size={20} /><span>LIS<br />Xét nghiệm</span></div>
                                <div className="cip-icon-box"><Video size={20} /><span>Telehealth<br />Khám online</span></div>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">CÔNG CỤ & NGUỒN LỰC</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><Pill size={20} /><span>CSDL Dược phẩm</span></div>
                                <div className="cip-icon-box"><Shield size={20} /><span>Hướng dẫn BYT</span></div>
                                <div className="cip-icon-box"><BarChart size={20} /><span>Báo cáo & Thống kê</span></div>
                                <div className="cip-icon-box"><CalendarClock size={20} /><span>Nhắc lịch & Tái khám</span></div>
                                <div className="cip-icon-box"><Heart size={20} /><span>CSKH & Chăm sóc</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3 */}
                <div className={`cip-col cip-col-3 ${phaseIndex >= 5 ? 'is-active-col-3' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">03</span>
                        <div>
                            <h4>KẾT QUẢ & GIÁ TRỊ AI</h4>
                            <p>AI phân luồng nhu cầu, giảm tải lễ tân và chăm sóc bệnh nhân liên tục</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-result-demo">
                        <div className="cip-success-card">
                            <div className="icon"><Check size={20} /></div>
                            <div>
                                <h5>Đặt lịch khám thành công!</h5>
                                <p>Thông tin đã được gửi đến bạn qua SMS & Email.</p>
                            </div>
                        </div>

                        <div className="cip-order-table">
                            <div className="cip-order-row">
                                <span className="cip-order-label">Chuyên khoa</span>
                                <span className="cip-order-value" style={{ fontWeight: 700 }}>Thần kinh</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Bác sĩ</span>
                                <span className="cip-order-value">BS. Trần Minh Khang</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Thời gian</span>
                                <span className="cip-order-value">Thứ 4, 22/05/2025 - 09:00</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Địa điểm</span>
                                <span className="cip-order-value">Phòng khám Losa247 - Cầu Giấy</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Mã đặt lịch</span>
                                <span className="cip-order-value">#LS247-YN250522-001</span>
                            </div>
                            <div className="cip-order-row" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
                                <span className="cip-order-label">Ghi chú</span>
                                <span className="cip-order-value" style={{ color: '#3b82f6' }}>Mang theo CCCD & BHYT (nếu có)</span>
                            </div>
                        </div>

                        <div className="cip-noti-card">
                            <div className="icon"><Bot size={20} /></div>
                            <div>
                                <h5>Nhắc nhở trước lịch hẹn</h5>
                                <p>Chúng tôi sẽ gửi nhắc trước 24h qua SMS.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Features */}
            <div className="cip-features cip-features-6">
                <div className="cip-feature-item">
                    <div className="icon"><Stethoscope size={24} /></div>
                    <div>
                        <h5>Tư vấn sức khỏe 24/7</h5>
                        <p>AI tư vấn & giải đáp tức thì</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><CalendarClock size={24} /></div>
                    <div>
                        <h5>Đặt lịch nhanh chóng</h5>
                        <p>Theo bác sĩ & thời gian mong muốn</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><FileHeart size={24} /></div>
                    <div>
                        <h5>Quản lý hồ sơ bệnh án</h5>
                        <p>Lưu trữ & theo dõi lịch sử khám</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Clock3 size={24} /></div>
                    <div>
                        <h5>Nhắc lịch & tái khám</h5>
                        <p>Tự động nhắc lịch & chăm sóc</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><BarChart size={24} /></div>
                    <div>
                        <h5>Báo cáo & thống kê</h5>
                        <p>Phân tích hiệu quả phòng khám</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Shield size={24} /></div>
                    <div>
                        <h5>Bảo mật & an toàn</h5>
                        <p>Tuân thủ chuẩn y tế & bảo mật</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CustomB2BJourney() {
    const { panelRef, phase, phaseIndex } = useIndustryWorkflow();

    return (
        <div ref={panelRef} className={`custom-industry-panel cip-theme-b2b cip-workflow cip-phase-${phase}`}>
            {/* Header section */}
            <div className="cip-header">
                <div className="cip-header-left">
                    <span className="cip-eyebrow">AI THIẾT KẾ CHO DỊCH VỤ B2B</span>
                    <h3 className="cip-title">AI đồng hành trong mọi quy trình Booking khách sạn & du lịch</h3>
                    <p className="cip-subtitle">Tự động tìm kiếm • So sánh giá • Đặt phòng nhanh chóng • Quản lý đặt phòng & thanh toán • Chăm sóc khách hàng 24/7</p>
                </div>
                <div className="cip-header-right">
                    <button className="cip-btn-view">Thiết kế AI cho Booking <ArrowRight size={16} /></button>
                </div>
            </div>

            {/* 3 Columns Layout */}
            <div className="cip-columns">
                {/* Column 1 */}
                <div className={`cip-col cip-col-1 ${phaseIndex <= 2 ? 'is-active-col-1' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">01</span>
                        <div>
                            <h4>TIẾP NHẬN & TƯ VẤN</h4>
                            <p>AI tư vấn điểm đến, gợi ý khách sạn phù hợp</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-chat-demo">
                        <div className="cip-chat-header">
                            <div className="icon"><Sparkles size={16} /></div>
                            <div>
                                <h5>AI Assistant</h5>
                                <p>Hỗ trợ 24/7</p>
                            </div>
                        </div>
                        {/* Chat Bubbles */}
                        <div className="cip-msg cip-msg-user">
                            <div className="cip-user-avatar">
                                <img src="" alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            </div>
                            Mình muốn đặt khách sạn ở Đà Nẵng.<br />2 đêm, 2 người lớn, view biển.
                        </div>
                        <div className="cip-msg cip-msg-ai">Dạ, Losa247 gợi ý một số khách sạn phù hợp ngân sách và nhu cầu của Anh/Chị nhé!</div>

                        {/* Product Cards */}
                        <div className="cip-products">
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Mường Thanh Luxury Đà Nẵng</h5>
                                <span className="cip-stars">★★★★★</span>
                                <p className="price">Từ 1.250.000đ/đêm</p>
                                <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>View biển, ăn sáng</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Sala Danang Beach Hotel</h5>
                                <span className="cip-stars">★★★★★</span>
                                <p className="price">Từ 1.850.000đ/đêm</p>
                                <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Hồ bơi vô cực, gần biển</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Furama Resort Đà Nẵng</h5>
                                <span className="cip-stars">★★★★★</span>
                                <p className="price">Từ 3.200.000đ/đêm</p>
                                <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Resort 5 sao, bãi biển riêng</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="cip-chat-actions">
                            <button className="cip-chat-action-btn"><Search size={14} /> Tìm kiếm khách sạn</button>
                            <button className="cip-chat-action-btn"><ArrowLeftRight size={14} /> So sánh giá & tiện ích</button>
                            <button className="cip-chat-action-btn"><Map size={14} /> Gợi ý lịch trình</button>
                        </div>

                        {/* Tags */}
                        <div className="cip-tags-grid">
                            <div className="cip-tag-item">
                                <small>ĐỊA ĐIỂM</small>
                                <span><MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} /> Đà Nẵng</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>THỜI GIAN</small>
                                <span><Calendar size={10} style={{ display: 'inline', marginRight: '2px' }} /> 2 đêm (20/05 - 22/05)</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>KHÁCH</small>
                                <span><Users size={10} style={{ display: 'inline', marginRight: '2px' }} /> 2 người lớn</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>NGÂN SÁCH</small>
                                <span><Wallet size={10} style={{ display: 'inline', marginRight: '2px' }} /> ~2.000.000đ/đêm</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>LOẠI PHÒNG</small>
                                <span><Bed size={10} style={{ display: 'inline', marginRight: '2px' }} /> Deluxe / Ocean View</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>ƯU TIÊN</small>
                                <span><Check size={10} style={{ display: 'inline', marginRight: '2px' }} /> Gần biển, ăn sáng</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2 */}
                <div className={`cip-col cip-col-2 ${phaseIndex >= 3 && phaseIndex <= 4 ? 'is-active-col-2' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">02</span>
                        <div>
                            <h4>XỬ LÝ & KẾT NỐI HỆ THỐNG</h4>
                            <p>AI kết nối đối tác, kiểm tra & xác nhận đặt phòng</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-engine-demo">
                        <div className="cip-engine-top">
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{ marginBottom: '4px' }}>INPUT</span>
                                <span className="cip-data-item">Điểm đến, thời gian</span>
                                <span className="cip-data-item">Số lượng khách</span>
                                <span className="cip-data-item">Loại phòng yêu cầu</span>
                                <span className="cip-data-item">Ngân sách dự kiến</span>
                                <span className="cip-data-item">Tiện ích mong muốn</span>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-engine-center">
                                <div className="cip-brain-icon">
                                    <BrainCircuit size={32} />
                                </div>
                                <span style={{ color: '#f97316', marginTop: '4px', fontSize: '12px' }}>AI ENGINE</span>
                                <p>Phân tích & xử lý</p>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{ marginBottom: '4px' }}>OUTPUT</span>
                                <span className="cip-data-item">Tìm kiếm đối tác</span>
                                <span className="cip-data-item">So sánh giá & phòng</span>
                                <span className="cip-data-item">Kiểm tra tình trạng</span>
                                <span className="cip-data-item">Giữ phòng tạm thời</span>
                                <span className="cip-data-item">Xác nhận đặt phòng</span>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">KẾT NỐI ĐỐI TÁC</div>
                            <div className="cip-logos-row">
                                <span style={{ color: '#e11d48' }}>agoda</span>
                                <span style={{ color: '#003580' }}>Booking.com</span>
                                <span style={{ color: '#0000a0' }}>Expedia</span>
                                <span style={{ color: '#1ba0e2' }}>traveloka</span>
                                <span style={{ color: '#0f294d' }}>Trip.com</span>
                                <span>Hotel Direct<br /><small style={{ fontSize: '8px', fontWeight: 400 }}>(đối tác)</small></span>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">QUY TRÌNH TỰ ĐỘNG</div>
                            <div className="cip-process-row">
                                <div className="cip-process-box"><Search size={16} /><span>Tìm kiếm<br />khách sạn</span></div>
                                <div className="cip-process-box"><ArrowLeftRight size={16} /><span>So sánh giá<br />& tiện ích</span></div>
                                <div className="cip-process-box"><Bed size={16} /><span>Kiểm tra<br />phòng trống</span></div>
                                <div className="cip-process-box"><Clock3 size={16} /><span>Giữ phòng<br />tạm thời</span></div>
                                <div className="cip-process-box"><ShieldCheck size={16} /><span>Xác nhận &<br />đặt phòng</span></div>
                                <div className="cip-process-box"><Ticket size={16} /><span>Gửi voucher<br />cho khách</span></div>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">CÔNG CỤ & NGUỒN LỰC</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><Building2 size={20} /><span>Hotel API<br />Connector</span></div>
                                <div className="cip-icon-box"><Settings size={20} /><span>Channel<br />Manager</span></div>
                                <div className="cip-icon-box"><CreditCard size={20} /><span>Payment<br />Gateway</span></div>
                                <div className="cip-icon-box"><Users size={20} /><span>CRM<br />Khách hàng</span></div>
                                <div className="cip-icon-box"><BarChart size={20} /><span>Báo cáo &<br />Thống kê</span></div>
                                <div className="cip-icon-box"><Headset size={20} /><span>Hỗ trợ 24/7<br />AI & Human</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3 */}
                <div className={`cip-col cip-col-3 ${phaseIndex >= 5 ? 'is-active-col-3' : ''}`}>
                    <div className="cip-col-header">
                        <span className="cip-step-num">03</span>
                        <div>
                            <h4>KẾT QUẢ & GIÁ TRỊ AI</h4>
                            <p>AI tổng hợp yêu cầu, so sánh phương án và bàn giao đầy đủ ngữ cảnh</p>
                        </div>
                    </div>
                    <div className="cip-col-content cip-result-demo">
                        <div className="cip-success-card">
                            <div className="icon"><Check size={20} /></div>
                            <div>
                                <h5>Đặt phòng thành công!</h5>
                                <p>Thông tin đã được gửi đến Email và SMS.</p>
                            </div>
                        </div>

                        <div className="cip-result-hotel-card">
                            <div className="img">Ảnh SP</div>
                            <div className="info">
                                <h5>Sala Danang Beach Hotel</h5>
                                <span className="cip-stars">★★★★★</span>
                                <p>Deluxe Ocean View</p>
                            </div>
                        </div>

                        <div className="cip-order-table">
                            <div className="cip-order-row">
                                <span className="cip-order-label">Mã đặt phòng</span>
                                <span className="cip-order-value" style={{ fontWeight: 700 }}>#LS247-BOOK-250522-001</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Nhận phòng</span>
                                <span className="cip-order-value">Thứ 3, 20/05/2025 (14:00)</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Trả phòng</span>
                                <span className="cip-order-value">Thứ 5, 22/05/2025 (12:00)</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Số đêm</span>
                                <span className="cip-order-value">2 đêm</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Số khách</span>
                                <span className="cip-order-value">2 người lớn</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Tổng tiền</span>
                                <span className="cip-order-value total">3.700.000đ</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Trạng thái</span>
                                <span className="cip-order-value" style={{ color: '#16a34a', fontWeight: 600 }}>Đã xác nhận</span>
                            </div>
                            <div className="cip-order-row">
                                <span className="cip-order-label">Thanh toán</span>
                                <span className="cip-order-value">Đã thanh toán (VNPAY)</span>
                            </div>
                        </div>

                        <div className="cip-noti-card">
                            <div className="icon"><Headset size={20} /></div>
                            <div>
                                <h5>Nhắc nhở & Chăm sóc</h5>
                                <p>Chúng tôi sẽ gửi thông tin chuyến đi và nhắc check-in trước 24h.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Features */}
            <div className="cip-features cip-features-6">
                <div className="cip-feature-item">
                    <div className="icon"><Search size={24} /></div>
                    <div>
                        <h5>Tìm kiếm thông minh</h5>
                        <p>AI gợi ý khách sạn phù hợp</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><ArrowLeftRight size={24} /></div>
                    <div>
                        <h5>So sánh giá đa kênh</h5>
                        <p>Từ nhiều nền tảng uy tín</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><ShieldCheck size={24} /></div>
                    <div>
                        <h5>Đặt phòng nhanh chóng</h5>
                        <p>Xác nhận tức thì</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Building2 size={24} /></div>
                    <div>
                        <h5>Quản lý đặt phòng</h5>
                        <p>Dễ dàng & tập trung</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><BarChart size={24} /></div>
                    <div>
                        <h5>Báo cáo doanh thu</h5>
                        <p>Theo thời gian thực</p>
                    </div>
                </div>
                <div className="cip-feature-item">
                    <div className="icon"><Headset size={24} /></div>
                    <div>
                        <h5>Hỗ trợ 24/7</h5>
                        <p>AI & đội ngũ chuyên nghiệp</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnimatedNumber({ value }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, (latest) => Math.round(latest));

    useEffect(() => {
        if (isInView) {
            animate(motionValue, value, { duration: 1, ease: "easeOut" });
        }
    }, [isInView, value, motionValue]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function ChatbotSolutionsPage() {
    const { locale } = useI18n();
    const en = locale === 'en';
    const [cap, setCap] = useState('lead'), [industry, setIndustry] = useState('retail'), [rolloutActive, setRolloutActive] = useState(0), [rolloutPaused, setRolloutPaused] = useState(false), [faqOpen, setFaq] = useState(null);
    const rolloutNavRef = useRef(null);
    const q = useApiQuery(() => publicFaqsService.getList({ pageType: 'solutions', serviceDetail: 'chatbot' }, locale), [locale]);
    const fallback = en ? [
        { _id: 'accuracy', question: 'What happens when the AI Chatbot cannot answer accurately?', answer: 'Losa limits approved data sources, applies confidence thresholds and transfers the conversation to an employee when information is insufficient.' },
        { _id: 'integration', question: 'Can Losa connect to our CRM or internal systems?', answer: 'Yes. Losa supports CRM, product data and business-system synchronization through APIs based on the implementation scope.' },
        { _id: 'launch', question: 'How long does chatbot implementation take?', answer: 'Timing depends on your data and integration requirements. Losa surveys, standardizes and tests the solution before launch.' }
    ] : [
        { _id: 'accuracy', question: 'Chatbot AI trả lời sai thì xử lý thế nào?', answer: 'Losa giới hạn nguồn dữ liệu, thiết lập ngưỡng tin cậy và chuyển hội thoại cho nhân viên khi AI chưa đủ thông tin.' },
        { _id: 'integration', question: 'Losa có kết nối CRM hoặc hệ thống riêng không?', answer: 'Có. Losa hỗ trợ đồng bộ CRM, dữ liệu sản phẩm và hệ thống nghiệp vụ thông qua API theo phạm vi triển khai.' },
        { _id: 'launch', question: 'Mất bao lâu để triển khai chatbot?', answer: 'Thời gian phụ thuộc dữ liệu và mức độ tích hợp. Đội ngũ Losa sẽ khảo sát, chuẩn hóa và kiểm thử trước khi vận hành.' }
    ];
    const faqs = q.data?.items?.length ? q.data.items : fallback;
    const localizedCaps = en ? [
        { ...caps[0], kicker: 'Intake & qualification', title: 'Identify high-potential customers from the first message', text: 'AI discovers needs, collects key details and prioritizes customers with the highest likelihood to convert.', bullets: ['Understand intent and context', 'Collect structured information', 'Tag and score leads', 'Route data to the responsible team'] },
        { ...caps[1], kicker: 'AI Vision & OCR', title: 'Read images, identify products and respond instantly', text: 'Analyze images, read codes and identify products to answer in the exact context customers care about.', bullets: ['Identify products and models', 'Read text, codes or invoices', 'Analyze image details', 'Combine images with customer questions'] },
        { ...caps[2], kicker: 'Shipping & customer care', title: 'Automate shipping and post-purchase care', text: 'Validate addresses, calculate delivery fees, update orders and continue supporting customers after purchase.', bullets: ['Capture and validate addresses', 'Calculate shipping fees', 'Update order status', 'Follow up with existing customers'] },
        { ...caps[3], kicker: 'AI and human collaboration', title: 'Reach the right employee without repeating the story', text: 'AI transfers the full history and customer needs to the right employee whenever specialist support is required.', bullets: ['Route to the responsible team', 'Attach conversation history', 'Allow employee takeover at any time', 'Apply permissions and retain handling history'] },
        { ...caps[4], kicker: 'System integration', title: 'Turn every answer into immediate action', text: 'Connect CRM, orders, appointments and APIs so AI can complete tasks directly inside the conversation.', bullets: ['Synchronize profiles with CRM', 'Connect APIs and internal systems', 'Look up inventory and orders', 'Measure results on dashboards'] },
    ] : caps;
    const allCapabilitiesUnordered = [...localizedCaps, ...(en ? englishGrowthCapabilities : growthCapabilities)];
    const capabilityOrder = ['always-on', 'lead', 'vision', 'integration', 'shipping', 'handoff', 'right-time', 'retention'];
    const allCapabilities = capabilityOrder.map(id => allCapabilitiesUnordered.find(item => item.id === id)).filter(Boolean);
    const active = allCapabilities.find(x => x.id === cap) || allCapabilities[0];
    const localizedIndustries = en ? industries.map(item => ({ ...item, name: ({ retail: 'Retail & E-commerce', education: 'Education', health: 'Healthcare & Clinics', b2b: 'B2B Services' })[item.id] })) : industries;
    const localizedRollout = en ? rolloutEn : rollout;
    const activeRollout = localizedRollout[rolloutActive];
    const ActiveRolloutIcon = activeRollout.icon;

    useEffect(() => {
        if (rolloutPaused || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        const timer = window.setTimeout(() => {
            setRolloutActive(index => (index + 1) % localizedRollout.length);
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [rolloutActive, rolloutPaused, localizedRollout.length]);

    useEffect(() => {
        if (!window.matchMedia('(max-width: 768px)').matches) return;
        const container = rolloutNavRef.current;
        const activeButton = container?.querySelector(`#rollout-step-${rolloutActive}`);
        if (!container || !activeButton) return;
        const targetLeft = activeButton.offsetLeft - (container.clientWidth - activeButton.offsetWidth) / 2;
        container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }, [rolloutActive]);
    return <main className="csp-page">
        <PageSeo title={en ? 'Omnichannel AI Chatbot for Businesses' : 'Chatbot AI đa kênh cho doanh nghiệp'} description={en ? 'Losa AI Chatbot automates consulting, quotations, shipping and omnichannel customer care.' : 'Chatbot AI Losa tự động tư vấn, báo giá, vận chuyển và chăm sóc khách hàng đa kênh.'} isFallback={q.data?.isFallback} />
        <section className="client-hero" id="chatbot-hero"><div className="csp-shell client-hero__grid"><motion.div className="client-hero__content" initial="hidden" animate="visible" variants={heroStagger}><motion.div className="client-hero__badge" variants={heroFadeUp}><Sparkles /> {en ? 'Omnichannel AI Chatbot for businesses' : 'Chatbot AI đa kênh cho doanh nghiệp'}</motion.div><motion.h1 className="client-hero__title" variants={heroFadeUp}>{en ? <>Turn every conversation into a <span>growth opportunity</span></> : <>Mỗi cuộc trò chuyện là một <span>cơ hội tăng trưởng</span></>}</motion.h1><motion.p className="client-hero__lead" variants={heroFadeUp}>{en ? 'Losa AI Chatbot understands customer needs, recommends products, creates quotations, calculates shipping and supports customers 24/7 across every channel you use.' : 'Chatbot AI Losa hiểu nhu cầu, tư vấn sản phẩm, tạo báo giá, tính phí vận chuyển và chăm sóc khách hàng 24/7 — trên mọi kênh bạn đang kinh doanh.'}</motion.p><motion.div className="client-hero__proof" variants={heroFadeUp}><span><Check /> {en ? '24/7 responses' : 'Phản hồi 24/7'}</span><span><Check /> {en ? 'Human handoff when needed' : 'Chuyển người thật khi cần'}</span><span><Check /> {en ? 'Centralized data' : 'Dữ liệu tập trung'}</span></motion.div><motion.div className="client-hero__actions" variants={heroFadeUp}><button id="chatbot-view-demo" className="csp-btn csp-btn--primary" onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })}>{en ? 'Explore AI capabilities' : 'Khám phá năng lực AI'} <ArrowRight /></button></motion.div></motion.div><motion.div className="client-hero__visual" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8 }}><HeroVisual en={en} /></motion.div></div></section>

        <section className="csp-section csp-impact" id="operational-impact">
            <div className="csp-shell">
                <header className="csp-impact__heading">
                    <div className="csp-eyebrow">{en ? 'OPERATIONAL IMPACT' : 'HIỆU QUẢ VẬN HÀNH'}</div>
                    <h2>{en ? <>How AI Chatbot helps businesses <span>operate more efficiently</span></> : <>Chatbot AI giúp doanh nghiệp<br /><span>vận hành hiệu quả hơn</span> như thế nào?</>}</h2>
                    <p>{en ? 'Automate repetitive work to reduce workload, optimize costs and respond to customers faster.' : 'Tự động hóa phần việc lặp lại để đội ngũ giảm tải, tối ưu chi phí và phản hồi khách hàng nhanh hơn.'}</p>
                </header>
                <div className="csp-impact__grid">
                    <article>
                        <small>{en ? 'REDUCE UP TO' : 'GIẢM ĐẾN'}</small>
                        <strong><AnimatedNumber value={60} />%</strong>
                        <p>{en ? 'of manual workload. AI handles repetitive questions before employee support is needed.' : 'khối lượng xử lý thủ công. AI tiếp nhận và xử lý những câu hỏi lặp lại trước khi cần nhân viên hỗ trợ.'}</p>
                    </article>
                    <article>
                        <small>{en ? 'OPTIMIZE UP TO' : 'TỐI ƯU ĐẾN'}</small>
                        <strong><AnimatedNumber value={30} />%</strong>
                        <p>{en ? 'of customer care costs. Expand service capacity without scaling headcount with conversation volume.' : 'chi phí chăm sóc khách hàng. Mở rộng khả năng phục vụ mà không cần tăng nhân sự theo số lượng hội thoại.'}</p>
                    </article>
                    <article>
                        <small>{en ? 'FIRST RESPONSE' : 'PHẢN HỒI ĐẦU TIÊN'}</small>
                        <strong><em>{en ? 'UNDER' : 'DƯỚI'}</em> <AnimatedNumber value={5} /> <em>{en ? 'SECONDS' : 'GIÂY'}</em></strong>
                        <p>{en ? 'Customers receive an instant response, even outside business hours.' : 'Khách hàng nhận được phản hồi tức thì, kể cả ngoài giờ làm việc.'}</p>
                    </article>
                </div>
            </div>
        </section>
        <section className="csp-section csp-capabilities" id="capabilities"><div className="csp-shell"><Heading eyebrow={en ? 'LOSA AI CHATBOT CAPABILITIES' : 'NĂNG LỰC CHATBOT AI LOSA'} title={en ? <>What can Losa AI Chatbot do for <span>your business?</span></> : <>Chatbot AI Losa có thể làm gì cho <span>doanh nghiệp bạn?</span></>} text={en ? 'One AI assistant supporting the journey from first message to consulting, shipping and post-sale care.' : 'Một trợ lý AI xuyên suốt từ tin nhắn đầu tiên đến tư vấn, giao hàng và chăm sóc sau bán.'} /><div className="csp-capability-layout"><CapabilityTabs items={allCapabilities} activeId={cap} onSelect={setCap} /><div id="capability-media-panel" className="csp-capability-panel" role="tabpanel" aria-labelledby={`capability-tab-${active.id}`}>{allCapabilities.map(item => { const media = capabilityMedia[item.id]; const isActive = item.id === active.id; return <motion.img key={item.id} src={media.image} alt={isActive ? (en ? `${item.title} — Losa AI capability illustration` : media.alt) : ''} aria-hidden={!isActive} decoding="async" initial={false} animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.025 }} transition={{ opacity: { duration: .48, ease: 'easeOut' }, scale: { duration: .75, ease: [0.22, 1, 0.36, 1] } }} /> })}</div></div></div></section>
        <section className="csp-section csp-usecases"><div className="csp-shell"><Heading eyebrow={en ? 'AI DESIGNED FOR YOUR INDUSTRY' : 'AI THIẾT KẾ THEO NGÀNH'} title={en ? <>Every business <span>operates differently</span></> : <>Mỗi doanh nghiệp<br /><span>có một cách vận hành khác nhau</span></>} text={en ? 'Losa is designed around the unique processes, data and tasks of each industry.' : 'Losa được thiết kế theo đúng quy trình, dữ liệu và tác vụ đặc thù của từng ngành.'} /><div className="csp-usecase-tabs" role="tablist" aria-label={en ? 'Choose an AI industry use case' : 'Chọn ngành ứng dụng AI'} onKeyDown={event => { const index = localizedIndustries.findIndex(x => x.id === industry); const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0; if (!direction) return; event.preventDefault(); const next = localizedIndustries[(index + direction + localizedIndustries.length) % localizedIndustries.length]; setIndustry(next.id); requestAnimationFrame(() => document.getElementById(`industry-tab-${next.id}`)?.focus()); }}>{localizedIndustries.map(x => { const Icon = x.icon; return <button type="button" id={`industry-tab-${x.id}`} key={x.id} className={industry === x.id ? 'is-active' : ''} onClick={() => setIndustry(x.id)} role="tab" tabIndex={industry === x.id ? 0 : -1} aria-selected={industry === x.id} aria-controls={`industry-panel-${x.id}`}><Icon />{x.name}</button> })}</div>
            <IndustryWorkflowStudio industryId={industry} en={en} />
        </div></section>
        <section className="csp-section csp-rollout-section"><div className="csp-shell"><Heading eyebrow={en ? 'A STRUCTURED IMPLEMENTATION' : 'TRIỂN KHAI CÓ LỘ TRÌNH'} title={en ? <>From a real business challenge to a <span>production-ready chatbot</span></> : <>Từ bài toán thực tế đến chatbot<br /><span>sẵn sàng vận hành</span></>} text={en ? 'Explore each phase of a clear, measurable implementation journey.' : 'Khám phá từng giai đoạn trong hành trình triển khai rõ ràng và có thể đo lường.'} /><div className="csp-rollout-nav-wrap" ref={rolloutNavRef}><div className="csp-rollout-nav" role="tablist" aria-label={en ? 'Chatbot implementation journey' : 'Lộ trình triển khai chatbot'} onKeyDown={event => { let next = rolloutActive; if (event.key === 'ArrowRight') next = (rolloutActive + 1) % localizedRollout.length; else if (event.key === 'ArrowLeft') next = (rolloutActive - 1 + localizedRollout.length) % localizedRollout.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = localizedRollout.length - 1; else return; event.preventDefault(); setRolloutActive(next); requestAnimationFrame(() => document.getElementById(`rollout-step-${next}`)?.focus()); }}><span className="csp-rollout-rail" aria-hidden="true"><i style={{ width: `${rolloutActive / (localizedRollout.length - 1) * 100}%` }} /></span>{localizedRollout.map((item, index) => { const Icon = item.icon, activeStep = index === rolloutActive, complete = index < rolloutActive; return <button id={`rollout-step-${index}`} key={item.step} type="button" role="tab" className={`${activeStep ? 'is-active' : ''}${complete ? ' is-complete' : ''}`} aria-selected={activeStep} aria-controls="rollout-detail" tabIndex={activeStep ? 0 : -1} onMouseEnter={() => { setRolloutPaused(true); setRolloutActive(index); }} onMouseLeave={() => setRolloutPaused(false)} onFocus={() => setRolloutActive(index)} onClick={() => setRolloutActive(index)} style={{ '--step-tone': item.tone }}><span className="csp-rollout-node"><Icon /></span><span className="csp-rollout-label"><small>{en ? 'STEP' : 'BƯỚC'} {item.step}</small><b>{item.title}</b></span></button> })}</div></div><div id="rollout-detail" className="csp-rollout-detail" role="tabpanel" aria-labelledby={`rollout-step-${rolloutActive}`} style={{ '--step-tone': activeRollout.tone }}><div className="csp-rollout-detail__content" key={`${locale}-${activeRollout.step}`}><div className="csp-rollout-detail__intro"><span className="csp-rollout-detail__icon"><ActiveRolloutIcon /></span><div className="csp-rollout-detail__step">{en ? 'STEP' : 'BƯỚC'} {activeRollout.step} / 05</div><h3>{activeRollout.title}</h3><p>{activeRollout.text}</p><span className="csp-rollout-duration"><Clock3 />{en ? 'Estimated time' : 'Thời gian dự kiến'} <b>{activeRollout.duration}</b></span></div><div className="csp-rollout-detail__groups"><section><header><Sparkles /><span><small>LOSA</small><h4>{en ? 'What we do' : 'Losa thực hiện'}</h4></span></header><ul>{activeRollout.work.map(item => <li key={item}><Check />{item}</li>)}</ul></section></div></div></div></div></section>
        <CustomerMarquee en={en} />
        <ClientFaqSection faqs={faqs} />
    </main>
}
