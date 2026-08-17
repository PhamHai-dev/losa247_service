/**
 * Phân trang từ query parameters
 */
function paginate(query, { page = 1, limit = 20 }) {
  // 1. Ép kiểu và đảm bảo page >= 1
  const p = Math.max(1, parseInt(page));

  // 2. Ép kiểu và đảm bảo 1 <= limit <= 100
  const l = Math.min(100, Math.max(1, parseInt(limit)));

  // 3. Trả về thông tin phân trang cho repository
  return { skip: (p - 1) * l, limit: l, page: p };
}

/**
 * Build response chuẩn cho danh sách có phân trang
 */
function buildPaginationResponse(data, total, page, limit) {
  // 1. Tính tổng số trang
  const totalPages = Math.ceil(total / limit);

  // 2. Trả về cấu trúc response chuẩn
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Generate slug từ string (ví dụ: Tạo bài viết -> tao-bai-viet)
 */
function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Chuẩn hóa unicode
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-') // Đổi khoảng trắng thành gạch ngang
    .replace(/[^\w-]+/g, '') // Xóa ký tự đặc biệt
    .replace(/--+/g, '-') // Gom nhiều gạch ngang thành 1
    .replace(/^-+/, '') // Xóa gạch ngang ở đầu
    .replace(/-+$/, ''); // Xóa gạch ngang ở cuối
}

module.exports = {
  paginate,
  buildPaginationResponse,
  generateSlug,
};
