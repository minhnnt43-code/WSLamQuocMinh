// api/upload.js
import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
  // Tăng giới hạn kích thước request body lên 10MB (hoặc hơn nếu cần)
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function POST(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // `request.body` là một ReadableStream chứa dữ liệu file
  const blob = await put(filename, request.body, {
    access: 'public',
  });

  // Trả về blob (bao gồm cả url)
  return new Response(JSON.stringify(blob), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
