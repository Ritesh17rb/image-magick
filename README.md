# ImageMagick Effects Gallery

A curated set of procedural art effects created entirely with ImageMagick CLI pipelines. The repository includes a simple static gallery (`index.html`) that showcases each effect across a small set of input images.

## What’s in this repo

- `index.html` — static gallery UI that renders the effect grid.
- `script.js` — injects effect commands into the UI and powers the modal/copy actions.
- `images/` — original input images shown in the first row of the gallery.
- `output/` — generated results, grouped by effect.
  - `output/embroidery/`
  - `output/musuem_grade_textile/`
  - `output/oil_painting/`
  - `output/water_colour/`
  - `output/graffiti/`
- `output/*/*.txt` — the exact ImageMagick command sequences used to generate each effect.

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

### 3) Oil Painting

Command:

```bash
convert input.avif \
  -filter Lanczos -resize 2500x \
  \( +clone -paint 4 -blur 0x1 \) \
  \( +clone -paint 1 -selective-blur 0x3+10% \) \
  -compose Blend -define compose:args=50 -composite \
  \( +clone -colorspace gray -blur 0x2 -shade 135x40 -auto-level -sigmoidal-contrast 10x50% \) \
  -compose Overlay -composite \
  -modulate 100,145,100 -sharpen 0x2 \
  output.png
```

Step explanations:

- `-paint 4` and `-paint 1` simulate brush strokes at different sizes.
- `-selective-blur 0x3+10%` smooths small details while preserving edges.
- `-compose Blend -define compose:args=50` mixes the two paint layers evenly.
- `-colorspace gray -shade 135x40` creates a lighting map that mimics canvas relief.
- `-sigmoidal-contrast 10x50%` boosts midtones to make strokes pop.
- `-compose Overlay` combines the lighting map with the painted image.
- `-modulate 100,145,100` increases saturation for oil richness.
- `-sharpen 0x2` restores edge definition.

### 4) Water Colour

Command:

```bash
convert input.avif \
  -filter Lanczos -resize 2500x \
  \( +clone -median 8 -paint 2 -modulate 100,160,100 \) \
  \( +clone -colorspace gray -edge 1 -negate -median 2 -level 10%,90% \) \
  -compose Multiply -define compose:args=35 -composite \
  \( -size 2500x2500 canvas:white +noise Gaussian -colorspace gray -virtual-pixel tile -blur 0x1 -shade 120x45 -auto-level \) \
  -compose SoftLight -composite \
  -unsharp 0x3+1.5+0.02 -contrast-stretch 1%x1% \
  output.png
```

Step explanations:

- `-median 8` smooths textures into watercolor blotches.
- `-paint 2` simulates wash strokes.
- `-modulate 100,160,100` boosts saturation slightly for pigment.
- `-edge 1 -negate` extracts dark linework; `-median 2` softens it.
- `-level 10%,90%` strengthens the edge layer.
- `-compose Multiply` merges edges at 35% to simulate ink bleed.
- `+noise Gaussian` builds a paper grain texture.
- `-shade 120x45` adds subtle paper lighting.
- `-compose SoftLight` mixes the paper texture into the image.
- `-unsharp` and `-contrast-stretch` finalize sharpness and contrast.

### 5) Graffiti Wall

Command:

```bash
convert input.avif \
  -filter Lanczos -resize 2500x -modulate 100,150,100 \
  \( -size 2500x2500 pattern:bricks -colorspace gray -blur 0x2 -shade 120x45 -auto-level \) \
  -compose Overlay -composite \
  output.png
```

Step explanations:

- `-modulate 100,150,100` increases saturation for punchy spray paint.
- `pattern:bricks` creates a brick wall texture.
- `-shade 120x45` simulates light on the wall’s surface.
- `-compose Overlay` blends graffiti colors with the wall texture.

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
