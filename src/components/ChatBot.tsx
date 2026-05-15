import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  isTyping?: boolean;
}

// ── FAQ knowledge base ──────────────────────────────────────────────────────
const FAQ = [
  {
    keywords: {
      en: ["what is", "about", "preproduction", "platform", "who are", "how does it work", "marketplace"],
      ar: ["ما هو", "عن", "برودكشن", "منصة", "من أنتم", "كيف تعمل", "سوق"],
    },
    response: {
      en: "PreProduction is a marketplace for film production professionals. You can find and book:\n• 🎬 Filming Locations\n• 📷 Equipment Rentals\n• 👤 Models & Talent\n• 🎥 Production Crew\n\nEvery listing is reviewed by our admin team before going live.",
      ar: "بري برودكشن هو سوق لمحترفي الإنتاج السينمائي. يمكنك العثور وحجز:\n• 🎬 مواقع التصوير\n• 📷 تأجير المعدات\n• 👤 النماذج والمواهب\n• 🎥 طاقم الإنتاج\n\nكل إدراج يُراجع من قِبل فريقنا قبل النشر.",
    },
  },
  {
    keywords: {
      en: ["how to book", "booking", "reserve", "request booking", "book a location", "book equipment"],
      ar: ["كيف أحجز", "الحجز", "حجز", "حجز موقع", "احجز", "طلب حجز"],
    },
    response: {
      en: "Booking is easy:\n1. Browse Locations, Equipment, Crew, or Models\n2. Open the listing you like\n3. Click \"Request Booking\"\n4. Pick your dates and duration (6h, 12h, or full day)\n5. Add any notes and confirm\n\nThe owner will review and confirm your request.",
      ar: "الحجز سهل جداً:\n1. تصفح المواقع أو المعدات أو الطاقم أو النماذج\n2. افتح الإدراج الذي يعجبك\n3. اضغط على \"طلب حجز\"\n4. اختر التواريخ والمدة (6 ساعات أو 12 ساعة أو يوم كامل)\n5. أضف ملاحظات وأكد الطلب\n\nسيراجع المالك طلبك ويؤكده.",
    },
  },
  {
    keywords: {
      en: ["list my", "add location", "add equipment", "how to list", "become a host", "rent out", "listing", "add my space", "post a listing"],
      ar: ["أضف موقعك", "إضافة موقع", "إضافة معدات", "كيف أدرج", "أصبح مضيفاً", "تأجير", "إدراج", "أضف مساحتي"],
    },
    response: {
      en: "To list your services:\n1. Create a free account\n2. Go to your Dashboard\n3. Click \"Add Location\", \"Add Equipment\", or the relevant button\n4. Fill in the details, pricing, and photos\n5. Submit — our team will review within 24–48 hours\n\nOnce approved, your listing goes live for all users to see.",
      ar: "لإدراج خدماتك:\n1. أنشئ حساباً مجانياً\n2. اذهب إلى لوحة التحكم\n3. اضغط على \"إضافة موقع\" أو \"إضافة معدات\" أو الزر المناسب\n4. أدخل التفاصيل والأسعار والصور\n5. أرسل — سيراجع فريقنا طلبك خلال 24-48 ساعة\n\nبعد الموافقة، سيظهر إدراجك لجميع المستخدمين.",
    },
  },
  {
    keywords: {
      en: ["approval", "pending", "review", "how long", "approved", "rejected", "admin"],
      ar: ["موافقة", "معلق", "مراجعة", "كم من الوقت", "موافق عليه", "مرفوض", "إدارة"],
    },
    response: {
      en: "All listings go through an approval process:\n• After you submit, status shows as \"Pending Review\"\n• Our admin team reviews within 24–48 hours\n• If approved ✅ — it goes live immediately\n• If rejected ❌ — you can edit and resubmit\n\nYou can track the status in your Dashboard.",
      ar: "جميع الإدراجات تمر بعملية موافقة:\n• بعد الإرسال، تظهر الحالة كـ \"قيد المراجعة\"\n• يراجع فريق الإدارة خلال 24-48 ساعة\n• إذا وُفِّق ✅ — ينشر فوراً\n• إذا رُفض ❌ — يمكنك التعديل وإعادة الإرسال\n\nيمكنك متابعة الحالة من لوحة التحكم.",
    },
  },
  {
    keywords: {
      en: ["price", "pricing", "fee", "cost", "how much", "commission", "pay", "payment", "free"],
      ar: ["سعر", "أسعار", "رسوم", "تكلفة", "كم", "عمولة", "دفع", "دفع", "مجاني"],
    },
    response: {
      en: "Pricing on PreProduction:\n• Each owner sets their own rates (per 6h, 12h, or full day)\n• You'll see the total price before confirming a booking\n• Creating an account is completely free\n• Listing your services is also free\n\nTransparent pricing — no hidden fees.",
      ar: "الأسعار على بري برودكشن:\n• كل مالك يحدد أسعاره الخاصة (لكل 6 ساعات أو 12 ساعة أو يوم كامل)\n• ستعرف السعر الإجمالي قبل تأكيد الحجز\n• إنشاء حساب مجاني تماماً\n• إدراج خدماتك مجاني أيضاً\n\nأسعار شفافة — لا رسوم خفية.",
    },
  },
  {
    keywords: {
      en: ["sign up", "register", "create account", "join", "how to create", "new account"],
      ar: ["إنشاء حساب", "تسجيل", "انضم", "كيف أسجل", "حساب جديد", "اشترك"],
    },
    response: {
      en: "Creating an account is free and quick:\n1. Click \"Get Started\" in the top navigation\n2. Enter your name, email, and password\n3. Check your email for a verification link\n4. Click the link and you're in!\n\nOnce signed in, you can browse, book, and list services.",
      ar: "إنشاء حساب مجاني وسريع:\n1. اضغط على \"ابدأ الآن\" في شريط التنقل\n2. أدخل اسمك وبريدك الإلكتروني وكلمة المرور\n3. تحقق من بريدك الإلكتروني لرابط التحقق\n4. انقر على الرابط وستدخل مباشرة!\n\nبعد تسجيل الدخول، يمكنك التصفح والحجز وإدراج الخدمات.",
    },
  },
  {
    keywords: {
      en: ["crew", "hire crew", "find crew", "dp", "director", "photographer", "videographer", "ac", "gaffer"],
      ar: ["طاقم", "وظف طاقماً", "ابحث عن طاقم", "مدير تصوير", "مصور", "مصور فيديو", "غافر"],
    },
    response: {
      en: "Finding crew on PreProduction:\n• Go to the Crew page from the navigation\n• Filter by role: DP, AC, Photographer, Gaffer, and more\n• View their profile, experience, and daily rate\n• Contact them directly to book\n\nAll crew members are reviewed before being listed.",
      ar: "العثور على طاقم العمل:\n• اذهب إلى صفحة طاقم العمل من شريط التنقل\n• فلتر حسب الدور: مدير تصوير، مساعد مصور، مصور، وأكثر\n• شاهد ملفهم الشخصي والخبرة والأجر اليومي\n• تواصل معهم مباشرة للحجز\n\nجميع أعضاء الطاقم يُراجعون قبل الإدراج.",
    },
  },
  {
    keywords: {
      en: ["model", "talent", "casting", "actress", "actor", "find model"],
      ar: ["نموذج", "موهبة", "كاستينج", "ممثلة", "ممثل", "إيجاد نموذج"],
    },
    response: {
      en: "Finding models & talent:\n• Go to Models & Casting from the navigation\n• Filter by gender, skin tone, and more\n• Browse their portfolio photos\n• View their profile and daily rate\n\nAll talent profiles are verified by our team.",
      ar: "العثور على النماذج والمواهب:\n• اذهب إلى النماذج والكاستينج من شريط التنقل\n• فلتر حسب الجنس ولون البشرة وأكثر\n• تصفح صور البورتفوليو\n• شاهد ملفهم الشخصي والأجر اليومي\n\nجميع ملفات المواهب تُتحقق من قِبل فريقنا.",
    },
  },
  {
    keywords: {
      en: ["cancel", "cancellation", "refund", "money back", "change booking"],
      ar: ["إلغاء", "استرجاع", "استرداد", "تغيير الحجز"],
    },
    response: {
      en: "For cancellations and changes:\n• You can cancel a booking from your Dashboard under \"My Bookings\"\n• Contact the owner directly via your booking notes\n• Refund policies are set by each individual owner\n\nFor disputes, contact support@preproduction.com",
      ar: "للإلغاء والتغييرات:\n• يمكنك إلغاء الحجز من لوحة التحكم تحت \"حجوزاتي\"\n• تواصل مع المالك مباشرة عبر ملاحظات الحجز\n• سياسات الاسترداد يحددها كل مالك\n\nللنزاعات، تواصل مع support@preproduction.com",
    },
  },
  {
    keywords: {
      en: ["contact", "support", "help", "email", "phone", "reach"],
      ar: ["تواصل", "دعم", "مساعدة", "بريد", "هاتف", "اتصل"],
    },
    response: {
      en: "Need more help? Reach us at:\n📧 support@preproduction.com\n\nOr use the Contact page in the footer for a support form.\n\nOur team typically responds within a few hours.",
      ar: "تحتاج مزيداً من المساعدة؟ تواصل معنا:\n📧 support@preproduction.com\n\nأو استخدم صفحة \"اتصل بنا\" في أسفل الصفحة.\n\nيرد فريقنا عادةً خلال ساعات قليلة.",
    },
  },
  {
    keywords: {
      en: ["extension", "more time", "extend booking", "extra time"],
      ar: ["تمديد", "مزيد من الوقت", "تمديد الحجز", "وقت إضافي"],
    },
    response: {
      en: "Need to extend your booking?\n• Go to Dashboard → My Bookings\n• Find your confirmed booking\n• Click \"Need more time\" and enter the extra hours\n• The owner will receive a notification and approve or reject\n\nNote: if another booking is on the same day, the owner will factor that in.",
      ar: "تحتاج لتمديد حجزك؟\n• اذهب إلى لوحة التحكم → حجوزاتي\n• ابحث عن حجزك المؤكد\n• اضغط \"تحتاج مزيداً من الوقت\" وأدخل الساعات الإضافية\n• سيتلقى المالك إشعاراً ويوافق أو يرفض\n\nملاحظة: إذا كان هناك حجز آخر في نفس اليوم، سيأخذ المالك ذلك في الاعتبار.",
    },
  },
  {
    keywords: {
      en: ["dashboard", "my account", "my listing", "my booking", "profile"],
      ar: ["لوحة التحكم", "حسابي", "إدراجاتي", "حجوزاتي", "ملفي"],
    },
    response: {
      en: "Your Dashboard is your control centre:\n• 📋 My Listings — see all your locations, equipment, crew, and talent profiles with their approval status\n• 📅 My Bookings — track all bookings you've made or received\n• Access it from the top navigation after signing in.",
      ar: "لوحة التحكم هي مركز تحكمك:\n• 📋 إدراجاتي — شاهد جميع مواقعك ومعداتك وطاقمك ونماذجك مع حالة الموافقة\n• 📅 حجوزاتي — تتبع جميع الحجوزات التي أجريتها أو تلقيتها\n• ادخل إليها من شريط التنقل بعد تسجيل الدخول.",
    },
  },
];

