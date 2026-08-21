import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, BrainCircuit, Building2, Camera, Check, CheckCircle2, ChevronDown, Clock3, CloudCog, Database, FileText, Filter, Globe2, GraduationCap, HeartPulse, Image, Layers3, MessageCircle, PlugZap, Quote, ScanLine, Send, ShieldCheck, ShoppingBag, Sparkles, Store, Tag, Truck, UserRoundCheck, Zap, Users, Calendar, Mail, HelpCircle, BookOpen, Presentation, ClipboardCheck, BarChart, Settings, PlayCircle, Stethoscope, Pill, Hospital, Syringe, Heart, Video, CalendarClock, Shield, FileHeart, FlaskConical, Activity, ClipboardPlus, MapPin, Star, Search, Map, Bed, Wallet, Ticket, ArrowLeftRight, CreditCard, Headset } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { publicFaqsService } from '../../features/faqs/faqsService';
import { ClientFaqSection } from '../../components/client/ClientFaqSection';
import { IndustryWorkflowStudio } from '../../components/client/IndustryWorkflowStudio';
import '../../styles/client/chatbot-solutions-modern.css';
import '../../styles/client/industry-panel.css';

const heroFadeUp = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: .55 } }
};
const heroStagger = { visible: { transition: { staggerChildren: .12 } } };

const customerBrands = [
    ['VM', 'Vinamilk', '#1686c7'],
    ['VT', 'Viettel', '#e7343f'],
    ['FPT', 'FPT', '#f47920'],
    ['VG', 'Vingroup', '#d09b2c'],
    ['TCB', 'Techcombank', '#e31d2b'],
    ['HLC', 'Highlands Coffee', '#b51f2e'],
    ['PNJ', 'PNJ', '#c69a2e'],
    ['MWG', 'Thế Giới Di Động', '#f4b400']
];

function CustomerMarquee() {
    const renderGroup = hidden => <div className="csp-customers__group" aria-hidden={hidden || undefined}>
        {customerBrands.map(([mark, name, color]) => <div className="csp-customers__brand" style={{ '--brand-color': color }} key={name}>
            <span>{mark}</span><strong>{name}</strong>
        </div>)}
    </div>;
    return <section className="csp-customers" id="chatbot-customers" aria-label="Khách hàng của chúng tôi">
        <div className="csp-shell">
            <div className="csp-customers__band">
                <div className="csp-customers__label"><i />KHÁCH HÀNG CỦA CHÚNG TÔI<i /></div>
                <div className="csp-customers__marquee" role="region" aria-label="Danh sách khách hàng">
                    <div className="csp-customers__track">{renderGroup(false)}{renderGroup(true)}</div>
                </div>
            </div>
        </div>
    </section>;
}

