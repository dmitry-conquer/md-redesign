import "../styles/main.css";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("mc-out", "M0,0 C0.16,1 0.3,1 1,1");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function initLoader(root: HTMLElement) {
  const loader = root.querySelector<HTMLElement>(".mc-loader");
  const count = root.querySelector<HTMLElement>(".mc-loader__count");
  const bar = root.querySelector<HTMLElement>(".mc-loader__bar");

  if (!loader || !count || !bar || reducedMotion.matches) {
    loader?.remove();
    return Promise.resolve();
  }

  const progress = { value: 0 };
  return new Promise<void>((resolve) => {
    gsap
      .timeline({ onComplete: resolve })
      .to(progress, {
        value: 100,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate: () => {
          count.textContent = String(Math.round(progress.value)).padStart(2, "0");
        },
      })
      .to(bar, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0)
      .to(loader, { yPercent: -100, duration: 0.8, ease: "mc-out" })
      .set(loader, { display: "none" });
  });
}

function initLenis() {
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.92,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function initHeader(root: HTMLElement, lenis: Lenis | null) {
  const header = root.querySelector<HTMLElement>("[data-header]");
  const toggle = root.querySelector<HTMLButtonElement>(".mc-menu-toggle");
  const menu = root.querySelector<HTMLElement>(".mc-menu");

  if (!header || !toggle || !menu) return;

  ScrollTrigger.create({
    start: 70,
    onUpdate: (self) => {
      header.classList.toggle("is-scrolled", self.scroll() > 70);
    },
  });

  let isOpen = false;
  const menuLinks = menu.querySelectorAll("li, .mc-menu__contact, .mc-menu__meta");
  const menuTimeline = gsap
    .timeline({ paused: true })
    .set(menu, { visibility: "visible" })
    .to(menu, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "mc-out" })
    .fromTo(menuLinks, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.055, ease: "mc-out" }, "-=0.45");

  menuTimeline.eventCallback("onReverseComplete", () => {
    header.classList.remove("is-menu-open");
  });

  const setMenu = (open: boolean) => {
    isOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only")!.textContent = open ? "Close menu" : "Open menu";
    if (open) {
      header.classList.add("is-menu-open");
      header.style.transform = "translateY(0)";
      lenis?.stop();
      menuTimeline.play();
    } else {
      lenis?.start();
      menuTimeline.reverse();
    }
  };

  toggle.addEventListener("click", () => setMenu(!isOpen));
  menu.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) setMenu(false);
  });
}

function initCursor(root: HTMLElement) {
  if (!window.matchMedia("(pointer: fine)").matches || reducedMotion.matches) return;

  const cursor = root.querySelector<HTMLElement>(".mc-cursor");
  if (!cursor) return;

  const xTo = gsap.quickTo(cursor, "x", { duration: 0.36, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.36, ease: "power3" });

  window.addEventListener("pointermove", (event) => {
    xTo(event.clientX - 40);
    yTo(event.clientY - 40);
    gsap.to(cursor, { opacity: 1, duration: 0.2 });
  });

  root.querySelectorAll<HTMLElement>(".mc-cursor-target").forEach((target) => {
    target.addEventListener("pointerenter", () => cursor.classList.add("is-project"));
    target.addEventListener("pointerleave", () => cursor.classList.remove("is-project"));
  });
}

function initMagnetic(root: HTMLElement) {
  if (!window.matchMedia("(pointer: fine)").matches || reducedMotion.matches) return;

  root.querySelectorAll<HTMLElement>(".mc-magnetic").forEach((button) => {
    const content = button.querySelectorAll<HTMLElement>("span, i");
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      gsap.to(button, { x: x * 0.16, y: y * 0.22, duration: 0.55, ease: "power3.out" });
      gsap.to(content, { x: x * 0.08, y: y * 0.11, duration: 0.55, ease: "power3.out" });
    });
    button.addEventListener("pointerleave", () => {
      gsap.to([button, content], { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
    });
  });
}

function initScrollProgress(root: HTMLElement) {
  const line = root.querySelector<HTMLElement>(".mc-scroll-progress span");
  if (!line) return;

  gsap.to(line, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.25 },
  });
}

