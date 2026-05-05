import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const MOCK_CERTS = [
    { id: 1, course: 'UI/UX Design Masterclass', issueDate: 'April 12, 2025', instructor: 'Sara Johnson', credentialId: 'LRN-2025-UX-4821', color: ['#6366f1', '#8b5cf6'] as [string, string] },
    { id: 2, course: 'Python for Data Science', issueDate: 'February 3, 2025', instructor: 'Jose Portilla', credentialId: 'LRN-2025-PY-3317', color: ['#0ea5e9', '#06b6d4'] as [string, string] },
];

export default function CertificatesScreen() {
    const c = useThemeColors();
    const handleShare = async (cert: (typeof MOCK_CERTS)[0]) => {
        await Share.share({ message: `I just earned a certificate in "${cert.course}" on Learnify! 🎓\nCredential ID: ${cert.credentialId}` });
    };

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="Certificates" subtitle={`${MOCK_CERTS.length} earned`} />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {MOCK_CERTS.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 96 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="ribbon-outline" size={36} color="#6366f1" />
                        </View>
                        <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 18 }}>No certificates yet</Text>
                        <Text style={{ color: c.textMuted, fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }}>Complete a course to earn your first certificate</Text>
                    </View>
                ) : MOCK_CERTS.map(cert => (
                    <View key={cert.id} style={{ marginBottom: 20, borderRadius: 24, overflow: 'hidden', shadowColor: cert.color[0], shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }}>
                        <LinearGradient colors={cert.color} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <View style={{ padding: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="school" size={20} color="rgba(255,255,255,0.9)" />
                                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 15 }}>Learnify</Text>
                                    </View>
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Certificate</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="ribbon" size={34} color="#fff" />
                                    </View>
                                </View>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>Certificate of Completion</Text>
                                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 4 }} numberOfLines={2}>{cert.course}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginTop: 4 }}>Instructed by {cert.instructor}</Text>
                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Issue Date</Text>
                                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{cert.issueDate}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Credential ID</Text>
                                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{cert.credentialId}</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                        <View style={{ backgroundColor: c.bgCard, flexDirection: 'row', borderTopWidth: 1, borderTopColor: c.borderLight }}>
                            <TouchableOpacity onPress={() => handleShare(cert)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8, borderRightWidth: 1, borderRightColor: c.borderLight }}>
                                <Ionicons name="share-outline" size={18} color="#6366f1" />
                                <Text style={{ color: '#6366f1', fontWeight: '600', fontSize: 14 }}>Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 }}>
                                <Ionicons name="download-outline" size={18} color="#6366f1" />
                                <Text style={{ color: '#6366f1', fontWeight: '600', fontSize: 14 }}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
