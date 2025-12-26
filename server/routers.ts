import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import Parser from "rss-parser";
const parser = new Parser();
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { projects, aiRecommendations, subsidiaries } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { invokeLLM } from "./llm";

export const appRouter = router({
  system: systemRouter,

  // ============ AUTH ============
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({
      email: z.string().email("请输入有效的邮箱地址"),
      password: z.string().min(6, "密码至少需要6位"),
      name: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const existingUser = await db.getUserByEmail(input.email);
      if (existingUser) throw new Error("该邮箱已被注册");
      const hashedPassword = await hash(input.password, 10);
      const userId = await db.createUser({
        email: input.email,
        password: hashedPassword,
        name: input.name || input.email.split('@')[0],
        role: "user",
        loginMethod: "local",
        openId: input.email,
        lastSignedIn: new Date()
      });
      const token = await sdk.signSession({
        openId: input.email,
        name: input.name || input.email.split('@')[0],
        appId: "local-dev-app"
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      return { success: true, userId };
    }),
    login: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.password) throw new Error("邮箱或密码错误");
      const isValid = await compare(input.password, user.password);
      if (!isValid) throw new Error("邮箱或密码错误");
      const token = await sdk.signSession({
        openId: user.openId || user.email,
        name: user.name || "User",
        appId: "local-dev-app"
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      await db.updateUserLastSignIn(user.id);
      return { success: true };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    stats: publicProcedure.query(async () => { return await db.getDashboardStats(); }),
    recentDeals: publicProcedure.input(z.object({ limit: z.number().default(5) })).query(async ({ input }) => { return await db.getDeals({ limit: input.limit }); }),
    recentNews: publicProcedure.input(z.object({ limit: z.number().default(5) })).query(async ({ input }) => { return await db.getNewsItems({ limit: input.limit }); }),
    opportunityByStage: publicProcedure.query(async () => { return await db.getOpportunityByStage(); }),
    dealsByMonth: publicProcedure.input(z.object({ months: z.number().default(12) })).query(async ({ input }) => { return await db.getDealsByMonth(input.months); }),
  }),

  // ============ CUSTOMER ============
  customer: router({
    list: publicProcedure.input(z.object({ search: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0), })).query(async ({ input }) => { return await db.getCustomers(input); }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { return await db.getCustomerById(input.id); }),
    create: protectedProcedure.input(z.object({ name: z.string().min(1), registeredName: z.string().optional(), localName: z.string().optional(), tradeName: z.string().optional(), globalOneId: z.string().optional(), industry: z.string().optional(), industryCode: z.string().optional(), businessType: z.string().optional(), foundedDate: z.string().optional(), operatingStatus: z.string().optional(), isIndependent: z.boolean().optional(), registrationCountry: z.string().optional(), registrationAddress: z.string().optional(), registrationNumber: z.string().optional(), registrationType: z.string().optional(), website: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), capitalAmount: z.number().optional(), capitalCurrency: z.string().optional(), annualRevenue: z.number().optional(), revenueCurrency: z.string().optional(), revenueYear: z.string().optional(), employeeCount: z.number().optional(), stockExchange: z.string().optional(), stockSymbol: z.string().optional(), riskLevel: z.string().optional(), riskDescription: z.string().optional(), ceoName: z.string().optional(), ceoTitle: z.string().optional(), tags: z.string().optional(), logoUrl: z.string().optional(), description: z.string().optional(), notes: z.string().optional(), })).mutation(async ({ input, ctx }) => { const id = await db.createCustomer({ ...input, createdBy: ctx.user.id }); return { id }; }),
    update: protectedProcedure.input(z.object({ id: z.number(), data: z.record(z.any()) })).mutation(async ({ input }) => { await db.updateCustomer(input.id, input.data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteCustomer(input.id); return { success: true }; }),
    count: publicProcedure.query(async () => { return await db.getCustomerCount(); }),
  }),

  // ============ SUBSIDIARY ============
  subsidiary: router({
    listByCustomer: publicProcedure.input(z.object({ customerId: z.number() })).query(async ({ input }) => { return await db.getSubsidiariesByCustomer(input.customerId); }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { return await db.getSubsidiaryById(input.id); }),
    create: protectedProcedure.input(z.object({ customerId: z.number(), parentSubsidiaryId: z.number().optional(), globalOneId: z.string().optional(), name: z.string().min(1), localName: z.string().optional(), entityType: z.string().optional(), ownershipPercentage: z.number().min(0).max(100).optional(), country: z.string().optional(), region: z.string().optional(), city: z.string().optional(), address: z.string().optional(), latitude: z.string().optional(), longitude: z.string().optional(), industry: z.string().optional(), operatingStatus: z.string().optional(), employeeCount: z.number().optional(), annualRevenue: z.number().optional(), revenueCurrency: z.string().optional(), relationshipType: z.string().optional(), description: z.string().optional(), })).mutation(async ({ input }) => { const id = await db.createSubsidiary(input); return { id }; }),
    update: protectedProcedure.input(z.object({ id: z.number(), data: z.record(z.any()) })).mutation(async ({ input }) => { await db.updateSubsidiary(input.id, input.data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteSubsidiary(input.id); return { success: true }; }),
    count: publicProcedure.input(z.object({ customerId: z.number().optional() })).query(async ({ input }) => { return await db.getSubsidiaryCount(input.customerId); }),
  }),

  // ============ OPPORTUNITY ============
  opportunity: router({
    list: publicProcedure.input(z.object({ customerId: z.number().optional(), status: z.string().optional(), stage: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0), })).query(async ({ input }) => { return await db.getOpportunities(input); }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { return await db.getOpportunityById(input.id); }),
    create: protectedProcedure.input(z.object({ customerId: z.number(), subsidiaryId: z.number().optional(), name: z.string().min(1), description: z.string().optional(), stage: z.string().optional(), status: z.string().optional(), probability: z.number().min(0).max(100).optional(), amount: z.number().optional(), currency: z.string().optional(), productType: z.string().optional(), productCategory: z.string().optional(), expectedCloseDate: z.date().optional(), sourceType: z.string().optional(), sourceDetail: z.string().optional(), ownerName: z.string().optional(), notes: z.string().optional(), })).mutation(async ({ input, ctx }) => { const id = await db.createOpportunity({ ...input, ownerId: ctx.user.id }); return { id }; }),
    update: protectedProcedure.input(z.object({ id: z.number(), data: z.record(z.any()) })).mutation(async ({ input }) => { await db.updateOpportunity(input.id, input.data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteOpportunity(input.id); return { success: true }; }),
    stats: publicProcedure.query(async () => { return await db.getOpportunityStats(); }),
    byStage: publicProcedure.query(async () => { return await db.getOpportunityByStage(); }),
  }),

  // ============ DEAL ============
  deal: router({
    list: publicProcedure.input(z.object({ customerId: z.number().optional(), status: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0), })).query(async ({ input }) => { return await db.getDeals(input); }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { return await db.getDealById(input.id); }),
    create: protectedProcedure.input(z.object({ customerId: z.number(), subsidiaryId: z.number().optional(), opportunityId: z.number().optional(), dealNumber: z.string().optional(), name: z.string().min(1), description: z.string().optional(), amount: z.number(), currency: z.string().optional(), monthlyRecurring: z.number().optional(), oneTimeFee: z.number().optional(), productType: z.string().optional(), productCategory: z.string().optional(), contractStartDate: z.date().optional(), contractEndDate: z.date().optional(), contractDurationMonths: z.number().optional(), status: z.string().optional(), closedDate: z.date().optional(), closedByName: z.string().optional(), notes: z.string().optional(), })).mutation(async ({ input, ctx }) => { const id = await db.createDeal({ ...input, closedBy: ctx.user.id }); return { id }; }),
    update: protectedProcedure.input(z.object({ id: z.number(), data: z.record(z.any()) })).mutation(async ({ input }) => { await db.updateDeal(input.id, input.data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteDeal(input.id); return { success: true }; }),
    stats: publicProcedure.query(async () => { return await db.getDealStats(); }),
    byMonth: publicProcedure.input(z.object({ months: z.number().default(12) })).query(async ({ input }) => { return await db.getDealsByMonth(input.months); }),
  }),

  // ============ ML & AI ============
  ml: router({
    getData: publicProcedure.query(async () => {
      const drizzle = await db.getDb();
      if (!drizzle) return [];
      const allProjects = await drizzle.select().from(projects).orderBy(desc(projects.startDate)).limit(200);
      const allRecs = await drizzle.select().from(aiRecommendations);
      const recsMap = new Map();
      allRecs.forEach((r: any) => {
        if (!recsMap.has(r.projectId)) recsMap.set(r.projectId, []);
        recsMap.get(r.projectId).push(r);
      });
      return allProjects.map((p: any) => ({
        id: p.id,
        originalId: p.originalId,
        projectName: p.name,
        investment: p.investment,
        country: p.country,
        sector: p.sector,
        stage: p.stage,
        startDate: p.startDate,
        contractor: p.contractor,
        summary: p.summary,
        recommendations: recsMap.get(p.originalId) || []
      }));
    }),
  }),

  ai: router({
    getLogs: publicProcedure.input(z.object({ entityType: z.string(), entityId: z.number(), })).query(async ({ input }) => { return await db.getAiAnalysisLogs(input.entityType, input.entityId); }),
    analyzeCustomer: protectedProcedure.input(z.object({ customerId: z.number(), analysisType: z.enum(["summary", "product_match", "talking_points", "risk_assessment"]), })).mutation(async ({ input, ctx }) => {

      // 🛠️【自动修复】尝试修复数据库表结构
      // 强制设置默认值，以防 null 问题
      try {
        const drizzle = await db.getDb();
        if (drizzle) {
          // 注意：这里我们尝试添加默认值约束
          await drizzle.execute(sql`
            ALTER TABLE aiAnalysisLogs
            ADD COLUMN IF NOT EXISTS result TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS errorMessage TEXT DEFAULT '';
          `);
        }
      } catch (e) {
        console.log("Auto-migration for aiAnalysisLogs skipped or failed", e);
      }

      const customer = await db.getCustomerById(input.customerId);
      if (!customer) throw new Error("Customer not found");

      // ✅✅✅ 终极修复：使用有意义的字符串 "Pending" 和 "None"
      // 这样可以避免数据库驱动把空字符串 "" 误判为 null 或 undefined
      const logId = await db.createAiAnalysisLog({
        entityType: "customer",
        entityId: input.customerId,
        analysisType: input.analysisType,
        requestedBy: ctx.user.id,
        status: "processing",
        prompt: "Analyzing...",
        response: "Waiting for AI...",
        result: "Pending", // 替换了 ""
        errorMessage: "None" // 替换了 ""，确保它是一个实际的字符串值
      });

      try {
        let prompt = "";
        const context = `Customer: ${customer.name}, Industry: ${customer.industry || "Unknown"}, Business: ${customer.description || "Unknown"}`;
        switch (input.analysisType) {
          case "summary": prompt = `Analyze this customer: ${context}.`; break;
          case "risk_assessment": prompt = `Evaluate risk for: ${context}.`; break;
          case "product_match": prompt = `Suggest products for: ${context}.`; break;
          case "talking_points": prompt = `Talking points for: ${context}.`; break;
        }
        await db.updateAiAnalysisLog(logId, { prompt });
        const response = await invokeLLM({ messages: [{ role: "system", content: "You are an enterprise business intelligence assistant." }, { role: "user", content: prompt }], temperature: 0.7 });
        const analysisResult = response.choices[0]?.message?.content || "AI returned no content.";
        await db.updateAiAnalysisLog(logId, { result: analysisResult, response: analysisResult, status: "completed", completedAt: new Date() });
        return { analysis: analysisResult, logId };
      } catch (error) { await db.updateAiAnalysisLog(logId, { status: "failed", errorMessage: error instanceof Error ? error.message : "Unknown AI error", completedAt: new Date() }); throw new Error("AI Analysis failed"); }
    }),
  }),

  // ============ NEWS ============
  news: router({
    list: publicProcedure.input(z.object({ customerId: z.number().optional(), isHighlight: z.boolean().optional(), limit: z.number().default(50), offset: z.number().default(0), })).query(async ({ input }) => { return await db.getNewsItems(input); }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { return await db.getNewsItemById(input.id); }),
    create: protectedProcedure.input(z.object({ customerId: z.number(), subsidiaryId: z.number().optional(), title: z.string().min(1), summary: z.string().optional(), content: z.string().optional(), sourceUrl: z.string().optional(), sourceName: z.string().optional(), publishedDate: z.date().optional(), category: z.string().optional(), sentiment: z.string().optional(), relevanceScore: z.number().min(0).max(100).optional(), isHighlight: z.boolean().optional(), })).mutation(async ({ input, ctx }) => { const id = await db.createNewsItem(input); return { id }; }),
    update: protectedProcedure.input(z.object({ id: z.number(), data: z.record(z.any()) })).mutation(async ({ input }) => { await db.updateNewsItem(input.id, input.data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteNewsItem(input.id); return { success: true }; }),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.updateNewsItem(input.id, { isRead: true }); return { success: true }; }),
    unreadCount: publicProcedure.query(async () => { return await db.getUnreadNewsCount(); }),
    searchNews: protectedProcedure.input(z.object({ customerId: z.number(), query: z.string().optional(), })).mutation(async ({ input, ctx }) => {
      const customer = await db.getCustomerById(input.customerId);
      if (!customer) throw new Error("Customer not found");
      const oldNews = await db.getNewsItems({ customerId: input.customerId, limit: 100 });
      for (const item of oldNews) { await db.deleteNewsItem(item.id); }
      const keyword = input.query || customer.name;
      const searchQuery = `${keyword} business finance`;
      try {
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
        const feed = await parser.parseURL(feedUrl);
        const insertedIds: number[] = [];
        const items = feed.items.slice(0, 10);
        for (const item of items) {
          const id = await db.createNewsItem({ customerId: input.customerId, title: item.title || "No Title", summary: item.contentSnippet || item.content || "", content: item.content || "", sourceName: item.source || "Google News", sourceUrl: item.link || "", publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(), sentiment: "neutral", category: "General", isRead: false });
          insertedIds.push(id);
        }
        return { success: true, count: insertedIds.length, ids: insertedIds };
      } catch (e) { throw new Error("抓取真实新闻失败"); }
    }),
  }),

  geographic: router({
    getMarkers: publicProcedure.input(z.object({ customerId: z.number().optional(), })).query(async ({ input }) => { return await db.getGeographicMarkers(input.customerId); }),
    getAllWithCustomer: publicProcedure.query(async () => { return await db.getAllSubsidiariesWithCustomer(); }),
  }),

  // ============ EXCEL IMPORT PROCESSING (ENHANCED) ============
  import: router({
    history: protectedProcedure.query(async () => { return await db.getDataImports({ limit: 50 }); }),
    uploadExcel: protectedProcedure.input(z.object({
      fileBase64: z.string(),
      dataType: z.enum(["customer", "subsidiary", "opportunity", "deal", "news", "project", "recommendation"]),
    })).mutation(async ({ input, ctx }) => {
      const { fileBase64, dataType } = input;
      const drizzle = await db.getDb();
      if (!drizzle) throw new Error("Database connection failed");

      // 1. Auto-migration (safe check)
      if (dataType === "customer") {
        try {
          await drizzle.execute(sql`
            ALTER TABLE customers
            ADD COLUMN IF NOT EXISTS businessType VARCHAR(128),
            ADD COLUMN IF NOT EXISTS foundedDate VARCHAR(32),
            ADD COLUMN IF NOT EXISTS registrationAddress TEXT,
            ADD COLUMN IF NOT EXISTS riskLevel VARCHAR(50),
            ADD COLUMN IF NOT EXISTS logoUrl VARCHAR(512),
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS employeeCount INT
          `);
        } catch (e) { console.log("Auto-migration skipped"); }
      }

      // 2. Create import record (Status: processing)
      const importRecordId = await db.createDataImport({
          fileName: `Import_${dataType}_${new Date().toISOString().slice(0, 10)}.xlsx`,
          fileType: "excel",
          importedBy: ctx.user.id,
          status: "processing"
      });

      // ✅✅✅ 3. Global Try-Catch to prevent "Processing" hang
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        const fuzzyGetValue = (row: any, targetKeys: string[]) => {
          const actualKeys = Object.keys(row);
          for (const target of targetKeys) {
            const normalizedTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
            const foundKey = actualKeys.find(ak =>
              ak.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedTarget
            );
            if (foundKey) {
              const val = row[foundKey];
              if (val !== undefined && val !== null) {
                const strVal = String(val).trim();
                if (strVal !== "" && strVal !== "NULL" && strVal !== "null") return strVal;
              }
            }
          }
          return undefined;
        };

        for (let i = 0; i < rawData.length; i++) {
          const row: any = rawData[i];
          try {
            // --- CUSTOMER ---
            if (dataType === "customer") {
              const name = fuzzyGetValue(row, ['name', 'Company Name', '公司名称']);
              if (!name) continue;

              let rawStatus = fuzzyGetValue(row, ['operatingStatus', 'Status', '运营状态']) || 'active';
              let rawRisk = fuzzyGetValue(row, ['riskLevel', 'Risk', '风险等级']) || 'unknown';
              let rawIndep = fuzzyGetValue(row, ['isIndependent', 'Independent']);
              let isIndep = true;
              if (rawIndep && (rawIndep.toUpperCase() === "NO" || rawIndep === "0" || rawIndep.toUpperCase() === "FALSE")) {
                  isIndep = false;
              }

              await db.createCustomer({
                name: String(name),
                globalOneId: fuzzyGetValue(row, ['globalOneId']),
                registeredName: fuzzyGetValue(row, ['registeredName']),
                localName: fuzzyGetValue(row, ['localName']),
                tradeName: fuzzyGetValue(row, ['tradeName']),
                industry: fuzzyGetValue(row, ['industry']),
                industryCode: fuzzyGetValue(row, ['industryCode']),
                businessType: fuzzyGetValue(row, ['businessType', 'Business Type']),
                foundedDate: fuzzyGetValue(row, ['foundedDate']),

                operatingStatus: rawStatus,
                riskLevel: rawRisk,
                isIndependent: isIndep,

                registrationCountry: fuzzyGetValue(row, ['registrationCountry']),
                registrationAddress: fuzzyGetValue(row, ['registrationAddress']),
                registrationNumber: fuzzyGetValue(row, ['registrationNumber']),
                registrationType: fuzzyGetValue(row, ['registrationType']),
                website: fuzzyGetValue(row, ['website']),
                phone: fuzzyGetValue(row, ['phone']),
                email: fuzzyGetValue(row, ['email']),
                annualRevenue: fuzzyGetValue(row, ['annualRevenue']) ? Number(fuzzyGetValue(row, ['annualRevenue'])) : undefined,
                capitalAmount: fuzzyGetValue(row, ['capitalAmount']) ? Number(fuzzyGetValue(row, ['capitalAmount'])) : undefined,
                employeeCount: fuzzyGetValue(row, ['employeeCount']) ? Number(fuzzyGetValue(row, ['employeeCount'])) : undefined,
                revenueYear: fuzzyGetValue(row, ['revenueYear']),
                revenueCurrency: fuzzyGetValue(row, ['revenueCurrency']),
                capitalCurrency: fuzzyGetValue(row, ['capitalCurrency']),
                stockExchange: fuzzyGetValue(row, ['stockExchange']),
                stockSymbol: fuzzyGetValue(row, ['stockSymbol']),
                riskDescription: fuzzyGetValue(row, ['riskDescription']),
                ceoName: fuzzyGetValue(row, ['ceoName']),
                ceoTitle: fuzzyGetValue(row, ['ceoTitle']),
                tags: fuzzyGetValue(row, ['tags']),
                logoUrl: fuzzyGetValue(row, ['logoUrl']),
                description: fuzzyGetValue(row, ['description']),
                notes: fuzzyGetValue(row, ['notes']),
                createdBy: ctx.user.id
              });
              successCount++;
            }

            // --- SUBSIDIARY (升级版：支持ID查找 + 多级嵌套查找) ---
            else if (dataType === "subsidiary") {
               const name = fuzzyGetValue(row, ['name', 'Name', '子公司名称']);
               const parent = fuzzyGetValue(row, ['parentName', 'Parent Company', '母公司名称']);
               const explicitCustId = fuzzyGetValue(row, ['customerId', 'Customer ID']);

               if (!name) throw new Error("Missing name");
               // 只要有 Parent Name 或 Customer ID 其中一个就行
               if (!parent && !explicitCustId) throw new Error("Must provide Customer ID or Parent Name");

               let parentCustomerId: number;
               let parentSubsidiaryId: number | undefined;

               if (explicitCustId) {
                  // 1. 如果 Excel 里填了 ID，直接用
                  parentCustomerId = parseInt(String(explicitCustId));
               } else {
                  // 2. 如果没填 ID，去客户表里找名字
                  const customers = await db.getCustomers({ search: String(parent), limit: 1 });
                  if (customers.length > 0) {
                    parentCustomerId = customers[0].id;
                  } else {
                     // 3. 【关键升级】客户表没找到？去子公司表里找找（也许它是孙子公司）
                     //
                     const parentSubs = await drizzle.select().from(subsidiaries).where(eq(subsidiaries.name, String(parent)));

                     if (parentSubs.length > 0) {
                        // 找到了！它爸爸也是个子公司。
                        parentCustomerId = parentSubs[0].customerId; // 继承爷爷的 ID
                        parentSubsidiaryId = parentSubs[0].id;       // 记录爸爸的 ID
                     } else {
                        throw new Error(`Parent company not found: ${parent}`);
                     }
                  }
               }

               await db.createSubsidiary({
                 customerId: parentCustomerId,
                 parentSubsidiaryId: parentSubsidiaryId,
                 name: String(name),
                 entityType: fuzzyGetValue(row, ['entityType', 'Type']) || "subsidiary",
                 country: fuzzyGetValue(row, ['country', 'Country']),
                 city: fuzzyGetValue(row, ['city', 'City']),
                 latitude: fuzzyGetValue(row, ['latitude', 'Lat']),
                 longitude: fuzzyGetValue(row, ['longitude', 'Lng']),
                 industry: fuzzyGetValue(row, ['industry']),
                 employeeCount: fuzzyGetValue(row, ['employeeCount']) ? Number(fuzzyGetValue(row, ['employeeCount'])) : undefined
               });
               successCount++;
            }

            // --- OPPORTUNITY ---
            else if (dataType === "opportunity") {
               const name = fuzzyGetValue(row, ['name', 'Name']);
               const customer = fuzzyGetValue(row, ['customerName', 'Customer']);
               if (!name || !customer) throw new Error("Missing name or customerName");
               const customers = await db.getCustomers({ search: String(customer), limit: 1 });
               if (customers.length === 0) throw new Error(`Customer not found: ${customer}`);

               await db.createOpportunity({
                 customerId: customers[0].id,
                 name: String(name),
                 amount: fuzzyGetValue(row, ['amount']) ? Number(fuzzyGetValue(row, ['amount'])) * 100 : 0,
                 stage: "lead",
                 status: "active",
                 ownerId: ctx.user.id
               });
               successCount++;
            }

            // --- DEAL ---
            else if (dataType === "deal") {
               const name = fuzzyGetValue(row, ['name', 'Name']);
               const customer = fuzzyGetValue(row, ['customerName', 'Customer']);
               if (!name || !customer) throw new Error("Missing name or customerName");
               const customers = await db.getCustomers({ search: String(customer), limit: 1 });
               if (customers.length === 0) throw new Error(`Customer not found: ${customer}`);

               await db.createDeal({
                 customerId: customers[0].id,
                 name: String(name),
                 amount: fuzzyGetValue(row, ['amount']) ? Number(fuzzyGetValue(row, ['amount'])) * 100 : 0,
                 status: "active",
                 closedDate: new Date(),
                 closedBy: ctx.user.id
               });
               successCount++;
            }

            // --- NEWS ---
            else if (dataType === "news") {
               const title = fuzzyGetValue(row, ['title', 'Title']);
               const customer = fuzzyGetValue(row, ['customerName', 'Customer']);
               if (!title || !customer) throw new Error("Missing title or customerName");
               const customers = await db.getCustomers({ search: String(customer), limit: 1 });
               if (customers.length === 0) throw new Error(`Customer not found: ${customer}`);
               await db.createNewsItem({
                 customerId: customers[0].id,
                 title: String(title),
                 summary: fuzzyGetValue(row, ['summary']),
                 content: fuzzyGetValue(row, ['content']),
                 sourceName: "Excel Import",
                 publishedDate: new Date(),
                 isRead: false
               });
               successCount++;
            }

          } catch (err) {
            failedCount++;
            errors.push(`Row ${i+1}: ${err instanceof Error ? err.message : "Error"}`);
          }
        }

        // Success - Update record
        await db.updateDataImport(importRecordId, {
          status: "completed", successRows: successCount, failedRows: failedCount, errorLog: errors.join('\n'), completedAt: new Date()
        });
        return { success: true, successCount, failedCount, errors };

      } catch (globalError) {
        // 🔴 Failure - Update record to 'failed' instead of leaving it 'processing'
        await db.updateDataImport(importRecordId, {
          status: "failed",
          errorLog: `Critical Import Error: ${globalError instanceof Error ? globalError.message : "Unknown error"}`,
          completedAt: new Date()
        });
        throw globalError;
      }
    }),
    processExcel: protectedProcedure.input(z.object({ importId: z.number(), dataType: z.enum(["customer", "subsidiary", "opportunity", "deal", "news"]), data: z.array(z.record(z.any())), })).mutation(async ({ input }) => { return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;