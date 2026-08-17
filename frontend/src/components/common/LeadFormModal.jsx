import { useState } from 'react';
import { Alert, App, Button, Checkbox, Form, Input, InputNumber, Select, Skeleton } from 'antd';
import { Mail, MessageSquare, Phone, User, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { leadsService } from '../../features/leads/leadsService';
import { settingsService } from '../../features/settings/settingsService';
import { useApiQuery } from '../../hooks/useApiQuery';

export function DynamicLeadFields({ config, prefix = 'lead' }) {
  return (config?.fields || []).filter((field) => field.enabled).map((field) => {
    const rules = [{ required: field.required, message: `Vui lòng nhập ${field.label}` }];
    if (field.type === 'email') rules.push({ type: 'email', message: `${field.label} không hợp lệ` });
    let control = <Input id={`${prefix}-${field.key}`} placeholder={field.placeholder} type={field.type === 'phone' ? 'tel' : 'text'} />;
    if (field.type === 'textarea') control = <Input.TextArea id={`${prefix}-${field.key}`} rows={3} placeholder={field.placeholder} />;
    if (field.type === 'number') control = <InputNumber id={`${prefix}-${field.key}`} style={{ width: '100%' }} placeholder={field.placeholder} />;
    if (field.type === 'select') control = <Select id={`${prefix}-${field.key}`} placeholder={field.placeholder} options={(field.options || []).map((value) => ({ value, label: value }))} />;
    if (field.type === 'checkbox') return <Form.Item key={field.id} name={field.key} valuePropName="checked" rules={rules}><Checkbox id={`${prefix}-${field.key}`}>{field.label}</Checkbox></Form.Item>;
    return <Form.Item key={field.id} name={field.key} label={field.label} rules={rules}>{control}</Form.Item>;
  });
}

const footerIcons = { name: User, phone: Phone, email: Mail };
export function FooterDynamicLeadFields({ config, prefix = 'footer-lead' }) {
  const fields = (config?.fields || []).filter((field) => field.enabled && field.type !== 'textarea');
  return <div className="footer-form-grid">{fields.map((field) => {
    const rules = [{ required: field.required, message: `Vui lòng nhập ${field.label}` }];
    if (field.type === 'email') rules.push({ type: 'email', message: `${field.label} không hợp lệ` });
    const Icon = footerIcons[field.key] || (field.type === 'phone' ? Phone : field.type === 'email' ? Mail : field.type === 'textarea' ? MessageSquare : User);
    const wide = ['textarea', 'select', 'checkbox'].includes(field.type);
    if (field.type === 'checkbox') return <Form.Item className="footer-field footer-field--wide footer-field--check" key={field.id} name={field.key} valuePropName="checked" rules={rules}><Checkbox id={`${prefix}-${field.key}`}>{field.label}{field.required && <span> *</span>}</Checkbox></Form.Item>;
    let control = <Input id={`${prefix}-${field.key}`} type={field.type === 'phone' ? 'tel' : 'text'} placeholder={field.placeholder} prefix={<Icon size={17} />} />;
    if (field.type === 'textarea') control = <Input.TextArea id={`${prefix}-${field.key}`} rows={3} placeholder={field.placeholder} />;
    if (field.type === 'number') control = <InputNumber id={`${prefix}-${field.key}`} placeholder={field.placeholder} prefix={<Icon size={17} />} />;
    if (field.type === 'select') control = <Select id={`${prefix}-${field.key}`} placeholder={field.placeholder} options={(field.options || []).map((value) => ({ value, label: value }))} />;
    return <Form.Item className={`footer-field${wide ? ' footer-field--wide' : ''}`} key={field.id} name={field.key} label={field.label} rules={rules}>{control}</Form.Item>;
  })}</div>;
}

export default function LeadFormModal() {
  const { isLeadModalVisible, closeLeadModal } = useUIStore();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const configQuery = useApiQuery(() => settingsService.getPublicLeadForm(), [], { enabled: isLeadModalVisible });
  const submit = async (values) => {
    setSubmitting(true);
    try {
      await leadsService.createPublicLead({ formVersion: configQuery.data?.version, values });
      message.success('Đăng ký thành công! Chúng tôi sẽ liên hệ sớm nhất.');
      closeLeadModal(); form.resetFields();
    } catch (error) { message.error(error?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại!'); }
    finally { setSubmitting(false); }
  };
  if (!isLeadModalVisible) return null;
  return <div className="lead-form-overlay" role="presentation" onClick={closeLeadModal}>
    <section className="lead-form-modal" role="dialog" aria-modal="true" aria-labelledby="lead-form-title" onClick={(event) => event.stopPropagation()}>
      <header className="lead-form-modal__header"><div><small>LOSA247</small><h2 id="lead-form-title">{configQuery.data?.title || 'Đăng ký tư vấn'}</h2><p>Để lại thông tin, đội ngũ Losa sẽ liên hệ hỗ trợ bạn sớm nhất.</p></div><Button id="lead-modal-close" className="lead-form-modal__close" type="text" icon={<X size={20} />} onClick={closeLeadModal} aria-label="Đóng form" /></header>
      <div className="lead-form-modal__body">{configQuery.loading ? <Skeleton active /> : configQuery.error ? <Alert type="error" showIcon message={configQuery.error} /> : <Form form={form} layout="vertical" onFinish={submit}><DynamicLeadFields config={configQuery.data} prefix="modal-lead" /><Button id="lead-modal-submit" htmlType="submit" type="primary" size="large" block loading={submitting}>{configQuery.data?.submitLabel || 'Gửi yêu cầu'}</Button></Form>}</div>
    </section>
  </div>;
}
