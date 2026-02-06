// lib/transformers.ts

/**
 * 只处理 /playlist/detail 的数据
 * 提取歌单信息并将内部 tracks 扁平化
 */
export function transformPlaylistOnly(data: any) {
    if (data.code !== 200 || !data.playlist) return data;

    const playlist = data.playlist;

    return {
        id: playlist.id,
        name: playlist.name,
        coverImgUrl: playlist.coverImgUrl,
        creator: playlist.creator?.nickname || null,
        // 处理内部的 tracks 数组
        songs: playlist.tracks ? playlist.tracks.map((song: any) => ({
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
 * 之前的聚合转换函数（暂时不用，保留备用）
 */
/*
export function transformPlaylistCombined(detailData: any, tracksData: any) {
    if (detailData.code !== 200 || tracksData.code !== 200) return { error: '聚合失败' };
    const playlist = detailData.playlist;
    return {
        id: playlist.id,
        name: playlist.name,
        coverImgUrl: playlist.coverImgUrl,
        creator: playlist.creator?.nickname || null,
        songs: tracksData.songs ? tracksData.songs.map((song: any) => ({
            name: song.name,
            id: song.id,
            ar: song.ar ? song.ar.map((a: any) => a.name) : [],
            album: song.al ? song.al.name : null,
            picUrl: song.al ? song.al.picUrl : null,
            dt: song.dt
        })) : [],
        code: 200
    };
}
*/

/**
 * 独立处理：/album
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