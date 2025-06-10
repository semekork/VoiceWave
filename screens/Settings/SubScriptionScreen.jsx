import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SubscriptionScreen = ({ navigation }) => {
  const [currentPlan, setCurrentPlan] = useState('premium'); // free, premium, pro
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, yearly

  const plans = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'Forever',
      features: [
        'Access to basic podcasts',
        'Limited downloads (5 per month)',
        'Standard audio quality',
        'Ads included',
      ],
      color: '#8E8E93',
    },
    premium: {
      name: 'Premium',
      monthlyPrice: '$9.99',
      yearlyPrice: '$99.99',
      features: [
        'Ad-free listening',
        'Unlimited downloads',
        'High-quality audio',
        'Offline listening',
        'Skip episodes',
        'Priority customer support',
      ],
      color: '#9C3141',
      popular: true,
    },
    pro: {
      name: 'Pro',
      monthlyPrice: '$19.99',
      yearlyPrice: '$199.99',
      features: [
        'Everything in Premium',
        'Exclusive premium content',
        'Early access to new episodes',
        'Custom playlist creation',
        'Advanced analytics',
        'Multi-device sync',
        'Family sharing (up to 6 members)',
      ],
      color: '#007AFF',
    },
  };

  const handlePlanSelect = (planKey) => {
    if (planKey === currentPlan) return;

    if (planKey === 'free') {
      Alert.alert(
        'Downgrade Plan',
        'Are you sure you want to downgrade to the free plan? You\'ll lose access to premium features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Downgrade', 
            style: 'destructive',
            onPress: () => setCurrentPlan(planKey)
          },
        ]
      );
    } else {
      Alert.alert(
        'Upgrade Plan',
        `You're about to upgrade to ${plans[planKey].name}. This will be charged to your account.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Upgrade', 
            onPress: () => setCurrentPlan(planKey)
          },
        ]
      );
    }
  };

  const handleManageBilling = () => {
    Alert.alert(
      'Manage Billing',
      'You will be redirected to manage your billing information.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Navigate to billing') },
      ]
    );
  };

  const PlanCard = ({ planKey, plan }) => {
    const isCurrentPlan = currentPlan === planKey;
    const price = planKey === 'free' ? plan.price : 
                  billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const period = planKey === 'free' ? plan.period :
                   billingCycle === 'monthly' ? '/month' : '/year';

    return (
      <TouchableOpacity
        style={[
          styles.planCard,
          isCurrentPlan && styles.currentPlanCard,
          { borderColor: plan.color }
        ]}
        onPress={() => handlePlanSelect(planKey)}
      >
        {plan.popular && (
          <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
          {isCurrentPlan && (
            <View style={[styles.currentBadge, { backgroundColor: plan.color }]}>
              <Text style={styles.currentText}>Current</Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.period}>{period}</Text>
        </View>

        {planKey !== 'free' && billingCycle === 'yearly' && (
          <Text style={styles.savings}>Save 16% annually</Text>
        )}

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={plan.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {!isCurrentPlan && (
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: plan.color }]}
            onPress={() => handlePlanSelect(planKey)}
          >
            <Text style={styles.selectButtonText}>
              {currentPlan === 'free' ? 'Upgrade' : 'Switch Plan'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#9C3141" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Subscription</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleManageBilling}
        >
          <Ionicons name="card-outline" size={24} color="#9C3141" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Plan Status */}
        <LinearGradient
          colors={['#9C3141', '#B91435']}
          style={styles.statusCard}
        >
          <View style={styles.statusHeader}>
            <Ionicons name="star" size={24} color="#FFFFFF" />
            <Text style={styles.statusTitle}>Current Plan</Text>
          </View>
          <Text style={styles.currentPlanName}>{plans[currentPlan].name}</Text>
          {currentPlan !== 'free' && (
            <>
              <Text style={styles.nextBilling}>
                Next billing: January 15, 2025
              </Text>
              <Text style={styles.autoRenew}>
                Auto-renewal enabled
              </Text>
            </>
          )}
        </LinearGradient>

        {/* Billing Cycle Toggle */}
        {currentPlan !== 'free' && (
          <View style={styles.billingToggle}>
            <Text style={styles.billingLabel}>Billing Cycle</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  billingCycle === 'monthly' && styles.activeToggle
                ]}
                onPress={() => setBillingCycle('monthly')}
              >
                <Text style={[
                  styles.toggleText,
                  billingCycle === 'monthly' && styles.activeToggleText
                ]}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  billingCycle === 'yearly' && styles.activeToggle
                ]}
                onPress={() => setBillingCycle('yearly')}
              >
                <Text style={[
                  styles.toggleText,
                  billingCycle === 'yearly' && styles.activeToggleText
                ]}>Yearly</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Plan Cards */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>
          
          <PlanCard planKey="free" plan={plans.free} />
          <PlanCard planKey="premium" plan={plans.premium} />
          <PlanCard planKey="pro" plan={plans.pro} />
        </View>

        {/* Billing Management */}
        {currentPlan !== 'free' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing & Payment</Text>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={handleManageBilling}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name="card-outline" size={22} color="#9C3141" />
                  </View>
                  <View>
                    <Text style={styles.menuTitle}>Payment Method</Text>
                    <Text style={styles.menuSubtitle}>•••• •••• •••• 1234</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name="receipt-outline" size={22} color="#9C3141" />
                  </View>
                  <View>
                    <Text style={styles.menuTitle}>Billing History</Text>
                    <Text style={styles.menuSubtitle}>View past invoices</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  Alert.alert(
                    'Cancel Subscription',
                    'Your subscription will remain active until the end of your current billing period.',
                    [
                      { text: 'Keep Subscription', style: 'cancel' },
                      { text: 'Cancel', style: 'destructive' },
                    ]
                  );
                }}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name="close-circle-outline" size={22} color="#D70015" />
                  </View>
                  <View>
                    <Text style={[styles.menuTitle, styles.dangerousText]}>Cancel Subscription</Text>
                    <Text style={styles.menuSubtitle}>End your current plan</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            Subscriptions automatically renew unless canceled.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  currentPlanName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  nextBilling: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  autoRenew: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  billingToggle: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  billingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeToggleText: {
    color: '#000000',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentPlanCard: {
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  period: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 4,
  },
  savings: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  selectButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  dangerousText: {
    color: '#D70015',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;