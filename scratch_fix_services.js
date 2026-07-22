const fs = require('fs');
let c = fs.readFileSync('e:/web_full/losa_web/losa_web/frontend/src/pages/client/ClientPages.jsx', 'utf8');

c = c.replace(/}\s*return \(\s*<main className="section"><div className="container">\s*<h1>Dịch vụ AI Sales Agent<\/h1>\s*<Spin spinning=\{query\.loading\}>\s*\{\!services\.length && \!query\.loading \? <Empty description="Chưa có dịch vụ" \/> : \(\s*<div className="grid pricing">\s*\{services\.map/g, `}

// ---- Services -------------------------------------------------------------
export function ServicesPage() {
  const query = useApiQuery(() => publicServicesService.getList({ limit: 50 }), [])
  const services = query.data?.items || []
  return (
    <main className="section"><div className="container">
      <h1>Dịch vụ AI Sales Agent</h1>
      <Spin spinning={query.loading}>
        {!services.length && !query.loading ? <Empty description="Chưa có dịch vụ" /> : (
          <div className="grid pricing">
            {services.map`);

fs.writeFileSync('e:/web_full/losa_web/losa_web/frontend/src/pages/client/ClientPages.jsx', c);
console.log('Fixed ServicesPage!');
