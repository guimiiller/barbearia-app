import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getAllAppointments, getSchedule } from "../src/services/api";

export default function Schedule() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rescheduleId = params.rescheduleId as string | undefined;

  const services = params.services ? JSON.parse(params.services as string) : [];

  const [selectedBarber, setSelectedBarber] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [appointments, setAppointments] = useState<any[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const barbers = [
    {
      id: 1,
      name: "Barão",
    },

    {
      id: 2,
      name: "Kauan",
    },

    {
      id: 3,
      name: "Mario",
    },
  ];

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const generateDates = () => {
    const dates = [];

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const future = new Date(today);

      future.setDate(today.getDate() + i);

      const formatted = formatDate(future);

      const day = future
        .toLocaleDateString("pt-BR", {
          weekday: "short",
        })
        .toUpperCase()
        .replace(".", "");

      dates.push({
        fullDate: formatted,
        day,
        date: future.getDate(),
      });
    }

    return dates;
  };

  const dates = generateDates();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getAllAppointments();

        console.log("📋 AGENDAMENTOS:", data);

        setAppointments(data || []);
      } catch (err) {
        console.log("❌ Erro ao buscar agendamentos:", err);
      }
    };

    loadAppointments();
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoadingTimes(true);

        setSelectedTime(null);

        console.log("📅 CLIENTE BUSCANDO HORÁRIOS:", {
          date: selectedDate,
          barberId: selectedBarber,
        });

        const data = await getSchedule(selectedDate, selectedBarber);

        const horarios =
          data?.slots?.map((slot: any) => slot.time).filter(Boolean) || [];

        const uniqueSorted = [...new Set(horarios as string[])].sort();

        console.log("💈 BARBEIRO:", selectedBarber);

        console.log("🕒 HORÁRIOS:", uniqueSorted);

        setTimes(uniqueSorted);
      } catch (err) {
        console.log("❌ Erro ao carregar horários:", err);

        setTimes([]);

        setSelectedTime(null);
      } finally {
        setLoadingTimes(false);
      }
    };

    if (selectedDate) {
      loadSchedule();
    }
  }, [selectedDate, selectedBarber]);

  const availableTimes = times.filter((time) => {
    return !appointments.some((appointment) => {
      const appointmentDate =
        typeof appointment.date === "string"
          ? appointment.date.split("T")[0]
          : appointment.date;

      return (
        appointmentDate === selectedDate &&
        appointment.time === time &&
        Number(appointment.barberId) === Number(selectedBarber) &&
        appointment.status !== "cancelado" &&
        appointment._id !== rescheduleId
      );
    });
  });

  const handleGoToConfirm = () => {
    if (!selectedTime) {
      Alert.alert(
        "Escolha um horário",
        "Selecione um horário disponível para continuar.",
      );

      return;
    }

    if (!services || services.length === 0) {
      Alert.alert(
        "Nenhum serviço selecionado",
        "Volte para a tela inicial e escolha pelo menos um serviço.",
      );

      return;
    }

    router.push({
      pathname: "/confirm",

      params: {
        services: JSON.stringify(services),
        date: selectedDate,
        time: selectedTime,
        barberId: String(selectedBarber),
        rescheduleId: rescheduleId || "",
      },
    });
  };

  const selectedDateObject = dates.find(
    (item) => item.fullDate === selectedDate,
  );

  const formattedSelectedDate = selectedDateObject
    ? `${selectedDateObject.date} ${getMonthName(selectedDate)}`
    : "";

  const totalPrice = services.reduce(
    (total: number, service: any) => total + Number(service.price || 0),
    0,
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerEyebrow}>BARÃO BARBER</Text>

            <Text style={styles.headerTitle}>Agendar horário</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* SERVIÇOS SELECIONADOS */}

        <View style={styles.selectedServicesCard}>
          <View style={styles.selectedServicesHeader}>
            <View>
              <Text style={styles.eyebrow}>SEU ATENDIMENTO</Text>

              <Text style={styles.selectedServicesTitle}>
                Serviços selecionados
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{services.length}</Text>
            </View>
          </View>

          {services.length === 0 ? (
            <Text style={styles.noServices}>Nenhum serviço selecionado.</Text>
          ) : (
            <>
              <View style={styles.serviceList}>
                {services.map((service: any, index: number) => (
                  <View
                    key={service._id || index}
                    style={styles.selectedService}
                  >
                    <View style={styles.serviceDot}>
                      <Text style={styles.serviceDotText}>✓</Text>
                    </View>

                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>

                      <Text style={styles.servicePrice}>
                        R$ {Number(service.price).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.totalDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>

                <Text style={styles.totalValue}>
                  R$ {totalPrice.toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* DATA */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>01</Text>

              <Text style={styles.sectionTitle}>Escolha a data</Text>
            </View>

            <Text style={styles.selectedDateLabel}>
              {formattedSelectedDate}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          >
            {dates.map((item) => {
              const selected = selectedDate === item.fullDate;

              return (
                <TouchableOpacity
                  key={item.fullDate}
                  activeOpacity={0.8}
                  style={[styles.dateItem, selected && styles.dateItemSelected]}
                  onPress={() => {
                    setSelectedDate(item.fullDate);
                  }}
                >
                  <Text
                    style={[styles.dateDay, selected && styles.dateDaySelected]}
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

                  {selected && <View style={styles.dateIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* BARBEIRO */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>02</Text>

              <Text style={styles.sectionTitle}>Escolha seu barbeiro</Text>
            </View>
          </View>

          <View style={styles.barbers}>
            {barbers.map((barber) => {
              const selected = selectedBarber === barber.id;

              return (
                <TouchableOpacity
                  key={barber.id}
                  activeOpacity={0.8}
                  style={[
                    styles.barberCard,
                    selected && styles.barberCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedBarber(barber.id);
                    setSelectedTime(null);
                  }}
                >
                  <View
                    style={[
                      styles.barberAvatar,
                      selected && styles.barberAvatarSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.barberAvatarText,
                        selected && styles.barberAvatarTextSelected,
                      ]}
                    >
                      {barber.name.charAt(0)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.barberName,
                      selected && styles.barberNameSelected,
                    ]}
                  >
                    {barber.name}
                  </Text>

                  {selected && (
                    <View style={styles.barberCheck}>
                      <Text style={styles.barberCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* HORÁRIOS */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>03</Text>

              <Text style={styles.sectionTitle}>Escolha o horário</Text>
            </View>
          </View>

          {loadingTimes ? (
            <View style={styles.loadingTimes}>
              <ActivityIndicator size="small" color="#FFFFFF" />

              <Text style={styles.loadingText}>Buscando horários...</Text>
            </View>
          ) : availableTimes.length === 0 ? (
            <View style={styles.emptyTimes}>
              <Text style={styles.emptyTimesIcon}>—</Text>

              <Text style={styles.emptyTimesTitle}>
                Nenhum horário disponível
              </Text>

              <Text style={styles.emptyTimesDescription}>
                Tente escolher outra data ou barbeiro.
              </Text>
            </View>
          ) : (
            <View style={styles.times}>
              {availableTimes.map((time) => {
                const selected = selectedTime === time;

                return (
                  <TouchableOpacity
                    key={time}
                    activeOpacity={0.8}
                    style={[styles.time, selected && styles.timeSelected]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selected && styles.timeTextSelected,
                      ]}
                    >
                      {time}
                    </Text>

                    {selected && <Text style={styles.timeCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* RESUMO */}

        {selectedTime && (
          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryEyebrow}>SEU HORÁRIO</Text>

              <Text style={styles.summaryTitle}>
                {formattedSelectedDate} às {selectedTime}
              </Text>

              <Text style={styles.summarySubtitle}>
                Barbeiro{" "}
                {barbers.find((barber) => barber.id === selectedBarber)?.name ||
                  "Barão"}
              </Text>
            </View>

            <View style={styles.summaryCheck}>
              <Text style={styles.summaryCheckText}>✓</Text>
            </View>
          </View>
        )}

        {/* BOTÃO */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.button,
            (!selectedTime || services.length === 0) && styles.buttonDisabled,
          ]}
          disabled={!selectedTime || services.length === 0}
          onPress={handleGoToConfirm}
        >
          <Text style={styles.buttonText}>Continuar</Text>

          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Você poderá revisar seu agendamento antes de confirmar.
        </Text>
      </ScrollView>
    </View>
  );
}

function getMonthName(dateString: string) {
  const month = Number(dateString.split("-")[1]);

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

  return months[month - 1];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 32,
    marginTop: -3,
  },

  headerCenter: {
    alignItems: "center",
  },

  headerEyebrow: {
    color: "#777",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 4,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  headerSpacer: {
    width: 42,
  },

  /* SERVIÇOS */

  selectedServicesCard: {
    backgroundColor: "#171717",
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#252525",
  },

  selectedServicesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  eyebrow: {
    color: "#777",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 5,
  },

  selectedServicesTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  countBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "800",
  },

  serviceList: {
    gap: 10,
  },

  selectedService: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  serviceDotText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "800",
  },

  serviceInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  serviceName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  servicePrice: {
    color: "#aaa",
    fontSize: 13,
  },

  noServices: {
    color: "#777",
    fontSize: 13,
  },

  totalDivider: {
    height: 1,
    backgroundColor: "#292929",
    marginVertical: 16,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    color: "#777",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  totalValue: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  /* SEÇÕES */

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
  },

  selectedDateLabel: {
    color: "#777",
    fontSize: 12,
    fontWeight: "600",
  },

  /* DATAS */

  dateList: {
    gap: 10,
    paddingRight: 10,
  },

  dateItem: {
    width: 62,
    height: 78,
    backgroundColor: "#171717",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#242424",
  },

  dateItemSelected: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  dateDay: {
    color: "#777",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 8,
  },

  dateDaySelected: {
    color: "#555",
  },

  dateNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  dateNumberSelected: {
    color: "#000",
  },

  dateIndicator: {
    position: "absolute",
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#000",
  },

  /* BARBEIROS */

  barbers: {
    flexDirection: "row",
    gap: 10,
  },

  barberCard: {
    flex: 1,
    minHeight: 108,
    backgroundColor: "#171717",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#242424",
    position: "relative",
  },

  barberCardSelected: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  barberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  barberAvatarSelected: {
    backgroundColor: "#000",
  },

  barberAvatarText: {
    color: "#aaa",
    fontSize: 17,
    fontWeight: "800",
  },

  barberAvatarTextSelected: {
    color: "#fff",
  },

  barberName: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
  },

  barberNameSelected: {
    color: "#000",
  },

  barberCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  barberCheckText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },

  /* HORÁRIOS */

  times: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  time: {
    width: "30%",
    minHeight: 48,
    backgroundColor: "#171717",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#242424",
    position: "relative",
  },

  timeSelected: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  timeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  timeTextSelected: {
    color: "#000",
  },

  timeCheck: {
    position: "absolute",
    right: 7,
    top: 5,
    color: "#000",
    fontSize: 9,
    fontWeight: "900",
  },

  loadingTimes: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151515",
    borderRadius: 18,
    gap: 10,
  },

  loadingText: {
    color: "#777",
    fontSize: 12,
  },

  emptyTimes: {
    minHeight: 140,
    backgroundColor: "#151515",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  emptyTimesIcon: {
    color: "#555",
    fontSize: 24,
    marginBottom: 8,
  },

  emptyTimesTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },

  emptyTimesDescription: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },

  /* RESUMO */

  summary: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryEyebrow: {
    color: "#777",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  summaryTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },

  summarySubtitle: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },

  summaryCheck: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCheckText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  /* BOTÃO */

  button: {
    backgroundColor: "#fff",
    borderRadius: 16,
    minHeight: 58,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttonDisabled: {
    opacity: 0.35,
  },

  buttonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonArrow: {
    color: "#000",
    fontSize: 22,
    fontWeight: "600",
  },

  footerText: {
    color: "#555",
    fontSize: 11,
    textAlign: "center",
    marginTop: 13,
  },
});
