import { GoogleGenAI, Type } from '@google/genai';
import { RealBiometricReport, Landmark } from './biometrics';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function analyzeFaceHybrid(
  base64Image: string,
  localMetrics?: { faceRatio: number; symmetry: number; rawLandmarks: Landmark[] }
): Promise<RealBiometricReport> {
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env file.');
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

  const prompt = `
    You are an expert master barber, cranial morphologist, and facial geometry specialist.
    Analyze this individual's facial morphology from the provided image.
    ${localMetrics ? `Hardware Geometric Landmarks detected a Face Ratio of 1:${localMetrics.faceRatio} and a Symmetry score of ${localMetrics.symmetry}%.` : ''}

    Return realistic anatomical millimeter estimates matching their visible structure,
    classify their precise face shape, and generate specific in-chair barber cutting directives.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faceLength: { type: Type.NUMBER, description: 'Forehead hairline to chin in mm' },
          faceWidth: { type: Type.NUMBER, description: 'Cheekbone width in mm' },
          foreheadWidth: { type: Type.NUMBER, description: 'Temporal width in mm' },
          cheekboneWidth: { type: Type.NUMBER, description: 'Bizygomatic width in mm' },
          jawlineWidth: { type: Type.NUMBER, description: 'Bigonial width in mm' },
          chinLength: { type: Type.NUMBER, description: 'Menton height in mm' },
          faceRatio: { type: Type.NUMBER, description: 'Length to width ratio' },
          symmetry: { type: Type.NUMBER, description: 'Facial symmetry percentage' },
          faceShape: {
            type: Type.STRING,
            enum: ['Oval', 'Square', 'Round', 'Diamond', 'Oblong'],
          },
          recommendedStyle: { type: Type.STRING },
          topLength: { type: Type.STRING },
          sides: { type: Type.STRING },
          back: { type: Type.STRING },
          blending: { type: Type.STRING },
          neckline: { type: Type.STRING },
          fringe: { type: Type.STRING },
          finishing: { type: Type.STRING },
          avoid: { type: Type.STRING },
        },
        required: [
          'faceLength', 'faceWidth', 'foreheadWidth', 'cheekboneWidth',
          'jawlineWidth', 'chinLength', 'faceRatio', 'symmetry',
          'faceShape', 'recommendedStyle', 'topLength', 'sides',
          'back', 'blending', 'neckline', 'fringe', 'finishing', 'avoid',
        ],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');

  return {
    ...parsed,
    landmarks: localMetrics?.rawLandmarks || [],
  };
}

export const analyzeFaceWithGemini = analyzeFaceHybrid;
