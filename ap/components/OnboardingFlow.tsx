import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface OnboardingFlowProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to PocketLedger",
    subtitle: "Your personal finance companion",
    description:
      "Track your expenses, manage budgets, and gain insights into your spending habits with our beautiful, intuitive app.",
    icon: "wallet-outline",
    color: "#8B5CF6",
  },
  {
    id: 2,
    title: "Track Every Transaction",
    subtitle: "Never lose track of your money",
    description:
      "Easily add income and expenses with custom categories, quick amount buttons, and smart categorization.",
    icon: "receipt-outline",
    color: "#10B981",
  },
  {
    id: 3,
    title: "Smart Analytics",
    subtitle: "Understand your spending patterns",
    description:
      "Get detailed insights into your spending habits with beautiful charts and personalized recommendations.",
    icon: "analytics-outline",
    color: "#F59E0B",
  },
  {
    id: 4,
    title: "Budget Management",
    subtitle: "Stay on top of your finances",
    description:
      "Create and manage budgets, set spending limits, and get alerts when you're approaching your limits.",
    icon: "pie-chart-outline",
    color: "#EF4444",
  },
  {
    id: 5,
    title: "Secure & Private",
    subtitle: "Your data is always safe",
    description:
      "All your financial data is encrypted and stored securely. Your privacy is our top priority.",
    icon: "shield-checkmark-outline",
    color: "#3B82F6",
  },
];

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      scrollViewRef.current?.scrollTo({
        x: nextStepIndex * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      scrollViewRef.current?.scrollTo({
        x: prevStepIndex * width,
        animated: true,
      });
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Skip Button */}
      <View
        className="absolute top-0 right-0 z-10"
        style={{ top: insets.top + 10, right: 20 }}
      >
        <Pressable
          onPress={skipOnboarding}
          className="bg-gray-800/50 px-4 py-2 rounded-full"
        >
          <Text className="text-gray-300 text-sm font-medium">Skip</Text>
        </Pressable>
      </View>

      {/* Onboarding Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        className="flex-1"
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / width,
          );
          if (newIndex !== currentStep) {
            setCurrentStep(newIndex);
          }
        }}
      >
        {onboardingSteps.map((step, index) => (
          <View
            key={step.id}
            className="flex-1 items-center justify-center px-8"
            style={{ width }}
          >
            {/* Icon */}
            <View
              className="w-32 h-32 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: `${step.color}20` }}
            >
              <Ionicons name={step.icon as any} size={64} color={step.color} />
            </View>

            {/* Content */}
            <View className="items-center">
              <Text className="text-white text-3xl font-bold text-center mb-4">
                {step.title}
              </Text>
              <Text className="text-violet-400 text-xl font-semibold text-center mb-6">
                {step.subtitle}
              </Text>
              <Text className="text-gray-300 text-lg text-center leading-7">
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View className="px-8 pb-8" style={{ paddingBottom: insets.bottom + 32 }}>
        {/* Progress Dots */}
        <View className="flex-row justify-center items-center mb-8">
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentStep ? "bg-violet-600" : "bg-gray-600"
              }`}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={prevStep}
            className={`py-3 px-6 rounded-xl ${
              currentStep === 0 ? "opacity-0" : "bg-gray-800"
            }`}
            disabled={currentStep === 0}
          >
            <Text className="text-gray-300 font-semibold">Previous</Text>
          </Pressable>

          <Pressable
            onPress={nextStep}
            className="bg-violet-600 py-4 px-8 rounded-xl flex-row items-center"
          >
            <Text className="text-white font-bold text-lg mr-2">
              {currentStep === onboardingSteps.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
            <Ionicons
              name={
                currentStep === onboardingSteps.length - 1
                  ? "checkmark"
                  : "arrow-forward"
              }
              size={20}
              color="white"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
