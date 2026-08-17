// Ant Design theme tokens — đồng bộ với CSS Variables trong index.css
//
// Green scale (Primary):  900 → 700 → 600(default) → 500(hover) → 100(bg)
// Blue scale (Secondary): 800 → 600(default) → 500(hover) → 100(bg)

export const antdTheme = {
  token: {
    // === Primary / CTA: Sky Blue, đồng bộ .btn-primary trong global.css ===
    colorPrimary: '#0284C7',          // --blue-600 default
    colorPrimaryHover: '#0EA5E9',     // --blue-500 hover
    colorPrimaryActive: '#075985',    // --blue-800 active/pressed
    colorPrimaryBg: '#E0F2FE',        // --blue-100 nền nhạt

    // === Secondary / Info: dùng chung Sky Blue scale ===
    colorInfo: '#0284C7',             // --blue-600 default
    colorInfoHover: '#0EA5E9',        // --blue-500 hover
    colorInfoActive: '#075985',       // --blue-800 active/pressed
    colorInfoBg: '#E0F2FE',           // --blue-100 nền nhạt

    // === Semantic status ===
    colorSuccess: '#16A34A',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',

    // === Layout ===
    colorBgLayout: '#F6F8FC',         // --bg
    colorBgContainer: '#FFFFFF',      // --card
    colorBorder: '#E6EBF2',           // --line
    colorText: '#102033',             // --text
    colorTextSecondary: '#6B7890',    // --muted

    // === Typography & Shape ===
    borderRadius: 10,
    fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
      fontWeight: 600,
      // Hover nhạt hơn, không đổi sang màu khác
      primaryColor: '#FFFFFF',
    },
    Table: {
      headerBg: '#F8FAFC',
    },
    Menu: {
      itemSelectedBg: '#DCFCE7',       // green-100 (xanh lá nhạt)
      itemSelectedColor: '#15803D',    // green-700
      itemHoverBg: '#F0FDF4',          // nhạt hơn green-100
      itemHoverColor: '#22C55E',       // green-500 hover
    },
    Tabs: {
      inkBarColor: '#16A34A',
      itemSelectedColor: '#16A34A',
      itemHoverColor: '#22C55E',
    },
  },
}
