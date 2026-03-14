/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

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
