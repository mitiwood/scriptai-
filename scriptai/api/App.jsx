import { useState, useRef, useEffect } from "react";

const PLATFORMS = [
  {
    id: "YouTube Shorts",
    icon: "▶",
    color: "#ff0000",
    bg: "rgba(255,0,0,0.12)",
  },
  {
    id: "Instagram Reels",
    icon: "◉",
    color: "#e1306c",
    bg: "rgba(225,48,108,0.12)",
  },
  { id: "TikTok", icon: "♪", color: "#69c9d0", bg: "rgba(105,201,208,0.12)" },
];

const TONES = [
  { emoji: "😂", label: "유머" },
  { emoji: "📚", label: "정보" },
  { emoji: "💛", label: "감성" },
  { emoji: "🔥", label: "열정" },
  { emoji: "✨", label: "트렌디" },
  { emoji: "😱", label: "반전" },
];

const CATEGORIES = [
  "라이프스타일",
  "음식/맛집",
  "뷰티/패션",
  "운동/헬스",
  "재테크",
  "여행",
  "IT/테크",
  "교육",
  "엔터테인먼트",
  "게임",
];

const SECTION_META = [
  { key: "HOOK", color: "#ff3d5a", emoji: "🎣", label: "HOOK", sub: "첫 3초" },
  { key: "BODY", color: "#4d9fff", emoji: "📖", label: "BODY", sub: "본문" },
  { key: "CTA", color: "#00d97e", emoji: "📢", label: "CTA", sub: "마무리" },
  {
    key: "해시태그",
    color: "#ff8c42",
    emoji: "#️⃣",
    label: "TAG",
    sub: "해시태그",
  },
];

function parseScript(text) {
  const result = {};
  SECTION_META.forEach((s) => (result[s.key] = []));
  let cur = null;
  for (const line of text.split("\n")) {
    const t = line.trim();
    for (const s of SECTION_META) {
      if (
        t.includes(s.key) &&
        (t.includes(":") || t.includes("—") || t.includes("-"))
      ) {
        cur = s.key;
        break;
      }
    }
    if (cur) {
      const isHeader = SECTION_META.some(
        (s) =>
          t.includes(s.key) &&
          (t.includes(":") || t.includes("—") || t.includes("-")),
      );
      if (!isHeader && t) result[cur].push(t);
    }
  }
  return result;
}

// ── Bottom Sheet Component ──
function BottomSheet({ open, onClose, title, children }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 200,
            backdropFilter: "blur(4px)",
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: "#1a1b1f",
          borderRadius: "20px 20px 0 0",
          border: "1px solid #2e3038",
          borderBottom: "none",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "12px 20px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              background: "#3a3d45",
              borderRadius: 2,
              marginBottom: 16,
            }}
          />
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 16,
              borderBottom: "1px solid #2e3038",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f0eee8" }}>
              {title}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "#2e3038",
                border: "none",
                color: "#6b6e78",
                width: 28,
                height: 28,
                borderRadius: "50%",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 40px" }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Step indicator ──
