const fs = require('fs');
const filePath = 'e:\\\\web_full\\\\losa_web\\\\losa_web\\\\frontend\\\\src\\\\pages\\\\client\\\\ClientPages.jsx';

const blogDetail = `
export function BlogDetailPage() {
  const { id } = useParams()
  const query = useApiQuery(() => publicBlogsService.getBySlug(id), [id])
  const blog = query.data

  const relatedQuery = useApiQuery(() => id && blog && blog._id ? publicBlogsService.getRelated(id) : Promise.resolve([]), [id, blog?._id])
  const relatedBlogs = relatedQuery.data || []

  useEffect(() => {
    if (!id) return;
    const key = 'viewed_blog_' + id;
    if (!sessionStorage.getItem(key)) {
      publicBlogsService.recordView(id).catch(() => {})
      sessionStorage.setItem(key, '1')
    }
  }, [id])

  return (
    <main className="section"><div className="container" style={{ maxWidth: 800 }}>
      <Spin spinning={query.loading}>
        {!blog && !query.loading ? <Empty description="Không tìm thấy bài viết" /> : blog && (
          <div style={{ padding: '40px 0' }}>
            {blog.category && <span style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 14 }}>{blog.category.name}</span>}
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', margin: '16px 0', lineHeight: 1.3 }}>{blog.title}</h1>
            <div className="blog-meta" style={{ marginBottom: 32 }}>
              <span><CalendarOutlined /> {formatDate(blog.publishedAt)}</span>
              <span><EyeOutlined /> {blog.views || 0} lượt xem</span>
            </div>
            {blog.coverImageUrl && (
              <img src={blog.coverImageUrl} alt={blog.title} style={{ width: '100%', borderRadius: 24, marginBottom: 40 }} />
            )}
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
            
            {blog.tags && blog.tags.length > 0 && (
              <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {blog.tags.map(t => t && t._id ? (
                    <Tag key={t._id} color="geekblue" style={{ padding: '6px 16px', fontSize: 14, borderRadius: 100, border: '1px solid #adc6ff', background: '#f0f5ff', fontWeight: 500 }}>
                      {t.name}
                    </Tag>
                  ) : null)}
                </div>
              </div>
            )}

            {relatedBlogs.length > 0 && (
              <div style={{ marginTop: 60 }}>
                <h3 style={{ marginBottom: 24, fontSize: 24 }}>Bài viết liên quan</h3>
                <div className="main-blog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {relatedBlogs.map(b => (
                    <Link to={\`/blog/\${b.slug}\`} key={b._id} className="blog-card">
                      <img src={b.coverImageUrl || '/placeholder.jpg'} alt={b.title} className="blog-card-img" />
                      <div className="blog-card-body">
                        {b.category && <span className="card-cat">{b.category.name}</span>}
                        <h3>{b.title}</h3>
                        <div className="blog-meta">
                          <span>{formatDate(b.publishedAt)}</span>
                          <span>•</span>
                          <span><EyeOutlined /> {b.views || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Spin>
    </div></main>
  )
}
`;
fs.appendFileSync(filePath, blogDetail, 'utf8');
console.log('Appended BlogDetailPage');
