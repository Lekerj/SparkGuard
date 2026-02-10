"""
SparkGuard Wildfire Intelligence Analyzer
Uses Claude Vision API to analyze satellite/aerial imagery for wildfire risk assessment.
"""

import anthropic
import base64
from pathlib import Path


WILDFIRE_ANALYSIS_PROMPT = """
🔥 SparkGuard – Wildfire Risk Intelligence Analysis

You are acting as an AI Wildfire Risk Intelligence Analyst for the SparkGuard project.

You are provided with a satellite or aerial image.
Your task is to analyze what is visually observable and produce decision-ready wildfire intelligence.

⚠️ Important constraints:
- Base your analysis only on what can be reasonably inferred from the image
- If something cannot be inferred with confidence, state that clearly
- Do not speculate or overclaim
- Do not mention AI models, training data, or algorithms
- Do not describe user interfaces or dashboards

Your output should read like a professional risk intelligence brief, not a technical report.

---

1. Fire Presence & Confidence
- Indicate whether visible signs of active fire or burning are present
- Assign a qualitative confidence level (Low / Medium / High)
- Describe the apparent size or extent qualitatively (localized / moderate / widespread)

---

2. Vegetation & Ground Characteristics

Based on visible cues:
- Identify dominant vegetation types (e.g., forested area, grassland, mixed cover)
- Describe ground conditions (dry surface, dense vegetation, exposed soil, rocky terrain)
- Explain briefly how these conditions may influence fire behavior

If vegetation or ground type cannot be clearly determined, state the uncertainty.

---

3. Terrain & Environmental Risk Factors
- Describe visible terrain features (flat land, slopes, ridges, valleys, corridors)
- Note any visual indicators related to dryness or exposure
- Provide an overall fire spread risk assessment (Low / Medium / High), with a short justification

---

4. Scenario-Based Risk Outlook (No Timelines)

Assuming current visible conditions remain unchanged:
- Describe likely fire behavior in general terms
- Focus on potential directionality, intensity trends, and exposure risk
- Avoid time-based or quantitative predictions

---

5. Decision-Support Guidance

Provide high-level guidance suitable for planners and operators:
- Areas that may warrant priority monitoring or containment
- Where ground-based response may be feasible
- When aerial monitoring or response may be appropriate

Frame guidance as decision support, not instructions.

---

Output Style:
- Clear, concise, professional tone
- Structured sections with short paragraphs or bullet points
- Explicitly note uncertainty where appropriate
- Avoid dramatic or alarmist language

---

Objective:
Produce a SparkGuard Wildfire Intelligence Brief that helps decision-makers understand:
what is visible, why it matters, and how to prioritize attention—without overstating certainty.
"""


def encode_image_to_base64(image_path: Path) -> str:
    """Read an image file and encode it to base64."""
    with open(image_path, "rb") as image_file:
        return base64.standard_b64encode(image_file.read()).decode("utf-8")


def get_image_media_type(image_path: Path) -> str:
    """Determine the media type based on file extension."""
    suffix = image_path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }
    return media_types.get(suffix, "image/jpeg")


def analyze_wildfire_image(image_path: Path, api_key: str = None) -> str:
    """
    Analyze an image for wildfire risk using Claude Vision API.
    
    Args:
        image_path: Path to the image file to analyze
        api_key: Anthropic API key (optional, will use ANTHROPIC_API_KEY env var if not provided)
    
    Returns:
        Wildfire intelligence brief as a string
    """
    # Initialize the Anthropic client
    if api_key:
        client = anthropic.Anthropic(api_key=api_key)
    else:
        client = anthropic.Anthropic()  # Uses ANTHROPIC_API_KEY env var
    
    # Encode the image
    image_data = encode_image_to_base64(image_path)
    media_type = get_image_media_type(image_path)
    
    # Create the message with vision capability
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": WILDFIRE_ANALYSIS_PROMPT,
                    },
                ],
            }
        ],
    )
    
    return message.content[0].text


def analyze_wildfire_image_from_url(image_url: str, api_key: str = None) -> str:
    """
    Analyze an image from URL for wildfire risk using Claude Vision API.
    
    Args:
        image_url: URL of the image to analyze
        api_key: Anthropic API key (optional, will use ANTHROPIC_API_KEY env var if not provided)
    
    Returns:
        Wildfire intelligence brief as a string
    """
    # Initialize the Anthropic client
    if api_key:
        client = anthropic.Anthropic(api_key=api_key)
    else:
        client = anthropic.Anthropic()  # Uses ANTHROPIC_API_KEY env var
    
    # Create the message with vision capability using URL
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "url",
                            "url": image_url,
                        },
                    },
                    {
                        "type": "text",
                        "text": WILDFIRE_ANALYSIS_PROMPT,
                    },
                ],
            }
        ],
    )
    
    return message.content[0].text


if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python wildfire_analyzer.py <image_path>")
        print("Make sure ANTHROPIC_API_KEY environment variable is set.")
        sys.exit(1)
    
    image_path = Path(sys.argv[1])
    if not image_path.exists():
        print(f"Error: Image not found at {image_path}")
        sys.exit(1)
    
    print("🔥 SparkGuard Wildfire Intelligence Analysis")
    print("=" * 50)
    print(f"Analyzing: {image_path.name}")
    print("=" * 50)
    print()
    
    try:
        report = analyze_wildfire_image(image_path)
        print(report)
    except anthropic.APIError as e:
        print(f"API Error: {e}")
        sys.exit(1)
