import cv2
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# Import the wildfire analyzer
from wildfire_analyzer import analyze_wildfire_image

# Path to your test image
IMAGE_PATH = Path(__file__).resolve().parents[1] / "assets" / "TEST.jpg"

def detect_red_regions(img_rgb):
    """
    Detect red-ish regions using HSV thresholding.
    Returns: (result_image, mask)
    """
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)

    # Red wraps in HSV, so use two ranges
    lower_red1 = np.array([0, 50, 50])
    upper_red1 = np.array([10, 255, 255])

    lower_red2 = np.array([170, 50, 50])
    upper_red2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask = cv2.bitwise_or(mask1, mask2)

    result = cv2.bitwise_and(img_rgb, img_rgb, mask=mask)
    return result, mask

def main():
    image_bgr = cv2.imread(str(IMAGE_PATH))
    if image_bgr is None:
        raise ValueError(f"Image not found: {IMAGE_PATH}\n"
                         f"Make sure you placed 'TEST.jpg' inside the assets folder.")

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    detected_img, mask = detect_red_regions(image_rgb)

    # Show images
    plt.figure(figsize=(12, 5))

    plt.subplot(1, 2, 1)
    plt.imshow(image_rgb)
    plt.title("Original Image")
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.imshow(detected_img)
    plt.title("Detected Red Regions")
    plt.axis("off")

    plt.show()

    # Extract pixel coordinates
    fire_pixels = np.column_stack(np.where(mask > 0))
    print("Detected pixels:", len(fire_pixels))
    print("Top 5 coordinates:", fire_pixels[:5])

    # Run Claude Vision wildfire analysis
    print("\n" + "=" * 60)
    print("🔥 SparkGuard Wildfire Intelligence Analysis")
    print("=" * 60 + "\n")
    
    try:
        report = analyze_wildfire_image(IMAGE_PATH)
        print(report)
    except Exception as e:
        print(f"⚠️ Could not run Claude Vision analysis: {e}")
        print("Make sure ANTHROPIC_API_KEY environment variable is set.")

if __name__ == "__main__":
    main()
