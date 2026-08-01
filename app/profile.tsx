import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, []),
  );
  const loadUser = async () => {
    const userStorage = await AsyncStorage.getItem("user");

    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0) : "U"}
          </Text>
        </View>

        <Text style={styles.name}>{user?.name || "Usuário"}</Text>
        <Text style={styles.email}>{user?.email || "email@email.com"}</Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={styles.optionText}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.optionText}>Histórico de Agendamentos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/")}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/")}
        >
          <Image
            source={require("../assets/images/calendar.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Image
            source={require("../assets/images/user.png")}
            style={styles.iconActive}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    padding: 20,
    justifyContent: "space-between",
  },

  header: {
    alignItems: "center",
    marginTop: 40,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  email: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },

  options: {
    marginTop: 40,
  },

  option: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  optionText: {
    color: "#fff",
    fontSize: 16,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: "#D4AF37",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },

  tabItem: {
    alignItems: "center",
  },

  icon: {
    width: 24,
    height: 24,
    tintColor: "#aaa",
  },

  iconActive: {
    width: 24,
    height: 24,
    tintColor: "#D4AF37",
  },
});
