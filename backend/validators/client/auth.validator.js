const { z } = require('zod');

exports.registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().optional(),
});

exports.updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự').max(255, 'Tên không được vượt quá 255 ký tự'),
  phone: z.string().trim().max(32, 'Số điện thoại không được vượt quá 32 ký tự')
    .refine((value) => !value || /^[0-9+().\s-]{8,32}$/.test(value), 'Số điện thoại không hợp lệ'),
}).strict('Thông tin cập nhật không hợp lệ');

exports.loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

exports.forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

exports.resetPasswordSchema = z.object({
  token: z.string().min(1, 'Thiếu token'),
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
