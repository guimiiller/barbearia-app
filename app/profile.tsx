import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
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
    try {
      const userStorage = await AsyncStorage.getItem("user");

      if (userStorage) {
        setUser(JSON.parse(userStorage));
      }

      console.log("🔥 USER STORAGE:", userStorage);
    } catch (error) {
      console.log("❌ Erro ao carregar usuário:", error);
    }
  };

  const performLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);

      setUser(null);

      console.log("✅ USUÁRIO DESLOGADO");

      router.replace("/login");
    } catch (error) {
      console.log("❌ ERRO AO SAIR:", error);

      if (Platform.OS !== "web") {
        Alert.alert("Erro", "Não foi possível sair da conta.");
      }
    }
  };

  const handleLogout = () => {
    // =====================================================
    // WEB / PWA
    // =====================================================

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja sair da sua conta?",
      );

      if (confirmed) {
        performLogout();
      }

      return;
    }

    // =====================================================
    // ANDROID / IOS
    // =====================================================

    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.topHeader}>
          <View>
            <Text style={styles.eyebrow}>MINHA CONTA</Text>

            <Text style={styles.title}>Perfil</Text>
          </View>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push("/home")}
            activeOpacity={0.8}
          >
            <Image
              source={require("../assets/images/home.png")}
              style={styles.homeIcon}
            />
          </TouchableOpacity>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || "Usuário"}</Text>

              <Text style={styles.email}>
                {user?.email || "email@email.com"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>@</Text>
            </View>

            <View>
              <Text style={styles.contactLabel}>E-MAIL</Text>

              <Text style={styles.contactValue}>
                {user?.email || "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>⌕</Text>
            </View>

            <View>
              <Text style={styles.contactLabel}>TELEFONE</Text>

              <Text style={styles.contactValue}>
                {user?.phone || "Não informado"}
              </Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT */}

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>CONTA</Text>

          <Text style={styles.sectionTitle}>Gerencie seus dados</Text>

          <View style={styles.options}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.8}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>✎</Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Editar perfil</Text>

                <Text style={styles.optionDescription}>
                  Atualize seus dados pessoais
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => router.push("/history")}
              activeOpacity={0.8}
            >
              <View style={styles.optionIcon}>
                <Image
                  source={require("../assets/images/calendar.png")}
                  style={styles.optionImage}
                />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Histórico de agendamentos
                </Text>

                <Text style={styles.optionDescription}>
                  Veja seus atendimentos anteriores
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>↪</Text>

          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>BARÃO BARBER</Text>
      </ScrollView>

      {/* NAVBAR */}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/home")}
          activeOpacity={0.8}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.icon}
          />

          <Text style={styles.tabText}>Início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  eyebrow: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 5,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },

  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#171717",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  homeIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },

  profileCard: {
    backgroundColor: "#151515",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#242424",
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarText: {
    color: "#0B0B0B",
    fontSize: 28,
    fontWeight: "800",
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 5,
  },

  email: {
    color: "#777",
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "#282828",
    marginVertical: 22,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#202020",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contactIconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  contactLabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  contactValue: {
    color: "#ddd",
    fontSize: 14,
  },

  section: {
    marginTop: 34,
  },

  sectionEyebrow: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 5,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 18,
  },

  options: {
    gap: 12,
  },

  option: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#202020",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  optionIconText: {
    color: "#fff",
    fontSize: 20,
  },

  optionImage: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  optionDescription: {
    color: "#666",
    fontSize: 11,
  },

  arrow: {
    color: "#777",
    fontSize: 28,
    marginLeft: 8,
  },

  logoutButton: {
    height: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  logoutIcon: {
    color: "#aaa",
    fontSize: 18,
  },

  logoutText: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "700",
  },

  footer: {
    color: "#3f3f3f",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 3,
    textAlign: "center",
    marginTop: 28,
  },

  tabBar: {
    height: 76,
    backgroundColor: "#111111",
    borderTopWidth: 1,
    borderTopColor: "#242424",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  icon: {
    width: 21,
    height: 21,
    tintColor: "#666",
    marginBottom: 5,
  },

  iconActive: {
    width: 21,
    height: 21,
    tintColor: "#fff",
    marginBottom: 5,
  },

  tabText: {
    color: "#666",
    fontSize: 10,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
