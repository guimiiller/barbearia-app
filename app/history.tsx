import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getAppointments } from "../src/services/api";

export default function History() {
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

      const userStorage = await AsyncStorage.getItem("user");

      if (!userStorage) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(userStorage);

      const data = await getAppointments(user.id || user._id);

      setAppointments(data || []);
    } catch (err) {
      console.log("❌ Erro ao carregar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return {
        weekday: "",
        day: "",
        month: "",
      };
    }

    const date = new Date(`${dateString}T12:00:00`);

    const weekday = date
      .toLocaleDateString("pt-BR", {
        weekday: "short",
      })
      .replace(".", "")
      .toUpperCase();

    const day = String(date.getDate()).padStart(2, "0");

    const month = date
      .toLocaleDateString("pt-BR", {
        month: "short",
      })
      .replace(".", "")
      .toUpperCase();

    return {
      weekday,
      day,
      month,
    };
  };

  const getStatus = (status: string) => {
    if (status === "cancelado") {
      return {
        label: "CANCELADO",
        description: "Este horário foi cancelado",
      };
    }

    if (status === "concluido" || status === "concluído") {
      return {
        label: "CONCLUÍDO",
        description: "Atendimento realizado",
      };
    }

    return {
      label: "CONFIRMADO",
      description: "Agendamento confirmado",
    };
  };

  const renderAppointment = ({ item }: { item: any }) => {
    const date = formatDate(item.date);
    const status = getStatus(item.status);

    const isCancelled = item.status === "cancelado";

    return (
      <View style={styles.card}>
        {/* TOPO DO CARD */}

        <View style={styles.cardTop}>
          <View style={styles.dateBox}>
            <Text style={styles.dateWeekday}>{date.weekday}</Text>

            <Text style={styles.dateDay}>{date.day}</Text>

            <Text style={styles.dateMonth}>{date.month}</Text>
          </View>

          <View style={styles.cardHeaderInfo}>
            <Text style={styles.appointmentLabel}>AGENDAMENTO</Text>

            <Text style={styles.time}>{item.time}</Text>

            <Text style={styles.barber}>Barão Barber</Text>
          </View>

          <View
            style={[styles.statusDot, isCancelled && styles.statusDotCancelled]}
          />
        </View>

        <View style={styles.divider} />

        {/* SERVIÇOS */}

        <View style={styles.servicesSection}>
          <Text style={styles.sectionLabel}>SERVIÇOS</Text>

          {item.services?.length > 0 ? (
            item.services.map((service: any, index: number) => (
              <View key={index} style={styles.serviceRow}>
                <View style={styles.serviceBullet} />

                <Text style={styles.serviceName}>{service.name}</Text>

                {service.price !== undefined && (
                  <Text style={styles.servicePrice}>
                    R$ {Number(service.price).toFixed(2)}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noService}>Serviço não informado</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* STATUS */}

        <View style={styles.statusContainer}>
          <View>
            <Text
              style={[
                styles.statusLabel,
                isCancelled && styles.statusLabelCancelled,
              ]}
            >
              {status.label}
            </Text>

            <Text style={styles.statusDescription}>{status.description}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isCancelled && styles.statusBadgeCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isCancelled && styles.statusBadgeTextCancelled,
              ]}
            >
              {isCancelled ? "×" : "✓"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>BARÃO BARBER</Text>

          <Text style={styles.title}>Histórico</Text>
        </View>
      </View>

      {/* DESCRIÇÃO */}

      <Text style={styles.description}>
        Confira seus agendamentos e acompanhe seus atendimentos.
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />

          <Text style={styles.loadingText}>Carregando seu histórico...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>✦</Text>
          </View>

          <Text style={styles.emptyTitle}>Nenhum agendamento</Text>

          <Text style={styles.emptyDescription}>
            Seus próximos atendimentos aparecerão aqui.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/schedule")}
          >
            <Text style={styles.emptyButtonText}>Agendar horário</Text>

            <Text style={styles.emptyButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={renderAppointment}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  backIcon: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 34,
    marginTop: -3,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  description: {
    color: "#777",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 25,
    maxWidth: 320,
  },

  /* LISTA */

  list: {
    paddingBottom: 40,
  },

  /* CARD */

  card: {
    backgroundColor: "#151515",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#242424",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateBox: {
    width: 64,
    height: 78,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  dateWeekday: {
    color: "#777",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },

  dateDay: {
    color: "#0B0B0B",
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 29,
  },

  dateMonth: {
    color: "#555",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },

  cardHeaderInfo: {
    flex: 1,
    marginLeft: 15,
  },

  appointmentLabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  time: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  barber: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    marginBottom: 45,
  },

  statusDotCancelled: {
    backgroundColor: "#555",
  },

  divider: {
    height: 1,
    backgroundColor: "#252525",
    marginVertical: 17,
  },

  /* SERVIÇOS */

  servicesSection: {
    gap: 10,
  },

  sectionLabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginRight: 10,
  },

  serviceName: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
  },

  servicePrice: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },

  noService: {
    color: "#666",
    fontSize: 13,
  },

  /* STATUS */

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  statusLabelCancelled: {
    color: "#777",
  },

  statusDescription: {
    color: "#666",
    fontSize: 11,
  },

  statusBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadgeCancelled: {
    backgroundColor: "#242424",
  },

  statusBadgeText: {
    color: "#0B0B0B",
    fontSize: 18,
    fontWeight: "800",
  },

  statusBadgeTextCancelled: {
    color: "#777",
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },

  loadingText: {
    color: "#666",
    fontSize: 13,
    marginTop: 15,
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 100,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyIconText: {
    color: "#0B0B0B",
    fontSize: 27,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyDescription: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },

  emptyButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  emptyButtonText: {
    color: "#0B0B0B",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyButtonArrow: {
    color: "#0B0B0B",
    fontSize: 19,
    marginLeft: 12,
  },
});
