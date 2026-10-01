import { API_URL } from "@/constants/config";


type FaceImages = {

    front: string;

    left: string;

    right: string;

};



export interface FaceMetrics {

    faceLength?: string;

    faceWidth?: string;

    faceRatio?: string;

    foreheadWidth?: string;

    foreheadHeight?: string;

    cheekboneWidth?: string;

    jawWidth?: string;

    jawAngle?: string;

    jawlineShape?: string;

    faceSymmetry?: string;

}



export interface FaceAnalysisResult {

    faceShape: string;

    confidence: number;

    metrics: FaceMetrics;

    [key: string]: any;

}





export const analyzeMultiAngleFace = async (

    images: FaceImages

): Promise<FaceAnalysisResult> => {


    try {


        if (!API_URL) {

            throw new Error(
                "API URL missing"
            );

        }



        if (

            !images.front ||

            !images.left ||

            !images.right

        ) {

            throw new Error(
                "Three face images are required"
            );

        }



        const controller =
            new AbortController();



        const timeout =
            setTimeout(

                () => {

                    controller.abort();

                },

                120000

            );




        const response =
            await fetch(

                `${API_URL}/api/v1/face/analyze`,

                {

                    method: "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body: JSON.stringify({

                        front:
                            images.front,


                        left:
                            images.left,


                        right:
                            images.right

                    }),


                    signal:
                        controller.signal

                }

            );



        clearTimeout(timeout);




        if (!response.ok) {


            let errorMessage =
                "Face analysis failed";



            try {


                const errorData =
                    await response.json();


                errorMessage =
                    errorData.detail ||
                    errorMessage;



            }

            catch {


                const errorText =
                    await response.text();


                if (errorText) {

                    errorMessage =
                        errorText;

                }

            }



            throw new Error(
                errorMessage
            );

        }




        const result =
            await response.json();




        if (!result) {

            throw new Error(
                "Empty AI response"
            );

        }




        /*
          Adapter Layer

          Supports teammate Gemini JSON
          + existing backend response
        */



        const metrics =

            result.metrics ||

            result.face_metrics ||

            result.biometric_metrics ||

            {};





        return {


            ...result,



            faceShape:

                result.faceShape ||

                result.face_shape ||

                metrics["Face Shape"] ||

                "Unknown",




            confidence:

                result.confidence ||

                result.ai_accuracy ||

                result.confidenceScore ||

                0,




            metrics: {


                faceLength:

                    metrics.faceLength ||

                    metrics.face_length ||

                    metrics["Face Length"],



                faceWidth:

                    metrics.faceWidth ||

                    metrics.face_width ||

                    metrics["Face Width"],



                faceRatio:

                    metrics.faceRatio ||

                    metrics.face_ratio ||

                    metrics["Face Ratio"],



                foreheadWidth:

                    metrics.foreheadWidth ||

                    metrics.forehead_width ||

                    metrics["Forehead Width"],



                foreheadHeight:

                    metrics.foreheadHeight ||

                    metrics.forehead_height ||

                    metrics["Forehead Height"],



                cheekboneWidth:

                    metrics.cheekboneWidth ||

                    metrics.cheekbone_width ||

                    metrics["Cheekbone Width"],



                jawWidth:

                    metrics.jawWidth ||

                    metrics.jaw_width ||

                    metrics["Jaw Width"],



                jawAngle:

                    metrics.jawAngle ||

                    metrics.jaw_angle ||

                    metrics["Jaw Angle"],



                jawlineShape:

                    metrics.jawlineShape ||

                    metrics.jawline_shape ||

                    metrics["Jawline Shape"],



                faceSymmetry:

                    metrics.faceSymmetry ||

                    metrics.face_symmetry ||

                    metrics["Face Symmetry"]

            }

        };



    }


    catch (error: any) {


        if (error.name === "AbortError") {

            throw new Error(
                "Face analysis timeout. Please try again."
            );

        }



        throw error;

    }


};