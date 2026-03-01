import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Import your real world data
import countries from '../data/globe.json';

// Types
interface ConnectionPoint {
  lat: number;
  lng: number;
  color: string;
}

interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  arcAlt: number;
}

interface GlobeProps {
  connections: ConnectionPoint[];
  arcs: Arc[];
  globeColor?: string;
  atmosphereColor?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

// Helper functions
const latLngToVector3 = (lat: number, lng: number, radius: number = 100): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

const createArcCurve = (start: THREE.Vector3, end: THREE.Vector3, arcHeight: number = 20) => {
  const middle = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  middle.normalize().multiplyScalar(100 + arcHeight);
  
  return new THREE.QuadraticBezierCurve3(start, middle, end);
};

// Convert geographic coordinates to canvas coordinates
const latLngToCanvasCoords = (lat: number, lng: number, canvasWidth: number, canvasHeight: number) => {
  const x = ((lng + 180) / 360) * canvasWidth;
  const y = ((90 - lat) / 180) * canvasHeight;
  return { x, y };
};

// Draw country polygons on canvas
const drawCountriesOnCanvas = (canvas: HTMLCanvasElement, countries: any) => {
  const ctx = canvas.getContext('2d')!;
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas with ocean color
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(0, 0, width, height);
  
  // Set land color
  ctx.fillStyle = '#059669';
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 0.5;
  
  // Draw each country
  countries.features.forEach((feature: any) => {
    if (feature.geometry.type === 'Polygon') {
      drawPolygon(ctx, feature.geometry.coordinates[0], width, height);
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((polygon: any) => {
        drawPolygon(ctx, polygon[0], width, height);
      });
    }
  });
};

const drawPolygon = (ctx: CanvasRenderingContext2D, coordinates: number[][], width: number, height: number) => {
  if (coordinates.length === 0) return;
  
  ctx.beginPath();
  coordinates.forEach((coord, index) => {
    const [lng, lat] = coord;
    const { x, y } = latLngToCanvasCoords(lat, lng, width, height);
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

// Animated connection points
const AnimatedPoint: React.FC<{ position: THREE.Vector3; color: string; index: number }> = ({ 
  position, 
  color, 
  index 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshBasicMaterial color={color} />
      {/* Glow effect */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
};

// Globe sphere with real world map
const GlobeSphere: React.FC<{ color: string }> = ({ color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [worldTexture, setWorldTexture] = useState<THREE.Texture | null>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;

    try {
      drawCountriesOnCanvas(canvas, countries);

      // // DEBUG: Show canvas
      // canvas.style.position = 'fixed';
      // canvas.style.top = '0';
      // canvas.style.left = '0';
      // canvas.style.width = '300px';
      // canvas.style.height = '150px';
      // canvas.style.zIndex = '9999';
      // canvas.style.border = '2px solid red';
      // document.body.appendChild(canvas);

      // Add visual enhancements
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      setWorldTexture(texture);
    } catch (error) {
      console.error('Error creating world map texture:', error);
      createFallbackTexture();
    }
  }, []);

  const createFallbackTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(0.7, '#1e3a8a');
    gradient.addColorStop(1, '#1e40af');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#059669';
    ctx.fillRect(200, 300, 400, 200);  // Americas
    ctx.fillRect(800, 250, 300, 250);  // Europe/Africa
    ctx.fillRect(1200, 200, 500, 200); // Asia
    ctx.fillRect(1400, 450, 200, 100); // Australia

    const texture = new THREE.CanvasTexture(canvas);
    setWorldTexture(texture);
  };

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[100, 128, 64]} />
      {worldTexture ? (
        <meshPhongMaterial
          map={worldTexture}
          shininess={100}
          specular={new THREE.Color(0x222222)}
        />
      ) : (
        <meshStandardMaterial color="gray" />
      )}
    </mesh>
  );
};


// Connection points component
const ConnectionPoints: React.FC<{ connections: ConnectionPoint[] }> = ({ connections }) => {
  const points = useMemo(() => {
    return connections.map((connection, index) => {
      const position = latLngToVector3(connection.lat, connection.lng, 102);
      return (
        <AnimatedPoint
          key={index}
          position={position}
          color={connection.color}
          index={index}
        />
      );
    });
  }, [connections]);

  return <group>{points}</group>;
};

// Animated arcs component
const AnimatedArc: React.FC<{ arc: Arc; index: number }> = ({ arc, index }) => {
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
    }
  });

  const geometry = useMemo(() => {
    const startPos = latLngToVector3(arc.startLat, arc.startLng, 101);
    const endPos = latLngToVector3(arc.endLat, arc.endLng, 101);
    const curve = createArcCurve(startPos, endPos, arc.arcAlt * 30);
    const points = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [arc]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial 
        color={arc.color} 
        opacity={0.8} 
        transparent 
        linewidth={2}
      />
    </line>
  );
};

