# ImageMagick Effects Gallery

A curated collection of **7 procedural art effects** created entirely with ImageMagick CLI pipelines. The repository includes a static gallery (`index.html`) that showcases each effect across four input images, plus a comprehensive test suite documenting 100+ iterations of 10 additional experimental effects.

## What's in this repo

- `index.html` — static gallery UI that renders the effect grid with 7 different artistic styles.
- `script.js` — injects effect commands into the UI and powers the modal/copy actions.
- `images/` — original input images shown in the first row of the gallery (chart, comic, art, portrait).
- `output/` — generated results, grouped by effect (7 effects total).
  - `output/embroidery/` — Textile embroidery with thread texture
  - `output/musuem_grade_textile/` — Museum-quality woven fabric
  - `output/pencil_sketch/` — **NEW** Graphite pencil drawing
  - `output/chalk_drawing/` — **NEW** Chalk on blackboard
  - `output/mosaic_new/` — **NEW** Pixelated tile mosaic
  - `output/impressionist/` — **NEW** Impressionist painting style
  - `output/metal_engraving/` — **NEW** Engraved metal plate
- `test/` — experimental effect iterations (10 effects × 10 iterations each = 100 images).
  - Contains detailed command logs and feedback for: Pencil Sketch, Chalk Drawing, Stained Glass, Mosaic, Pointillism, Impressionist, Screen Print, Woodblock, Fabric Texture, Metal Engraving
  - `test/SUMMARY.md` — Overview of test effects and methodology
  - `test/FEEDBACK_MECHANISM.md` — Iterative improvement process documentation
- `NEW_EFFECTS_SUMMARY.md` — Documentation for the 5 newly added gallery effects.

## Beginner setup

1. Install ImageMagick.
   - Linux (Debian/Ubuntu): `sudo apt-get install imagemagick`
   - macOS (Homebrew): `brew install imagemagick`
   - Windows: download the installer from ImageMagick’s site.
2. Verify it works:
   - ImageMagick 6: `convert -version`
   - ImageMagick 7+: `magick -version`
3. Pick any command below and replace `input.avif` with your own file.
4. Run the command in a terminal from the project root.

### ImageMagick 7+ note

If your system uses ImageMagick 7+, replace `convert` with `magick`:

```bash
magick input.avif ... output.png
```

## Shared conventions used in commands

- `-filter Lanczos -resize 2500x` — upscales the input to a consistent width using a high-quality filter. If your input is already large, you can lower the size.
- `\( ... \)` — ImageMagick “sub-expression” grouping. It lets the command create intermediate images and combine them later.
- `+clone` — duplicates the current image so you can process it separately.
- `-compose <mode> -composite` — blends two image layers using the chosen blending mode.
- `mpr:<name>` — in-memory register (temporary image) you can write to and reuse later in the command.

## Effect pipelines (with explanations)

All commands below are the same as the ones in `output/*/*.txt`, with comments that explain each step. You can copy/paste them directly.

### 1) Embroidery

Command:

```bash
convert input.avif \
  -filter Lanczos -resize 2500x \
  \( +clone -colors 48 +dither -write mpr:color_anchor +delete \) \
  -colorspace Gray \
  \( +clone -motion-blur 0x1.5+90 -motion-blur 0x1.5+0 \) -compose blend -define compose:args=40 -composite \
  -spread 0.8 \
  \( +clone +noise Multiplicative -level 20%,80% -sharpen 0x1 \) -compose SoftLight -define compose:args=40 -composite \
  \( +clone -tile pattern:crosshatch -draw "color 0,0 reset" -negate -blur 0x1 -level 35%,65% \) \
  -compose Overlay -define compose:args=30 -composite \
  \( +clone -blur 0x2 -shade 135x35 -auto-level -sigmoidal-contrast 8x50% \) \
  -compose HardLight -define compose:args=50 -composite \
  mpr:color_anchor -compose Colorize -composite \
  -unsharp 0x3+1.5+0.02 \
  -modulate 100,130,100 \
  -contrast-stretch 0.5%x0.5% \
  output.png
```

Step explanations:

- `-colors 48 +dither` reduces the palette to create a stitched, thread-like flatness.
- `-write mpr:color_anchor` stores a simplified color palette to reapply later.
- `-colorspace Gray` converts the working image to grayscale for texture building.
- `-motion-blur` at 90 and 0 degrees creates directional thread streaks.
- `-compose blend -define compose:args=40` mixes the base with the blur at 40%.
- `-spread 0.8` adds small random pixel offsets, like loose fibers.
- `+noise Multiplicative` adds fabric grain.
- `-level 20%,80%` increases contrast by clipping extremes.
- `-tile pattern:crosshatch` overlays a crosshatch fabric pattern.
- `-compose Overlay` fuses the fabric texture with the base image.
- `-shade 135x35` simulates lighting across the fabric surface.
- `-sigmoidal-contrast 8x50%` boosts midtone contrast for thread depth.
- `-compose Colorize` applies the stored palette back onto the grayscale texture.
- `-unsharp` and `-modulate` sharpen and slightly boost saturation.
- `-contrast-stretch 0.5%x0.5%` final contrast normalization.

