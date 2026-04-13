const http = require("node:http");

const PORT = Number(process.env.PORT || 8080);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const CASE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    presentation_markdown: { type: "string" },
    fact_items: { type: "array", items: { type: "string" } },
    interpretation_items: { type: "array", items: { type: "string" } },
    hypothesis_items: { type: "array", items: { type: "string" } },
    missing_data: { type: "array", items: { type: "string" } },
    cautions: { type: "array", items: { type: "string" } },
    review_checklist: { type: "array", items: { type: "string" } },
    current_treatment_links: {
      type: "array",
      items: {
        type: "object",
        properties: {
          treatment: { type: "string" },
          target: { type: "string" },
          rationale: { type: "string" },
          precautions: { type: "string" }
        },
        required: ["treatment", "target", "rationale", "precautions"]
      }
    },
    evidence_insert_note: { type: "string" },
    confidence_note: { type: "string" }
  },
  required: [
    "title",
    "summary",
    "presentation_markdown",
    "fact_items",
    "interpretation_items",
    "hypothesis_items",
    "missing_data",
    "cautions",
    "review_checklist",
    "current_treatment_links",
    "evidence_insert_note",
    "confidence_note"
  ]
};

const EVIDENCE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    review_markdown: { type: "string" },
    pico: {
      type: "object",
      properties: {
        p: { type: "string" },
        i: { type: "string" },
        c: { type: "string" },
        o: { type: "string" }
      },
      required: ["p", "i", "c", "o"]
    },
    search_terms_ja: { type: "array", items: { type: "string" } },
    search_terms_en: { type: "array", items: { type: "string" } },
    required_questions: { type: "array", items: { type: "string" } },
    important_missing: { type: "array", items: { type: "string" } },
    supplemental_missing: { type: "array", items: { type: "string" } },
    pubmed_query: { type: "string" },
    appraisal_focus: { type: "array", items: { type: "string" } },
    applicability_notes: { type: "array", items: { type: "string" } },
    missing_data: { type: "array", items: { type: "string" } },
    cautions: { type: "array", items: { type: "string" } },
    review_checklist: { type: "array", items: { type: "string" } },
    learning_points: { type: "array", items: { type: "string" } },
    next_actions: { type: "array", items: { type: "string" } }
  },
  required: [
    "title",
    "summary",
    "review_markdown",
    "pico",
    "search_terms_ja",
    "search_terms_en",
    "required_questions",
    "important_missing",
    "supplemental_missing",
    "pubmed_query",
    "appraisal_focus",
    "applicability_notes",
    "missing_data",
    "cautions",
    "review_checklist",
    "learning_points",
    "next_actions"
  ]
};

