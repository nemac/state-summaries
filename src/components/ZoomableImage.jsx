import { useState, useRef, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

const ZOOM_LEVELS = [1, 2, 3, 4, 5];

export default function ZoomableImage({ src, alt }) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const containerRef = useRef(null);

  const scale = ZOOM_LEVELS[zoomIndex];

  function clampTranslate(tx, ty, currentScale) {
    const el = containerRef.current;
    if (!el) return { x: tx, y: ty };
    const { width, height } = el.getBoundingClientRect();
    return {
      x: Math.min(0, Math.max(-(width * (currentScale - 1)), tx)),
      y: Math.min(0, Math.max(-(height * (currentScale - 1)), ty)),
    };
  }

  function zoomTo(nextIndex) {
    const newScale = ZOOM_LEVELS[nextIndex];
    const oldScale = ZOOM_LEVELS[zoomIndex];
    const el = containerRef.current;
    if (el) {
      const { width, height } = el.getBoundingClientRect();
      const ratio = newScale / oldScale;
      const newTx = width / 2 - ratio * (width / 2 - translate.x);
      const newTy = height / 2 - ratio * (height / 2 - translate.y);
      setTranslate({
        x: Math.min(0, Math.max(-(width * (newScale - 1)), newTx)),
        y: Math.min(0, Math.max(-(height * (newScale - 1)), newTy)),
      });
    }
    setZoomIndex(nextIndex);
  }

  function handleZoomIn() {
    const next = Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1);
    if (next !== zoomIndex) zoomTo(next);
  }

  function handleZoomOut() {
    const next = Math.max(zoomIndex - 1, 0);
    if (next !== zoomIndex) zoomTo(next);
  }

  // Reset zoom on container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setZoomIndex(0);
      setTranslate({ x: 0, y: 0 });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = useCallback(
    (event) => {
      if (scale <= 1) return;
      event.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        tx: translate.x,
        ty: translate.y,
      };
    },
    [scale, translate],
  );

  const handleMouseMove = useCallback(
    (event) => {
      if (!isPanning) return;
      const dx = event.clientX - panStartRef.current.x;
      const dy = event.clientY - panStartRef.current.y;
      const clamped = clampTranslate(
        panStartRef.current.tx + dx,
        panStartRef.current.ty + dy,
        scale,
      );
      setTranslate(clamped);
    },
    [isPanning, scale],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  function getCursor() {
    if (isPanning) return "grabbing";
    if (scale > 1) return "grab";
    return "default";
  }

  const controlButtonStyle = {
    width: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    color: "#333",
    fontSize: "22px",
    fontWeight: 300,
    lineHeight: 1,
    cursor: "pointer",
    userSelect: "none",
    border: "none",
    borderBottom: "1px solid #ccc",
    "&:hover": { backgroundColor: "#f4f4f4" },
    "&:disabled": {
      color: "#bbb",
      cursor: "default",
      backgroundColor: "#f4f4f4",
    },
  };

  return (
    <Box
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        cursor: getCursor(),
        userSelect: "none",
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        draggable={false}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transformOrigin: "0 0",
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: isPanning ? "none" : "transform 0.15s ease-out",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          display: "flex",
          flexDirection: "column",
          borderRadius: "4px",
          overflow: "hidden",
          boxShadow: "0 1px 5px rgba(0,0,0,0.4)",
          zIndex: 10,
        }}
      >
        <Box
          component="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
          sx={controlButtonStyle}
          aria-label="Zoom in"
        >
          +
        </Box>
        <Box
          component="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          disabled={zoomIndex <= 0}
          sx={{ ...controlButtonStyle, borderBottom: "none" }}
          aria-label="Zoom out"
        >
          −
        </Box>
      </Box>
    </Box>
  );
}

ZoomableImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};
