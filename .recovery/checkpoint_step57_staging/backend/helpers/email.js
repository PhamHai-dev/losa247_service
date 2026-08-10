const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

exports.sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `http://localhost:5173/dat-lai-mat-khau?token=${token}`; // Adjust depending on frontend URL

  const mailOptions = {
    from: `"Losa247" <${env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Đặt lại mật khẩu - Losa247',
    html: `
      <h2>Yêu cầu đặt lại mật khẩu</h2>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link bên dưới để tạo mật khẩu mới:</p>
      <a href="${resetUrl}" target="_blank">Đặt lại mật khẩu</a>
      <p>Link này sẽ hết hạn sau 1 giờ.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    throw error;
  }
};
