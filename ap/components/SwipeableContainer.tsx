import React, { useRef, useState } from "react";
import { View, PanResponder, Dimensions } from "react-native";

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  currentIndex: number;
  totalItems: number;
}

export const SwipeableContainer = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  currentIndex,
  totalItems,
}: SwipeableContainerProps) => {
  const { width } = Dimensions.get("window");
  const swipeThreshold = width * 0.3; // 30% of screen width
  const startX = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
    },
    onPanResponderGrant: (evt) => {
      startX.current = evt.nativeEvent.pageX;
    },
    onPanResponderRelease: (evt, gestureState) => {
      const endX = evt.nativeEvent.pageX;
      const deltaX = endX - startX.current;
      const deltaY = Math.abs(gestureState.dy);

      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && currentIndex > 0) {
          // Swipe right - go to previous
          onSwipeRight();
        } else if (deltaX < 0 && currentIndex < totalItems - 1) {
          // Swipe left - go to next
          onSwipeLeft();
        }
      }
    },
  });

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};