type LogoPose = {
  x: number;
  y: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
  opacity: number;
};

type LogoKeyframe = LogoPose & {
  selector: string;
  anchor: number;
};

const desktopLogoKeyframes: LogoKeyframe[] = [
  { selector: "[data-logo-origin]", anchor: 0, x: 0.06, y: 0.06, scale: 0.03, rx: 0, ry: 0, rz: 0, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.16, x: 0.06, y: 0.06, scale: 0.034, rx: -0.025, ry: -0.08, rz: -0.008, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.28, x: 0.3, y: 0.055, scale: 0.043, rx: -0.05, ry: -0.13, rz: -0.015, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.58, x: 0.55, y: 0.06, scale: 0.058, rx: -0.08, ry: -0.22, rz: -0.03, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.95, x: 0.87, y: 0.72, scale: 0.095, rx: -0.18, ry: -0.35, rz: -0.08, opacity: 1 },
  { selector: ".mc-proof", anchor: 0.42, x: 0.91, y: 0.42, scale: 0.07, rx: 0.08, ry: 0.65, rz: 0.12, opacity: 0.88 },
  { selector: ".mc-intro", anchor: 0.2, x: 0.72, y: 0.3, scale: 0.21, rx: -0.16, ry: 1.5, rz: -0.18, opacity: 0.94 },
  { selector: ".mc-manifesto", anchor: 0.28, x: 0.76, y: 0.53, scale: 0.42, rx: 0.28, ry: 3.2, rz: -0.34, opacity: 0.86 },
  { selector: ".mc-benefits", anchor: 0.18, x: 0.88, y: 0.23, scale: 0.1, rx: -0.12, ry: 4.42, rz: 0.1, opacity: 0.9 },
  { selector: ".mc-conversion", anchor: 0.23, x: 0.78, y: 0.63, scale: 0.29, rx: 0.18, ry: 5.82, rz: -0.2, opacity: 0.92 },
  { selector: ".mc-process", anchor: 0.2, x: 0.5, y: 0.31, scale: 0.14, rx: -0.25, ry: 7.05, rz: 0.28, opacity: 0.9 },
  { selector: ".mc-work", anchor: 0.2, x: 0.87, y: 0.82, scale: 0.09, rx: 0.15, ry: 8.62, rz: -0.1, opacity: 0.9 },
  { selector: ".mc-faq", anchor: 0.25, x: 0.88, y: 0.66, scale: 0.095, rx: -0.18, ry: 10.18, rz: 0.2, opacity: 0.9 },
  { selector: ".mc-final", anchor: 0.24, x: 0.79, y: 0.44, scale: 0.36, rx: 0.08, ry: 12.0, rz: -0.1, opacity: 0.78 },
  { selector: ".mc-footer", anchor: 0.55, x: 0.9, y: 0.7, scale: 0.075, rx: -0.12, ry: 13.0, rz: 0.08, opacity: 0.86 },
];

