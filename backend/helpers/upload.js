const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const env = require('../config/env');

const STORAGE_ROOT = path.resolve(env.STORAGE_ROOT);
const PUBLIC_ROOT = path.join(STORAGE_ROOT, 'public');
const PRIVATE_ROOT = path.join(STORAGE_ROOT, 'private');

const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico',
};
const publicDirectories = { blog: 'images/blog-image', logo: 'images/logo-image', favicon: 'images/favicon-image' };

const safeResolve = (root, relativePath) => {
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw Object.assign(new Error('Đường dẫn lưu trữ không hợp lệ'), { statusCode: 400, code: 'INVALID_STORAGE_PATH' });
  return resolved;
};
const extensionFor = (file) => {
  const extension = extensions[file?.mimetype];
  if (!extension) throw Object.assign(new Error('Định dạng ảnh không được hỗ trợ'), { statusCode: 400, code: 'UNSUPPORTED_FILE_TYPE' });
  return extension;
};
const writeFile = async (root, relativePath, buffer) => {
  const absolutePath = safeResolve(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer, { flag: 'wx' });
  return absolutePath;
};
const removeFile = async (root, relativePath) => {
  if (!relativePath) return;
  try { await fs.unlink(safeResolve(root, relativePath)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
};

const publicUrl = (relativePath) => `${env.PUBLIC_BASE_URL}/uploads/${relativePath.split(path.sep).join('/')}`;
const chatContentUrl = (attachmentId, token) => `${env.PUBLIC_BASE_URL}/api/v1/chat/attachments/${attachmentId}/content${token ? `?token=${encodeURIComponent(token)}` : ''}`;
const automationAttachmentUrl = (attachmentId, expiresAt = Date.now() + (15 * 60 * 1000)) => {
  if (!env.N8N_OUTBOUND_SECRET) return null;
  const expires = String(expiresAt);
  const signature = crypto.createHmac('sha256', env.N8N_OUTBOUND_SECRET).update(`${attachmentId}.${expires}`).digest('hex');
  return `${chatContentUrl(attachmentId)}?expires=${expires}&signature=${signature}`;
};
const hasValidAutomationSignature = (attachmentId, expires, signature) => {
  if (!expires || !signature || Number(expires) < Date.now() || !env.N8N_OUTBOUND_SECRET) return false;
  const expected = crypto.createHmac('sha256', env.N8N_OUTBOUND_SECRET).update(`${attachmentId}.${expires}`).digest('hex');
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

exports.PUBLIC_ROOT = PUBLIC_ROOT;
exports.PRIVATE_ROOT = PRIVATE_ROOT;
exports.safeResolve = safeResolve;
exports.publicUrl = publicUrl;
exports.chatContentUrl = chatContentUrl;
exports.automationAttachmentUrl = automationAttachmentUrl;
exports.hasValidAutomationSignature = hasValidAutomationSignature;
exports.savePublicImage = async (file, type) => {
  const directory = publicDirectories[type];
  if (!directory) throw Object.assign(new Error('Loại tài sản không hợp lệ'), { statusCode: 400, code: 'INVALID_ASSET_TYPE' });
  const relativePath = path.join(directory, `${Date.now()}-${crypto.randomUUID()}${extensionFor(file)}`);
  await writeFile(PUBLIC_ROOT, relativePath, file.buffer);
  return { relativePath, url: publicUrl(relativePath) };
};
exports.saveChatAttachment = async (file, { sessionId, attachmentId }) => {
  const relativePath = path.join('chat-images', sessionId, `${attachmentId}${extensionFor(file)}`);
  const absolutePath = await writeFile(PRIVATE_ROOT, relativePath, file.buffer);
  return { relativePath, absolutePath, format: path.extname(relativePath).slice(1) };
};
exports.deletePublicImage = (relativePath) => removeFile(PUBLIC_ROOT, relativePath);
exports.deleteChatAttachment = (attachment) => removeFile(PRIVATE_ROOT, typeof attachment === 'string' ? attachment : attachment?.storagePath);

