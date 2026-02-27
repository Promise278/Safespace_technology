import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: "#E1E1E1",
          opacity,
        },
        style,
      ]}
    />
  );
};

export const StorySkeleton = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <Skeleton width={80} height={14} style={{ marginBottom: 6 }} />
          <Skeleton width={50} height={10} />
        </View>
      </View>
      <Skeleton width="90%" height={20} style={{ marginBottom: 12 }} />
      <View style={{ marginBottom: 20 }}>
        <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="70%" height={12} />
      </View>
      <View style={styles.footer}>
        <Skeleton width={60} height={30} borderRadius={8} style={{ marginRight: 20 }} />
        <Skeleton width={80} height={30} borderRadius={8} />
      </View>
    </View>
  );
};

export const CommentSkeleton = () => {
  return (
    <View style={styles.comment}>
      <View style={styles.header}>
        <Skeleton width={60} height={12} style={{ marginRight: 8 }} />
        <Skeleton width={40} height={10} />
      </View>
      <Skeleton width="100%" height={14} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  comment: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
});