const mobileLogoKeyframes: LogoKeyframe[] = [
  { selector: "[data-logo-origin]", anchor: 0, x: 0.09, y: 0.045, scale: 0.095, rx: 0, ry: 0, rz: 0, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.16, x: 0.09, y: 0.045, scale: 0.1, rx: -0.025, ry: -0.08, rz: -0.008, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.28, x: 0.58, y: 0.035, scale: 0.103, rx: -0.04, ry: -0.12, rz: -0.015, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.58, x: 0.75, y: 0.045, scale: 0.115, rx: -0.06, ry: -0.2, rz: -0.03, opacity: 1 },
  { selector: ".mc-hero", anchor: 0.95, x: 0.8, y: 0.2, scale: 0.2, rx: -0.15, ry: -0.3, rz: -0.08, opacity: 1 },
  { selector: ".mc-proof", anchor: 0.35, x: 0.78, y: 0.28, scale: 0.16, rx: 0.08, ry: 0.7, rz: 0.12, opacity: 0.86 },
  { selector: ".mc-intro", anchor: 0.2, x: 0.77, y: 0.24, scale: 0.29, rx: -0.15, ry: 1.55, rz: -0.18, opacity: 0.9 },
  { selector: ".mc-manifesto", anchor: 0.3, x: 0.72, y: 0.63, scale: 0.48, rx: 0.25, ry: 3.15, rz: -0.28, opacity: 0.72 },
  { selector: ".mc-benefits", anchor: 0.16, x: 0.78, y: 0.18, scale: 0.2, rx: -0.1, ry: 4.4, rz: 0.1, opacity: 0.86 },
  { selector: ".mc-conversion", anchor: 0.24, x: 0.72, y: 0.72, scale: 0.36, rx: 0.16, ry: 5.8, rz: -0.18, opacity: 0.76 },
  { selector: ".mc-process", anchor: 0.18, x: 0.76, y: 0.2, scale: 0.22, rx: -0.22, ry: 7.05, rz: 0.24, opacity: 0.84 },
  { selector: ".mc-work", anchor: 0.18, x: 0.76, y: 0.8, scale: 0.18, rx: 0.14, ry: 8.6, rz: -0.1, opacity: 0.84 },
  { selector: ".mc-faq", anchor: 0.2, x: 0.8, y: 0.72, scale: 0.2, rx: -0.16, ry: 10.15, rz: 0.18, opacity: 0.84 },
  { selector: ".mc-final", anchor: 0.2, x: 0.7, y: 0.4, scale: 0.48, rx: 0.06, ry: 12.0, rz: -0.08, opacity: 0.62 },
  { selector: ".mc-footer", anchor: 0.5, x: 0.78, y: 0.72, scale: 0.18, rx: -0.1, ry: 13.0, rz: 0.08, opacity: 0.82 },
];

