// lib/transformers.ts
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
        trackCount: playlist.trackCount,
        code: 200
    };
}

export function transformAlbum(data: any) {
    if (data.code !== 200 || !data.songs) return data;
    const albumCover = data.album?.picUrl;
    return {
        id: data.album.id,
        name: data.album.name,
        picUrl: data.album.picUrl,
        size: data.album.size,
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