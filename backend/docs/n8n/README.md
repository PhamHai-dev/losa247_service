# LOSA247 Chat ↔ n8n

## Import

1. Trong n8n chọn **Import from File** và chọn `chat-orchestrator.workflow.json`.
2. Cấu hình biến môi trường n8n: `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`, `N8N_INBOUND_SECRET`.
3. Nếu dùng OpenAI-compatible provider, đặt `OPENAI_BASE_URL`.
4. Activate workflow và sao chép **Production Webhook URL** vào backend `N8N_WEBHOOK_URL`.
5. Backend `N8N_INBOUND_SECRET` phải trùng secret n8n dùng ký callback. `N8N_OUTBOUND_SECRET` dành cho bước verify inbound ở n8n nếu bổ sung Code node xác minh.

## Backend

- Development: `RUN_CHAT_WORKERS_IN_API=true`.
- Production: đặt `false`, chạy riêng `npm run worker:outbox`, `npm run worker:chat`, `npm run worker:dlq`.
- `N8N_CALLBACK_URL` phải được n8n truy cập được; localhost không dùng được nếu n8n ở máy khác/container khác.

## Contract callback

Callback `POST /api/v1/webhooks/n8n/chat-reply` phải gửi raw JSON cùng `x-timestamp` và `x-signature`. Chữ ký là HMAC-SHA256 của `timestamp + rawBody`.

Backend chỉ nhận command `chat.reply`, kiểm tra schema, event idempotency, `mode=bot` và `expectedVersion` trước khi ghi message.

## Vision

Attachment context chứa Cloudinary authenticated signed URL. URL chỉ dùng trong thời gian xử lý; không lưu URL này làm định danh. `publicId` nằm trong MySQL.

> Workflow mẫu dùng HTTP Request tới OpenAI-compatible API để dễ import. Có thể thay node AI bằng provider node, nhưng output cuối vẫn phải tuân theo `structured-output.schema.json`.
