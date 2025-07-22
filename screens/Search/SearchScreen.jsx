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
import {
  getAvailableCategoriesAPI,
  getPodcastsByCategoryAPI,
} from "../../constants/PodcastAPI/podcastApiService";
import { getClientInstance } from "../../constants/PodcastAPI/podcastApiMethod";
import { formatDuration, formatPublishedDate } from "../../constants/PodcastAPI/podcastUtils";
import colors from "../../constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const quickSearches = [
  "Technology", "Business", "Health", "Education",
  "Science", "Comedy", "News", "History",
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchTimeoutRef = useRef(null);
  const { addToQueue } = useGlobalAudioPlayer();
  const podcastClient = getClientInstance();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsActive(true);
      animateIn();
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      if (!searchQuery) {
        setIsActive(false);
        animateOut();
      }
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [searchQuery]);

  useEffect(() => {
    loadAvailableCategories();
  }, []);

  const loadAvailableCategories = async () => {
    try {
      const categories = await getAvailableCategoriesAPI();
      setAvailableCategories(Array.isArray(categories) ? categories.slice(0, 8) : quickSearches);
    } catch {
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

    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const response = await podcastClient.search(query.trim());

      if (Array.isArray(response)) {
        const transformed = response.map((result) => ({
          ...result,
          type: result.type || "podcast",
          id: result.id || result.feedId || Math.random().toString(36).substr(2, 9),
          image: result.image || result.artwork || "https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image",
        }));
        setResults(transformed);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError(error.message || "Search failed");
      Alert.alert("Search Error", "Failed to search podcasts. Please try again.", [{ text: "OK" }]);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (text) => {
    setSearchQuery(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim().length >= 2) {
        performSearch(text.trim());
      }
    }, 800);
  };

  const handleSearchSubmit = async () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
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
      const categoryPodcasts = await getPodcastsByCategoryAPI(category, 10);

      if (Array.isArray(categoryPodcasts)) {
        const transformed = categoryPodcasts.map((podcast) => ({
          ...podcast,
          type: "podcast",
          id: podcast.id || podcast.feedId || Math.random().toString(36).substr(2, 9),
          image: podcast.image || podcast.artwork || "https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image",
        }));
        setResults(transformed);
      } else {
        setResults([]);
      }

      if (!recentSearches.includes(category)) {
        setRecentSearches((prev) => [category, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Category search failed:", error);
      setSearchError(error.message || "Category search failed");
      Alert.alert("Search Error", "Failed to load podcasts for this category. Please try again.", [{ text: "OK" }]);
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
    if (item.type === "podcast") {
      navigation.navigate("PodcastDetailsScreen", { podcast: item });
    } else if (item.audioSource || item.audioUrl || item.enclosureUrl) {
      try {
        const audioUrl = item.audioSource || item.audioUrl || item.enclosureUrl;

        await addToQueue({
          ...item,
          metadata: { ...item.metadata, audioSource: audioUrl },
        });

        navigation.navigate("PlayerScreen", {
          episode: item,
          podcastTitle: item.title,
          podcastSubtitle: item.author,
          podcastImage: item.image,
        });
      } catch (error) {
        console.error("Playback error:", error);
        Alert.alert("Playback Error", "Failed to play this episode. Please try again.");
      }
    } else {
      Alert.alert("Audio Not Available", "This episode is not available for playback.");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setIsActive(false);
    setHasSearched(false);
    setSearchError(null);
    Keyboard.dismiss();

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const formatEpisodeDuration = (duration) => {
    if (typeof duration === "string") return duration;
    if (typeof duration === "number" && duration > 0) return formatDuration(duration);
    return "Unknown";
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderSearchResult = ({ item, index }) => (
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
            source={{ uri: item.image }}
            style={styles.resultImage}
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
                  backgroundColor: item.type === "podcast"
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
            name={item.type === "podcast"
              ? "add-circle-outline"
              : "play-circle-outline"}
            size={28}
            color={colors.search.actionButton}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

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
        onPress={() => setRecentSearches((prev) => prev.filter((search) => search !== item))}
        style={styles.removeRecent}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color={colors.lightGray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.search.emptyIcon} />
      </View>
      <Text style={styles.errorTitle}>Search Failed</Text>
      <Text style={styles.errorSubtitle}>{searchError || "Please try again later."}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => performSearch(searchQuery)}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.White} />
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, isActive && styles.searchInputActive]}>
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
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.lightGray} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

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
            keyExtractor={(item, index) => `${item.type || "result"}-${item.id || index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="search" size={64} color={colors.search.emptyIcon} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for "{searchQuery}" or browse categories below
            </Text>
          </View>
        ) : (
          <View style={styles.discoverContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Searches</Text>
              <FlatList
                data={availableCategories.length > 0 ? availableCategories : quickSearches}
                renderItem={renderQuickSearch}
                keyExtractor={(item) => item}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.quickSearchGrid}
                columnWrapperStyle={styles.quickSearchRow}
              />
            </View>

            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
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