function findResponse(input: string, lang: string): string {
  const lower = input.toLowerCase().trim();
  if (!lower) return "";

  let bestScore = 0;
  let bestResponse = "";

  for (const item of FAQ) {
    const keywords = lang === "ar" ? item.keywords.ar : item.keywords.en;
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) score += 2;
      else if (kw.toLowerCase().split(" ").some((w) => lower.includes(w) && w.length > 3)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestResponse = lang === "ar" ? item.response.ar : item.response.en;
    }
  }

  return bestScore > 0 ? bestResponse : "";
}

// ── Component ───────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => ++_id;

export default function ChatBot() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [greeted, setGreeted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lang = i18n.language === "ar" ? "ar" : "en";

  const quickReplies = t("chat.quickReplies", { returnObjects: true }) as string[];

  // Show greeting when chat opens for the first time
  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      setUnread(0);
      const text = user
        ? t("chat.greetingUser", { name: user.first_name || "there" })
        : t("chat.greeting");
      setTimeout(() => {
        setMessages([{ id: uid(), from: "bot", text }]);
      }, 300);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, greeted, user, t]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");

    const userMsg: Message = { id: uid(), from: "user", text: trimmed };
    const typing: Message = { id: uid(), from: "bot", text: "...", isTyping: true };
    setMessages((prev) => [...prev, userMsg, typing]);

    // Simulate a brief typing delay
    setTimeout(() => {
      const response = findResponse(trimmed, lang);
      const botText = response || t("chat.fallback");
      setMessages((prev) =>
        prev.map((m) => (m.isTyping ? { ...m, text: botText, isTyping: false } : m))
      );
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold shadow-gold transition-all duration-300 hover:scale-110 hover:opacity-90",
          open && "scale-90 opacity-80"
        )}
        aria-label="Open chat"
      >
        {open ? (
          <ChevronDown className="h-6 w-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-24 end-6 z-50 flex w-[340px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border border-border/60 bg-background shadow-2xl",
            "animate-in slide-in-from-bottom-4 fade-in duration-200"
          )}
          style={{ height: "min(520px, calc(100vh - 8rem))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-gold px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary-foreground text-sm leading-tight">{t("chat.title")}</p>
              <p className="text-[11px] text-primary-foreground/70">{t("chat.subtitle")}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-primary-foreground/70 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground pt-8">
                <Bot className="h-10 w-10 mx-auto mb-3 text-primary/40" />
                <p>{t("chat.suggestions")}</p>
              </div>
            )}

            {/* Quick reply chips — shown after greeting */}
            {messages.length === 1 && messages[0].from === "bot" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary/15"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 max-w-[90%]",
                  msg.from === "user" ? "ms-auto flex-row-reverse" : ""
                )}
              >
                {msg.from === "bot" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line",
                    msg.from === "user"
                      ? "rounded-te-sm bg-primary text-primary-foreground"
                      : "rounded-ts-sm bg-muted/60 text-foreground",
                    msg.isTyping && "animate-pulse"
                  )}
                >
                  {msg.isTyping ? (
                    <span className="flex gap-1 items-center py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/50 p-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              className="flex-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="h-9 w-9 shrink-0 rounded-xl bg-gradient-gold p-0 text-primary-foreground hover:opacity-90"
            >
              <Send className="h-4 w-4 rtl-flip" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