const businessBenefits = [
    [Globe2, 'Chăm sóc khách hàng đa kênh', 'Hợp nhất Website, Messenger, Zalo và các nền tảng nhắn tin phổ biến trong một luồng vận hành liền mạch.', 'Phản hồi nhanh · Không bỏ sót hội thoại'],
    [Send, 'Chủ động tiếp cận khách hàng tiềm năng', 'Thiết kế chiến dịch nhắn tin hàng loạt theo từng nhóm đối tượng để mở rộng tệp khách hàng và tạo thêm cơ hội bán hàng.', 'Đúng nhóm khách · Đúng thời điểm'],
    [BrainCircuit, 'Remarketing cá nhân hóa bằng AI', 'AI phân tích nhu cầu và lịch sử tương tác để gửi thông điệp phù hợp, nuôi dưỡng khách cũ và thúc đẩy họ quay lại mua hàng.', 'Cá nhân hóa · Tăng khả năng chuyển đổi']
];
const outcomes = [{ icon: Filter, label: 'TIẾP NHẬN THÔNG MINH', title: 'Không bỏ lỡ nhu cầu mới', text: 'AI phản hồi, đặt câu hỏi và nhận diện khách tiềm năng ngay từ tin nhắn đầu tiên.' }, { icon: ShoppingBag, label: 'TƯ VẤN THEO NGỮ CẢNH', title: 'Đưa khách đến quyết định nhanh hơn', text: 'Tư vấn đúng nhu cầu bằng dữ liệu sản phẩm, giá và tồn kho thực tế.' }, { icon: Database, label: 'DỮ LIỆU CÓ THỂ HÀNH ĐỘNG', title: 'Biến hội thoại thành dữ liệu', text: 'Tín hiệu quan trọng được lưu và đồng bộ để đội ngũ tiếp tục chăm sóc đúng lúc.' }];
const caps = [{ id: 'lead', icon: BrainCircuit, kicker: 'Tiếp nhận & phân loại', title: 'Hiểu nhu cầu ngay từ tin nhắn đầu tiên', text: 'AI trò chuyện tự nhiên, hỏi đúng thông tin và nhận diện khách hàng tiềm năng để đội ngũ ưu tiên đúng cơ hội.', bullets: ['Hiểu ý định và ngữ cảnh', 'Thu thập thông tin có cấu trúc', 'Gán nhãn và chấm điểm lead', 'Đẩy dữ liệu sang đội ngũ phụ trách'] }, { id: 'vision', icon: Camera, kicker: 'AI Vision & OCR', title: 'Hiểu cả hình ảnh khách hàng gửi đến', text: 'AI phân tích ảnh ngay trong hội thoại để nhận diện sản phẩm, đọc mã và phản hồi theo đúng ngữ cảnh.', bullets: ['Nhận diện sản phẩm và mẫu mã', 'Đọc chữ, mã hoặc hóa đơn', 'Phân tích chi tiết hình ảnh', 'Kết hợp ảnh với câu hỏi của khách'] }, { id: 'quote', icon: Quote, kicker: 'Tư vấn & bán hàng', title: 'Biến hội thoại thành một quy trình bán hàng', text: 'Chatbot kết nối dữ liệu sản phẩm để tư vấn, kiểm tra tồn kho và tạo báo giá tức thì.', bullets: ['Tìm và gợi ý sản phẩm phù hợp', 'Kiểm tra giá và tồn kho', 'Tạo báo giá tự động', 'Thu thập thông tin chốt đơn'] }, { id: 'shipping', icon: Truck, kicker: 'Vận chuyển & chăm sóc', title: 'Tính phí ship và chăm sóc sau bán tự động', text: 'AI nhận địa chỉ, tra cứu phí vận chuyển và tiếp tục đồng hành sau khi khách đặt hàng.', bullets: ['Nhận và xác thực địa chỉ', 'Tính phí vận chuyển', 'Cập nhật trạng thái đơn hàng', 'Follow-up khách cũ'] }, { id: 'omnichannel', icon: Globe2, kicker: 'Đồng bộ đa kênh', title: 'Một bộ não AI trên mọi điểm chạm', text: 'Khách bắt đầu trên Website và tiếp tục ở kênh quen thuộc mà lịch sử và ngữ cảnh vẫn nhất quán.', bullets: ['Website, Messenger, Zalo và nhiều kênh', 'Dùng chung nguồn tri thức', 'Quản lý hội thoại tập trung', 'Giữ nguyên ngữ cảnh xuyên kênh'] }, { id: 'handoff', icon: UserRoundCheck, kicker: 'AI & con người phối hợp', title: 'Chuyển nhân viên đúng lúc, không hỏi lại', text: 'Khi cần chuyên môn, AI chuyển đến đúng nhân viên kèm toàn bộ bối cảnh cuộc trò chuyện.', bullets: ['Chuyển đúng nhóm phụ trách', 'Đính kèm lịch sử hội thoại', 'Nhân viên tiếp quản bất kỳ lúc nào', 'Phân quyền và lưu lịch sử xử lý'] }, { id: 'integration', icon: PlugZap, kicker: 'Kết nối hệ thống', title: 'Chatbot không đứng một mình', text: 'Losa kết nối dữ liệu và biến hội thoại thành hành động trong hệ thống doanh nghiệp đang vận hành.', bullets: ['Đồng bộ hồ sơ với CRM', 'Kết nối API và hệ thống nội bộ', 'Tra cứu tồn kho và đơn hàng', 'Đo lường trên dashboard'] }];
const chats = { lead: [['customer', 'Shop mình nhận khoảng 2.000 tin nhắn mỗi tháng.'], ['ai', 'Shop đang bán trên kênh nào và cần AI hỗ trợ phần nào nhất?'], ['customer', 'Website và Messenger, mình muốn lọc khách có nhu cầu thật.'], ['ai', 'Mình đã ghi nhận và gán nhãn lead tiềm năng để đội ngũ tư vấn tiếp.']], quote: [['customer', 'Cho mình báo giá 20 máy lọc không khí mẫu A2 nhé.'], ['ai', 'Bạn cần giao một địa chỉ hay chia thành nhiều điểm giao?'], ['customer', 'Giao một địa chỉ tại Quận 7 trong tuần này.'], ['ai', 'Mình đã kiểm tra tồn kho và tạo báo giá theo yêu cầu.']], shipping: [['customer', 'Đơn A2 giao đến Quận 7 thì phí ship bao nhiêu?'], ['ai', 'Bạn gửi giúp mình phường và thời gian muốn nhận hàng nhé.'], ['customer', 'Phường Tân Phong, nhận trong 1–2 ngày.'], ['ai', 'Phí dự kiến 32.000đ. Mình đã lưu địa chỉ và thời gian giao.']], omnichannel: [['customer', 'Mình vừa hỏi mẫu A2 trên Website, giờ tư vấn tiếp ở đây nhé.'], ['ai', 'Mình đã tìm thấy cuộc trò chuyện trước của bạn trên Website.'], ['customer', 'Mình muốn xem thêm giá màng lọc thay thế.'], ['ai', 'Mình tiếp tục đúng ngữ cảnh và gửi thông tin ngay tại Messenger.']], handoff: [['customer', 'Bên mình cần tích hợp ERP nội bộ qua API riêng.'], ['ai', 'Yêu cầu này cần chuyên viên kỹ thuật. Mình xin phép chuyển đúng nhóm.'], ['customer', 'Bạn gửi kèm các yêu cầu mình đã trao đổi nhé.'], ['ai', 'Đã chuyển Minh Anh cùng toàn bộ lịch sử và thông tin hệ thống.']], integration: [['customer', 'Kiểm tra giúp mình đơn DH-2048 đang giao đến đâu?'], ['ai', 'Mình đang tra cứu trạng thái từ hệ thống đơn hàng.'], ['customer', 'Nếu chưa giao, cập nhật số điện thoại nhận hàng giúp mình.'], ['ai', 'Đơn đang tại kho Quận 7 và số mới đã được đồng bộ.']] };
const actions = { lead: ['Tiềm năng cao', 'Đã gán nhãn Lead nóng', Tag], quote: ['Báo giá #BG-2048', 'Tổng cộng 38.400.000đ', Quote], shipping: ['Giao hàng nhanh', 'Phí vận chuyển: 32.000đ', Truck], omnichannel: ['Đã đồng bộ hội thoại', 'Website → Messenger', Globe2], handoff: ['Minh Anh đã tiếp quản', 'Kèm 12 tin nhắn lịch sử', UserRoundCheck], integration: ['Đơn hàng #DH-2048', 'CRM và vận chuyển đã cập nhật', PlugZap] };
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
const rollout = [['01', 'Khảo sát', 'Xác định bài toán, kênh và mục tiêu.'], ['02', 'Chuẩn hóa dữ liệu', 'Tổ chức tri thức và quy tắc trả lời.'], ['03', 'Thiết kế workflow', 'Kết nối tác vụ và hệ thống cần thiết.'], ['04', 'Kiểm thử', 'Đánh giá câu trả lời và tình huống bàn giao.'], ['05', 'Vận hành', 'Theo dõi, đo lường và tối ưu liên tục.']];
function Heading({ eyebrow, title, text, light = false }) { return <header className={`csp-heading${light ? ' csp-heading--light' : ''}`}><div className="csp-eyebrow">{eyebrow}</div><h2>{title}</h2>{text && <p>{text}</p>}</header> }
function ChatHeader() { return <div className="csp-chat__top"><div className="csp-chat__avatar"><Bot /></div><div><strong>Losa AI Assistant</strong><span><i /> Đang hoạt động</span></div><span className="csp-chat__channel">AI</span></div> }
function Composer() { return <div className="csp-chat__composer"><span>Nhập tin nhắn...</span><button aria-label="Gửi tin nhắn minh họa"><Send /></button></div> }
function Conversation({ mode = 'quote', compact = false }) {const ref = useRef(null); useEffect(() => { const e = ref.current; if (!e) return; let a, b, c, stop = false; const clear = () => { clearTimeout(a); clearTimeout(b); clearTimeout(c) }, halt = () => { stop = true; clear() }, cycle = () => { if (stop || matchMedia('(prefers-reduced-motion: reduce)').matches || e.scrollHeight <= e.clientHeight) return; e.scrollTo({ top: 0, behavior: 'smooth' }); a = setTimeout(() => { if (stop) return; e.scrollTo({ top: e.scrollHeight, behavior: 'smooth' }); b = setTimeout(() => { if (stop) return; e.scrollTo({ top: 0, behavior: 'smooth' }); c = setTimeout(cycle, 2400) }, 4000) }, 2200) }; e.scrollTop = 0; const f = requestAnimationFrame(cycle); e.addEventListener('wheel', halt, { passive: true }); e.addEventListener('touchstart', halt, { passive: true }); return () => { cancelAnimationFrame(f); clear(); e.removeEventListener('wheel', halt); e.removeEventListener('touchstart', halt) } }, [mode]); if (mode === 'vision') return <div className="csp-chat csp-chat--compact"><ChatHeader /><div ref={ref} className="csp-chat__body"><div className="csp-vision-upload"><Image /><div><strong>product-a2.jpg</strong><small>Ảnh khách hàng vừa gửi</small></div></div><div className="csp-message csp-message--customer">Bạn xem giúp mình đây là mẫu máy nào?</div><div className="csp-message csp-message--ai"><Sparkles />Đây là máy lọc không khí A2, độ tin cậy 98%.</div><div className="csp-message csp-message--customer">Mẫu này còn màng lọc thay thế không?</div><div className="csp-action-card"><span><ScanLine /></span><div><b>Màng lọc HEPA H13 còn hàng</b><small>Đã đối chiếu mã A2 và tồn kho</small></div><CheckCircle2 /></div><div className="csp-message csp-message--ai"><Sparkles />Mình có thể gửi giá và hướng dẫn chọn đúng phiên bản.</div></div><Composer /></div>; const list = chats[mode] || chats.quote, [title, note, Icon] = actions[mode] || actions.quote; return <div className={`csp-chat${compact ? ' csp-chat--compact' : ''}`}><ChatHeader /><div ref={ref} className="csp-chat__body">{list.map(([sender, text], i) => <div key={i} className={`csp-message csp-message--${sender}`}>{sender === 'ai' && <Sparkles />}{text}</div>)}<div className="csp-action-card"><span><Icon /></span><div><b>{title}</b><small>{note}</small></div><CheckCircle2 /></div></div><Composer /></div> }
function HeroVisual() {
    const channels = [
        [Globe2, 'Website'],
        [MessageCircle, 'Messenger'],
        [Send, 'Zalo'],
        [Camera, 'Instagram'],
        [Send, 'Telegram']
    ];
    return <div className="csp-hero__visual" aria-label="Mô hình LOSA AI kết nối và đồng bộ hội thoại đa kênh">
        <div className="csp-ai-hub">
            <div className="csp-ai-hub__orbit csp-ai-hub__orbit--outer" aria-hidden="true" />
            <div className="csp-ai-hub__orbit csp-ai-hub__orbit--inner" aria-hidden="true" />
            <div className="csp-ai-hub__handoff"><span>MA</span><div><small>AI CHUYỂN NHÂN VIÊN</small><strong>Minh Anh · Kèm ngữ cảnh</strong></div><CheckCircle2 /></div>
            <div className="csp-ai-hub__automation"><div><span>AI tự động xử lý</span><strong>96%</strong></div><i><b /></i></div>
            {channels.map(([Icon, label], i) => <div className={`csp-ai-hub__channel csp-ai-hub__channel--${i}`} key={label}><Icon /><span>{label}</span><small><i /> Kết nối</small></div>)}
            <div className="csp-ai-hub__core"><span><Bot /></span><strong>LOSA AI</strong><small><i /> Trợ lý thông minh đa kênh</small></div>
            <div className="csp-ai-hub__metric csp-ai-hub__metric--speed"><span><Zap /></span><div><small>PHẢN HỒI TRUNG BÌNH</small><strong>4.8 giây</strong></div></div>
            <div className="csp-ai-hub__metric csp-ai-hub__metric--leads"><span><UserRoundCheck /></span><div><small>LEAD MỚI HÔM NAY</small><strong>+24</strong></div></div>
            <div className="csp-ai-hub__flow"><span><BrainCircuit /> Hiểu nhu cầu</span><ArrowRight /><span><Tag /> Gán nhãn</span><ArrowRight /><span><Database /> Đồng bộ CRM</span></div>
        </div>
    </div>
}
const workflowSteps = [[BrainCircuit, 'Hiểu nhu cầu', 'Nhận diện sản phẩm và ý định mua'], [ShoppingBag, 'Gợi ý sản phẩm', 'Truy xuất giá và tồn kho'], [Quote, 'Tạo báo giá', 'Cá nhân hóa số lượng và ưu đãi'], [Truck, 'Tính phí ship', 'Tra cứu theo địa chỉ giao hàng'], [Tag, 'Gắn nhãn lead', 'Đánh dấu mức độ tiềm năng'], [Database, 'Lưu CRM', 'Tạo lịch follow-up tự động']];
const workflowTimeline = [{ type: 'customer', text: 'Mình cần 20 máy lọc không khí cho văn phòng khoảng 60m², giao đến Quận 7 trong tuần này.', step: 0 }, { type: 'ai', text: 'Mình đã hiểu nhu cầu: 20 máy, ưu tiên văn phòng 60m² và giao trong tuần.', step: 0 }, { type: 'action', title: 'Máy lọc không khí A2 Pro', note: 'Phù hợp 60m² · Còn đủ 20 sản phẩm', icon: ShoppingBag, step: 1 }, { type: 'ai', text: 'A2 Pro phù hợp nhất. Mình đã áp dụng mức giá doanh nghiệp theo số lượng.', step: 1 }, { type: 'action', title: 'Báo giá #BG-2048', note: '20 sản phẩm · Tổng cộng 38.400.000đ', icon: Quote, step: 2 }, { type: 'customer', text: 'Phí giao đến phường Tân Phong, Quận 7 bao nhiêu?', step: 3 }, { type: 'action', title: 'Giao hàng nhanh', note: 'Phí vận chuyển: 32.000đ · Giao trong 1–2 ngày', icon: Truck, step: 3 }, { type: 'action', title: 'Lead tiềm năng cao', note: 'Đã gắn nhãn và ưu tiên cho đội ngũ bán hàng', icon: Tag, step: 4 }, { type: 'action', title: 'Đã lưu vào CRM', note: 'Hồ sơ, báo giá và lịch follow-up đã đồng bộ', icon: Database, step: 5 }];
function WorkflowDemo() { const [visible, setVisible] = useState(1), [paused, setPaused] = useState(false), bodyRef = useRef(null), resumeRef = useRef(null); useEffect(() => { if (paused) return; const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduced) { setVisible(workflowTimeline.length); return } const delay = visible >= workflowTimeline.length ? 3200 : 1450; const timer = setTimeout(() => setVisible(v => v >= workflowTimeline.length ? 1 : v + 1), delay); return () => clearTimeout(timer) }, [visible, paused]); useEffect(() => { const e = bodyRef.current; if (!e) return; e.scrollTo({ top: visible === 1 ? 0 : e.scrollHeight, behavior: 'smooth' }) }, [visible]); useEffect(() => () => clearTimeout(resumeRef.current), []); const pause = () => { setPaused(true); clearTimeout(resumeRef.current); resumeRef.current = setTimeout(() => setPaused(false), 3500) }, activeStep = workflowTimeline[Math.max(0, visible - 1)].step, progress = Math.round(visible / workflowTimeline.length * 100); return <div id="workflow-live-demo" className="csp-workflow-demo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onWheel={pause} onTouchStart={pause}><div className="csp-chat csp-workflow-chat"><ChatHeader /><div className="csp-workflow-chat__progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div><div ref={bodyRef} className="csp-chat__body" aria-live="polite">{workflowTimeline.slice(0, visible).map((entry, i) => { if (entry.type === 'action') { const Icon = entry.icon; return <div className="csp-action-card csp-demo-enter" key={`${visible}-${i}`}><span><Icon /></span><div><b>{entry.title}</b><small>{entry.note}</small></div><CheckCircle2 /></div> } return <div className={`csp-message csp-message--${entry.type} csp-demo-enter`} key={`${visible}-${i}`}>{entry.type === 'ai' && <Sparkles />}{entry.text}</div> })}{visible === workflowTimeline.length && <div className="csp-workflow-chat__complete csp-demo-enter"><CheckCircle2 /> Hoàn tất hành trình — dữ liệu đã sẵn sàng cho đội ngũ bán hàng</div>}</div><Composer /></div><div className="csp-flow" role="list" aria-label="Các bước xử lý tự động">{workflowSteps.map(([Icon, title, text], i) => <article id={`workflow-step-${i + 1}`} role="listitem" className={`csp-flow__item${i === activeStep ? ' is-active' : ''}${i < activeStep || visible === workflowTimeline.length ? ' is-complete' : ''}`} key={title}><b>0{i + 1}</b><span><Icon /></span><div><h3>{title}</h3><p>{text}</p></div>{(i < activeStep || visible === workflowTimeline.length) && <CheckCircle2 className="csp-flow__check" />}</article>)}</div></div> }


