import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { CustomButton } from "components/GlassCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { sideBarItems } from "components";
type MenuItem = { label: string; icon: string };
type Props = {
  menuItems?: MenuItem[];
  onSelect?: (item: string) => void;
};

export default function SideMenu({
  menuItems = sideBarItems,
  onSelect,
}: Props) {
  const [selected, setSelected] = useState<string>(menuItems[0].label);
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Drawer animation
  const drawerWidth = Math.round(width * 0.72);
  const translateX = useSharedValue(-drawerWidth);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    translateX.value = withTiming(isShown ? 0 : -drawerWidth, {
      duration: 220,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShown, drawerWidth]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: drawerWidth,
  }));

  const toggleMenu = () => setIsShown((prev) => !prev);
  const handleSelect = (item: string) => {
    setSelected(item);
    if (item === "LOGOUT") logout();
    else onSelect?.(item);
  };

  return (
    <>
      {/* BURGER ICON */}
      {!isShown && (
        <View className="w-2/6 pl-5 pt-5">
          <Pressable
            onPress={toggleMenu}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu-outline" size={40} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* SIDEBAR OVERLAY */}
      {isShown && (
        <Pressable
          onPress={toggleMenu}
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 flex-row"
          style={{ zIndex: 50 }}
          accessibilityRole="button"
          accessibilityLabel="Close menu overlay"
        >
          {/* STOP touch propagation inside the menu */}
          <Pressable onPress={(e) => e.stopPropagation()} className="">
            <Animated.View
              className="bg-gray-900/95 border-r border-gray-700 rounded-r-2xl h-full"
              style={drawerStyle}
              importantForAccessibility="yes"
            >
              {/* Profile section */}
              <View className="items-center justify-center mt-24  mb-5">
                <Image
                  source={require("../../assets/user.png")}
                  className="w-20 h-20 mb-3 rounded-full"
                  resizeMode="contain"
                />
                <Text className="text-white font-bold text-base">
                  {user?.name || user?.email || "User"}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {user?.email ?? "Email"}
                </Text>
              </View>

              <View className="h-px bg-gray-700/50 mx-3 pb-0.5 mb-8" />

              {/* Menu + Footer layout */}
              <View className="flex-1 justify-between pb-5">
                {/* Menu Items */}
                <View className="px-2">
                  {menuItems.map((item, i) => {
                    const isActive = selected === item.label;
                    return (
                      <View key={item.label} className="relative">
                        <Pressable
                          onPress={() => handleSelect(item.label)}
                          className={`flex flex-row items-center gap-2 rounded-xl px-4 py-4 mb-2 transition-all active:scale-95 ${
                            isActive
                              ? "bg-violet-600/90 shadow-lg shadow-violet-600/30 scale-105"
                              : "bg-transparent"
                          }`}
                        >
                          <View
                            className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${
                              isActive ? "bg-violet-400" : "bg-transparent"
                            }`}
                          />
                          <Ionicons
                            name={item.icon as any}
                            size={22}
                            color={isActive ? "#fff" : "#9CA3AF"}
                          />
                          <Text
                            className={`font-semibold text-base flex-1 ${
                              isActive ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {item.label}
                          </Text>
                          <Ionicons
                            name="chevron-forward-outline"
                            size={16}
                            color={isActive ? "#fff" : "#6b7280"}
                          />
                        </Pressable>

                        {/* Divider between items */}
                        {i < menuItems.length - 1 && (
                          <View className="h-px bg-gray-800/80 mx-2 mb-2 rounded-full" />
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Footer (pinned to bottom) */}
                <View
                  className="px-4 pb-2"
                  style={{ paddingBottom: insets.bottom + 8 }}
                >
                  <CustomButton onPress={() => handleSelect("LOGOUT")}>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-bold text-base justify-center items-center">
                        LOGOUT
                      </Text>
                      <Ionicons
                        name="log-out-outline"
                        size={22}
                        color="#ffff"
                      />
                    </View>
                  </CustomButton>
                  <Text className="text-gray-500 text-xs left-3">v1.0.0</Text>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      )}
    </>
  );
}
