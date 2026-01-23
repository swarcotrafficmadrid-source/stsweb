import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'https://stsweb-backend-964379250608.europe-west1.run.app';

// Configurar timeout
axios.defaults.timeout = 20000; // 20s para crear tickets

export default function CreateTicketScreen({ route, navigation }) {
  const { token } = route.params;
  const [ticketType, setTicketType] = useState('failure'); // failure, spare, purchase, assistance
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Error', 'Por favor completa título y descripción');
      return;
    }

    setLoading(true);

    try {
      let endpoint = '';
      let data = {};

      switch (ticketType) {
        case 'failure':
          endpoint = '/api/failures';
          data = {
            titulo,
            descripcion,
            prioridad,
            company: 'SWARCO',
            refCode: '',
            serial: '',
            locationType: 'calle',
            locationVia: '',
            locationSentido: '',
            locationPk: '',
            locationProvince: '',
            locationStation: ''
          };
          break;
        
        case 'assistance':
          endpoint = '/api/assistance';
          data = {
            tipo: 'remota',
            descripcionFalla: descripcion,
            fecha: null,
            hora: null,
            lugar: null
          };
          break;
        
        default:
          Alert.alert('Error', 'Tipo de ticket no soportado aún en móvil');
          setLoading(false);
          return;
      }

      await axios.post(`${API_URL}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert(
        'Éxito',
        'Ticket creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Type Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Ticket</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, ticketType === 'failure' && styles.typeButtonActive]}
              onPress={() => setTicketType('failure')}
            >
              <Text style={[styles.typeButtonText, ticketType === 'failure' && styles.typeButtonTextActive]}>
                Incidencia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, ticketType === 'assistance' && styles.typeButtonActive]}
              onPress={() => setTicketType('assistance')}
            >
              <Text style={[styles.typeButtonText, ticketType === 'assistance' && styles.typeButtonTextActive]}>
                Asistencia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title (only for failures) */}
        {ticketType === 'failure' && (
          <View style={styles.section}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Título del ticket"
              placeholderTextColor="#94A3B8"
            />
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Describe el problema..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Priority (only for failures) */}
        {ticketType === 'failure' && (
          <View style={styles.section}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityButtons}>
              {['Baja', 'Media', 'Alta'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityButton, prioridad === p && styles.priorityButtonActive]}
                  onPress={() => setPrioridad(p)}
                >
                  <Text style={[styles.priorityButtonText, prioridad === p && styles.priorityButtonTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando...' : 'Crear Ticket'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Para agregar fotos, localización GPS o más detalles, usa la versión web del portal.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#006BAB',
    borderColor: '#006BAB',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#F29200',
    borderColor: '#F29200',
  },
  priorityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#006BAB',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