const REHAB_CHAT_SCHEMA = {
  type: "object",
  properties: {
    room_title: { type: "string" },
    reply_markdown: { type: "string" },
    quick_replies: { type: "array", items: { type: "string" } },
    follow_up_questions: { type: "array", items: { type: "string" } },
    red_flags: { type: "array", items: { type: "string" } },
    home_program_ideas: { type: "array", items: { type: "string" } },
    safety_note: { type: "string" }
  },
  required: [
    "room_title",
    "reply_markdown",
    "quick_replies",
    "follow_up_questions",
    "red_flags",
    "home_program_ideas",
    "safety_note"
  ]
};

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/healthz" && req.method === "GET") {
    json(res, 200, { ok: true, service: "pt-case-draft-api", hasGeminiKey: Boolean(GEMINI_API_KEY) });
    return;
  }

  if (req.url !== "/api/pt-case-draft" && req.url !== "/api/rehab-chat") {
    json(res, 404, { error: "not-found" });
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "method-not-allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    if (req.url === "/api/rehab-chat") {
      const chatInput = normalizeChatInput(body || {});
      const validation = validateChatInput(chatInput);
      const piiIssues = detectChatPiiIssues(chatInput);

      if (validation.length) {
        json(res, 400, { error: "invalid-input", validation });
        return;
      }

      if (piiIssues.length) {
        json(res, 400, { error: "pii-detected", piiIssues });
        return;
      }

      if (!GEMINI_API_KEY) {
        json(res, 503, {
          error: "gemini-key-missing",
          fallback: buildLocalRehabChat(chatInput)
        });
        return;
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL_NAME + ":generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
          },
          body: JSON.stringify(buildRehabChatPayload(chatInput))
        }
      );

      const data = await response.json();
      if (!response.ok) {
        json(res, 502, {
          error: "gemini-request-failed",
          detail: extractGeminiError(data),
          fallback: buildLocalRehabChat(chatInput)
        });
        return;
      }

      const parsed = JSON.parse(extractGeminiText(data));
      json(res, 200, {
        source: "gemini",
        generatedAt: new Date().toISOString(),
        normalized: chatInput,
        result: parsed
      });
      return;
    }

    const input = normalizeInput(body || {});
    const validation = input.feature === "evidence_review" ? validateEvidenceInput(input) : validateCaseInput(input);
    const piiIssues = detectPiiIssues(input);

    if (validation.length) {
      json(res, 400, { error: "invalid-input", validation });
      return;
    }

    if (piiIssues.length) {
      json(res, 400, { error: "pii-detected", piiIssues });
      return;
    }

    if (!GEMINI_API_KEY) {
      json(res, 503, {
        error: "gemini-key-missing",
        fallback: input.feature === "evidence_review" ? buildLocalEvidenceReview(input) : buildLocalCaseDraft(input)
      });
      return;
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL_NAME + ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify(buildGeminiPayload(input))
      }
    );

    const data = await response.json();
    if (!response.ok) {
      json(res, 502, {
        error: "gemini-request-failed",
        detail: extractGeminiError(data),
        fallback: input.feature === "evidence_review" ? buildLocalEvidenceReview(input) : buildLocalCaseDraft(input)
      });
      return;
    }

    const parsed = JSON.parse(extractGeminiText(data));
    json(res, 200, {
      feature: input.feature,
      profession: input.profession,
      mode: input.mode,
      source: "gemini",
      generatedAt: new Date().toISOString(),
      normalized: input,
      result: parsed
    });
  } catch (error) {
    json(res, 500, {
      error: "internal-error",
      message: error instanceof Error ? error.message : "unknown-error"
    });
  }
});

server.listen(PORT, () => {
  console.log("pt-case-draft-api listening on", PORT);
});

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("invalid-json"));
      }
    });
    req.on("error", reject);
  });
}

function normalizeInput(body) {
  const feature = body.feature === "evidence_review" ? "evidence_review" : "case_draft";
  const profession = body.profession === "ot" ? "ot" : "pt";
  const mode = body.mode === "final" ? "final" : "initial";
  const fields = body && typeof body.fields === "object" ? body.fields : {};
  const normalizedFields = {};
  Object.keys(fields).forEach((key) => {
    normalizedFields[key] = sanitizeText(fields[key], 4000);
  });
  const linkedEvidence = body.linkedEvidence && typeof body.linkedEvidence === "object"
    ? {
        title: sanitizeText(body.linkedEvidence.title, 400),
        summary: sanitizeText(body.linkedEvidence.summary, 3000),
        review_markdown: sanitizeText(body.linkedEvidence.review_markdown, 6000)
      }
    : null;
  return { feature, profession, mode, fields: normalizedFields, linkedEvidence };
}

function sanitizeText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function normalizeChatInput(body) {
  const profile = body && typeof body.profile === "object" ? body.profile : {};
  const room = body && typeof body.room === "object" ? body.room : {};
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  return {
    profile: {
      profession: profile.profession === "ot" ? "ot" : "pt",
      targetPerson: sanitizeChatTarget(profile.targetPerson),
      displayName: sanitizeText(profile.displayName, 80)
    },
    room: {
      title: sanitizeText(room.title, 120)
    },
    messages: messages.slice(-16).map((item) => ({
      role: item && item.role === "assistant" ? "assistant" : "user",
      content: sanitizeText(item?.content, 3000)
    })).filter((item) => item.content)
  };
}

