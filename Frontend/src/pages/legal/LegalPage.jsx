import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion, useSpring } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useTheme } from "../../core/context/ThemeContext";
import {
    ArrowLeft,
    FileText,
    Shield,
    RefreshCcw,
    Truck,
    Mail,
    MapPin,
    ChevronUp,
    ChevronRight,
    Search,
    X,
    Printer,
    Hash,
    Clock3,
    Scale,
    CheckCircle2,
    Copy,
    Check,
    Menu,
    AlertTriangle,
} from "lucide-react";

// ============================================================================
// LEGAL CONTENT
// ============================================================================

const legalContent = {
    terms: {
        title: "Terms of Service",
        icon: FileText,
        lastUpdated: "December 23, 2024",
        sections: [
            {
                id: "introduction",
                title: "Introduction",
                content: `Welcome to **AlgoViz** ("Platform", "we", "us", or "our"). AlgoViz is an educational technology platform designed to help developers master Data Structures and Algorithms through interactive visualizations, practice problems, and peer-to-peer mock interview services.

By accessing or using our Platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.`,
            },
            {
                id: "services",
                title: "Description of Services",
                content: `AlgoViz provides the following services:

- **Interactive Visualizations** — Algorithm animations and step-by-step breakdowns
- **Practice Problems** — DSA questions with varying difficulty levels
- **Mock Tests** — Timed assessments to evaluate your skills
- **Premium Features** — Advanced content and features for subscribers
- **Mock Interview Marketplace** — Peer-to-peer sessions with verified mentors
- **Progress Analytics** — Track your learning journey`,
            },
            {
                id: "accounts",
                title: "User Accounts",
                content: `To access certain features, you must register for an account. By creating an account, you agree to:

| Requirement | Description |
|-------------|-------------|
| **Accuracy** | Provide accurate and complete information |
| **Security** | Maintain the security of your credentials |
| **Notification** | Notify us of any unauthorized access |
| **No Sharing** | Do not share your account |
| **Responsibility** | Accept responsibility for all account activities |`,
            },
            {
                id: "content-rights",
                title: "Content Usage Rights",
                content: `All content on AlgoViz, including algorithms, visualizations, practice problems, tutorials, and educational materials, is owned by AlgoViz or its licensors.

> **You may NOT:**
> - Copy, reproduce, or distribute our content without permission
> - Resell, sublicense, or commercially exploit Premium content
> - Use automated tools to scrape or download content
> - Share Premium materials with non-Premium users
> - Record or redistribute mock interview sessions`,
            },
            {
                id: "conduct",
                title: "User Conduct",
                content: `You agree to use AlgoViz responsibly. Prohibited activities include:

1. Sharing account credentials with others
2. Attempting unauthorized access to our systems
3. Uploading malicious code or interfering with operations
4. Harassing or behaving inappropriately during mock interviews
5. Providing false information during registration
6. Circumventing payment systems or exploiting promotions`,
            },
            {
                id: "marketplace",
                title: "Mock Interview Marketplace",
                content: `Our peer-to-peer mock interview service operates as a marketplace:

- **Fixed Pricing** — Users pay a set fee per session
- **Commission Model** — Platform retains a commission; mentors receive the remainder
- **Verified Mentors** — All mentors are verified by our admin team
- **Video Conferencing** — Sessions conducted via integrated video tools
- **Check-In Required** — Both parties must check-in within 15 minutes
- **Feedback System** — Ratings and feedback are required post-session`,
            },
            {
                id: "payments",
                title: "Payments & Escrow",
                content: `For mock interviews, payments are handled securely:

\`\`\`
Payment Flow:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Booking   │ ──▶ │   Escrow    │ ──▶ │   Payout    │
│   (User)    │     │   (Held)    │     │  (Mentor)   │
└─────────────┘     └─────────────┘     └─────────────┘
\`\`\`

Funds are released to the mentor only after session completion and feedback submission.`,
            },
            {
                id: "liability",
                title: "Limitation of Liability",
                content: `AlgoViz is provided **"as is"** without warranties of any kind. We are not liable for:

- Interruptions or errors in service
- Loss of data or progress
- Quality of mentor services
- Actions of third-party users

**Maximum liability:** The amount you paid us in the 12 months preceding any claim.`,
            },
            {
                id: "modifications",
                title: "Modifications",
                content: `We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance. We will notify users of significant changes via email or platform notification.`,
            },
            {
                id: "governing-law",
                title: "Governing Law",
                content: `These Terms are governed by the **laws of India**. Any disputes shall be resolved in the courts of **India**.`,
            },
        ],
    },
    privacy: {
        title: "Privacy Policy",
        icon: Shield,
        lastUpdated: "December 23, 2024",
        sections: [
            {
                id: "info-collected",
                title: "Information We Collect",
                content: `We collect the following types of information:

### Personal Information
| Data Type | Purpose |
|-----------|---------|
| **Name & Email** | Account registration |
| **Phone Number** | Account recovery (optional) |
| **Profile Picture** | Personalization |

### Usage Data
- Learning progress and problem-solving history
- Mock interview bookings and feedback
- Performance analytics and quiz scores

### Technical Data
- IP address and device information
- Browser type and version
- Cookies and tracking technologies`,
            },
            {
                id: "data-usage",
                title: "How We Use Your Information",
                content: `We use collected information to:

1. **Provide Services** — Deliver educational content
2. **Personalization** — Track progress and customize recommendations
3. **Matchmaking** — Facilitate mock interview scheduling
4. **Transactions** — Process payments and orders
5. **Communication** — Send service notifications
6. **Analytics** — Improve platform experience
7. **Enforcement** — Resolve disputes and enforce policies`,
            },
            {
                id: "data-sharing",
                title: "Data Sharing",
                content: `> **We DO NOT sell your personal data to third parties.**

We may share data with:

- **Razorpay** — Payment processing
- **Google OAuth** — Authentication
- **Analytics Services** — Platform improvement
- **Legal Authorities** — When required by law

For mock interviews, limited profile information is shared between matched mentors and interviewees.`,
            },
            {
                id: "security",
                title: "Data Security",
                content: `We implement industry-standard security measures:

\`\`\`
Security Layers:
├── HTTPS/TLS Encryption
├── Secure Password Hashing
├── Regular Security Audits
├── Access Controls & Monitoring
└── Rate Limiting & DDoS Protection
\`\`\`

**Note:** No system is 100% secure. We encourage strong passwords.`,
            },
            {
                id: "cookies",
                title: "Cookies",
                content: `We use cookies to:

- Maintain your login session
- Remember your preferences
- Analyze platform usage
- Improve user experience

You can control cookies through browser settings, but some features may not work properly.`,
            },
            {
                id: "rights",
                title: "Your Rights",
                content: `You have the right to:

| Right | Description |
|-------|-------------|
| **Access** | View your personal data |
| **Correction** | Request fixes to inaccurate data |
| **Deletion** | Request account and data removal |
| **Portability** | Export your learning progress |
| **Opt-out** | Unsubscribe from non-essential emails |

Contact us at \`help.algoviz@gmail.com\` to exercise these rights.`,
            },
            {
                id: "retention",
                title: "Data Retention",
                content: `We retain your data for as long as your account is active.

**After account deletion:**
- Personal data removed within **30 days**
- Anonymized usage data may be retained
- Transaction records kept as required by law`,
            },
            {
                id: "children",
                title: "Children's Privacy",
                content: `AlgoViz is **not intended for children under 13**. We do not knowingly collect data from children. If you believe we have collected such data, please contact us immediately.`,
            },
        ],
    },
    refunds: {
        title: "Refund Policy",
        icon: RefreshCcw,
        lastUpdated: "December 23, 2024",
        sections: [
            {
                id: "subscriptions",
                title: "Premium Subscriptions",
                content: `> **Premium subscriptions are NON-REFUNDABLE once accessed.**

- Access is granted **immediately** upon payment
- No refunds after accessing Premium content
- Contact support within **24 hours** for technical issues

### Exceptions

| Scenario | Resolution |
|----------|------------|
| **Duplicate Charges** | Full refund after verification |
| **Unauthorized Transaction** | Full refund with proof |`,
            },
            {
                id: "mock-interviews",
                title: "Mock Interview Sessions",
                content: `### User Cancellations

| Timing | Refund Policy |
|--------|---------------|
| **> 24 hours before** | Partial/no refund (admin discretion) |
| **< 24 hours before** | No refund. Mentor receives 50% |

### Mentor Cancellations

| Scenario | Resolution |
|----------|------------|
| Mentor cancels | **Full refund** to user |
| Additional benefit | **10% discount** for next session |`,
            },
            {
                id: "no-show",
                title: "No-Show Policy",
                content: `We enforce strict no-show policies via our **Check-In System**:

\`\`\`
Check-In Window: 15 minutes

User No-Show:
├── Session marked cancelled
├── NO refund issued
└── Mentor receives full payment

Mentor No-Show:
├── Session cancelled
├── User receives FULL refund
└── Mentor penalty applied
\`\`\``,
            },
            {
                id: "processing",
                title: "Refund Processing",
                content: `| Stage | Timeline |
|-------|----------|
| **Review** | 2-3 business days |
| **Approval** | 5-7 working days |
| **Bank Processing** | +3-5 business days |

Refunds credited to original payment method. Gateway fees may apply.`,
            },
            {
                id: "disputes",
                title: "Dispute Resolution",
                content: `If you have concerns about a session:

1. Contact us within **24 hours**
2. Provide details of the issue
3. Our team will review:
   - Mentor's feedback form
   - Session duration and check-in logs
   - Available session records

> Refund decisions are at admin discretion based on evidence.`,
            },
            {
                id: "how-to-refund",
                title: "How to Request",
                content: `\`\`\`
Steps:
1. Email: help.algoviz@gmail.com
2. Include: Email + Order/Booking ID
3. Describe: Reason for request
4. Attach: Relevant evidence
\`\`\`

**Response Time:** Within **48 hours**.`,
            },
        ],
    },
    shipping: {
        title: "Delivery Policy",
        icon: Truck,
        lastUpdated: "December 23, 2024",
        sections: [
            {
                id: "digital-services",
                title: "Digital Services",
                content: `> **AlgoViz is a 100% digital platform.**
>
> We do not sell or ship physical products.

All services are delivered online:

- Algorithm visualizations
- Practice problems and tutorials
- Premium subscription content
- Mock interview sessions`,
            },
            {
                id: "delivery",
                title: "Service Delivery",
                content: `### Premium Subscriptions

| Aspect | Details |
|--------|---------|
| **Activation** | Instant after payment |
| **Confirmation** | Email with details |
| **Access** | Immediately in dashboard |

### Mock Interview Bookings

| Stage | Details |
|-------|---------|
| **Confirmation** | Sent immediately |
| **Session Details** | Visible in dashboard |
| **Meeting Link** | 10 mins before via Check-In |`,
            },
            {
                id: "access-issues",
                title: "Access Issues",
                content: `If you experience issues:

\`\`\`
Troubleshooting:
☐ Logged in with correct account
☐ Clear browser cache/cookies
☐ Try different browser/device
☐ Check email (including spam)
\`\`\`

Contact \`help.algoviz@gmail.com\` within **24 hours** if problems persist.`,
            },
            {
                id: "requirements",
                title: "System Requirements",
                content: `| Requirement | Specification |
|-------------|---------------|
| **Browser** | Chrome, Firefox, Safari, Edge |
| **Internet** | Stable broadband |
| **Mock Interviews** | Webcam + Microphone |
| **JavaScript** | Must be enabled |

We are not responsible for issues from incompatible devices.`,
            },
            {
                id: "availability",
                title: "Service Availability",
                content: `We strive for **99.9% uptime**.

- **Scheduled Maintenance** — Announced in advance
- **Unplanned Outages** — Resolved quickly
- **Session Rescheduling** — Available for platform issues
- **Third-Party Services** — Not liable for their interruptions`,
            },
        ],
    },
};

