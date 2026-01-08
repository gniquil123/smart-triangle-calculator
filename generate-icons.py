from PIL import Image, ImageDraw

# Define icon sizes for different densities
icon_sizes = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
}

# Define colors
background_color = (33, 150, 243)  # Blue
triangle_color = (255, 255, 255)  # White

# Create output directory
import os
output_dir = 'android-icons'
os.makedirs(output_dir, exist_ok=True)

# Generate icons for each density
for density, size in icon_sizes.items():
    # Generate main launcher icon (background + triangle)
    image = Image.new('RGBA', (size, size), background_color)
    draw = ImageDraw.Draw(image)
    
    # Calculate triangle coordinates with better positioning
    center_x = size / 2
    center_y = size / 2
    triangle_size = size * 0.7  # Larger triangle for better visibility
    
    # Define triangle vertices with floating point precision for smoother edges
    top = (center_x, center_y - triangle_size / 2)
    bottom_right = (center_x + triangle_size / 2, center_y + triangle_size / 2)
    bottom_left = (center_x - triangle_size / 2, center_y + triangle_size / 2)
    
    # Draw the triangle with antialiasing by using smooth polygon drawing
    draw.polygon([top, bottom_right, bottom_left], fill=triangle_color, outline=None)
    
    # Enhance the triangle with a subtle outline for better visibility
    draw.polygon([top, bottom_right, bottom_left], fill=None, outline=triangle_color, width=2)
    
    # Save the main icon
    output_path = os.path.join(output_dir, f'ic_launcher_{density}.png')
    image.save(output_path, 'PNG', quality=95)  # High quality PNG
    print(f'Generated icon: {output_path}')
    
    # Generate foreground icon (only triangle with transparent background)
    fg_image = Image.new('RGBA', (size, size), (0, 0, 0, 0))  # Transparent background
    fg_draw = ImageDraw.Draw(fg_image)
    
    # Draw the same triangle for foreground
    fg_draw.polygon([top, bottom_right, bottom_left], fill=triangle_color, outline=None)
    fg_draw.polygon([top, bottom_right, bottom_left], fill=None, outline=triangle_color, width=2)
    
    # Save the foreground icon
    fg_output_path = os.path.join(output_dir, f'ic_launcher_foreground_{density}.png')
    fg_image.save(fg_output_path, 'PNG', quality=95)  # High quality PNG
    print(f'Generated foreground icon: {fg_output_path}')

print('All icons generated successfully!')
