// pushRegister.ts
import { supabase } from "../supabaseClient";
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from "./firebaseApp"; // initializeApp 한 곳

export async function registerPushToken() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("알림 권한 거부");
    return;
  }

  const messaging = getMessaging(firebaseApp);
  const vapidKey = "웹용 FCM VAPID 키"; // Firebase 콘솔에서 발급

  const fcmToken = await getToken(messaging, { vapidKey });
  if (!fcmToken) return;

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) return;

  const userId = userData.user.id;

  await supabase.from("notification_tokens").upsert(
    {
      user_id: userId,
      fcm_token: fcmToken,
    },
    { onConflict: "user_id,fcm_token" }
  );
}