const navTabs = [
    {
        key: "terms",
        label: "Terms of Service",
        shortLabel: "Terms",
        icon: FileText,
        blurb: "Platform usage and responsibilities",
    },
    {
        key: "privacy",
        label: "Privacy Policy",
        shortLabel: "Privacy",
        icon: Shield,
        blurb: "Data collection, usage, and control",
    },
    {
        key: "refunds",
        label: "Refund Policy",
        shortLabel: "Refunds",
        icon: RefreshCcw,
        blurb: "Subscription and interview refunds",
    },
    {
        key: "shipping",
        label: "Delivery Policy",
        shortLabel: "Delivery",
        icon: Truck,
        blurb: "Digital service delivery terms",
    },
];

const getShortcutLabel = () => {
    if (typeof navigator === "undefined") return "Ctrl+Shift+K";
    return /Mac|iPhone|iPad/i.test(navigator.platform) ? "⌘⇧K" : "Ctrl+Shift+K";
};

const isTypingTarget = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    const tagName = target.tagName;
    return target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.06,
        },
    },
};

const sidebarItemVariants = {
    hidden: { opacity: 0, x: -18 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 24,
            stiffness: 165,
        },
    },
};

const contentVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 22,
            stiffness: 130,
        },
    },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 24,
            stiffness: 140,
        },
    },
};

