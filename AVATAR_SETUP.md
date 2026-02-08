# 🖼️ Avatar Images - Setup Guide

## Option 1: Use Your Real Images (Recommended)

Place your 10 team member photos in `/public/avatars/`:

```
/public/avatars/
├── stefan2.png
├── raintaro2.png
├── itoshi2.png
├── hinata1.png
├── majorproject2.png
├── jezz1.png
├── dunken2.png
├── josh2.png
├── niraj2.png
└── ritual2.png
```

**Requirements:**
- Format: PNG, JPG, or WebP
- Size: 200x200px minimum
- Square aspect ratio (1:1)
- Clear, recognizable faces

---

## Option 2: Generate Placeholder Images for Testing

If you don't have images yet, create colored placeholders:

### Using Online Tool (Easiest)
1. Go to: https://placehold.co/
2. Download these URLs:

```bash
# Level 1 - Purple
https://placehold.co/200x200/8B5CF6/FFFFFF/png?text=Lv1

# Level 2 - Blue
https://placehold.co/200x200/3B82F6/FFFFFF/png?text=Lv2

# Level 3 - Pink
https://placehold.co/200x200/EC4899/FFFFFF/png?text=Lv3

# Level 4 - Orange
https://placehold.co/200x200/F59E0B/FFFFFF/png?text=Lv4

# Level 5 - Green
https://placehold.co/200x200/10B981/FFFFFF/png?text=Lv5

# Level 6 - Red
https://placehold.co/200x200/EF4444/FFFFFF/png?text=Lv6

# Level 7 - Purple
https://placehold.co/200x200/8B5CF6/FFFFFF/png?text=Lv7

# Level 8 - Blue
https://placehold.co/200x200/3B82F6/FFFFFF/png?text=Lv8

# Level 9 - Pink
https://placehold.co/200x200/EC4899/FFFFFF/png?text=Lv9

# Level 10 - Gold
https://placehold.co/200x200/F59E0B/FFFFFF/png?text=Lv10
```

3. Save each as the corresponding filename
4. Place in `/public/avatars/`

### Using ImageMagick (For developers)
```bash
# Install ImageMagick first
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Create placeholders
cd public/avatars/

convert -size 200x200 xc:'#8B5CF6' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv1' stefan2.png
convert -size 200x200 xc:'#3B82F6' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv2' raintaro2.png
convert -size 200x200 xc:'#EC4899' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv3' itoshi2.png
convert -size 200x200 xc:'#F59E0B' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv4' hinata1.png
convert -size 200x200 xc:'#10B981' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv5' majorproject2.png
convert -size 200x200 xc:'#EF4444' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv6' jezz1.png
convert -size 200x200 xc:'#8B5CF6' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv7' dunken2.png
convert -size 200x200 xc:'#3B82F6' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv8' josh2.png
convert -size 200x200 xc:'#EC4899' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv9' niraj2.png
convert -size 200x200 xc:'#F59E0B' -pointsize 60 -fill white -gravity center -annotate +0+0 'Lv10' ritual2.png
```

---

## Option 3: Use Team Member GitHub Avatars

If your team is on GitHub:

```bash
# Download GitHub avatars
cd public/avatars/

curl -o stefan2.png https://github.com/USERNAME1.png
curl -o raintaro2.png https://github.com/USERNAME2.png
curl -o itoshi2.png https://github.com/USERNAME3.png
# ... etc
```

---

## Image Preparation Tips

### Resize Images
```bash
# Using ImageMagick
convert input.jpg -resize 200x200^ -gravity center -extent 200x200 output.png
```

### Create Circular Crop
```bash
# Make image circular
convert input.png -resize 200x200^ -gravity center -extent 200x200 \
  \( +clone -fill black -draw 'circle 100,100 100,0' \) \
  -alpha set -compose DstIn -composite \
  output.png
```

### Batch Process Multiple Images
```bash
# Resize all images in current directory
for img in *.jpg *.png; do
  convert "$img" -resize 200x200^ -gravity center -extent 200x200 "resized-$img"
done
```

---

## Verify Images Are Loaded

After adding images, check they load correctly:

```bash
# Run dev server
npm run dev

# Open browser console (F12)
# Go to http://localhost:3000/game
# Check for any 404 errors on images
```

---

## Image Checklist

- [ ] All 10 images present
- [ ] Correct filenames (exact match, case-sensitive)
- [ ] Images are square (1:1 aspect ratio)
- [ ] Minimum 200x200px
- [ ] PNG or JPG format
- [ ] Files under 500KB each
- [ ] No 404 errors in console

---

**Once images are ready, the game will display them perfectly inside the physics balls!** 🎮
