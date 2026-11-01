import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configure Email Transporter (uses environment variables or test credentials)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

interface ApplicationDoc {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedDate?: string;
  followUpDate?: string;
  interviewDate?: string;
  outreachDraft?: {
    subject?: string;
    body?: string;
  };
}

interface UserReminderSettings {
  recipientEmail?: string;
  dailySummaryEnabled?: boolean;
  weeklySummaryEnabled?: boolean;
  frequency?: 'daily' | 'weekly' | 'both' | 'off';
  preferredTime?: string;
  leadDaysBeforeFollowUp?: number;
}

/**
 * Daily Cloud Function triggered by Cloud Scheduler at 9:00 AM (Asia/Kolkata)
 * Scans active applications and sends targeted follow-up reminders.
 */
export const dailyFollowUpCron = onSchedule(
  {
    schedule: '0 9 * * *',
    timeZone: 'Asia/Kolkata',
    memory: '256MiB'
  },
  async (event) => {
    console.log('[Cloud Function] Running Daily Follow-Up Scheduler at:', new Date().toISOString());
    await processFollowUpRemindersForFrequency('daily');
  }
);

/**
 * Weekly Pipeline Digest Cloud Function running every Monday at 9:00 AM (Asia/Kolkata)
 */
export const weeklyPipelineDigestCron = onSchedule(
  {
    schedule: '0 9 * * 1',
    timeZone: 'Asia/Kolkata',
    memory: '256MiB'
  },
  async (event) => {
    console.log('[Cloud Function] Running Weekly Pipeline Digest Scheduler at:', new Date().toISOString());
    await processFollowUpRemindersForFrequency('weekly');
  }
);

/**
 * On-demand HTTP Endpoint for testing or manual reminder dispatches
 */
export const triggerFollowUpRemindersHttp = onRequest(
  { cors: true },
  async (req, res) => {
    try {
      const userId = req.body?.userId || req.query?.userId;
      const targetEmail = req.body?.targetEmail || req.query?.targetEmail;

      if (!userId && !targetEmail) {
        res.status(400).json({ error: 'userId or targetEmail is required' });
        return;
      }

      const summary = await processFollowUpForSpecificUser(userId as string, targetEmail as string);
      res.status(200).json({
        success: true,
        message: 'Follow-up check completed',
        data: summary
      });
    } catch (error: any) {
      console.error('[Cloud Function] Error in triggerFollowUpRemindersHttp:', error);
      res.status(500).json({ error: error.message || 'Internal error' });
    }
  }
);

/**
 * Core processor for users opt-in to daily or weekly reminders
 */
async function processFollowUpRemindersForFrequency(frequencyType: 'daily' | 'weekly') {
  const usersSnapshot = await db.collection('users').get();
  const todayStr = new Date().toISOString().split('T')[0];

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    try {
      // Check reminder settings
      const settingsSnap = await db.doc(`users/${userId}/settings/reminders`).get();
      const settings: UserReminderSettings = settingsSnap.exists
        ? (settingsSnap.data() as UserReminderSettings)
        : {};

      const isOptedIn =
        frequencyType === 'daily'
          ? settings.dailySummaryEnabled || settings.frequency === 'daily' || settings.frequency === 'both'
          : settings.weeklySummaryEnabled || settings.frequency === 'weekly' || settings.frequency === 'both';

      if (!isOptedIn) {
        continue;
      }

      const recipientEmail = settings.recipientEmail || userDoc.data().email;
      if (!recipientEmail) {
        continue;
      }

      await sendUserFollowUpDigest(userId, recipientEmail, todayStr, frequencyType);
    } catch (err) {
      console.error(`[Cloud Function] Error processing reminders for user ${userId}:`, err);
    }
  }
}

async function processFollowUpForSpecificUser(userId: string, targetEmail?: string) {
  const todayStr = new Date().toISOString().split('T')[0];
  const email = targetEmail || 'kkbhoi09@gmail.com';
  return await sendUserFollowUpDigest(userId || 'default', email, todayStr, 'on_demand');
}

