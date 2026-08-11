import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState(0);

  const getToday = () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
  };

  const getSelectedDate = () => {
    const date = getToday();

    date.setDate(date.getDate() + selectedDay);

    return date;
  };

  const formatApiDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = () => {
    const date = getSelectedDate();

    const day = date.getDate();

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

    return `${day} ${months[date.getMonth()]}`;
  };

  const getDayName = () => {
    const date = getSelectedDate();

    if (selectedDay === 0) {
      return "Hoje";
    }

    if (selectedDay === 1) {
      return "Amanhã";
    }

    const days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    return days[date.getDay()];
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [selectedDay]),
  );

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const data = await getAllAppointments();

      const selectedDate = formatApiDate(getSelectedDate());

      console.log("📅 DIA SELECIONADO:", selectedDate);
      console.log("📋 AGENDAMENTOS:", data);

      const filtered = data.filter((appointment: any) => {
        return (
          appointment.date === selectedDate &&
          appointment.status !== "cancelado"
        );
      });

      filtered.sort((a: any, b: any) => {
        return a.time.localeCompare(b.time);
      });

      setAppointments(filtered);
    } catch (error) {
      console.log("❌ Erro ao buscar agendamentos", error);
    } finally {
      setLoading(false);
    }
  };

  const previousDay = () => {
    if (selectedDay === 0) {
      return;
    }

    setSelectedDay((prev) => prev - 1);
  };

  const nextDay = () => {
    if (selectedDay === 6) {
      return;
    }

    setSelectedDay((prev) => prev + 1);
  };

  const handleCancel = async (item: any) => {
    Alert.alert(
      "Cancelar agendamento",
      `Deseja cancelar o agendamento de ${item.userId?.name || "cliente"}?`,
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: async () => {
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

              Alert.alert("Erro", "Não foi possível cancelar o agendamento.");
            }
          },
        },
      ],
    );
  };

  const handleConclude = async (item: any) => {
    Alert.alert(
      "Concluir agendamento",
      `Deseja marcar o atendimento de ${item.userId?.name || "cliente"} como concluído?`,
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Concluir",
          onPress: async () => {
            try {
              await concludeAppointment(item._id);

              await removeSlot(item.date, item.time);

              loadAppointments();
            } catch (error) {
              console.log("❌ ERRO AO CONCLUIR:", error);

              Alert.alert("Erro", "Não foi possível concluir o agendamento.");
            }
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    router.replace("/landing");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>Olá, Barão 👑</Text>

        {/* SELETOR DE DIAS */}

        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={[
              styles.arrowButton,
              selectedDay === 0 && styles.arrowDisabled,
            ]}
            onPress={previousDay}
            disabled={selectedDay === 0}
          >
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Text style={styles.dayName}>{getDayName()}</Text>

            <Text style={styles.dateText}>{formatDisplayDate()}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.arrowButton,
              selectedDay === 6 && styles.arrowDisabled,
            ]}
            onPress={nextDay}
            disabled={selectedDay === 6}
          >
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RESUMO */}

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Agendamentos: {appointments.length}
        </Text>

        <Text style={styles.summarySubText}>
          {selectedDay === 0
            ? "Agenda de hoje"
            : `Agenda de ${formatDisplayDate()}`}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* LISTA */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>

          <Text style={styles.emptyTitle}>Nenhum agendamento</Text>

          <Text style={styles.emptyText}>
            Não existem agendamentos para este dia.
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
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
              {/* HORÁRIO + CLIENTE */}

              <View style={styles.cardHeader}>
                <Text style={styles.time}>{item.time}</Text>

                <Text style={styles.clientName}>
                  {item.userId?.name || "Cliente"}
                </Text>
              </View>

              {/* TELEFONE */}

              {item.userId?.phone ? (
                <Text style={styles.phone}>📱 {item.userId.phone}</Text>
              ) : null}

              {/* SERVIÇOS */}

              <Text style={styles.service}>
                {item.services?.map((s: any) => s.name).join(", ")}
              </Text>

              {/* STATUS */}

              {item.status === "concluido" && (
                <Text style={styles.doneText}>✓ Atendimento concluído</Text>
              )}

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
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/")}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.iconActive}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/schedule-admin")}
        >
          <Image
            source={require("../assets/images/calendar.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/services-admin")}
        >
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

  header: {
    alignItems: "center",
  },

  dateSelector: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#151515",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  arrowButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowDisabled: {
    opacity: 0.25,
  },

  arrow: {
    color: "#000",
    fontSize: 35,
    lineHeight: 38,
    fontWeight: "bold",
  },

  dateCenter: {
    alignItems: "center",
    flex: 1,
  },

  dayName: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  dateText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 2,
  },

  summarySubText: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 15,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#777",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  clientName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  phone: {
    color: "#999",
    fontSize: 13,
    marginBottom: 8,
  },

  doneText: {
    color: "#D4AF37",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "bold",
  },

  tabItem: {
    alignItems: "center",
  },
});
