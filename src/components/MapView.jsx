import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { Text } from './AppText';
import MapViewLib, { Marker, Polyline } from 'react-native-maps';
import { APIProvider, Map, Marker as WebMarker, Polyline as WebPolyline } from '@vis.gl/react-google-maps';
import { useWalkingRoute } from '../hooks/useWalkingRoute';
import { useCheckpointTracker } from '../hooks/useCheckpointTracker';

const { width } = Dimensions.get('window');

// Inline checkpoint celebration toast
function CheckpointToast({ checkpoint, onDismiss }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true })
        .start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, onDismiss]);

  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.toastEmoji}>🎉</Text>
      <View style={styles.toastTextWrap}>
        <Text style={styles.toastTitle}>CHECKPOINT {checkpoint.index + 1}!</Text>
        <Text style={styles.toastSub}>You're crushing it! Keep going 🔥</Text>
      </View>
    </Animated.View>
  );
}

export default function MapView({ milestone, levelNumber, onDone, onEndLevel }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(0));

  const { route, checkpoints, routeError, isGenerating, currentLocation, isTracking } = useWalkingRoute(milestone.target);
  const { trackedCheckpoints, latestReached, reachedCount, totalCount, dismissCelebration } = useCheckpointTracker(checkpoints, currentLocation);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

  }, [fadeAnim, pulseAnim]);

  const handleDone = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onDone());
  };

  const handleEnd = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onEndLevel());
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.levelBadge}>LV{levelNumber}</Text>
          <View>
            <Text style={styles.villainName}>
              {milestone.emoji} {milestone.name}
            </Text>
            <Text style={styles.routeInfo}>200m loop · {milestone.target.toLocaleString()} steps</Text>
          </View>
        </View>
      </View>

      {/* Real Map Area */}
      <View style={styles.mapArea}>
        {currentLocation && !isGenerating ? (
          Platform.OS === 'web' ? (
            <APIProvider apiKey={'AIzaSyA9kHSqZsbpvc1Pp-ll3n3uVukvtvdm6Ug'}>
              <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                defaultZoom={15}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
              >
                {route && route.length > 0 && (
                  <WebPolyline 
                    path={route.map(pt => ({ lat: pt.latitude, lng: pt.longitude }))} 
                    strokeColor={'#00fa9a'} 
                    strokeWeight={5} 
                  />
                )}

                <WebMarker position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }} title="Start" />

                {trackedCheckpoints.map((cp) => (
                  <WebMarker
                    key={`cp-${cp.index}`}
                    position={{ lat: cp.latitude, lng: cp.longitude }}
                    title={`Checkpoint ${cp.index + 1}`}
                  />
                ))}
              </Map>
            </APIProvider>
          ) : (
            <MapViewLib 
              style={{ flex: 1 }}
              region={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={true}
              provider="google"
            >
              {route && (
                <Polyline 
                  coordinates={route}
                  strokeColor="#00fa9a"
                  strokeWidth={5}
                />
              )}
              <Marker 
                coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }} 
                title="Start" 
                description="Origin point" 
              />
              
              {/* Checkpoint markers */}
              {trackedCheckpoints.map((cp) => (
                <Marker
                  key={`cp-${cp.index}`}
                  coordinate={{ latitude: cp.latitude, longitude: cp.longitude }}
                  title={`Checkpoint ${cp.index + 1}`}
                  description={cp.reached ? 'Reached! ✅' : 'Walk here to claim!'}
                  pinColor={cp.reached ? '#00fa9a' : '#ff6b9d'}
                />
              ))}
            </MapViewLib>
          )
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: '#333'}}>
              {routeError ? routeError : (isGenerating ? "Generating walking route..." : "Locating GPS...")}
            </Text>
          </View>
        )}

        {/* Checkpoint progress chip */}
        <View style={styles.infoChip}>
          <View style={[styles.infoDot, reachedCount === totalCount && totalCount > 0 && { backgroundColor: '#00fa9a' }]} />
          <Text style={styles.infoText}>
            {totalCount > 0 ? `${reachedCount}/${totalCount} checkpoints · Walking` : 'Walking · 200m · ~3 min'}
          </Text>
        </View>

        {/* Checkpoint celebration toast */}
        {latestReached && (
          <CheckpointToast checkpoint={latestReached} onDismiss={dismissCelebration} />
        )}
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.villainBar}>
          <Text style={styles.villainAvatar}>{milestone.emoji}</Text>
          <View style={styles.villainTextWrap}>
            <Text style={styles.villainLabel}>{milestone.name}</Text>
            <Text style={styles.villainSub}>{milestone.flavor}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnDone]} onPress={handleDone}>
            <Text style={styles.btnIcon}>✅</Text>
            <Text style={styles.btnTextDone}>Done</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnEnd]} onPress={handleEnd}>
            <Text style={styles.btnIcon}>✕</Text>
            <Text style={styles.btnTextEnd}>End Level</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#00fa9a',
    color: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  villainName: {
    fontSize: 18,
    color: '#333',
  },
  routeInfo: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#e8e4d8',
    overflow: 'hidden',
  },
  infoChip: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4285F4',
    marginRight: 8,
  },
  infoText: {
    color: '#333',
    fontSize: 12,
  },
  // Checkpoint celebration toast
  toast: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00fa9a',
    elevation: 10,
    shadowColor: '#00fa9a',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  toastEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  toastTextWrap: {
    flex: 1,
  },
  toastTitle: {
    color: '#00fa9a',
    fontSize: 16,
    letterSpacing: 1,
  },
  toastSub: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  villainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  villainAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  villainTextWrap: {
    flex: 1,
  },
  villainLabel: {
    fontSize: 18,
    color: '#333',
  },
  villainSub: {
    color: '#666',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDone: {
    backgroundColor: '#00fa9a',
  },
  btnEnd: {
    backgroundColor: '#f5f5f5',
  },
  btnIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  btnTextDone: {
    color: '#000',
    fontSize: 16,
  },
  btnTextEnd: {
    color: '#ff6b9d',
    fontSize: 16,
  },
});
