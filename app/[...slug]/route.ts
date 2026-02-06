import { NextRequest } from 'next/server';
import { transformPlaylistCombined, transformAlbum } from '@/lib/transformers';

const ALLOWED_PATHS = [
    'playlist', // 修改后的新接口
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
        // --- 特殊处理：playlist 聚合接口 ---
        if (fullPath === 'playlist') {
            if (!id) return new Response('Missing id', { status: 400 });

            // 并行发起两个请求
            const [detailRes, tracksRes] = await Promise.all([
                fetch(`${baseUrl}/playlist/detail?id=${id}`, fetchOptions),
                fetch(`${baseUrl}/playlist/track/all?id=${id}`, fetchOptions)
            ]);

            const detailData = await detailRes.json();
            const tracksData = await tracksRes.json();

            const combinedData = transformPlaylistCombined(detailData, tracksData);

            return new Response(JSON.stringify(combinedData, null, 2), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // --- 普通处理：其他接口 ---
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