export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'MacBook Pro 14 M3 Pro (18GB / 512GB SSD)',
    slug: 'macbook-pro-14-m3-pro',
    category: 'laptop',
    brand: 'Apple',
    price: 49990000,
    originalPrice: 54990000,
    discountPercent: 9,
    rating: 4.9,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 15,
    tag: 'Bán chạy',
    badgeType: 'hot',
    description: 'MacBook Pro 14 inch trang bị chip M3 Pro cực mạnh, thời lượng pin lên đến 18 giờ, màn hình Liquid Retina XDR 120Hz siêu sắc nét.',
    specs: {
      'Vi xử lý': 'Apple M3 Pro (11-core CPU, 14-core GPU)',
      'RAM': '18GB Unified Memory',
      'Bộ nhớ trong': '512GB SSD siêu tốc',
      'Màn hình': '14.2 inch Liquid Retina XDR (3024 x 1964), 120Hz ProMotion',
      'Trọng lượng': '1.61 kg'
    }
  },
  {
    id: 2,
    name: 'iPhone 16 Pro Max 256GB Titan Tự Nhiên',
    slug: 'iphone-16-pro-max-256gb',
    category: 'dien-thoai',
    brand: 'Apple',
    price: 34490000,
    originalPrice: 36990000,
    discountPercent: 7,
    rating: 5.0,
    reviewCount: 328,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 28,
    tag: 'Hot 2026',
    badgeType: 'hot',
    description: 'Khung Titan cao cấp siêu bền, nút Camera Control thế hệ mới, chip A18 Pro hỗ trợ Apple Intelligence đỉnh cao.',
    specs: {
      'Màn hình': '6.9 inch Super Retina XDR OLED, 120Hz ProMotion',
      'Chipset': 'Apple A18 Pro (3nm)',
      'Camera': 'Chính 48MP + Góc siêu rộng 48MP + Tele 5x 12MP',
      'Pin': 'Dung lượng lớn, sạc nhanh 25W MagSafe',
      'Hệ điều hành': 'iOS 18'
    }
  },
  {
    id: 3,
    name: 'Tai nghe Sony WH-1000XM5 Chống ồn đỉnh cao',
    slug: 'sony-wh-1000xm5',
    category: 'am-thanh',
    brand: 'Sony',
    price: 6790000,
    originalPrice: 8490000,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 95,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 40,
    tag: 'Giảm 20%',
    badgeType: 'sale',
    description: 'Bộ vi xử lý tích hợp V1 cùng công nghệ chống ồn kép tự động điều chỉnh theo môi trường, chất âm Hi-Res sắc nét.',
    specs: {
      'Thời lượng pin': 'Lên tới 30 giờ (bật ANC)',
      'Kết nối': 'Bluetooth 5.2, jack 3.5mm',
      'Trọng lượng': '250g',
      'Tính năng': 'Speak-to-Chat, chống ồn chủ động ANC AI'
    }
  },
  {
    id: 4,
    name: 'Samsung Galaxy S24 Ultra 5G (12GB / 256GB)',
    slug: 'samsung-galaxy-s24-ultra',
    category: 'dien-thoai',
    brand: 'Samsung',
    price: 27990000,
    originalPrice: 33990000,
    discountPercent: 18,
    rating: 4.85,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 19,
    tag: 'Galaxy AI',
    badgeType: 'sale',
    description: 'Quyền năng Galaxy AI tiên phong, bút S-Pen tích hợp, khung viền Titan và camera zoom quang học 100x Space Zoom.',
    specs: {
      'Màn hình': '6.8 inch Dynamic AMOLED 2X, QHD+, 120Hz',
      'Chipset': 'Snapdragon 8 Gen 3 for Galaxy',
      'Camera': '200MP + 50MP + 12MP + 10MP',
      'Pin': '5000 mAh, sạc nhanh 45W'
    }
  },
  {
    id: 5,
    name: 'Laptop Gaming ASUS ROG Zephyrus G16 (RTX 4070)',
    slug: 'asus-rog-zephyrus-g16',
    category: 'laptop',
    brand: 'ASUS',
    price: 52990000,
    originalPrice: 58990000,
    discountPercent: 10,
    rating: 4.95,
    reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 8,
    tag: 'Gaming Pro',
    badgeType: 'hot',
    description: 'Thiết kế nhôm nguyên khối siêu mỏng 1.49cm, màn hình ROG Nebula OLED 2.5K 240Hz, card đồ họa NVIDIA RTX 4070 mạnh mẽ.',
    specs: {
      'Vi xử lý': 'Intel Core Ultra 9 185H',
      'Card màn hình': 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      'RAM': '32GB LPDDR5X 7467MHz',
      'Ổ cứng': '1TB SSD PCIe 4.0 NVMe',
      'Màn hình': '16 inch OLED 2.5K 240Hz 0.2ms'
    }
  },
  {
    id: 6,
    name: 'Apple Watch Ultra 2 GPS + Cellular 49mm',
    slug: 'apple-watch-ultra-2',
    category: 'smartwatch',
    brand: 'Apple',
    price: 20490000,
    originalPrice: 22990000,
    discountPercent: 11,
    rating: 4.9,
    reviewCount: 115,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 12,
    tag: 'Đẳng cấp',
    badgeType: 'new',
    description: 'Vỏ Titan cấp hàng không, màn hình sáng nhất lịch sử Apple Watch (3000 nits), chip S9 SiP và cử chỉ chạm hai lần thông minh.',
    specs: {
      'Kích thước vỏ': '49mm Titanium',
      'Độ sáng màn hình': 'Tối đa 3000 nits',
      'Chống nước': 'WR100 (Độ sâu 100m)',
      'Pin': 'Lên tới 72 giờ ở chế độ tiết kiệm'
    }
  },
  {
    id: 7,
    name: 'Màn hình Dell UltraSharp 27 4K U2723QE IPS Black',
    slug: 'dell-ultrasharp-27-u2723qe',
    category: 'man-hinh-linh-kien',
    brand: 'Dell',
    price: 13890000,
    originalPrice: 15490000,
    discountPercent: 10,
    rating: 4.88,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 16,
    tag: 'Đồ họa 4K',
    badgeType: 'hot',
    description: 'Công nghệ tấm nền IPS Black đột phá độ tương phản 2000:1, chuẩn màu 98% DCI-P3, cổng USB-C cấp nguồn 90W tiện lợi.',
    specs: {
      'Kích thước': '27 inch 16:9',
      'Độ phân giải': '4K UHD (3840 x 2160) 60Hz',
      'Tấm nền': 'IPS Black chống chói',
      'Cổng giao tiếp': 'USB-C (PD 90W), DisplayPort 1.4, HDMI 2.0, RJ45 LAN'
    }
  },
  {
    id: 8,
    name: 'Loa Marshall Stanmore III Bluetooth Huyền thoại',
    slug: 'loa-marshall-stanmore-iii',
    category: 'am-thanh',
    brand: 'Marshall',
    price: 9490000,
    originalPrice: 10990000,
    discountPercent: 14,
    rating: 4.92,
    reviewCount: 64,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 22,
    tag: 'Classic',
    badgeType: 'sale',
    description: 'Âm trường rộng hơn bao giờ hết, thiết kế phong cách vintage kinh điển đặc trưng Marshall cùng kết nối Bluetooth 5.2 thế hệ mới.',
    specs: {
      'Công suất tổng': '80W (Class D)',
      'Dải tần đáp ứng': '45 - 20,000 Hz',
      'Kết nối': 'Bluetooth 5.2, AUX 3.5mm, RCA',
      'Trọng lượng': '4.25 kg'
    }
  },
  {
    id: 9,
    name: 'Củ sạc nhanh Anker Prime 100W GaN 3 cổng (2C1A)',
    slug: 'anker-prime-100w-gan',
    category: 'phu-kien',
    brand: 'Anker',
    price: 1390000,
    originalPrice: 1790000,
    discountPercent: 22,
    rating: 4.8,
    reviewCount: 150,
    image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 45,
    tag: 'Giảm 22%',
    badgeType: 'sale',
    description: 'Công nghệ GaNPrime tân tiến, kích thước nhỏ gọn hơn 43%, sạc đồng thời 3 thiết bị MacBook, iPhone, Apple Watch với hiệu suất tối ưu.',
    specs: {
      'Tổng công suất': '100W Max',
      'Số cổng': '2 x USB-C, 1 x USB-A',
      'Công nghệ': 'PowerIQ 4.0, ActiveShield 2.0 kiểm soát nhiệt độ',
      'Kích thước': '60 x 44 x 39 mm'
    }
  },
  {
    id: 10,
    name: 'Bàn phím cơ không dây Keychron Q1 Pro QMK/VIA',
    slug: 'keychron-q1-pro-wireless',
    category: 'man-hinh-linh-kien',
    brand: 'Keychron',
    price: 4350000,
    originalPrice: 4850000,
    discountPercent: 10,
    rating: 4.93,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 14,
    tag: 'Custom Mech',
    badgeType: 'new',
    description: 'Vỏ nhôm CNC nguyên khối, kết nối Bluetooth 5.1 & Type-C, núm xoay đa năng, mạch xuôi Hotswap hỗ trợ Mac & Windows.',
    specs: {
      'Layout': '75% nhỏ gọn',
      'Switch': 'Keychron K Pro Red / Brown / Banana',
      'Kết nối': 'Bluetooth 5.1 / Dây Type-C',
      'Dung lượng pin': '4000 mAh'
    }
  },
  {
    id: 11,
    name: 'Pin dự phòng Shargeek Storm 2 100W Trong Suốt 25600mAh',
    slug: 'shargeek-storm-2-100w',
    category: 'phu-kien',
    brand: 'Shargeek',
    price: 3890000,
    originalPrice: 4500000,
    discountPercent: 14,
    rating: 4.96,
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1609592807664-44b20a595963?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1609592807664-44b20a595963?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 9,
    tag: 'Cyberpunk',
    badgeType: 'hot',
    description: 'Thiết kế vỏ trong suốt phong cách tương lai, màn hình màu IPS hiển thị dòng điện thực tế, công suất sạc ra vào lên đến 100W.',
    specs: {
      'Dung lượng': '25,600mAh / 93.5Wh',
      'Màn hình': 'IPS 1.14 inch hiển thị thông số điện áp',
      'Cổng': '2x Type-C, 1x USB-A, 1x Cổng DC điều chỉnh vôn',
      'Công suất tối đa': '100W Max'
    }
  },
  {
    id: 12,
    name: 'Đồng hồ thể thao Garmin Fenix 7 Pro Sapphire Solar',
    slug: 'garmin-fenix-7-pro-sapphire-solar',
    category: 'smartwatch',
    brand: 'Garmin',
    price: 21990000,
    originalPrice: 24490000,
    discountPercent: 10,
    rating: 4.95,
    reviewCount: 68,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 7,
    tag: 'Solar Tech',
    badgeType: 'new',
    description: 'Thấu kính sạc năng lượng mặt trời Power Sapphire, đèn pin LED tích hợp, bản đồ địa hình màu và cảm biến nhịp tim Gen 5.',
    specs: {
      'Kích thước': '47mm Titanium DLC',
      'Mặt kính': 'Sapphire Solar chống trầy',
      'Thời lượng pin': 'Lên đến 22 ngày ở chế độ Smartwatch',
      'Kháng nước': '10 ATM (100 mét)'
    }
  }
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
