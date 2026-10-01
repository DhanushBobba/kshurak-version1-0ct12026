import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system/legacy";

export const uploadFaceImage = async (
    uri: string,
    userId: string,
    angle: string
) => {

    try {

        if (!uri) {
            throw new Error("Image URI missing");
        }

        const base64 =
            await FileSystem.readAsStringAsync(
                uri,
                {
                    encoding: "base64"
                }
            );


        const filePath =
            `${userId}/${Date.now()}_${angle}.jpg`;


        const bytes =
            decodeBase64(base64);



        const {
            error
        } =
            await supabase.storage
                .from("face-scans")
                .upload(
                    filePath,
                    bytes,
                    {
                        contentType: "image/jpeg",
                        upsert: true
                    }
                );


        if (error) {

            console.log(
                "UPLOAD ERROR",
                error
            );

            throw error;

        }



        const {
            data
        } =
            supabase.storage
                .from("face-scans")
                .getPublicUrl(
                    filePath
                );



        console.log(
            "IMAGE URL",
            angle,
            data.publicUrl
        );



        return data.publicUrl;



    }
    catch (error) {

        console.log(
            "FACE IMAGE UPLOAD FAILED",
            error
        );

        throw error;

    }

};



const decodeBase64 = (base64: string) => {

    const binary =
        global.atob(base64);


    const bytes =
        new Uint8Array(
            binary.length
        );


    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);

    }


    return bytes;

};