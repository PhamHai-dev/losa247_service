const errorHandler = (err, req, res, next) => {
  // 1. Log lỗi ra console
  console.error(err.stack);

  // 2. Xác định status code (mặc định 500 nếu là 200)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // 3. Trả về response lỗi chuẩn
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Lỗi hệ thống',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