async function initScrollLogo(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-scroll-logo]");
  const canvas = stage?.querySelector<HTMLCanvasElement>("canvas");
  if (!stage || !canvas) return;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: window.devicePixelRatio <= 1.5, powerPreference: "high-performance" });
  } catch {
    stage.remove();
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.94;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.z = 8;

  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(environment, 0.035).texture;
  environment.dispose();
  pmremGenerator.dispose();

  const motionRig = new THREE.Group();
  const floatRig = new THREE.Group();
  motionRig.add(floatRig);
  scene.add(motionRig);

  const hemisphere = new THREE.HemisphereLight(0xfff5f2, 0x110205, 0.44);
  const keyLight = new THREE.RectAreaLight(0xfff4f0, 1.05, 4.5, 5.5);
  keyLight.position.set(-3.8, 4.5, 6);
  keyLight.lookAt(0, 0, 0);
  const rimLight = new THREE.RectAreaLight(0xffd8d4, 0.35, 3, 5);
  rimLight.position.set(4.5, 0.5, 4.5);
  rimLight.lookAt(0, 0, 0);
  const lowerFill = new THREE.RectAreaLight(0xaebbd8, 0.22, 4, 2.5);
  lowerFill.position.set(-1.5, -4, 3.5);
  lowerFill.lookAt(0, 0, 0);
  scene.add(hemisphere, keyLight, rimLight, lowerFill);

  try {
    const gltf = await new GLTFLoader().loadAsync("/media-components-logo-professional.glb");
    const model = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    model.position.sub(center);
    const normalizedScale = 1 / Math.max(size.x, 0.001);
    model.scale.set(normalizedScale, normalizedScale * 1.28, normalizedScale);

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.frustumCulled = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.set(0x920b15);
          material.emissive.set(0x6a0009);
          material.emissiveIntensity = 0.38;
          material.metalness = 0.07;
          material.roughness = 0.39;
          material.envMapIntensity = 0.4;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.clearcoat = 0.28;
            material.clearcoatRoughness = 0.32;
            material.ior = 1.48;
            material.specularIntensity = 0.3;
            material.specularColor.set(0xffe2de);
          }
          material.needsUpdate = true;
        }
      });
    });

    floatRig.add(model);
  } catch {
    renderer.dispose();
    stage.remove();
    return;
  }

  const { selector: _initialSelector, anchor: _initialAnchor, ...initialPose } = desktopLogoKeyframes[0];
  const current: LogoPose = { ...initialPose };
  let anchors: Array<{ scroll: number; pose: LogoPose }> = [];
  let lastScroll = window.scrollY;
  let scrollVelocity = 0;
  let lastTime = performance.now();
  let frame = 0;
  let pageVisible = !document.hidden;

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dprCap = width < 768 ? 1.25 : 1.6;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };

  const measureAnchors = () => {
    const source = window.innerWidth < 768 ? mobileLogoKeyframes : desktopLogoKeyframes;
    anchors = source.flatMap(({ selector, anchor, ...pose }) => {
      const element = root.querySelector<HTMLElement>(selector);
      if (!element) return [];
      const rect = element.getBoundingClientRect();
      if (selector === "[data-logo-origin]") {
        const markWidth = rect.width * (65 / 273);
        return [{
          scroll: 0,
          pose: {
            ...pose,
            x: (rect.left + markWidth * 0.5) / window.innerWidth,
            y: (rect.top + rect.height * 0.5) / window.innerHeight,
            scale: markWidth / window.innerWidth,
          },
        }];
      }
      return [{ scroll: rect.top + window.scrollY + rect.height * anchor, pose }];
    });
    anchors.sort((a, b) => a.scroll - b.scroll);
  };

  const poseAt = (scroll: number) => {
    if (anchors.length < 2) return anchors[0]?.pose ?? desktopLogoKeyframes[0];
    if (scroll <= anchors[0].scroll) return anchors[0].pose;
    const last = anchors[anchors.length - 1];
    if (scroll >= last.scroll) return last.pose;

    let index = 0;
    while (index < anchors.length - 2 && scroll > anchors[index + 1].scroll) index += 1;
    const from = anchors[index];
    const to = anchors[index + 1];
    const raw = THREE.MathUtils.clamp((scroll - from.scroll) / Math.max(to.scroll - from.scroll, 1), 0, 1);
    const t = raw * raw * (3 - 2 * raw);
    return {
      x: THREE.MathUtils.lerp(from.pose.x, to.pose.x, t),
      y: THREE.MathUtils.lerp(from.pose.y, to.pose.y, t),
      scale: THREE.MathUtils.lerp(from.pose.scale, to.pose.scale, t),
      rx: THREE.MathUtils.lerp(from.pose.rx, to.pose.rx, t),
      ry: THREE.MathUtils.lerp(from.pose.ry, to.pose.ry, t),
      rz: THREE.MathUtils.lerp(from.pose.rz, to.pose.rz, t),
      opacity: THREE.MathUtils.lerp(from.pose.opacity, to.pose.opacity, t),
    };
  };

  const render = (time: number) => {
    if (!pageVisible) return;
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const scroll = window.scrollY;
    const instantVelocity = delta > 0 ? (scroll - lastScroll) / delta : 0;
    scrollVelocity = THREE.MathUtils.damp(scrollVelocity, instantVelocity, 7, delta);
    lastScroll = scroll;
    const target = poseAt(scroll);
    const damping = reducedMotion.matches ? 100 : scroll < 800 ? 5.5 : 8.5;

    (Object.keys(current) as Array<keyof LogoPose>).forEach((key) => {
      current[key] = THREE.MathUtils.damp(current[key], target[key], damping, delta);
    });

    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    motionRig.position.x = (current.x - 0.5) * visibleWidth;
    motionRig.position.y = (0.5 - current.y) * visibleHeight;
    motionRig.scale.setScalar(visibleWidth * current.scale);
    const velocityRamp = THREE.MathUtils.smoothstep(scroll, 120, 620);
    motionRig.rotation.set(
      current.rx,
      current.ry,
      current.rz + THREE.MathUtils.clamp(scrollVelocity / 9500, -0.16, 0.16) * velocityRamp,
    );

    if (!reducedMotion.matches) {
      floatRig.position.y = Math.sin(time * 0.00072) * 0.018;
      floatRig.rotation.y = Math.sin(time * 0.00034) * 0.025;
    }

    canvas.style.opacity = scroll <= 1 ? "0" : "1";
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };

  resize();
  measureAnchors();
  Object.assign(current, poseAt(window.scrollY));
  stage.classList.add("is-ready");
  renderer.render(scene, camera);

  if (!reducedMotion.matches) frame = requestAnimationFrame(render);

  const refresh = () => {
    resize();
    measureAnchors();
    if (reducedMotion.matches) renderer.render(scene, camera);
  };
  window.addEventListener("resize", refresh, { passive: true });
  ScrollTrigger.addEventListener("refresh", measureAnchors);
  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;
    if (pageVisible && !frame && !reducedMotion.matches) {
      lastTime = performance.now();
      frame = requestAnimationFrame(render);
    } else if (!pageVisible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
}

