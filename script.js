// Handle copy button clicks
const toastEl = document.getElementById('copyToast');
const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastEl);

// Handle copy button clicks
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;

  const container = btn.parentElement;
  const textDiv = container.querySelector('[data-command-type]') || container.querySelector('.small.text-body-secondary');

  if (!textDiv) return;

  const textToCopy = textDiv.innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    // Show toast
    toastBootstrap.show();
  });
});

// Category filtering logic removed as we display all categories in columns now.

// Modal Image Loader
const imageModal = document.getElementById('imageModal');
if (imageModal) {
  imageModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    // Logic: Try 'src' (image tag), then 'data-src' (button).
    const src = button.getAttribute('src') || button.getAttribute('data-src');
    const alt = button.getAttribute('alt');

    const modalImage = imageModal.querySelector('#imageModalImg');
    const modalTitle = imageModal.querySelector('.modal-title');

    if (src) {
      console.log("Loading image:", src);
      modalImage.src = src;
      modalImage.style.display = 'block';
    } else {
      console.error("No source found for modal image");
    }

    modalImage.alt = alt || '';
    if (modalTitle) {
      modalTitle.textContent = alt || 'Image';
    }
  });
}

// Inject Commands
const commands = {
  embroidery: `convert input.avif \\
-filter Lanczos -resize 2500x \\
\\( +clone -colors 68 +dither -write mpr:color_anchor +delete \\) \\
-colorspace Gray \\
\\( +clone -motion-blur 0x1.45+90 -motion-blur 0x1.45+0 \\) \\
-compose blend -define compose:args=39 -composite \\
-spread 0.85 \\
\\( +clone +noise Multiplicative -level 21%,79% -sharpen 0x1.05 \\) \\
-compose SoftLight -define compose:args=39 -composite \\
\\( +clone -tile pattern:crosshatch -draw "color 0,0 reset" -negate -blur 0x1.05 -level 34%,66% \\) \\
-compose Overlay -define compose:args=29 -composite \\
\\( +clone -blur 0x2.2 -shade 131x39 -auto-level -sigmoidal-contrast 7.8x50% \\) \\
-compose HardLight -define compose:args=49 -composite \\
mpr:color_anchor -compose Colorize -composite \\
-unsharp 0x2.9+1.5+0.02 \\
-modulate 100,130,100 \\
-gamma 0.80 \\
-level 5%,95% \\
-contrast-stretch 0.36%x0.36% \\
output.avif`,

  musuem: `convert input.avif \\
-filter Lanczos -resize 2500x \\
\\( +clone -colors 54 +dither -write mpr:source +delete \\) \\
\\( -size 2500x2500 xc:grey +noise Random -virtual-pixel tile -motion-blur 0x18+90 -charcoal 0.8 -blur 0x0.8 -write mpr:warp_v +delete \\) \\
\\( -size 2500x2500 xc:grey +noise Random -virtual-pixel tile -motion-blur 0x18+0 -charcoal 0.8 -blur 0x0.8 -write mpr:warp_h +delete \\) \\
mpr:source \\
\\( mpr:warp_v mpr:warp_h -compose HardLight -composite -write mpr:fabric_texture \\) \\
-compose SoftLight -define compose:args=55 -composite \\
\\( mpr:fabric_texture -shade 130x48 -auto-level -function polynomial 3.8,-2.8,0.6 \\) \\
-compose Overlay -define compose:args=65 -composite \\
-unsharp 0x2.5+1.8+0.04 \\
-modulate 100,132,100 \\
-gamma 0.81 \\
-contrast-stretch 0.4%x0.4% \\
output.avif`,

  oil: `convert input.avif \\
-filter Lanczos -resize 2500x \\
\\( +clone -paint 8 -blur 0x1 \\) \\
\\( +clone -paint 4 -blur 0x0.5 \\) \\
\\( +clone -paint 2 \\) \\
-compose Blend -define compose:args=40,30 -composite \\
\\( +clone -spread 1 -blur 0x0.5 \\) \\
-compose Blend -define compose:args=70 -composite \\
\\( +clone -colorspace gray -blur 0x2 -shade 135x45 -auto-level -sigmoidal-contrast 10x50% \\) \\
-compose Overlay -define compose:args=45 -composite \\
-modulate 100,148,100 \\
-sharpen 0x1.8 \\
output.avif`,

  water: `convert input.avif \\
-filter Lanczos -resize 2500x \\
\\( +clone -median 10 -paint 3 -modulate 100,165,100 \\) \\
\\( +clone -colorspace gray -edge 1.2 -negate -median 2.5 -level 8%,92% \\) \\
-compose Multiply -define compose:args=30 -composite \\
\\( -size 2500x2500 canvas:white +noise Gaussian -colorspace gray -blur 0x0.8 -shade 118x46 -auto-level \\) \\
-compose SoftLight -composite \\
-unsharp 0x3.5+1.8+0.018 \\
-gamma 0.83 \\
-contrast-stretch 0.7%x0.7% \\
output.avif`,

  graffiti: `convert input.avif \\
-filter Lanczos -resize 2500x -modulate 100,150,100 \\
\\( -size 2500x2500 pattern:bricks -colorspace gray -blur 0x2 -shade 120x45 -auto-level \\) \\
-compose Overlay -composite \\
output_graffiti_wall.avif`,

  pencil_sketch: `convert input.avif \\
-colorspace Gray \\
-sketch 0x15+100 \\
-brightness-contrast -5x15 \\
\\( +clone -blur 0x2 \\) \\
-compose multiply -composite \\
-level 8%,92% \\
-unsharp 0x0.8 \\
output_pencil.avif`,

  chalk_drawing: `convert input.avif \\
-colorspace Gray \\
-negate \\
-blur 0x1 \\
-edge 2 \\
output_chalk.avif`,

  mosaic: `convert input.avif \\
-scale 10% \\
-scale 1000% \\
output_mosaic.avif`,

  impressionist: `convert input.avif \\
-paint 5 \\
-modulate 100,110,100 \\
output_impressionist.avif`,

  metal_engraving: `convert input.avif \\
-colorspace Gray \\
-shade 120x45 \\
-normalize \\
output_metal.avif`
};

document.querySelectorAll('[data-command-type]').forEach(el => {
  const type = el.dataset.commandType;
  if (commands[type]) {
    el.innerText = commands[type];
  }
});
