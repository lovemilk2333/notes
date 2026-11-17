---
title: 修复 "通讯录" (`com.google.android.contacts`) 在打开联系人详情页崩溃 (缺少 `READ_PHONE_STATE` 权限)
published: 2026-11-17
tags: [Android, Contacts]
category: app::android
---

系统: ColorOS 15 (Android)

## 问题
打开 "通讯录" (`com.google.android.contacts`) 任意联系人详情页应用崩溃, 日志

```log
AndroidRuntime: FATAL EXCEPTION: main
AndroidRuntime: Process: com.google.android.contacts, PID: 32523
AndroidRuntime: java.lang.SecurityException: Requires READ_PHONE_STATE permission.
AndroidRuntime: 	at android.os.Parcel.createExceptionOrNull(Parcel.java:3272)
AndroidRuntime: 	at android.os.Parcel.createException(Parcel.java:3256)
AndroidRuntime: 	at android.os.Parcel.readException(Parcel.java:3239)
AndroidRuntime: 	at android.os.Parcel.readException(Parcel.java:3181)
AndroidRuntime: 	at com.android.internal.telephony.ITelephony$Stub$Proxy.getSubIdForPhoneAccountHandle(ITelephony.java:12254)
AndroidRuntime: 	at android.telephony.TelephonyManager$1.recompute(TelephonyManager.java:497)
AndroidRuntime: 	at android.telephony.TelephonyManager$1.recompute(TelephonyManager.java:491)
AndroidRuntime: 	at android.app.PropertyInvalidatedCache.query(PropertyInvalidatedCache.java:999)
AndroidRuntime: 	at android.telephony.TelephonyManager.getSubscriptionId(TelephonyManager.java:13048)
AndroidRuntime: 	at android.telephony.TelephonyManager.createForPhoneAccountHandle(TelephonyManager.java:864)
AndroidRuntime: 	at fc$$ExternalSyntheticApiModelOutline0.m(D8$$SyntheticClass:35)
AndroidRuntime: 	at qpq.a(PG:9)
AndroidRuntime: 	at ndr.b(PG:45)
AndroidRuntime: 	at lwd.a(PG:65)
AndroidRuntime: 	at frj.is(PG:22)
AndroidRuntime: 	at fku.a(PG:28)
AndroidRuntime: 	at fku.d(PG:50)
AndroidRuntime: 	at fku.k(PG:15)
AndroidRuntime: 	at jwj.a(PG:17)
AndroidRuntime: 	at abnf.a(PG:15)
AndroidRuntime: 	at abon.jE(PG:161)
AndroidRuntime: 	at abom.b(PG:13)
AndroidRuntime: 	at abbh.w(PG:11)
AndroidRuntime: 	at abid.run(PG:112)
AndroidRuntime: 	at android.os.Handler.handleCallback(Handler.java:995)
AndroidRuntime: 	at android.os.Handler.dispatchMessage(Handler.java:105)
AndroidRuntime: 	at android.os.Looper.loopOnce(Looper.java:288)
AndroidRuntime: 	at android.os.Looper.loop(Looper.java:393)
AndroidRuntime: 	at android.app.ActivityThread.main(ActivityThread.java:9564)
AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
AndroidRuntime: 	at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:600)
AndroidRuntime: 	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:1010)
AndroidRuntime: 	Suppressed: abqp: [abkc{Cancelling}@50ec357, Dispatchers.Main]
```

## 解决
检查 HMA (或其他应用列表隐藏软件) 是否为 `com.android.incallui` 隐藏了 "通讯录" 软件, 并取消其隐藏

后结束 "通讯录" 进程并启动即可

> [!TIP]
> 如果您也安装了 "电话" (`com.google.android.dialer`), 请一并解除隐藏
