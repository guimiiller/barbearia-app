import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  cancelAppointment,
  concludeAppointment,
  getAllAppointments,
  removeSlot,
} from "../src/services/api";

export default function Admin() {
  const pathname = usePathname();
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, []),
  );

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const data = await getAllAppointments();

      const filtered = data.filter((a: any) => a.status !== "cancelado");

      setAppointments(filtered);
    } catch (error) {
      console.log("❌ Erro ao buscar agendamentos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (item: any) => {
    try {
      await cancelAppointment(item._id);

      await removeSlot(item.date, item.time);

      await AsyncStorage.setItem(
        "cancelMessage",
        "❌ Seu agendamento foi cancelado pelo barbeiro.",
      );

      loadAppointments();
    } catch (error) {
      console.log(error);
      alert("Erro ao cancelar agendamento");
    }
  };

  const handleConclude = async (item: any) => {
    try {
      await concludeAppointment(item._id);

      await removeSlot(item.date, item.time);

      loadAppointments();
    } catch (error) {
      console.log("❌ ERRO AO CONCLUIR:", error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/landing");
  };

  const formatDate = () => {
    const today = new Date();

    const day = today.getDate();
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    return `${day} ${months[today.getMonth()]}`;
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Olá, Barão 👑</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Hoje - {formatDate()}</Text>

        <Text style={styles.summaryText}>
          Agendamentos hoje: {appointments.length}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* LISTA */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                item.status === "concluido" && styles.cardDone,
              ]}
            >
              <Text style={styles.time}>
                {item.time} - {item.userId?.name}
              </Text>

              <Text style={styles.service}>
                {item.services?.map((s: any) => s.name).join(", ")}
              </Text>

              {/* BOTÕES */}
              {item.status !== "concluido" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.concludeBtn}
                    onPress={() => handleConclude(item)}
                  >
                    <Text style={styles.btnTextDark}>Concluir</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item)}
                  >
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      {/* NAVBAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("../assets/images/home.png")}
            style={styles.iconActive}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/schedule-admin")}>
          <Image
            source={require("../assets/images/calendar.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/services-admin")}>
          <Image
            source={require("../assets/images/services.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 20,
  },

  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 40,
  },

  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  summaryText: {
    color: "#AAA",
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  cardDone: {
    opacity: 0.5,
  },

  time: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },

  service: {
    color: "#999",
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  concludeBtn: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  cancelBtn: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  btnText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  btnTextDark: {
    color: "#000",
    fontWeight: "bold",
  },

  logoutBtn: {
    backgroundColor: "#FFD700",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 70,
  },

  logoutText: {
    color: "#000",
    fontWeight: "bold",
  },

  tabBar: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    width: "70%",
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: "#B0B0B0",
  },
  iconActive: {
    width: 25,
    height: 25,
    tintColor: "#D4AF37",
  },
});
