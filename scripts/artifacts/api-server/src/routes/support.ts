import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  supportChatMessages,
  supportCustomers,
  supportMemories,
  supportTimelineEvents,
} from "@workspace/db";
import {
  AddCustomerMemoryBody,
  AddCustomerMemoryParams,
  AddCustomerMemoryResponse,
  ChatResponse,
  GetCustomerParams,
  GetCustomerResponse,
  GetCustomerTimelineParams,
  GetCustomerTimelineResponse,
  GetSupportOverviewResponse,
  ListCustomersQueryParams,
  ListCustomersResponse,
  SendSupportMessageBody,
  SendSupportMessageParams,
  SendSupportMessageResponse,
} from "@workspace/api-zod";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

const seedCustomers = [
  {
    id: "cus-maya",
    name: "Maya Chen",
    email: "maya@northstar.studio",
    company: "Northstar Studio",
    avatar: "MC",
    plan: "Pro",
    status: "open",
    frustrationLevel: 82,
    lastSeenAt: "8 min ago",
    openTickets: 2,
    tags: ["high value", "billing", "design team"],
    environment: {
      browser: "Chrome",
      operatingSystem: "macOS",
      device: "MacBook Pro",
      version: "126.0",
    },
    knownIssues: ["Duplicate invoices after seat changes", "Export stalls on larger workspaces"],
    preferredTone: "Direct, warm, and specific. Avoid repeating troubleshooting steps.",
  },
  {
    id: "cus-jon",
    name: "Jon Bell",
    email: "jon@fieldnotes.co",
    company: "Field Notes Co.",
    avatar: "JB",
    plan: "Team",
    status: "waiting",
    frustrationLevel: 46,
    lastSeenAt: "24 min ago",
    openTickets: 1,
    tags: ["mobile", "beta"],
    environment: {
      browser: "Safari",
      operatingSystem: "iOS",
      device: "iPhone 15",
      version: "17.5",
    },
    knownIssues: ["Push notifications are delayed on low-power mode"],
    preferredTone: "Concise and upbeat, with mobile-specific steps.",
  },
  {
    id: "cus-amara",
    name: "Amara Okafor",
    email: "amara@loomandline.com",
    company: "Loom & Line",
    avatar: "AO",
    plan: "Enterprise",
    status: "resolved",
    frustrationLevel: 18,
    lastSeenAt: "2 hr ago",
    openTickets: 0,
    tags: ["enterprise", "sso"],
    environment: {
      browser: "Edge",
      operatingSystem: "Windows 11",
      device: "Surface Laptop",
      version: "125.0",
    },
    knownIssues: ["SCIM sync needs a manual retry after role changes"],
    preferredTone: "Structured, thorough, and ready to forward internally.",
  },
];

const seedMemories = [
  {
    id: "mem-maya-frustration",
    customerId: "cus-maya",
    kind: "preference",
    title: "Do not make her repeat the billing story",
    content: "Maya has already shared screenshots of two duplicate invoices. Acknowledge that history before asking for anything else.",
    confidence: 0.98,
    source: "Ticket #1842",
  },
  {
    id: "mem-maya-solution",
    customerId: "cus-maya",
    kind: "solution",
    title: "Seat rollback fixed the last invoice",
    content: "The previous invoice issue cleared after rolling back the extra seat and re-running billing sync. Finance confirmed the credit the same day.",
    confidence: 0.94,
    source: "Ticket #1798",
  },
  {
    id: "mem-maya-environment",
    customerId: "cus-maya",
    kind: "environment",
    title: "Large workspace export setup",
    content: "Northstar's workspace has 12k+ assets. Exports are more reliable when initiated in Chrome with background sync paused.",
    confidence: 0.86,
    source: "Support note",
  },
  {
    id: "mem-jon-mobile",
    customerId: "cus-jon",
    kind: "environment",
    title: "Jon is usually on iPhone",
    content: "Jon primarily works from an iPhone 15 on iOS 17.5 and prefers steps that can be completed without a desktop.",
    confidence: 0.91,
    source: "Customer profile",
  },
  {
    id: "mem-jon-push",
    customerId: "cus-jon",
    kind: "solution",
    title: "Low-power mode was the notification culprit",
    content: "Turning off Low Power Mode and reopening the app restored push notifications during the last conversation.",
    confidence: 0.9,
    source: "Ticket #1764",
  },
  {
    id: "mem-amara-sso",
    customerId: "cus-amara",
    kind: "solution",
    title: "SSO certificate rotation checklist",
    content: "Amara's IT team needs a 24-hour overlap between old and new SAML certificates. They prefer a checklist they can forward to security.",
    confidence: 0.96,
    source: "Enterprise runbook",
  },
];

