/***** * Öze * Özellikler:
 *  - window.spotify.onNow() → now & volume güncellenir.
 *  - AudioFeatures devre dışı bırakıldı (Spotify API değişiklikleri nedeniyle).
 *  - Sanatçı ID'siyle window.spotify.getArtist() → genre bilgisi alınır.
 *  - window.spotify.getQueue() ile sıradaki şarkılar çekilir.
 *  - Context türü 'playlist' ise window.spotify.getPlaylist() detayları alınır.
 *  - Hata durumlarında ilgili state'ler null veya [] olur.:
 *  - window.spotify.onNow() → now & volume güncellenir.
 *  - AudioFeatures devre dışı bırakıldı (Spotify API değişiklikleri nedeniyle).
 *  - Sanatçı ID'siyle window.spotify.getArtist() → genre bilgisi alınır.
 *  - window.spotify.getQueue() ile sıradaki şarkılar çekilir.
 *  - Context türü 'playlist' ise window.spotify.getPlaylist() detayları alınır.
 *  - Hata durumlarında ilgili state'ler null veya [] olur.******************************************************************************
 * src/hooks/useOverlaySpotifyData.js
 *
 * Spotify IPC API’sinden gerçek-zamanlı oynatma verilerini ve ilgili meta verileri
 * overlay’e sağlayan merkezi hook.
 *
 * Özellikler:
 *  - window.spotify.onNow() → now & volume güncellenir.
 *  - Parça ID değişince window.spotify.getAudioFeatures() çağrılır.
 *  - Sanatçı ID’siyle window.spotify.getArtist() → genre bilgisi alınır.
 *  - window.spotify.getQueue() ile sıradaki şarkılar çekilir.
 *  - Context türü ‘playlist’ ise window.spotify.getPlaylist() detayları alınır.
 *  - Hata durumlarında ilgili state’ler null veya [] olur.
 *
 * Döndürdüğü değerler:
 *  {
 *    now,       // NowPlaying | null
 *    volume,    // 0-100 | null
 *    setVolume, // volume güncelleme işlevi
 *    features,  // AudioFeatures | null (devre dışı)
 *    genre,     // string | null
 *    queue,     // Track[]
 *    playlist,  // Playlist | null
 *  }
 *
 * Kullanımı:
 *  const { now, volume, features, genre, queue } = useSpotifyOverlayData();
 ******************************************************************************************/

import { useState, useEffect } from 'react';

export default function useSpotifyOverlayData() {
  const [now, setNow] = useState(null);
  const [volume, setVolume] = useState(null);
  const [features, setFeatures] = useState(null);
  const [genre, setGenre] = useState(null);
  const [queue, setQueue] = useState([]);
  const [playlist, setPlaylist] = useState(null);

  /* now + volume */
  useEffect(() => {
    const unsub = window.spotify.onNow(data => {
      setNow(data);
      if (data?.volume_percent !== undefined) {
        setVolume(data.volume_percent);
      }
    });
    return () => unsub();
  }, []);

  // AudioFeatures - Bu bölüm spotify API değişikliklerinden ötürü devre dışı bırakıldı.
  /* useEffect(() => {
    if (!now?.item?.id) return setFeatures(null);
    window.spotify.getAudioFeatures(now.item.id)
      .then(setFeatures)
      .catch(() => setFeatures(null));
  }, [now?.item?.id]); */

  // Artist Genre
  useEffect(() => {
    const aid = now?.item?.artists?.[0]?.id;
    if (!aid) return setGenre(null);
    window.spotify.getArtist(aid)
      .then(a => setGenre(a.genres?.[0] || null))
      .catch(() => setGenre(null));
  }, [now?.item?.artists]);

  // Queue (Next Song)
  useEffect(() => {
    if (!now) return setQueue([]);
    window.spotify.getQueue()
      .then(r => setQueue(r.queue || []))
      .catch(() => setQueue([]));
  }, [now]);

  // Playlist Details
  useEffect(() => {
    if (now?.context?.type === 'playlist') {
      const pid = now.context.uri.split(':').pop();
      window.spotify.getPlaylist(pid)
        .then(setPlaylist)
        .catch(() => setPlaylist(null));
    } else {
      setPlaylist(null);
    }
  }, [now?.context?.uri]);

  return {
    now, 
    volume, 
    setVolume,
    features, 
    genre,
    queue, 
    playlist,
  };
}
