import { CountUpAnimation } from '../../components/ui/CountUpAnimation';
import { Reveal } from '../../components/ui/Reveal';
import React, { useState } from "react";
import "../../styles/chatbot-solutions.css";
import { Link } from "react-router-dom";
import { useApiQuery } from '../../hooks/useApiQuery';
import { publicFaqsService } from '../../features/faqs/faqsService';
import { Mail, Users, Clock, BarChart2, Filter, HelpCircle } from 'lucide-react';


export default function LosaClone() {
  const [faqOpen, setFaqOpen] = useState(null);
  const faqsQuery = useApiQuery(
    () => publicFaqsService.getList({ pageType: 'solutions', serviceDetail: 'chatbot' }),
    []
  );
  const faqs = faqsQuery.data?.items || [];
  return (
    <div className="client-app-wrapper">

      <section className="saas-hero" style={{ width: "100%" }}>
        <div className="hero-linear-bg"></div>
        <div className="saas-container relative" style={{ zIndex: 1, padding: "0 4vw" }}>
          <div
            className="relative flex-col lg-flex-row items-center lg-items-center gap-32 lg-gap-24 flex justify-between w-full"
            style={{ maxWidth: "1536px", margin: "0 auto", zIndex: "1" }}
          >
            <div
              className="items-center lg-items-start flex flex-col w-full gap-16"
              style={{ padding: "45px 0" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 0",
                }}
              >
                <span style={{ width: "8px", height: "8px", backgroundColor: "#16A34A", borderRadius: "50%" }}></span>
                <span
                  style={{
                    color: "#16A34A",
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  Giải pháp AI Automation
                </span>
              </div>

              <h1 style={{
                textAlign: "left",
                color: "#102033",
                fontSize: "clamp(36px, 4vw, 48px)",
                lineHeight: "1.2",
                fontWeight: "700",
                margin: "0",
              }}>
                Giải pháp AI Automation{" "}
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  cho doanh nghiệp
                </span>
              </h1>

              <p
                style={{
                  textAlign: "left",
                  color: "#475569",
                  fontSize: "18px",
                  lineHeight: "1.6",
                  margin: "0 0 16px 0",
                }}
              >
                Tự động hóa quy trình bán hàng, chăm sóc khách hàng<br />
                và Marketing trên Facebook, Zalo, Instagram,...<br />
                Giúp doanh nghiệp tăng trưởng bền vững và tiết kiệm chi phí.
              </p>

              <div style={{ display: "flex", gap: "16px", alignItems: "center", width: "100%", justifyContent: "flex-start" }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: "14px 28px", fontSize: "16px", borderRadius: "10px" }}
                >
                  Đăng ký tư vấn
                </button>
              </div>
            </div>

            <div
              style={{ width: "100%", maxWidth: "600px", position: "relative" }}
              className="flex items-center justify-center"
            >
              {/* Vòng tròn mờ trang trí phía sau ảnh */}
              <div style={{ position: "absolute", width: "80%", height: "80%", backgroundColor: "#16A34A", filter: "blur(100px)", opacity: "0.12", borderRadius: "50%", zIndex: -1 }}></div>

              <img
                alt="Dashboard Losa AI"
                fetchPriority="high"
                loading="eager"
                width="1000"
                height="auto"
                decoding="async"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))"
                }}
                src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1785291429/solution_hero_hluezh.png"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#f8fafc", width: "100%", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div className="saas-container py-40 md-py-30">
          <div style={{ maxWidth: "1536px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ width: "24px", height: "1px", backgroundColor: "#16A34A" }}></span>
                <span style={{ color: "#16A34A", fontWeight: "700", fontSize: "14px", textTransform: "uppercase" }}>
                  Doanh nghiệp của bạn đang gặp vấn đề gì?
                </span>
                <span style={{ width: "24px", height: "1px", backgroundColor: "#16A34A" }}></span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "16px"
              }}
            >
              {[
                { icon: <Mail size={36} strokeWidth={1.5} color="#16A34A" />, title: "Inbox quá nhiều", desc: "Tin nhắn đến liên tục, khó phản hồi kịp thời" },
                { icon: <Users size={36} strokeWidth={1.5} color="#16A34A" />, title: "Không chăm sóc khách cũ", desc: "Khách hàng tiềm năng bị bỏ sót" },
                { icon: <Clock size={36} strokeWidth={1.5} color="#16A34A" />, title: "Tốn nhiều nhân sự", desc: "Chi phí nhân sự cao, không hiệu quả" },
                { icon: <BarChart2 size={36} strokeWidth={1.5} color="#16A34A" />, title: "Không đo lường hiệu quả", desc: "Khó theo dõi và đánh giá kết quả" },
                { icon: <Filter size={36} strokeWidth={1.5} color="#16A34A" />, title: "Khách hàng bị bỏ sót", desc: "Không phản hồi kịp thời, mất cơ hội" },
                { icon: <HelpCircle size={36} strokeWidth={1.5} color="#16A34A" />, title: "Không biết Follow-up", desc: "Thiếu quy trình chăm sóc tự động" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "20px",
                    padding: "24px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div style={{ marginBottom: "16px", background: "#f0fdf4", padding: "14px", borderRadius: "14px" }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>{item.title}</h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="saas-container py-40 md-py-30 flex items-center justify-center">
        <div
          className="flex flex-col items-center justify-center w-full gap-24"
          style={{ maxWidth: "1536px" }}
        >
          <div className="flex flex-col gap-24 md-gap-16 items-center justify-center">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "6px 0",
              }}
            >
              <span
                className="text-color-primary"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  textAlign: "center",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                BIẾN HỘI THOẠI THÀNH TĂNG TRƯỞNG
              </span>
            </div>
            <h2 className="text-2xl md-text-3xl font-semibold text-primary mb-0 text-center">
              <span>
                Losa{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  giúp bạn thành công như thế nào?
                </span>
              </span>
            </h2>
            <p className="text-md md-text-xl text-secondary text-center mb-0">
              ...và lí do bạn nên sử dụng Losa trên nền tảng của mình
            </p>
          </div>
          <div
            className="flex flex-col md-flex-row"
            style={{ maxWidth: "1536px", gap: "35px" }}
          >
            <div
              className="flex flex-col gap-8 usecase-item w-full items-center text-center"
              style={{
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #BBF7D0",
                background: "#F0FDF4",
                color: "#16A34A",
              }}
            >
              <div className="flex flex-col items-center justify-center gap-12 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  style={{ flex: "none" }}
                >
                  <path
                    d="M128,129.09V232a8,8,0,0,1-3.84-1l-88-48.18a8,8,0,0,1-4.16-7V80.18a8,8,0,0,1,.7-3.25Z"
                    opacity="0.2"
                  ></path>
                  <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path>
                </svg>
                <h3 className="text-md md-text-xl font-semibold text-primary mb-0">
                  Có mặt khi khách hàng phản hồi
                </h3>
              </div>
              <p className="text-sm text-secondary mb-0">
                Tỉ lệ mở tin và phản hồi cao gấp 4 lần so với email và các
                kênh truyền thống
              </p>
            </div>
            <div
              className="flex flex-col gap-8 usecase-item w-full items-center text-center"
              style={{
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #BBF7D0",
                background: "#F0FDF4",
                color: "#16A34A",
              }}
            >
              <div className="flex flex-col items-center justify-center gap-12 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  style={{ flex: "none" }}
                >
                  <path
                    d="M231.66,213.73a8,8,0,0,1-9.93,9.93L194,215.5A72.05,72.05,0,0,1,92.06,175.89h0c1.31.07,2.62.11,3.94.11a72,72,0,0,0,67.93-95.88h0A72,72,0,0,1,223.5,186Z"
                    opacity="0.2"
                  ></path>
                  <path d="M232.07,186.76a80,80,0,0,0-62.5-114.17A80,80,0,1,0,23.93,138.76l-7.27,24.71a16,16,0,0,0,19.87,19.87l24.71-7.27a80.39,80.39,0,0,0,25.18,7.35,80,80,0,0,0,108.34,40.65l24.71,7.27a16,16,0,0,0,19.87-19.86ZM62,159.5a8.28,8.28,0,0,0-2.26.32L32,168l8.17-27.76a8,8,0,0,0-.63-6,64,64,0,1,1,26.26,26.26A8,8,0,0,0,62,159.5Zm153.79,28.73L224,216l-27.76-8.17a8,8,0,0,0-6,.63,64.05,64.05,0,0,1-85.87-24.88A79.93,79.93,0,0,0,174.7,89.71a64,64,0,0,1,41.75,92.48A8,8,0,0,0,215.82,188.23Z"></path>
                </svg>
                <h3 className="text-md md-text-xl font-semibold text-primary mb-0">
                  Biến cuộc trò chuyện thành doanh số
                </h3>
              </div>
              <p className="text-sm text-secondary mb-0">
                Hướng dẫn khách hàng và tạo dựng lòng trung thành ngay trong
                cuộc trò chuyện
              </p>
            </div>
            <div
              className="flex flex-col gap-8 usecase-item w-full items-center text-center"
              style={{
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #BBF7D0",
                background: "#F0FDF4",
                color: "#16A34A",
              }}
            >
              <div className="flex flex-col items-center justify-center gap-12 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  style={{ flex: "none" }}
                >
                  <path
                    d="M96,240l16-80L48,136,160,16,144,96l64,24Z"
                    opacity="0.2"
                  ></path>
                  <path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"></path>
                </svg>
                <h3 className="text-md md-text-xl font-semibold text-primary mb-0">
                  Tự động 24/7
                </h3>
              </div>
              <p className="text-sm text-secondary mb-0">
                Tự động trả lời, thu thập khách hàng tiềm năng và thúc đẩy
                doanh số
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="saas-container py-40 md-py-30 flex items-center justify-center">
        <div
          className="flex flex-col gap-24 items-center justify-center w-full"
          style={{ maxWidth: "1536px" }}
        >
          <div
            className="flex flex-col gap-24 md-gap-16 items-center justify-center"
            style={{ maxWidth: "1536px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "6px 0",
              }}
            >
              <span
                className="text-color-primary"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  textAlign: "center",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                Kết quả thực tế
              </span>
            </div>
            <h2 className="text-2xl md-text-3xl font-semibold text-primary text-center mb-0">
              <span>
                Thúc đẩy tăng trưởng{" "}
                <span
                  className="hero-title-gradient"
                  style={{
                    background:
                      "linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  bằng tin nhắn tích hợp AI{" "}
                </span>
              </span>
            </h2>
            <p
              className="text-md md-text-lg text-secondary text-center mb-0"
              style={{ maxWidth: "960px" }}
            >
              Vượt xa với kết quả đo lường được
            </p>
          </div>
          <div
            className="w-full relative"
            style={{ overflow: "hidden", minHeight: "134px" }}
          >
            <div
              className="flex flex-row justify-center gap-48 absolute w-full"
              style={{ top: "0", left: "0" }}
            >
              <div
                className="flex flex-col gap-12 items-center justify-start w-full"
                style={{ maxWidth: "315px", minWidth: "315px" }}
              >
                <span className="text-2xl font-semibold text-primary text-center">
                  Tăng
                </span>
                <span className="text-4xl font-bold text-color-primary text-center">
                  20%
                </span>
                <span className="text-lg text-primary text-center">
                  Tỷ lệ chuyển đổi từ tin nhắn
                </span>
              </div>
              <div
                className="flex flex-col gap-12 items-center justify-start w-full"
                style={{ maxWidth: "315px", minWidth: "315px" }}
              >
                <span className="text-2xl font-semibold text-primary text-center">
                  Tăng
                </span>
                <span className="text-4xl font-bold text-color-primary text-center">
                  34%
                </span>
                <span className="text-lg text-primary text-center">
                  Lợi nhuận trên chi tiêu quảng cáo
                </span>
              </div>
              <div
                className="flex flex-col gap-12 items-center justify-start w-full"
                style={{ maxWidth: "315px", minWidth: "315px" }}
              >
                <span className="text-2xl font-semibold text-primary text-center">
                  Đạt tới
                </span>
                <span className="text-4xl font-bold text-color-primary text-center">
                  8x
                </span>
                <span className="text-lg text-primary text-center">
                  Tốc độ phản hồi khách hàng
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="saas-container py-40 md-py-30 flex items-center justify-center">
        <div
          className="flex flex-col items-center justify-center w-full gap-24 md-gap-60"
          style={{ maxWidth: "1536px" }}
        >
          <div className="flex flex-col gap-24 md-gap-16 items-center justify-center">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "6px 0",
              }}
            >
              <span
                className="text-color-primary"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  textAlign: "center",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                GIẢI PHÁP NHẮN TIN DOANH NGHIỆP LOSA
              </span>
            </div>
            <h2 className="text-2xl md-text-3xl font-semibold text-primary mb-0 text-center">
              <span>
                Losa{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  có thể giúp gì cho bạn?
                </span>
              </span>
            </h2>
            <p
              className="text-md md-text-xl text-secondary text-center mb-0"
              style={{ whiteSpace: "pre-line" }}
            >
              Tăng cường hiệu quả và mở rộng quy mô nhanh hơn trên các nền
              tảng nhắn tin
            </p>
            <div className="flex-col md-flex-row flex items-center justify-center gap-16">
              <div className="flex items-center justify-center gap-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="text-secondary"
                >
                  <path d="M224,40V76a8,8,0,0,1-16,0V48H180a8,8,0,0,1,0-16h36A8,8,0,0,1,224,40Zm-8,132a8,8,0,0,0-8,8v28H180a8,8,0,0,0,0,16h36a8,8,0,0,0,8-8V180A8,8,0,0,0,216,172ZM76,208H48V180a8,8,0,0,0-16,0v36a8,8,0,0,0,8,8H76a8,8,0,0,0,0-16ZM40,84a8,8,0,0,0,8-8V48H76a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V76A8,8,0,0,0,40,84Zm136,92a8,8,0,0,1-6.41-3.19,52,52,0,0,0-83.2,0,8,8,0,1,1-12.8-9.62A67.94,67.94,0,0,1,101,141.51a40,40,0,1,1,53.94,0,67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,176,176Zm-48-40a24,24,0,1,0-24-24A24,24,0,0,0,128,136Z"></path>
                </svg>
                <span className="text-secondary text-md">
                  Tạo khách hàng tiềm năng
                </span>
              </div>
              <div className="flex items-center justify-center gap-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="text-secondary"
                >
                  <path d="M201.89,54.66A103.43,103.43,0,0,0,128.79,24H128A104,104,0,0,0,24,128v56a24,24,0,0,0,24,24H64a24,24,0,0,0,24-24V144a24,24,0,0,0-24-24H40.36A88.12,88.12,0,0,1,190.54,65.93,87.39,87.39,0,0,1,215.65,120H192a24,24,0,0,0-24,24v40a24,24,0,0,0,24,24h24a24,24,0,0,1-24,24H136a8,8,0,0,0,0,16h56a40,40,0,0,0,40-40V128A103.41,103.41,0,0,0,201.89,54.66ZM64,136a8,8,0,0,1,8,8v40a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V136Zm128,56a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h24v56Z"></path>
                </svg>
                <span className="text-secondary text-md">
                  Hỗ trợ khách hàng
                </span>
              </div>
              <div className="flex items-center justify-center gap-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="text-secondary"
                >
                  <path d="M248,120a48.05,48.05,0,0,0-48-48H160.2c-2.91-.17-53.62-3.74-101.91-44.24A16,16,0,0,0,32,40V200a16,16,0,0,0,26.29,12.25c37.77-31.68,77-40.76,93.71-43.3v31.72A16,16,0,0,0,159.12,214l11,7.33A16,16,0,0,0,194.5,212l11.77-44.36A48.07,48.07,0,0,0,248,120ZM48,199.93V40h0c42.81,35.91,86.63,45,104,47.24v65.48C134.65,155,90.84,164.07,48,199.93Zm131,8,0,.11-11-7.33V168h21.6ZM200,152H168V88h32a32,32,0,1,1,0,64Z"></path>
                </svg>
                <span className="text-secondary text-md">
                  Tin nhắn Marketing
                </span>
              </div>
            </div>
          </div>
          <div
            className="flex flex-col items-center justify-center feature-list w-full"
            style={{ gap: "60px" }}
          >
            <div className="flex items-center justify-between w-full flex-col lg-flex-row gap-12 lg-gap-60">
              <div
                className="w-full flex justify-center"
                style={{
                  maxWidth: "570px",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <img
                  alt="THU THẬP KHÁCH HÀNG TIỀM NĂNG CHẤT LƯỢNG CAO"
                  fetchPriority="high"
                  loading="eager"
                  width="570"
                  height="520"
                  decoding="async"
                  data-nimg="1"
                  className="h-auto w-full"
                  style={{ color: "transparent" }}
                  src="https://botcake.io/static/images/landing/solutions/feature-1.svg"
                />
              </div>
              <div
                className="w-full flex flex-col gap-12 w-full feature-content"
                style={{ maxWidth: "580px" }}
              >
                <h3 className="flex items-center gap-12 text-upercase text-color-primary text-md font-semibold mb-0">
                  THU THẬP KHÁCH HÀNG TIỀM NĂNG CHẤT LƯỢNG CAO
                </h3>
                <p className="text-primary text-2xl mb-0">
                  Thu thập, quét và chấm điểm khách hàng tiềm năng tự động
                </p>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Kích hoạt các luồng thu thập khách hàng tiềm năng bằng
                    quảng cáo CTM
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Tự động đặt các câu hỏi sàng lọc
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Đồng bộ hoá khách hàng tiềm năng với các hệ thống CRM
                  </li>
                </ul>
                <span className="text-primary text-xl font-semibold">
                  Sử dụng tốt nhất cho
                </span>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M120,80A40,40,0,1,1,80,40,40,40,0,0,1,120,80Zm56,40a40,40,0,1,0-40-40A40,40,0,0,0,176,120ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm96,0a40,40,0,1,0,40,40A40,40,0,0,0,176,136Z"></path>
                      </svg>
                    </div>
                    Doanh nghiệp đang chạy quảng cáo trả phí và cần có khách
                    hàng tiềm năng nhanh chóng, chất lượng
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M120,80A40,40,0,1,1,80,40,40,40,0,0,1,120,80Zm56,40a40,40,0,1,0-40-40A40,40,0,0,0,176,120ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm96,0a40,40,0,1,0,40,40A40,40,0,0,0,176,136Z"></path>
                      </svg>
                    </div>
                    Giải pháp lý tưởng cho: Thương mại điện tử, phòng khám,
                    bất động sản hoặc giáo dục
                  </li>
                </ul>
                <span className="text-primary text-xl font-semibold">
                  Kết quả
                </span>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      Tỷ lệ thu thập khách hàng tiềm năng qua tin nhắn{" "}
                      <strong className="font-bold">tăng lên 60%</strong>
                    </span>
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      <strong className="font-bold">Giảm 75%</strong> chi phí
                      trên mỗi khách hàng tiềm năng
                    </span>
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      <strong className="font-bold">Tăng 3.8 lần</strong> giá
                      trị nếu phản hồi dưới 5 phút
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between w-full flex-col lg-flex-row-reverse gap-12 lg-gap-60">
              <div
                className="w-full flex justify-center"
                style={{
                  maxWidth: "570px",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <img
                  alt="HỖ TRỢ KHÁCH HÀNG TỰ ĐỘNG"
                  fetchPriority="high"
                  loading="eager"
                  width="570"
                  height="520"
                  decoding="async"
                  data-nimg="1"
                  className="h-auto w-full"
                  style={{ color: "transparent" }}
                  src="https://botcake.io/static/images/landing/solutions/feature-2.svg"
                />
              </div>
              <div
                className="w-full flex flex-col gap-12 w-full feature-content"
                style={{ maxWidth: "580px" }}
              >
                <h3 className="flex items-center gap-12 text-upercase text-color-primary text-md font-semibold mb-0">
                  HỖ TRỢ KHÁCH HÀNG TỰ ĐỘNG
                </h3>
                <p className="text-primary text-2xl mb-0">
                  Chăm sóc khách hàng tự động và liền mạch với AI
                </p>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Giải đáp câu hỏi thường gặp 24/7
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Cập nhật tình trạng đơn hàng liên tục &amp; chính xác
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Chuyển tiếp liền mạch cho nhân viên tư vấn với toàn bộ
                    lịch sử cuộc trò chuyện
                  </li>
                </ul>
                <span className="text-primary text-xl font-semibold">
                  Sử dụng tốt nhất cho
                </span>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M120,80A40,40,0,1,1,80,40,40,40,0,0,1,120,80Zm56,40a40,40,0,1,0-40-40A40,40,0,0,0,176,120ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm96,0a40,40,0,1,0,40,40A40,40,0,0,0,176,136Z"></path>
                      </svg>
                    </div>
                    Thương hiệu chi tiêu ngân sách lớn cho quảng cáo và cần
                    duy trì kết nối 24/7
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M120,80A40,40,0,1,1,80,40,40,40,0,0,1,120,80Zm56,40a40,40,0,1,0-40-40A40,40,0,0,0,176,120ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm96,0a40,40,0,1,0,40,40A40,40,0,0,0,176,136Z"></path>
                      </svg>
                    </div>
                    Giải pháp lý tưởng cho: Bán lẻ, chăm sóc sức khoẻ hay giao
                    đồ ăn hoặc dịch vụ
                  </li>
                </ul>
                <span className="text-primary text-xl font-semibold">
                  Kết quả
                </span>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      <strong className="font-bold">70%</strong> yêu cầu được
                      giải quyết bằng AI{" "}
                    </span>
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      Thời gian phản hồi trung bình nhanh hơn{" "}
                      <strong className="font-bold">2 lần</strong>
                    </span>
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      <strong className="font-bold">Giảm 50%</strong> khối
                      lượng công việc thủ công
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between w-full flex-col lg-flex-row gap-12 lg-gap-60">
              <div
                className="w-full flex justify-center"
                style={{
                  maxWidth: "570px",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <img
                  alt="TRIỂN KHAI CHIẾN DỊCH TIẾP THỊ TIN NHẮN HÀNG LOẠT"
                  fetchPriority="high"
                  loading="eager"
                  width="570"
                  height="520"
                  decoding="async"
                  data-nimg="1"
                  className="h-auto w-full"
                  style={{ color: "transparent" }}
                  src="https://botcake.io/static/images/landing/solutions/feature-3.svg"
                />
              </div>
              <div
                className="w-full flex flex-col gap-12 w-full feature-content"
                style={{ maxWidth: "580px" }}
              >
                <h3 className="flex items-center gap-12 text-upercase text-color-primary text-md font-semibold mb-0">
                  TRIỂN KHAI CHIẾN DỊCH TIẾP THỊ TIN NHẮN HÀNG LOẠT
                </h3>
                <p className="text-primary text-2xl mb-0">
                  Tiếp cận hàng ngàn người với tín năng gửi tin nhắn hàng loạt
                </p>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Gửi tin nhắn tiếp thị tới nhiều tệp khách hàng cho nhiều
                    mục tiêu
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Phân khúc đối tượng để nhắm mục tiêu chính xác
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                    </div>
                    Theo dõi kết quả bằng bảng điều khiển
                  </li>
                </ul>
                <span className="text-primary text-xl font-semibold">
                  Sử dụng tốt nhất cho
                </span>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M120,80A40,40,0,1,1,80,40,40,40,0,0,1,120,80Zm56,40a40,40,0,1,0-40-40A40,40,0,0,0,176,120ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm96,0a40,40,0,1,0,40,40A40,40,0,0,0,176,136Z"></path>
                      </svg>
                    </div>
                    Các thương hiệu muốn tương tác lại và khai thác giá trị
                    tệp khách cũ
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <div
                      style={{
                        paddingTop: "2px",
                        flex: "none",
                        height: "20px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="#6168F3"
                        viewBox="0 0 256 256"
                      >
                        <path d="M120,80A40,40,0,1,1,80,40,40,40,0,0,1,120,80Zm56,40a40,40,0,1,0-40-40A40,40,0,0,0,176,120ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm96,0a40,40,0,1,0,40,40A40,40,0,0,0,176,136Z"></path>
                      </svg>
                    </div>
                    Giải pháp lý tưởng cho: thời trang, mỹ phẩm, nhà hàng
                    &amp; sự kiện
                  </li>
                </ul>
                <span className="text-primary text-xl font-semibold">
                  Kết quả
                </span>
                <ul
                  className="flex flex-col mb-0 gap-12"
                  style={{ minWidth: "360px", listStyle: "none" }}
                >
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      Tỷ lệ click chuột là{" "}
                      <strong className="font-bold">35%</strong> trên các
                      chiến dịch WhatsApp
                    </span>
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      Tỷ lệ đổi phiếu giảm giá{" "}
                      <strong className="font-bold">đạt hơn 70%</strong>
                    </span>
                  </li>
                  <li className="text-secondary text-md flex gap-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#6168F3"
                      viewBox="0 0 256 256"
                      style={{ flex: "none" }}
                    >
                      <path d="M221.66,133.66l-72,72A8,8,0,0,1,136,200V136H40a8,8,0,0,1,0-16h96V56a8,8,0,0,1,13.66-5.66l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                    <span>
                      <strong className="font-bold">
                        Tương tác cao hơn gấp 3 lần
                      </strong>{" "}
                      so với E-mail
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="saas-container py-40 md-py-30 flex items-center justify-center">
        <div
          className="flex flex-col items-center justify-center w-full gap-24 md-gap-60"
          style={{ maxWidth: "1536px" }}
        >
          <div className="flex flex-col gap-24 md-gap-16 items-center justify-center">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "6px 0",
              }}
            >
              <span
                className="text-color-primary"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  textAlign: "center",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                Sẵn sàng để sử dụng
              </span>
            </div>
            <h2 className="text-2xl md-text-3xl font-semibold text-primary mb-0 text-center">
              Mọi thứ bạn cần để thành công với tin nhắn tự động
            </h2>
            <p
              className="text-md md-text-xl text-secondary text-center mb-0"
              style={{ whiteSpace: "pre-line" }}
            >
              Mọi thứ bạn cần để thành công với tin nhắn tự động
            </p>
          </div>
          <div className="benefit-container gap-12">
            <div
              className="gap-16 flex flex-col w-full"
              style={{
                padding: "12px",
                border: "1px solid #DDE1E7",
                borderRadius: "12px",
              }}
            >
              <img
                alt="Tích hợp CRM"
                className="w-full"
                src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1785124467/benefit-1_xcjai5.webp"
              />
              <div
                className="flex flex-col gap-8"
                style={{ minHeight: "120px", padding: "0px 12px" }}
              >
                <h3 className="text-xl font-semibold text-primary mb-0">
                  Tích hợp CRM
                </h3>
                <p
                  className="text-md text-secondary mb-0"
                  style={{ whiteSpace: "pre-line" }}
                >
                  Tự động đồng bộ hoá khách hàng tiềm năng trên nhiều nền tảng
                </p>
              </div>
            </div>
            <div
              className="gap-16 flex flex-col w-full"
              style={{
                padding: "12px",
                border: "1px solid #DDE1E7",
                borderRadius: "12px",
              }}
            >
              <img
                alt="Quảng cáo tin nhắn"
                className="w-full"
                src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1785124467/benefit-2_yvrrls.webp"
              />
              <div
                className="flex flex-col gap-8"
                style={{ minHeight: "120px", padding: "0px 12px" }}
              >
                <h3 className="text-xl font-semibold text-primary mb-0">
                  Quảng cáo tin nhắn
                </h3>
                <p
                  className="text-md text-secondary mb-0"
                  style={{ whiteSpace: "pre-line" }}
                >
                  Chuyển đổi khách hàng quan tâm từ quảng cáo thành khách mua
                  hàng và khách thân thiết của doanh nghiệp
                </p>
              </div>
            </div>
            <div
              className="gap-16 flex flex-col w-full"
              style={{
                padding: "12px",
                border: "1px solid #DDE1E7",
                borderRadius: "12px",
              }}
            >
              <img
                alt="Danh mục sản phẩm"
                className="w-full"
                src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1785124467/benefit-3_jwlrgs.webp"
              />
              <div
                className="flex flex-col gap-8"
                style={{ minHeight: "120px", padding: "0px 12px" }}
              >
                <h3 className="text-xl font-semibold text-primary mb-0">
                  Danh mục sản phẩm
                </h3>
                <p
                  className="text-md text-secondary mb-0"
                  style={{ whiteSpace: "pre-line" }}
                >
                  Giúp khách hàng có thể mua sắn trực tiếp trong cuộc trò
                  chuyện
                </p>
              </div>
            </div>
            <div
              className="gap-16 flex flex-col w-full"
              style={{
                padding: "12px",
                border: "1px solid #DDE1E7",
                borderRadius: "12px",
              }}
            >
              <img
                alt="Phối hợp tự động và thủ công"
                className="w-full"
                src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1785124467/benefit-4_xquulu.webp"
              />
              <div
                className="flex flex-col gap-8"
                style={{ minHeight: "120px", padding: "0px 12px" }}
              >
                <h3 className="text-xl font-semibold text-primary mb-0">
                  Phối hợp tự động và thủ công
                </h3>
                <p
                  className="text-md text-secondary mb-0"
                  style={{ whiteSpace: "pre-line" }}
                >
                  Kết hợp sức mạnh của AI và con người một cách liền mạch
                </p>
              </div>
            </div>
            <div
              className="gap-16 flex flex-col w-full"
              style={{
                padding: "12px",
                border: "1px solid #DDE1E7",
                borderRadius: "12px",
              }}
            >
              <img
                alt="Kịch bản chăm sóc"
                className="w-full"
                src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1785124467/benefit-5_x1okoa.webp"
              />
              <div
                className="flex flex-col gap-8"
                style={{ minHeight: "120px", padding: "0px 12px" }}
              >
                <h3 className="text-xl font-semibold text-primary mb-0">
                  Kịch bản chăm sóc
                </h3>
                <p
                  className="text-md text-secondary mb-0"
                  style={{ whiteSpace: "pre-line" }}
                >
                  Gửi tin nhắn tự động theo kịch bản, sử dụng kèm các bộ lọc
                  và quy luật
                </p>
              </div>
            </div>
            <div
              className="gap-16 flex flex-col w-full"
              style={{
                padding: "12px",
                border: "1px solid #DDE1E7",
                borderRadius: "12px",
              }}
            >
              <img
                alt="Theo dõi chuyển đổi"
                className="w-full"
                src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1785124467/benefit-6_kvldtt.webp"
              />
              <div
                className="flex flex-col gap-8"
                style={{ minHeight: "120px", padding: "0px 12px" }}
              >
                <h3 className="text-xl font-semibold text-primary mb-0">
                  Theo dõi chuyển đổi
                </h3>
                <p
                  className="text-md text-secondary mb-0"
                  style={{ whiteSpace: "pre-line" }}
                >
                  Đo lường mọi bước với tính năng theo dõi sự kiện của Meta
                  API được tích hợp sẵn
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center py-40 md-py-30 saas-container md-gap-48 gap-24">
        <div
          className="flex flex-col md-gap-16 gap-24 justify-center items-center"
          style={{ maxWidth: "1536px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "6px 0",
            }}
          >
            <span
              className="text-color-primary"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                textAlign: "center",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Phản hồi từ khách hàng
            </span>
          </div>
          <h2 className="text-2xl md-text-3xl font-semibold mb-0 text-center w-full title-linear-gradient-2">
            Tối ưu vận hành và nâng cao chuyển đổi cho doanh nghiệp
          </h2>
          <p className="text-md md-text-xl mb-0 text-secondary">
            Lắng nghe chia sẻ từ các doanh nghiệp đã sử dụng Losa{" "}
          </p>
        </div>
        <div
          className="customer-feedback-container flex gap-12"
          style={{ maxWidth: "1536px" }}
        >
          <div className="customer-feedback-item flex flex-col gap-12 justify-between">
            <p className="text-md text-secondary mb-0">
              Losa đã giúp chúng tôi tự động hóa các cuộc trò chuyện ở quy
              mô lớn, và giờ đây chúng tôi sử dụng tin nhắn xuyên suốt toàn bộ
              phễu bán hàng
            </p>
            <div>
              <div
                style={{ borderTop: "1px dashed #EAECF0", margin: "16px 0" }}
              ></div>
              <div className="flex gap-24 items-center">
                <img
                  alt="Logo TH True Milk"
                  loading="lazy"
                  width="500"
                  height="500"
                  decoding="async"
                  data-nimg="1"
                  style={{
                    color: "transparent",
                    width: "54px",
                    height: "54px",
                    borderRadius: "999px",
                  }}
                  srcSet="https://botcake.io/_next/image?url=%2Fstatic%2Fimages%2FlogoTHTrueMilkCircle.png&amp;w=640&amp;q=75 1x, /_next/image?url=%2Fstatic%2Fimages%2FlogoTHTrueMilkCircle.png&amp;w=1080&amp;q=75 2x"
                  src="https://botcake.io/_next/image?url=%2Fstatic%2Fimages%2FlogoTHTrueMilkCircle.png&amp;w=1080&amp;q=75"
                />
                <div className="flex flex-col">
                  <span className="text-lg text-primary font-semibold">
                    Ecommerce Client
                  </span>
                  <div className="flex items-center gap-8">
                    <span className="text-md text-quaternary">
                      E-commerce
                    </span>
                    <div
                      style={{
                        borderRadius: "50%",
                        width: "4px",
                        height: "4px",
                        backgroundColor: "var(--accent)",
                      }}
                    ></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      className=""
                      viewBox="0 0 22 22"
                      fill="none"
                    >
                      <path
                        d="M11 0C4.80425 0 0 4.54013 0 10.6697C0 13.8761 1.3145 16.648 3.454 18.562C3.63275 18.7215 3.74275 18.947 3.74825 19.189L3.80875 21.1469C3.81316 21.291 3.85288 21.4318 3.92443 21.5569C3.99599 21.682 4.09718 21.7876 4.21911 21.8645C4.34105 21.9413 4.47999 21.987 4.62374 21.9976C4.76748 22.0082 4.91163 21.9833 5.0435 21.9251L7.227 20.9627C7.41125 20.8802 7.62025 20.8664 7.8155 20.9187C8.81925 21.1937 9.88625 21.3422 11 21.3422C17.1957 21.3422 22 16.802 22 10.6725C22 4.54288 17.1957 0 11 0Z"
                        fill="url(#paint0_radial_6606_4992)"
                      ></path>
                      <path
                        d="M4.3943 13.791L7.62555 8.66514C7.7471 8.47215 7.90735 8.30646 8.09617 8.17853C8.28499 8.0506 8.49828 7.9632 8.72259 7.92186C8.94689 7.88051 9.17733 7.88612 9.39935 7.93832C9.62138 7.99052 9.83017 8.08819 10.0125 8.22515L12.5838 10.1528C12.6986 10.2388 12.8382 10.285 12.9816 10.2845C13.125 10.284 13.2644 10.2368 13.3785 10.1501L16.849 7.51567C17.311 7.16368 17.916 7.71916 17.608 8.2114L14.374 13.3345C14.2525 13.5275 14.0922 13.6932 13.9034 13.8211C13.7146 13.9491 13.5013 14.0364 13.277 14.0778C13.0527 14.1191 12.8223 14.1135 12.6002 14.0613C12.3782 14.0091 12.1694 13.9115 11.987 13.7745L9.4158 11.8468C9.30101 11.7609 9.16135 11.7146 9.01796 11.7151C8.87457 11.7156 8.73524 11.7628 8.62105 11.8496L5.15055 14.484C4.68855 14.836 4.08355 14.2832 4.3943 13.791Z"
                        fill="white"
                      ></path>
                      <defs>
                        <radialGradient
                          id="paint0_radial_6606_4992"
                          cx="0"
                          cy="0"
                          r="1"
                          gradientUnits="userSpaceOnUse"
                          gradientTransform="translate(3.685 21.9994) scale(24.2 24.1993)"
                        >
                          <stop stopColor="#0099FF"></stop>
                          <stop offset="0.6" stopColor="#A033FF"></stop>
                          <stop offset="0.9" stopColor="#FF5280"></stop>
                          <stop offset="1" stopColor="#FF7061"></stop>
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="customer-feedback-item flex flex-col gap-12 justify-between">
            <p className="text-md text-secondary mb-0">
              “Giờ đây chúng tôi phản hồi nhanh hơn 70% nhờ vào chatbot AI của
              Losa”
            </p>
            <div>
              <div
                style={{ borderTop: "1px dashed #EAECF0", margin: "16px 0" }}
              ></div>
              <div className="flex gap-24 items-center">
                <img
                  alt="Le Hien feed back"
                  loading="lazy"
                  width="200"
                  height="200"
                  decoding="async"
                  data-nimg="1"
                  style={{
                    color: "transparent",
                    width: "54px",
                    height: "54px",
                    borderRadius: "999px",
                    border: "1px solid rgba(18, 18, 18, 0.17)",
                  }}
                  srcSet="https://botcake.io/_next/image?url=%2Fstatic%2Fimages%2Flanding%2Fsolutions%2FlogoKangJin.jpg&amp;w=256&amp;q=75 1x, /_next/image?url=%2Fstatic%2Fimages%2Flanding%2Fsolutions%2FlogoKangJin.jpg&amp;w=640&amp;q=75 2x"
                  src="https://botcake.io/_next/image?url=%2Fstatic%2Fimages%2Flanding%2Fsolutions%2FlogoKangJin.jpg&amp;w=640&amp;q=75"
                />
                <div className="flex flex-col">
                  <span className="text-lg text-primary font-semibold">
                    Spa &amp; Clinic
                  </span>
                  <div className="flex items-center gap-8">
                    <span className="text-md text-quaternary">Beauty</span>
                    <div
                      style={{
                        borderRadius: "50%",
                        width: "4px",
                        height: "4px",
                        backgroundColor: "var(--accent)",
                      }}
                    ></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      className=""
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M11.4508 5.77581C12.4797 6.51392 13.7402 6.94822 15.1015 6.94822V4.31924C14.8439 4.31929 14.5869 4.29233 14.3348 4.23874V6.30812C12.9736 6.30812 11.7133 5.87382 10.6841 5.13576V10.5007C10.6841 13.1846 8.5162 15.3601 5.84206 15.3601C4.84428 15.3601 3.91688 15.0574 3.14648 14.5382C4.02576 15.4404 5.25197 16.0001 6.60857 16.0001C9.28287 16.0001 11.4509 13.8246 11.4509 11.1407V5.77581H11.4508ZM12.3966 3.12349C11.8708 2.54698 11.5255 1.80195 11.4508 0.978279V0.640137H10.7243C10.9072 1.68702 11.5309 2.58141 12.3966 3.12349ZM4.83788 12.4787C4.54409 12.0921 4.38533 11.6192 4.38604 11.133C4.38604 9.90551 5.37765 8.91024 6.60102 8.91024C6.82901 8.91019 7.05564 8.94522 7.27292 9.01441V6.32668C7.019 6.29175 6.76273 6.27693 6.50657 6.28236V8.37437C6.28913 8.30518 6.0624 8.27004 5.83435 8.27026C4.61098 8.27026 3.61943 9.26541 3.61943 10.4931C3.61943 11.3611 4.11506 12.1126 4.83788 12.4787Z"
                        fill="#FF004F"
                      ></path>
                      <path
                        d="M10.6843 5.13571C11.7135 5.87377 12.9738 6.30806 14.335 6.30806V4.23868C13.5752 4.07625 12.9025 3.67776 12.3968 3.12349C11.531 2.58135 10.9073 1.68696 10.7245 0.640137H8.81606V11.1406C8.81174 12.3647 7.82183 13.3559 6.60108 13.3559C5.88171 13.3559 5.24263 13.0118 4.83788 12.4787C4.11513 12.1126 3.61949 11.361 3.61949 10.4931C3.61949 9.26557 4.61104 8.27031 5.83441 8.27031C6.0688 8.27031 6.29472 8.30694 6.50663 8.37442V6.28242C3.87947 6.33689 1.7666 8.49116 1.7666 11.1406C1.7666 12.4632 2.29276 13.6622 3.14671 14.5382C3.9171 15.0574 4.8445 15.3602 5.84228 15.3602C8.51647 15.3602 10.6844 13.1845 10.6844 10.5007V5.13571H10.6843Z"
                        fill="black"
                      ></path>
                      <path
                        d="M14.335 4.23853V3.67899C13.6498 3.68003 12.9781 3.48746 12.3968 3.12329C12.9114 3.68871 13.589 4.07858 14.335 4.23853ZM10.7245 0.639989C10.707 0.539941 10.6936 0.439234 10.6843 0.338143V0H8.04935V10.5005C8.04513 11.7245 7.05528 12.7157 5.83442 12.7157C5.476 12.7157 5.13759 12.6303 4.8379 12.4786C5.24264 13.0116 5.88173 13.3557 6.6011 13.3557C7.82173 13.3557 8.81181 12.3646 8.81607 11.1405V0.639989H10.7245ZM6.50676 6.28227V5.68659C6.28658 5.65639 6.06461 5.64124 5.84235 5.64135C3.16794 5.64129 1 7.81693 1 10.5005C1 12.183 1.85204 13.6658 3.14678 14.538C2.29283 13.662 1.76667 12.463 1.76667 11.1404C1.76667 8.49101 3.87949 6.33674 6.50676 6.28227Z"
                        fill="#00F2EA"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="flex items-center justify-center py-40 md-py-60 saas-container">
          <div style={{ width: "100%", maxWidth: "900px" }} className="flex flex-col items-center gap-16">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "6px 0" }}>
              <span className="text-color-primary" style={{ fontSize: "16px", lineHeight: "24px", textAlign: "center", fontWeight: "700", textTransform: "uppercase" }}>FAQ</span>
            </div>
            <h2 className="text-xl font-semibold text-primary text-center mb-0">Câu hỏi thường gặp</h2>
            <div className="flex flex-col gap-4 w-full">
              {faqs.map((f) => (
                <div key={f._id} className="faq-item flex flex-col gap-12 w-full ">
                  <div
                    className="text-lg md-text-xl font-semibold flex items-center justify-between w-full hover-text-underline text-left gap-16 text-primary fa-question"
                    onClick={() => setFaqOpen(faqOpen === f._id ? null : f._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {f.question}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      className="text-tertiary"
                      style={{
                        rotate: faqOpen === f._id ? "180deg" : "0deg",
                        transition: "rotate 0.2s linear",
                        flex: "none",
                      }}
                    >
                      <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z"></path>
                    </svg>
                  </div>
                  {faqOpen === f._id && (
                    <div className="faq-item-collapse text-secondary text-sm text-left" style={{ whiteSpace: "pre-line" }}>
                      <span className="text-secondary text-sm">{f.answer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  );
}
