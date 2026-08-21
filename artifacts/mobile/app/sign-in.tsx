import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const busy = fetchStatus === "fetching";

  async function continueSignIn() {
    const { error } = await signIn.password({ emailAddress, password });
    if (!error && signIn.status === "complete") {
      await signIn.finalize({ navigate: () => router.replace("/") });
    }
  }

  return <View style={styles.page}><View style={styles.card}><Text style={styles.eyebrow}>MEDOFILE ACCOUNT</Text><Text style={styles.title}>Welcome back</Text><Text style={styles.copy}>Sign in to keep your doctors and care activity in sync.</Text><TextInput style={styles.input} value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" /><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" /><Text style={styles.error}>{errors.fields.identifier?.message || errors.fields.password?.message || ""}</Text><Pressable disabled={busy || !emailAddress || !password} onPress={continueSignIn} style={[styles.button, (busy || !emailAddress || !password) && styles.disabled]}><Text style={styles.buttonText}>{busy ? "Signing in…" : "Sign in"}</Text></Pressable><Link href="/sign-up" style={styles.link}>New to Medofile? Create an account</Link></View></View>;
}
const styles = StyleSheet.create({ page:{flex:1,justifyContent:"center",padding:24,backgroundColor:"#edf5ff"},card:{backgroundColor:"#fff",borderRadius:24,padding:24,elevation:3},eyebrow:{fontSize:11,fontWeight:"700",letterSpacing:1.4,color:"#0a56b7"},title:{fontSize:28,fontWeight:"700",color:"#17324d",marginTop:8},copy:{fontSize:14,lineHeight:20,color:"#64748b",marginTop:8,marginBottom:20},input:{height:50,borderWidth:1,borderColor:"#d9e2ef",borderRadius:12,paddingHorizontal:14,marginTop:10,color:"#17324d",backgroundColor:"#f8fafc"},error:{minHeight:18,fontSize:12,color:"#dc2626",marginTop:8},button:{height:50,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"#0a56b7",marginTop:8},disabled:{opacity:.55},buttonText:{color:"#fff",fontWeight:"700"},link:{textAlign:"center",marginTop:18,color:"#0a56b7",fontWeight:"600"} });