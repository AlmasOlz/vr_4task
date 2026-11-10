/* global AFRAME, THREE */
AFRAME.registerComponent('nav-visual', {
  schema: { color: { default: '#2196f3' } },
  init() {
    this.el.addEventListener('model-loaded', () => {
      const mesh = this.el.getObject3D('mesh');
      if (!mesh) return;
      this.el.object3D.updateMatrixWorld(true);
      const size = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
      const max = Math.max(size.x, size.y, size.z);
      if (max > 0) mesh.scale.multiplyScalar(0.45 / max);
      mesh.traverse(node => {
        if (node.isMesh) node.material = new THREE.MeshStandardMaterial({ color: this.data.color, roughness: 0.7 });
      });
    });
  }
});
