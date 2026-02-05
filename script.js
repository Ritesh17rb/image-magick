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
\\( +clone -colors 48 +dither -write mpr:color_anchor +delete \\) \\
-colorspace Gray \\
\\( +clone -motion-blur 0x1.5+90 -motion-blur 0x1.5+0 \\) -compose blend -define compose:args=40 -composite \\
-spread 0.8 \\
\\( +clone +noise Multiplicative -level 20%,80% -sharpen 0x1 \\) -compose SoftLight -define compose:args=40 -composite \\
\\( +clone -tile pattern:crosshatch -draw "color 0,0 reset" -negate -blur 0x1 -level 35%,65% \\) \\
-compose Overlay -define compose:args=30 -composite \\
\\( +clone -blur 0x2 -shade 135x35 -auto-level -sigmoidal-contrast 8x50% \\) \\
-compose HardLight -define compose:args=50 -composite \\
mpr:color_anchor -compose Colorize -composite \\
-unsharp 0x3+1.5+0.02 \\
-modulate 100,130,100 \\
-contrast-stretch 0.5%x0.5% \\
output.png`,

  musuem: `convert input.avif -filter Lanczos -resize 2500x \\
    \\( +clone -colors 42 +dither -write mpr:source +delete \\) \\
    \\( -size 2500x2500 xc:grey +noise Random \\
       -virtual-pixel tile -motion-blur 0x15+90 -charcoal 1 -blur 0x1 \\
       -write mpr:warp_v +delete \\) \\
    \\( -size 2500x2500 xc:grey +noise Random \\
       -virtual-pixel tile -motion-blur 0x15+0 -charcoal 1 -blur 0x1 \\
       -write mpr:warp_h +delete \\) \\
    mpr:source \\
    \\( mpr:warp_v mpr:warp_h -compose HardLight -composite -write mpr:fabric_texture \\) \\
    -compose SoftLight -composite \\
    \\( mpr:fabric_texture -shade 135x45 -auto-level -function polynomial 3.5,-2.5,0.5 \\) \\
    -compose Overlay -define compose:args=60 -composite \\
    -unsharp 0x2+1.5+0.05 \\
    -modulate 100,125,100 \\
    -contrast-stretch 0.5%x0.5% \\
    output.png`,

  oil: `convert input.avif \\
-filter Lanczos -resize 2500x \\
\\( +clone -paint 4 -blur 0x1 \\) \\
\\( +clone -paint 1 -selective-blur 0x3+10% \\) \\
-compose Blend -define compose:args=50 -composite \\
\\( +clone -colorspace gray -blur 0x2 -shade 135x40 -auto-level -sigmoidal-contrast 10x50% \\) \\
-compose Overlay -composite \\
-modulate 100,145,100 -sharpen 0x2 \\
output.png`,

  water: `convert input.avif \\
-filter Lanczos -resize 2500x \\
\\( +clone -median 8 -paint 2 -modulate 100,160,100 \\) \\
\\( +clone -colorspace gray -edge 1 -negate -median 2 -level 10%,90% \\) \\
-compose Multiply -define compose:args=35 -composite \\
\\( -size 2500x2500 canvas:white +noise Gaussian -colorspace gray -virtual-pixel tile -blur 0x1 -shade 120x45 -auto-level \\) \\
-compose SoftLight -composite \\
-unsharp 0x3+1.5+0.02 -contrast-stretch 1%x1% \\
output.png`,

  graffiti: `convert photo.avif \\
-filter Lanczos -resize 2500x -modulate 100,150,100 \\
\\( -size 2500x2500 pattern:bricks -colorspace gray -blur 0x2 -shade 120x45 -auto-level \\) \\
-compose Overlay -composite \\
output_graffiti_wall.png`
};

document.querySelectorAll('[data-command-type]').forEach(el => {
  const type = el.dataset.commandType;
  if (commands[type]) {
    el.innerText = commands[type];
  }
});
