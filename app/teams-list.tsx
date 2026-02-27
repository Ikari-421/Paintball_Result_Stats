import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCoreStore } from '@/src/presentation/state/useCoreStore';

export default function TeamsListScreen() {
  const router = useRouter();
  const { teams, deleteTeam, isLoading } = useCoreStore();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Supprimer l\'équipe',
      `Voulez-vous vraiment supprimer "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteTeam(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Équipes</Text>
        <TouchableOpacity
          onPress={() => router.push('/create-team')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {teams.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune équipe</Text>
          <Text style={styles.emptySubtext}>
            Créez votre première équipe pour commencer
          </Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.teamCard}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{item.name}</Text>
                {item.isGuest && (
                  <View style={styles.guestBadge}>
                    <Text style={styles.guestText}>Invité</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF2FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#2c4b5c',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#5FC2BA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#152b42',
  },
  guestBadge: {
    backgroundColor: '#95cbbc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  guestText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#152b42',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#2c4b5c',
    textAlign: 'center',
  },
});
