import { inject, observable } from 'aurelia-framework';
import * as THREE from 'three';
import { OrbitControls } from '../components/OrbitControls2';

export class TumorGrowth {
    @observable currentStep;

    constructor() {
        this.initialSize = 10;
        this.growthRate = 0.1;
        this.carryingCapacity = 1000;
        this.timeSteps = 100;
        this.currentStep = 0;
        this.simulationData = [];
        this.isPlaying = false;
        this.canvasId = 'growthChart';
    }

    attached() {
        this.setupScene();
        this.calculateGrowth();
        this.drawChart();
        this.animate();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    detached() {
        // Cleanup
        window.removeEventListener('resize', this.onResize.bind(this));
        if (this.renderer !== undefined && this.renderer !== null) {
            this.renderer.dispose();
        }
        if (this.intervalId !== undefined && this.intervalId !== null) clearInterval(this.intervalId);
    }

    onResize() {
        if (this.camera !== undefined && this.camera !== null && this.rendererContainer !== undefined && this.rendererContainer !== null) {
            const w = this.rendererContainer.clientWidth;
            const h = this.rendererContainer.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }
        this.drawChart();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        const w = this.rendererContainer.clientWidth;
        const h = this.rendererContainer.clientHeight;

        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        this.camera.position.set(0, 0, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(w, h);
        this.rendererContainer.appendChild(this.renderer.domElement);

        // Initial sphere
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        // Red color for tumor, looking organic
        const material = new THREE.MeshPhongMaterial({
            color: 0x880000,
            shininess: 100,
            specular: 0x222222,
            transparent: true,
            opacity: 0.9
        });
        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);

        // Wireframe for context (e.g. max size)
        const maxGeo = new THREE.SphereGeometry(20, 16, 16); // Arbitrary sizing relative to carrying capacity visual
        const maxMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.3 });
        this.maxSphere = new THREE.Mesh(maxGeo, maxMat);
        // this.scene.add(this.maxSphere); // Optional

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);

        const d2 = new THREE.DirectionalLight(0xffffff, 0.5);
        d2.position.set(-50, 20, 10);
        this.scene.add(d2);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
    }

    calculateGrowth() {
        this.simulationData = [];
        let size = parseFloat(this.initialSize);
        const K = parseFloat(this.carryingCapacity);
        const r = parseFloat(this.growthRate);

        // Gompertz Model: N(t) = K * exp(ln(N0/K) * exp(-r*t))
        // Or simpler Logistic: dN/dt = rN(1 - N/K)
        // Let's use Logistic for simplicity in discrete steps

        // Using analytical solution for Logistic Growth:
        // N(t) = K / (1 + ((K - N0) / N0) * exp(-r * t))

        const N0 = size;

        for (let t = 0; t <= this.timeSteps; t++) {
            let val = K / (1 + ((K - N0) / N0) * Math.exp(-r * t));
            this.simulationData.push({ t, size: val });
        }

        this.updateVisualization();
    }

    currentStepChanged() {
        this.updateVisualization();
    }

    updateVisualization() {
        if (this.sphere === undefined || this.sphere === null || this.simulationData[this.currentStep] === undefined || this.simulationData[this.currentStep] === null) return;

        const currentSize = this.simulationData[this.currentStep].size;
        const K = parseFloat(this.carryingCapacity);

        // Map size to 3D scale. 
        // Assume K corresponds to a radius of, say, 25 world units.
        // Volume ~ radius^3. So radius ~ cbrt(size).
        // Scale factor = radius / original_radius(1)

        const maxRadius = 25;
        const radius = maxRadius * Math.pow(currentSize / K, 1 / 3); // Relative to K

        // Ensure it doesn't disappear if very small
        const safeRadius = Math.max(0.1, radius);

        this.sphere.scale.set(safeRadius, safeRadius, safeRadius);
        this.currentSizeDisplay = currentSize.toFixed(2);

        this.drawChart(); // Redraw chart to show timeline indicator
    }

    drawChart() {
        const canvas = document.getElementById(this.canvasId);
        if (canvas === undefined || canvas === null) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Background grid
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        for (let i = 0; i < w; i += w / 10) { ctx.moveTo(i, 0); ctx.lineTo(i, h); }
        for (let i = 0; i < h; i += h / 5) { ctx.moveTo(0, i); ctx.lineTo(w, i); }
        ctx.stroke();

        if (this.simulationData.length === 0) return;

        const K = parseFloat(this.carryingCapacity);

        // Plot curve
        ctx.beginPath();
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;

        const maxT = this.timeSteps;

        this.simulationData.forEach((pt, i) => {
            const x = (pt.t / maxT) * w;
            const y = h - (pt.size / K) * h * 0.9 - 10; // Margin
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw indicator for current step
        const cx = (this.currentStep / maxT) * w;
        ctx.beginPath();
        ctx.strokeStyle = '#FF0000';
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();
    }

    play() {
        if (this.isPlaying) {
            this.isPlaying = false;
            clearInterval(this.intervalId);
            return;
        }

        this.isPlaying = true;
        this.intervalId = setInterval(() => {
            if (this.currentStep < this.timeSteps) {
                this.currentStep++; // This triggers changed handler
            } else {
                this.isPlaying = false;
                clearInterval(this.intervalId);
            }
        }, 100);
    }

    animate() {
        if (this.renderer && this.scene && this.camera) {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }
        requestAnimationFrame(this.animate.bind(this));
    }
}
