import { StyleSheet,Platform } from "react-native";
import colors from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: Platform.OS === 'ios' ? 88 : 68,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    marginRight: 16,
    padding: 4,
  },
  searchButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 24,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  sectionSelector: {
    paddingBottom: 20,
  },
  sectionScrollContent: {
    paddingHorizontal: 20,
  },
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.White,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionChipActive: {
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginRight: 12,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionChipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionChipTitleActive: {
    color: colors.primary,
  },
  sectionChipCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  sectionChipCountActive: {
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  episodeCard: {
    marginBottom: 12,
  },
  episodeCardContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  episodeImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  episodeArtwork: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  progressOverlay: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
  },
  progressRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  showTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  episodeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: 6,
  },
  timeLeftBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timeLeftText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: colors.progressBackground,
    borderRadius: 1.5,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  progressPercentage: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    minWidth: 32,
  },
  playButtonContainer: {
    marginLeft: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadCard: {
    marginBottom: 12,
  },
  downloadCardContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  downloadImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  downloadArtwork: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  downloadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  downloadShow: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  downloadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  downloadMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  qualityText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  showListCard: {
    marginBottom: 12,
  },
  showGridCard: {
    flex: 1,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  showCardContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  showListImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  showGridImageContainer: {
    position: 'relative',
    marginBottom: 12,
    alignSelf: 'center',
  },
  showListArtwork: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  showGridArtwork: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  newEpisodesBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  newEpisodesText: {
    fontSize: 10,
    color: colors.cardBackground,
    fontWeight: '700',
  },
  notificationIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  showInfo: {
    flex: 1,
  },
  showListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  showGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  showListAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  showGridAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  showMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeCountText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  lastUpdatedText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },
  gridContainer: {
    paddingHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    color: colors.cardBackground,
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 120,
  },
});

export default styles;