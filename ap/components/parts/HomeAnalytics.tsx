import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { getApiUrl } from "config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Transaction {
  id: number;
  amount_minor: number;
  direction: "income" | "expense";
  description: string;
  merchant?: string;
  occurred_at: string;
  tag_names?: string;
  tag_colors?: string;
  tag_icons?: string;
}

interface Analytics {
  totals: {
    income: number;
    expense: number;
    net: number;
  };
  categories: Array<{
    category_name: string;
    category_color: string;
    category_icon: string;
    total: number;
    count: number;
  }>;
  recent: Transaction[];
}

export const HomeAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();

  const fetchAnalytics = async (period: string = selectedPeriod) => {
    if (!token || !user?.id) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/analytics?period=${period}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      Alert.alert("Error", "Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id, token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      default:
        return "This Month";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-lg">Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="px-6 pt-4 pb-6">
        <Text className="text-gray-300 text-base font-inter">
          Welcome back,
        </Text>
        <Text className="text-white font-inter-bold text-4xl mt-2">
          {user?.name || "User"}
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          {getPeriodLabel(selectedPeriod)}
        </Text>
      </View>

      {/* Period Selector */}
      <View className="px-6 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {[
              { key: "day", label: "Today" },
              { key: "week", label: "Week" },
              { key: "month", label: "Month" },
              { key: "year", label: "Year" },
            ].map((period) => (
              <Pressable
                key={period.key}
                onPress={() => {
                  setSelectedPeriod(period.key as any);
                  fetchAnalytics(period.key);
                }}
                className={`px-4 py-2 rounded-full ${
                  selectedPeriod === period.key
                    ? "bg-violet-600"
                    : "bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedPeriod === period.key
                      ? "text-white"
                      : "text-gray-300"
                  }`}
                >
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Summary Cards */}
      {analytics ? (
        <>
          <View className="px-6 mb-6">
            <View className="flex-row gap-4">
              {/* Income Card */}
              <View className="flex-1 bg-green-600/20 p-4 rounded-2xl border border-green-600/30">
                <View className="flex-row items-center justify-between mb-2">
                  <Ionicons name="trending-up" size={20} color="#10B981" />
                  <Text className="text-green-400 text-xs font-medium">
                    INCOME
                  </Text>
                </View>
                <Text className="text-white text-2xl font-bold">
                  {formatCurrency(analytics.totals.income)}
                </Text>
              </View>

              {/* Expense Card */}
              <View className="flex-1 bg-red-600/20 p-4 rounded-2xl border border-red-600/30">
                <View className="flex-row items-center justify-between mb-2">
                  <Ionicons name="trending-down" size={20} color="#EF4444" />
                  <Text className="text-red-400 text-xs font-medium">
                    EXPENSE
                  </Text>
                </View>
                <Text className="text-white text-2xl font-bold">
                  {formatCurrency(analytics.totals.expense)}
                </Text>
              </View>
            </View>

            {/* Net Worth Card */}
            <View className="mt-4 bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons
                  name={analytics.totals.net >= 0 ? "wallet" : "alert-circle"}
                  size={20}
                  color={analytics.totals.net >= 0 ? "#10B981" : "#EF4444"}
                />
                <Text className="text-gray-400 text-xs font-medium">
                  NET WORTH
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${
                  analytics.totals.net >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(analytics.totals.net)}
              </Text>
            </View>
          </View>

          {/* Categories Breakdown */}
          {analytics.categories.length > 0 && (
            <View className="px-6 mb-6">
              <Text className="text-white text-lg font-bold mb-4">
                Spending by Category
              </Text>
              <View className="space-y-3">
                {analytics.categories.slice(0, 5).map((category, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between bg-gray-800/50 p-3 rounded-xl"
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-3">
                        {category.category_icon}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-white font-medium">
                          {category.category_name}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {category.count} transactions
                        </Text>
                      </View>
                    </View>
                    <Text className="text-white font-bold">
                      {formatCurrency(category.total)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recent Transactions */}
          {analytics.recent.length > 0 && (
            <View className="px-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-bold">
                  Recent Transactions
                </Text>
                <Pressable>
                  <Text className="text-violet-400 text-sm font-medium">
                    View All
                  </Text>
                </Pressable>
              </View>
              <View className="space-y-2">
                {analytics.recent.map((transaction) => (
                  <View
                    key={transaction.id}
                    className="flex-row items-center justify-between bg-gray-800/50 p-4 rounded-xl"
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                          transaction.direction === "income"
                            ? "bg-green-600/20"
                            : "bg-red-600/20"
                        }`}
                      >
                        <Ionicons
                          name={
                            transaction.direction === "income"
                              ? "arrow-down"
                              : "arrow-up"
                          }
                          size={20}
                          color={
                            transaction.direction === "income"
                              ? "#10B981"
                              : "#EF4444"
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-medium">
                          {transaction.description}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {formatDate(transaction.occurred_at)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className={`font-bold ${
                        transaction.direction === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.direction === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount_minor)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {analytics.recent.length === 0 && (
            <View className="px-6 py-12 items-center">
              <Ionicons name="receipt-outline" size={64} color="#6B7280" />
              <Text className="text-gray-400 text-lg font-medium mt-4">
                No transactions yet
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Start by adding your first transaction
              </Text>
            </View>
          )}
        </>
      ) : (
        <View className="px-6 py-12 items-center">
          <Ionicons name="analytics-outline" size={64} color="#6B7280" />
          <Text className="text-gray-400 text-lg font-medium mt-4">
            No data available
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-2">
            Add some transactions to see your financial overview
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