async function sendUserFollowUpDigest(
  userId: string,
  recipientEmail: string,
  todayStr: string,
  type: 'daily' | 'weekly' | 'on_demand'
) {
  // Query applications
  const appsSnapshot = await db.collection(`users/${userId}/applications`).get();
  const allApps: ApplicationDoc[] = appsSnapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any)
  }));

  // Find items requiring follow-up (followUpDate is today or overdue)
  const dueItems = allApps.filter((a) => {
    if (!a.followUpDate) return false;
    return a.followUpDate <= todayStr && (a.status === 'applied' || a.status === 'interviewing');
  });

  const upcomingInterviews = allApps.filter((a) => {
    if (!a.interviewDate) return false;
    return a.interviewDate.split('T')[0] >= todayStr && a.status === 'interviewing';
  });

  const subject =
    dueItems.length > 0
      ? `⏰ ApplyFlow Alert: ${dueItems.length} Follow-Up Task${dueItems.length > 1 ? 's' : ''} Due Today`
      : `📋 ApplyFlow ${type === 'weekly' ? 'Weekly Pipeline Digest' : 'Daily Status'}: All Caught Up`;

  const htmlContent = generateDigestHtmlEmail({
    recipientEmail,
    dueItems,
    upcomingInterviews,
    totalTracked: allApps.length,
    type,
    todayStr
  });

  let deliveryStatus = 'logged';
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await transporter.sendMail({
        from: `"ApplyFlow Follow-Up Assistant" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject,
        html: htmlContent
      });
      deliveryStatus = 'sent';
    } catch (sendErr) {
      console.warn('[Cloud Function] SMTP send failed, falling back to database log:', sendErr);
      deliveryStatus = 'simulated';
    }
  } else {
    deliveryStatus = 'simulated_no_smtp';
  }

  // Record delivery in Firestore
  const logId = `remind-${Date.now()}`;
  await db.doc(`users/${userId}/reminderLogs/${logId}`).set({
    id: logId,
    type,
    recipientEmail,
    subject,
    summary: `${dueItems.length} overdue/due follow-ups, ${upcomingInterviews.length} upcoming interviews.`,
    followUpItemsCount: dueItems.length,
    status: deliveryStatus,
    timestamp: new Date().toISOString()
  });

  return {
    logId,
    recipientEmail,
    subject,
    dueItemsCount: dueItems.length,
    upcomingInterviewsCount: upcomingInterviews.length,
    status: deliveryStatus
  };
}

function generateDigestHtmlEmail(data: {
  recipientEmail: string;
  dueItems: ApplicationDoc[];
  upcomingInterviews: ApplicationDoc[];
  totalTracked: number;
  type: string;
  todayStr: string;
}): string {
  const dueRows = data.dueItems.map(
    (item) => `
    <tr style="border-bottom: 1px solid #EBE8E3;">
      <td style="padding: 12px 8px; font-weight: bold; color: #1c1917;">${item.company}</td>
      <td style="padding: 12px 8px; color: #44403c;">${item.role}</td>
      <td style="padding: 12px 8px; color: #dc2626; font-family: monospace; font-size: 12px;">Due: ${item.followUpDate || data.todayStr}</td>
      <td style="padding: 12px 8px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; background-color: #EFF6FF; color: #1D4ED8;">
          ${item.status}
        </span>
      </td>
    </tr>
  `
  ).join('');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBFBFA; color: #1C1917; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #EBE8E3; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0F4A3E; padding-bottom: 16px; margin-bottom: 24px; }
        .badge { background: #DDF3EA; color: #0F4A3E; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; font-family: monospace; }
        .btn { display: inline-block; background-color: #0F4A3E; color: #ffffff !important; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 style="margin: 0; font-family: serif; color: #1C1917;">ApplyFlow Follow-Up Digest</h2>
          <span class="badge">${data.type.toUpperCase()}</span>
        </div>
        <p style="font-size: 14px; color: #57534E; line-height: 1.5;">
          Hello Ketan, here is your automated pipeline status report.
        </p>

        ${
          data.dueItems.length > 0
            ? `
          <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <h4 style="margin: 0 0 8px 0; color: #991B1B;">⚠️ ${data.dueItems.length} Action Items Require Follow-Up</h4>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 1px solid #FCA5A5; color: #7F1D1D;">
                  <th style="padding: 6px 8px;">Company</th>
                  <th style="padding: 6px 8px;">Role</th>
                  <th style="padding: 6px 8px;">Follow-Up Due</th>
                  <th style="padding: 6px 8px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${dueRows}
              </tbody>
            </table>
          </div>
        `
            : `
          <div style="background-color: #F0FDF4; border: 1px solid #86EFAC; border-radius: 12px; padding: 16px; margin: 16px 0; color: #166534; font-size: 13px;">
            🎉 All scheduled follow-up tasks are up to date! Zero overdue leads in your pipeline.
          </div>
        `
        }

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://ais-dev-poi7zcz43pmwkl3tlyediu-941873427499.asia-east1.run.app" class="btn">
            Open ApplyFlow Pipeline
          </a>
        </div>
        
        <p style="font-size: 11px; color: #A8A29E; text-align: center; margin-top: 32px; border-top: 1px solid #EBE8E3; padding-top: 16px;">
          Generated by Firebase Cloud Functions for ApplyFlow · To modify cadence, update your notification settings in ApplyFlow.
        </p>
      </div>
    </body>
  </html>
  `;
}
