import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "../src/services/api";

export default function ServicesAdmin() {
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();

      setServices(data || []);
    } catch (error) {
      console.log("❌ Erro ao carregar serviços:", error);

      Alert.alert("Erro", "Não foi possível carregar os serviços.");
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setName("");
    setPrice("");
    setModalVisible(true);
  };

  const closeModal = () => {
    if (loading) return;

    setModalVisible(false);
    setEditingService(null);
    setName("");
    setPrice("");
  };

  const handleSave = async () => {
    const serviceName = name.trim();

    const normalizedPrice = price.replace(",", ".");
    const priceNumber = Number(normalizedPrice);

    if (!serviceName) {
      Alert.alert("Atenção", "Digite o nome do serviço.");
      return;
    }

    if (!price.trim() || Number.isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert("Atenção", "Digite um preço válido.");
      return;
    }

    try {
      setLoading(true);

      if (editingService) {
        await updateService(editingService._id, {
          name: serviceName,
          price: priceNumber,
        });

        Alert.alert("Sucesso", "Serviço atualizado com sucesso.");
      } else {
        await createService({
          name: serviceName,
          price: priceNumber,
        });

        Alert.alert("Sucesso", "Serviço criado com sucesso.");
      }

      closeModal();

      await loadServices();
    } catch (error) {
      console.log("❌ Erro ao salvar serviço:", error);

      Alert.alert("Erro", "Não foi possível salvar o serviço.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);

    setName(service.name || "");
    setPrice(String(service.price ?? ""));

    setModalVisible(true);
  };

  const handleDelete = (service: any) => {
    Alert.alert(
      "Excluir serviço",
      `Deseja realmente excluir "${service.name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteService(service._id);

              await loadServices();

              Alert.alert("Sucesso", "Serviço excluído com sucesso.");
            } catch (error) {
              console.log("❌ Erro ao excluir serviço:", error);

              Alert.alert("Erro", "Não foi possível excluir o serviço.");
            }
          },
        },
      ],
    );
  };

  const formatPrice = (value: number) => {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ADMINISTRAÇÃO</Text>

          <Text style={styles.title}>Serviços</Text>

          <Text style={styles.subtitle}>
            Gerencie os serviços oferecidos pela barbearia.
          </Text>
        </View>

        <View style={styles.counter}>
          <Text style={styles.counterNumber}>{services.length}</Text>

          <Text style={styles.counterLabel}>SERVIÇOS</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* LISTA */}

      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>✦</Text>
            </View>

            <Text style={styles.emptyTitle}>Nenhum serviço cadastrado</Text>

            <Text style={styles.emptyText}>
              Crie o primeiro serviço para começar.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            {/* ÍCONE */}

            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>✦</Text>
            </View>

            {/* INFORMAÇÕES */}

            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={styles.servicePrice}>
                R$ {formatPrice(item.price)}
              </Text>
            </View>

            {/* AÇÕES */}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.8}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* NOVO SERVIÇO */}

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.85}
        onPress={openCreateModal}
      >
        <Text style={styles.addButtonPlus}>+</Text>

        <Text style={styles.addButtonText}>Novo serviço</Text>

        <Text style={styles.addButtonArrow}>→</Text>
      </TouchableOpacity>

      {/* MODAL */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>
                  {editingService ? "EDITAR" : "NOVO"}
                </Text>

                <Text style={styles.modalTitle}>
                  {editingService ? "Editar serviço" : "Novo serviço"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* NOME */}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>NOME DO SERVIÇO</Text>

              <TextInput
                placeholder="Ex: Corte masculino"
                placeholderTextColor="#666"
                style={styles.input}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* PREÇO */}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PREÇO</Text>

              <View style={styles.priceInputContainer}>
                <Text style={styles.currency}>R$</Text>

                <TextInput
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  style={styles.priceInput}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* SALVAR */}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>
                {loading
                  ? "Salvando..."
                  : editingService
                    ? "Salvar alterações"
                    : "Criar serviço"}
              </Text>

              {!loading && <Text style={styles.saveButtonArrow}>→</Text>}
            </TouchableOpacity>

            {/* CANCELAR */}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={closeModal}
              disabled={loading}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NAVBAR */}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/")}
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.icon}
          />

          <Text style={styles.tabText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/schedule-admin")}
          activeOpacity={0.7}
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
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/images/services.png")}
            style={styles.iconActive}
          />

          <Text style={styles.tabTextActive}>Serviços</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#777",
    fontSize: 12,
    marginTop: 7,
    maxWidth: 230,
    lineHeight: 18,
  },

  counter: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },

  counterNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  counterLabel: {
    color: "#666",
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#222",
    marginTop: 22,
    marginBottom: 18,
  },

  /* LISTA */

  listContent: {
    paddingBottom: 160,
  },

  serviceCard: {
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    padding: 16,
    marginBottom: 12,
  },

  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  serviceIconText: {
    color: "#FFFFFF",
    fontSize: 17,
  },

  serviceInfo: {
    marginBottom: 14,
  },

  serviceName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  servicePrice: {
    color: "#888",
    fontSize: 13,
    marginTop: 5,
  },

  actions: {
    flexDirection: "row",
    gap: 9,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: "center",
  },

  editButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "600",
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyIconText: {
    color: "#FFFFFF",
    fontSize: 22,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  emptyText: {
    color: "#666",
    fontSize: 12,
    marginTop: 7,
    textAlign: "center",
  },

  /* NOVO */

  addButton: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 95,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  addButtonPlus: {
    color: "#000",
    fontSize: 23,
    fontWeight: "400",
    marginRight: 10,
  },

  addButtonText: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },

  addButtonArrow: {
    color: "#000",
    fontSize: 20,
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: "#151515",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  modalEyebrow: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  closeButtonText: {
    color: "#AAAAAA",
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 26,
  },

  inputContainer: {
    marginBottom: 18,
  },

  inputLabel: {
    color: "#777",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  input: {
    height: 50,
    backgroundColor: "#0D0D0D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#292929",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    fontSize: 14,
  },

  priceInputContainer: {
    height: 50,
    backgroundColor: "#0D0D0D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#292929",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  currency: {
    color: "#777",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },

  priceInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },

  saveButton: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 5,
  },

  saveButtonDisabled: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "700",
  },

  saveButtonArrow: {
    color: "#000000",
    fontSize: 18,
    marginLeft: 10,
  },

  modalCancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },

  modalCancelText: {
    color: "#777",
    fontSize: 13,
    fontWeight: "500",
  },

  /* NAVBAR */

  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
    marginBottom: 4,
  },

  iconActive: {
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
