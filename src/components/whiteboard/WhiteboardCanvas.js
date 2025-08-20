import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useWebSocket } from '../../contexts/WebSocketContext';

const WhiteboardCanvas = ({ tool, color, strokeWidth, onCanvasReady, isToolbarVisible = true, isSidebarVisible = true }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { sendCanvasUpdate, sendCanvasSync, socket, isConnected } = useWebSocket();
  const autoSaveTimeoutRef = useRef(null);

  // Calculate responsive canvas dimensions
  const calculateCanvasDimensions = () => {
    const toolbarWidth = window.innerWidth < 640 ? 256 : (window.innerWidth < 1024 ? 288 : 320); // sm:w-72 lg:w-80
    const mainSidebarWidth = 256; // Main sidebar width
    const headerHeight = 80; // Approximate header height

    let totalSidebarWidth = 0;
    if (isSidebarVisible) totalSidebarWidth += mainSidebarWidth;
    if (isToolbarVisible) totalSidebarWidth += toolbarWidth;

    const availableWidth = window.innerWidth - totalSidebarWidth;
    const availableHeight = window.innerHeight - headerHeight;

    return {
      width: Math.max(availableWidth, 400), // Minimum width
      height: Math.max(availableHeight, 300) // Minimum height
    };
  };

  useEffect(() => {

    const { width, height } = calculateCanvasDimensions();

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'white',
      selection: tool === 'select',
    });

    fabricCanvasRef.current = canvas;

    // Configure canvas based on tool
    updateCanvasMode(canvas, tool);

    // Add canvas change listeners for auto-save
    setupCanvasListeners(canvas);

    // Listen for WebSocket canvas updates from other users
    setupWebSocketListeners(canvas);

    // Notify parent component
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    // Handle window resize
    const handleResize = () => {
      const toolbarWidth = window.innerWidth < 640 ? 256 : (window.innerWidth < 1024 ? 288 : 320);
      const mainSidebarWidth = 256;
      const headerHeight = 80;

      let totalSidebarWidth = 0;
      if (isSidebarVisible) totalSidebarWidth += mainSidebarWidth;
      if (isToolbarVisible) totalSidebarWidth += toolbarWidth;

      const availableWidth = window.innerWidth - totalSidebarWidth;
      const availableHeight = window.innerHeight - headerHeight;

      const width = Math.max(availableWidth, 400);
      const height = Math.max(availableHeight, 300);

      canvas.setDimensions({ width, height });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [isToolbarVisible, isSidebarVisible]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      updateCanvasMode(fabricCanvasRef.current, tool);
    }
  }, [tool, color, strokeWidth]);

  // Update canvas dimensions when sidebar/toolbar visibility changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const { width, height } = calculateCanvasDimensions();
      fabricCanvasRef.current.setDimensions({ width, height });
      fabricCanvasRef.current.renderAll();
    }
  }, [isToolbarVisible, isSidebarVisible]);

  const updateCanvasMode = (canvas, currentTool) => {
    // Clear any existing drawing mode
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
    });

    switch (currentTool) {
      case 'pen':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = strokeWidth;
        canvas.freeDrawingBrush.color = color;
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = strokeWidth * 2;
        canvas.freeDrawingBrush.color = 'white';
        break;
      case 'select':
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
        break;
      case 'rectangle':
        setupShapeDrawing(canvas, 'rectangle');
        break;
      case 'circle':
        setupShapeDrawing(canvas, 'circle');
        break;
      case 'arrow':
        setupShapeDrawing(canvas, 'arrow');
        break;
      case 'text':
        setupTextMode(canvas);
        break;
      default:
        break;
    }
  };

  const setupShapeDrawing = (canvas, shape) => {
    let isDown = false;
    let origX, origY;
    let currentShape = null;

    canvas.on('mouse:down', (options) => {
      if (tool !== shape) return;
      
      isDown = true;
      const pointer = canvas.getPointer(options.e);
      origX = pointer.x;
      origY = pointer.y;

      if (shape === 'rectangle') {
        currentShape = new fabric.Rect({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: color,
          strokeWidth: strokeWidth,
        });
      } else if (shape === 'circle') {
        currentShape = new fabric.Circle({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          radius: 0,
          fill: 'transparent',
          stroke: color,
          strokeWidth: strokeWidth,
        });
      } else if (shape === 'arrow') {
        currentShape = new fabric.Line([origX, origY, origX, origY], {
          stroke: color,
          strokeWidth: strokeWidth,
          selectable: false,
        });
      }

      if (currentShape) {
        canvas.add(currentShape);
      }
    });

    canvas.on('mouse:move', (options) => {
      if (!isDown || !currentShape || tool !== shape) return;

      const pointer = canvas.getPointer(options.e);

      if (shape === 'rectangle') {
        currentShape.set({
          width: Math.abs(origX - pointer.x),
          height: Math.abs(origY - pointer.y),
        });
        if (origX > pointer.x) {
          currentShape.set({ left: pointer.x });
        }
        if (origY > pointer.y) {
          currentShape.set({ top: pointer.y });
        }
      } else if (shape === 'circle') {
        const radius = Math.sqrt(Math.pow(origX - pointer.x, 2) + Math.pow(origY - pointer.y, 2)) / 2;
        currentShape.set({ radius: radius });
      } else if (shape === 'arrow') {
        currentShape.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      canvas.renderAll();
    });

    canvas.on('mouse:up', () => {
      isDown = false;
      currentShape = null;
    });
  };

  const setupTextMode = (canvas) => {
    canvas.on('mouse:down', (options) => {
      if (tool !== 'text') return;

      const pointer = canvas.getPointer(options.e);
      const text = new fabric.IText('Click to edit', {
        left: pointer.x,
        top: pointer.y,
        fontFamily: 'Arial',
        fontSize: 18,
        fill: color,
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
    });
  };

  // Setup canvas change listeners for auto-save
  const setupCanvasListeners = (canvas) => {
    const handleCanvasChange = (event) => {
      console.log('Canvas changed:', event.type);

      // Send real-time update for specific operations
      if (event.type === 'object:added' || event.type === 'object:modified' || event.type === 'object:removed') {
        if (sendCanvasUpdate && isConnected) {
          sendCanvasUpdate(event.type, {
            objects: canvas.toJSON(),
            timestamp: Date.now()
          });
        }
      }

      // Auto-save with debouncing
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        saveCanvasToStorage(canvas);
        if (sendCanvasSync && isConnected) {
          sendCanvasSync(canvas.toJSON());
        }
      }, 2000); // Save after 2 seconds of inactivity
    };

    // Listen to canvas events
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    canvas.on('path:created', handleCanvasChange); // For free drawing
    canvas.on('object:moving', handleCanvasChange);
    canvas.on('object:scaling', handleCanvasChange);
    canvas.on('object:rotating', handleCanvasChange);
  };

  // Setup WebSocket listeners for real-time collaboration
  const setupWebSocketListeners = (canvas) => {
    if (!socket) return;

    socket.on('canvas-update', (data) => {
      console.log('Received canvas update from other user:', data);
      // Apply changes from other users without triggering our own events
      canvas.off('object:added object:modified object:removed');

      // Update canvas with received data
      if (data.objectData && data.objectData.objects) {
        canvas.loadFromJSON(data.objectData.objects, () => {
          canvas.renderAll();
          // Re-enable event listeners
          setupCanvasListeners(canvas);
        });
      }
    });

    socket.on('canvas-sync', (data) => {
      console.log('Received full canvas sync:', data);
      if (data.canvasData) {
        canvas.loadFromJSON(data.canvasData, () => {
          canvas.renderAll();
        });
      }
    });
  };

  // Save canvas to local storage
  const saveCanvasToStorage = (canvas) => {
    try {
      const canvasData = canvas.toJSON();
      localStorage.setItem('tomoboard_canvas_data', JSON.stringify(canvasData));
      console.log('Canvas auto-saved to localStorage');
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  };

  // Load canvas from local storage
  const loadCanvasFromStorage = (canvas) => {
    try {
      const savedData = localStorage.getItem('tomoboard_canvas_data');
      if (savedData) {
        const canvasData = JSON.parse(savedData);
        canvas.loadFromJSON(canvasData, () => {
          canvas.renderAll();
          console.log('Canvas loaded from localStorage');
        });
      }
    } catch (error) {
      console.error('Failed to load canvas:', error);
    }
  };

  // Load saved canvas data on mount
  useEffect(() => {
    if (fabricCanvasRef.current) {
      loadCanvasFromStorage(fabricCanvasRef.current);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-white dark:bg-gray-900">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-w-full max-h-full"
      />
    </div>
  );
};

export default WhiteboardCanvas;
