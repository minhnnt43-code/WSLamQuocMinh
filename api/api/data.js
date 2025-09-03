// api/data.js
import { kv } from '@vercel/kv';

const DATA_KEY = 'minhWebsiteData_VercelBlob_Final';

export default async function handler(request, response) {
    try {
        if (request.method === 'GET') {
            let data = await kv.get(DATA_KEY);
            // Khởi tạo dữ liệu trống nếu chưa có
            if (!data) {
                data = {
                    achievements: [],
                    messages: [
                        {id: Date.now() + 1, name: 'Người bạn giấu tên', text: 'Chúc Minh luôn thành công nhé!'}
                    ]
                };
                await kv.set(DATA_KEY, data);
            }
            return response.status(200).json(data);
        }

        if (request.method === 'POST') {
            const newData = request.body;
            if (!newData || !Array.isArray(newData.achievements) || !Array.isArray(newData.messages)) {
                 return response.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
            }
            await kv.set(DATA_KEY, newData);
            return response.status(200).json({ message: 'Lưu dữ liệu thành công' });
        }
        
        return response.status(405).json({ error: 'Phương thức không được phép.' });

    } catch (error) {
        console.error('API Error:', error);
        return response.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
}
