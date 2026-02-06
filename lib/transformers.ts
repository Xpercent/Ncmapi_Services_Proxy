// lib/transformers.ts

/**
 * 独立处理：/playlist/track/all
 */
export function transformPlaylistTracks(data: any) {
    if (data.code !== 200 || !data.songs) return data;

    const filteredSongs = data.songs.map((song: any) => ({
        name: song.name,
        id: song.id,
        // 歌手：[{name: 'x'}] -> ['x']
        ar: song.ar ? song.ar.map((a: any) => a.name) : [],
        // 专辑：嵌套扁平化
        album: song.al ? song.al.name : null,
        picUrl: song.al ? song.al.picUrl : null,
        duration: song.dt
    }));

    return {
        songs: filteredSongs,
        code: 200
    };
}

/**
 * 独立处理：/album
 */
export function transformAlbum(data: any) {
    if (data.code !== 200 || !data.songs) return data;

    // 从外层 album 对象获取统一的封面图
    const albumCover = data.album?.picUrl;

    const filteredSongs = data.songs.map((song: any) => ({
        name: song.name,
        id: song.id,
        // 歌手：[{name: 'x'}] -> ['x']
        ar: song.ar ? song.ar.map((a: any) => a.name) : [],
        // 专辑：直接使用歌曲内的专辑名或外层专辑名
        album: song.al ? song.al.name : null,
        // 封面：由于歌曲内通常没带 picUrl，直接使用外层 album 的 picUrl
        picUrl: albumCover || null,
        duration: song.dt
    }));

    return {
        songs: filteredSongs,
        code: 200
    };
}