const seedTimeline = [
  {
    id: "evt-maya-1",
    customerId: "cus-maya",
    type: "ticket",
    title: "Duplicate invoice after adding seats",
    summary: "Maya shared two invoices for the same billing period and asked for a correction.",
    status: "open",
    occurredAt: "Today · 09:18",
    sentiment: "frustrated",
    solutionWorked: false,
  },
  {
    id: "evt-maya-2",
    customerId: "cus-maya",
    type: "call",
    title: "Billing sync confirmed",
    summary: "A seat rollback and billing sync cleared a similar issue last month.",
    status: "resolved",
    occurredAt: "Jun 12 · 15:42",
    sentiment: "positive",
    solutionWorked: true,
  },
  {
    id: "evt-maya-3",
    customerId: "cus-maya",
    type: "ticket",
    title: "Export hangs at 80%",
    summary: "Large workspace export stalled until background sync was paused.",
    status: "resolved",
    occurredAt: "May 28 · 11:06",
    sentiment: "neutral",
    solutionWorked: true,
  },
  {
    id: "evt-jon-1",
    customerId: "cus-jon",
    type: "ticket",
    title: "Push notification delay",
    summary: "Notifications arrive after reopening the app on iPhone.",
    status: "waiting",
    occurredAt: "Today · 08:54",
    sentiment: "neutral",
    solutionWorked: false,
  },
  {
    id: "evt-amara-1",
    customerId: "cus-amara",
    type: "ticket",
    title: "SAML certificate rotation",
    summary: "Enterprise SSO certificate was rotated with no service interruption.",
    status: "resolved",
    occurredAt: "Yesterday · 16:20",
    sentiment: "positive",
    solutionWorked: true,
  },
];

let seedPromise: Promise<void> | undefined;

async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select({ id: supportCustomers.id }).from(supportCustomers).limit(1);
      if (existing.length > 0) return;
      await db.insert(supportCustomers).values(seedCustomers);
      await db.insert(supportMemories).values(seedMemories);
      await db.insert(supportTimelineEvents).values(seedTimeline);
    })();
  }
  return seedPromise;
}

function customerView(customer: typeof seedCustomers[number]) {
  return {
    ...customer,
    status: customer.status as "open" | "waiting" | "resolved",
  };
}

function memoryView(memory: typeof seedMemories[number] | typeof supportMemories.$inferSelect) {
  return {
    id: memory.id,
    kind: memory.kind as "preference" | "issue" | "environment" | "solution" | "note",
    title: memory.title,
    content: memory.content,
    confidence: memory.confidence,
    source: memory.source,
    createdAt: "createdAt" in memory && memory.createdAt instanceof Date
      ? memory.createdAt.toISOString()
      : new Date().toISOString(),
  };
}

function timelineView(event: typeof seedTimeline[number]) {
  return {
    ...event,
    type: event.type as "ticket" | "email" | "call" | "note",
    status: event.status as "open" | "waiting" | "resolved",
    sentiment: event.sentiment as "positive" | "neutral" | "frustrated",
  };
}

