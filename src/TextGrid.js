import React, { useState, useEffect, useCallback } from 'react';

const GRID_ROWS = 15;
const GRID_COLS = 20;
const DEFAULT_SQUARE_SIZE = 30;
const DEFAULT_GAP_WIDTH = 200;

const TextGrid = () => {
  const [text, setText] = useState("Hello");
  const [speed, setSpeed] = useState(2);
  const [position, setPosition] = useState(GRID_COLS * DEFAULT_SQUARE_SIZE);
  const [squareSize, setSquareSize] = useState(DEFAULT_SQUARE_SIZE);
  const [grid, setGrid] = useState(Array(GRID_ROWS).fill().map(() => Array(GRID_COLS).fill(false)));
  const [textWidth, setTextWidth] = useState(0);

  // Create a virtual canvas to determine which pixels should be lit
  const getTextPixels = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set font size based on grid height
    const fontSize = Math.floor(GRID_ROWS * squareSize * 0.8);
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Calculate required canvas width and height
    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = fontSize;
    
    // Set canvas dimensions
    canvas.width = textWidth;
    canvas.height = textHeight;
    
    // Need to reset font after canvas resize
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textBaseline = 'top';
    
    // Clear and fill text
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillText(text, 0, 0);
    
    // Get pixel data
    const imageData = ctx.getImageData(0, 0, textWidth, textHeight);
    const pixels = Array(GRID_ROWS).fill().map(() => Array(Math.ceil(textWidth / squareSize)).fill(false));
    
    // Convert image data to boolean grid
    for (let y = 0; y < textHeight; y++) {
      for (let x = 0; x < textWidth; x++) {
        const gridY = Math.floor(y * GRID_ROWS / textHeight);
        const gridX = Math.floor(x / squareSize);
        if (gridY < GRID_ROWS && gridX < pixels[0].length) {
          const idx = (y * textWidth + x) * 4 + 3; // Alpha channel
          if (imageData.data[idx] > 128) { // If pixel is more than 50% opaque
            pixels[gridY][gridX] = true;
          }
        }
      }
    }
    
    setTextWidth(textWidth);
    return pixels;
  }, [text, squareSize]);

  // Update grid based on current position
  const updateGrid = useCallback(() => {
    const textPixels = getTextPixels();
    const newGrid = Array(GRID_ROWS).fill().map(() => Array(GRID_COLS).fill(false));
    
    const startCol = Math.floor(position / squareSize);
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const textCol = startCol + col;
        if (textCol >= 0 && textCol < textPixels[0].length) {
          newGrid[row][col] = textPixels[row][textCol];
        }
      }
    }
    
    setGrid(newGrid);
  }, [position, getTextPixels, squareSize]);

  // Animation loop
  useEffect(() => {
    const totalDistance = textWidth + DEFAULT_GAP_WIDTH;
    
    const animate = () => {
      setPosition((prevPos) => {
        const newPos = prevPos - speed;
        return newPos < -textWidth ? totalDistance : newPos;
      });
    };

    const intervalId = setInterval(animate, 16);
    return () => clearInterval(intervalId);
  }, [speed, textWidth]);

  // Update grid whenever position changes
  useEffect(() => {
    updateGrid();
  }, [position, updateGrid]);

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      {/* <h2 style={{ marginBottom: '20px', fontSize: '24px' }}></h2> */}
      
      <div style={{ marginBottom: '20px' }}>
        {/* Grid Display */}
        <div style={{
          display: 'grid',
          gap: '1px',
          gridTemplateColumns: `repeat(${GRID_COLS}, ${squareSize}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${squareSize}px)`,
          backgroundColor: '#eee',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {grid.flat().map((isLit, i) => (
            <div
              key={i}
              style={{
                backgroundColor: isLit ? 'red' : 'black',
                width: squareSize,
                height: squareSize,
                border: '1px solid #333'
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Text:(Don't let this box empty, else reload the webpage)</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Speed (pixels per frame): {speed}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Square Size (pixels): {squareSize}
          </label>
          <input
            type="range"
            min="20"
            max="50"
            step="5"
            value={squareSize}
            onChange={(e) => setSquareSize(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TextGrid;