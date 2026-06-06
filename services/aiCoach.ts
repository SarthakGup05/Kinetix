import { settingsManager } from './settingsManager';
import { type DriveSession } from './driveManager';

function getLocalCoachingReport(stats: any, history: DriveSession[]): string {
  if (!stats || stats.totalDrives === 0) {
    return "Welcome to Kinetix! I'm your Pilot AI Coach. Complete your first driving session so I can analyze your vehicle telemetry, passenger comfort, and phone distraction habits.";
  }

  // Analyze deductions
  let totalBraking = 0;
  let totalAccel = 0;
  let totalTurns = 0;
  let totalHandling = 0;
  history.forEach(s => {
    totalBraking += s.deductions.braking || 0;
    totalAccel += s.deductions.accel || 0;
    totalTurns += s.deductions.turns || 0;
    totalHandling += s.deductions.handling || 0;
  });

  const avgBraking = totalBraking / stats.totalDrives;
  const avgHandling = totalHandling / stats.totalDrives;

  let positive = "Your passenger comfort index is looking great with smooth transitions.";
  let tip = "Try to maintain steady speed and anticipate stops early.";

  if (avgHandling === 0) {
    positive = "Fantastic work keeping your device secured—zero distraction events detected.";
  } else if (stats.averageScore >= 90) {
    positive = `Superb safety score of ${stats.averageScore} overall. Your driving telemetry shows excellent composure.`;
  }

  if (avgBraking > 1.2) {
    tip = "I detected multiple harsh braking triggers. Try increasing your follow distance in high-traffic zones.";
  } else if (avgHandling > 0.5) {
    tip = "Your phone handling rates are impacting safety. Ensure your phone is mounted safely before starting the engine.";
  } else if (totalAccel > totalBraking) {
    tip = "Anticipate your launches: watch rapid acceleration spikes off the line to conserve fuel and passenger comfort.";
  }

  return `${positive} ${tip}`;
}

interface CoachCache {
  reportText: string;
  historyLength: number;
  latestSessionId: string;
  groqApiKey: string;
  groqModel: string;
}

let cachedReport: CoachCache | null = null;

export async function generateAICoachingReport(
  stats: any,
  history: DriveSession[],
  forceRefresh: boolean = false
): Promise<string> {
  const settings = settingsManager.getSettings();
  const apiKey = settings.groqApiKey || '';
  const model = settings.groqModel || 'llama-3.3-70b-versatile';

  const historyLength = history.length;
  const latestSessionId = history[0]?.id || '';

  // Check if cache is valid and not a forced re-analysis
  if (
    !forceRefresh &&
    cachedReport &&
    cachedReport.historyLength === historyLength &&
    cachedReport.latestSessionId === latestSessionId &&
    cachedReport.groqApiKey === apiKey &&
    cachedReport.groqModel === model
  ) {
    return cachedReport.reportText;
  }

  const userStats = {
    totalDrives: stats?.totalDrives || 0,
    totalDistanceKm: stats?.totalDistanceKm || 0,
    averageScore: stats?.averageScore || 0,
    rating: stats?.rating || 'poor',
  };

  // If user has no drives, skip API call and return initial message directly
  if (userStats.totalDrives === 0) {
    const reportText = getLocalCoachingReport(userStats, history);
    cachedReport = {
      reportText,
      historyLength,
      latestSessionId,
      groqApiKey: apiKey,
      groqModel: model
    };
    return reportText;
  }

  // 1. Generate the structured telemetry context for the prompt
  const recentSessionsSummary = history.slice(0, 3).map((session, i) => {
    return `Session ${i + 1}: Score=${session.finalScore}, Distance=${session.distanceKm}km, Deductions={braking: ${session.deductions.braking}, accel: ${session.deductions.accel}, turns: ${session.deductions.turns}, handling: ${session.deductions.handling}}`;
  });

  const prompt = `You are "Pilot AI", a premium, professional driving safety telematics coach for the app "Kinetix".
Your tone is encouraging, tech-focused, professional, and actionable. Keep your response concise (3-4 sentences maximum).
Analyze the user's driving statistics and provide one positive reinforcement and one key safety warning or actionable tip.

User Statistics:
- Total Drives: ${userStats.totalDrives}
- Total Distance: ${userStats.totalDistanceKm} km
- Lifetime Average Score: ${userStats.averageScore} / 100
- Safety Rating: ${userStats.rating.toUpperCase()}

Recent Sessions:
${recentSessionsSummary.join('\n')}

Rules:
1. Speak directly to the user (e.g. "I noticed...", "Try to...").
2. Focus on specific habit trends from the deductions (braking, accel, turns, phone handling).
3. Do not output any markdown headings, lists, or emojis other than standard text.
4. Keep the summary under 90 words.
5. Do not write generic fillers. Go straight to advice.`;

  let finalReport = '';

  // 2. If API key is not present, generate local fallback coach response
  if (!apiKey || apiKey.trim() === '') {
    // Delay slightly to simulate computation
    await new Promise(resolve => setTimeout(resolve, 800));
    finalReport = getLocalCoachingReport(userStats, history);
  } else {
    // 3. Make HTTP request to Groq API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7-second timeout boundary

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: 'You are a professional, concise driving coach.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('[AICoach] Groq API returned error status, falling back to local coach.', response.status);
        finalReport = getLocalCoachingReport(userStats, history);
      } else {
        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content;
        if (generatedText && generatedText.trim().length > 0) {
          finalReport = generatedText.trim();
        } else {
          finalReport = getLocalCoachingReport(userStats, history);
        }
      }
    } catch (error) {
      console.warn('[AICoach] Failed to fetch coaching report from Groq API, using fallback.', error);
      finalReport = getLocalCoachingReport(userStats, history);
    }
  }

  // Update Cache
  cachedReport = {
    reportText: finalReport,
    historyLength,
    latestSessionId,
    groqApiKey: apiKey,
    groqModel: model
  };

  return finalReport;
}
