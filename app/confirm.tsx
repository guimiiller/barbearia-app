import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { createAppointment, updateAppointment } from "../src/services/api";

export default function Confirm() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const services = JSON.parse(params.services as string);
  const date = params.date as string;
  const time = params.time as string;
  const barberId = params.barberId as string;
  const rescheduleId = params.rescheduleId as string;

  const [loading, setLoading] = useState(false);

  const getBarberName = (id: any) => {
    const barberId = Number(id);

    if (barberId === 1) return "Barão";
    if (barberId === 2) return "Kauan";
    if (barberId === 3) return "Mario";

    return "Barbeiro";
  };

  const formatDate = (
    dateString: string,
  ): {
    weekday: string;
    day: string;
    month: string;
  } => {
    if (!dateString) {
      return {
        weekday: "",
        day: "",
        month: "",
      };
    }

    const [year, month, day] = dateString.split("-");

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    const weekdays = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];

    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    return {
      weekday: weekdays[date.getDay()],
      day,
      month: months[date.getMonth()],
    };
  };

  const formattedDate = formatDate(date);

  const total = services.reduce(
    (sum: number, service: any) => sum + Number(service.price || 0),
    0,
  );

  const handleConfirm = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const userStorage = await AsyncStorage.getItem("user");
      const user = JSON.parse(userStorage || "{}");

      if (!user?.id && !user?._id) {
        const message =
          "Sua sessão expirou. Faça login novamente para continuar.";

        if (typeof window !== "undefined") {
          window.alert(message);
        } else {
          Alert.alert("Sessão expirada", message);
        }

        router.replace("/login");
        return;
      }

      // =====================================================
      // REAGENDAMENTO
      // =====================================================

      if (rescheduleId) {
        await updateAppointment(rescheduleId, {
          userId: user.id || user._id,
          services,
          date,
          time,
          barberId,
        });

        console.log("✅ AGENDAMENTO ATUALIZADO");

        if (typeof window !== "undefined") {
          window.alert("Seu horário foi reagendado com sucesso.");

          router.replace("/home");
        } else {
          Alert.alert(
            "Agendamento atualizado",
            "Seu horário foi reagendado com sucesso.",
            [
              {
                text: "Continuar",
                onPress: () => router.replace("/home"),
              },
            ],
          );
        }

        return;
      }

      // =====================================================
      // NOVO AGENDAMENTO
      // =====================================================

      await createAppointment({
        userId: user.id || user._id,
        services,
        date,
        time,
        barberId,
      });

      console.log("✅ AGENDAMENTO CRIADO");

      // =====================================================
      // WEB / PWA
      // =====================================================

      if (typeof window !== "undefined") {
        window.alert("Seu horário foi reservado com sucesso.");

        router.replace("/home");

        return;
      }

      // =====================================================
      // ANDROID / IOS
      // =====================================================

      Alert.alert(
        "Agendamento confirmado",
        "Seu horário foi reservado com sucesso.",
        [
          {
            text: "Continuar",
            onPress: () => router.replace("/home"),
          },
        ],
      );
    } catch (err: any) {
      console.log("❌ Erro ao confirmar:", err);

      console.log("🔥 RESPOSTA DO BACKEND:", err?.response?.data);

      console.log("📤 DADOS QUE FORAM ENVIADOS:", {
        services,
        date,
        time,
        barberId,
      });

      const message =
        err?.response?.data?.error ||
        "Ocorreu um erro ao salvar seu agendamento. Tente novamente.";

      if (typeof window !== "undefined") {
        window.alert(message);
      } else {
        Alert.alert("Não foi possível confirmar", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {rescheduleId ? "REAGENDAMENTO" : "RESERVA"}
        </Text>

        <Text style={styles.title}>Confirme seu horário</Text>

        <Text style={styles.subtitle}>
          Confira os detalhes antes de finalizar seu agendamento.
        </Text>
      </View>

      {/* RESUMO */}

      <View style={styles.card}>
        {/* SERVIÇOS */}

        <View style={styles.infoSection}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>✦</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.label}>SERVIÇOS</Text>

            {services.map((service: any, index: number) => (
              <View key={service._id || index} style={styles.serviceRow}>
                <Text style={styles.value}>{service.name}</Text>

                <Text style={styles.price}>
                  R$ {Number(service.price).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* PROFISSIONAL */}

        <View style={styles.infoSection}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>◉</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.label}>PROFISSIONAL</Text>

            <Text style={styles.value}>{getBarberName(barberId)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* DATA */}

        <View style={styles.infoSection}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>□</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.label}>DATA</Text>

            <Text style={styles.value}>
              {formattedDate.weekday}, {formattedDate.day} de{" "}
              {formattedDate.month}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* HORÁRIO */}

        <View style={styles.infoSection}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>◷</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.label}>HORÁRIO</Text>

            <Text style={styles.value}>{time}</Text>
          </View>
        </View>

        <View style={styles.totalDivider} />

        {/* TOTAL */}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>

          <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
        </View>
      </View>

      {/* BOTÃO */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={handleConfirm}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {rescheduleId
                  ? "Confirmar reagendamento"
                  : "Confirmar agendamento"}
              </Text>

              <Text style={styles.buttonArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          disabled={loading}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar e alterar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 25,
  },

  header: {
    marginBottom: 28,
  },

  eyebrow: {
    color: "#777",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#777",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 320,
  },

  card: {
    backgroundColor: "#161616",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#242424",
  },

  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  icon: {
    color: "#FFFFFF",
    fontSize: 17,
  },

  infoContent: {
    flex: 1,
  },

  label: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  price: {
    color: "#A0A0A0",
    fontSize: 13,
    marginLeft: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#242424",
    marginVertical: 8,
  },

  totalDivider: {
    height: 1,
    backgroundColor: "#303030",
    marginTop: 14,
    marginBottom: 16,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  totalValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  footer: {
    marginTop: "auto",
  },

  button: {
    backgroundColor: "#FFFFFF",
    minHeight: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
  },

  buttonArrow: {
    color: "#000000",
    fontSize: 20,
    marginLeft: 12,
    marginTop: -2,
  },

  backButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },

  backButtonText: {
    color: "#777",
    fontSize: 13,
    fontWeight: "500",
  },
});
