"use client";

import { useEffect, useRef } from "react";

/**
 * Hero3D — a lightweight vanilla three.js "molecular network sphere" for the
 * homepage hero: teal + gold nodes joined by a faint wireframe, wrapped in an
 * ambient particle field, with depth fog so the far side recedes into the page.
 *
 * Colours are read live from the site's CSS tokens (tracks light/dark mode).
 * Gently rotates, floats, and parallaxes toward the cursor; respects
 * prefers-reduced-motion; loads three.js dynamically (never hits SSR); and is
 * fully self-cleaning on unmount.
 */
export function Hero3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed || !mount) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const css = getComputedStyle(document.documentElement);
      const color = (token: string, fallback: string) =>
        new THREE.Color(css.getPropertyValue(token).trim() || fallback);
      const teal = color("--color-brand-400", "#2dd4bf");
      const tealMid = color("--color-brand-500", "#14b8a6");
      const tealLine = color("--color-brand-600", "#0d9488");
      const gold = color("--color-accent-400", "#fbbf24");
      const bg = color("--color-background", "#fafaf7");

      let w = mount.clientWidth || 1;
      let h = mount.clientHeight || 1;

      const scene = new THREE.Scene();
      // depth fog: the far side of the structure recedes into the page bg
      scene.fog = new THREE.Fog(bg, 3.6, 8.6);

      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      camera.position.set(0, 0, 5.3);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      Object.assign(renderer.domElement.style, {
        width: "100%",
        height: "100%",
        display: "block",
      });
      mount.appendChild(renderer.domElement);

      // soft round sprite shared by all points (bright core, feathered edge)
      const S = 64;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = S;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.85)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);
      const sprite = new THREE.CanvasTexture(canvas);

      const disposables: { dispose: () => void }[] = [sprite];

      // ---- main network sphere -------------------------------------------
      const group = new THREE.Group();
      scene.add(group);

      const geo = new THREE.IcosahedronGeometry(1.55, 1);
      disposables.push(geo);
      const nVerts = geo.attributes.position.count;
      const colors = new Float32Array(nVerts * 3);
      for (let i = 0; i < nVerts; i++) {
        const roll = Math.random();
        const c = roll < 0.16 ? gold : roll < 0.55 ? teal : tealMid;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const nodeMat = new THREE.PointsMaterial({
        size: 0.17,
        map: sprite,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
      });
      disposables.push(nodeMat);
      group.add(new THREE.Points(geo, nodeMat));

      const wireGeo = new THREE.WireframeGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({
        color: tealLine,
        transparent: true,
        opacity: 0.2,
      });
      disposables.push(wireGeo, wireMat);
      group.add(new THREE.LineSegments(wireGeo, wireMat));

      const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: teal,
        transparent: true,
        opacity: 0.045,
      });
      disposables.push(coreGeo, coreMat);
      group.add(new THREE.Mesh(coreGeo, coreMat));

      // ---- ambient particle field ----------------------------------------
      const N = 150;
      const fpos = new Float32Array(N * 3);
      const fcol = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 2.3 + Math.random() * 2.1;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        fpos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        fpos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        fpos[i * 3 + 2] = r * Math.cos(ph);
        const c = Math.random() < 0.1 ? gold : teal;
        fcol[i * 3] = c.r;
        fcol[i * 3 + 1] = c.g;
        fcol[i * 3 + 2] = c.b;
      }
      const fieldGeo = new THREE.BufferGeometry();
      fieldGeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
      fieldGeo.setAttribute("color", new THREE.BufferAttribute(fcol, 3));
      const fieldMat = new THREE.PointsMaterial({
        size: 0.05,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        sizeAttenuation: true,
      });
      disposables.push(fieldGeo, fieldMat);
      const field = new THREE.Points(fieldGeo, fieldMat);
      scene.add(field);

      // ---- interaction + loop --------------------------------------------
      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      const resize = () => {
        w = mount.clientWidth || 1;
        h = mount.clientHeight || 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      const clock = new THREE.Clock();
      let raf = 0;
      const animate = () => {
        const t = clock.getElapsedTime();
        const s = reduceMotion ? 0.12 : 1;
        group.rotation.y += 0.0022 * s;
        group.rotation.x += 0.001 * s;
        group.position.y = Math.sin(t * 0.7) * 0.08 * s;
        field.rotation.y -= 0.0007 * s;
        field.rotation.x += 0.0004 * s;
        camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.035;
        camera.position.y += (-pointer.y * 0.45 - camera.position.y) * 0.035;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointer);
        ro.disconnect();
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