function Steps({ current }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "0 20px",
        marginBottom: 24,
      }}
    >
      {[1, 2, 3].map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              background: current >= s ? "#ff3d5a" : "#1a1b1f",
              border: `2px solid ${current >= s ? "#ff3d5a" : "#2e3038"}`,
              color: current >= s ? "#fff" : "#3a3d45",
              transition: "all 0.3s",
            }}
          >
            {s}
          </div>
          {i < 2 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: current > s ? "#ff3d5a" : "#2e3038",
                transition: "background 0.3s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ScriptAIMobile() {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState("YouTube Shorts");
  const [tone, setTone] = useState("유머");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("라이프스타일");
  const [duration, setDuration] = useState("60초");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [catSheet, setCatSheet] = useState(false);
  const [durSheet, setDurSheet] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const topRef = useRef(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    setRawText("");
    setStep(3);

    const toneLabel = TONES.find((t) => t.label === tone)?.label || tone;
    const bodyPoints =
      duration === "30초" ? "2~3" : duration === "60초" ? "3~5" : "5~7";

    const prompt = `당신은 유튜브 쇼츠, 인스타그램 릴스, 틱톡 전문 스크립트 작가입니다.
다음 조건으로 바이럴 가능성이 높은 쇼츠 스크립트를 작성해주세요.

[조건]
- 플랫폼: ${platform}
- 주제/키워드: ${topic}
- 채널 카테고리: ${category}
- 영상 길이: ${duration}
- 톤 & 스타일: ${toneLabel}
${extra ? `- 추가 요청: ${extra}` : ""}

[출력 형식]

🎣 HOOK (0~3초):
[첫 3초 훅]

📖 BODY (본문):
[${bodyPoints}개 포인트]

📢 CTA (마무리):
[자연스러운 마무리]

#️⃣ 해시태그:
[최적화 해시태그 10개]

구어체로 자연스럽게. 스크립트만 출력.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error?.message || `오류 ${res.status}`);
      }
      const data = await res.json();
      const text = data.content[0]?.text || "";
      setRawText(text);
      const parsed = parseScript(text);
      const hasContent = SECTION_META.some(
        (s) => (parsed[s.key] || []).length > 0,
      );
      setResult(hasContent ? parsed : null);
      setActiveSection(SECTION_META[0].key);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copySection = (key, content) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(rawText);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setRawText("");
    setError("");
    setTopic("");
    setExtra("");
  };

  const selPlatform = PLATFORMS.find((p) => p.id === platform);

  return (
    <div
      style={{
        background: "#08090a",
        minHeight: "100vh",
        color: "#f0eee8",
        fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Status bar area */}
      <div style={{ height: 8, background: "#08090a" }} />

      {/* Header */}
      <div
        style={{
          padding: "12px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#ff3d5a",
              clipPath:
                "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            S
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: 1,
                lineHeight: 1.1,
              }}
            >
              Script<span style={{ color: "#ff3d5a" }}>AI</span>
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#3a3d45",
                letterSpacing: 2,
                fontFamily: "monospace",
              }}
            >
              SHORTS GENERATOR
            </div>
          </div>
        </div>
        {step === 3 && (result || error) && (
          <button
            onClick={reset}
            style={{
              background: "#1a1b1f",
              border: "1px solid #2e3038",
              color: "#6b6e78",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            + 새로 만들기
          </button>
        )}
        {step < 3 && (
          <div
            style={{
              fontSize: 10,
              color: "#00d97e",
              background: "rgba(0,217,126,0.1)",
              border: "1px solid rgba(0,217,126,0.2)",
              padding: "4px 10px",
              borderRadius: 20,
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#00d97e",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            LIVE
          </div>
        )}
      </div>

      {/* ── STEP 1 & 2: INPUT ── */}
      {step <= 2 && (
        <div style={{ padding: "28px 0 120px" }}>
          <div style={{ padding: "0 20px", marginBottom: 28 }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              {step === 1
                ? "어떤 영상을\n만들건가요?"
                : "세부 설정을\n완성해요"}
            </div>
            <div style={{ fontSize: 13, color: "#6b6e78" }}>
              {step === 1
                ? "플랫폼과 주제를 입력하세요"
                : "카테고리, 길이, 톤을 선택하세요"}
            </div>
          </div>

          <Steps current={step} />

          {step === 1 && (
            <div
              style={{
                padding: "0 20px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {/* Platform */}
              <div>
                <div style={labelSt}>플랫폼</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      style={{
                        flex: 1,
                        padding: "14px 8px",
                        borderRadius: 14,
                        background: platform === p.id ? p.bg : "#1a1b1f",
                        border: `2px solid ${platform === p.id ? p.color : "transparent"}`,
                        color: platform === p.id ? p.color : "#6b6e78",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{p.icon}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: 0.5,
                        }}
                      >
                        {p.id === "YouTube Shorts"
                          ? "Shorts"
                          : p.id === "Instagram Reels"
                            ? "Reels"
                            : "TikTok"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <div style={labelSt}>
                  주제 / 키워드 <span style={{ color: "#ff3d5a" }}>*</span>
                </div>
                <div style={{ position: "relative", marginTop: 10 }}>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="예) 직장인 점심 추천, 운동 동기부여…"
                    maxLength={100}
                    style={{
                      width: "100%",
                      background: "#1a1b1f",
                      border: "2px solid #2e3038",
                      color: "#f0eee8",
                      padding: "16px 48px 16px 16px",
                      fontSize: 15,
                      outline: "none",
                      borderRadius: 14,
                      fontFamily: "inherit",
                      WebkitAppearance: "none",
                    }}
                  />
                  {topic && (
                    <button
                      onClick={() => setTopic("")}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "#2e3038",
                        border: "none",
                        color: "#6b6e78",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#3a3d45",
                    marginTop: 6,
                    fontFamily: "monospace",
                    textAlign: "right",
                  }}
                >
                  {topic.length} / 100
                </div>
              </div>

              {/* Next */}
              <button
                onClick={() => topic.trim() && setStep(2)}
                style={{
                  width: "100%",
                  padding: 18,
                  borderRadius: 16,
                  background: topic.trim() ? "#ff3d5a" : "#1a1b1f",
                  color: topic.trim() ? "#fff" : "#3a3d45",
                  border: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: topic.trim() ? "pointer" : "not-allowed",
                  boxShadow: topic.trim()
                    ? "0 8px 32px rgba(255,61,90,0.4)"
                    : "none",
                  transition: "all 0.2s",
                }}
              >
                다음 단계 →
              </button>
            </div>
          )}

          {step === 2 && (
            <div
              style={{
                padding: "0 20px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Summary chip */}
              <div
                style={{
                  background: "#1a1b1f",
                  border: "1px solid #2e3038",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 20 }}>{selPlatform?.icon}</span>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#f0eee8" }}
                  >
                    {topic}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b6e78" }}>
                    {platform}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    marginLeft: "auto",
                    background: "transparent",
                    border: "none",
                    color: "#6b6e78",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  수정
                </button>
              </div>

              {/* Category */}
              <div>
                <div style={labelSt}>채널 카테고리</div>
                <button
                  onClick={() => setCatSheet(true)}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    background: "#1a1b1f",
                    border: "2px solid #2e3038",
                    color: "#f0eee8",
                    padding: "16px",
                    fontSize: 15,
                    borderRadius: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "inherit",
                  }}
                >
                  <span>{category}</span>
                  <span style={{ color: "#3a3d45" }}>▾</span>
                </button>
              </div>

              {/* Duration */}
              <div>
                <div style={labelSt}>영상 길이</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  {["30초", "60초", "90초"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      style={{
                        flex: 1,
                        padding: "14px 8px",
                        borderRadius: 14,
                        background:
                          duration === d ? "rgba(255,61,90,0.12)" : "#1a1b1f",
                        border: `2px solid ${duration === d ? "#ff3d5a" : "transparent"}`,
                        color: duration === d ? "#ff3d5a" : "#6b6e78",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>
                        {d === "30초" ? "⚡" : d === "60초" ? "🎯" : "📽"}
                      </div>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <div style={labelSt}>톤 & 스타일</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {TONES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setTone(t.label)}
                      style={{
                        padding: "14px 8px",
                        borderRadius: 14,
                        background:
                          tone === t.label ? "rgba(255,61,90,0.12)" : "#1a1b1f",
                        border: `2px solid ${tone === t.label ? "#ff3d5a" : "transparent"}`,
                        color: tone === t.label ? "#ff3d5a" : "#6b6e78",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>
                        {t.emoji}
                      </div>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra */}
              <div>
                <div style={labelSt}>
                  추가 요청 <span style={{ color: "#3a3d45" }}>(선택)</span>
                </div>
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="예) MZ 타겟, 친근한 말투…"
                  rows={3}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    background: "#1a1b1f",
                    border: "2px solid #2e3038",
                    color: "#f0eee8",
                    padding: "14px 16px",
                    fontSize: 14,
                    outline: "none",
                    borderRadius: 14,
                    resize: "none",
                    fontFamily: "inherit",
                    WebkitAppearance: "none",
                  }}
                />
              </div>

              {/* Generate */}
              <button
                onClick={generate}
                style={{
                  width: "100%",
                  padding: 18,
                  borderRadius: 16,
                  background: "#ff3d5a",
                  color: "#fff",
                  border: "none",
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(255,61,90,0.45)",
                  letterSpacing: 1,
                }}
              >
                ⚡ 스크립트 생성!
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: RESULT ── */}
      {step === 3 && (
        <div style={{ padding: "28px 20px 120px" }}>
          {/* Loading */}
          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 0",
                gap: 24,
              }}
            >
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "3px solid #1a1b1f",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "3px solid transparent",
                    borderTopColor: "#ff3d5a",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "50%",
                    transform: "translate(-50%,-50%)",
                    fontSize: 28,
                  }}
                >
                  ⚡
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  스크립트 생성 중...
                </div>
                <div
                  style={{ fontSize: 13, color: "#6b6e78", lineHeight: 1.7 }}
                >
                  AI가 바이럴 패턴을 분석하고
                  <br />
                  최적의 대본을 작성하고 있어요 ✨
                </div>
              </div>
              {/* Loading skeleton */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "100%",
                    background: "#1a1b1f",
                    borderRadius: 14,
                    padding: 16,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: 10,
                      background: "#2e3038",
                      borderRadius: 6,
                      width: "40%",
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 8,
                      background: "#2e3038",
                      borderRadius: 6,
                      width: "90%",
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 8,
                      background: "#2e3038",
                      borderRadius: 6,
                      width: "75%",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              style={{
                background: "rgba(255,61,90,0.08)",
                border: "1px solid rgba(255,61,90,0.3)",
                borderRadius: 14,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
              <div
                style={{
                  fontSize: 14,
                  color: "#ff3d5a",
                  fontFamily: "monospace",
                  lineHeight: 1.6,
                }}
              >
                {error}
              </div>
              <button
                onClick={generate}
                style={{
                  marginTop: 16,
                  background: "#ff3d5a",
                  border: "none",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Result */}
          {(result || rawText) && !loading && !error && (
            <>
              {/* Summary */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,61,90,0.15), rgba(77,159,255,0.08))",
                  border: "1px solid rgba(255,61,90,0.2)",
                  borderRadius: 16,
                  padding: "16px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#ff3d5a",
                      fontWeight: 700,
                      marginBottom: 2,
                    }}
                  >
                    ✅ 생성 완료!
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6e78" }}>
                    {platform} · {duration} · {tone}
                  </div>
                </div>
                <button
                  onClick={copyAll}
                  style={{
                    background:
                      copied === "all" ? "rgba(0,217,126,0.15)" : "#1a1b1f",
                    border: `1px solid ${copied === "all" ? "#00d97e" : "#2e3038"}`,
                    color: copied === "all" ? "#00d97e" : "#6b6e78",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {copied === "all" ? "✓ 복사됨" : "전체 복사"}
                </button>
              </div>

              {/* Section tabs */}
              {result && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 16,
                    overflowX: "auto",
                    paddingBottom: 4,
                  }}
                >
                  {SECTION_META.map((s) => {
                    const content = (result[s.key] || []).join("\n");
                    if (!content) return null;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        style={{
                          flexShrink: 0,
                          padding: "8px 16px",
                          borderRadius: 20,
                          background:
                            activeSection === s.key
                              ? s.color + "22"
                              : "#1a1b1f",
                          border: `1.5px solid ${activeSection === s.key ? s.color : "transparent"}`,
                          color: activeSection === s.key ? s.color : "#6b6e78",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span>{s.emoji}</span> {s.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active section content */}
              {result && activeSection && (
                <div
                  style={{
                    background: "#1a1b1f",
                    border: `2px solid ${SECTION_META.find((s) => s.key === activeSection)?.color}33`,
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      background:
                        SECTION_META.find((s) => s.key === activeSection)
                          ?.color + "15",
                      borderBottom: `1px solid ${SECTION_META.find((s) => s.key === activeSection)?.color}22`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 18 }}>
                        {
                          SECTION_META.find((s) => s.key === activeSection)
                            ?.emoji
                        }
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: SECTION_META.find(
                              (s) => s.key === activeSection,
                            )?.color,
                          }}
                        >
                          {
                            SECTION_META.find((s) => s.key === activeSection)
                              ?.label
                          }
                        </div>
                        <div style={{ fontSize: 10, color: "#6b6e78" }}>
                          {
                            SECTION_META.find((s) => s.key === activeSection)
                              ?.sub
                          }
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        copySection(
                          activeSection,
                          (result[activeSection] || []).join("\n"),
                        )
                      }
                      style={{
                        background:
                          copied === activeSection
                            ? "rgba(0,217,126,0.15)"
                            : "#2e3038",
                        border: "none",
                        color: copied === activeSection ? "#00d97e" : "#6b6e78",
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {copied === activeSection ? "✓ 복사" : "복사"}
                    </button>
                  </div>
                  <div
                    style={{
                      padding: 20,
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#f0eee8",
                      whiteSpace: "pre-wrap",
                      wordBreak: "keep-all",
                    }}
                  >
                    {(result[activeSection] || []).join("\n")}
                  </div>
                </div>
              )}

              {/* Fallback raw */}
              {!result && rawText && (
                <div
                  style={{
                    background: "#1a1b1f",
                    borderRadius: 16,
                    padding: 20,
                    fontSize: 14,
                    lineHeight: 1.9,
                    color: "#f0eee8",
                    whiteSpace: "pre-wrap",
                    wordBreak: "keep-all",
                  }}
                >
                  {rawText}
                </div>
              )}

              {/* Regenerate */}
              <button
                onClick={generate}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  background: "#1a1b1f",
                  border: "2px solid #2e3038",
                  color: "#6b6e78",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                ↻ 같은 조건으로 다시 생성
              </button>
            </>
          )}
        </div>
      )}

      {/* Category Bottom Sheet */}
      <BottomSheet
        open={catSheet}
        onClose={() => setCatSheet(false)}
        title="채널 카테고리"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setCatSheet(false);
              }}
              style={{
                padding: "16px",
                background:
                  category === c ? "rgba(255,61,90,0.1)" : "transparent",
                border: "none",
                color: category === c ? "#ff3d5a" : "#f0eee8",
                fontSize: 15,
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 10,
                fontFamily: "inherit",
                fontWeight: category === c ? 700 : 400,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {c}
              {category === c && <span>✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        * { -webkit-tap-highlight-color: transparent; }
        input, textarea, select { -webkit-appearance: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

const labelSt = {
  fontSize: 11,
  color: "#6b6e78",
  letterSpacing: 2,
  fontFamily: "monospace",
  textTransform: "uppercase",
};
