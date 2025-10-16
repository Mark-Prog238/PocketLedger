import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleExportData = () => {
    Alert.alert("Export Data", "Choose export format:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "CSV",
        onPress: () => {
          Alert.alert(
            "Export Started",
            "Your data will be exported as CSV and saved to your device.",
          );
          setShowExportModal(false);
        },
      },
      {
        text: "JSON",
        onPress: () => {
          Alert.alert(
            "Export Started",
            "Your data will be exported as JSON and saved to your device.",
          );
          setShowExportModal(false);
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert("Cache Cleared", "All cached data has been cleared.");
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-gray-300 text-base font-inter">Settings</Text>
          <Text className="text-white font-inter-bold text-4xl mt-2">
            Preferences
          </Text>
        </View>

        {/* Account Section */}
        <View className="px-6 mb-6">
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              ACCOUNT
            </Text>

            <Pressable className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={24} color="#9CA3AF" />
                <View className="ml-3">
                  <Text className="text-white font-medium">Profile</Text>
                  <Text className="text-gray-400 text-sm">{user?.email}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <Ionicons name="key-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">
                  Change Password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* App Settings */}
        <View className="px-6 mb-6">
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              APP SETTINGS
            </Text>

            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
              <View className="flex-row items-center">
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">
                  Push Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#374151", true: "#8B5CF6" }}
                thumbColor={notificationsEnabled ? "#ffffff" : "#9CA3AF"}
              />
            </View>

            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="moon-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">Dark Mode</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#374151", true: "#8B5CF6" }}
                thumbColor={darkModeEnabled ? "#ffffff" : "#9CA3AF"}
              />
            </View>

            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="finger-print-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">
                  Biometric Login
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: "#374151", true: "#8B5CF6" }}
                thumbColor={biometricEnabled ? "#ffffff" : "#9CA3AF"}
              />
            </View>
          </View>
        </View>

        {/* Data & Privacy */}
        <View className="px-6 mb-6">
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              DATA & PRIVACY
            </Text>

            <Pressable
              onPress={() => setShowExportModal(true)}
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="download-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={handleClearCache}
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="trash-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">Clear Cache</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <Ionicons name="shield-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">
                  Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Support */}
        <View className="px-6 mb-6">
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              SUPPORT
            </Text>

            <Pressable className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
              <View className="flex-row items-center">
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">
                  Contact Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() => setShowAboutModal(true)}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-6 mb-6">
          <View className="bg-red-900/20 rounded-2xl border border-red-800/30 overflow-hidden">
            <Text className="text-red-400 text-sm font-medium px-4 py-3 bg-red-900/30">
              DANGER ZONE
            </Text>

            <Pressable
              onPress={handleLogout}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                <Text className="text-red-400 font-medium ml-3">Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">Export Data</Text>
              <Pressable
                onPress={() => setShowExportModal(false)}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            <Text className="text-gray-300 text-base mb-6">
              Choose the format you'd like to export your data in:
            </Text>

            <View className="space-y-3">
              <Pressable
                onPress={() => handleExportData()}
                className="bg-gray-800 p-4 rounded-xl flex-row items-center"
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#10B981"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-white font-semibold">CSV Format</Text>
                  <Text className="text-gray-400 text-sm">
                    Compatible with Excel and Google Sheets
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>

              <Pressable
                onPress={() => handleExportData()}
                className="bg-gray-800 p-4 rounded-xl flex-row items-center"
              >
                <Ionicons name="code-outline" size={24} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-white font-semibold">JSON Format</Text>
                  <Text className="text-gray-400 text-sm">
                    Raw data format for developers
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">
                About PocketLedger
              </Text>
              <Pressable
                onPress={() => setShowAboutModal(false)}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-violet-600 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="wallet" size={40} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold">
                PocketLedger
              </Text>
              <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
            </View>

            <Text className="text-gray-300 text-base mb-6 text-center">
              A beautiful and intuitive personal finance app built with React
              Native and Expo. Track your expenses, manage budgets, and gain
              insights into your spending habits.
            </Text>

            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400">Built with</Text>
                <Text className="text-white">React Native & Expo</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400">Backend</Text>
                <Text className="text-white">Node.js & MySQL</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400">UI Framework</Text>
                <Text className="text-white">NativeWind (Tailwind)</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowAboutModal(false)}
              className="bg-violet-600 py-4 rounded-2xl mt-6"
            >
              <Text className="text-white text-center font-bold text-base">
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
