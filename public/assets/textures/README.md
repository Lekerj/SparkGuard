# Earth Textures for SparkGuard Globe

Place these texture files here for local rendering (no external tile APIs):

## Required files

1. **earth-blue-marble.jpg** — NASA Blue Marble day-map (2K–4K recommended)
2. **earth-topology.png** — Bump/elevation map (optional but recommended)
3. **night-sky.png** — Star field background

## Free sources (public domain / open license)

- **NASA Visible Earth (Blue Marble)**:
  https://visibleearth.nasa.gov/collection/1484/blue-marble
  Direct 2K: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_shallow_topo_2048.jpg

- **three-globe example assets** (MIT license, already bundled in npm):
  ```
  curl -o earth-blue-marble.jpg "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
  curl -o earth-topology.png "https://unpkg.com/three-globe/example/img/earth-topology.png"
  curl -o night-sky.png "https://unpkg.com/three-globe/example/img/night-sky.png"
  ```

If these files are missing, the app falls back to loading from unpkg.com CDN
(still no API key required).
