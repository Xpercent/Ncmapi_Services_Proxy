import { NextRequest } from 'next/server';
import { transformPlaylistOnly, transformAlbum } from '@/lib/transformers';

const ALLOWED_PATHS = [
    'playlist',
    'search',
    'album'
];

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await context.params;
    const fullPath = slug.join('/');

    if (!ALLOWED_PATHS.includes(fullPath)) {
        return new Response(JSON.stringify({ error: 'Access Denied' }, null, 2), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const baseUrl = process.env.TARGET_API_URL;
    const fetchOptions = {
        headers: {
            'key': process.env.INTERNAL_KEY || '',
            'Content-Type': 'application/json',
        }
    };

    try {
        // --- 1. 处理 /playlist 路径 ---
        if (fullPath === 'playlist') {
            if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

            // 仅请求 detail 接口
            const response = await fetch(`${baseUrl}/playlist/detail?id=${id}`, fetchOptions);
            let data = await response.json();
            
            // 转换数据
            data = transformPlaylistOnly(data);

            return new Response(JSON.stringify(data, null, 2), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // --- 2. 处理其他路径 ---
        const finalUrl = `${baseUrl}/${fullPath}?${searchParams.toString()}`;
        const response = await fetch(finalUrl, fetchOptions);
        let data = await response.json();

        if (fullPath === 'album') {
            data = transformAlbum(data);
        }

        return new Response(JSON.stringify(data, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Proxy Error', message: error.message }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}