import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { getApiUrl } from "config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustumInput from "components/CustumInputs";
interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  period: "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date: string;
  is_active: boolean;
  categories: Array<{
    id: number;
    tag_id: number;
    amount: number;
    spent: number;
    tag_name: string;
    tag_color: string;
    tag_icon: string;
  }>;
}

export const BudgetScreen = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [isAtTop, setIsAtTop] = useState(true);
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();

  const fetchBudgets = async () => {
    if (!token || !user?.id) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/budgets?userId=${user.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const data = await response.json();
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      Alert.alert("Error", "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user?.id, token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressPercentage = (spent: number, amount: number) => {
    return Math.min((spent / amount) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "#EF4444"; // Red
    if (percentage >= 80) return "#F59E0B"; // Amber
    return "#10B981"; // Green
  };

  const createBudget = async () => {
    if (!newBudgetName.trim() || !newBudgetAmount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!token || !user?.id) return;

    try {
      const amount = parseFloat(newBudgetAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }

      // Calculate dates based on period
      const now = new Date();
      let endDate = new Date();

      switch (newBudgetPeriod) {
        case "weekly":
          endDate.setDate(now.getDate() + 7);
          break;
        case "monthly":
          endDate.setMonth(now.getMonth() + 1);
          break;
        case "yearly":
          endDate.setFullYear(now.getFullYear() + 1);
          break;
      }

      const response = await fetch(getApiUrl("/api/budgets"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          name: newBudgetName.trim(),
          amount: amount,
          period: newBudgetPeriod,
          startDate: now.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create budget");
      }

      // Reset form and close modal
      setNewBudgetName("");
      setNewBudgetAmount("");
      setNewBudgetPeriod("monthly");
      setShowCreateModal(false);

      // Refresh budgets
      fetchBudgets();

      Alert.alert("Success", "Budget created successfully!");
    } catch (error: any) {
      console.error("Error creating budget:", error);
      Alert.alert("Error", error.message || "Failed to create budget");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-lg">Loading budgets...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setIsAtTop(scrollY <= 50);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-gray-300 text-base font-inter">
            Budget Management
          </Text>
          <Text className="text-white font-inter-bold text-4xl mt-2">
            Track Spending
          </Text>
        </View>

        {/* Create Budget Button */}
        <View className="px-6 mb-6">
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="bg-violet-600 py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Create New Budget
            </Text>
          </Pressable>
        </View>

        {/* Budgets List */}
        {budgets.length > 0 ? (
          <View className="px-6 space-y-4">
            {budgets.map((budget) => {
              const progressPercentage = getProgressPercentage(
                budget.spent,
                budget.amount,
              );
              const progressColor = getProgressColor(progressPercentage);
              const remaining = budget.amount - budget.spent;

              return (
                <View
                  key={budget.id}
                  className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700"
                >
                  {/* Budget Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white font-bold text-lg">
                      {budget.name}
                    </Text>
                    <View className="bg-gray-700 px-3 py-1 rounded-full">
                      <Text className="text-gray-300 text-xs font-medium uppercase">
                        {budget.period}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-400 text-sm">
                        {formatCurrency(budget.spent)} of{" "}
                        {formatCurrency(budget.amount)}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {progressPercentage.toFixed(0)}%
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPercentage}%`,
                          backgroundColor: progressColor,
                        }}
                      />
                    </View>
                  </View>

                  {/* Budget Details */}
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-gray-400 text-sm">Remaining</Text>
                      <Text
                        className={`text-lg font-bold ${
                          remaining >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {formatCurrency(remaining)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-gray-400 text-sm">Status</Text>
                      <Text
                        className={`text-sm font-medium ${
                          progressPercentage >= 100
                            ? "text-red-400"
                            : progressPercentage >= 80
                              ? "text-amber-400"
                              : "text-green-400"
                        }`}
                      >
                        {progressPercentage >= 100
                          ? "Over Budget"
                          : progressPercentage >= 80
                            ? "Warning"
                            : "On Track"}
                      </Text>
                    </View>
                  </View>

                  {/* Categories */}
                  {budget.categories && budget.categories.length > 0 && (
                    <View className="mt-4 pt-4 border-t border-gray-700">
                      <Text className="text-gray-400 text-sm mb-2">
                        Categories
                      </Text>
                      <View className="space-y-2">
                        {budget.categories.map((category) => {
                          const catProgress = getProgressPercentage(
                            category.spent,
                            category.amount,
                          );
                          return (
                            <View
                              key={category.id}
                              className="flex-row items-center justify-between"
                            >
                              <View className="flex-row items-center flex-1">
                                <Text className="text-lg mr-2">
                                  {category.tag_icon}
                                </Text>
                                <Text className="text-white text-sm flex-1">
                                  {category.tag_name}
                                </Text>
                              </View>
                              <View className="items-end">
                                <Text className="text-gray-300 text-sm">
                                  {formatCurrency(category.spent)} /{" "}
                                  {formatCurrency(category.amount)}
                                </Text>
                                <Text className="text-gray-400 text-xs">
                                  {catProgress.toFixed(0)}%
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View className="px-6 py-12 items-center">
            <Ionicons name="wallet-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-lg font-medium mt-4">
              No budgets yet
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              Create your first budget to start tracking your spending
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Budget Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">
                Create Budget
              </Text>
              <Pressable
                onPress={() => setShowCreateModal(false)}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* Budget Name */}
            <CustumInput
              label="Budget name: e.g., Monthly Expenses"
              value={newBudgetName}
              onChangeText={setNewBudgetName}
              style={{ backgroundColor: "#000020" }}
            />

            {/* Budget Amount */}
            <CustumInput
              label="Budget amount ($)"
              keyboardType="decimal-pad"
              value={newBudgetAmount}
              onChangeText={setNewBudgetAmount}
              style={{ backgroundColor: "#000020" }}
            />

            {/* Period Selector */}
            <Text className="text-gray-400 text-sm mb-3 mt-4 font-medium">
              Budget Period
            </Text>
            <View className="flex-row gap-2 mb-6">
              {[
                { key: "weekly", label: "Weekly" },
                { key: "monthly", label: "Monthly" },
                { key: "yearly", label: "Yearly" },
              ].map((period) => (
                <Pressable
                  key={period.key}
                  onPress={() => setNewBudgetPeriod(period.key as any)}
                  className={`flex-1 py-3 rounded-xl ${
                    newBudgetPeriod === period.key
                      ? "bg-violet-600"
                      : "bg-gray-800"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      newBudgetPeriod === period.key
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {period.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 py-4 rounded-2xl border border-gray-600"
              >
                <Text className="text-white text-center font-bold text-base">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={createBudget}
                className="flex-1 bg-violet-600 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-bold text-base">
                  Create Budget
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