function sanitizeChatTarget(value) {
  const allowed = new Set(["clinical", "home_program", "family_explanation", "documentation"]);
  return allowed.has(value) ? value : "clinical";
}

function validateCaseInput(input) {
  const required = ["diagnosis", "timing", "chiefComplaint", "findings"];
  return required.filter((field) => !input.fields[field]).map((field) => field + " is required");
}

function validateEvidenceInput(input) {
  const required = ["evClinicalQuestion", "evTargetProblem", "evCandidateIntervention"];
  return required.filter((field) => !input.fields[field]).map((field) => field + " is required");
}

function validateChatInput(input) {
  if (!input.messages.length) {
    return ["messages is required"];
  }
  const lastUserMessage = [...input.messages].reverse().find((item) => item.role === "user");
  if (!lastUserMessage) {
    return ["at least one user message is required"];
  }
  return [];
}

function detectPiiIssues(input) {
  const issues = [];
  const patterns = [
    { label: "具体的な日付らしき表現", regex: /\b(19|20)\d{2}[\/\-年](0?[1-9]|1[0-2])[\/\-月](0?[1-9]|[12]\d|3[01])日?\b/ },
    { label: "電話番号らしき表現", regex: /\b0\d{1,4}-\d{1,4}-\d{4}\b/ },
    { label: "メールアドレスらしき表現", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
    { label: "病院名・施設名らしき表現", regex: /[一-龠ぁ-んァ-ヶA-Za-z0-9]+(病院|医院|クリニック|センター|施設)/ },
    { label: "氏名らしき敬称つき表現", regex: /[一-龠]{1,4}(さん|様|氏|先生)/ }
  ];
  Object.entries(input.fields).forEach(([field, value]) => {
    patterns.forEach((pattern) => {
      if (value && pattern.regex.test(value)) {
        issues.push(field + ": " + pattern.label);
      }
    });
  });
  return Array.from(new Set(issues));
}

function detectChatPiiIssues(input) {
  const fields = {};
  input.messages.forEach((item, index) => {
    fields["message_" + index] = item.content;
  });
  return detectPiiIssues({ fields });
}

function buildGeminiPayload(input) {
  return {
    system_instruction: {
      parts: [{ text: buildSystemInstruction(input) }]
    },
    contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: input.feature === "evidence_review" ? EVIDENCE_SCHEMA : CASE_SCHEMA
    }
  };
}

function buildSystemInstruction(input) {
  const profession = input.profession === "ot" ? "occupational therapy" : "physical therapy";
  if (input.feature === "evidence_review") {
    return [
      "You are helping draft an evidence review in Japanese for " + profession + ".",
      "This is clinical support only and not final clinical judgment.",
      "Keep facts, limitations, and hypotheses separate.",
      "Do not invent patient-identifying details.",
      "Use the EBPT 5-step flow in Japanese.",
      "First normalize the case into a standard worksheet-style template.",
      "Then separate missing information into required, important, and supplemental.",
      "Ask at most 3 required items first, but still produce a provisional PICO when possible.",
      "Include Japanese and English search terms, one PubMed query, appraisal points, cautious application, and a post-application evaluation plan.",
      "End with short learning points and short next steps for self-study.",
      "Recommendations must remain cautious and conditional."
    ].join(" ");
  }
  return [
    "You are helping draft a case presentation in Japanese for " + profession + ".",
    "This is clinical support only and not final clinical judgment.",
    "Do not invent patient-identifying details.",
    "Keep facts separate from interpretations and hypotheses.",
    "If linked evidence is provided, integrate it cautiously into the treatment rationale and discussion.",
    "Always include a human review checklist and highlight precautions."
  ].join(" ");
}

function buildPrompt(input) {
  return input.feature === "evidence_review" ? buildEvidencePrompt(input) : buildCasePrompt(input);
}

