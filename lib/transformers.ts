// lib/transformers.ts

/**
 * 聚合处理：将 /playlist/detail 和 /playlist/track/all 的数据合并
 */
export function transformPlaylistCombined(detailData: any, tracksData: any) {
    // 基础校验
    if (detailData.code !== 200 || tracksData.code !== 200) {
        return { error: '获取数据失败', detailData, tracksData };
    }

    const playlist = detailData.playlist;

    return {
        id: playlist.id,
        name: playlist.name,
        coverImgUrl: playlist.coverImgUrl,
        creator: playlist.creator?.nickname || null,
        // 处理歌曲列表
        songs: tracksData.songs ? tracksData.songs.map((song: any) => ({
            name: song.name,
            id: song.id,
            ar: song.ar ? song.ar.map((a: any) => a.name) : [],
            album: song.al ? song.al.name : null,
            picUrl: song.al ? song.al.picUrl : null,
            duration: song.dt
        })) : [],
        code: 200
    };
}

/**
 * 独立处理：/album (保持不变)
 */
export function transformAlbum(data: any) {
    if (data.code !== 200 || !data.songs) return data;
    const albumCover = data.album?.picUrl;
    return {
        songs: data.songs.map((song: any) => ({
            name: song.name,
            id: song.id,
            ar: song.ar ? song.ar.map((a: any) => a.name) : [],
            album: song.al ? song.al.name : (data.album?.name || null),
            picUrl: albumCover || null,
            duration: song.dt
        })),
        code: 200
    };
}