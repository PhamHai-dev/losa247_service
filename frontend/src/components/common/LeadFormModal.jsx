import React, { useState } from 'react';
import { App, Form, Input, Button } from 'antd';
import { X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { leadsService } from '../../features/leads/leadsService';

export default function LeadFormModal() {
  const { isLeadModalVisible, closeLeadModal } = useUIStore();
  const [leadForm] = Form.useForm();
  const { message } = App.useApp();
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const handleLeadSubmit = async (values) => {
    setIsSubmittingLead(true);
    try {
      const description = `Lời nhắn: ${values.message || ''}`;
      
      await leadsService.createPublicLead({ 
        name: values.name,
        phone: values.phone,
        email: values.email,
        description: description,
        source: 'form' 
      });
      message.success('Đăng ký thành công! Chúng tôi sẽ liên hệ sớm nhất.');
      closeLeadModal();
      leadForm.resetFields();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (!isLeadModalVisible) return null;

  return (
    <div 
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(2px)' }}
      onClick={closeLeadModal}
    >
      <div 
        style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, padding: 24, position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>Đăng ký nhận tư vấn / trải nghiệm</h2>
          <X size={20} style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={closeLeadModal} />
        </div>
        
        <Form form={leadForm} layout="vertical" onFinish={handleLeadSubmit}>
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nhập họ và tên của bạn" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="email" label="Email (Không bắt buộc)" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
            <Input type="email" placeholder="Nhập email" />
          </Form.Item>
          <Form.Item name="message" label="Lời nhắn (Không bắt buộc)">
            <Input.TextArea rows={3} placeholder="Ví dụ: Tôi muốn tư vấn về giải pháp chatbot cho ngành thời trang..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={isSubmittingLead} block size="large">
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
