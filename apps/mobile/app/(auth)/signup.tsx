import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Invite code required', 'Please enter the code provided by your school.')
      return
    }
    setLoading(true)

    // Atomically claim the invite code. The RPC marks it as used in a single
    // UPDATE ... RETURNING so two concurrent signups cannot both succeed.
    const { data: claims, error: claimError } = await supabase
      .rpc('claim_invite_code', { p_code: inviteCode.trim().toUpperCase() })

    const invite = claims?.[0]

    if (claimError || !invite) {
      setLoading(false)
      Alert.alert('Invalid code', 'This invite code is not valid, has already been used, or has expired.')
      return
    }

    const { data: authData, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError || !authData.user) {
      // Release the code back — signup failed after claiming
      await supabase.from('invite_codes').update({ used: false }).eq('id', invite.id)
      setLoading(false)
      Alert.alert('Signup failed', signupError?.message ?? 'Unknown error')
      return
    }

    await supabase.from('users').insert({
      id: authData.user.id,
      email,
      role: 'parent',
      school_id: invite.school_id,
    })

    for (const studentId of invite.student_ids as string[]) {
      await supabase.from('parent_student').insert({
        parent_id: authData.user.id,
        student_id: studentId,
      })
    }

    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Enter your school invite code to get started</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Invite code" autoCapitalize="characters" value={inviteCode} onChangeText={setInviteCode} />
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create account'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#003087', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#fff', marginBottom: 40, opacity: 0.8, textAlign: 'center' },
  form: { width: '100%', gap: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  button: { backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#003087', fontWeight: 'bold', fontSize: 16 },
})
