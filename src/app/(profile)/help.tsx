import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const FAQS = [
    { q: 'How do I enroll in a course?', a: 'Browse the home screen, tap on any course card, and press "Enroll Now". Free courses are instantly accessible.' },
    { q: 'Can I download courses for offline viewing?', a: 'Yes! On any course page, tap the download icon next to a lesson. Downloaded content is available in My Courses.' },
    { q: 'How do I get a certificate?', a: 'Complete all lessons and pass the final quiz with a score of 70% or higher. Your certificate will appear in the Certificates section.' },
    { q: 'Can I get a refund?', a: 'We offer a 30-day money-back guarantee on all paid courses. Contact support with your order details.' },
    { q: 'How do I reset my password?', a: "On the login screen, tap \"Forgot password?\" and enter your email. You'll receive a reset link within a few minutes." },
    { q: 'Is my progress saved across devices?', a: "Yes, your progress syncs automatically across all devices when you're signed in to your account." },
];

const SUPPORT = [
    { icon: 'mail-outline', label: 'Email Support', sub: 'support@learnify.app', color: '#6366f1', onPress: () => Linking.openURL('mailto:support@learnify.app') },
    { icon: 'chatbubble-outline', label: 'Live Chat', sub: 'Available 9am – 6pm IST', color: '#10b981', onPress: () => { } },
    { icon: 'logo-twitter', label: 'Twitter / X', sub: '@learnifyapp', color: '#0ea5e9', onPress: () => Linking.openURL('https://twitter.com') },
];

export default function HelpScreen() {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const c = useThemeColors();
    const filtered = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="Help & FAQ" subtitle="Find answers quickly" />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
                    <Ionicons name="search-outline" size={18} color={c.textMuted} />
                    <TextInput style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: c.textPrimary, fontSize: 14 }} placeholder="Search FAQs..." placeholderTextColor={c.textMuted} value={search} onChangeText={setSearch} />
                </View>

                <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>Frequently Asked Questions</Text>
                <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight, marginBottom: 20 }}>
                    {filtered.map((faq, index) => (
                        <View key={index} style={{ borderBottomWidth: index < filtered.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}>
                            <TouchableOpacity onPress={() => setExpanded(expanded === index ? null : index)} activeOpacity={0.7}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}
                            >
                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '700' }}>Q</Text>
                                </View>
                                <Text style={{ flex: 1, color: c.textPrimary, fontWeight: '600', fontSize: 14 }}>{faq.q}</Text>
                                <Ionicons name={expanded === index ? 'chevron-up' : 'chevron-down'} size={16} color={c.textMuted} />
                            </TouchableOpacity>
                            {expanded === index && (
                                <View style={{ paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', gap: 12 }}>
                                    <View style={{ width: 28, alignItems: 'center' }}>
                                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '700' }}>A</Text>
                                        </View>
                                    </View>
                                    <Text style={{ flex: 1, color: c.textSecondary, fontSize: 13, lineHeight: 20 }}>{faq.a}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                    {filtered.length === 0 && <View style={{ paddingVertical: 40, alignItems: 'center' }}><Text style={{ color: c.textMuted, fontSize: 14 }}>No results for "{search}"</Text></View>}
                </View>

                <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>Still need help?</Text>
                <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight }}>
                    {SUPPORT.map((item, index) => (
                        <TouchableOpacity key={item.label} onPress={item.onPress} activeOpacity={0.7}
                            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: index < SUPPORT.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}
                        >
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <Ionicons name={item.icon as any} size={18} color={item.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: c.textPrimary, fontWeight: '600', fontSize: 14 }}>{item.label}</Text>
                                <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>{item.sub}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
