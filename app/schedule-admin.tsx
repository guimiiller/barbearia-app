import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getSchedule, saveSchedule } from "../src/services/api";

export default function ScheduleAdmin() {
  const router = useRouter();

  const [admin, setAdmin] = useState<any>(null);

  const [barberId, setBarberId] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState("");

  const [days, setDays] = useState<any[]>([]);

  const [slots, setSlots] = useState<string[]>([]);

  const [newTime, setNewTime] = useState("");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const generateDays = () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const nextDays: any[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);

      date.setDate(today.getDate() + i);

      const formatted = formatDate(date);

      const weekday = date
        .toLocaleDateString("pt-BR", {
          weekday: "short",
        })
        .replace(".", "")
        .toUpperCase();

      nextDays.push({
        fullDate: formatted,

        day: weekday,

        date: date.getDate(),
      });
    }

    return nextDays;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (!storedUser) {
          router.replace("/login");

          return;
        }

        const parsedUser = JSON.parse(storedUser);

        console.log("👑 ADMIN LOGADO:", parsedUser);

        if (parsedUser.role !== "admin") {
          router.replace("/home");

          return;
        }

        if (!parsedUser.barberId) {
          Alert.alert(
            "Conta não configurada",
            "Esta conta administrativa ainda não possui um barbeiro vinculado.",
          );

          return;
        }

        setAdmin(parsedUser);

        setBarberId(Number(parsedUser.barberId));

        const generatedDays = generateDays();

        setDays(generatedDays);

        if (generatedDays.length > 0) {
          setSelectedDate(generatedDays[0].fullDate);
        }
      } catch (error) {
        console.log("❌ ERRO AO INICIALIZAR AGENDA:", error);

        Alert.alert("Erro", "Não foi possível carregar os dados do barbeiro.");
      }
    };

    initialize();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!selectedDate || !barberId) {
        return;
      }

      loadSchedule(selectedDate, barberId);
    }, [selectedDate, barberId]),
  );

  const loadSchedule = async (date: string, currentBarberId: number) => {
    try {
      setLoading(true);

      console.log("💈 BUSCANDO AGENDA:", {
        barberId: currentBarberId,

        date,
      });

      const data = await getSchedule(date, currentBarberId);

      console.log("🕒 HORÁRIOS RECEBIDOS:", data);

      console.log("🔥 SLOTS RECEBIDOS:", data?.slots);

      console.log(
        "🔥 HORÁRIOS RECEBIDOS:",
        data?.slots?.map((slot: any) => slot.time),
      );

      const loadedSlots: string[] =
        data?.slots
          ?.map((slot: any) => String(slot.time))
          .filter(Boolean)
          .sort() || [];

      setSlots([...new Set<string>(loadedSlots)]);
    } catch (error) {
      console.log("❌ ERRO AO CARREGAR HORÁRIOS:", error);

      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const isPastTime = (date: string, time: string) => {
    const now = new Date();

    const today = formatDate(now);

    if (date !== today) {
      return false;
    }

    const [hours, minutes] = time.split(":").map(Number);

    const slotMinutes = hours * 60 + minutes;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return slotMinutes <= currentMinutes;
  };

  const addTime = () => {
    const time = newTime.trim();

    if (!time) {
      Alert.alert("Atenção", "Digite um horário.");

      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert(
        "Horário inválido",
        "Digite o horário no formato HH:MM. Exemplo: 14:00",
      );

      return;
    }

    const [hours, minutes] = time.split(":").map(Number);

    if (hours > 23 || minutes > 59) {
      Alert.alert("Horário inválido", "Digite um horário válido.");

      return;
    }

    const normalizedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    if (isPastTime(selectedDate, normalizedTime)) {
      Alert.alert("Horário inválido", "Esse horário já passou.");

      return;
    }

    if (slots.includes(normalizedTime)) {
      Alert.alert("Horário já cadastrado", "Esse horário já está disponível.");

      return;
    }

    setSlots((currentSlots) =>
      [...currentSlots, normalizedTime].sort((a, b) => a.localeCompare(b)),
    );

    setNewTime("");
  };

  const removeTime = (time: string) => {
    Alert.alert("Remover horário", `Deseja remover o horário ${time}?`, [
      {
        text: "Cancelar",

        style: "cancel",
      },

      {
        text: "Remover",

        style: "destructive",

        onPress: () => {
          setSlots((currentSlots) =>
            currentSlots.filter((slot) => slot !== time),
          );
        },
      },
    ]);
  };

  const save = async () => {
    if (!selectedDate) {
      if (typeof window !== "undefined") {
        window.alert("Selecione uma data.");
      } else {
        Alert.alert("Erro", "Selecione uma data.");
      }

      return;
    }

    if (!barberId) {
      if (typeof window !== "undefined") {
        window.alert("Não foi possível identificar o barbeiro.");
      } else {
        Alert.alert("Erro", "Não foi possível identificar o barbeiro.");
      }

      return;
    }

    try {
      setSaving(true);

      // Remove horários passados
      const validSlots = slots.filter(
        (time) => !isPastTime(selectedDate, time),
      );

      // Remove duplicados e organiza
      const uniqueSlots = [...new Set(validSlots)].sort((a, b) =>
        a.localeCompare(b),
      );

      const normalizedSlots = uniqueSlots.map((time) => ({
        time,
      }));

      console.log("======================================");
      console.log("💾 SALVANDO AGENDA");
      console.log("💈 BARBER ID:", barberId);
      console.log("📅 DATA:", selectedDate);
      console.log("🕒 SLOTS STATE:", slots);
      console.log("🕒 SLOTS VÁLIDOS:", validSlots);
      console.log("📦 SLOTS ENVIADOS:", normalizedSlots);
      console.log("======================================");

      const response = await saveSchedule({
        barberId: Number(barberId),
        date: selectedDate,
        slots: normalizedSlots,
      });

      console.log("======================================");
      console.log("✅ RESPOSTA COMPLETA DO POST:", response);
      console.log("🔥 SLOTS QUE O POST DEVOLVEU:", response?.slots);
      console.log(
        "🔥 TIMES QUE O POST DEVOLVEU:",
        response?.slots?.map((slot: any) => slot.time),
      );
      console.log("======================================");

      console.log("✅ RESPOSTA DO BACKEND:", response);

      // Mantém na tela exatamente o que acabamos de salvar.
      // NÃO chama loadSchedule imediatamente.
      setSlots(uniqueSlots);

      if (typeof window !== "undefined") {
        window.alert("Horários salvos com sucesso.");
      } else {
        Alert.alert(
          "Horários salvos",
          "Sua agenda foi atualizada com sucesso.",
        );
      }
    } catch (error: any) {
      console.log("======================================");
      console.log("❌ ERRO AO SALVAR AGENDA");
      console.log("❌ ERROR:", error);
      console.log("❌ RESPONSE:", error?.response);
      console.log("❌ DATA:", error?.response?.data);
      console.log("======================================");

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Não foi possível salvar os horários. Tente novamente.";

      if (typeof window !== "undefined") {
        window.alert(message);
      } else {
        Alert.alert("Erro", message);
      }
    } finally {
      setSaving(false);
    }
  };
  const formatSelectedDate = () => {
    if (!selectedDate) {
      return "";
    }

    const date = new Date(`${selectedDate}T00:00:00`);

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",

      day: "2-digit",

      month: "long",
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PAINEL ADMINISTRATIVO</Text>

            <Text style={styles.title}>Agenda</Text>

            <Text style={styles.subtitle}>
              {admin?.name
                ? `Horários de ${admin.name}`
                : "Controle os horários disponíveis"}
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Image
              source={require("../assets/images/calendar.png")}
              style={styles.headerIconImage}
            />
          </View>
        </View>

        {/* =================================================
            CONTEÚDO
        ================================================= */}

        <FlatList
          data={[]}
          keyExtractor={(_, index) => String(index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              {/* =============================================
                  DATA
              ============================================= */}

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>CALENDÁRIO</Text>

                  <Text style={styles.sectionTitle}>Escolha o dia</Text>
                </View>
              </View>

              {/* =============================================
                  DIAS
              ============================================= */}

              <FlatList
                horizontal
                data={days}
                keyExtractor={(item) => item.fullDate}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daysList}
                renderItem={({ item }) => {
                  const selected = selectedDate === item.fullDate;

                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.dateCard,

                        selected && styles.dateCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedDate(item.fullDate);

                        setNewTime("");
                      }}
                    >
                      <Text
                        style={[
                          styles.dateDay,

                          selected && styles.dateDaySelected,
                        ]}
                      >
                        {item.day}
                      </Text>

                      <Text
                        style={[
                          styles.dateNumber,

                          selected && styles.dateNumberSelected,
                        ]}
                      >
                        {item.date}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              {/* =============================================
                  DATA SELECIONADA
              ============================================= */}

              <View style={styles.selectedDateCard}>
                <View style={styles.selectedDateIcon}>
                  <Image
                    source={require("../assets/images/calendar.png")}
                    style={styles.selectedDateIconImage}
                  />
                </View>

                <View style={styles.selectedDateInfo}>
                  <Text style={styles.selectedDateLabel}>DATA SELECIONADA</Text>

                  <Text style={styles.selectedDateText}>
                    {formatSelectedDate()}
                  </Text>
                </View>
              </View>

              {/* =============================================
                  BARBEIRO
              ============================================= */}

              <View style={styles.barberInfoCard}>
                <View style={styles.barberAvatar}>
                  <Text style={styles.barberAvatarText}>
                    {admin?.name?.charAt(0)?.toUpperCase() || "B"}
                  </Text>
                </View>

                <View style={styles.barberInfo}>
                  <Text style={styles.barberInfoLabel}>AGENDA DE</Text>

                  <Text style={styles.barberInfoName}>
                    {admin?.name || "Barbeiro"}
                  </Text>
                </View>

                <View style={styles.barberIdBadge}>
                  <Text style={styles.barberIdText}>#{barberId || "-"}</Text>
                </View>
              </View>

              {/* =============================================
                  ADICIONAR HORÁRIO
              ============================================= */}

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>DISPONIBILIDADE</Text>

                  <Text style={styles.sectionTitle}>Adicionar horário</Text>
                </View>
              </View>

              <View style={styles.addTimeContainer}>
                <View style={styles.timeInputWrapper}>
                  <TextInput
                    placeholder="14:00"
                    placeholderTextColor="#666"
                    value={newTime}
                    onChangeText={setNewTime}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    style={styles.timeInput}
                  />

                  <Text style={styles.timeInputHint}>HH:MM</Text>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  activeOpacity={0.8}
                  onPress={addTime}
                >
                  <Text style={styles.addButtonPlus}>+</Text>

                  <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>

              {/* =============================================
                  HORÁRIOS
              ============================================= */}

              <View style={styles.scheduleHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>HORÁRIOS</Text>

                  <Text style={styles.sectionTitle}>
                    {slots.length}{" "}
                    {slots.length === 1
                      ? "horário disponível"
                      : "horários disponíveis"}
                  </Text>
                </View>
              </View>

              {/* =============================================
                  LOADING
              ============================================= */}

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />

                  <Text style={styles.loadingText}>Carregando horários...</Text>
                </View>
              ) : slots.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Text style={styles.emptyIconText}>—</Text>
                  </View>

                  <Text style={styles.emptyTitle}>
                    Nenhum horário cadastrado
                  </Text>

                  <Text style={styles.emptyDescription}>
                    Adicione os horários em que você estará disponível.
                  </Text>
                </View>
              ) : (
                <View style={styles.slotsGrid}>
                  {slots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      activeOpacity={0.75}
                      style={styles.slotCard}
                      onPress={() => removeTime(time)}
                    >
                      <View style={styles.slotIndicator} />

                      <Text style={styles.slotTime}>{time}</Text>

                      <View style={styles.removeIcon}>
                        <Text style={styles.removeIconText}>×</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* =============================================
                  SALVAR
              ============================================= */}

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={save}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>Salvar alterações</Text>

                    <Text style={styles.saveButtonArrow}>→</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.bottomSpace} />
            </>
          }
          renderItem={null}
        />

        {/* =================================================
            NAVBAR
        ================================================= */}

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push("/admin")}
          >
            <Image
              source={require("../assets/images/home.png")}
              style={styles.tabIcon}
            />

            <Text style={styles.tabText}>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push("/schedule-admin")}
          >
            <Image
              source={require("../assets/images/calendar.png")}
              style={styles.tabIconActive}
            />

            <Text style={styles.tabTextActive}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push("/services-admin")}
          >
            <Image
              source={require("../assets/images/services.png")}
              style={styles.tabIcon}
            />

            <Text style={styles.tabText}>Serviços</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eyebrow: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 7,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIconImage: {
    width: 22,
    height: 22,
    tintColor: "#FFFFFF",
  },

  sectionHeader: {
    marginTop: 5,
    marginBottom: 15,
  },

  sectionEyebrow: {
    color: "#666",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  daysList: {
    paddingRight: 10,
    marginBottom: 18,
  },

  dateCard: {
    width: 64,
    height: 78,
    borderRadius: 17,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  dateCardSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  dateDay: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 7,
  },

  dateDaySelected: {
    color: "#555",
  },

  dateNumber: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  dateNumberSelected: {
    color: "#000000",
  },

  selectedDateCard: {
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  selectedDateIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  selectedDateIconImage: {
    width: 19,
    height: 19,
    tintColor: "#000000",
  },

  selectedDateInfo: {
    flex: 1,
  },

  selectedDateLabel: {
    color: "#666",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  selectedDateText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  barberInfoCard: {
    backgroundColor: "#111111",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  barberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  barberAvatarText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },

  barberInfo: {
    flex: 1,
  },

  barberInfoLabel: {
    color: "#555",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 3,
  },

  barberInfoName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  barberIdBadge: {
    backgroundColor: "#202020",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  barberIdText: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
  },

  addTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },

  timeInputWrapper: {
    flex: 1,
    height: 52,
    backgroundColor: "#151515",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  timeInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  timeInputHint: {
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
  },

  addButton: {
    height: 52,
    paddingHorizontal: 17,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonPlus: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "300",
    marginRight: 5,
    marginTop: -2,
  },

  addButtonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
  },

  scheduleHeader: {
    marginBottom: 15,
  },

  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  slotCard: {
    width: "31.5%",
    minHeight: 62,
    backgroundColor: "#151515",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  slotIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },

  slotTime: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  removeIcon: {
    position: "absolute",
    bottom: 7,
    left: 8,
  },

  removeIconText: {
    color: "#555",
    fontSize: 13,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
  },

  loadingText: {
    color: "#666",
    fontSize: 12,
    marginTop: 10,
  },

  emptyCard: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyIconText: {
    color: "#777",
    fontSize: 22,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  emptyDescription: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  saveButton: {
    height: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  saveButtonArrow: {
    color: "#000000",
    fontSize: 20,
    marginLeft: 12,
  },

  bottomSpace: {
    height: 30,
  },

  tabBar: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    width: "78%",
    height: 66,
    borderRadius: 22,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 65,
  },

  tabIcon: {
    width: 21,
    height: 21,
    tintColor: "#666",
    marginBottom: 4,
  },

  tabIconActive: {
    width: 21,
    height: 21,
    tintColor: "#FFFFFF",
    marginBottom: 4,
  },

  tabText: {
    color: "#666",
    fontSize: 9,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});