// ============================================================================
// MARKDOWN COMPONENTS
// ============================================================================

const MarkdownComponents = {
    h3: ({ children }) => (
        <h3 className="font-display text-[22px] font-semibold text-[var(--text-primary)] mt-10 mb-4 tracking-tight leading-tight">
            {children}
        </h3>
    ),
    p: ({ children }) => (
        <p className="font-body text-[16px] text-[var(--text-secondary)] leading-8 mb-6 font-normal">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="space-y-4 mb-8 ml-2 pl-1 text-[var(--text-secondary)]">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="space-y-4 mb-8 ml-2 list-decimal list-inside marker:text-[var(--text-muted)] marker:font-medium text-[var(--text-secondary)]">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="leading-7 pl-1">{children}</li>,
    strong: ({ children }) => (
        <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
    ),
    blockquote: ({ children }) => (
        <div className="my-8 rounded-r-xl border-l-[3px] pl-6 py-3" style={{
            borderColor: "var(--accent-primary)",
            background: "color-mix(in srgb, var(--accent-primary) 11%, transparent)",
        }}>
            <div className="text-[16px] leading-7 [&>p]:mb-2 [&>p:last-child]:mb-0 font-medium" style={{ color: "color-mix(in srgb, var(--accent-primary) 65%, var(--text-primary))" }}>
                {children}
            </div>
        </div>
    ),
    table: ({ children }) => (
        <div className="overflow-x-auto my-8 rounded-xl border border-[var(--border-default)]" style={{
            background: "color-mix(in srgb, var(--bg-primary) 50%, var(--bg-secondary))",
            boxShadow: "var(--shadow-sm)",
        }}>
            <table className="w-full text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="border-b border-[var(--border-default)]" style={{
            background: "color-mix(in srgb, var(--bg-tertiary) 72%, transparent)",
        }}>
            {children}
        </thead>
    ),
    th: ({ children }) => (
        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-6 py-4 text-[15px] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
            {children}
        </td>
    ),
    code: ({ inline, children }) => {
        if (inline) {
            return (
                <code className="px-2 py-1 rounded text-[13px] font-code border" style={{
                    background: "color-mix(in srgb, var(--bg-tertiary) 80%, transparent)",
                    color: "var(--accent-primary)",
                    borderColor: "var(--border-default)",
                }}>
                    {children}
                </code>
            );
        }
        return (
            <pre className="rounded-2xl p-6 my-8 overflow-x-auto border" style={{
                background: "color-mix(in srgb, var(--bg-primary) 66%, var(--bg-secondary))",
                borderColor: "var(--border-default)",
                boxShadow: "inset 0 1px 0 var(--specular-highlight), var(--shadow-sm)",
            }}>
                <code className="text-[13px] leading-6 font-code text-[var(--text-primary)]">{children}</code>
            </pre>
        );
    },
    pre: ({ children }) => <>{children}</>,
    hr: () => <div className="my-12 border-t border-[var(--border-default)]" />,
};

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