function initHero(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".mc-hero");
  const media = root.querySelector<HTMLElement>(".mc-hero__media");
  const veil = root.querySelector<HTMLElement>(".mc-hero__veil");
  const footer = root.querySelector<HTMLElement>(".mc-hero__footer");
  const footerText = footer?.querySelector<HTMLElement>("p");
  const footerButton = footer?.querySelector<HTMLElement>(".mc-button--hero");
  const footerButtonWrap = footer?.querySelector<HTMLElement>(".mc-hero__cta-wrap");
  const eyebrow = root.querySelector<HTMLElement>(".mc-hero__eyebrow");
  const scrollCue = root.querySelector<HTMLElement>(".mc-hero__scroll");
  const titleLines = gsap.utils.toArray<HTMLElement>(".mc-hero__line", root);

  if (!hero || !media || !veil || !footer || !footerText || !footerButton || !footerButtonWrap || !eyebrow) return;

  const splits = titleLines.map((line) => new SplitText(line, { type: "chars,words", charsClass: "mc-title-char" }));
  const chars = splits.flatMap((split) => split.chars as HTMLElement[]);
  const footerSplit = new SplitText(footerText, {
    type: "lines",
    mask: "lines",
    linesClass: "mc-hero-copy-line",
  });
  const footerLines = footerSplit.lines as HTMLElement[];
  const footerMasks = footerSplit.masks as HTMLElement[];

  gsap.set(chars, { yPercent: 115, rotateX: -35, transformOrigin: "50% 100%" });
  gsap.set(titleLines, { overflow: "hidden" });
  gsap.set(footerLines, { yPercent: 115, opacity: 0 });
  gsap
    .timeline({ delay: reducedMotion.matches ? 0 : 0.08 })
    .to(chars, { yPercent: 0, rotateX: 0, duration: 1.25, stagger: 0.012, ease: "mc-out" })
    .fromTo(eyebrow, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: "mc-out" }, "-=0.72")
    .to(footerLines, { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.08, ease: "mc-out" }, "-=0.55")
    .fromTo(
      footerButton,
      { x: 32, opacity: 0, clipPath: "inset(0 0 0 100%)" },
      { x: 0, opacity: 1, clipPath: "inset(0 0 0 0%)", duration: 0.8, ease: "mc-out" },
      "-=0.7",
    );

  if (reducedMotion.matches || window.matchMedia("(max-width: 767px)").matches) return;

  const scrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=145%",
      pin: true,
      scrub: 0.85,
      anticipatePin: 1,
    },
  });

  scrollTimeline
    .to(media, { scale: 1.28, yPercent: 6, ease: "none" }, 0)
    .to(veil, { opacity: 0.45, ease: "none" }, 0)
    .to(titleLines[0], { xPercent: -10, ease: "none" }, 0)
    .to(titleLines[1], { xPercent: 13, ease: "none" }, 0)
    .to(titleLines[2], { xPercent: -7, ease: "none" }, 0)
    .fromTo(
      footerMasks,
      { yPercent: 0, opacity: 1 },
      { yPercent: -92, opacity: 0, duration: 0.4, stagger: 0.04, ease: "power2.inOut", immediateRender: false },
      0.18,
    )
    .fromTo(
      footerButtonWrap,
      { x: 0, y: 0, scale: 1, opacity: 1 },
      { x: 54, y: -12, scale: 0.94, opacity: 0, duration: 0.38, ease: "power2.inOut", immediateRender: false },
      0.22,
    )
    .fromTo(
      eyebrow,
      { y: 0, opacity: 1 },
      { y: -24, opacity: 0, duration: 0.36, ease: "power2.inOut", immediateRender: false },
      0.2,
    )
    .fromTo(
      scrollCue,
      { opacity: 1 },
      { opacity: 0, duration: 0.2, ease: "none", immediateRender: false },
      0.15,
    )
    .to(hero, { clipPath: "inset(0 3vw 3vw 3vw)", ease: "power2.inOut" }, 0.5);
}

