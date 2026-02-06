import { NextRequest, NextResponse } from 'next/server';
import { transformPlaylistTracks } from '@/lib/transformers';

const ALLOWED_PATHS = [
    'playlist/track/all',
    'search',
    'album'
];

// 注意：context 的类型现在要求 params 是一个 Promise
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string[] }> }
) {
    // 1. 必须使用 await 获取 params
    const { slug } = await context.params;
    const fullPath = slug.join('/');

    // 2. 白名单精确校验
    if (!ALLOWED_PATHS.includes(fullPath)) {
        return NextResponse.json({ error: 'Access Denied: 路径未授权' }, { status: 403 });
    }

    // 3. 构建目标 URL
    const { searchParams } = new URL(request.url);
    const baseUrl = process.env.TARGET_API_URL;
    const finalUrl = `${baseUrl}/${fullPath}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'key': process.env.INTERNAL_KEY || '',
                'Content-Type': 'application/json',
            },
        });

        let data = await response.json();

        // 4. 数据处理
        if (fullPath === 'playlist/track/all') {
            data = transformPlaylistTracks(data);
        }
        return new Response(JSON.stringify(data, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Proxy Error: ' + error.message }, { status: 500 });
    }
}

// 如果你有 POST，也要改
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await context.params;
    const fullPath = slug.join('/');

    if (!ALLOWED_PATHS.includes(fullPath)) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    // ... 其余 POST 逻辑相同，记得使用 await context.params
}