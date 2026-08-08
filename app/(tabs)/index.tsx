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
    const user = await AsyncStorage.getItem("user");

    if (token && user) {
      const parsedUser = JSON.parse(user);

      console.log("AUTO LOGIN 🔥", parsedUser);

      if (parsedUser.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    } else {
      console.log("NÃO LOGADO ❌");
      router.replace("/landing");
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
