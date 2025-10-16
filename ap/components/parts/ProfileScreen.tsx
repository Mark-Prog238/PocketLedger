import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { getApiUrl } from "config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustumInput from "components/CustumInputs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ProfileScreen = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user, token, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleEditProfile = () => {
    setEditingName(user?.name || "");
    setEditingEmail(user?.email || "");
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const saveProfile = async () => {
    if (!editingName.trim() || !editingEmail.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!token || !user?.id) return;

    try {
      const response = await fetch(getApiUrl("/api/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingName.trim(),
          email: editingEmail.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      setShowEditModal(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (!token || !user?.id) return;

    try {
      const response = await fetch(getApiUrl("/api/change-password"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      setShowPasswordModal(false);
      Alert.alert("Success", "Password changed successfully!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      Alert.alert("Error", error.message || "Failed to change password");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Reset onboarding status so user sees onboarding on next login
          await AsyncStorage.removeItem("onboarding_completed");
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Delete",
              "This will permanently delete your account and all data. Are you absolutely sure?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: async () => {
                    // Implement account deletion
                    Alert.alert(
                      "Feature Coming Soon",
                      "Account deletion will be available in a future update.",
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-gray-300 text-base font-inter">
            Account Settings
          </Text>
          <Text className="text-white font-inter-bold text-4xl mt-2">
            Profile
          </Text>
        </View>

        {/* Profile Info Card */}
        <View className="px-6 mb-6">
          <View className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <View className="items-center mb-6">
              <Image
                source={require("../../assets/user.png")}
                className="w-20 h-20 mb-4 rounded-full"
                resizeMode="contain"
              />
              <Text className="text-white font-bold text-xl">
                {user?.name || "User"}
              </Text>
              <Text className="text-gray-400 text-sm">
                {user?.email || "user@example.com"}
              </Text>
            </View>

            <Pressable
              onPress={handleEditProfile}
              className="bg-violet-600 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Edit Profile
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Settings Options */}
        <View className="px-6 space-y-4">
          {/* Account Settings */}
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              ACCOUNT
            </Text>

            <Pressable
              onPress={handleChangePassword}
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">
                  Change Password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Export data feature will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="download-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Backup settings will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="cloud-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">
                  Backup Settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Settings */}
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              SETTINGS
            </Text>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "App preferences will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">
                  App Preferences
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Theme settings will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">
                  Theme & Appearance
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Language settings will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="language-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">Language</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* App Settings */}
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              APP
            </Text>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Notifications settings will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">
                  Notifications
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Privacy settings will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="shield-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">Privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Theme settings will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <Text className="text-white font-medium ml-3">Theme</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Support */}
          <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <Text className="text-gray-400 text-sm font-medium px-4 py-3 bg-gray-800/30">
              SUPPORT
            </Text>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Help center will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
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

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Contact support will be available soon.",
                )
              }
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={24} color="#9CA3AF" />
                <Text className="text-white font-medium ml-3">
                  Contact Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "App Info",
                  "PocketLedger v1.0.0\nBuilt with React Native & Expo",
                )
              }
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

          {/* Danger Zone */}
          <View className="bg-red-900/20 rounded-2xl border border-red-800/30 overflow-hidden">
            <Text className="text-red-400 text-sm font-medium px-4 py-3 bg-red-900/30">
              DANGER ZONE
            </Text>

            <Pressable
              onPress={handleLogout}
              className="flex-row items-center justify-between px-4 py-4 border-b border-red-800/30"
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                <Text className="text-red-400 font-medium ml-3">Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </Pressable>

            <Pressable
              onPress={handleDeleteAccount}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
                <Text className="text-red-400 font-medium ml-3">
                  Delete Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">
                Edit Profile
              </Text>
              <Pressable
                onPress={() => setShowEditModal(false)}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            <CustumInput
              label="Full Name"
              value={editingName}
              onChangeText={setEditingName}
              style={{ backgroundColor: "#000020" }}
            />

            <CustumInput
              label="Email Address"
              keyboardType="email-address"
              value={editingEmail}
              onChangeText={setEditingEmail}
              style={{ backgroundColor: "#000020" }}
            />

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={() => setShowEditModal(false)}
                className="flex-1 bg-gray-700 py-4 rounded-2xl border border-gray-600"
              >
                <Text className="text-white text-center font-bold text-base">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={saveProfile}
                className="flex-1 bg-violet-600 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-bold text-base">
                  Save Changes
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">
                Change Password
              </Text>
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            <CustumInput
              label="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={{ backgroundColor: "#000020" }}
            />

            <CustumInput
              label="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={{ backgroundColor: "#000020" }}
            />

            <CustumInput
              label="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{ backgroundColor: "#000020" }}
            />

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-700 py-4 rounded-2xl border border-gray-600"
              >
                <Text className="text-white text-center font-bold text-base">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={savePassword}
                className="flex-1 bg-violet-600 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-bold text-base">
                  Change Password
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
