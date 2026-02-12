# Feature Inventory & Pricing Strategy (Refined)

> **Based on User Feedback & Manual Analysis**

## 1. Feature Value Matrix

### 🤖 Core AI Agents (The Team)

*Each agent is a distinct specialized feature.*

### 🤖 Core AI Agents (The Team)

*The 8 Solopreneur Success Agents + Aura (Wellness).*

| Agent Name | Role | Value | Recommended Tier |
| :--- | :--- | :--- | :--- |
| **Roxy** | The Boss / Business Coach | 🔴 **HIGH** | Dominator |
| **Lexi** | The Legal Eagle | 🔴 **HIGH** | Dominator |
| **Nova** | The Product Visionary | 🔴 **HIGH** | Dominator |
| **Echo** | The Marketing Guru | 🔴 **HIGH** | Dominator |
| **Glitch** | The Systems & Tech Expert | 🟡 **MEDIUM** | Accelerator |
| **Blaze** | The Sales & Growth Engine | 🟡 **MEDIUM** | Accelerator |
| **Vex** | The Operations Manager | 🟡 **MEDIUM** | Accelerator |
| **Lumi** | The Compliance & QA Officer | 🔴 **HIGH** | Dominator |
| **Aura** | The Wellness Guardian | � **LOW** | Free |

### 🛠️ High-Value Tools & Engines

| Feature / Component | Description | Value | Recommended Tier |
| :--- | :--- | :--- | :--- |
| **The War Room** | AI-driven strategic debate simulations. | 🔴 **HIGH** | Dominator |
| **The Ironclad** | Automated legal counsel & doc generation. | 🔴 **HIGH** | Dominator |
| **Competitor Stalker** | Deep-dive competitor tracking. | 🔴 **HIGH** | Dominator |
| **The Boardroom** | Multi-agent collaboration (Agents talking to agents). | 🔴 **HIGH** | Dominator |
| **Idea Incinerator** | "Roast" or "Forge" content validation. | 🟡 **MEDIUM** | Accelerator |
| **Tactical Roadmap** | AI-generated project plans. | 🟡 **MEDIUM** | Accelerator |
| **The Scout** | Lead generation & market research. | 🟡 **MEDIUM** | Accelerator |

### 📂 Storage & Utility

| Feature | Description | Value | Tier / Limit |
| :--- | :--- | :--- | :--- |
| **The Briefcase** | Asset & File Storage. | 🟡 **MEDIUM** | **Tiered Limits** |
| **Global Search** | Unified search. | 🟢 **LOW** | Free |
| **Onboarding** | Progressive guide (Skippable/Revisitable). | 🟢 **LOW** | Free |
| **The Academy** | *[DEPRIORITIZED / FUTURE MIGRATION]* | N/A | *Hold* |

---

## 2. Proposed Tier Structure & Limits

### 🚀 Launch Tier (Free)

* **Authentication**: Secure Login (NextAuth).
* **Access**: Basic Dashboard, Profile, Settings.
* **Chat Limits**: 10 msgs/day (Text only, Basic models).
* **Briefcase**: 50MB Storage Limit.
* **Agents**: Access to **Aura** (Wellness) only.

### ⚡ Accelerator Tier ($19/mo)

* **Agents**: Access to **Aura, Blaze, Glitch, Vex**.
* **Tools**: Idea Incinerator, Tactical Roadmap, The Scout.
* **Chat Limits**: 100 msgs/day (Standard models).
* **Briefcase**: 1GB Storage Limit.
* **Includes**: Priority Support.

### 👑 Dominator Tier ($29/mo)

* **Agents**: **FULL TEAM ACCESS** (Roxy, Lexi, Nova, Echo, Lumi, Blaze, Glitch, Vex, Aura).
* **Tools**: The War Room, The Ironclad, Competitor Stalker, The Boardroom.
* **Chat Limits**: **UNLIMITED** text generation. High limits for complex tasks.
* **Briefcase**: 10GB Storage Limit.
* **Includes**: Custom Agent Builder.

---

## 3. Implementation Plan

1. **Update `subscription-utils.ts`**:
    * Define `AGENT_ACCESS` map (Tier -> Allowed Agents).
    * Define `STORAGE_LIMITS` (Free: 50MB, Accelerator: 1GB, Dominator: 10GB).
    * Define `CHAT_LIMITS` (Daily message caps).
2. **Enforce in UI**:
    * Hide/Lock Agents based on tier.
    * Show "Storage Full" warning in Briefcase.
    * Show "Upgrade to Chat" when limit reached.
