import os
import json
import base64
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ClientError

load_dotenv()

API_KEY=os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise Exception("GEMINI_API_KEY missing")

client=genai.Client(
    api_key=API_KEY
)

PROMPT="""
You are an expert AI facial geometry analysis system.

Analyze three facial images:

1. Front view
2. Left profile view
3. Right profile view

Use all images together.

Calculate:

- Face Length
- Face Width
- Face Ratio
- Forehead Width
- Forehead Height
- Cheekbone Width
- Jaw Width
- Jaw Angle
- Jawline Shape
- Face Symmetry

Then classify:

Oval
Square
Round
Rectangle
Oblong
Diamond
Heart
Triangle
Inverted Triangle
Pear

Return ONLY JSON.

Format:

{
"faceShape":"",
"confidence":0,
"metrics":{
"faceLength":"",
"faceWidth":"",
"faceRatio":"",
"foreheadWidth":"",
"foreheadHeight":"",
"cheekboneWidth":"",
"jawWidth":"",
"jawAngle":"",
"jawlineShape":"",
"faceSymmetry":""
},
"analysisSummary":"",
"recommendedHairstyles":[]
}
"""

def clean_json(text):
    text=text.replace("```json","")
    text=text.replace("```","")
    return text.strip()

def decode_image(image):
    return base64.b64decode(
        image.split(",")[-1]
    )

def extract_number(value):
    if value is None:
        return None
    if isinstance(value,(int,float)):
        return value
    match=re.search(
        r"\d+(\.\d+)?",
        str(value)
    )
    if match:
        return float(match.group())
    return None

def normalize_metrics(metrics):
    return {
        "faceLength":
            extract_number(
                metrics.get("faceLength")
            ),
        "faceWidth":
            extract_number(
                metrics.get("faceWidth")
            ),
        "faceRatio":
            extract_number(
                metrics.get("faceRatio")
            ),
        "foreheadWidth":
            extract_number(
                metrics.get("foreheadWidth")
            ),
        "foreheadHeight":
            extract_number(
                metrics.get("foreheadHeight")
            ),
        "cheekboneWidth":
            extract_number(
                metrics.get("cheekboneWidth")
            ),
        "jawWidth":
            extract_number(
                metrics.get("jawWidth")
            ),
        "jawAngle":
            extract_number(
                metrics.get("jawAngle")
            ),
        "jawlineShape":
            metrics.get(
                "jawlineShape"
            ),
        "faceSymmetry":
            extract_number(
                metrics.get("faceSymmetry")
            )
    }

def analyze_face(
    front:str,
    left:str,
    right:str
):
    image_parts=[
        types.Part.from_bytes(
            data=decode_image(front),
            mime_type="image/jpeg"
        ),
        types.Part.from_bytes(
            data=decode_image(left),
            mime_type="image/jpeg"
        ),
        types.Part.from_bytes(
            data=decode_image(right),
            mime_type="image/jpeg"
        )
    ]
    models = [
        "gemini-3.8-flash",
        "gemini-2.5-flash",
    ]
    for model in models:
        try:
            print(
                "Trying Gemini model:",
                model
            )
            response=client.models.generate_content(
                model=model,
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part.from_text(
                                text=PROMPT
                            ),
                            *image_parts
                        ]
                    )
                ],
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json"
                )
            )
            result=json.loads(
                clean_json(
                    response.text
                )
            )
            result["metrics"]=normalize_metrics(
                result.get(
                    "metrics",
                    {}
                )
            )
            result["confidence"]=extract_number(
                result.get(
                    "confidence"
                )
            )
            return result
        except ClientError as error:
            print(
                "Gemini model failed:",
                model,
                error
            )
            continue
        except Exception as error:
            print(
                "Gemini processing error:",
                error
            )
            continue
    raise Exception(
        "All Gemini Vision models failed"
    )