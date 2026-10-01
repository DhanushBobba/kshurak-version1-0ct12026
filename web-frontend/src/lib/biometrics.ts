export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface RealBiometricReport {
  faceLength: number;
  faceWidth: number;
  foreheadWidth: number;
  cheekboneWidth: number;
  jawlineWidth: number;
  chinLength: number;
  faceRatio: number;
  symmetry: number;
  faceShape: 'Oval' | 'Square' | 'Round' | 'Diamond' | 'Oblong';
  recommendedStyle: string;
  topLength: string;
  sides: string;
  back: string;
  blending: string;
  neckline: string;
  fringe: string;
  finishing: string;
  avoid: string;
  landmarks: Landmark[];
}

function getDistance(p1: Landmark, p2: Landmark, width = 640, height = 480): number {
  const dx = (p1.x - p2.x) * width;
  const dy = (p1.y - p2.y) * height;
  const dz = ((p1.z || 0) - (p2.z || 0)) * width;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function computeRealBiometrics(
  landmarks: Landmark[],
  width = 640,
  height = 480
): RealBiometricReport {
  // Key MediaPipe landmark indices:
  // 10: Hairline / Top of forehead
  // 152: Menton / Chin bottom
  // 127, 356: Temporal bones (Forehead width)
  // 234, 454: Zygomatic arches (Cheekbone width)
  // 172, 397: Gonion angles (Jawline width)
  // 18: Lower lip border
  // 33, 263: Left & Right outer eye corners (Scale reference: ~90mm standard)

  const eyeSpanPx = getDistance(landmarks[33], landmarks[263], width, height);
  const mmPerPx = 90.0 / Math.max(eyeSpanPx, 1);

  const faceLength = Number((getDistance(landmarks[10], landmarks[152], width, height) * mmPerPx).toFixed(1));
  const cheekboneWidth = Number((getDistance(landmarks[234], landmarks[454], width, height) * mmPerPx).toFixed(1));
  const foreheadWidth = Number((getDistance(landmarks[127], landmarks[356], width, height) * mmPerPx).toFixed(1));
  const jawlineWidth = Number((getDistance(landmarks[172], landmarks[397], width, height) * mmPerPx).toFixed(1));
  const chinLength = Number((getDistance(landmarks[18], landmarks[152], width, height) * mmPerPx).toFixed(1));
  const faceWidth = cheekboneWidth;

  const faceRatio = Number((faceLength / Math.max(faceWidth, 1)).toFixed(2));

  // Bilateral facial symmetry comparison
  const midX = landmarks[168].x;
  const leftDist = Math.abs(landmarks[234].x - midX);
  const rightDist = Math.abs(landmarks[454].x - midX);
  const diffRatio = Math.abs(leftDist - rightDist) / Math.max(leftDist, rightDist, 0.001);
  const symmetry = Number((100 - diffRatio * 100).toFixed(1));

  // Determine face shape & barber instructions
  let faceShape: RealBiometricReport['faceShape'] = 'Oval';
  let recommendedStyle = 'Textured Modern Crop';
  let topLength = '2.5 inches — scissor point cut';
  let sides = 'Skin fade — #0 to #2';
  let back = 'Tapered, match sides';
  let blending = 'Gradual fade at temple';
  let neckline = 'Tapered, no hard line';
  let fringe = 'Micro textured fringe';
  let finishing = 'Matte clay, natural hold';
  let avoid = 'Heavy oil pomade, blunt hairline';

  if (faceRatio >= 1.42) {
    faceShape = 'Oblong';
    recommendedStyle = 'Classic Side-Part Taper';
    topLength = '3.0 inches — scissor layered';
    sides = '#2 to #3 Soft Scissor Taper';
    back = 'Natural contour blend';
    blending = 'Low temple blend';
    neckline = 'Natural feathered line';
    fringe = 'Side swept volume';
    finishing = 'Light styling cream';
    avoid = 'Excessive top height, skin fades';
  } else if (jawlineWidth >= cheekboneWidth * 0.93) {
    faceShape = 'Square';
    recommendedStyle = 'Executive Textured Fade';
    topLength = '2.0 inches — texturized crown';
    sides = 'Low skin fade — #0.5 to #2';
    back = 'Drop fade blend';
    blending = 'Clean transitional blend';
    neckline = 'Blocked taper';
    fringe = 'Slight messy fringe';
    finishing = 'Sea salt spray & matte paste';
    avoid = 'Blunt flat tops, wide side bulk';
  } else if (faceRatio <= 1.25) {
    faceShape = 'Round';
    recommendedStyle = 'High Pompadour Volume Fade';
    topLength = '3.5 inches — volume swept';
    sides = 'High skin fade — #0 to #1.5';
    back = 'Seamless high fade';
    blending = 'High temple blend';
    neckline = 'Tapered skin drop';
    fringe = 'Upward angular lift';
    finishing = 'Matte paste with strong hold';
    avoid = 'Round bowl crops, blunt forward fringe';
  } else if (cheekboneWidth > foreheadWidth * 1.08) {
    faceShape = 'Diamond';
    recommendedStyle = 'Editorial Middle Curtain Flow';
    topLength = '4.0 inches — scissor textured';
    sides = '#2 to #3 Soft Scissor Taper';
    back = 'Low contour taper';
    blending = 'Feathered temple taper';
    neckline = 'Soft rounded neckline';
    fringe = 'Curtain split flow';
    finishing = 'Light styling oil / texture balm';
    avoid = 'Ultra-short skin fades, wide ears';
  }

  return {
    faceLength,
    faceWidth,
    foreheadWidth,
    cheekboneWidth,
    jawlineWidth,
    chinLength,
    faceRatio,
    symmetry: Math.min(99.6, Math.max(85.0, symmetry)),
    faceShape,
    recommendedStyle,
    topLength,
    sides,
    back,
    blending,
    neckline,
    fringe,
    finishing,
    avoid,
    landmarks,
  };
}
