import * as gfx from './GopherGfx/GopherGfx'

export class RaycastApp extends gfx.GraphicsApp
{
    private ground: gfx.PlaneMesh;
    private sky: gfx.SphereMesh;

    private box: gfx.BoxMesh;
    private sphere: gfx.SphereMesh;
    private line: gfx.BoxMesh;
    private marker: gfx.SphereMesh;

    constructor()
    {
        super();

        this.ground = new gfx.PlaneMesh(1000, 1000);
        this.sky = new gfx.SphereMesh(500);

        this.box = new gfx.BoxMesh();
        this.sphere = new gfx.SphereMesh(0.5);
        this.line = new gfx.BoxMesh(0.01, 0.01, 100);
        this.marker = new gfx.SphereMesh(0.1);
    }

    createScene(): void 
    {
        this.camera = new gfx.OrbitCamera(5, 60, 1920/1080, 0.1, 1000);

        const ambientLight = new gfx.AmbientLight(new gfx.Color3(0.5, 0.5, 0.5));
        this.scene.add(ambientLight);

        const directionaLight = new gfx.DirectionalLight(new gfx.Color3(.6, .6 , .6));
        directionaLight.position.set(10, 0, 0)
        this.scene.add(directionaLight);

        const groundMaterial = new gfx.GouraudMaterial();
        groundMaterial.ambientColor.set(.425, .90, .555);
        this.ground.material = groundMaterial;
        this.ground.position.set(0, -1, 0);
        this.ground.rotation.setEulerAngles(0, Math.PI / 2, 0);
        this.scene.add(this.ground);

        const skyMaterial = new gfx.UnlitMaterial();
        skyMaterial.side = gfx.Side.BACK;
        skyMaterial.color.set(.529, .807, .921);
        this.sky.material = skyMaterial;
        this.scene.add(this.sky);

        const testMaterial = new gfx.GouraudMaterial();
        testMaterial.ambientColor.set(0, 0, 1);
        testMaterial.specularColor.set(1, 1, 1);

        this.box.material = testMaterial;
        this.box.translateX(-2);
        this.box.rotation.setEulerAngles(Math.PI, 0, 0);
        this.scene.add(this.box);

        this.sphere.material = testMaterial;
        this.sphere.translateX(2);
        this.scene.add(this.sphere);

        const lineMaterial = new gfx.UnlitMaterial();
        lineMaterial.color.set(1, 0, 1);
        this.line.material = lineMaterial;
        this.line.visible = false;
        this.scene.add(this.line);

        const markerMaterial = new gfx.GouraudMaterial();
        markerMaterial.ambientColor.set(1, 0, 0);
        markerMaterial.diffuseColor.set(1, 0, 0);
        this.marker.material = markerMaterial;
        this.marker.visible = false;
        this.scene.add(this.marker);
    }

    update(deltaTime: number): void 
    {
        
    }

    onMouseDown(event: MouseEvent): void 
    {
        const deviceCoords = this.renderer.getNormalizedDeviceCoordinates(event.x, event.y);
        const raycaster = new gfx.Raycaster();
        raycaster.setPickRay(deviceCoords, this.camera);

        this.line.visible = true;
        this.line.position.copy(raycaster.ray.origin);
        this.line.lookAt(gfx.Vector3.add(raycaster.ray.origin, raycaster.ray.direction));
        this.line.translateZ(this.line.depth / -2 + -1);

        this.marker.visible = false;

        // Ray cast to the sphere
        const sphere = new gfx.Sphere(this.sphere.position, this.sphere.radius);
        const sphereIntersection = raycaster.intersectsSphere(sphere)
        if(sphereIntersection)
        {
            this.marker.position.copy(sphereIntersection);
            this.marker.visible = true;
            return;
        }

        // Compute bounding volume
        // Note that this is not axis-aligned so it will only work correctly
        // if the cube has not been rotated or scaled.
        const boxMin = this.box.position.clone();
        boxMin.x -= this.box.width / 2;
        boxMin.y -= this.box.height / 2;
        boxMin.z -= this.box.depth / 2;

        const boxMax = this.box.position.clone();
        boxMax.x += this.box.width / 2;
        boxMax.y += this.box.height / 2;
        boxMax.z += this.box.depth / 2;

        // Ray cast to the box
        const box = new gfx.Box(boxMin, boxMax);
        const boxIntersection = raycaster.intersectsBox(box)
        if(boxIntersection)
        {
            this.marker.position.copy(boxIntersection);
            this.marker.visible = true;
            return;
        }

        // Ray cast to the ground plane
        const plane = new gfx.Plane(this.ground.position, gfx.Vector3.UP);
        const planeIntersection = raycaster.intersectsPlane(plane);
        if(planeIntersection)
        {
            this.marker.position.copy(planeIntersection);
            this.marker.visible = true;
            return;
        }
    }
}