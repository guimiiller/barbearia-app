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

      filtered.sort((a: any, b: any) => a.time.localeCompare(b.time));

      setAppointments(filtered);
    } catch (error) {
      console.log("❌ Erro ao buscar agendamentos", error);
    } finally {
      setLoading(false);
    }
  };

  const previousDay = () => {
    if (selectedDay === 0) return;

    setSelectedDay((prev) => prev - 1);
  };

  const nextDay = () => {
    if (selectedDay === 6) return;

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
      "Concluir atendimento",
      `Deseja marcar o atendimento de ${
        item.userId?.name || "cliente"
      } como concluído?`,
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

              Alert.alert("Erro", "Não foi possível concluir o atendimento.");
            }
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    Alert.alert("Sair da conta", "Deseja realmente sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");

          router.replace("/landing");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>PAINEL DO BARÃO</Text>

            <Text style={styles.title}>
              Olá, Barão <Text style={styles.crown}>♛</Text>
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileLetter}>B</Text>
          </View>
        </View>

        {/* SELETOR DE DATA */}

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
        <View>
          <Text style={styles.summaryLabel}>AGENDA</Text>

          <Text style={styles.summaryTitle}>
            {selectedDay === 0
              ? "Atendimentos de hoje"
              : `Atendimentos de ${formatDisplayDate()}`}
          </Text>
        </View>

        <View style={styles.countBox}>
          <Text style={styles.countNumber}>{appointments.length}</Text>

          <Text style={styles.countLabel}>HORÁRIOS</Text>
        </View>
      </View>

      {/* LISTA */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />

          <Text style={styles.loadingText}>Carregando agenda...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>○</Text>
          </View>

          <Text style={styles.emptyTitle}>Agenda livre</Text>

          <Text style={styles.emptyText}>
            Nenhum atendimento está marcado para este dia.
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={appointments}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.card,
                item.status === "concluido" && styles.cardDone,
              ]}
            >
              {/* LINHA SUPERIOR */}

              <View style={styles.cardTop}>
                <View style={styles.timeContainer}>
                  <Text style={styles.time}>{item.time}</Text>

                  <View style={styles.timeLine} />
                </View>

                <View style={styles.clientContainer}>
                  <Text style={styles.clientLabel}>CLIENTE</Text>

                  <Text style={styles.clientName}>
                    {item.userId?.name || "Cliente"}
                  </Text>
                </View>

                <View style={styles.numberBadge}>
                  <Text style={styles.numberBadgeText}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* TELEFONE */}

              {item.userId?.phone ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>TELEFONE</Text>

                  <Text style={styles.infoValue}>{item.userId.phone}</Text>
                </View>
              ) : null}

              {/* SERVIÇOS */}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SERVIÇO</Text>

                <Text style={styles.infoValue}>
                  {item.services?.map((s: any) => s.name).join(", ") ||
                    "Serviço"}
                </Text>
              </View>

              {/* STATUS */}

              {item.status === "concluido" && (
                <View style={styles.doneContainer}>
                  <View style={styles.doneDot} />

                  <Text style={styles.doneText}>Atendimento concluído</Text>
                </View>
              )}

              {/* BOTÕES */}

              {item.status !== "concluido" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.concludeBtn}
                    onPress={() => handleConclude(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.concludeBtnText}>
                      Concluir atendimento
                    </Text>

                    <Text style={styles.buttonArrow}>→</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      {/* LOGOUT */}

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      {/* NAVBAR */}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin")}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.iconActive}
          />

          <Text style={styles.tabTextActive}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/schedule-admin")}
        >
          <Image
            source={require("../assets/images/calendar.png")}
            style={styles.icon}
          />

          <Text style={styles.tabText}>Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/services-admin")}
        >
          <Image
            source={require("../assets/images/services.png")}
            style={styles.icon}
          />

          <Text style={styles.tabText}>Serviços</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    paddingHorizontal: 20,
    paddingTop: 48,
  },

  /* HEADER */

  header: {
    marginBottom: 24,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  eyebrow: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  crown: {
    color: "#FFFFFF",
  },

  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  profileLetter: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "800",
  },

  /* DATA */

  dateSelector: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 20,
    padding: 10,
  },

  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowDisabled: {
    opacity: 0.2,
  },

  arrow: {
    color: "#000000",
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "400",
  },

  dateCenter: {
    flex: 1,
    alignItems: "center",
  },

  dayName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  dateText: {
    color: "#888",
    fontSize: 14,
    marginTop: 3,
  },

  /* RESUMO */

  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  summaryLabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  countBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    minWidth: 62,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  countNumber: {
    color: "#000000",
    fontSize: 19,
    fontWeight: "800",
  },

  countLabel: {
    color: "#555",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 1,
  },

  /* LISTA */

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 170,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },

  loadingText: {
    color: "#666",
    fontSize: 13,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 130,
    paddingHorizontal: 40,
  },

  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyIcon: {
    color: "#FFFFFF",
    fontSize: 30,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  emptyText: {
    color: "#666",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  /* CARD */

  card: {
    backgroundColor: "#121212",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#242424",
  },

  cardDone: {
    opacity: 0.5,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeContainer: {
    width: 70,
    alignItems: "flex-start",
  },

  time: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  timeLine: {
    width: 25,
    height: 2,
    backgroundColor: "#FFFFFF",
    marginTop: 7,
    borderRadius: 2,
  },

  clientContainer: {
    flex: 1,
    marginLeft: 8,
  },

  clientLabel: {
    color: "#666",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  clientName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1D1D1D",
    alignItems: "center",
    justifyContent: "center",
  },

  numberBadgeText: {
    color: "#666",
    fontSize: 10,
    fontWeight: "700",
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#242424",
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 9,
  },

  infoLabel: {
    width: 70,
    color: "#555",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    paddingTop: 2,
  },

  infoValue: {
    flex: 1,
    color: "#BDBDBD",
    fontSize: 13,
    lineHeight: 18,
  },

  /* CONCLUÍDO */

  doneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#242424",
  },

  doneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },

  doneText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  /* AÇÕES */

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  concludeBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    minHeight: 46,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  concludeBtnText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "800",
  },

  buttonArrow: {
    color: "#000000",
    fontSize: 19,
    fontWeight: "400",
  },

  cancelBtn: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: "#1D1D1D",
    borderWidth: 1,
    borderColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtnText: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "700",
  },

  /* LOGOUT */

  logoutBtn: {
    position: "absolute",
    bottom: 94,
    right: 20,
    left: 20,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: "#777",
    fontSize: 12,
    fontWeight: "700",
  },

  /* NAVBAR */

  tabBar: {
    position: "absolute",
    bottom: 22,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#282828",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    width: "78%",
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  icon: {
    width: 22,
    height: 22,
    tintColor: "#666666",
  },

  iconActive: {
    width: 22,
    height: 22,
    tintColor: "#FFFFFF",
  },

  tabText: {
    color: "#666666",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
  },

  tabTextActive: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 4,
  },
});