function rankMemories(message: string, memories: Array<typeof seedMemories[number] | typeof supportMemories.$inferSelect>) {
  const queryTokens = new Set(message.toLowerCase().split(/\W+/).filter((token) => token.length > 2));
  return memories
    .map((memory) => {
      const text = `${memory.title} ${memory.content} ${memory.kind}`.toLowerCase();
      const memoryTokens = new Set(text.split(/\W+/).filter((token) => token.length > 2));
      const overlap = [...queryTokens].filter((token) => memoryTokens.has(token)).length;
      const relevance = Math.min(0.99, 0.28 + overlap * 0.12 + memory.confidence * 0.45);
      return { memory, relevance };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);
}

async function askGemini(
  message: string,
  customer: typeof supportCustomers.$inferSelect,
  memories: ReturnType<typeof rankMemories>,
  timeline: typeof seedTimeline,
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const context = [
    `Customer: ${customer.name} at ${customer.company}`,
    `Frustration level: ${customer.frustrationLevel}/100`,
    `Environment: ${JSON.stringify(customer.environment)}`,
    `Known issues: ${customer.knownIssues.join("; ")}`,
    `Preferred tone: ${customer.preferredTone}`,
    "Retrieved memories:",
    ...memories.map(({ memory }) => `- ${memory.title}: ${memory.content}`),
    "Recent timeline:",
    ...timeline.slice(0, 4).map((event) => `- ${event.title}: ${event.summary} (${event.status})`),
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are EchoDesk, a senior customer support copilot. Never make the customer repeat information already in context. Be specific, calm, and concise. Acknowledge frustration when it is high. Separate what is known from what still needs confirmation. Suggest one practical next step. Do not claim you performed an action you cannot perform.",
          }],
        },
        contents: [{
          role: "user",
          parts: [{ text: `${context}\n\nAgent question: ${message}` }],
        }],
        generationConfig: { maxOutputTokens: 8192 },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}`);
  }
  const body = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

router.get("/support/overview", async (req, res) => {
  try {
    await ensureSeedData();
    const customers = await db.select().from(supportCustomers);
    const events = await db.select().from(supportTimelineEvents).orderBy(desc(supportTimelineEvents.id));
    const memoryCount = await db.select({ id: supportMemories.id }).from(supportMemories);
    return res.json(GetSupportOverviewResponse.parse({
      activeCustomers: customers.filter((customer) => customer.status !== "resolved").length,
      openTickets: customers.reduce((sum, customer) => sum + customer.openTickets, 0),
      avgResponseTime: "12m",
      memoriesCaptured: memoryCount.length,
      recentActivity: events.slice(0, 4).map(timelineView),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load support overview");
    return res.status(500).json({ error: "Unable to load support overview" });
  }
});

router.get("/customers", async (req, res) => {
  try {
    await ensureSeedData();
    const query = ListCustomersQueryParams.parse(req.query);
    let customers = await db.select().from(supportCustomers);
    if (query.q) {
      const term = query.q.toLowerCase();
      customers = customers.filter((customer) =>
        `${customer.name} ${customer.email} ${customer.company}`.toLowerCase().includes(term),
      );
    }
    if (query.status && query.status !== "all") {
      customers = customers.filter((customer) => customer.status === query.status);
    }
    return res.json(ListCustomersResponse.parse(customers.map(customerView)));
  } catch (error) {
    req.log.error({ err: error }, "Failed to list customers");
    return res.status(500).json({ error: "Unable to load customers" });
  }
});

router.get("/customers/:customerId", async (req, res) => {
  try {
    await ensureSeedData();
    const { customerId } = GetCustomerParams.parse(req.params);
    const customer = (await db.select().from(supportCustomers).where(eq(supportCustomers.id, customerId)))[0];
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    const memories = await db.select().from(supportMemories).where(eq(supportMemories.customerId, customerId)).orderBy(desc(supportMemories.createdAt));
    return res.json(GetCustomerResponse.parse({
      ...customerView(customer),
      memories: memories.map(memoryView),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load customer");
    return res.status(500).json({ error: "Unable to load customer" });
  }
});

router.get("/customers/:customerId/timeline", async (req, res) => {
  try {
    await ensureSeedData();
    const { customerId } = GetCustomerTimelineParams.parse(req.params);
    const events = await db.select().from(supportTimelineEvents).where(eq(supportTimelineEvents.customerId, customerId));
    return res.json(GetCustomerTimelineResponse.parse(events.map(timelineView)));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load customer timeline");
    return res.status(500).json({ error: "Unable to load customer timeline" });
  }
});

router.post("/customers/:customerId/memories", async (req, res) => {
  try {
    await ensureSeedData();
    const { customerId } = AddCustomerMemoryParams.parse(req.params);
    const body = AddCustomerMemoryBody.parse(req.body);
    const customer = (await db.select({ id: supportCustomers.id }).from(supportCustomers).where(eq(supportCustomers.id, customerId)))[0];
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    const memory = {
      id: randomUUID(),
      customerId,
      kind: body.kind,
      title: body.title,
      content: body.content,
      confidence: 0.9,
      source: "Added by support agent",
    };
    const [created] = await db.insert(supportMemories).values(memory).returning();
    return res.status(201).json(AddCustomerMemoryResponse.parse(memoryView(created)));
  } catch (error) {
    req.log.error({ err: error }, "Failed to add customer memory");
    return res.status(500).json({ error: "Unable to save customer memory" });
  }
});

router.post("/customers/:customerId/chat", async (req, res) => {
  try {
    await ensureSeedData();
    const { customerId } = SendSupportMessageParams.parse(req.params);
    const { message } = SendSupportMessageBody.parse(req.body);
    const customer = (await db.select().from(supportCustomers).where(eq(supportCustomers.id, customerId)))[0];
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    const memories = await db.select().from(supportMemories).where(eq(supportMemories.customerId, customerId));
    const timeline = await db.select().from(supportTimelineEvents).where(eq(supportTimelineEvents.customerId, customerId));
    const ranked = rankMemories(message, memories);
    const citations = ranked.map(({ memory, relevance }) => ({
      memoryId: memory.id,
      title: memory.title,
      snippet: memory.content,
      relevance: Math.round(relevance * 100) / 100,
    }));

    let assistantMessage: string;
    try {
      assistantMessage = await askGemini(message, customer, ranked, timeline);
    } catch (error) {
      req.log.error({ err: error }, "LLM support response failed");
      return res.status(503).json({
        error: "The live LLM is not configured. Add GEMINI_API_KEY as a Replit Secret to enable AI replies.",
      });
    }

    const response = {
      id: randomUUID(),
      message: assistantMessage,
      citations,
      suggestedAction: customer.frustrationLevel > 70
        ? "Acknowledge the previous billing impact before troubleshooting."
        : "Confirm the customer's environment before sending steps.",
      capturedMemory: null,
    };

    await db.insert(supportChatMessages).values([
      { id: randomUUID(), customerId, role: "user", content: message, citations: [] },
      { id: response.id, customerId, role: "assistant", content: assistantMessage, citations: citations.map((citation) => citation.memoryId) },
    ]);

    return res.json(SendSupportMessageResponse.parse(response));
  } catch (error) {
    req.log.error({ err: error }, "Failed to send support message");
    return res.status(500).json({ error: "Unable to send support message" });
  }
});

export default router;