### 2) Museum Grade Textile

Command:

```bash
convert input.avif -filter Lanczos -resize 2500x \
  \( +clone -colors 42 +dither -write mpr:source +delete \) \
  \( -size 2500x2500 xc:grey +noise Random \
     -virtual-pixel tile -motion-blur 0x15+90 -charcoal 1 -blur 0x1 \
     -write mpr:warp_v +delete \) \
  \( -size 2500x2500 xc:grey +noise Random \
     -virtual-pixel tile -motion-blur 0x15+0 -charcoal 1 -blur 0x1 \
     -write mpr:warp_h +delete \) \
  mpr:source \
  \( mpr:warp_v mpr:warp_h -compose HardLight -composite -write mpr:fabric_texture \) \
  -compose SoftLight -composite \
  \( mpr:fabric_texture -shade 135x45 -auto-level -function polynomial 3.5,-2.5,0.5 \) \
  -compose Overlay -define compose:args=60 -composite \
  -unsharp 0x2+1.5+0.05 \
  -modulate 100,125,100 \
  -contrast-stretch 0.5%x0.5% \
  output.png
```

Step explanations:

- `-colors 42 +dither` reduces the palette for a woven, printed feel.
- `-size 2500x2500 xc:grey +noise Random` builds a noise canvas used for fabric warp.
- `-virtual-pixel tile` repeats the noise pattern seamlessly.
- `-motion-blur 0x15+90` and `0x15+0` create vertical and horizontal weave streaks.
- `-charcoal 1` enhances edges in the fabric texture.
- `-blur 0x1` softens harsh noise.
- `-compose HardLight` combines the vertical and horizontal weave textures.
- `-compose SoftLight` applies the fabric weave to the image.
- `-shade 135x45` simulates directional lighting on threads.
- `-function polynomial 3.5,-2.5,0.5` shapes tonal response for a cloth-like look.
- `-compose Overlay -define compose:args=60` boosts texture without destroying colors.
- `-unsharp`, `-modulate`, `-contrast-stretch` refine clarity and color balance.

### 3) Pencil Sketch

**Two variants optimized for different content types:**

**For Photos/Artwork:**
```bash
convert input.avif \
  -colorspace Gray \
  -sketch 0x15+100 \
  -brightness-contrast -5x15 \
  \( +clone -blur 0x2 \) \
  -compose multiply -composite \
  -level 8%,92% \
  -unsharp 0x0.8 \
  output_pencil.avif
```

**For Charts/Diagrams (better edge preservation):**
```bash
convert input.avif \
  -colorspace Gray \
  -edge 1 \
  -negate \
  -blur 0x0.5 \
  -level 15%,85% \
  -unsharp 0x2 \
  output_pencil.avif
```

Step explanations:
- `-sketch` creates pencil-like strokes with randomized texture.
- `-compose multiply` with blurred clone adds shading depth.
- `-level` adjusts tonal range to reduce whiteness.
- For charts, `-edge` preserves sharp lines and text better than sketch filter.

### 4) Chalk Drawing

Command:

```bash
convert input.avif \
  -colorspace Gray \
  -negate \
  -blur 0x1 \
  -edge 2 \
  output_chalk.avif
```

Step explanations:
- `-negate` creates the blackboard effect (inverted colors).
- `-blur 0x1` softens for chalk-like texture.
- `-edge 2` defines chalk stroke edges.

### 5) Mosaic

Command:

```bash
convert input.avif \
  -scale 10% \
  -scale 1000% \
  output_mosaic.avif
```

Step explanations:
- `-scale 10%` downsamples to create large pixels/tiles.
- `-scale 1000%` upscales without interpolation for blocky mosaic effect.
- Simple but effective pixelation creates tile appearance.

### 6) Impressionist

Command:

```bash
convert input.avif \
  -paint 5 \
  -modulate 100,110,100 \
  output_impressionist.avif
```

Step explanations:
- `-paint 5` simulates oil brush strokes with radius 5 pixels.
- `-modulate 100,110,100` boosts saturation by 10% for painterly vibrancy.

### 7) Metal Engraving

Command:

```bash
convert input.avif \
  -colorspace Gray \
  -shade 120x45 \
  -normalize \
  output_metal.avif
```

Step explanations:
- `-colorspace Gray` converts to grayscale for metallic appearance.
- `-shade 120x45` applies directional lighting (azimuth 120°, elevation 45°).
- `-normalize` stretches contrast for metallic sheen effect.

---

## Output naming

Each effect directory contains four outputs corresponding to the gallery’s input images:

- `chart2_*.avif`
- `comic1_*.avif`
- `mona_*.avif`
- `photo2_*.avif`

The gallery references these files directly, so if you change filenames, update `index.html` to match.

## Troubleshooting

- If commands fail, verify ImageMagick is installed and supports the options used.
- If the gallery shows broken images, confirm the file paths in `index.html` match the files under `output/`.
