import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const busy = fetchStatus === "fetching";
  const needsCode = signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address") && signUp.missingFields.length === 0;

  async function createAccount() {
    const { error } = await signUp.password({ emailAddress, password });
    if (!error) await signUp.verifications.sendEmailCode();
  }
  async function verify() {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") await signUp.finalize({ navigate: () => router.replace("/register") });
  }

  return <View style={styles.page}><View style={styles.card}><Text style={styles.eyebrow}>MEDOFILE ACCOUNT</Text><Text style={styles.title}>{needsCode ? "Check your email" : "Create an account"}</Text><Text style={styles.copy}>{needsCode ? "Enter the verification code to secure your account." : "Save doctors and appointments while keeping browsing optional."}</Text>{needsCode ? <><TextInput style={styles.input} value={code} onChangeText={setCode} keyboardType="numeric" placeholder="Verification code" /><Text style={styles.error}>{errors.fields.code?.message || ""}</Text><Pressable disabled={busy || !code} onPress={verify} style={[styles.button, (busy || !code) && styles.disabled]}><Text style={styles.buttonText}>{busy ? "Verifying…" : "Verify account"}</Text></Pressable><Pressable onPress={() => signUp.verifications.sendEmailCode()}><Text style={styles.link}>Send a new code</Text></Pressable></> : <><TextInput style={styles.input} value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" /><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" /><Text style={styles.error}>{errors.fields.emailAddress?.message || errors.fields.password?.message || ""}</Text><Pressable disabled={busy || !emailAddress || !password} onPress={createAccount} style={[styles.button, (busy || !emailAddress || !password) && styles.disabled]}><Text style={styles.buttonText}>{busy ? "Creating…" : "Create account"}</Text></Pressable><Link href="/sign-in" style={styles.link}>Already have an account? Sign in</Link><View nativeID="clerk-captcha" /></>}</View></View>;
}
const styles = StyleSheet.create({ page:{flex:1,justifyContent:"center",padding:24,backgroundColor:"#edf5ff"},card:{backgroundColor:"#fff",borderRadius:24,padding:24,elevation:3},eyebrow:{fontSize:11,fontWeight:"700",letterSpacing:1.4,color:"#0a56b7"},title:{fontSize:28,fontWeight:"700",color:"#17324d",marginTop:8},copy:{fontSize:14,lineHeight:20,color:"#64748b",marginTop:8,marginBottom:20},input:{height:50,borderWidth:1,borderColor:"#d9e2ef",borderRadius:12,paddingHorizontal:14,marginTop:10,color:"#17324d",backgroundColor:"#f8fafc"},error:{minHeight:18,fontSize:12,color:"#dc2626",marginTop:8},button:{height:50,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"#0a56b7",marginTop:8},disabled:{opacity:.55},buttonText:{color:"#fff",fontWeight:"700"},link:{textAlign:"center",marginTop:18,color:"#0a56b7",fontWeight:"600"} });