function BusinessValueStory() {
    const [activeStory, setActiveStory] = useState(0);
    const storyRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(() => {
            const viewportCenter = window.innerHeight / 2;
            const closestIndex = storyRefs.current.reduce((closest, node, index) => {
                if (!node) return closest;
                const rect = node.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
                return distance < closest.distance ? { index, distance } : closest;
            }, { index: 0, distance: Infinity }).index;
            setActiveStory(closestIndex);
        }, { rootMargin: '-32% 0px -32% 0px', threshold: [0, .25, .5, .75, 1] });
        storyRefs.current.forEach(node => node && observer.observe(node));
        return () => observer.disconnect();
    }, []);

    const active = businessBenefits[activeStory];
    const ActiveIcon = active[0];
    return <section className="csp-section csp-business-story" id="business-value">
        <div className="csp-shell">
            <header className="csp-business-story__heading">
                <div className="csp-eyebrow">LOSA ĐỒNG HÀNH CÙNG DOANH NGHIỆP</div>
                <h2>Từ mỗi cuộc trò chuyện đến một <span>cơ hội tăng trưởng</span></h2>
                <p>Losa kết nối chăm sóc, tiếp cận và remarketing thành một hành trình khách hàng liền mạch.</p>
            </header>
            <div className="csp-business-story__layout">
                <div className="csp-business-story__chapters">
                    {businessBenefits.map(([Icon, title, text, result], i) => <article
                        key={title}
                        ref={node => { storyRefs.current[i] = node }}
                        data-story={i}
                        className={activeStory === i ? 'is-active' : ''}
                        onClick={() => setActiveStory(i)}
                    >
                        <div className="csp-business-story__index">0{i + 1}</div>
                        <div className="csp-business-story__chapter-icon"><Icon /></div>
                        <div><h4>{title}</h4><p>{text}</p><span><CheckCircle2 />{result}</span></div>
                    </article>)}
                </div>
                <div className="csp-business-story__sticky">
                    <div className={`csp-story-visual csp-story-visual--${activeStory + 1}`}>
                        <div className="csp-story-visual__top"><span><Sparkles /> LOSA AI JOURNEY</span><small><i /> Đang vận hành</small></div>
                        <div className="csp-story-visual__stage" key={activeStory}>
                            <div className="csp-story-visual__orbit" />
                            <div className="csp-story-visual__core"><ActiveIcon /><strong>{activeStory === 0 ? 'Omnichannel' : activeStory === 1 ? 'Campaign' : 'AI Remarketing'}</strong><small>{active[3]}</small></div>
                            {activeStory === 0 && <><span className="csp-story-node node-a"><Globe2 /> Website</span><span className="csp-story-node node-b"><MessageCircle /> Messenger</span><span className="csp-story-node node-c"><Send /> Zalo</span></>}
                            {activeStory === 1 && <><span className="csp-story-node node-a"><Filter /> Phân nhóm</span><span className="csp-story-node node-b"><Send /> Gửi chiến dịch</span><span className="csp-story-node node-c"><UserRoundCheck /> Lead mới</span></>}
                            {activeStory === 2 && <><span className="csp-story-node node-a"><Database /> Dữ liệu</span><span className="csp-story-node node-b"><BrainCircuit /> Cá nhân hóa</span><span className="csp-story-node node-c"><ShoppingBag /> Chuyển đổi</span></>}
                        </div>
                        <div className="csp-story-visual__progress">{businessBenefits.map((_, i) => <button id={`business-story-step-${i + 1}`} aria-label={`Xem giá trị ${i + 1}`} className={activeStory === i ? 'is-active' : ''} onClick={() => { setActiveStory(i); storyRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} key={i}><i /></button>)}</div>
                    </div>
                </div>
            </div>
        </div>
    </section>;
}

