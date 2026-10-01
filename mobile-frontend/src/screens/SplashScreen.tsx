import {
    Image,
    StyleSheet,
    View
} from "react-native";


export default function SplashScreen() {


    return (

        <View style={styles.container}>


            <Image

                source={require("../../assets/images/logo.png")}

                style={styles.logo}

            />


        </View>

    );

}



const styles = StyleSheet.create({


    container: {

        flex: 1,

        justifyContent: "center",

        alignItems: "center",

        backgroundColor: "#000"

    },


    logo: {

        width: 240,

        height: 120,

        resizeMode: "contain"

    }


});