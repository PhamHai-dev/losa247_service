# Quản lý context chat

Hệ thống áp dụng ba tầng giới hạn:

- Tin customer: tối đa 8.000 Unicode code points. Tin admin/bot không chịu giới hạn nghiệp vụ này.
- Một payload AI: tối đa 48.000 ký tự; current batch được ưu tiên trước recent messages và session context.
- Một chu kỳ bot: tối đa 200 tin customer hoặc 400.000 đơn vị. Mỗi attachment tính 1.000 đơn vị.

Tin làm bộ đếm đạt ngưỡng (`>=`) vẫn được lưu, nhưng không tạo outbox AI. Session chuyển ngay sang `human`, tăng version để callback cũ bị từ chối, ghi handoff và một notification.

Khi admin bật lại bot, hệ thống tăng `botCycle`, reset counters và bắt đầu context hoàn toàn mới. Tin nhắn cũ vẫn còn trong database/UI nhưng không được đưa vào AI context. Summary không được sử dụng.

## Triển khai database

1. Backup và xác nhận đúng `DATABASE_URL`.
2. Review migration `20260917060000_chat_context_cycles`.
3. Chạy `npm run prisma:migrate:deploy` trong `backend/`.
4. Chạy `npm run prisma:generate` sau khi dừng process Node đang giữ Prisma query engine trên Windows.
5. Chạy một lần `npm run chat:backfill-cycles` để tính counters cho session đang mở.

Backfill chuyển session đã đạt giới hạn sang human nhưng không tạo hàng loạt notification lịch sử.

## Điều chỉnh

Các ngưỡng nằm trong `.env.example`. Không đặt `CHAT_CONTEXT_MAX_CHARS` lớn hơn context window thực tế của model trong n8n. Log chỉ nên chứa `contextMeta`, batch/session ID và trạng thái; không log nội dung chat.
