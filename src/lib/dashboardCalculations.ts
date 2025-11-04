// Calculation utilities for dashboard metrics

export function calculateKPIs(responses: any[], quality: any[], events: any[]) {
  // NPS Calculation
  const npsResponses = responses.filter((r) => r.question_id === "Q5" && r.answer_numeric !== null);
  const promoters = npsResponses.filter((r) => r.answer_numeric >= 9).length;
  const detractors = npsResponses.filter((r) => r.answer_numeric <= 6).length;
  const total = npsResponses.length || 1;
  const npsValue = Math.round(((promoters - detractors) / total) * 100);

  // Net Ease Calculation
  const wayfindingResponses = responses.filter((r) => r.question_id === "Q6" && r.answer_numeric !== null);
  const easy = wayfindingResponses.filter((r) => r.answer_numeric <= 2).length;
  const difficult = wayfindingResponses.filter((r) => r.answer_numeric >= 4).length;
  const totalWay = wayfindingResponses.length || 1;
  const netEaseValue = Math.round(((easy - difficult) / totalWay) * 100);

  // Vibe Calculation
  const vibeResponses = responses.filter((r) => r.question_id === "Q9" && r.answer_value);
  const positive = vibeResponses.filter(
    (r) => r.answer_value === "Já adquiri ingresso para próximo evento" || r.answer_value === "Com certeza voltarei"
  ).length;
  const totalVibe = vibeResponses.length || 1;
  const vibeValue = Math.round((positive / totalVibe) * 100);

  // Response Rate
  const totalInvites = quality.reduce((sum, q) => sum + (q.invites_sent || 0), 0);
  const totalResponses = quality.reduce((sum, q) => sum + (q.responses_total || 0), 0);
  const responseRateValue = totalInvites > 0 ? Math.round((totalResponses / totalInvites) * 100) : 0;

  // Delay
  const avgDelay = quality.length > 0
    ? Math.round(quality.reduce((sum, q) => sum + (q.sent_delay_hours || 0), 0) / quality.length)
    : 0;

  return {
    nps: {
      value: npsValue,
      promoters: Math.round((promoters / total) * 100),
      detractors: Math.round((detractors / total) * 100),
    },
    netEase: {
      value: netEaseValue,
      easy: Math.round((easy / totalWay) * 100),
      difficult: Math.round((difficult / totalWay) * 100),
    },
    vibePositive: {
      value: vibeValue,
    },
    responseRate: {
      value: responseRateValue,
      responses: totalResponses,
      invites: totalInvites,
    },
    delayHours: {
      value: avgDelay,
    },
    sampleSize: new Set(responses.map(r => r.respondent_id)).size,
  };
}

export function calculateMatrix(responses: any[]) {
  const npsResponses = responses.filter((r) => r.question_id === "Q5");
  const vibeResponses = responses.filter((r) => r.question_id === "Q9");

  const respondentsWithBoth = Array.from(
    new Set(
      npsResponses.filter((nr) => vibeResponses.some((vr) => vr.respondent_id === nr.respondent_id)).map((r) => r.respondent_id)
    )
  );

  const matrix = {
    highVibeHighNPS: { percentage: 0, count: 0 },
    highVibeLowNPS: { percentage: 0, count: 0 },
    lowVibeHighNPS: { percentage: 0, count: 0 },
    lowVibeLowNPS: { percentage: 0, count: 0 },
  };

  respondentsWithBoth.forEach((respondentId) => {
    const nps = npsResponses.find((r) => r.respondent_id === respondentId)?.answer_numeric;
    const vibe = vibeResponses.find((r) => r.respondent_id === respondentId)?.answer_value;

    const highNPS = nps >= 7;
    const highVibe =
      vibe === "Já adquiri ingresso para próximo evento" || vibe === "Com certeza voltarei";

    if (highVibe && highNPS) matrix.highVibeHighNPS.count++;
    else if (highVibe && !highNPS) matrix.highVibeLowNPS.count++;
    else if (!highVibe && highNPS) matrix.lowVibeHighNPS.count++;
    else matrix.lowVibeLowNPS.count++;
  });

  const total = respondentsWithBoth.length || 1;
  Object.keys(matrix).forEach((key) => {
    matrix[key as keyof typeof matrix].percentage = Math.round((matrix[key as keyof typeof matrix].count / total) * 100);
  });

  return matrix;
}