function CapabilityTabs({ items, activeId, onSelect }) {
    const tabsRef = useRef(null);
    const [scrollHint, setScrollHint] = useState({ up: false, down: true });

    const updateHints = () => {
        const element = tabsRef.current;
        if (!element) return;
        setScrollHint({
            up: element.scrollTop > 8,
            down: element.scrollTop + element.clientHeight < element.scrollHeight - 8
        });
    };

    useEffect(() => {
        updateHints();
        window.addEventListener('resize', updateHints);
        return () => window.removeEventListener('resize', updateHints);
    }, []);

    const nudge = direction => tabsRef.current?.scrollBy({ top: direction * 150, behavior: 'smooth' });
    return <div className={`csp-capability-scroll${scrollHint.up ? ' can-scroll-up' : ''}${scrollHint.down ? ' can-scroll-down' : ''}`}>
        <button type="button" className="csp-capability-scroll__arrow csp-capability-scroll__arrow--up" aria-label="Cuộn lên để xem chức năng phía trên" onClick={() => nudge(-1)}><ChevronDown /></button>
        <div className="csp-capability-tabs" role="tablist" ref={tabsRef} onScroll={updateHints}>
            {items.map(item => { const Icon = item.icon; return <button id={`capability-tab-${item.id}`} role="tab" aria-selected={activeId === item.id} key={item.id} className={activeId === item.id ? 'is-active' : ''} onClick={() => onSelect(item.id)}><span><Icon /></span><div><small>{item.kicker}</small><strong>{item.title}</strong></div><ArrowRight /></button> })}
        </div>
        <button type="button" className="csp-capability-scroll__arrow csp-capability-scroll__arrow--down" aria-label="Cuộn xuống để xem thêm chức năng" onClick={() => nudge(1)}><ChevronDown /></button>
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
                                <p className="price" style={{fontSize: '10px', color: '#64748b', fontWeight: 'normal', margin: 0}}>12 buổi</p>
                                <p className="price">2.490.000đ</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Thiết kế Web HTML, CSS</h5>
                                <p className="price" style={{fontSize: '10px', color: '#64748b', fontWeight: 'normal', margin: 0}}>10 buổi</p>
                                <p className="price">1.990.000đ</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>AI & Machine Learning cơ bản</h5>
                                <p className="price" style={{fontSize: '10px', color: '#64748b', fontWeight: 'normal', margin: 0}}>15 buổi</p>
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
                                <span className="cip-section-title" style={{marginBottom: '4px'}}>INPUT</span>
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
                                <span className="cip-section-title" style={{marginBottom: '4px'}}>OUTPUT</span>
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
                            <span style={{marginLeft: '4px'}}>AI đang tổng hợp thông tin...</span>
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
                                <span className="cip-section-title" style={{marginBottom: '4px'}}>INPUT</span>
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
                                <span style={{color: '#f97316', marginTop: '4px', fontSize: '12px'}}>AI ENGINE</span>
                                <p>Phân tích & xử lý</p>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{marginBottom: '4px'}}>OUTPUT</span>
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
                                <div className="cip-icon-box"><Hospital size={20} /><span>HIS<br/>Bệnh viện</span></div>
                                <div className="cip-icon-box"><ClipboardPlus size={20} /><span>EMR<br/>Hồ sơ bệnh án</span></div>
                                <div className="cip-icon-box"><Image size={20} /><span>PACS<br/>Hình ảnh</span></div>
                                <div className="cip-icon-box"><FlaskConical size={20} /><span>LIS<br/>Xét nghiệm</span></div>
                                <div className="cip-icon-box"><Video size={20} /><span>Telehealth<br/>Khám online</span></div>
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
                                <span className="cip-order-value" style={{fontWeight: 700}}>Thần kinh</span>
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
                            <div className="cip-order-row" style={{borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px'}}>
                                <span className="cip-order-label">Ghi chú</span>
                                <span className="cip-order-value" style={{color: '#3b82f6'}}>Mang theo CCCD & BHYT (nếu có)</span>
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
                            Mình muốn đặt khách sạn ở Đà Nẵng.<br/>2 đêm, 2 người lớn, view biển.
                        </div>
                        <div className="cip-msg cip-msg-ai">Dạ, Losa247 gợi ý một số khách sạn phù hợp ngân sách và nhu cầu của Anh/Chị nhé!</div>

                        {/* Product Cards */}
                        <div className="cip-products">
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Mường Thanh Luxury Đà Nẵng</h5>
                                <span className="cip-stars">★★★★★</span>
                                <p className="price">Từ 1.250.000đ/đêm</p>
                                <p style={{fontSize: '10px', color: '#64748b', marginTop: '2px'}}>View biển, ăn sáng</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Sala Danang Beach Hotel</h5>
                                <span className="cip-stars">★★★★★</span>
                                <p className="price">Từ 1.850.000đ/đêm</p>
                                <p style={{fontSize: '10px', color: '#64748b', marginTop: '2px'}}>Hồ bơi vô cực, gần biển</p>
                            </div>
                            <div className="cip-product-card">
                                <div className="cip-img-placeholder">Ảnh minh họa</div>
                                <h5>Furama Resort Đà Nẵng</h5>
                                <span className="cip-stars">★★★★★</span>
                                <p className="price">Từ 3.200.000đ/đêm</p>
                                <p style={{fontSize: '10px', color: '#64748b', marginTop: '2px'}}>Resort 5 sao, bãi biển riêng</p>
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
                                <span><MapPin size={10} style={{display:'inline', marginRight:'2px'}}/> Đà Nẵng</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>THỜI GIAN</small>
                                <span><Calendar size={10} style={{display:'inline', marginRight:'2px'}}/> 2 đêm (20/05 - 22/05)</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>KHÁCH</small>
                                <span><Users size={10} style={{display:'inline', marginRight:'2px'}}/> 2 người lớn</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>NGÂN SÁCH</small>
                                <span><Wallet size={10} style={{display:'inline', marginRight:'2px'}}/> ~2.000.000đ/đêm</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>LOẠI PHÒNG</small>
                                <span><Bed size={10} style={{display:'inline', marginRight:'2px'}}/> Deluxe / Ocean View</span>
                            </div>
                            <div className="cip-tag-item">
                                <small>ƯU TIÊN</small>
                                <span><Check size={10} style={{display:'inline', marginRight:'2px'}}/> Gần biển, ăn sáng</span>
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
                                <span className="cip-section-title" style={{marginBottom: '4px'}}>INPUT</span>
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
                                <span style={{color: '#f97316', marginTop: '4px', fontSize: '12px'}}>AI ENGINE</span>
                                <p>Phân tích & xử lý</p>
                            </div>
                            <ArrowRight className="text-orange-400" size={20} />
                            <div className="cip-data-list">
                                <span className="cip-section-title" style={{marginBottom: '4px'}}>OUTPUT</span>
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
                                <span style={{color: '#e11d48'}}>agoda</span>
                                <span style={{color: '#003580'}}>Booking.com</span>
                                <span style={{color: '#0000a0'}}>Expedia</span>
                                <span style={{color: '#1ba0e2'}}>traveloka</span>
                                <span style={{color: '#0f294d'}}>Trip.com</span>
                                <span>Hotel Direct<br/><small style={{fontSize:'8px',fontWeight:400}}>(đối tác)</small></span>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">QUY TRÌNH TỰ ĐỘNG</div>
                            <div className="cip-process-row">
                                <div className="cip-process-box"><Search size={16} /><span>Tìm kiếm<br/>khách sạn</span></div>
                                <div className="cip-process-box"><ArrowLeftRight size={16} /><span>So sánh giá<br/>& tiện ích</span></div>
                                <div className="cip-process-box"><Bed size={16} /><span>Kiểm tra<br/>phòng trống</span></div>
                                <div className="cip-process-box"><Clock3 size={16} /><span>Giữ phòng<br/>tạm thời</span></div>
                                <div className="cip-process-box"><ShieldCheck size={16} /><span>Xác nhận &<br/>đặt phòng</span></div>
                                <div className="cip-process-box"><Ticket size={16} /><span>Gửi voucher<br/>cho khách</span></div>
                            </div>
                        </div>

                        <div>
                            <div className="cip-section-title">CÔNG CỤ & NGUỒN LỰC</div>
                            <div className="cip-icon-row">
                                <div className="cip-icon-box"><Building2 size={20} /><span>Hotel API<br/>Connector</span></div>
                                <div className="cip-icon-box"><Settings size={20} /><span>Channel<br/>Manager</span></div>
                                <div className="cip-icon-box"><CreditCard size={20} /><span>Payment<br/>Gateway</span></div>
                                <div className="cip-icon-box"><Users size={20} /><span>CRM<br/>Khách hàng</span></div>
                                <div className="cip-icon-box"><BarChart size={20} /><span>Báo cáo &<br/>Thống kê</span></div>
                                <div className="cip-icon-box"><Headset size={20} /><span>Hỗ trợ 24/7<br/>AI & Human</span></div>
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
                                <span className="cip-order-value" style={{fontWeight: 700}}>#LS247-BOOK-250522-001</span>
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
                                <span className="cip-order-value" style={{color: '#16a34a', fontWeight: 600}}>Đã xác nhận</span>
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

export default function ChatbotSolutionsPage() {
    const [cap, setCap] = useState('quote'), [industry, setIndustry] = useState('retail'), [faqOpen, setFaq] = useState(null); const q = useApiQuery(() => publicFaqsService.getList({ pageType: 'solutions', serviceDetail: 'chatbot' }), []); const fallback = [{ _id: 'accuracy', question: 'Chatbot AI trả lời sai thì xử lý thế nào?', answer: 'Losa giới hạn nguồn dữ liệu, thiết lập ngưỡng tin cậy và chuyển hội thoại cho nhân viên khi AI chưa đủ thông tin.' }, { _id: 'integration', question: 'Losa có kết nối CRM hoặc hệ thống riêng không?', answer: 'Có. Losa hỗ trợ đồng bộ CRM, dữ liệu sản phẩm và hệ thống nghiệp vụ thông qua API theo phạm vi triển khai.' }, { _id: 'launch', question: 'Mất bao lâu để triển khai chatbot?', answer: 'Thời gian phụ thuộc dữ liệu và mức độ tích hợp. Đội ngũ Losa sẽ khảo sát, chuẩn hóa và kiểm thử trước khi vận hành.' }]; const faqs = q.data?.items?.length ? q.data.items : fallback, active = caps.find(x => x.id === cap); useEffect(() => { document.title = 'Chatbot AI đa kênh cho doanh nghiệp | Losa'; let m = document.querySelector('meta[name="description"]'); if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) } m.content = 'Chatbot AI Losa tự động tư vấn, báo giá, vận chuyển và chăm sóc khách hàng đa kênh.' }, []); return <main className="csp-page">
        <section className="client-hero" id="chatbot-hero"><div className="csp-shell client-hero__grid"><motion.div className="client-hero__content" initial="hidden" animate="visible" variants={heroStagger}><motion.div className="client-hero__badge" variants={heroFadeUp}><Sparkles /> Chatbot AI đa kênh cho doanh nghiệp</motion.div><motion.h1 className="client-hero__title" variants={heroFadeUp}>Mỗi cuộc trò chuyện là một <span>cơ hội tăng trưởng</span></motion.h1><motion.p className="client-hero__lead" variants={heroFadeUp}>Chatbot AI Losa hiểu nhu cầu, tư vấn sản phẩm, tạo báo giá, tính phí vận chuyển và chăm sóc khách hàng 24/7 — trên mọi kênh bạn đang kinh doanh.</motion.p><motion.div className="client-hero__proof" variants={heroFadeUp}><span><Check /> Phản hồi 24/7</span><span><Check /> Chuyển người thật khi cần</span><span><Check /> Dữ liệu tập trung</span></motion.div><motion.div className="client-hero__actions" variants={heroFadeUp}><button id="chatbot-view-demo" className="csp-btn csp-btn--primary" onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })}>Khám phá năng lực AI <ArrowRight /></button></motion.div></motion.div><motion.div className="client-hero__visual" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8 }}><HeroVisual /></motion.div></div></section>

        <BusinessValueStory />
        <section className="csp-section csp-impact" id="operational-impact">
            <div className="csp-shell">
                <header className="csp-impact__heading">
                    <div className="csp-eyebrow">HIỆU QUẢ VẬN HÀNH</div>
                    <h2>Chatbot AI giúp doanh nghiệp <span>vận hành hiệu quả hơn</span> như thế nào?</h2>
                    <p>Tự động hóa phần việc lặp lại để đội ngũ giảm tải, tối ưu chi phí và phản hồi khách hàng nhanh hơn.</p>
                </header>
                <div className="csp-impact__grid">
                    <article>
                        <small>GIẢM ĐẾN</small>
                        <strong>60%</strong>
                        <p>khối lượng xử lý thủ công. AI tiếp nhận và xử lý những câu hỏi lặp lại trước khi cần nhân viên hỗ trợ.</p>
                    </article>
                    <article>
                        <small>TỐI ƯU ĐẾN</small>
                        <strong>30%</strong>
                        <p>chi phí chăm sóc khách hàng. Mở rộng khả năng phục vụ mà không cần tăng nhân sự theo số lượng hội thoại.</p>
                    </article>
                    <article>
                        <small>PHẢN HỒI ĐẦU TIÊN</small>
                        <strong><em>DƯỚI</em> 5 <em>GIÂY</em></strong>
                        <p>Khách hàng nhận được phản hồi tức thì, kể cả ngoài giờ làm việc.</p>
                    </article>
                </div>
            </div>
        </section>
        <section className="csp-section csp-outcomes"><div className="csp-shell"><Heading eyebrow="TỪ TIN NHẮN ĐẾN CHUYỂN ĐỔI" title="Mỗi cuộc trò chuyện đều có thể tạo ra kết quả" text="Losa không chỉ trả lời. AI hiểu nhu cầu, thực hiện tác vụ và lưu tín hiệu để đội ngũ chốt đơn đúng lúc." /><div className="csp-conversion-engine"><div className="csp-conversion-engine__input"><div className="csp-conversion-engine__label"><MessageCircle /> TÍN HIỆU TỪ KHÁCH HÀNG</div><div className="csp-conversion-engine__bubble">“Bên mình cần 20 máy lọc không khí cho văn phòng, giao trong tuần này.”</div><div className="csp-conversion-engine__signals"><span><small>NHU CẦU</small>20 máy lọc không khí</span><span><small>THỜI GIAN</small>Giao trong tuần</span><span><small>ĐỐI TƯỢNG</small>Khách hàng doanh nghiệp</span><span><small>MỨC ĐỘ</small>Tiềm năng cao</span></div></div><div className="csp-conversion-engine__pipeline"><div className="csp-conversion-engine__line"><i /></div>{[[BrainCircuit, 'Hiểu nhu cầu', 'Nhận diện ý định và thông tin quan trọng'], [Filter, 'Phân loại cơ hội', 'Gán nhãn, chấm điểm và ưu tiên lead'], [ShoppingBag, 'Thực hiện tác vụ', 'Kiểm tra sản phẩm, tồn kho và tạo báo giá'], [Database, 'Đồng bộ dữ liệu', 'Cập nhật CRM và chuyển đúng đội ngũ']].map(([Icon, title, text], i) => <div className="csp-conversion-engine__stage" key={title}><b>0{i + 1}</b><span><Icon /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}</div><div className="csp-conversion-engine__output"><span className="csp-conversion-engine__status"><i /> SẴN SÀNG XỬ LÝ</span><div className="csp-conversion-engine__output-icon"><UserRoundCheck /></div><small>KẾT QUẢ ĐẦU RA</small><h3>Một cơ hội bán hàng có đầy đủ ngữ cảnh</h3><p>Đội ngũ nhận đúng khách hàng, đúng nhu cầu và đúng thời điểm để tiếp tục tư vấn.</p><ul><li><CheckCircle2 /> Hồ sơ lead đã được chuẩn hóa</li><li><CheckCircle2 /> Báo giá sẵn sàng gửi</li><li><CheckCircle2 /> Nhân viên nhận trọn ngữ cảnh</li></ul></div></div><div className="csp-outcome-grid">{outcomes.map(x => { const Icon = x.icon; return <article key={x.title}><span className="csp-outcome-card__icon"><Icon /></span><div><small>{x.label}</small><h3>{x.title}</h3><p>{x.text}</p></div><ArrowRight /></article> })}</div></div></section>
        <section className="csp-section csp-capabilities" id="capabilities"><div className="csp-shell"><Heading eyebrow="NĂNG LỰC CHATBOT AI LOSA" title="Chatbot AI Losa có thể làm gì cho doanh nghiệp bạn?" text="Một trợ lý AI xuyên suốt từ tin nhắn đầu tiên đến tư vấn, giao hàng và chăm sóc sau bán." /><div className="csp-capability-layout"><CapabilityTabs items={caps} activeId={cap} onSelect={setCap} /><div className="csp-capability-panel" role="tabpanel"><div className="csp-capability-panel__copy"><div className="csp-eyebrow">{active.kicker}</div><h3>{active.title}</h3><p>{active.text}</p><ul>{active.bullets.map(x => <li key={x}><CheckCircle2 />{x}</li>)}</ul></div><Conversation mode={active.id} compact /></div></div></div></section>
        <section className="csp-section csp-usecases"><div className="csp-shell"><Heading eyebrow="AI THIẾT KẾ THEO NGÀNH" title="Mỗi doanh nghiệp có một cách vận hành khác nhau" text="Losa được thiết kế theo đúng quy trình, dữ liệu và tác vụ đặc thù của từng ngành." /><div className="csp-usecase-tabs" role="tablist" aria-label="Chọn ngành ứng dụng AI" onKeyDown={event => { const index = industries.findIndex(x => x.id === industry); const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0; if (!direction) return; event.preventDefault(); const next = industries[(index + direction + industries.length) % industries.length]; setIndustry(next.id); requestAnimationFrame(() => document.getElementById(`industry-tab-${next.id}`)?.focus()); }}>{industries.map(x => { const Icon = x.icon; return <button type="button" id={`industry-tab-${x.id}`} key={x.id} className={industry === x.id ? 'is-active' : ''} onClick={() => setIndustry(x.id)} role="tab" tabIndex={industry === x.id ? 0 : -1} aria-selected={industry === x.id} aria-controls={`industry-panel-${x.id}`}><Icon />{x.name}</button> })}</div>
        <IndustryWorkflowStudio industryId={industry} />
        </div></section>
        <section className="csp-section csp-rollout"><div className="csp-shell"><Heading eyebrow="TRIỂN KHAI CÓ LỘ TRÌNH" title="Từ bài toán thực tế đến chatbot sẵn sàng vận hành" /><div className="csp-rollout__track">{rollout.map(x => <article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></div></section>
        <CustomerMarquee />
        <ClientFaqSection faqs={faqs} />
    </main>
}
