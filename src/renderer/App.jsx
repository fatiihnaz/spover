import { useState, useEffect } from 'react';
import HeaderBar from './ConfigUI/HeaderBar';
import PreviewArea from './ConfigUI/PreviewArea';
import ControlPanel from './ConfigUI/ControlPanel';
import useConfig from '../hooks/useConfig';
import ScrollArea from './ConfigUI/ScrollArea';

export default function App() {
  const [cfg, setCfg] = useConfig();

  /* ---------- Spotify durumu ---------- */
  const [spotifyReady, setSpotifyReady] = useState(false);
  useEffect(() => {
    window.spotify?.isConnected?.().then(setSpotifyReady);
    window.spotify?.onConnected?.(() => setSpotifyReady(true));
    window.spotify?.onDisconnected?.(() => setSpotifyReady(false));
  }, []);

  /* ---------- Sekme durumu ---------- */
  const [tab, setTab] = useState('overlay'); // overlay | mode | shortcuts

  /* ---------- JSX ---------- */
  return (
    <div className="h-screen w-screen bg-zinc-900 text-white select-none overflow-hidden">
      <HeaderBar spotifyReady={spotifyReady} />

      <div className="h-[calc(100vh-40px)] flex flex-col md:flex-row overflow-hidden">
        {/* SOL: preview veya builder */}
        <PreviewArea cfg={cfg} activeTab={tab} />

        {/* SAĞ: kontrol paneli */}
        <ScrollArea className="md:w-[28rem] w-full h-full bg-zinc-800 border-t md:border-t-0 md:border-l border-zinc-700/40">
          <ControlPanel
            cfg={cfg}
            setCfg={setCfg}
            tab={tab}
            setTab={setTab}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
