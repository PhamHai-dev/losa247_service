const mongoose = require('mongoose');

async function seed() {
    await mongoose.connect('mongodb+srv://losa247_admin:losa247@cluster0.wmmqfae.mongodb.net/losa247?appName=Cluster0');
    const PricingComparison = require('./models/PricingComparison.model');
    
    // Clear existing
    await PricingComparison.deleteMany({});
    
    const comparisons = [
        {
            title: "Thời hạn sử dụng",
            values: {
                "6a608c7b7a0ffba63f7ec919": ["10 Ngày"],
                "6a608c7b7a0ffba63f7ec91a": ["1 Tháng", "3 Tháng", "6 Tháng", "1 Năm"],
                "6a608c7b7a0ffba63f7ec91b": ["1 Năm"]
            },
            order: 1
        },
        {
            title: "Số trang kết nối",
            values: {
                "6a608c7b7a0ffba63f7ec919": ["1 Landing page"],
                "6a608c7b7a0ffba63f7ec91a": ["5 Landing page"],
                "6a608c7b7a0ffba63f7ec91b": ["Không giới hạn"]
            },
            order: 2
        },
        {
            title: "Ký tự AI / tháng",
            values: {
                "6a608c7b7a0ffba63f7ec919": ["5.000 ký tự"],
                "6a608c7b7a0ffba63f7ec91a": ["50.000 ký tự"],
                "6a608c7b7a0ffba63f7ec91b": ["Không giới hạn"]
            },
            order: 3
        },
        {
            title: "Ảnh AI / tháng",
            values: {
                "6a608c7b7a0ffba63f7ec919": ["10 Ảnh"],
                "6a608c7b7a0ffba63f7ec91a": ["50 Ảnh"],
                "6a608c7b7a0ffba63f7ec91b": ["Không giới hạn"]
            },
            order: 4
        },
        {
            title: "Kịch bản chatbot",
            values: {
                "6a608c7b7a0ffba63f7ec919": ["true"],
                "6a608c7b7a0ffba63f7ec91a": ["true"],
                "6a608c7b7a0ffba63f7ec91b": ["true"]
            },
            order: 5
        },
        {
            title: "Fanpage Facebook & Instagram",
            values: {
                "6a608c7b7a0ffba63f7ec919": ["true"],
                "6a608c7b7a0ffba63f7ec91a": ["true"],
                "6a608c7b7a0ffba63f7ec91b": ["true"]
            },
            order: 6
        },
        {
            title: "Zalo OA",
            values: {
                "6a608c7b7a0ffba63f7ec919": ["false"],
                "6a608c7b7a0ffba63f7ec91a": ["true"],
                "6a608c7b7a0ffba63f7ec91b": ["true"]
            },
            order: 7
        }
    ];

    await PricingComparison.insertMany(comparisons);
    console.log('Seeded successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