export function calculateDrivers(responses: any[]) {
  const trophiesResponses = responses.filter((r) => r.question_id === "Q7" && r.answer_array);
  const frustrationsResponses = responses.filter((r) => r.question_id === "Q8" && r.answer_array);

  const countItems = (responses: any[]) => {
    const counts: Record<string, number> = {};
    responses.forEach((r) => {
      const items = r.answer_array || [];
      items.forEach((item: string) => {
        counts[item] = (counts[item] || 0) + 1;
      });
    });
    return counts;
  };

  const trophiesCounts = countItems(trophiesResponses);
  const frustrationsCounts = countItems(frustrationsResponses);

  const totalTrophies = trophiesResponses.length || 1;
  const totalFrustrations = frustrationsResponses.length || 1;

  const trophies = Object.entries(trophiesCounts)
    .map(([label, count]) => ({
      label,
      count,
      total: totalTrophies,
      percentage: Math.round((count / totalTrophies) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const frustrations = Object.entries(frustrationsCounts)
    .map(([label, count]) => ({
      label,
      count,
      total: totalFrustrations,
      percentage: Math.round((count / totalFrustrations) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return { trophies, frustrations };
}

export function calculateWayfinding(responses: any[]) {
  const wayfindingResponses = responses.filter((r) => r.question_id === "Q6" && r.answer_numeric !== null);

  const distribution = [1, 2, 3, 4, 5].map((score) => {
    const count = wayfindingResponses.filter((r) => r.answer_numeric === score).length;
    const percentage = wayfindingResponses.length > 0 ? Math.round((count / wayfindingResponses.length) * 100) : 0;
    return {
      label: `${score}`,
      count,
      percentage,
    };
  });

  // By segment calculation would require joining with respondent data
  const bySegment: any[] = [];

  return { distribution, bySegment };
}

export function calculateSegments(responses: any[], events: any[]) {
  const calculateSegmentMetrics = (segmentResponses: any[]) => {
    const npsResponses = segmentResponses.filter((r) => r.question_id === "Q5" && r.answer_numeric !== null);
    const promoters = npsResponses.filter((r) => r.answer_numeric >= 9).length;
    const detractors = npsResponses.filter((r) => r.answer_numeric <= 6).length;
    const totalNPS = npsResponses.length || 1;
    const nps = Math.round(((promoters - detractors) / totalNPS) * 100);

    const wayfindingResponses = segmentResponses.filter((r) => r.question_id === "Q6" && r.answer_numeric !== null);
    const easy = wayfindingResponses.filter((r) => r.answer_numeric <= 2).length;
    const difficult = wayfindingResponses.filter((r) => r.answer_numeric >= 4).length;
    const totalWay = wayfindingResponses.length || 1;
    const netEase = Math.round(((easy - difficult) / totalWay) * 100);

    return {
      nps,
      netEase,
      count: new Set(segmentResponses.map(r => r.respondent_id)).size
    };
  };

  // Group by event type
  const eventTypeMap = new Map();
  events.forEach((event) => {
    const eventResponses = responses.filter((r) => r.event_id === event.event_id);
    if (!eventTypeMap.has(event.event_type)) {
      eventTypeMap.set(event.event_type, []);
    }
    eventTypeMap.get(event.event_type).push(...eventResponses);
  });

  const byEventType = Array.from(eventTypeMap.entries()).map(([name, responses]) => ({
    name,
    ...calculateSegmentMetrics(responses),
  }));

  // For gender, age, transport we'd need to join with respondent data
  // Placeholder for now
  const byGender: any[] = [];
  const byAge: any[] = [];
  const byTransport: any[] = [];

  return { byEventType, byGender, byAge, byTransport };
}

export function calculatePreferences(responses: any[]) {
  const preferencesResponses = responses.filter((r) => r.question_id === "Q10" && r.answer_array);

  const counts: Record<string, number> = {};
  preferencesResponses.forEach((r) => {
    const items = r.answer_array || [];
    items.forEach((item: string) => {
      counts[item] = (counts[item] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateHealth(quality: any[]) {
  const totalInvites = quality.reduce((sum, q) => sum + (q.invites_sent || 0), 0);
  const totalResponses = quality.reduce((sum, q) => sum + (q.responses_total || 0), 0);
  const totalComplete = quality.reduce((sum, q) => sum + (q.complete_responses || 0), 0);

  const responseRate = totalInvites > 0 ? Math.round((totalResponses / totalInvites) * 100) : 0;
  const completeness = totalResponses > 0 ? Math.round((totalComplete / totalResponses) * 100) : 0;
  const delay = quality.length > 0
    ? Math.round(quality.reduce((sum, q) => sum + (q.sent_delay_hours || 0), 0) / quality.length)
    : 0;

  return { responseRate, completeness, delay };
}
