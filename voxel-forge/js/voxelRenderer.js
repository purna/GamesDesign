/**
 * voxelRenderer.js
 * Turns an item definition (config.js) + its voxel coordinates (voxelShapes.js)
 * into pixels, two ways:
 *   - VoxelStage: a live, auto-rotating Three.js scene for the "mining stage"
 *     and the item-detail modal.
 *   - getThumbnail(item): a cached 64x64 PNG data URL, rendered once per
 *     item id and reused everywhere else (inventory grid, marketplace,
 *     ledger rows) so the page isn't running dozens of WebGL contexts.
 * Only this file touches THREE — nothing else in the app imports it.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { buildVoxels } from './voxelShapes.js';
import { rarityOf } from './config.js';

function colorForItem(item) {
  const rarity = rarityOf(item);
  // Blend the item's own hue with its rarity's color so two "rare" items
  // still look different from each other, while rarity is still readable
  // at a glance from the overall warmth/coolness of the block.
  const base = new THREE.Color(`hsl(${item.hue}, 62%, 52%)`);
  const rarityTint = new THREE.Color(rarity.color);
  return base.lerp(rarityTint, 0.35);
}

function buildInstancedVoxelMesh(item) {
  const voxels = buildVoxels(item.shape, item.grid);
  const geometry = new THREE.BoxGeometry(0.92, 0.92, 0.92);
  const material = new THREE.MeshStandardMaterial({
    color: colorForItem(item),
    roughness: 0.55,
    metalness: item.rarity === 'legendary' || item.rarity === 'epic' ? 0.4 : 0.1
  });
  const mesh = new THREE.InstancedMesh(geometry, material, voxels.length || 1);
  const dummy = new THREE.Object3D();
  const offset = (item.grid - 1) / 2;
  voxels.forEach((v, i) => {
    dummy.position.set(v.x - offset, v.y - offset, v.z - offset);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

export class VoxelStage {
  constructor(canvas, { size = 256, spin = true } = {}) {
    this.canvas = canvas;
    this.spin = spin;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(size, size, false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(3.4, 3, 4.2);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 6, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fd0ff, 0.35);
    rim.position.set(-4, -2, -3);
    this.scene.add(rim);

    this.itemGroup = null;
    this._raf = null;
    this._t = 0;
    this._loop = this._loop.bind(this);
  }

  showItem(item) {
    if (this.itemGroup) this.scene.remove(this.itemGroup);
    this.itemGroup = buildInstancedVoxelMesh(item);
    this.scene.add(this.itemGroup);
    this.render();
  }

  clear() {
    if (this.itemGroup) this.scene.remove(this.itemGroup);
    this.itemGroup = null;
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /** One-off scale pulse, used as click feedback while mining. */
  punch() {
    if (!this.itemGroup) return;
    this.itemGroup.scale.set(0.82, 0.82, 0.82);
  }

  start() {
    if (this._raf) return;
    this._loop();
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _loop() {
    this._t += 0.01;
    if (this.itemGroup) {
      if (this.spin) this.itemGroup.rotation.y += 0.012;
      // Ease the punch scale back to 1 every frame.
      this.itemGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
      this.itemGroup.position.y = Math.sin(this._t * 1.6) * 0.08;
    }
    this.render();
    this._raf = requestAnimationFrame(this._loop);
  }

  dispose() {
    this.stop();
    this.renderer.dispose();
  }
}

// ---- Cached 64x64 thumbnails --------------------------------------------
const thumbnailCache = new Map();
let sharedThumbCanvas = null;
let sharedThumbStage = null;

export function getThumbnail(item) {
  if (thumbnailCache.has(item.id)) return thumbnailCache.get(item.id);

  if (!sharedThumbStage) {
    sharedThumbCanvas = document.createElement('canvas');
    sharedThumbStage = new VoxelStage(sharedThumbCanvas, { size: 64, spin: false });
  }
  sharedThumbStage.showItem(item);
  // A slight fixed tilt so the icon reads as 3D even as a static image.
  sharedThumbStage.itemGroup.rotation.x = -0.35;
  sharedThumbStage.itemGroup.rotation.y = 0.6;
  sharedThumbStage.render();
  const dataUrl = sharedThumbCanvas.toDataURL('image/png');
  thumbnailCache.set(item.id, dataUrl);
  return dataUrl;
}
