const admin = require("firebase-admin");
const { logger } = require("firebase-functions");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

admin.initializeApp();

exports.sendTeamEntryNotification = onDocumentUpdated(
  {
    document: "teams/{teamId}/plans/shared-plan",
    region: "asia-northeast1"
  },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!after || !after.state) {
      return;
    }

    const beforeCount = countEntries(before?.state?.weeks, before?.state?.totalWeeks || 0);
    const afterCount = countEntries(after.state.weeks, after.state.totalWeeks || 0);
    if (afterCount <= beforeCount) {
      return;
    }

    const dedupeRef = admin.firestore().collection("notificationEvents").doc(event.id);
    const dedupeSnap = await dedupeRef.get();
    if (dedupeSnap.exists) {
      logger.info("Skip duplicate notification event", { eventId: event.id });
      return;
    }
    await dedupeRef.set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      teamId: event.params.teamId,
      actorUid: after.actorUid || "",
      actorEmail: after.actorEmail || ""
    });

    const teamId = event.params.teamId;
    const actorUid = after.actorUid || "";
    const actorEmail = after.actorEmail || "チームメンバー";

    const db = admin.firestore();
    const [teamSnap, membersSnap] = await Promise.all([
      db.collection("teams").doc(teamId).get(),
      db.collection("teams").doc(teamId).collection("members").get()
    ]);

    const teamName = teamSnap.exists ? teamSnap.data().name || teamId : teamId;
    const recipientUids = membersSnap.docs
      .map((doc) => doc.id)
      .filter((uid) => uid && uid !== actorUid);

    if (!recipientUids.length) {
      logger.info("No recipients for team notification", { teamId, actorUid });
      return;
    }

    const deviceSnapshots = await Promise.all(
      recipientUids.map((uid) => db.collection("users").doc(uid).collection("devices").get())
    );

    const deliveries = [];
    deviceSnapshots.forEach((snapshot, index) => {
      const uid = recipientUids[index];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.token || data.notificationsEnabled === false) {
          return;
        }
        deliveries.push({
          uid,
          token: data.token,
          ref: doc.ref
        });
      });
    });

    const uniqueDeliveries = Array.from(
      new Map(deliveries.map((item) => [item.token, item])).values()
    );

    if (!uniqueDeliveries.length) {
      logger.info("No device tokens found for team", { teamId });
      return;
    }

    const message = {
      notification: {
        title: teamName + " に新しい報告",
        body: actorEmail + " がトレーニングを報告しました。"
      },
      data: {
        kind: "team-entry",
        teamId,
        actorUid,
        actorEmail
      },
      tokens: uniqueDeliveries.map((item) => item.token)
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    const staleRefs = [];
    response.responses.forEach((result, index) => {
      if (result.success) {
        return;
      }
      const code = result.error?.code || "";
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
        staleRefs.push(uniqueDeliveries[index].ref);
      }
      logger.warn("Failed to send push notification", {
        code,
        message: result.error?.message,
        teamId
      });
    });

    if (staleRefs.length) {
      await Promise.all(staleRefs.map((ref) => ref.delete()));
    }
  }
);

function countEntries(weeks, totalWeeks) {
  if (!weeks || typeof weeks !== "object") {
    return 0;
  }
  let sum = 0;
  for (let index = 1; index <= totalWeeks; index += 1) {
    const week = weeks[index];
    if (week && Array.isArray(week.entries)) {
      sum += week.entries.length;
    }
  }
  return sum;
}
