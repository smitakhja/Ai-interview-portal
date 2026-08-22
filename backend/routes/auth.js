import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { auth as firebaseAuth } from "../firebaseAdmin.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  let { userId, email, name } = req.body;

  // 1. Verify Firebase Token if present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1];
    try {
      if (!firebaseAuth) throw new Error("Firebase Admin not configured");
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      
      // Securely override client-provided data with verified payload
      userId = decodedToken.uid;
      email = decodedToken.email || email;
      name = decodedToken.name || name;
    } catch (err) {
      console.error("Firebase token verification failed:", err);
      return res.status(401).json({ error: "Invalid or expired Firebase token" });
    }
  } else {
    console.warn(`⚠️ Unverified login attempt for userId: ${userId} (Demo Mode fallback)`);
  }

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    if (!supabase) throw new Error("Supabase not configured");

    // Check if user exists
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (existing) {
      return res.json({ success: true, message: "Login successful", user: existing });
    }

    // Create new user
    const user = {
      id: userId,
      email: email || userId,
      full_name: name || userId,
    };
    const { data, error } = await supabase.from("users").insert(user).select().single();
    if (error) throw error;

    res.json({ success: true, message: "Login successful", user: data });
  } catch (error) {
    console.error("Supabase Login Error:", error.message);
    res.json({ success: true, message: "Login successful (fallback)", userId });
  }
});

export default router;
