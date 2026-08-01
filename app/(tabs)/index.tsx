import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      console.log("AUTO LOGIN 🔥");
      router.replace("/home");
    } else {
      console.log("NÃO LOGADO ❌");
      router.replace("/login");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0D0D0D",
      }}
    >
      <Text style={{ color: "#fff" }}>Carregando...</Text>
    </View>
  );
}