function Sidebar({
    currentSection,
    currentDoc,
    onBackClick,
    searchQuery,
    setSearchQuery,
    filteredSectionsCount,
    scrollProgress,
    searchShortcutLabel,
}) {
    const searchInputRef = useRef(null);

    // Use a non-conflicting local shortcut and keep Cmd/Ctrl+K for global algorithm search.
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const isLocalShortcut = (e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey && key === 'k';
            const isSlashShortcut = !e.metaKey && !e.ctrlKey && !e.altKey && key === '/';
            const typingTarget = isTypingTarget(e.target);

            if (isLocalShortcut && !typingTarget) {
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }

            if (isSlashShortcut && !typingTarget) {
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }

            if (key === 'escape' && (document.activeElement === searchInputRef.current || searchQuery)) {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [searchQuery, setSearchQuery]);

    return (
        <motion.aside
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="hidden lg:flex w-[300px] min-h-0 flex-col rounded-3xl border border-[var(--border-default)]"
            style={{
                background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 92%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 80%, transparent) 100%)",
                boxShadow: "var(--shadow-md)",
                backdropFilter: "blur(24px)",
            }}
        >
            <motion.div variants={sidebarItemVariants} className="px-5 pt-5 pb-4 border-b border-[var(--border-default)]">
                <p className="font-code text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    AlgoViz
                </p>
                <h2 className="font-display text-xl text-[var(--text-primary)] mt-2 mb-4">
                    Legal Atlas
                </h2>
                <button
                    onClick={onBackClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                    style={{
                        color: "var(--text-secondary)",
                        background: "color-mix(in srgb, var(--bg-primary) 70%, transparent)",
                        border: "1px solid var(--border-default)",
                    }}
                >
                    <ArrowLeft
                        size={18}
                        className="group-hover:-translate-x-0.5 transition-transform duration-200"
                    />
                    <span>Back to Home</span>
                </button>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={sidebarItemVariants} className="px-5 pt-5">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sections..."
                        className="w-full rounded-xl pl-10 pr-20 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none transition-all duration-200"
                        style={{
                            color: "var(--text-primary)",
                            background: "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
                            border: "1px solid var(--border-default)",
                        }}
                    />
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <X size={14} />
                        </button>
                    ) : (
                        <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-code tracking-wide px-1.5 py-1 rounded-md"
                            style={{
                                color: "var(--text-muted)",
                                border: "1px solid var(--border-default)",
                                background: "color-mix(in srgb, var(--bg-primary) 78%, transparent)",
                            }}
                        >
                            {searchShortcutLabel}
                        </span>
                    )}
                </div>
                <p className="text-[11px] mt-2 px-1 text-[var(--text-muted)]">
                    Shortcut: <span className="text-[var(--text-secondary)]">{searchShortcutLabel}</span> or <span className="text-[var(--text-secondary)]">/</span>
                </p>
            </motion.div>

            <div className="px-5 pt-6 pb-5 min-h-0 overflow-y-auto scrollbar-none">
                <motion.p
                    variants={sidebarItemVariants}
                    className="px-2 text-[11px] font-code font-semibold uppercase tracking-[0.18em] mb-4 text-[var(--text-muted)]"
                >
                    Documents
                </motion.p>
                <nav className="space-y-2.5 relative">
                    {navTabs.map((tab) => {
                        const isActive = currentSection === tab.key;
                        const TabIcon = tab.icon;
                        return (
                            <motion.div
                                key={tab.key}
                                variants={sidebarItemVariants}
                                className="relative"
                            >
                                <Link
                                    to={`/legal/${tab.key}`}
                                    className="relative flex items-start gap-3 px-3 py-3 rounded-xl border transition-all duration-200 cursor-pointer"
                                    style={{
                                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                                        borderColor: isActive
                                            ? "color-mix(in srgb, var(--accent-primary) 35%, var(--border-default))"
                                            : "var(--border-default)",
                                        background: isActive
                                            ? "linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 14%, transparent), color-mix(in srgb, var(--bg-elevated) 90%, transparent))"
                                            : "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
                                        boxShadow: isActive ? "var(--shadow-glow), var(--shadow-sm)" : "var(--shadow-sm)",
                                    }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeDocPill"
                                            className="absolute inset-0 rounded-xl"
                                            style={{
                                                border: "1px solid color-mix(in srgb, var(--accent-primary) 45%, var(--border-default))",
                                            }}
                                            transition={{
                                                type: "spring",
                                                damping: 22,
                                                stiffness: 240,
                                            }}
                                        />
                                    )}
                                    <TabIcon
                                        size={17}
                                        className="relative z-10 mt-0.5"
                                        style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}
                                    />
                                    <div className="relative z-10 min-w-0">
                                        <p className="font-body text-[13px] leading-tight">{tab.label}</p>
                                        <p className="font-body text-[11px] mt-1 text-[var(--text-muted)] leading-snug">{tab.blurb}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>
            </div>

            <motion.div
                variants={sidebarItemVariants}
                className="px-5 py-5 border-t border-[var(--border-default)]"
                style={{
                    background: "color-mix(in srgb, var(--bg-primary) 78%, transparent)",
                }}
            >
                <p className="text-[11px] text-[var(--text-muted)] font-code uppercase tracking-[0.16em] mb-2">
                    Reading Tracking
                </p>
                <div className="mt-3">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--border-default) 75%, transparent)" }}>
                        <motion.div
                            className="h-full"
                            style={{
                                background: "var(--gradient-brand)",
                                width: `${scrollProgress}%`,
                            }}
                            transition={{ type: "spring", damping: 20, stiffness: 120 }}
                        />
                    </div>
                    <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
                        {Math.round(scrollProgress)}% read · {searchQuery ? `${filteredSectionsCount} matches` : `${currentDoc.sections.length} sections`}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">Updated {currentDoc.lastUpdated}</p>
                </div>
            </motion.div>
        </motion.aside>
    );
}

