import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
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
  getBarberAppointments,
} from "../src/services/api";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

function FadeInUp({
  children,
  delay = 0,
  distance = 22,
  style,
}: {
  children?: ReactNode;
  delay?: number;
  distance?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            {
              translateY,
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function ScaleButton({
  children,
  style,
  onPress,
  disabled = false,
}: {
  children: ReactNode;
  style?: any;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;

    Animated.spring(scale, {
      toValue: 0.95,
      speed: 35,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    Animated.spring(scale, {
      toValue: 1,
      speed: 25,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        style,
        {
          transform: [{ scale }],
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}

export default function Admin() {
  const router = useRouter();

  const [admin, setAdmin] = useState<any>(null);

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

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const parsedAdmin = JSON.parse(storedUser);

      console.log("👑 ADMIN LOGADO:", parsedAdmin);

      if (parsedAdmin.role !== "admin") {
        router.replace("/home");
        return;
      }

      if (!parsedAdmin.barberId) {
        Alert.alert(
          "Conta não configurada",
          "Esta conta de administrador ainda não possui um barbeiro vinculado.",
        );

        setAppointments([]);
        return;
      }

      setAdmin(parsedAdmin);

      const data = await getBarberAppointments(Number(parsedAdmin.barberId));

      const selectedDate = formatApiDate(getSelectedDate());

      console.log("💈 BARBER ID:", parsedAdmin.barberId);

      console.log("📅 DIA SELECIONADO:", selectedDate);

      console.log("📋 AGENDA DO BARBEIRO:", data);

      const filtered = (data || []).filter(
        (appointment: any) =>
          appointment.date === selectedDate &&
          appointment.status !== "cancelado",
      );

      filtered.sort((a: any, b: any) => a.time.localeCompare(b.time));

      setAppointments(filtered);
    } catch (error) {
      console.log("❌ Erro ao buscar agendamentos:", error);
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

  // =====================================================
  // CANCELAR AGENDAMENTO
  // =====================================================

  const performCancel = async (item: any) => {
    try {
      console.log("🗑 CANCELANDO AGENDAMENTO:", item._id);

      const response = await cancelAppointment(item._id, "admin");

      console.log("✅ CANCELAMENTO ADMIN:", response);

      await loadAppointments();

      if (typeof window !== "undefined") {
        window.alert("Agendamento cancelado com sucesso.");
      } else {
        Alert.alert(
          "Agendamento cancelado",
          "O agendamento foi cancelado com sucesso.",
        );
      }
    } catch (error: any) {
      console.log("❌ ERRO CANCELAMENTO:", error?.response?.data || error);

      const message =
        error?.response?.data?.error ||
        "Não foi possível cancelar o agendamento.";

      if (typeof window !== "undefined") {
        window.alert(message);
      } else {
        Alert.alert("Erro", message);
      }
    }
  };

  const handleCancel = (item: any) => {
    const clientName = item.userId?.name || "cliente";

    // =====================================================
    // WEB / PWA
    // =====================================================

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Deseja cancelar o agendamento de ${clientName}?`,
      );

      if (confirmed) {
        void performCancel(item);
      }

      return;
    }

    // =====================================================
    // ANDROID / IOS
    // =====================================================

    Alert.alert(
      "Cancelar agendamento",
      `Deseja cancelar o agendamento de ${clientName}?`,
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => {
            void performCancel(item);
          },
        },
      ],
    );
  };

  // =====================================================
  // CONCLUIR AGENDAMENTO
  // =====================================================

  const performConclude = async (item: any) => {
    try {
      console.log("✅ CONCLUINDO AGENDAMENTO:", item._id);

      const response = await concludeAppointment(item._id);

      console.log("✅ ATENDIMENTO CONCLUÍDO:", response);

      await loadAppointments();

      if (typeof window !== "undefined") {
        window.alert("Atendimento concluído com sucesso.");
      } else {
        Alert.alert(
          "Atendimento concluído",
          "O atendimento foi concluído com sucesso.",
        );
      }
    } catch (error: any) {
      console.log("❌ ERRO AO CONCLUIR:", error?.response?.data || error);

      const message =
        error?.response?.data?.error ||
        "Não foi possível concluir o atendimento.";

      if (typeof window !== "undefined") {
        window.alert(message);
      } else {
        Alert.alert("Erro", message);
      }
    }
  };

  const handleConclude = (item: any) => {
    const clientName = item.userId?.name || "cliente";

    // =====================================================
    // WEB / PWA
    // =====================================================

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Deseja marcar o atendimento de ${clientName} como concluído?`,
      );

      if (confirmed) {
        void performConclude(item);
      }

      return;
    }

    // =====================================================
    // ANDROID / IOS
    // =====================================================

    Alert.alert(
      "Concluir atendimento",
      `Deseja marcar o atendimento de ${clientName} como concluído?`,
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Concluir",
          onPress: () => {
            void performConclude(item);
          },
        },
      ],
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const performLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);

      setAdmin(null);

      console.log("✅ ADMIN DESLOGADO");

      router.replace("/login");
    } catch (error) {
      console.log("❌ ERRO AO SAIR:", error);

      if (typeof window !== "undefined") {
        window.alert("Não foi possível sair da conta.");
      } else {
        Alert.alert("Erro", "Não foi possível sair da conta.");
      }
    }
  };

  const handleLogout = () => {
    // =====================================================
    // WEB / PWA
    // =====================================================

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Tem certeza que deseja sair da sua conta?",
      );

      if (confirmed) {
        void performLogout();
      }

      return;
    }

    // =====================================================
    // ANDROID / IOS
    // =====================================================

    Alert.alert("Sair da conta", "Deseja realmente sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <FadeInUp delay={0} distance={16} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>PAINEL DO BARBEIRO</Text>

            <Text style={styles.title}>
              Olá, {admin?.name || "Barbeiro"}{" "}
              <Text style={styles.crown}>♛</Text>
            </Text>
          </View>

          <ScaleButton style={styles.profileCircle} onPress={() => {}}>
            <Text style={styles.profileLetter}>
              {admin?.name?.charAt(0)?.toUpperCase() || "B"}
            </Text>
          </ScaleButton>
        </View>

        {/* DATA */}

        <FadeInUp delay={80} distance={12} style={styles.dateSelector}>
          <ScaleButton
            style={[
              styles.arrowButton,

              selectedDay === 0 && styles.arrowDisabled,
            ]}
            onPress={previousDay}
            disabled={selectedDay === 0}
          >
            <Text style={styles.arrow}>‹</Text>
          </ScaleButton>

          <View style={styles.dateCenter}>
            <Text style={styles.dayName}>{getDayName()}</Text>

            <Text style={styles.dateText}>{formatDisplayDate()}</Text>
          </View>

          <ScaleButton
            style={[
              styles.arrowButton,

              selectedDay === 6 && styles.arrowDisabled,
            ]}
            onPress={nextDay}
            disabled={selectedDay === 6}
          >
            <Text style={styles.arrow}>›</Text>
          </ScaleButton>
        </FadeInUp>
      </FadeInUp>

      {/* RESUMO */}

      <FadeInUp delay={150} distance={18} style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>AGENDA</Text>

          <Text style={styles.summaryTitle}>
            {selectedDay === 0
              ? "Atendimentos de hoje"
              : `Atendimentos de ${formatDisplayDate()}`}
          </Text>
        </View>

        <FadeInUp delay={250} distance={10} style={styles.countBox}>
          <Text style={styles.countNumber}>{appointments.length}</Text>

          <Text style={styles.countLabel}>HORÁRIOS</Text>
        </FadeInUp>
      </FadeInUp>

      {/* LISTA */}

      {loading ? (
        <FadeInUp delay={200} distance={15} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />

          <Text style={styles.loadingText}>Carregando agenda...</Text>
        </FadeInUp>
      ) : appointments.length === 0 ? (
        <FadeInUp delay={220} distance={25} style={styles.emptyContainer}>
          <FadeInUp delay={300} distance={12} style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>○</Text>
          </FadeInUp>

          <Text style={styles.emptyTitle}>Agenda livre</Text>

          <Text style={styles.emptyText}>
            Nenhum atendimento está marcado para este dia.
          </Text>
        </FadeInUp>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={appointments}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <FadeInUp delay={200 + index * 90} distance={25}>
              <View
                style={[
                  styles.card,

                  item.status === "concluido" && styles.cardDone,
                ]}
              >
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

                {/* SERVIÇO */}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>SERVIÇO</Text>

                  <Text style={styles.infoValue}>
                    {item.services?.map((s: any) => s.name).join(", ") ||
                      "Serviço"}
                  </Text>
                </View>

                {/* BOTÕES */}

                <View style={styles.actions}>
                  <ScaleButton
                    style={styles.concludeBtn}
                    onPress={() => handleConclude(item)}
                  >
                    <Text style={styles.concludeBtnText}>
                      Concluir atendimento
                    </Text>

                    <Text style={styles.buttonArrow}>→</Text>
                  </ScaleButton>

                  <ScaleButton
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item)}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </ScaleButton>
                </View>
              </View>
            </FadeInUp>
          )}
        />
      )}

      {/* LOGOUT */}

      <FadeInUp delay={500} distance={18} style={styles.logoutWrapper}>
        <ScaleButton style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </ScaleButton>
      </FadeInUp>

      {/* NAVBAR */}

      <FadeInUp delay={450} distance={24} style={styles.tabBar}>
        <ScaleButton
          style={styles.tabItem}
          onPress={() => router.push("/admin")}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.iconActive}
          />

          <Text style={styles.tabTextActive}>Início</Text>
        </ScaleButton>

        <ScaleButton
          style={styles.tabItem}
          onPress={() => router.push("/schedule-admin")}
        >
          <Image
            source={require("../assets/images/calendar.png")}
            style={styles.icon}
          />

          <Text style={styles.tabText}>Agenda</Text>
        </ScaleButton>

        <ScaleButton
          style={styles.tabItem}
          onPress={() => router.push("/services-admin")}
        >
          <Image
            source={require("../assets/images/services.png")}
            style={styles.icon}
          />

          <Text style={styles.tabText}>Serviços</Text>
        </ScaleButton>
      </FadeInUp>
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

  logoutWrapper: {
    position: "absolute",
    bottom: 94,
    left: 20,
    right: 20,
  },

  logoutBtn: {
    width: "100%",
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
