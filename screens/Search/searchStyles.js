import { StyleSheet } from "react-native";
import colors from "../../constants/colors";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.searchBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.searchBorder,
    elevation: 2,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.searchInputBackground,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.searchInputBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.searchInputBorder,
  },
  searchInputActive: {
    backgroundColor: colors.searchInputActiveBackground,
    borderColor: colors.searchInputActiveBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textBlack,
    marginLeft: 12,
    marginRight: 8,
    fontWeight: "400",
  },
  content: {
    flex: 1,
    backgroundColor: colors.searchBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.searchBackground,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSearchLoading,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.search.emptyBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textSearchEmpty,
    marginBottom: 12,
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.textSearchEmptySubtitle,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },
  resultsList: {
    paddingVertical: 16,
  },
  resultItem: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  resultContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultImageContainer: {
    position: "relative",
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.searchBorder,
  },
  resultImageOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.search.resultImageOverlay,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.White,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 20,
    marginRight: 16,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textBlack,
    marginBottom: 6,
    lineHeight: 22,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
    fontWeight: "500",
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textWhite,
    letterSpacing: 0.8,
  },
  duration: {
    fontSize: 12,
    color: colors.gray,
    marginRight: 12,
    fontWeight: "600",
  },
  publishedDate: {
    fontSize: 12,
    color: colors.gray,
    marginRight: 12,
    fontWeight: "600",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
    fontWeight: "600",
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.searchButtonBackground,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.search.emptyBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textSearchEmpty,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSearchEmptySubtitle,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  discoverContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textBlack,
    marginBottom: 20,
  },
  clearText: {
    fontSize: 16,
    color: colors.search.clearText,
    fontWeight: "600",
  },
  quickSearchGrid: {
    gap: 12,
  },
  quickSearchRow: {
    justifyContent: "space-between",
    gap: 12,
  },
  quickSearchChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.search.chipBackground,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickSearchText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.search.chipText,
  },
  quickSearchIcon: {
    marginLeft: 8,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  recentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.search.recentIconBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: colors.search.chipText,
    fontWeight: "500",
  },
  removeRecent: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.searchButtonBackground,
  },
});

export default styles;