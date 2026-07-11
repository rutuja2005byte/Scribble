import { useCallback, useEffect, useRef, useState } from 'react';

export function useCanvas({ socket, canDraw, sendStroke }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const previousPointRef = useRef(null);
  const [color, setColor] = useState('#f8fafc');
  const [brushSize, setBrushSize] = useState(7);
  const [tool, setTool] = useState('brush');

  const drawStroke = useCallback((stroke) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
    ctx.lineWidth = stroke.brushSize;
    ctx.beginPath();
    ctx.moveTo(stroke.from.x * canvas.width, stroke.from.y * canvas.height);
    ctx.lineTo(stroke.to.x * canvas.width, stroke.to.y * canvas.height);
    ctx.stroke();
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const image = canvas.toDataURL();
      canvas.width = Math.floor(rect.width * window.devicePixelRatio);
      canvas.height = Math.floor(rect.height * window.devicePixelRatio);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (image) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = image;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    socket.on('draw', drawStroke);
    socket.on('clear-canvas', clear);

    return () => {
      window.removeEventListener('resize', resize);
      socket.off('draw', drawStroke);
      socket.off('clear-canvas', clear);
    };
  }, [socket, drawStroke, clear]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] || event;

    return {
      x: (source.clientX - rect.left) / rect.width,
      y: (source.clientY - rect.top) / rect.height
    };
  };

  const beginDrawing = (event) => {
    if (!canDraw) {
      return;
    }

    drawingRef.current = true;
    previousPointRef.current = getPoint(event);
  };

  const moveDrawing = (event) => {
    if (!drawingRef.current || !canDraw) {
      return;
    }

    event.preventDefault();
    const point = getPoint(event);
    const stroke = {
      from: previousPointRef.current,
      to: point,
      color,
      brushSize,
      tool
    };

    drawStroke(stroke);
    sendStroke(stroke);
    previousPointRef.current = point;
  };

  const endDrawing = () => {
    drawingRef.current = false;
    previousPointRef.current = null;
  };

  return {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    clear,
    beginDrawing,
    moveDrawing,
    endDrawing
  };
}
