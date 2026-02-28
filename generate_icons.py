from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    # Create image with green background
    img = Image.new('RGB', (size, size), color=(25, 160, 100))
    d = ImageDraw.Draw(img)
    # Give it a wallet icon look (roughly) or just an 'M' for MoneyTrack
    text = "M"
    # Estimate font size
    font_size = int(size * 0.6)
    try:
        # try to load arial or default
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()
    
    # Calculate text bounding box
    bbox = d.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (size - text_w) / 2
    y = (size - text_h) / 2 - (size * 0.1)  # adjust baseline offset
    
    d.text((x, y), text, font=font, fill=(255, 255, 255))
    img.save(output_path)
    print(f"Created {output_path}")

os.makedirs('public', exist_ok=True)
create_icon(192, 'public/pwa-192x192.png')
create_icon(512, 'public/pwa-512x512.png')
create_icon(144, 'public/pwa-144x144.png')
