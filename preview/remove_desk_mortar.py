"""One-off: paint the stone mortar + pestle out of the player desk art.

Canvas size and every pixel outside the mortar mask are preserved exactly, so
the calibrated Discovery Log book hotspot cannot move.
"""

from PIL import Image, ImageDraw, ImageFilter, ImageStat

SRC = 'assets/scene/player_desk.png'
OUT = 'preview/player_desk_nomortar.png'


def build_mask(size):
    """Silhouette of the mortar bowl + pestle, generously padded."""
    mask = Image.new('L', size, 0)
    d = ImageDraw.Draw(mask)
    # Bowl body (runs off the left edge of the canvas)
    d.ellipse([-70, 316, 258, 600], fill=255)
    # Bowl rim, slightly wider than the body
    d.ellipse([-60, 318, 254, 436], fill=255)
    # Pestle shaft — leans further left than the bowl centre
    d.line([(156, 252), (96, 400)], fill=255, width=88)
    d.line([(190, 268), (100, 440)], fill=255, width=76)
    # Pestle knob
    d.ellipse([104, 206, 200, 300], fill=255)
    d.ellipse([148, 236, 228, 316], fill=255)
    # Grow past the painted edges so no rim halo survives.
    mask = mask.filter(ImageFilter.MaxFilter(13))

    # Props painted in FRONT of the mortar must survive untouched.
    keep = Image.new('L', size, 0)
    kd = ImageDraw.Draw(keep)
    kd.rounded_rectangle([166, 450, 272, 700], radius=22, fill=255)  # tagged bottle
    kd.ellipse([-30, 562, 176, 700], fill=255)                       # small leaf bowl
    keep = keep.filter(ImageFilter.GaussianBlur(4))

    from PIL import ImageChops
    return ImageChops.subtract(mask, keep)


def build_fill(orig):
    """Foliage cloned from elsewhere in the same painting."""
    W, H = orig.size
    fill = orig.copy()

    # Upper band: mirrored ivy-over-wood from the right edge (symmetric light).
    upper = orig.crop((1280, 190, 1536, 650)).transpose(Image.FLIP_LEFT_RIGHT)
    fill.paste(upper, (0, 200))

    # Lower band: ground-cover foliage from below the desk props.
    lower = orig.crop((0, 690, 320, 1024))
    lower_layer = fill.copy()
    lower_layer.paste(lower, (0, 300))

    # Vertical crossfade from the ivy band into the ground cover.
    ramp = Image.new('L', (W, H), 0)
    rd = ImageDraw.Draw(ramp)
    top, bottom = 350, 470
    for y in range(H):
        if y <= top:
            v = 0
        elif y >= bottom:
            v = 255
        else:
            v = round(255 * (y - top) / (bottom - top))
        rd.line([(0, y), (W, y)], fill=v)
    fill = Image.composite(lower_layer, fill, ramp)

    # Break up any cloned repetition with a second, offset foliage pass.
    accent = orig.crop((0, 60, 96, 300)).resize((150, 300), Image.Resampling.LANCZOS)
    accent_layer = fill.copy()
    accent_layer.paste(accent, (60, 250))
    blotch = Image.new('L', (W, H), 0)
    ImageDraw.Draw(blotch).ellipse([70, 265, 210, 470], fill=150)
    blotch = blotch.filter(ImageFilter.GaussianBlur(28))
    fill = Image.composite(accent_layer, fill, blotch)

    return fill


def match_levels(fill, orig, mask):
    """Shift the fill so its tone matches the paint immediately around the mask."""
    grown = mask.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
    ring = Image.new('L', mask.size, 0)
    ring.paste(grown, (0, 0))
    ring = ImageChops_subtract(ring, mask)

    dst_stat = ImageStat.Stat(orig, ring)
    src_stat = ImageStat.Stat(fill, ring)
    bands = []
    for i, band in enumerate(fill.split()):
        d_mean, s_mean = dst_stat.mean[i], src_stat.mean[i]
        d_std = max(dst_stat.stddev[i], 1e-3)
        s_std = max(src_stat.stddev[i], 1e-3)
        gain = min(max(d_std / s_std, 0.75), 1.35)
        bands.append(band.point(
            lambda v, g=gain, sm=s_mean, dm=d_mean: max(0, min(255, round((v - sm) * g + dm)))
        ))
    return Image.merge('RGB', bands)


def ImageChops_subtract(a, b):
    from PIL import ImageChops
    return ImageChops.subtract(a, b)


def main():
    orig = Image.open(SRC).convert('RGB')
    mask = build_mask(orig.size)
    fill = build_fill(orig)
    fill = match_levels(fill, orig, mask)

    soft = mask.filter(ImageFilter.GaussianBlur(7))
    out = Image.composite(fill, orig, soft)
    out.save(OUT)

    # Verify nothing outside the touched area moved.
    from PIL import ImageChops
    diff = ImageChops.difference(out, orig).convert('L')
    changed = diff.point(lambda v: 255 if v > 2 else 0)
    print('changed-pixel bbox:', changed.getbbox())
    print('saved', OUT, out.size)


if __name__ == '__main__':
    main()