function initProof(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>(".mc-proof__track");
  if (track && !reducedMotion.matches) {
    gsap.to(track, { xPercent: -50, duration: 18, repeat: -1, ease: "none" });
  }

  root.querySelectorAll<HTMLElement>("[data-count]").forEach((number) => {
    const target = Number(number.dataset.count ?? 0);
    const prefix = number.dataset.prefix ?? "";
    const value = { current: 0 };
    gsap.to(value, {
      current: target,
      duration: 1.7,
      ease: "power3.out",
      onUpdate: () => { number.textContent = `${prefix}${Math.round(value.current)}`; },
      scrollTrigger: { trigger: number, start: "top 88%", once: true },
    });
  });
}

function initIntro(root: HTMLElement) {
  const collage = root.querySelector<HTMLElement>("[data-collage]");
  if (!collage) return;

  const images = collage.querySelectorAll<HTMLElement>(".mc-collage-image");
  gsap.fromTo(
    images,
    { clipPath: "inset(100% 0 0 0)", y: 80 },
    {
      clipPath: "inset(0% 0 0 0)",
      y: 0,
      duration: 1.3,
      stagger: 0.14,
      ease: "mc-out",
      scrollTrigger: { trigger: collage, start: "top 78%", once: true },
    },
  );

  root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((item) => {
    if (reducedMotion.matches) return;
    const amount = Number(item.dataset.parallax ?? 0);
    gsap.to(item, {
      yPercent: amount,
      ease: "none",
      scrollTrigger: { trigger: collage, start: "top bottom", end: "bottom top", scrub: 0.9 },
    });
  });

  const heading = root.querySelector<HTMLElement>("[data-reveal-lines]");
  if (heading) {
    const split = new SplitText(heading, { type: "lines", linesClass: "mc-reveal-line" });
    gsap.from(split.lines, {
      yPercent: 110,
      opacity: 0,
      duration: 1.15,
      stagger: 0.09,
      ease: "mc-out",
      scrollTrigger: { trigger: heading, start: "top 82%", once: true },
    });
  }
}

function initManifesto(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".mc-manifesto");
  const title = root.querySelector<HTMLElement>("[data-velocity-title]");
  if (!section || !title) return;

  const split = new SplitText(title, { type: "words", wordsClass: "mc-manifesto-word" });
  gsap.from(split.words, {
    opacity: 0.12,
    yPercent: 45,
    stagger: 0.025,
    ease: "power2.out",
    scrollTrigger: { trigger: title, start: "top 85%", end: "bottom 52%", scrub: 0.5 },
  });

  if (!reducedMotion.matches) {
    const skewTo = gsap.quickTo(title, "skewY", { duration: 0.45, ease: "power3.out" });
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => skewTo(gsap.utils.clamp(-2.4, 2.4, self.getVelocity() / -1100)),
    });
  }
}

function initBenefits(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".mc-benefits");
  const sticky = root.querySelector<HTMLElement>(".mc-benefits__sticky");
  const progress = root.querySelector<HTMLElement>(".mc-benefits__progress span");
  const benefits = gsap.utils.toArray<HTMLElement>("[data-benefit]", root);
  if (!section || !sticky || !progress) return;

  gsap.to(progress, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: section, start: "top 60%", end: "bottom 60%", scrub: true },
  });

  benefits.forEach((benefit) => {
    gsap.from(benefit.querySelectorAll("h3, p, i"), {
      x: 50,
      opacity: 0,
      duration: 0.9,
      stagger: 0.06,
      ease: "mc-out",
      scrollTrigger: { trigger: benefit, start: "top 78%", once: true },
    });
  });

  ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 10%",
        end: "bottom 82%",
        pin: sticky,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    },
  });
}