// ============================================================================
// MOBILE NAVIGATION
// ============================================================================

function MobileNav({ currentSection, onBackClick, onPrint, searchQuery, setSearchQuery }) {
    return (
        <div
            className="lg:hidden sticky top-0 z-40 border-b border-[var(--border-default)] backdrop-blur-xl"
            style={{
                background: "color-mix(in srgb, var(--bg-secondary) 88%, transparent)",
            }}
        >
            <div className="flex items-center justify-between px-4 py-3">
                <button
                    onClick={onBackClick}
                    className="flex items-center gap-2 text-sm transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                    <ArrowLeft size={16} />
                    <span>Back to home</span>
                </button>
                <button
                    onClick={onPrint}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer"
                    style={{
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-default)",
                        background: "color-mix(in srgb, var(--bg-primary) 70%, transparent)",
                    }}
                >
                    <Printer size={13} />
                    Print
                </button>
            </div>

            <div className="px-4 pb-3">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in this legal document"
                        className="w-full rounded-xl py-2.5 pl-9 pr-9 text-sm focus:outline-none"
                        style={{
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-default)",
                            background: "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto border-t border-[var(--border-default)] px-3 pb-3">
                <div className="flex pt-2 gap-2 min-w-max">
                    {navTabs.map((tab) => {
                        const isActive = currentSection === tab.key;
                        return (
                            <Link
                                key={tab.key}
                                to={`/legal/${tab.key}`}
                                className="relative px-4 py-2 rounded-xl text-[13px] font-body whitespace-nowrap border transition-colors duration-200"
                                style={{
                                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                                    borderColor: isActive
                                        ? "color-mix(in srgb, var(--accent-primary) 35%, var(--border-default))"
                                        : "var(--border-default)",
                                    background: isActive
                                        ? "color-mix(in srgb, var(--accent-primary) 12%, transparent)"
                                        : "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileActivePill"
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            border: "1px solid color-mix(in srgb, var(--accent-primary) 48%, var(--border-default))",
                                        }}
                                        transition={{
                                            type: "spring",
                                            damping: 22,
                                            stiffness: 220,
                                        }}
                                    />
                                )}
                                <span className="relative z-10">{tab.shortLabel}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// CONTENT HEADER
// ============================================================================

function ContentHeader({ currentDoc, onBackClick, sectionCount, estimatedReadMinutes, onPrint }) {
    const IconComponent = currentDoc.icon;

    return (
        <motion.div
            variants={contentVariants}
            className="mb-12"
        >
            <div className="flex items-center gap-2 text-xs mb-5 tracking-wide text-[var(--text-muted)]">
                <button onClick={onBackClick} className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Home</button>
                <ChevronRight size={13} className="text-[var(--text-muted)]" />
                <span>Legal</span>
                <ChevronRight size={13} className="text-[var(--text-muted)]" />
                <span className="text-[var(--text-primary)]">{currentDoc.title}</span>
            </div>

            <div
                className="relative overflow-hidden rounded-[28px] border p-6 lg:p-8"
                style={{
                    borderColor: "var(--border-default)",
                    background: "linear-gradient(155deg, color-mix(in srgb, var(--bg-elevated) 92%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 88%, transparent) 100%)",
                    boxShadow: "var(--shadow-md), inset 0 1px 0 var(--specular-highlight)",
                }}
            >
                <div
                    className="absolute -top-20 right-0 w-64 h-64 rounded-full pointer-events-none"
                    style={{
                        background: "color-mix(in srgb, var(--accent-primary) 20%, transparent)",
                        filter: "blur(80px)",
                    }}
                />
                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div
                            className="p-3.5 rounded-2xl"
                            style={{
                                background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                                border: "1px solid color-mix(in srgb, var(--accent-primary) 35%, var(--border-default))",
                                boxShadow: "var(--shadow-glow)",
                            }}
                        >
                            <IconComponent size={24} style={{ color: "var(--accent-primary)" }} />
                        </div>
                        <div>
                            <p className="font-code text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
                                Legal Command Center
                            </p>
                            <h1 className="font-display text-2xl lg:text-[32px] font-semibold text-[var(--text-primary)] tracking-tight mb-3">
                                {currentDoc.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                                    style={{
                                        background: "color-mix(in srgb, var(--bg-primary) 68%, transparent)",
                                        border: "1px solid var(--border-default)",
                                    }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-primary)" }} />
                                    <span className="text-xs text-[var(--text-secondary)]">
                                        Updated {currentDoc.lastUpdated}
                                    </span>
                                </div>
                                <span
                                    className="text-xs px-3 py-1 rounded-full"
                                    style={{
                                        border: "1px solid var(--border-default)",
                                        color: "var(--text-secondary)",
                                        background: "color-mix(in srgb, var(--bg-primary) 66%, transparent)",
                                    }}
                                >
                                    {sectionCount} sections
                                </span>
                                <span
                                    className="text-xs px-3 py-1 rounded-full"
                                    style={{
                                        border: "1px solid var(--border-default)",
                                        color: "var(--text-secondary)",
                                        background: "color-mix(in srgb, var(--bg-primary) 66%, transparent)",
                                    }}
                                >
                                    {estimatedReadMinutes} min read
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Print Button */}
                    <button
                        onClick={onPrint}
                        className="sm:self-start inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200"
                        style={{
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-default)",
                            background: "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
                        }}
                    >
                        <Printer size={16} />
                        <span>Print</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// CONTENT SECTION CARD
// ============================================================================

function SectionCard({ section, index, isActive }) {
    return (
        <motion.section
            data-section-index={index}
            variants={sectionVariants}
            className="mb-9 relative"
        >
            {isActive && (
                <motion.div
                    layoutId="activeSectionMarker"
                    className="hidden lg:block absolute -left-4 top-10 w-1.5 h-12 rounded-full"
                    style={{
                        background: "var(--accent-primary)",
                        boxShadow: "0 0 18px var(--accent-glow)",
                    }}
                />
            )}

            <motion.div
                animate={isActive ? { y: -1, scale: 1.004 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 24, stiffness: 260 }}
                className="relative overflow-hidden rounded-[24px] border p-6 lg:p-8 transition-all duration-300"
                style={{
                    borderColor: isActive
                        ? "color-mix(in srgb, var(--accent-primary) 38%, var(--border-default))"
                        : "var(--border-default)",
                    background: isActive
                        ? "linear-gradient(155deg, color-mix(in srgb, var(--accent-primary) 10%, var(--bg-elevated)) 0%, color-mix(in srgb, var(--bg-secondary) 86%, transparent) 100%)"
                        : "linear-gradient(155deg, color-mix(in srgb, var(--bg-elevated) 92%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 82%, transparent) 100%)",
                    boxShadow: isActive
                        ? "var(--shadow-md), 0 0 30px var(--accent-glow), inset 0 1px 0 var(--specular-highlight)"
                        : "var(--shadow-sm), inset 0 1px 0 var(--specular-highlight)",
                }}
            >
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-primary) 40%, transparent), transparent)" }}
                />
                {isActive && (
                    <motion.div
                        layoutId="activeSectionCardAura"
                        className="pointer-events-none absolute -top-20 right-6 w-52 h-52 rounded-full blur-3xl"
                        style={{ background: "color-mix(in srgb, var(--accent-primary) 18%, transparent)" }}
                    />
                )}

                <div className="relative flex items-center gap-4 mb-6">
                    <span
                        className="text-xs font-code tabular-nums transition-colors duration-300"
                        style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}
                    >
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-[24px] leading-tight font-semibold tracking-tight text-[var(--text-primary)]">
                        {section.title}
                    </h2>
                </div>

                <div className="relative lg:pl-6">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                    >
                        {section.content}
                    </ReactMarkdown>
                </div>
            </motion.div>
        </motion.section>
    );
}

// ============================================================================
// FOOTER
// ============================================================================

function LegalFooter() {
    return (
        <motion.footer
            variants={sectionVariants}
            className="mt-14"
        >
            <div
                className="relative overflow-hidden border rounded-3xl p-7 lg:p-9"
                style={{
                    borderColor: "var(--border-default)",
                    background: "linear-gradient(160deg, color-mix(in srgb, var(--bg-elevated) 90%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 82%, transparent) 100%)",
                    boxShadow: "var(--shadow-sm)",
                }}
            >
                <div
                    className="absolute -bottom-20 -right-10 w-56 h-56 rounded-full pointer-events-none blur-3xl"
                    style={{ background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)" }}
                />

                <div className="relative flex items-center gap-2.5 mb-8">
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)", boxShadow: "0 0 10px var(--accent-glow)" }} />
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        Verified Business
                    </span>
                </div>

                <div className="relative grid sm:grid-cols-2 gap-4 mb-5">
                    <div
                        className="rounded-2xl border p-4"
                        style={{
                            borderColor: "var(--border-default)",
                            background: "color-mix(in srgb, var(--bg-primary) 68%, transparent)",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={14} className="text-[var(--text-muted)]" />
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Address</p>
                        </div>
                        <p className="text-sm pl-5 leading-relaxed text-[var(--text-secondary)]">
                            IIT Kharagpur, West Bengal 721302
                        </p>
                    </div>
                    <div
                        className="rounded-2xl border p-4"
                        style={{
                            borderColor: "var(--border-default)",
                            background: "color-mix(in srgb, var(--bg-primary) 68%, transparent)",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Mail size={14} className="text-[var(--text-muted)]" />
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Email</p>
                        </div>
                        <a
                            href="mailto:help.algoviz@gmail.com"
                            className="text-sm hover:text-[var(--accent-primary)] transition-colors pl-5 block text-[var(--text-secondary)]"
                        >
                            help.algoviz@gmail.com
                        </a>
                    </div>
                </div>

                <div className="pt-5 border-t border-[var(--border-default)]">
                    <p className="text-xs text-[var(--text-muted)]">
                        © {new Date().getFullYear()} AlgoViz. All rights reserved.
                    </p>
                </div>
            </div>
        </motion.footer>
    );
}

function ReadingNavigator({
    visibleSections,
    activeSubSection,
    onSubSectionClick,
    scrollProgress,
    searchQuery,
}) {
    return (
        <aside
            className="hidden xl:flex min-h-0 flex-col rounded-3xl border border-[var(--border-default)] p-4"
            style={{
                background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 88%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 78%, transparent) 100%)",
                boxShadow: "var(--shadow-sm)",
                backdropFilter: "blur(20px)",
            }}
        >
            <p className="font-code text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] mb-3 px-2">
                {searchQuery ? "Search Results" : "On This Page"}
            </p>
            <div className="min-h-0 overflow-y-auto pr-1 scrollbar-none">
                <nav className="space-y-1.5">
                    {visibleSections.map((sec, index) => {
                        const isActive = activeSubSection === sec.originalIndex;
                        return (
                            <motion.button
                                key={sec.id}
                                type="button"
                                onClick={() => onSubSectionClick(sec.originalIndex)}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="relative w-full text-left px-3 py-2.5 rounded-xl border cursor-pointer transition-colors"
                                style={{
                                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                                    borderColor: isActive
                                        ? "color-mix(in srgb, var(--accent-primary) 35%, var(--border-default))"
                                        : "transparent",
                                    background: isActive
                                        ? "color-mix(in srgb, var(--accent-primary) 12%, transparent)"
                                        : "transparent",
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSectionPill"
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            border: "1px solid color-mix(in srgb, var(--accent-primary) 38%, var(--border-default))",
                                        }}
                                        transition={{ type: "spring", damping: 24, stiffness: 320 }}
                                    />
                                )}
                                <span className="relative z-10 font-code text-[11px] mr-2 text-[var(--text-muted)]">
                                    {String(sec.originalIndex + 1).padStart(2, "0")}
                                </span>
                                <span className="relative z-10 text-[12px] font-body">{sec.title}</span>
                            </motion.button>
                        );
                    })}

                    {!visibleSections.length && (
                        <p className="px-2 py-3 text-xs text-[var(--text-muted)]">
                            No sections match the current search.
                        </p>
                    )}
                </nav>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--border-default) 70%, transparent)" }}>
                    <motion.div
                        className="h-full"
                        style={{ width: `${scrollProgress}%`, background: "var(--gradient-brand)" }}
                        transition={{ duration: 0.15 }}
                    />
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">Reading progress {Math.round(scrollProgress)}%</p>
            </div>
        </aside>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LegalPages() {
    const { section } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const contentRef = useRef(null);
    const [activeSubSection, setActiveSubSection] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const currentSection = section || "terms";
    const currentDoc = legalContent[currentSection] || legalContent.terms;
    const isValidSection = !!legalContent[currentSection];
    const searchShortcutLabel = useMemo(() => getShortcutLabel(), []);
    const sectionCount = currentDoc.sections.length;
    const estimatedReadMinutes = useMemo(() => {
        const totalWords = currentDoc.sections.reduce((sum, sec) => {
            const plainText = sec.content.replace(/[`*_#>|\\-]/g, ' ').replace(/\|/g, ' ');
            return sum + plainText.split(/\s+/).filter(Boolean).length;
        }, 0);

        return Math.max(2, Math.round(totalWords / 210));
    }, [currentDoc.sections]);

    const filteredSections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return currentDoc.sections;

        return currentDoc.sections.filter((sec) =>
            sec.title.toLowerCase().includes(query) ||
            sec.content.toLowerCase().includes(query)
        );
    }, [currentDoc.sections, searchQuery]);

    const visibleSections = useMemo(() => {
        const source = searchQuery.trim() ? filteredSections : currentDoc.sections;
        return source
            .map((sec) => ({
                ...sec,
                originalIndex: currentDoc.sections.findIndex((sourceSec) => sourceSec.id === sec.id),
            }))
            .filter((sec) => sec.originalIndex >= 0);
    }, [searchQuery, filteredSections, currentDoc.sections]);

    const ambientBackground = useMemo(
        () => (isDark
            ? "radial-gradient(circle at 14% 12%, color-mix(in srgb, var(--accent-primary) 20%, transparent) 0%, transparent 34%), radial-gradient(circle at 82% 8%, color-mix(in srgb, var(--accent-secondary) 18%, transparent) 0%, transparent 35%), linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 96%, black) 0%, var(--bg-primary) 100%)"
            : "radial-gradient(circle at 12% 9%, color-mix(in srgb, var(--accent-primary) 12%, transparent) 0%, transparent 32%), radial-gradient(circle at 87% 6%, color-mix(in srgb, var(--accent-secondary) 9%, transparent) 0%, transparent 32%), linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 96%, white) 0%, var(--bg-primary) 100%)"
        ),
        [isDark],
    );

    // Redirect invalid sections
    useEffect(() => {
        if (!isValidSection) {
            navigate("/legal/terms", { replace: true });
        }
        setActiveSubSection(0);
        // Scroll to top when section changes
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [section, isValidSection, navigate]);

    // Scroll Spy Effect
    useEffect(() => {
        const container = contentRef.current;
        if (!container) return;

        const handleScroll = () => {
            const sections = container.querySelectorAll("[data-section-index]");
            let current = 0;

            sections.forEach((sec, index) => {
                const rect = sec.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (rect.top - containerRect.top < containerRect.height * 0.35) {
                    current = index;
                }
            });

            setActiveSubSection(current);

            // Calculate scroll progress
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            setScrollProgress(progress);
            setShowScrollTop(scrollTop > 300);
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [section]);

    // Scroll to section handler
    const scrollToSection = useCallback((index) => {
        const container = contentRef.current;
        const target = container?.querySelector(`[data-section-index="${index}"]`);
        if (target && container) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            container.scrollTo({
                top: container.scrollTop + targetRect.top - containerRect.top - 24,
                behavior: "smooth",
            });
        }
    }, []);

    const handleBackClick = useCallback(() => {
        navigate("/");
    }, [navigate]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const scrollToTop = useCallback(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="relative h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className="absolute inset-0 pointer-events-none" style={{ background: ambientBackground }} />
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: "radial-gradient(var(--text-secondary) 1px, transparent 1px)",
                    backgroundSize: "4px 4px",
                }}
            />

            {/* Global Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: var(--font-body); }
                .font-display, h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); }
                .font-code, .font-mono { font-family: var(--font-code); }
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-thin::-webkit-scrollbar { width: 7px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                  background: color-mix(in srgb, var(--text-secondary) 35%, transparent);
                  border-radius: 999px;
                  border: 2px solid transparent;
                  background-clip: content-box;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                  background: color-mix(in srgb, var(--accent-primary) 70%, transparent);
                }
                @media (prefers-reduced-motion: reduce) {
                  * {
                    animation-duration: 1ms !important;
                    transition-duration: 1ms !important;
                    scroll-behavior: auto !important;
                  }
                }
            `}</style>

            {/* Main Layout */}
            <div className="relative mx-auto h-full max-w-[1580px] p-0 lg:p-4">
                <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_270px]">

                    {/* Sidebar (Desktop) */}
                    <Sidebar
                        currentSection={currentSection}
                        currentDoc={currentDoc}
                        onBackClick={handleBackClick}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filteredSectionsCount={filteredSections.length}
                        scrollProgress={scrollProgress}
                        searchShortcutLabel={searchShortcutLabel}
                    />

                    {/* Content Area */}
                    <main
                        className="min-h-0 overflow-hidden rounded-none lg:rounded-3xl border border-[var(--border-default)]"
                        style={{
                            background: "linear-gradient(160deg, color-mix(in srgb, var(--bg-secondary) 94%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 84%, transparent) 100%)",
                            boxShadow: isDark ? "var(--shadow-lg)" : "var(--shadow-md)",
                            backdropFilter: "blur(18px)",
                        }}
                    >

                        {/* Mobile Navigation */}
                        <MobileNav
                            currentSection={currentSection}
                            onBackClick={handleBackClick}
                            onPrint={handlePrint}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />

                        {/* Scrollable Content */}
                        <div
                            ref={contentRef}
                            className="h-full overflow-y-auto scrollbar-thin"
                        >
                            <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-8 sm:px-8 lg:px-12 lg:pt-12">

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSection}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        variants={containerVariants}
                                    >
                                        {/* Header */}
                                        <ContentHeader
                                            currentDoc={currentDoc}
                                            onBackClick={handleBackClick}
                                            sectionCount={sectionCount}
                                            estimatedReadMinutes={estimatedReadMinutes}
                                            onPrint={handlePrint}
                                        />

                                        {/* Mobile/Tablet Jump Bar */}
                                        <div
                                            className="xl:hidden mb-8 rounded-2xl border p-3"
                                            style={{
                                                borderColor: "var(--border-default)",
                                                background: "color-mix(in srgb, var(--bg-primary) 70%, transparent)",
                                            }}
                                        >
                                            <p className="font-code text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] px-1 mb-2">
                                                Jump To Section
                                            </p>
                                            <div className="overflow-x-auto scrollbar-none">
                                                <div className="flex gap-2 min-w-max">
                                                    {visibleSections.map((sec) => {
                                                        const isActive = activeSubSection === sec.originalIndex;
                                                        return (
                                                            <button
                                                                key={sec.id}
                                                                type="button"
                                                                onClick={() => scrollToSection(sec.originalIndex)}
                                                                className="px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors border"
                                                                style={{
                                                                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                                                                    borderColor: isActive
                                                                        ? "color-mix(in srgb, var(--accent-primary) 35%, var(--border-default))"
                                                                        : "var(--border-default)",
                                                                    background: isActive
                                                                        ? "color-mix(in srgb, var(--accent-primary) 12%, transparent)"
                                                                        : "color-mix(in srgb, var(--bg-secondary) 74%, transparent)",
                                                                }}
                                                            >
                                                                {sec.title}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sections */}
                                        <div className="relative">
                                            <div
                                                className="hidden lg:block pointer-events-none absolute left-1 top-4 bottom-10 w-px"
                                                style={{
                                                    background: "linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 45%, transparent), color-mix(in srgb, var(--border-default) 88%, transparent) 55%, transparent)",
                                                }}
                                            />

                                            {currentDoc.sections.map((sec, index) => (
                                                <SectionCard
                                                    key={sec.id}
                                                    section={sec}
                                                    index={index}
                                                    isActive={activeSubSection === index}
                                                />
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <LegalFooter />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </main>

                    <ReadingNavigator
                        visibleSections={visibleSections}
                        activeSubSection={activeSubSection}
                        onSubSectionClick={scrollToSection}
                        scrollProgress={scrollProgress}
                        searchQuery={searchQuery}
                    />
                </div>

                {/* Reading Progress Bar */}
                <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
                    <motion.div
                        className="h-full"
                        style={{
                            background: "var(--gradient-brand)",
                            boxShadow: "0 0 16px var(--accent-glow)",
                            width: `${scrollProgress}%`,
                        }}
                        transition={{ duration: 0.1 }}
                    />
                </div>

                {/* Scroll to Top FAB */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            onClick={scrollToTop}
                            className="fixed bottom-6 right-6 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer z-50 group"
                            style={{
                                border: "1px solid var(--border-default)",
                                color: "var(--text-primary)",
                                background: "color-mix(in srgb, var(--bg-secondary) 85%, transparent)",
                                boxShadow: "var(--shadow-md)",
                            }}
                        >
                            <ChevronUp size={20} className="transition-colors" style={{ color: "var(--accent-primary)" }} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}