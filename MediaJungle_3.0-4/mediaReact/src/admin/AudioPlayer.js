// AudioPlayer.js
import React, { useRef, useState, useEffect, useCallback } from 'react';

const AudioPlayer = ({ audioSrc, audiotitle }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // ── Format seconds → m:ss ────────────────────────────────────────────────
    const fmt = (secs) => {
        if (!secs || isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = useCallback(() => {
        if (!audioRef.current) return;
        const current = audioRef.current.currentTime;
        const dur = audioRef.current.duration;
        setCurrentTime(current);
        setProgress(dur > 0 ? (current / dur) * 100 : 0);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    }, []);

    const handleEnded = useCallback(() => setIsPlaying(false), []);

    // ── KEY FIX: seek on drag/click ──────────────────────────────────────────
    // Old code used react-bootstrap <ProgressBar> which is a read-only <div>.
    // This handler is wired to a real <input type="range"> so seeking works.
    const handleProgressChange = (e) => {
        if (!audioRef.current || !audioRef.current.duration) return;
        const newProgress = Number(e.target.value);
        const newTime = (newProgress / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(newProgress);
        setCurrentTime(newTime);
    };

    // ── Skip ±10 seconds ─────────────────────────────────────────────────────
    const skipBackward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    };

    const skipForward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    };

    // ── Reset + autoplay when src changes ───────────────────────────────────
    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        audioRef.current.load();
        setIsPlaying(false);
        if (audioSrc) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        }
    }, [audioSrc]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [handleTimeUpdate, handleLoadedMetadata, handleEnded]);

    return (
        <div
            className="row"
            style={{
                padding: '5px',
                position: 'fixed',
                width: '100%',
                bottom: '0px',
                backgroundColor: '#141334',
                zIndex: 5,
            }}
        >
            <audio ref={audioRef} src={audioSrc} preload="metadata" />

            {/* ── Seekable progress bar ───────────────────────────────────────
                FIX: replaced read-only react-bootstrap <ProgressBar> with a
                real <input type="range">. The old ProgressBar rendered a <div>
                which has no click/drag seek capability — that is why the bar
                was completely blocked. */}
            <div className="col-lg-12" style={{ padding: '0 12px 4px' }}>
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={progress}
                    onChange={handleProgressChange}
                    style={{
                        width: '100%',
                        accentColor: '#e50914',
                        cursor: 'pointer',
                        height: '4px',
                    }}
                />
            </div>

            {/* ── Controls row ────────────────────────────────────────────── */}
            <div className="row" style={{ padding: '0px', alignItems: 'center' }}>
                <div className="col-lg-1" />

                {/* Title + time */}
                <div className="col-lg-5">
                    <h3 style={{ color: '#fff', fontSize: 'x-large', paddingTop: '10px', margin: 0 }}>
                        {audiotitle}
                    </h3>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>
                        {fmt(currentTime)} / {fmt(duration)}
                    </span>
                </div>

                {/* Playback buttons */}
                <div
                    className="col-lg-1"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    {/* Skip back 10s */}
                    <button
                        onClick={skipBackward}
                        title="Back 10s"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        <i className="bi bi-skip-backward-fill" />
                    </button>

                    {/* Play / Pause */}
                    <button
                        onClick={togglePlayPause}
                        style={{ width: '45px', height: '45px', padding: '5px' }}
                    >
                        {isPlaying ? (
                            <i className="bi bi-pause-fill" style={{ display: 'grid', fontSize: 'xx-large' }} />
                        ) : (
                            <i className="bi bi-play-fill" style={{ display: 'grid', fontSize: 'xx-large' }} />
                        )}
                    </button>

                    {/* Skip forward 10s */}
                    <button
                        onClick={skipForward}
                        title="Forward 10s"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        <i className="bi bi-skip-forward-fill" />
                    </button>
                </div>

                <div className="col-lg-5" />
            </div>
        </div>
    );
};

export default AudioPlayer;