const Arcs: React.FC<{ arcs: Arc[] }> = ({ arcs }) => {
  const arcElements = useMemo(() => {
    return arcs.map((arc, index) => (
      <AnimatedArc key={index} arc={arc} index={index} />
    ));
  }, [arcs]);

  return <group>{arcElements}</group>;
};

// Atmosphere component
const Atmosphere: React.FC<{ color: string }> = ({ color }) => {
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={atmosphereRef}>
      <sphereGeometry args={[105, 64, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.15} 
        side={THREE.BackSide} 
      />
    </mesh>
  );
};

// Main Globe component
const GlobeScene: React.FC<GlobeProps> = ({
  connections,
  arcs,
  globeColor = "#1e40af",
  atmosphereColor = "#ffffff",
  autoRotate = true,
  autoRotateSpeed = 0.5
}) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 300);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={0.8} />
      
      <GlobeSphere color={globeColor} />
      <Atmosphere color={atmosphereColor} />
      <ConnectionPoints connections={connections} />
      <Arcs arcs={arcs} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={200}
        maxDistance={500}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
    </>
  );
};

// Main export component
const RealisticGlobe: React.FC = () => {
  const connections: ConnectionPoint[] = [
    { lat: 40.7128, lng: -74.0060, color: "#06b6d4" }, // New York
    { lat: 51.5074, lng: -0.1278, color: "#3b82f6" },  // London
    { lat: 35.6762, lng: 139.6503, color: "#6366f1" }, // Tokyo
    { lat: -33.8688, lng: 151.2093, color: "#06b6d4" }, // Sydney
    { lat: 55.7558, lng: 37.6176, color: "#3b82f6" },  // Moscow
    { lat: -23.5505, lng: -46.6333, color: "#6366f1" }, // São Paulo
    { lat: 28.6139, lng: 77.2090, color: "#06b6d4" },  // Delhi
    { lat: 1.3521, lng: 103.8198, color: "#3b82f6" },  // Singapore
    { lat: 19.0760, lng: 72.8777, color: "#6366f1" },  // Mumbai
    { lat: 39.9042, lng: 116.4074, color: "#06b6d4" }, // Beijing
    { lat: 48.8566, lng: 2.3522, color: "#3b82f6" },   // Paris
    { lat: 52.5200, lng: 13.4050, color: "#6366f1" },  // Berlin
  ];

  const arcs: Arc[] = [
    { startLat: 40.7128, startLng: -74.0060, endLat: 51.5074, endLng: -0.1278, color: "#06b6d4", arcAlt: 0.3 },
    { startLat: 51.5074, startLng: -0.1278, endLat: 35.6762, endLng: 139.6503, color: "#3b82f6", arcAlt: 0.4 },
    { startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, color: "#6366f1", arcAlt: 0.2 },
    { startLat: -33.8688, startLng: 151.2093, endLat: 1.3521, endLng: 103.8198, color: "#06b6d4", arcAlt: 0.3 },
    { startLat: 1.3521, startLng: 103.8198, endLat: 28.6139, endLng: 77.2090, color: "#3b82f6", arcAlt: 0.2 },
    { startLat: 28.6139, startLng: 77.2090, endLat: 55.7558, endLng: 37.6176, color: "#6366f1", arcAlt: 0.4 },
    { startLat: 55.7558, startLng: 37.6176, endLat: -23.5505, endLng: -46.6333, color: "#06b6d4", arcAlt: 0.5 },
    { startLat: -23.5505, startLng: -46.6333, endLat: 40.7128, endLng: -74.0060, color: "#3b82f6", arcAlt: 0.3 },
    { startLat: 19.0760, startLng: 72.8777, endLat: 39.9042, endLng: 116.4074, color: "#6366f1", arcAlt: 0.3 },
    { startLat: 39.9042, startLng: 116.4074, endLat: 40.7128, endLng: -74.0060, color: "#06b6d4", arcAlt: 0.4 },
    { startLat: 48.8566, startLng: 2.3522, endLat: 52.5200, endLng: 13.4050, color: "#3b82f6", arcAlt: 0.1 },
    { startLat: 52.5200, startLng: 13.4050, endLat: 51.5074, endLng: -0.1278, color: "#6366f1", arcAlt: 0.1 },
  ];

  return (
    <div className="w-full h-full">
      <Canvas camera={{ fov: 50, near: 1, far: 1000 }}>
        <GlobeScene 
          connections={connections}
          arcs={arcs}
          autoRotate={true}
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

export default RealisticGlobe;