function buildRehabChatPayload(input) {
  return {
    system_instruction: {
      parts: [{ text: buildRehabChatSystemInstruction(input) }]
    },
    contents: [{ role: "user", parts: [{ text: buildRehabChatPrompt(input) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: REHAB_CHAT_SCHEMA
    }
  };
}

function buildRehabChatSystemInstruction(input) {
  const profession = input.profile.profession === "ot" ? "occupational therapy" : "physical therapy";
  return [
    "You are a Japanese rehab consultation assistant for " + profession + ".",
    "You are warm, practical, and concise.",
    "This is clinical support only and not final clinical judgment.",
    "Never present a diagnosis or medical certainty you do not have.",
    "Do not invent patient-identifying details.",
    "Keep the tone similar to a supportive senior therapist in a chat room.",
    "Answer the user's latest message while using prior messages for context.",
    "When information is missing, ask a few focused follow-up questions rather than pretending certainty.",
    "If the topic suggests risk, list red flags and safety steps clearly.",
    "If the user asks for patient-facing wording or home program wording, use plain Japanese.",
    "Return short sections in markdown that fit a chat response."
  ].join(" ");
}

function buildRehabChatPrompt(input) {
  const profile = input.profile;
  const conversation = input.messages.map((item) => {
    const role = item.role === "assistant" ? "assistant" : "user";
    return role + ": " + item.content;
  }).join("\n\n");
  const targetLabel = {
    clinical: "症例相談",
    home_program: "自主練習相談",
    family_explanation: "家族説明",
    documentation: "記録の言い換え"
  }[profile.targetPerson] || "症例相談";
  return [
    "以下は匿名化されたリハビリ相談チャットです。",
    "職種: " + (profile.profession === "ot" ? "OT" : "PT"),
    "相談モード: " + targetLabel,
    "現在のルームタイトル: " + orUnknown(input.room.title),
    "会話履歴:",
    conversation,
    "",
    "次のJSON項目を返してください。",
    "- room_title: 会話内容に合う短いタイトル",
    "- reply_markdown: チャット欄にそのまま返す本文。必要なら「整理」「追加確認」「進め方」など短い見出しを使う",
    "- quick_replies: 続けて送りやすい短文を3つまで",
    "- follow_up_questions: 追加で確認したいことを3つまで",
    "- red_flags: 赤旗・禁忌・受診相談の必要性があれば簡潔に",
    "- home_program_ideas: 自主練習や説明の言い換え案があれば3つまで。不要なら空配列",
    "- safety_note: 最後に1文で安全メモ",
    "",
    "相談モード別の優先:",
    "- 症例相談: 主問題、評価の抜け、治療方針のたたき台",
    "- 自主練習相談: 患者向けの平易な言葉、中止基準、回数や頻度は断定しすぎない",
    "- 家族説明: 不安をあおらず、見通しと注意点を短く",
    "- 記録の言い換え: 専門職向けに簡潔で曖昧すぎない表現"
  ].join("\n");
}

function buildCasePrompt(input) {
  const f = input.fields;
  const professionJa = input.profession === "ot" ? "作業療法" : "理学療法";
  const evidenceBlock = input.linkedEvidence && (input.linkedEvidence.summary || input.linkedEvidence.review_markdown)
    ? [
        "",
        "差し込みたい Evidence Review:",
        "タイトル: " + orUnknown(input.linkedEvidence.title),
        "要約: " + orUnknown(input.linkedEvidence.summary),
        "本文: " + orUnknown(input.linkedEvidence.review_markdown)
      ].join("\n")
    : "";

  return [
    `以下の匿名化症例情報から、${professionJa}の${input.mode === "final" ? "最終発表" : "初回評価発表"}ドラフトを日本語で作成してください。`,
    "事実・解釈・仮説を分け、不足情報を明示してください。",
    "Evidence Review がある場合は、治療方針や考察に慎重に差し込んでください。",
    "",
    "症例情報:",
    "診断名: " + orUnknown(f.diagnosis),
    "年齢帯 / 性別: " + orUnknown(f.ageBand) + " / " + orUnknown(f.sex),
    "時期情報: " + orUnknown(f.timing),
    "診療設定: " + orUnknown(f.setting),
    "主訴: " + orUnknown(f.chiefComplaint),
    "患者目標: " + orUnknown(f.patientGoal),
    "療法士 / 療法目標: " + orUnknown(f.therapistGoal),
    "ADL・活動制限: " + orUnknown(f.adl),
    "参加制約: " + orUnknown(f.participation),
    "主要所見: " + orUnknown(f.findings),
    "生活背景: " + orUnknown(f.background),
    "現在の治療: " + orUnknown(f.currentTreatment),
    "想定する治療方針: " + orUnknown(f.proposedPlan),
    "初期評価要約: " + orUnknown(f.initialSummary),
    "実施した治療: " + orUnknown(f.interventions),
    "治療期間: " + orUnknown(f.period),
    "頻度: " + orUnknown(f.frequency),
    "経過: " + orUnknown(f.progress),
    "再評価結果: " + orUnknown(f.reassessment),
    "改善点: " + orUnknown(f.improved),
    "残存問題: " + orUnknown(f.remaining),
    "今後の課題: " + orUnknown(f.nextSteps),
    "注意点・禁忌: " + orUnknown(f.precautions),
    evidenceBlock
  ].join("\n");
}

function buildEvidencePrompt(input) {
  const f = input.fields;
  const professionJa = input.profession === "ot" ? "作業療法" : "理学療法";
  return [
    `以下の匿名化症例情報から、${professionJa}のEBPT 5ステップに沿った Evidence Review を日本語で作成してください。`,
    "まず症例情報を標準テンプレに整理し、不足情報は「必須・重要・補足」に分けてください。",
    "必須は3項目まで先に聞く形で示しつつ、分かる範囲で暫定PICOを作成してください。",
    "そのうえで、検索キーワード、日本語・英語の検索語、PubMed検索式、批判的吟味の視点、臨床応用、適用後の評価計画まで示してください。",
    "最後に「今回の学習ポイント」と「次に自分でやるなら」を短く付けてください。",
    "出力の review_markdown には、少なくとも次の見出しを順に含めてください: 1. 臨床疑問 / 2. 標準テンプレ整理 / 3. 不足情報の優先度 / 4. 暫定PICO / 5. 検索キーワード案 / 6. PubMed検索式 / 7. 批判的吟味の視点 / 8. 臨床応用 / 9. 適用後の評価計画 / 10. 事実 / 不足情報 / 仮説 / 11. 今回の学習ポイント / 12. 次に自分でやるなら",
    "不足情報の優先度は、required_questions, important_missing, supplemental_missing にも対応させてください。",
    "PubMed検索式は pubmed_query に短く再掲してください。",
    "批判的吟味の視点は appraisal_focus に、学習ポイントは learning_points に、次の行動は next_actions に要約してください。",
    "結論は控えめで、適用可能性と不確実性を明示してください。",
    "",
    "入力:",
    "臨床疑問: " + orUnknown(f.evClinicalQuestion),
    "対象となる問題: " + orUnknown(f.evTargetProblem),
    "検討したい介入: " + orUnknown(f.evCandidateIntervention),
    "比較対象: " + orUnknown(f.evComparison),
    "見たいアウトカム: " + orUnknown(f.evDesiredOutcome),
    "時間軸: " + orUnknown(f.evTimeframe),
    "症例要約: " + orUnknown(f.evCaseSummary),
    "論文・抄録メモ: " + orUnknown(f.evProvidedPaper),
    "メモ: " + orUnknown(f.evNotes),
    "",
    "標準テンプレの整理先:",
    "基本情報: 年齢帯 / 性別 / 診断名 / 発症・受傷・術後時期 / 設定",
    "現在の主問題: 主訴 / 活動制限 / 参加制約 / 患者の目標・希望",
    "理学療法評価: 重症度 / 疼痛 / ROM / 筋力 / 歩行・移動能力 / バランス / 持久性 / 感覚 / 認知・高次脳機能 / その他重要所見",
    "検討したい介入: 介入案 / 比較対象 / 期待するアウトカム / 評価したい期間",
    "安全性と実施条件: 併存疾患 / 禁忌・注意点 / 使用可能な機器 / スタッフ体制 / 患者の同意・受容"
  ].join("\n");
}

function orUnknown(value) {
  return value || "不明";
}

function extractGeminiText(data) {
  const part = data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0];
  if (!part || typeof part.text !== "string") {
    throw new Error("Gemini response text was empty");
  }
  return part.text;
}

function extractGeminiError(data) {
  return data && data.error && data.error.message ? data.error.message : "Gemini API returned an unknown error";
}

function buildLocalCaseDraft(input) {
  const f = input.fields;
  const professionJa = input.profession === "ot" ? "作業療法" : "理学療法";
  const evidenceNote = input.linkedEvidence && input.linkedEvidence.summary
    ? "Evidence Review差し込み: " + input.linkedEvidence.summary
    : "未差し込み";
  return {
    title: `${professionJa}${input.mode === "final" ? "最終発表" : "初回評価発表"}ドラフト`,
    summary: "API未設定時または障害時のローカル下書きです。",
    presentation_markdown: [
      `# ${input.mode === "final" ? "最終発表" : "初回評価発表"}ドラフト`,
      "",
      "## 基本情報",
      "- 診断名: " + orUnknown(f.diagnosis),
      "- 年齢帯 / 性別: " + orUnknown(f.ageBand) + " / " + orUnknown(f.sex),
      "- 時期情報: " + orUnknown(f.timing),
      "- 診療設定: " + orUnknown(f.setting),
      "",
      "## 主問題",
      "- 主訴: " + orUnknown(f.chiefComplaint),
      "- ADL / 活動制限: " + orUnknown(f.adl),
      "- 参加制約: " + orUnknown(f.participation),
      "",
      "## 主要所見",
      orUnknown(f.findings),
      "",
      "## Evidence差し込みメモ",
      evidenceNote
    ].join("\n"),
    fact_items: [f.diagnosis, f.timing, f.chiefComplaint, f.findings].filter(Boolean),
    interpretation_items: ["問題点と目標の対応づけは発表前に確認が必要です。"],
    hypothesis_items: ["主要所見と活動制限のつながりを整理すると考察が明確になります。"],
    missing_data: ["currentTreatment", "patientGoal", "precautions"].filter((key) => !f[key]),
    cautions: [f.precautions || "禁忌・術後制限・リスク情報の再確認が必要です。"],
    review_checklist: [
      "匿名化が十分か確認する",
      "事実と解釈が混在していないか確認する",
      "禁忌と負荷量を再確認する"
    ],
    current_treatment_links: (f.currentTreatment || "").split(/\n+/).filter(Boolean).map((item) => ({
      treatment: item,
      target: f.findings || "所見との対応を確認",
      rationale: "この症例での狙いを発表前に言語化してください。",
      precautions: f.precautions || "疼痛・過負荷・禁忌を確認してください。"
    })),
    evidence_insert_note: evidenceNote,
    confidence_note: "テンプレートベースの暫定ドラフトです。"
  };
}

function buildLocalEvidenceReview(input) {
  const f = input.fields;
  const profession = input.profession === "ot" ? "OT" : "PT";
  const requiredQuestions = [
    !f.evCaseSummary ? "症例要約を標準テンプレで埋めるための情報" : "",
    !f.evDesiredOutcome ? "見たいアウトカム" : "",
    !f.evTimeframe ? "評価したい期間" : ""
  ].filter(Boolean).slice(0, 3);
  return {
    title: `${profession} Evidence Review`,
    summary: "API未設定時または障害時のローカルレビューです。",
    review_markdown: [
      "# 1. 臨床疑問",
      orUnknown(f.evClinicalQuestion),
      "",
      "# 2. 標準テンプレ整理",
      "## 基本情報",
      "- 年齢帯: 不明",
      "- 性別: 不明",
      "- 診断名: " + orUnknown(f.evTargetProblem),
      "- 発症・受傷・術後時期: " + orUnknown(f.evTimeframe),
      "- 設定: 不明",
      "",
      "## 現在の主問題",
      "- 主訴: " + orUnknown(f.evTargetProblem),
      "- 活動制限: " + orUnknown(f.evCaseSummary),
      "- 参加制約: 不明",
      "- 患者の目標・希望: 不明",
      "",
      "# 3. 不足情報の優先度",
      "## 必須",
      ...(requiredQuestions.length ? requiredQuestions.map((item, index) => `${index + 1}. ${item}`) : ["1. 追加の必須確認項目はありません"]),
      "",
      "## 重要",
      "- 比較対象",
      "- 安全性・禁忌",
      "- 重症度や主要所見",
      "",
      "## 補足",
      "- 使用可能な機器",
      "- スタッフ体制",
      "- 患者の同意・受容",
      "",
      "# 4. 暫定PICO",
      "- P: " + orUnknown(f.evCaseSummary || f.evTargetProblem),
      "- I: " + orUnknown(f.evCandidateIntervention),
      "- C: " + orUnknown(f.evComparison),
      "- O: " + orUnknown(f.evDesiredOutcome),
      "",
      "# 5. 検索キーワード案",
      "- 日本語: " + [f.evTargetProblem, f.evCandidateIntervention, f.evDesiredOutcome].filter(Boolean).join(" / "),
      "- 英語: rehabilitation / intervention / outcome",
      "",
      "# 6. PubMed検索式",
      `("${orUnknown(f.evTargetProblem).replaceAll('"', "")}"[Title/Abstract] OR rehabilitation[Title/Abstract]) AND ("${orUnknown(f.evCandidateIntervention).replaceAll('"', "")}"[Title/Abstract])`,
      "",
      "# 7. 批判的吟味の視点",
      "- まず研究デザインを確認する",
      "- 症例との一致度と安全性を確認する",
      "- 統計的有意差と臨床的意義を分けて考える",
      "",
      "# 8. 臨床応用",
      "- 症例との一致度と安全性を確認したうえで適用を検討する",
      "",
      "# 9. 適用後の評価計画",
      "- 何を、いつ、どう再評価するかを決める",
      "",
      "# 10. 事実 / 不足情報 / 仮説",
      "- 事実: " + orUnknown(f.evCaseSummary || f.evTargetProblem),
      "- 不足情報: 比較対象、評価指標、安全性",
      "- 仮説: 候補介入が活動や参加の改善につながる可能性がある",
      "",
      "# 11. 今回の学習ポイント",
      "- 暫定PICOでも検索の出発点は作れる",
      "",
      "# 12. 次に自分でやるなら",
      "- 必須3項目を埋めてPubMed検索を回してみる"
    ].join("\n"),
    pico: {
      p: orUnknown(f.evCaseSummary || f.evTargetProblem),
      i: orUnknown(f.evCandidateIntervention),
      c: orUnknown(f.evComparison),
      o: orUnknown(f.evDesiredOutcome)
    },
    search_terms_ja: [f.evTargetProblem, f.evCandidateIntervention, f.evDesiredOutcome].filter(Boolean),
    search_terms_en: ["rehabilitation", "intervention", "outcome"],
    required_questions: requiredQuestions,
    important_missing: ["比較対象", "安全性・禁忌", "重症度や主要所見"],
    supplemental_missing: ["使用可能な機器", "スタッフ体制", "患者の同意・受容"],
    pubmed_query: `("${orUnknown(f.evTargetProblem).replaceAll('"', "")}"[Title/Abstract] OR rehabilitation[Title/Abstract]) AND ("${orUnknown(f.evCandidateIntervention).replaceAll('"', "")}"[Title/Abstract])`,
    appraisal_focus: [
      "まず研究デザインを確認する",
      "症例との一致度と安全性を確認する",
      "統計的有意差と臨床的意義を分けて考える"
    ],
    applicability_notes: ["症例との一致度と安全性を確認してください。"],
    missing_data: ["evComparison", "evDesiredOutcome", "evTimeframe"].filter((key) => !f[key]),
    cautions: ["文献の結論をそのまま適用せず、症例適用性を確認してください。"],
    review_checklist: [
      "PICO が狭すぎないか確認する",
      "症例との一致度を確認する",
      "統計的有意差と臨床的意義を分けて考える"
    ],
    learning_points: [
      "不足情報は必須・重要・補足に分けると優先順位をつけやすい",
      "検索前に暫定PICOを作ると検索語が安定する"
    ],
    next_actions: [
      "必須3項目を埋める",
      "二次文献から検索を始める"
    ]
  };
}

function buildLocalRehabChat(input) {
  const latestUserMessage = [...input.messages].reverse().find((item) => item.role === "user");
  const targetLabel = {
    clinical: "症例相談",
    home_program: "自主練習相談",
    family_explanation: "家族説明",
    documentation: "記録の言い換え"
  }[input.profile.targetPerson] || "症例相談";
  const summaryLine = latestUserMessage ? latestUserMessage.content.slice(0, 120) : "相談内容";
  const isHomeProgram = input.profile.targetPerson === "home_program";
  const isFamily = input.profile.targetPerson === "family_explanation";
  const isDocumentation = input.profile.targetPerson === "documentation";

  const reply = [
    `# ${targetLabel}の整理メモ`,
    "",
    "## いま見えていること",
    `- 相談テーマ: ${summaryLine}`,
    `- モード: ${targetLabel}`,
    `- 職種: ${input.profile.profession === "ot" ? "OT" : "PT"}`,
    "",
    "## 次に考えやすい順番",
    isHomeProgram
      ? "- まず実施目的、やり方、やめる目安の3点を患者さん向けの言葉でそろえる"
      : isFamily
        ? "- まず現在の状態、できていること、注意点を短く分けて伝える"
        : isDocumentation
          ? "- まず事実、解釈、今後の方針を混ぜずに分ける"
          : "- まず主問題、主要所見、追加で確認したい評価を3つ以内に絞る",
    "- 不確かな点は断定せず、追加確認項目として分ける",
    "",
    "## ひとことメモ",
    isHomeProgram
      ? "患者さん向けなら、専門用語を減らしつつ中止基準を必ず添えると安全です。"
      : isFamily
        ? "家族説明では、無理のない見通しと注意点を同じ文量で伝えると受け止めやすくなります。"
        : isDocumentation
          ? "記録では評価所見と介入の狙いの対応が見える形にすると読みやすくなります。"
          : "症例相談では、何を決めたいかを一文で置くと臨床推論が進めやすくなります。"
  ].join("\n");

  return {
    room_title: input.room.title || targetLabel,
    reply_markdown: reply,
    quick_replies: isHomeProgram
      ? ["患者さん向けの言い回しに直してください。", "中止基準も足してください。"]
      : isFamily
        ? ["家族向けにもっと短くしてください。", "不安をあおらない表現にしてください。"]
        : isDocumentation
          ? ["SOAPっぽく整えてください。", "もう少し簡潔にしてください。"]
          : ["追加評価を3つに絞ってください。", "治療方針のたたき台もください。"],
    follow_up_questions: isHomeProgram
      ? ["どの動作を楽にしたいですか。", "痛みや中止基準はありますか。"]
      : ["いちばん困っている活動は何ですか。", "主要所見で数値化できているものはありますか。", "禁忌や術後制限はありますか。"],
    red_flags: ["疼痛増悪、転倒リスク、術後制限、循環器症状があれば優先して確認してください。"],
    home_program_ideas: isHomeProgram || isFamily
      ? ["回数より先に『楽に・安全に』を強調する", "痛みや息切れが強まったら中止と伝える", "できた量を短く記録してもらう"]
      : [],
    safety_note: "この返答は臨床判断のたたき台です。赤旗、禁忌、負荷量は必ず担当療法士が確認してください。"
  };
}
