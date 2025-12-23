
import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, Linking, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useCourts } from '@/hooks/useCourts';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { IconSymbol } from '@/components/IconSymbol';
import { SkillLevelBars } from '@/components/SkillLevelBars';
import { SortOption, FilterOptions } from '@/types';
import { calculateDistance } from '@/utils/locationUtils';

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { courts, loading, refetch } = useCourts(user?.id);
  const { hasLocation, userLocation, updateZipCode } = useLocation();
  
  const [sortBy, setSortBy] = useState<SortOption>('active-high');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [zipCodeInput, setZipCodeInput] = useState('');
  const [searchingZip, setSearchingZip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen: Screen focused, refreshing courts data');
      refetch();
    }, [refetch])
  );

  // Calculate distances and apply sorting/filtering
  const processedCourts = useMemo(() => {
    let processed = courts.map(court => {
      let distance: number | undefined;
      
      if (userLocation) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          court.latitude,
          court.longitude
        );
      }
      
      return { ...court, distance };
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter(court => 
        court.name.toLowerCase().includes(query) ||
        court.address.toLowerCase().includes(query)
      );
    }

    // Apply distance filter
    if (filters.maxDistance !== undefined && userLocation) {
      processed = processed.filter(court => 
        court.distance !== undefined && court.distance <= filters.maxDistance!
      );
    }

    // Apply friends only filter
    if (filters.friendsOnly) {
      processed = processed.filter(court => court.friendsPlayingCount > 0);
    }

    // Apply skill level filter (new implementation)
    if (filters.skillLevels && filters.skillLevels.length > 0) {
      processed = processed.filter(court => {
        if (court.currentPlayers === 0) return false;
        
        const avgSkill = court.averageSkillLevel;
        return filters.skillLevels!.some(level => {
          if (level === 'Beginner') return avgSkill <= 1.5;
          if (level === 'Intermediate') return avgSkill > 1.5 && avgSkill <= 2.5;
          if (level === 'Advanced') return avgSkill > 2.5;
          return false;
        });
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'active-high':
        processed.sort((a, b) => b.currentPlayers - a.currentPlayers);
        break;
      case 'active-low':
        processed.sort((a, b) => a.currentPlayers - b.currentPlayers);
        break;
      case 'skill-high':
        processed.sort((a, b) => b.averageSkillLevel - a.averageSkillLevel);
        break;
      case 'skill-low':
        processed.sort((a, b) => a.averageSkillLevel - b.averageSkillLevel);
        break;
      case 'distance':
        if (userLocation) {
          processed.sort((a, b) => {
            if (a.distance === undefined) return 1;
            if (b.distance === undefined) return -1;
            return a.distance - b.distance;
          });
        }
        break;
    }

    return processed;
  }, [courts, sortBy, filters, userLocation, searchQuery]);

  const displayedCourts = processedCourts.slice(0, displayCount);
  const hasMoreCourts = displayCount < processedCourts.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + LOAD_MORE_COUNT);
  };

  const handleZipCodeSearch = async () => {
    if (!zipCodeInput.trim()) {
      Alert.alert('Error', 'Please enter a ZIP code');
      return;
    }

    setSearchingZip(true);
    const result = await updateZipCode(zipCodeInput.trim());
    
    if (result.success) {
      Alert.alert('Success', 'Location updated! Showing courts near your ZIP code.');
      setZipCodeInput('');
    } else {
      Alert.alert('Error', result.error || 'Invalid ZIP code. Please try again.');
    }
    
    setSearchingZip(false);
  };

  const openGoogleMaps = () => {
    const url = 'https://www.google.com/maps/search/pickleball+courts';
    Linking.openURL(url).catch(err => {
      console.error('Failed to open Google Maps:', err);
    });
  };

  const getSkillLevelLabel = (averageSkillLevel: number) => {
    if (averageSkillLevel === 0) return 'No data';
    if (averageSkillLevel <= 1.5) return 'Beginner';
    if (averageSkillLevel <= 2.5) return 'Intermediate';
    return 'Advanced';
  };

  const toggleSkillLevelFilter = (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const currentLevels = filters.skillLevels || [];
    const isSelected = currentLevels.includes(level);
    
    if (isSelected) {
      setFilters({
        ...filters,
        skillLevels: currentLevels.filter(l => l !== level),
      });
    } else {
      setFilters({
        ...filters,
        skillLevels: [...currentLevels, level],
      });
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/d00ee021-be7a-42f9-a115-ea45cb937f7f.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 12 }]}>
            Find active pickleball courts near you
          </Text>
        </View>

        {!hasLocation && (
          <View style={[commonStyles.card, { backgroundColor: colors.highlight }]}>
            <View style={styles.zipCodeHeader}>
              <IconSymbol 
                ios_icon_name="location.fill" 
                android_material_icon_name="location_on" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={[commonStyles.subtitle, { marginLeft: 8, fontSize: 16 }]}>
                Search by ZIP Code
              </Text>
            </View>
            <Text style={[commonStyles.textSecondary, { marginTop: 8, marginBottom: 12 }]}>
              Enter your ZIP code to find nearby courts
            </Text>
            <View style={styles.zipCodeInputContainer}>
              <TextInput
                style={styles.zipCodeInput}
                placeholder="Enter ZIP code"
                placeholderTextColor={colors.textSecondary}
                value={zipCodeInput}
                onChangeText={setZipCodeInput}
                keyboardType="number-pad"
                maxLength={5}
                editable={!searchingZip}
              />
              <TouchableOpacity
                style={styles.zipCodeButton}
                onPress={handleZipCodeSearch}
                disabled={searchingZip}
              >
                {searchingZip ? (
                  <ActivityIndicator color={colors.card} size="small" />
                ) : (
                  <IconSymbol 
                    ios_icon_name="magnifyingglass" 
                    android_material_icon_name="search" 
                    size={20} 
                    color={colors.card} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <IconSymbol 
              ios_icon_name="magnifyingglass" 
              android_material_icon_name="search" 
              size={20} 
              color={colors.textSecondary} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courts by name..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={openGoogleMaps}
            >
              <IconSymbol 
                ios_icon_name="map.fill" 
                android_material_icon_name="map" 
                size={20} 
                color={colors.card} 
              />
              <Text style={styles.mapButtonText}>Open Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <IconSymbol 
                ios_icon_name="slider.horizontal.2" 
                android_material_icon_name="tune" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.filterButtonText}>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sortContainer}>
            <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Sort by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'active-high' && styles.sortButtonActive]}
                  onPress={() => setSortBy('active-high')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'active-high' && styles.sortButtonTextActive]}>
                    Most Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'active-low' && styles.sortButtonActive]}
                  onPress={() => setSortBy('active-low')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'active-low' && styles.sortButtonTextActive]}>
                    Least Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'skill-high' && styles.sortButtonActive]}
                  onPress={() => setSortBy('skill-high')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'skill-high' && styles.sortButtonTextActive]}>
                    Skill: High
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'skill-low' && styles.sortButtonActive]}
                  onPress={() => setSortBy('skill-low')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'skill-low' && styles.sortButtonTextActive]}>
                    Skill: Low
                  </Text>
                </TouchableOpacity>
                {userLocation && (
                  <TouchableOpacity
                    style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
                    onPress={() => setSortBy('distance')}
                  >
                    <Text style={[styles.sortButtonText, sortBy === 'distance' && styles.sortButtonTextActive]}>
                      Nearest
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <Text style={[commonStyles.subtitle, { fontSize: 16, marginBottom: 12 }]}>Filters</Text>
              
              {userLocation && (
                <View style={styles.filterSection}>
                  <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Distance Radius:</Text>
                  <View style={styles.filterButtons}>
                    {[2, 5, 10, 20, 50].map((distance, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.filterButton2,
                          filters.maxDistance === distance && styles.filterButton2Active,
                        ]}
                        onPress={() => setFilters({ ...filters, maxDistance: filters.maxDistance === distance ? undefined : distance })}
                      >
                        <Text style={[
                          styles.filterButton2Text,
                          filters.maxDistance === distance && styles.filterButton2TextActive,
                        ]}>
                          {distance} mi
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.filterSection}>
                <TouchableOpacity
                  style={styles.filterCheckbox}
                  onPress={() => setFilters({ ...filters, friendsOnly: !filters.friendsOnly })}
                >
                  <View style={[styles.checkbox, filters.friendsOnly && styles.checkboxActive]}>
                    {filters.friendsOnly && (
                      <IconSymbol 
                        ios_icon_name="checkmark" 
                        android_material_icon_name="check" 
                        size={16} 
                        color={colors.card} 
                      />
                    )}
                  </View>
                  <Text style={commonStyles.text}>Friends only</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterSection}>
                <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Skill Level:</Text>
                <View style={styles.skillLevelFilters}>
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.skillLevelFilterButton,
                        filters.skillLevels?.includes(level) && styles.skillLevelFilterButtonActive,
                      ]}
                      onPress={() => toggleSkillLevelFilter(level)}
                    >
                      <Text style={[
                        styles.skillLevelFilterText,
                        filters.skillLevels?.includes(level) && styles.skillLevelFilterTextActive,
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilters({});
                  setDisplayCount(INITIAL_DISPLAY_COUNT);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.courtsSection}>
          <View style={styles.sectionHeader}>
            <Text style={commonStyles.subtitle}>
              {processedCourts.length} {processedCourts.length === 1 ? 'Court' : 'Courts'}
              {displayedCourts.length < processedCourts.length && ` (showing ${displayedCourts.length})`}
            </Text>
            <TouchableOpacity onPress={refetch}>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="refresh" 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {displayedCourts.length === 0 ? (
            <View style={commonStyles.card}>
              <Text style={[commonStyles.text, { textAlign: 'center' }]}>
                No courts found matching your filters. Try adjusting your search criteria.
              </Text>
            </View>
          ) : (
            <>
              {displayedCourts.map((court, index) => (
                <TouchableOpacity
                  key={index}
                  style={commonStyles.card}
                  onPress={() => router.push(`/(tabs)/(home)/court/${court.id}`)}
                >
                  <View style={styles.courtHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courtName}>{court.name}</Text>
                      <Text style={commonStyles.textSecondary}>{court.address}</Text>
                      {court.distance !== undefined && (
                        <Text style={[commonStyles.textSecondary, { marginTop: 4, fontWeight: '600' }]}>
                          📍 {court.distance.toFixed(1)} miles away
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.courtMapIcon}
                      onPress={(e) => {
                        e.stopPropagation();
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${court.latitude},${court.longitude}`;
                        Linking.openURL(url);
                      }}
                    >
                      <IconSymbol 
                        ios_icon_name="map.fill" 
                        android_material_icon_name="map" 
                        size={24} 
                        color={colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.courtFooter}>
                    <View style={styles.playerInfoContainer}>
                      <View style={styles.playerCount}>
                        <IconSymbol 
                          ios_icon_name="person.2.fill" 
                          android_material_icon_name="people" 
                          size={16} 
                          color={colors.textSecondary} 
                        />
                        <Text style={[commonStyles.textSecondary, { marginLeft: 6 }]}>
                          {court.currentPlayers} {court.currentPlayers === 1 ? 'player' : 'players'}
                        </Text>
                      </View>

                      {court.friendsPlayingCount > 0 && (
                        <View style={styles.friendsCount}>
                          <IconSymbol 
                            ios_icon_name="person.2.fill" 
                            android_material_icon_name="people" 
                            size={16} 
                            color={colors.accent} 
                          />
                          <Text style={[commonStyles.textSecondary, { marginLeft: 6, color: colors.accent, fontWeight: '600' }]}>
                            {court.friendsPlayingCount} {court.friendsPlayingCount === 1 ? 'friend' : 'friends'}
                          </Text>
                        </View>
                      )}
                      
                      {court.currentPlayers > 0 && (
                        <View style={styles.skillLevelContainer}>
                          <SkillLevelBars 
                            averageSkillLevel={court.averageSkillLevel} 
                            size={16}
                            color={colors.primary}
                          />
                          <Text style={[commonStyles.textSecondary, { fontSize: 12, marginLeft: 6 }]}>
                            {getSkillLevelLabel(court.averageSkillLevel)}
                          </Text>
                        </View>
                      )}

                      {court.averageDupr !== undefined && (
                        <View style={styles.duprContainer}>
                          <IconSymbol 
                            ios_icon_name="chart.bar.fill" 
                            android_material_icon_name="bar_chart" 
                            size={16} 
                            color={colors.accent} 
                          />
                          <Text style={[commonStyles.textSecondary, { marginLeft: 6, fontWeight: '600', color: colors.accent }]}>
                            DUPR: {court.averageDupr.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <IconSymbol 
                      ios_icon_name="chevron.right" 
                      android_material_icon_name="chevron_right" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </View>
                </TouchableOpacity>
              ))}

              {hasMoreCourts && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                >
                  <Text style={styles.loadMoreText}>Load More Courts</Text>
                  <IconSymbol 
                    ios_icon_name="chevron.down" 
                    android_material_icon_name="expand_more" 
                    size={20} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  zipCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zipCodeInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  zipCodeInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  zipCodeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  controlsContainer: {
    marginBottom: 24,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  mapButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  filterButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sortButtonTextActive: {
    color: colors.card,
  },
  filtersContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton2: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButton2Active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButton2Text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButton2TextActive: {
    color: colors.card,
  },
  filterCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillLevelFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  skillLevelFilterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  skillLevelFilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillLevelFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  skillLevelFilterTextActive: {
    color: colors.card,
  },
  clearFiltersButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  courtsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  courtMapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  courtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  playerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  playerCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duprContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
