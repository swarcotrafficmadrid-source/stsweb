import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'https://stsweb-backend-964379250608.europe-west1.run.app';

// Configurar timeout
axios.defaults.timeout = 15000;

export default function TicketDetailScreen({ route, navigation }) {
  const { ticket, token } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    try {
      // En producción, esto debería cargar comentarios del ticket
      // Por ahora usamos array vacío
      setComments([]);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Escribe un comentario');
      return;
    }

    setLoading(true);

    try {
      // Endpoint para agregar comentario
      // Nota: Este endpoint debería existir en el backend
      await axios.post(
        `${API_URL}/api/comments`,
        {
          ticketId: ticket.id,
          ticketType: ticket.type || 'failure',
          comment: newComment.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert('Éxito', 'Comentario agregado');
      setNewComment('');
      loadComments();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al agregar comentario');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Pendiente':
      case 'pending':
        return '#F59E0B';
      case 'En Progreso':
      case 'in_progress':
        return '#3B82F6';
      case 'Resuelto':
      case 'resolved':
        return '#10B981';
      default:
        return '#64748B';
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'Alta':
      case 'high':
        return '#EF4444';
      case 'Media':
      case 'medium':
        return '#F59E0B';
      case 'Baja':
      case 'low':
        return '#10B981';
      default:
        return '#64748B';
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.ticketNumber}>#{ticket.id}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(ticket.estado) }]}>
              <Text style={styles.badgeText}>{ticket.estado || 'Pendiente'}</Text>
            </View>
            {ticket.prioridad && (
              <View style={[styles.badge, { backgroundColor: getPriorityColor(ticket.prioridad) }]}>
                <Text style={styles.badgeText}>{ticket.prioridad}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>{ticket.titulo || ticket.tipo || 'Sin título'}</Text>
          <Text style={styles.date}>
            Creado: {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {ticket.descripcion || ticket.descripcionFalla || 'Sin descripción'}
          </Text>
        </View>

        {/* Details */}
        {ticket.company && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Empresa:</Text>
              <Text style={styles.detailValue}>{ticket.company}</Text>
            </View>
            {ticket.serial && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Serial:</Text>
                <Text style={styles.detailValue}>{ticket.serial}</Text>
              </View>
            )}
            {ticket.refCode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ref:</Text>
                <Text style={styles.detailValue}>{ticket.refCode}</Text>
              </View>
            )}
          </View>
        )}

        {/* Location (if available) */}
        {(ticket.latitude || ticket.lugar) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            {ticket.lugar && (
              <Text style={styles.description}>{ticket.lugar}</Text>
            )}
            {ticket.latitude && ticket.longitude && (
              <Text style={styles.gpsCoords}>
                📍 GPS: {parseFloat(ticket.latitude).toFixed(6)}, {parseFloat(ticket.longitude).toFixed(6)}
              </Text>
            )}
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentarios ({comments.length})</Text>
          
          {loadingComments ? (
            <Text style={styles.loadingText}>Cargando comentarios...</Text>
          ) : comments.length === 0 ? (
            <Text style={styles.emptyText}>No hay comentarios aún</Text>
          ) : (
            comments.map((comment, index) => (
              <View key={index} style={styles.comment}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Comment Footer */}
      <View style={styles.footer}>
        <TextInput
          style={styles.commentInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Escribe un comentario..."
          placeholderTextColor="#94A3B8"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? '...' : 'Enviar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ticketNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006BAB',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    fontWeight: '500',
  },
  gpsCoords: {
    fontSize: 13,
    color: '#006BAB',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  comment: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#006BAB',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#006BAB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
