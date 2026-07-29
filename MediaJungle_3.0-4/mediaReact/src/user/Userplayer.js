import React, { useEffect, useRef, useState } from "react";
import * as dashjs from "dashjs";
import API_URL from "../Config";

const Userplayer = () => {
  const id = localStorage.getItem("id");
  const videoRef = useRef(null);
  const playerRef = useRef(null); // holds the dashjs instance

  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1); // -1 = Auto
  const [showMenu, setShowMenu] = useState(false);
  const [submenu, setSubmenu] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !id) return;

    // ✅ Use ONLY dash.js — do NOT also create a Video.js player on the same element.
    // When both are attached they fight over the <video> element:
    //   • Video.js never receives real duration/currentTime from the DASH stream
    //   • Progress bar gets no data → dot stays at 0, seeking/pausing broken
    // Solution: let DASH.js drive the media, let the browser's native <video controls>
    // draw the progress bar — the browser always has the correct currentTime.
    const player = dashjs.MediaPlayer().create();
    player.initialize(
      videoRef.current,
      `${API_URL}/api/v2/${id}/dash/manifest.mpd`,
      true // autoPlay
    );
    playerRef.current = player;

    // Populate quality options once the stream is ready
    player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
      const videoTracks = player.getTracksFor("video");
      if (videoTracks.length > 0 && videoTracks[0].bitrateList?.length > 0) {
        const options = videoTracks[0].bitrateList.map((br, index) => ({
          id: index,
          label: `${(br.bandwidth / 1000).toFixed(0)} kbps`,
        }));
        setQualities([{ id: -1, label: "Auto" }, ...options]);
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.reset();
        playerRef.current = null;
      }
    };
  }, [id]);

  // ── Quality change ────────────────────────────────────────────────────────
  const handleQualityChange = (qualityId) => {
    setSelectedQuality(qualityId);
    const dash = playerRef.current;
    if (!dash) return;

    if (qualityId === -1) {
      // Switch back to ABR (auto)
      dash.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: true } } },
      });
    } else {
      // Pin to a specific representation
      dash.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: false } } },
      });
      dash.setRepresentationForTypeByIndex("video", qualityId);
    }
    setShowMenu(false);
    setSubmenu(null);
  };

  // ── Speed change — operate on the native <video> element directly ─────────
  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowMenu(false);
    setSubmenu(null);
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
    setSubmenu(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#000",
      }}
    >
      {/*
        ✅ Plain <video> with native browser controls.
        DASH.js feeds it the adaptive stream; the browser handles:
          • progress bar (moves correctly)
          • play / pause button
          • seek (click or drag anywhere on the bar)
          • volume slider
          • fullscreen
        controlsList="nodownload" hides the browser's download button.
      */}
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        style={{ width: "100%", height: "100%" }}
      />

      {/* ⚙️ Floating settings button (quality + speed) */}
      <button
        onClick={toggleMenu}
        title="Settings"
        style={{
          position: "absolute",
          bottom: "64px",
          right: "16px",
          zIndex: 200,
          background: "rgba(0,0,0,0.65)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "42px",
          height: "42px",
          fontSize: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⚙️
      </button>

      {/* Settings panel */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            bottom: "114px",
            right: "16px",
            zIndex: 201,
            background: "rgba(0,0,0,0.88)",
            color: "white",
            borderRadius: "8px",
            minWidth: "210px",
            padding: "6px 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {/* Root menu */}
          {!submenu && (
            <>
              <MenuItem onClick={() => setSubmenu("quality")}>🎥 Video Quality</MenuItem>
              <MenuItem onClick={() => setSubmenu("speed")}>⚡ Playback Speed</MenuItem>
              <MenuItem onClick={() => setShowMenu(false)}>❌ Close</MenuItem>
            </>
          )}

          {/* Quality submenu */}
          {submenu === "quality" && (
            <>
              <MenuItem onClick={() => setSubmenu(null)}>🔙 Back</MenuItem>
              {qualities.length === 0 && (
                <MenuItem disabled>Loading…</MenuItem>
              )}
              {qualities.map((q) => (
                <MenuItem
                  key={q.id}
                  onClick={() => handleQualityChange(q.id)}
                  active={selectedQuality === q.id}
                >
                  {q.label}
                </MenuItem>
              ))}
            </>
          )}

          {/* Speed submenu */}
          {submenu === "speed" && (
            <>
              <MenuItem onClick={() => setSubmenu(null)}>🔙 Back</MenuItem>
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <MenuItem key={speed} onClick={() => handleSpeedChange(speed)}>
                  {speed === 1 ? "1× (Normal)" : `${speed}×`}
                </MenuItem>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Reusable menu item with hover highlight
const MenuItem = ({ onClick, children, active = false, disabled = false }) => (
  <div
    onClick={disabled ? undefined : onClick}
    style={{
      padding: "10px 16px",
      cursor: disabled ? "default" : "pointer",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      background: active ? "rgba(255,255,255,0.18)" : "transparent",
      opacity: disabled ? 0.5 : 1,
      fontSize: "14px",
      userSelect: "none",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = active
        ? "rgba(255,255,255,0.18)"
        : "transparent";
    }}
  >
    {children}
  </div>
);

export default Userplayer;