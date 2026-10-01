export type FaceShapeKey =
    | "oval"
    | "square"
    | "round"
    | "rectangle"
    | "oblong"
    | "diamond"
    | "heart"
    | "triangle"
    | "inverted_triangle"
    | "pear";

export type HairstyleRecommendation = {
    id: string;
    name: string;
    image: any;
};

export const HAIRSTYLE_RECOMMENDATIONS: Record<
    FaceShapeKey,
    HairstyleRecommendation[]
> = {
    diamond: [
        {
            id: "diamond_fringe_crop",
            name: "Fringe Crop",
            image: require("../../assets/hairstyles/diamond/diamond_fringe_crop.png")
        },
        {
            id: "diamond_messy_medium_layers",
            name: "Messy Medium Layers",
            image: require("../../assets/hairstyles/diamond/diamond_messy_medium_layers.png")
        },
        {
            id: "diamond_side_swept_undercut",
            name: "Side Swept Undercut",
            image: require("../../assets/hairstyles/diamond/diamond_side_swept_undercut.png")
        },
        {
            id: "diamond_textured_quiff",
            name: "Textured Quiff",
            image: require("../../assets/hairstyles/diamond/diamond_textured_quiff.png")
        }
    ],
    heart: [
        {
            id: "heart_messy_top_with_taper",
            name: "Messy Top With Taper",
            image: require("../../assets/hairstyles/heart/heart_messy_top_with_taper.png")
        },
        {
            id: "heart_pompadour",
            name: "Pompadour",
            image: require("../../assets/hairstyles/heart/heart_pompadour.png")
        },
        {
            id: "heart_side_part",
            name: "Side Part",
            image: require("../../assets/hairstyles/heart/heart_side_part.png")
        },
        {
            id: "heart_textured_quiff",
            name: "Textured Quiff",
            image: require("../../assets/hairstyles/heart/heart_textured_quiff.png")
        }
    ],
    inverted_triangle: [
        {
            id: "inverted_triangle_caesar_crop",
            name: "Caesar Crop",
            image: require("../../assets/hairstyles/inverted_triangle/inverted_triangle_caesar_crop.png")
        },
        {
            id: "inverted_triangle_medium_messy_layers",
            name: "Medium Messy Layers",
            image: require("../../assets/hairstyles/inverted_triangle/inverted_triangle_medium_messy_layers.png")
        },
        {
            id: "inverted_triangle_side_swept_fringe",
            name: "Side Swept Fringe",
            image: require("../../assets/hairstyles/inverted_triangle/inverted_triangle_side_swept_fringe.png")
        },
        {
            id: "inverted_triangle_textured_crop",
            name: "Textured Crop",
            image: require("../../assets/hairstyles/inverted_triangle/inverted_triangle_textured_crop.png")
        }
    ],
    oblong: [
        {
            id: "oblong_curtains",
            name: "Curtains",
            image: require("../../assets/hairstyles/oblong/oblong_curtains.png")
        },
        {
            id: "oblong_french_crop",
            name: "French Crop",
            image: require("../../assets/hairstyles/oblong/oblong_french_crop.png")
        },
        {
            id: "oblong_messy_medium_layers",
            name: "Messy Medium Layers",
            image: require("../../assets/hairstyles/oblong/oblong_messy_medium_layers.png")
        },
        {
            id: "oblong_side_part",
            name: "Side Part",
            image: require("../../assets/hairstyles/oblong/oblong_side_part.png")
        }
    ],
    oval: [
        {
            id: "oval_crew_cut",
            name: "Crew Cut",
            image: require("../../assets/hairstyles/oval/oval_crew_cut.png")
        },
        {
            id: "oval_pompadour",
            name: "Pompadour",
            image: require("../../assets/hairstyles/oval/oval_pompadour.png")
        },
        {
            id: "oval_side_part",
            name: "Side Part",
            image: require("../../assets/hairstyles/oval/oval_side_part.png")
        },
        {
            id: "oval_textured_quiff",
            name: "Textured Quiff",
            image: require("../../assets/hairstyles/oval/oval_textured_quiff.png")
        }
    ],
    pear: [
        {
            id: "pear_pompadour",
            name: "Pompadour",
            image: require("../../assets/hairstyles/pear/pear_pompadour.png")
        },
        {
            id: "pear_side_part",
            name: "Side Part",
            image: require("../../assets/hairstyles/pear/pear_side_part.png")
        },
        {
            id: "pear_textured_crop",
            name: "Textured Crop",
            image: require("../../assets/hairstyles/pear/pear_textured_crop.png")
        },
        {
            id: "pear_volume_quiff",
            name: "Volume Quiff",
            image: require("../../assets/hairstyles/pear/pear_volume_quiff.png")
        }
    ],
    rectangle: [
        {
            id: "rectangle_ivy_league",
            name: "Ivy League",
            image: require("../../assets/hairstyles/rectangle/rectangle_ivy_league.png")
        },
        {
            id: "rectangle_low_taper",
            name: "Low Taper",
            image: require("../../assets/hairstyles/rectangle/rectangle_low_taper.png")
        },
        {
            id: "rectangle_side_part",
            name: "Side Part",
            image: require("../../assets/hairstyles/rectangle/rectangle_side_part.png")
        },
        {
            id: "rectangle_textured_fringe",
            name: "Textured Fringe",
            image: require("../../assets/hairstyles/rectangle/rectangle_textured_fringe.png")
        }
    ],
    round: [
        {
            id: "round_pompadour",
            name: "Pompadour",
            image: require("../../assets/hairstyles/round/round_pompadour.png")
        },
        {
            id: "round_side_part",
            name: "Side Part",
            image: require("../../assets/hairstyles/round/round_side_part.png")
        },
        {
            id: "round_textured_crop",
            name: "Textured Crop",
            image: require("../../assets/hairstyles/round/round_textured_crop.png")
        },
        {
            id: "round_textured_quiff",
            name: "Textured Quiff",
            image: require("../../assets/hairstyles/round/round_textured_quiff.png")
        }
    ],
    square: [
        {
            id: "square_buzz_cut",
            name: "Buzz Cut",
            image: require("../../assets/hairstyles/square/square_buzz_cut.png")
        },
        {
            id: "square_crew_cut",
            name: "Crew Cut",
            image: require("../../assets/hairstyles/square/square_crew_cut.png")
        },
        {
            id: "square_slick_back",
            name: "Slick Back",
            image: require("../../assets/hairstyles/square/square_slick_back.png")
        },
        {
            id: "square_textured_crop",
            name: "Textured Crop",
            image: require("../../assets/hairstyles/square/square_textured_crop.png")
        }
    ],
    triangle: [
        {
            id: "triangle_curtains",
            name: "Curtains",
            image: require("../../assets/hairstyles/triangle/triangle_curtains.png")
        },
        {
            id: "triangle_medium_quiff",
            name: "Medium Quiff",
            image: require("../../assets/hairstyles/triangle/triangle_medium_quiff.png")
        },
        {
            id: "triangle_side_part",
            name: "Side Part",
            image: require("../../assets/hairstyles/triangle/triangle_side_part.png")
        },
        {
            id: "triangle_textured_fringe",
            name: "Textured Fringe",
            image: require("../../assets/hairstyles/triangle/triangle_textured_fringe.png")
        }
    ]
};

export const normalizeFaceShape = (
    faceShape?: string | null
): FaceShapeKey | null => {
    if (!faceShape) {
        return null;
    }
    const normalized = faceShape
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, "_");
    if (
        Object.prototype.hasOwnProperty.call(
            HAIRSTYLE_RECOMMENDATIONS,
            normalized
        )
    ) {
        return normalized as FaceShapeKey;
    }
    return null;
};

export const getRecommendedHairstyles = (
    faceShape?: string | null
): HairstyleRecommendation[] => {
    const key = normalizeFaceShape(faceShape);
    if (!key) {
        return [];
    }
    return HAIRSTYLE_RECOMMENDATIONS[key];
};