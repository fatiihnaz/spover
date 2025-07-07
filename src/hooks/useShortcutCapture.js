/******************************************************************************************
 * src/hooks/useShortcutCapture.js
 *
 * Kullanıcı kısayol atamaları için dinamik key-capture hook’u.
 * 
 * Özellikler:
 *  - Mevcut atamaları window.shortcuts.get/onChange ile okur.
 *  - “capturing” aktifken global keydown listener ile yeni kombinasyon yakalar.
 *  - standardize & hasConflict ile girilen kombinasyonu doğrular.
 *  - Geçerli ise hem React state’e hem de main-process’e (window.shortcuts.set) yazar.
 *  - Hata durumlarında geçici olarak errors objesine 'invalid'|'reserved'|'duplicate' ekler.
 *
 * Döndürdüğü değerler:
 *  - map:     { [id]: 'Ctrl+Shift+A', … } // Mevcut atamalar
 *  - capturing: string|null             // Hangi id için capture açık
 *  - setCapturing: fn(id|null)          // Capture modunu başlat/durdur
 *  - errors:  { [id]: reason }          // Geçersizlik nedenleri
 *
 * Kullanımı:
 *  const { map, capturing, setCapturing, errors } = useShortcutCapture();
 ******************************************************************************************/

import { useState, useEffect } from "react";
import { standardize, hasConflict } from '../utils/shortcutGuards';

export default function useShortcutCapture() {
    const [map, setMap] = useState({});
    const [capturing, setCapturing] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => { // Başlangıçta ve her değişiklikte mevcut atamaları al → map’e set et
        window.shortcuts?.get().then(setMap);
        const off = window.shortcuts?.onChange?.(setMap);
        return () => { off && off(); };
    }, []);

    useEffect(() => { // Yakalama durumuna göre tüm shortcutları pause/resume et
        if (capturing) {
            window.shortcuts?.pause();
        } else {
            window.shortcuts?.resume();
        }
    }, [capturing]);

    useEffect(() => { // Capture modundayken keydown ile yeni kombinasyon yakala
        if (!capturing) return;

        function onKeyDown(e) {
            e.preventDefault();
            e.stopPropagation();

            //  Modifier tuşlar: sadece bunlara basıldıysa bekle
            const modifierCodes = [
                'ControlLeft', 'ControlRight',
                'ShiftLeft', 'ShiftRight',
                'AltLeft', 'AltRight',
                'MetaLeft', 'MetaRight'
            ];
            if (modifierCodes.includes(e.code)) return;

            // Modifier'ları sıraya ekle
            const parts = [];
            if (e.metaKey) parts.push('Command');
            if (e.ctrlKey) parts.push('Control');
            if (e.altKey) parts.push('Alt');
            if (e.shiftKey) parts.push('Shift');

            // Ana tuşu al
            const key = e.code.startsWith('Key') ? e.key.toUpperCase()
                     :  e.code.startsWith('Digit') ? e.key 
                     :  e.code.includes('Arrow') ? e.code.replace('Arrow', '') 
                     :  e.code;

            parts.push(key);

            // Kombinasyonu oluştur
            const shortcut = Array.from(new Set(parts)).join('+');
            const clean = standardize(shortcut);

            const { [capturing]: _, ...others } = map;
            const reason = hasConflict(shortcut, others);
            if (reason) {
                setErrors(prev => ({ ...prev, [capturing]: reason }));
                setTimeout(() => {
                    setErrors(prev => {
                        const { [capturing]: _, ...rest } = prev;
                        return rest;});
                }, 2000);
                return;
            }
            const next = { ...map, [capturing]: shortcut };
            setMap(next);

            // sistemde güncelle
            window.shortcuts?.set?.({ [capturing]: shortcut });

            setCapturing(null);
        }

        // capture: true ile tüm event’leri engelliyoruz
        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', onKeyDown, { capture: true });

    }, [capturing, map]);

    useEffect(() => { // main-process hatalarını da errors’a yakala
        const offErr = window.shortcuts?.onError?.(payload => {
            setErrors(prev => ({ ...prev, [payload.id]: payload.reason }));
            setTimeout(() => {
                setErrors(prev => {
                    const { [payload.id]: _, ...rest } = prev;
                    return rest;
                });
            }, 2000);
        });

        return () => { offErr && offErr(); };
    }, []);

    return {
        map,
        capturing,
        setCapturing,
        errors,
    };
}