import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
} from "react-native";
import styles from "./searchStyles";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalAudioPlayer } from "../../context/AudioPlayerContext";
import { getAvailableCategoriesAPI,getPodcastsByCategoryAPI } from "../../constants/PodcastAPI/podcastApiService";
import { formatDuration, formatPublishedDate } from "../../constants/PodcastAPI/podcastUtils";
import { usePodcastClient, usePodcastSearch } from "../../constants/PodcastAPI/podcastHooks";
//import { };

import colors from "../../constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Updated quick searches with more relevant categories
const quickSearches = [
  "Technology","Business","Health","Education",
  "Science","Comedy","News","History",
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState("all");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); 
  const [searchError, setSearchError] = useState(null); 

  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchTimeoutRef = useRef(null);
  const { addToQueue } = useGlobalAudioPlayer();

  const {
    searchPodcasts,
    results: hookResults,
    loading: hookLoading,
    error: hookError,
    clearResults,
  } = usePodcastSearch();

  const podcastClient = usePodcastClient();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsActive(true);
        animateIn();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (!searchQuery) {
          setIsActive(false);
          animateOut();
        }
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [searchQuery]);

  // Load available categories on mount
  useEffect(() => {
    loadAvailableCategories();
  }, []);

  // Update results when hook results change
  useEffect(() => {
    console.log("Hook results updated:", hookResults);
    if (hookResults && Array.isArray(hookResults)) {
      const transformedResults = hookResults.map((result) => ({
        ...result,
        type: result.type || "podcast", // Ensure type is set
        id:
          result.id || result.feedId || Math.random().toString(36).substr(2, 9), // Ensure ID exists
        image:
          result.image ||
          result.artwork ||
          "https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image",
      }));
      console.log("Setting transformed results:", transformedResults);
      setResults(transformedResults);
    } else if (hasSearched && hookResults !== null) {
      // Only set empty results if we've actually searched
      setResults([]);
    }
  }, [hookResults, hasSearched]);

  // Update loading state from hook
  useEffect(() => {
    setIsLoading(hookLoading);
  }, [hookLoading]);

  // Update error state from hook
  useEffect(() => {
    setSearchError(hookError);
  }, [hookError]);

  const loadAvailableCategories = async () => {
    try {
      const categories = await getAvailableCategoriesAPI();
      if (categories && Array.isArray(categories)) {
        setAvailableCategories(categories.slice(0, 8));
      } else {
        setAvailableCategories(quickSearches);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setAvailableCategories(quickSearches);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const performSearch = async (query) => {
    if (!query?.trim() || query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    console.log("Performing search for:", query);
    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      // Use the hook to search
      const searchResults = await searchPodcasts(query.trim());
      console.log("Search completed, results:", searchResults);

      // The results will be handled by the useEffect that watches hookResults
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError(error.message || "Search failed");
      Alert.alert(
        "Search Error",
        "Failed to search podcasts. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time search as user types
  const handleTextChange = (text) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If text is empty, clear results immediately
    if (!text.trim()) {
      setResults([]);
      setHasSearched(false);
      clearResults();
      return;
    }

    // Debounce search - only search after user stops typing for 800ms
    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim().length >= 2) {
        performSearch(text.trim());
      }
    }, 800);
  };

  // Handle search submission (when user presses search button)
  const handleSearchSubmit = async () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      // Add to recent searches
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches((prev) => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }

      await performSearch(searchQuery.trim());
    }
  };

  const handleQuickSearch = async (category) => {
    setSearchQuery(category);
    setIsLoading(true);
    setHasSearched(true);
    setSearchError(null);

    try {
      console.log("Quick searching category:", category);
      const categoryPodcasts = await getPodcastsByCategoryAPI(category, 10);

      if (categoryPodcasts && Array.isArray(categoryPodcasts)) {
        const transformedResults = categoryPodcasts.map((podcast) => ({
          ...podcast,
          type: "podcast",
          id:
            podcast.id ||
            podcast.feedId ||
            Math.random().toString(36).substr(2, 9),
          image:
            podcast.image ||
            podcast.artwork ||
            "https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image",
        }));
        setResults(transformedResults);
        console.log("Category results set:", transformedResults);
      } else {
        setResults([]);
      }

      // Add to recent searches
      if (!recentSearches.includes(category)) {
        setRecentSearches((prev) => [category, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Category search failed:", error);
      setSearchError(error.message || "Category search failed");
      Alert.alert(
        "Search Error",
        "Failed to load podcasts for this category. Please try again.",
        [{ text: "OK" }]
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearch = async (query) => {
    setSearchQuery(query);
    await performSearch(query);
  };

  const handleResultPress = async (item) => {
    console.log("Result pressed:", item);

    if (item.type === "podcast") {
      // Navigate to podcast details
      navigation.navigate("PodcastDetailsScreen", { podcast: item });
    } else {
      // Handle episode playback
      if (item.audioSource || item.audioUrl || item.enclosureUrl) {
        try {
          const audioUrl =
            item.audioSource || item.audioUrl || item.enclosureUrl;

          // Add to queue and navigate to player
          await addToQueue({
            ...item,
            metadata: {
              ...item.metadata,
              audioSource: audioUrl,
            },
          });

          navigation.navigate("PlayerScreen", {
            episode: item,
            podcastTitle: item.title,
            podcastSubtitle: item.author,
            podcastImage: item.image,
          });
        } catch (error) {
          console.error("Failed to play episode:", error);
          Alert.alert(
            "Playback Error",
            "Failed to play this episode. Please try again."
          );
        }
      } else {
        Alert.alert(
          "Audio Not Available",
          "This episode is not available for playback."
        );
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setIsActive(false);
    setHasSearched(false);
    setSearchError(null);
    clearResults();
    Keyboard.dismiss();

    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const formatEpisodeDuration = (duration) => {
    if (typeof duration === "string") {
      return duration;
    }
    if (typeof duration === "number" && duration > 0) {
      return formatDuration(duration);
    }
    return "Unknown";
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderSearchResult = ({ item, index }) => {
    console.log("Rendering result item:", item);

    return (
      <Animated.View
        style={[
          styles.resultItem,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, index * 10 + 50],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleResultPress(item)}
          style={styles.resultContent}
          activeOpacity={0.7}
        >
          <View style={styles.resultImageContainer}>
            <Image
              source={{
                uri:
                  item.image ||
                  "https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image",
              }}
              style={styles.resultImage}
              defaultSource={{
                uri: "https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image",
              }}
            />
            <View style={styles.resultImageOverlay}>
              <Ionicons
                name={item.type === "podcast" ? "library-outline" : "play"}
                size={16}
                color={colors.textWhite}
              />
            </View>
          </View>

          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={2}>
              {item.title || "Unknown Title"}
            </Text>
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {item.author || item.category || "Unknown"}
            </Text>
            <View style={styles.resultMeta}>
              <View
                style={[
                  styles.typeTag,
                  {
                    backgroundColor:
                      item.type === "podcast"
                        ? colors.search.typeTagPodcast
                        : colors.search.typeTagEpisode,
                  },
                ]}
              >
                <Text style={styles.typeTagText}>
                  {item.type === "podcast" ? "PODCAST" : "EPISODE"}
                </Text>
              </View>
              {item.type === "episode" && item.duration && (
                <Text style={styles.duration}>
                  {formatEpisodeDuration(item.duration)}
                </Text>
              )}
              {item.type === "episode" && item.publishedTimestamp && (
                <Text style={styles.publishedDate}>
                  {formatPublishedDate(item.publishedTimestamp)}
                </Text>
              )}
              {item.rating && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={12} color={colors.gold} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons
              name={
                item.type === "podcast"
                  ? "add-circle-outline"
                  : "play-circle-outline"
              }
              size={28}
              color={colors.search.actionButton}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderQuickSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.quickSearchChip}
      onPress={() => handleQuickSearch(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.quickSearchText}>{item}</Text>
      <Ionicons
        name="search"
        size={14}
        color={colors.search.chipIcon}
        style={styles.quickSearchIcon}
      />
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleRecentSearch(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recentIconContainer}>
        <Ionicons name="time-outline" size={18} color={colors.primary} />
      </View>
      <Text style={styles.recentText}>{item}</Text>
      <TouchableOpacity
        onPress={() =>
          setRecentSearches((prev) => prev.filter((search) => search !== item))
        }
        style={styles.removeRecent}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color={colors.lightGray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Show error state for search failed
  const renderError = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.search.emptyIcon}
        />
      </View>
      <Text style={styles.errorTitle}>Search Failed</Text>
      <Text style={styles.errorSubtitle}>
        {searchError || "Please check your internet connection and try again"}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => performSearch(searchQuery)}
        activeOpacity={0.8}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Debug log for current state
  console.log("Current state:", {
    searchQuery,
    isLoading,
    hasSearched,
    resultsLength: results.length,
    searchError,
    hookResults: hookResults?.length || "null",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.White} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              isActive && styles.searchInputActive,
            ]}
          >
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search podcasts and episodes"
              placeholderTextColor={colors.textSearchPlaceholder}
              value={searchQuery}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.lightGray}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching podcasts...</Text>
          </View>
        ) : searchError ? (
          renderError()
        ) : hasSearched && results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) =>
              `${item.type || "result"}-${item.id || index}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="search"
                size={64}
                color={colors.search.emptyIcon}
              />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for "{searchQuery}" or browse categories below
            </Text>
          </View>
        ) : (
          <View style={styles.discoverContainer}>
            {/* Quick Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Searches</Text>
              <FlatList
                data={
                  availableCategories.length > 0
                    ? availableCategories
                    : quickSearches
                }
                renderItem={renderQuickSearch}
                keyExtractor={(item) => item}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.quickSearchGrid}
                columnWrapperStyle={styles.quickSearchRow}
              />
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity
                    onPress={() => setRecentSearches([])}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={recentSearches}
                  renderItem={renderRecentSearch}
                  keyExtractor={(item) => item}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

