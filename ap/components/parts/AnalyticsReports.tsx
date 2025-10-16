import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { getApiUrl } from "config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  recent: Array<{
    id: number;
    amount_minor: number;
    direction: "income" | "expense";
    description: string;
    occurred_at: string;
  }>;
}

const { width } = Dimensions.get("window");

export const AnalyticsReports = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");
  const [selectedView, setSelectedView] = useState<
    "overview" | "categories" | "trends"
  >("overview");
  const [showMenu, setShowMenu] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
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
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id, token, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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

  const getSavingsRate = () => {
    if (!analytics || analytics.totals.income === 0) return 0;
    return (analytics.totals.net / analytics.totals.income) * 100;
  };

  const getAverageTransaction = () => {
    if (!analytics) return 0;
    const totalTransactions =
      analytics.totals.income + analytics.totals.expense;
    return totalTransactions > 0 ? totalTransactions / 2 : 0;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900">
        {/* Burger Menu */}
        {isAtTop && !showMenu && (
          <View
            className="absolute left-5 z-50"
            style={{ top: insets.top + 10 }}
          >
            <Pressable
              onPress={() => setShowMenu(true)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
            >
              <Ionicons name="menu-outline" size={40} color="#fff" />
            </Pressable>
          </View>
        )}

        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading analytics...</Text>
        </View>
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
            Analytics & Reports
          </Text>
          <Text className="text-white font-inter-bold text-4xl mt-2">
            Financial Insights
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

        {/* View Selector */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-gray-800 p-1 rounded-xl">
            {[
              { key: "overview", label: "Overview", icon: "analytics-outline" },
              {
                key: "categories",
                label: "Categories",
                icon: "pie-chart-outline",
              },
              { key: "trends", label: "Trends", icon: "trending-up-outline" },
            ].map((view) => (
              <Pressable
                key={view.key}
                onPress={() => setSelectedView(view.key as any)}
                className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                  selectedView === view.key ? "bg-violet-600" : "bg-transparent"
                }`}
              >
                <Ionicons
                  name={view.icon as any}
                  size={16}
                  color={selectedView === view.key ? "white" : "#9CA3AF"}
                />
                <Text
                  className={`ml-2 text-sm font-medium ${
                    selectedView === view.key ? "text-white" : "text-gray-300"
                  }`}
                >
                  {view.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {analytics ? (
          <>
            {/* Overview Tab */}
            {selectedView === "overview" && (
              <View className="px-6 space-y-6">
                {/* Key Metrics */}
                <View className="space-y-4">
                  <Text className="text-white text-xl font-bold">
                    Key Metrics
                  </Text>

                  <View className="flex-row gap-4">
                    <View className="flex-1 bg-green-600/20 p-4 rounded-2xl border border-green-600/30">
                      <View className="flex-row items-center justify-between mb-2">
                        <Ionicons
                          name="trending-up"
                          size={20}
                          color="#10B981"
                        />
                        <Text className="text-green-400 text-xs font-medium">
                          INCOME
                        </Text>
                      </View>
                      <Text className="text-white text-2xl font-bold">
                        {formatCurrency(analytics.totals.income)}
                      </Text>
                    </View>

                    <View className="flex-1 bg-red-600/20 p-4 rounded-2xl border border-red-600/30">
                      <View className="flex-row items-center justify-between mb-2">
                        <Ionicons
                          name="trending-down"
                          size={20}
                          color="#EF4444"
                        />
                        <Text className="text-red-400 text-xs font-medium">
                          EXPENSES
                        </Text>
                      </View>
                      <Text className="text-white text-2xl font-bold">
                        {formatCurrency(analytics.totals.expense)}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <View className="flex-row items-center justify-between mb-2">
                      <Ionicons
                        name={
                          analytics.totals.net >= 0 ? "wallet" : "alert-circle"
                        }
                        size={20}
                        color={
                          analytics.totals.net >= 0 ? "#10B981" : "#EF4444"
                        }
                      />
                      <Text className="text-gray-400 text-xs font-medium">
                        NET WORTH
                      </Text>
                    </View>
                    <Text
                      className={`text-3xl font-bold ${
                        analytics.totals.net >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatCurrency(analytics.totals.net)}
                    </Text>
                  </View>
                </View>

                {/* Financial Health */}
                <View className="space-y-4">
                  <Text className="text-white text-xl font-bold">
                    Financial Health
                  </Text>

                  <View className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <Text className="text-gray-400 text-sm mb-2">
                      Savings Rate
                    </Text>
                    <Text className="text-2xl font-bold text-white">
                      {getSavingsRate().toFixed(1)}%
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      {getSavingsRate() > 20
                        ? "Excellent!"
                        : getSavingsRate() > 10
                          ? "Good"
                          : "Needs improvement"}
                    </Text>
                  </View>

                  <View className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <Text className="text-gray-400 text-sm mb-2">
                      Average Transaction
                    </Text>
                    <Text className="text-2xl font-bold text-white">
                      {formatCurrency(getAverageTransaction())}
                    </Text>
                  </View>
                </View>

                {/* Recent Activity */}
                {analytics.recent.length > 0 && (
                  <View className="space-y-4">
                    <Text className="text-white text-xl font-bold">
                      Recent Activity
                    </Text>
                    <View className="space-y-2">
                      {analytics.recent.slice(0, 3).map((transaction) => (
                        <View
                          key={transaction.id}
                          className="flex-row items-center justify-between bg-gray-800/50 p-3 rounded-xl"
                        >
                          <View className="flex-row items-center flex-1">
                            <View
                              className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
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
                                size={16}
                                color={
                                  transaction.direction === "income"
                                    ? "#10B981"
                                    : "#EF4444"
                                }
                              />
                            </View>
                            <Text className="text-white font-medium flex-1">
                              {transaction.description}
                            </Text>
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
              </View>
            )}

            {/* Categories Tab */}
            {selectedView === "categories" && (
              <View className="px-6 space-y-6">
                <Text className="text-white text-xl font-bold">
                  Spending by Category
                </Text>

                {analytics.categories.length > 0 ? (
                  <View className="space-y-3">
                    {analytics.categories.map((category, index) => {
                      const percentage =
                        analytics.totals.expense > 0
                          ? (category.total / analytics.totals.expense) * 100
                          : 0;

                      return (
                        <View
                          key={index}
                          className="bg-gray-800/50 p-4 rounded-xl border border-gray-700"
                        >
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center flex-1">
                              <Text className="text-2xl mr-3">
                                {category.category_icon}
                              </Text>
                              <View className="flex-1">
                                <Text className="text-white font-semibold text-lg">
                                  {category.category_name}
                                </Text>
                                <Text className="text-gray-400 text-sm">
                                  {category.count} transactions
                                </Text>
                              </View>
                            </View>
                            <View className="items-end">
                              <Text className="text-white font-bold text-lg">
                                {formatCurrency(category.total)}
                              </Text>
                              <Text className="text-gray-400 text-sm">
                                {percentage.toFixed(1)}%
                              </Text>
                            </View>
                          </View>

                          {/* Progress Bar */}
                          <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <View
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: category.category_color,
                              }}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View className="py-12 items-center">
                    <Ionicons
                      name="pie-chart-outline"
                      size={64}
                      color="#6B7280"
                    />
                    <Text className="text-gray-400 text-lg font-medium mt-4">
                      No category data
                    </Text>
                    <Text className="text-gray-500 text-sm text-center mt-2">
                      Add some transactions with categories to see spending
                      breakdown
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Trends Tab */}
            {selectedView === "trends" && (
              <View className="px-6 space-y-6">
                <Text className="text-white text-xl font-bold">
                  Spending Trends
                </Text>

                <View className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                  <View className="items-center">
                    <Ionicons
                      name="trending-up-outline"
                      size={48}
                      color="#8B5CF6"
                    />
                    <Text className="text-white text-lg font-semibold mt-4">
                      Trends Coming Soon
                    </Text>
                    <Text className="text-gray-400 text-sm text-center mt-2">
                      Advanced trend analysis and charts will be available in a
                      future update
                    </Text>
                  </View>
                </View>

                {/* Quick Insights */}
                <View className="space-y-4">
                  <Text className="text-white text-lg font-bold">
                    Quick Insights
                  </Text>

                  <View className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <Text className="text-gray-400 text-sm mb-2">
                      Top Spending Category
                    </Text>
                    <Text className="text-white text-lg font-semibold">
                      {analytics.categories[0]?.category_name || "No data"}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {analytics.categories[0]
                        ? formatCurrency(analytics.categories[0].total)
                        : "Add transactions to see insights"}
                    </Text>
                  </View>

                  <View className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <Text className="text-gray-400 text-sm mb-2">
                      Total Transactions
                    </Text>
                    <Text className="text-white text-lg font-semibold">
                      {analytics.recent.length} this period
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          <View className="px-6 py-12 items-center">
            <Ionicons name="analytics-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-lg font-medium mt-4">
              No analytics data yet
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              Add some transactions to see your financial insights
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
