import { StyleSheet } from "react-native";
import colors from "../../constants/colors";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBackground,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerBorder,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  heading: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.textBlack,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.avatarBackground,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textBlack,
    marginBottom: 16,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Error State
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBackground || "#FFF3CD",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.errorText || "#856404",
    flex: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Episode Item Styles
  episodeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  episodeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textBlack,
    marginBottom: 4,
  },
  episodePodcast: {
    fontSize: 14,
    color: colors.textEpisodeMeta,
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: "row",
    gap: 12,
  },
  episodeDuration: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.durationBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  episodePlays: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
  },
  episodeDate: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
  },

  // Podcast Item Styles
  podcastItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  podcastImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  podcastContent: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textBlack,
    marginBottom: 4,
  },
  podcastHost: {
    fontSize: 14,
    color: colors.textEpisodeMeta,
    marginBottom: 8,
  },
  podcastRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  podcastRatingText: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
    marginLeft: 4,
  },

  newBadge: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    position: "absolute",
    top: 8,
    right: 8,
  },
  newBadgeText: {
    color: colors.White,
    fontSize: 10,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 100,
  },
});

export default styles;