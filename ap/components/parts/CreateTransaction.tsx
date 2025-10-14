import { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustumInput from "components/CustumInputs";
import { CustomButton } from "components/GlassCard";
import { getApiUrl, API_ENDPOINTS } from "config/api";
import { useAuth } from "contexts/AuthContext";
import { commonEmojis, presetColors } from "components";
import SideMenu from "./SideBar";
interface Tag {
  id: number;
  user_id: number | null;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
}

interface CreateTransactionProps {
  onMenuPress?: () => void;
  isMenuOpen?: boolean;
}

export const CreateTransaction = ({
  onMenuPress,
  isMenuOpen = false,
}: CreateTransactionProps) => {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [merchant, setMerchant] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const insets = useSafeAreaInsets();

  // New tag creation states
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState("");
  const [newTagColor, setNewTagColor] = useState("#8B5CF6"); // Default violet
  const [editingTagId, setEditingTagId] = useState<number | null>(null);

  // Long press menu state
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [menuTag, setMenuTag] = useState<Tag | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const getUserTags = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const url = getApiUrl(`/api/tags/${user.id}`);
        console.log("Fetching tags from:", url);
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(`Failed to fetch tags: ${response.status}`);
        }
        const data = await response.json();
        console.log("Loaded tags:", data.tags);
        setTags(data.tags || []);
      } catch (error: any) {
        console.error("Error fetching tags:", error);
        Alert.alert(
          "Error",
          `Failed to load tags: ${error.message || "Unknown error"}`,
        );
        setTags([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    getUserTags();
  }, [user?.id]);

  // Create or update tag function
  const handleSaveTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert("Error", "Please enter a tag name");
      return;
    }

    try {
      // Generate slug from name
      const slug = newTagName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const isEditing = editingTagId !== null;
      const url = isEditing
        ? getApiUrl(`/api/tags/${editingTagId}`)
        : getApiUrl("/api/tags");

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: newTagName.trim(),
          slug: slug,
          color: newTagColor,
          icon: newTagIcon.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} tag`,
        );
      }

      const savedTag = await response.json();

      if (isEditing) {
        // Update existing tag in list
        setTags(tags.map((t) => (t.id === editingTagId ? savedTag : t)));
      } else {
        // Add new tag to the list
        setTags([...tags, savedTag]);
      }

      // Reset form and close modal
      setNewTagName("");
      setNewTagIcon("");
      setNewTagColor("#8B5CF6");
      setEditingTagId(null);
      setShowTagModal(false);

      Alert.alert(
        "Success",
        `Tag ${isEditing ? "updated" : "created"} successfully!`,
      );
    } catch (error: any) {
      console.error("Error saving tag:", error);
      Alert.alert("Error", error.message || "Failed to save tag");
    }
  };

  // Edit tag handler
  const handleEditTag = (tag: Tag) => {
    if (tag.user_id === null) {
      Alert.alert("Cannot Edit", "Global tags cannot be edited");
      setShowTagMenu(false);
      return;
    }

    // Pre-fill the modal with existing tag data
    setEditingTagId(tag.id);
    setNewTagName(tag.name);
    setNewTagIcon(tag.icon || "");
    setNewTagColor(tag.color || "#8B5CF6");
    setShowTagMenu(false);
    setShowTagModal(true);
  };

  // Delete tag handler
  const handleDeleteTag = async (tag: Tag) => {
    // Prevent deleting global tags
    if (tag.user_id === null) {
      Alert.alert("Cannot Delete", "Global tags cannot be deleted");
      setShowTagMenu(false);
      return;
    }

    setShowTagMenu(false);

    Alert.alert(
      "Delete Tag",
      `Are you sure you want to delete "${tag.name}"? This will remove it from all transactions.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(getApiUrl(`/api/tags/${tag.id}`), {
                method: "DELETE",
              });

              if (!response.ok) throw new Error("Failed to delete");

              // Remove tag from list
              setTags(tags.filter((t) => t.id !== tag.id));

              // Clear selection if deleted tag was selected
              if (selectedTag === tag.id) {
                setSelectedTag(null);
              }

              Alert.alert("Success", "Tag deleted successfully");
            } catch (error) {
              console.error("Error deleting tag:", error);
              Alert.alert("Error", "Failed to delete tag");
            }
          },
        },
      ],
    );
  };

  // Quick amount buttons
  const quickAmounts = [5, 10, 20, 50, 100];

  const setQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = async () => {
    if (!amount || !description) {
      Alert.alert("Error", "Please fill in amount and description");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = getApiUrl(API_ENDPOINTS.TRANSACTIONS);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          merchant: merchant || null,
          type: transactionType,
          tag_id: selectedTag,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      // Reset form
      setAmount("");
      setDescription("");
      setMerchant("");
      setSelectedTag(null);

      Alert.alert(
        "Success",
        `${transactionType === "expense" ? "Expense" : "Income"} added successfully!`,
      );
    } catch (error) {
      console.error("Error creating transaction:", error);
      Alert.alert("Error", "Failed to create transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-gray-900 flex-1">
      {/* Burger Menu - only show when at top and menu not open */}
      {isAtTop && !isMenuOpen && (
        <View className="absolute left-5 z-50" style={{ top: insets.top + 10 }}>
          <Pressable
            onPress={() => {
              console.log("Burger menu pressed");
              onMenuPress?.();
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu-outline" size={40} color="#fff" />
          </Pressable>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setIsAtTop(scrollY <= 50); // Show burger when within 50px of top
        }}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View className="px-6 pb-8" style={{ paddingTop: insets.top + 60 }}>
          <Text className="text-gray-300 text-base font-inter">
            Welcome back,
          </Text>
          <Text className="text-white font-inter-bold text-4xl mt-2">
            {user?.name || "User"}
          </Text>
        </View>

        {/* Transaction Type Toggle */}
        <View className="px-6 mb-8">
          <View className="flex-row bg-gray-800 p-1.5 rounded-2xl border border-gray-600">
            <Pressable
              onPress={() => {
                setTransactionType("expense");
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Select expense"
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor:
                  transactionType === "expense" ? "#DC2626" : "transparent",
                shadowColor:
                  transactionType === "expense" ? "#DC2626" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: transactionType === "expense" ? 4 : 0,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 16,
                  color: transactionType === "expense" ? "#FFFFFF" : "#D1D5DB",
                }}
              >
                💸 Expense
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTransactionType("income");
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Select income"
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor:
                  transactionType === "income" ? "#059669" : "transparent",
                shadowColor:
                  transactionType === "income" ? "#059669" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: transactionType === "income" ? 4 : 0,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 16,
                  color: transactionType === "income" ? "#FFFFFF" : "#D1D5DB",
                }}
              >
                💰 Income
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Amount Section */}
        <View className="px-6 mb-8">
          <Text className="text-gray-200 text-base font-inter-semibold mb-4">
            Amount
          </Text>
          <CustumInput
            label="Amount ($)"
            keyboardType="decimal-pad"
            returnKeyType="next"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Quick Amount Buttons */}
          <View className="flex-row flex-wrap gap-3 mt-6">
            {quickAmounts.map((quickAmount) => (
              <Pressable
                key={quickAmount}
                onPress={() => {
                  console.log("Quick amount pressed:", quickAmount);
                  setQuickAmount(quickAmount);
                }}
                className="bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-600/50 active:bg-gray-700/50 transition-all duration-150"
              >
                <Text className="text-white font-inter-semibold text-base">
                  ${quickAmount}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Category/Tag Section */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <View></View>
            <Pressable
              onPress={() => {
                console.log("Create category pressed");
                setEditingTagId(null);
                setNewTagName("");
                setNewTagIcon("");
                setNewTagColor("#8B5CF6");
                setShowTagModal(true);
              }}
              className="bg-violet-600 px-5 py-3 rounded-xl shadow-lg shadow-violet-600/25 active:bg-violet-700 transition-all duration-150"
            >
              <Text className="text-white font-inter-semibold text-sm">
                + Create
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <Text className="text-gray-400 text-center font-medium">
                Loading categories...
              </Text>
            </View>
          ) : tags.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -24, paddingHorizontal: 24 }}
              nestedScrollEnabled={true}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                {tags.map((tag) => {
                  console.log("Rendering tag:", tag.name, "ID:", tag.id);
                  const isActive = selectedTag === tag.id;
                  return (
                    <Pressable
                      key={tag.id}
                      onPress={() => {
                        console.log(
                          "Category pressed:",
                          tag.name,
                          "ID:",
                          tag.id,
                        );
                        setSelectedTag(tag.id);
                      }}
                      onLongPress={() => {
                        if (tag.user_id !== null) {
                          setMenuTag(tag);
                          setShowTagMenu(true);
                        }
                      }}
                      delayLongPress={500}
                      style={{
                        backgroundColor: isActive
                          ? tag.color || "#8B5CF6"
                          : "rgba(31, 41, 55, 0.6)",
                        paddingHorizontal: 24,
                        paddingVertical: 16,
                        borderRadius: 16,
                        borderWidth: 2,
                        minWidth: 120,
                        borderColor: isActive
                          ? "#A78BFA"
                          : "rgba(75, 85, 99, 0.5)",
                        shadowColor: isActive ? "#8B5CF6" : "transparent",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: isActive ? 4 : 0,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 24,
                          marginBottom: 8,
                        }}
                      >
                        {tag.icon}
                      </Text>
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 12,
                          fontWeight: "bold",
                          color: isActive ? "#FFFFFF" : "#D1D5DB",
                        }}
                        numberOfLines={1}
                      >
                        {tag.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <Text className="text-gray-400 text-center font-medium">
                No categories available. Create one to get started!
              </Text>
            </View>
          )}
        </View>

        {/* Description & Merchant */}
        <View className="px-6 mb-8">
          <Text className="text-gray-200 text-base font-inter-semibold mb-6">
            Details
          </Text>
          <CustumInput
            label="Description: e.g., Groceries, Coffee"
            returnKeyType="next"
            value={description}
            onChangeText={setDescription}
          />
          <View className="mt-3">
            <CustumInput
              label="Merchant (optional)"
              returnKeyType="done"
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>
        </View>

        {/* Add Button */}
        <View className="px-6 mt-8 mb-6">
          <Pressable
            onPress={() => {
              console.log("Submit button pressed");
              handleSubmit();
            }}
            disabled={isSubmitting}
            className={`py-5 rounded-2xl shadow-lg transition-all duration-200 active:scale-95 ${
              transactionType === "expense"
                ? "bg-red-600 shadow-red-600/25"
                : "bg-green-600 shadow-green-600/25"
            } ${isSubmitting ? "opacity-70" : ""}`}
          >
            <Text className="text-white text-center font-inter-bold text-lg">
              {isSubmitting
                ? "Adding..."
                : `Add ${transactionType === "expense" ? "Expense" : "Income"}`}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Tag Options Menu Modal */}
      <Modal
        visible={showTagMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTagMenu(false)}
      >
        <Pressable
          onPress={() => setShowTagMenu(false)}
          className="flex-1 justify-center items-center bg-black/70"
        >
          <View className="bg-gray-800 rounded-3xl p-6 mx-6 w-72 border border-gray-700">
            <Text className="text-white font-bold text-xl mb-6 text-center">
              {menuTag?.icon} {menuTag?.name}
            </Text>

            <Pressable
              onPress={() => menuTag && handleEditTag(menuTag)}
              className="bg-violet-600 py-3.5 rounded-2xl mb-3"
            >
              <Text className="text-white text-center font-bold text-base">
                ✏️ Edit Tag
              </Text>
            </Pressable>

            <Pressable
              onPress={() => menuTag && handleDeleteTag(menuTag)}
              className="bg-red-600 py-3.5 rounded-2xl mb-3"
            >
              <Text className="text-white text-center font-bold text-base">
                🗑️ Delete Tag
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowTagMenu(false)}
              className="bg-gray-700 py-3.5 rounded-2xl border border-gray-600"
            >
              <Text className="text-gray-200 text-center font-bold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Create/Edit Tag Modal */}
      <Modal
        visible={showTagModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowTagModal(false);
          setEditingTagId(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">
                {editingTagId ? "✏️ Edit Category" : "✨ Create Category"}
              </Text>
              <Pressable
                onPress={() => {
                  setShowTagModal(false);
                  setEditingTagId(null);
                }}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* Tag Name */}
            <CustumInput
              label="Category name: e.g., Coffee, Rent"
              value={newTagName}
              onChangeText={setNewTagName}
            />

            {/* Emoji Selector */}
            <Text className="text-gray-400 text-sm mb-3 mt-4 font-medium">
              Choose Icon
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <View className="flex-row gap-2">
                {commonEmojis.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => setNewTagIcon(emoji)}
                    className={`p-4 rounded-2xl border-2 ${
                      newTagIcon === emoji
                        ? "bg-violet-600 border-violet-400"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <Text className="text-3xl">{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <CustumInput
              label="Or type emoji"
              value={newTagIcon}
              onChangeText={setNewTagIcon}
            />

            {/* Color Selector */}
            <Text className="text-gray-400 text-sm mb-3 mt-4 font-medium">
              Choose Color
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {presetColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setNewTagColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-16 h-16 rounded-2xl ${
                    newTagColor === color
                      ? "border-4 border-white"
                      : "border-2 border-gray-700"
                  }`}
                />
              ))}
            </View>

            {/* Preview */}
            {newTagName && (
              <View className="mb-6 bg-gray-800 p-5 rounded-2xl border border-gray-700">
                <Text className="text-gray-400 text-sm mb-3 font-medium">
                  Preview
                </Text>
                <View
                  style={{ backgroundColor: newTagColor }}
                  className="px-6 py-4 rounded-2xl self-start"
                >
                  <Text className="text-center text-3xl mb-2">
                    {newTagIcon}
                  </Text>
                  <Text className="text-white font-bold text-center">
                    {newTagName}
                  </Text>
                </View>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowTagModal(false);
                  setEditingTagId(null);
                }}
                className="flex-1 bg-gray-700 py-4 rounded-2xl border border-gray-600"
              >
                <Text className="text-white text-center font-bold text-base">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveTag}
                className="flex-1 bg-violet-600 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-bold text-base">
                  {editingTagId ? "Update" : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