function initConversion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".mc-conversion");
  const media = root.querySelector<HTMLElement>(".mc-conversion__media img");
  const title = root.querySelector<HTMLElement>("[data-conversion-title]");
  if (!section || !media || !title || reducedMotion.matches || window.matchMedia("(max-width: 767px)").matches) return;

  gsap
    .timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "+=110%", pin: true, scrub: 0.8, anticipatePin: 1 },
    })
    .fromTo(media, { scale: 1.35 }, { scale: 1, ease: "none" }, 0)
    .fromTo(title, { letterSpacing: "-0.09em", opacity: 0.3 }, { letterSpacing: "-0.045em", opacity: 1, ease: "none" }, 0)
    .fromTo(".mc-conversion__copy", { y: 100, opacity: 0 }, { y: 0, opacity: 1, ease: "power2.out" }, 0.28);
}

function initHorizontalSections(root: HTMLElement) {
  if (reducedMotion.matches) return;

  ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => {
      const configurations = [
        { viewport: ".mc-process__viewport", track: ".mc-process__track" },
        { viewport: ".mc-work__viewport", track: ".mc-work__track" },
      ];

      configurations.forEach(({ viewport, track }) => {
        const viewportElement = root.querySelector<HTMLElement>(viewport);
        const trackElement = root.querySelector<HTMLElement>(track);
        if (!viewportElement || !trackElement) return;

        const distance = () => Math.max(0, trackElement.scrollWidth - window.innerWidth + window.innerWidth * 0.06);
        gsap.to(trackElement, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: viewportElement,
            start: "center center",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.85,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    },
  });
}

function initTilt(root: HTMLElement) {
  if (!window.matchMedia("(pointer: fine)").matches || reducedMotion.matches) return;

  root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
    let frame = 0;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      gsap.to(card, {
        rotateX: targetY,
        rotateY: targetX,
        y: targetX || targetY ? -8 : 0,
        duration: 0.55,
        ease: "power3.out",
        transformPerspective: 1000,
      });
      frame = 0;
    };

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
      if (!frame) frame = requestAnimationFrame(render);
    });

    card.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = requestAnimationFrame(render);
    });
  });
}

function initAccordion(root: HTMLElement) {
  const items = root.querySelectorAll<HTMLDetailsElement>(".mc-accordion details");
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
      window.setTimeout(() => ScrollTrigger.refresh(), 520);
    });
  });
}

function initFinal(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".mc-final");
  const title = root.querySelector<HTMLElement>(".mc-final h2");
  const button = root.querySelector<HTMLElement>(".mc-button--final");
  if (!section || !title || !button) return;

  gsap.fromTo(
    title,
    { yPercent: 35, scale: 0.9, opacity: 0 },
    { yPercent: 0, scale: 1, opacity: 1, ease: "mc-out", scrollTrigger: { trigger: section, start: "top 80%", end: "center 50%", scrub: 0.6 } },
  );
  gsap.from(button, { y: 50, opacity: 0, duration: 0.9, ease: "mc-out", scrollTrigger: { trigger: button, start: "top 92%", once: true } });
}

async function initExperience(root: HTMLElement) {
  const logoReady = initScrollLogo(root);
  await Promise.all([initLoader(root), logoReady]);
  const lenis = reducedMotion.matches ? null : initLenis();

  initHeader(root, lenis);
  initCursor(root);
  initMagnetic(root);
  initScrollProgress(root);
  initHero(root);
  initProof(root);
  initIntro(root);
  initManifesto(root);
  initBenefits(root);
  initConversion(root);
  initHorizontalSections(root);
  initTilt(root);
  initAccordion(root);
  initFinal(root);

  await document.fonts.ready;
  ScrollTrigger.refresh();
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector<HTMLElement>("[data-experience]");
  if (root) {
    void initExperience(root);
  } else if (!reducedMotion.matches) {
    new Lenis({ autoRaf: true });
  }
});
