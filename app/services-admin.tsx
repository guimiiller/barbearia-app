import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
    const data = await getServices();
    setServices(data);
  };

  const handleSave = async () => {
    const priceNumber = Number(price);

    if (!name.trim()) {
      alert("Nome obrigatório");
      return;
    }

    if (!price || isNaN(priceNumber) || priceNumber <= 0) {
      alert("Preço inválido");
      return;
    }

    try {
      setLoading(true);

      if (editingService) {
        await updateService(editingService._id, {
          name: name.trim(),
          price: priceNumber,
        });
      } else {
        await createService({
          name: name.trim(),
          price: priceNumber,
        });
      }

      setName("");
      setPrice("");
      setEditingService(null);
      setModalVisible(false);

      loadServices();
    } catch (err) {
      console.log(err);
      alert("Erro ao salvar serviço");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteService(id);
    loadServices();
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setName(service.name);
    setPrice(String(service.price));
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serviços</Text>

      <View style={styles.divider} />

      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>R$ {item.price}</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item._id)}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* BOTÃO CRIAR */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addText}>+ Novo Serviço</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Serviço</Text>

            <TextInput
              placeholder="Nome"
              placeholderTextColor="#999"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Preço"
              placeholderTextColor="#999"
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>
                {loading ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NAVBAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("../assets/images/home.png")}
            style={styles.icon}
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
            style={styles.iconActive}
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
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
  },

  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 20,
  },

  card: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  name: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  price: {
    color: "#FFD700",
    marginTop: 4,
  },

  editBtn: {
    marginTop: 10,
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  editText: {
    color: "#000",
    fontWeight: "bold",
  },

  addBtn: {
    backgroundColor: "#FFD700",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 70,
  },

  addText: {
    color: "#000",
    fontWeight: "bold",
  },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#000",
    fontWeight: "bold",
  },

  cancelText: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 10,
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
    width: 22,
    height: 22,
    tintColor: "#B0B0B0",
  },

  iconActive: {
    width: 22,
    height: 22,
    tintColor: "#D4AF37",
  },

  deleteBtn: {
    marginTop: 10,
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteText: {
    color: "#000",
    fontWeight: "bold",
  },
});
