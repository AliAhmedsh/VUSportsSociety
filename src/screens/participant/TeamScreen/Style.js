import { StyleSheet, Dimensions } from 'react-native';
import theme from '../../../utils/theme';

const { colors } = theme;
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      searchContainer: {
        padding: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      searchInput: {
        backgroundColor: colors.surface + '80', // 50% opacity
      },
      filterTabs: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      filterTabsContent: {
        flexDirection: 'row',
      },
      filterChip: {
        marginRight: 8,
        borderRadius: 16,
      },
      filterChipLabel: {
        fontSize: 12,
      },
      filterChipLabelActive: {
        color: colors.onPrimary,
      },
      sportFilterContainer: {
        padding: 16,
        backgroundColor: colors.surface + '80', // 50% opacity
      },
      sportFilterLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: colors.text + 'B3', // 70% opacity
      },
      sportChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      sportChip: {
        margin: 4,
        borderRadius: 16,
      },
      sportChipText: {
        fontSize: 12,
      },
      listContent: {
        padding: 16,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      },
      emptyText: {
        marginBottom: 16,
        textAlign: 'center',
        color: colors.text + 'B3', // 70% opacity
      },
      fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
      },
})

export default styles;
