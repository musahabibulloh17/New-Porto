/// <reference types="vite/client" />

declare module "*.glb";
declare module "*.png";

declare module "meshline" {
  import { BufferGeometry, Material, Texture } from "three";

  export class MeshLineGeometry extends BufferGeometry {
    setPoints(points: Float32Array | number[] | THREE.Vector3[]): void;
  }

  export class MeshLineMaterial extends Material {
    color: string;
    map: Texture;
    useMap: boolean;
    resolution: [number, number];
    lineWidth: number;
    depthTest: boolean;
    repeat: [number, number];
  }
}

// Augment JSX for R3F custom elements
import type { MeshLineGeometry, MeshLineMaterial } from "meshline";
import type * as THREE from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: any;
    meshLineMaterial: any;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}
