import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

const WhiteboardCanvas = ({ tool, color, strokeWidth, onCanvasReady, isToolbarVisible = true, isSidebarVisible = true }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
