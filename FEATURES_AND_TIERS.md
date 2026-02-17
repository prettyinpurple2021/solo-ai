# Feature Inventory & Pricing Strategy (Refined)

> **Based on User Feedback & Manual Analysis**

## 1. Feature Value Matrix

### 🤖 Core AI Agents (The Team)

*Each agent is a distinct specialized feature.*

*The Team (8 Specialists + Aura + Finn).*

| Agent Name | Role | Value | Recommended Tier |
| :--- | :--- | :--- | :--- |
| **Roxy** | Strategic Operations Architect | 🔴 **HIGH** | Singularity|
| **Lexi** | Legal & Compliance Protocol | 🔴 **HIGH** | Singularity |
| **Nova** | Product Visionary System | 🔴 **HIGH** | Singularity |
| **Echo** | Viral Marketing Engine | 🔴 **HIGH** | Singularity |
| **Glitch** | Systems Optimization Utility | 🟡 **MEDIUM** | Overclock |
| **Blaze** | Revenue Growth Processor | 🟡 **MEDIUM** | Overclock |
| **Vex** | Operations Efficiency Unit | 🟡 **MEDIUM** | Overclock |
| **Lumi** | Quality Assurance Sentinel | 🔴 **HIGH** | Singularity |
| **Aura** | Wellness & Balance Subroutine | 🟢 **LOW** | Free |
| **Finn** | Financial Logistics Core | 🔴 **HIGH** | Singularity |

### 🛠️ High-Value Tools & Engines

| Feature / Component | Description | Value | Recommended Tier |
| :--- | :--- | :--- | :--- |
| **Strategy Nexus** | AI-driven strategic debate simulations. | 🔴 **HIGH** | Singularity |
| **Compliance Grid** | Automated legal counsel & doc generation. | 🔴 **HIGH** | Singularity |
| **Market Recon** | Deep-dive competitor tracking. | 🔴 **HIGH** | Singularity |
| **Neural Syndicate** | Multi-agent collaboration (Agents talking to agents). | 🔴 **HIGH** | Singularity |
| **Validation Forge** | "Roast" or "Forge" content validation. | 🟡 **MEDIUM** | Overclock |
| **Tactical Roadmap** | AI-generated project plans. | 🟡 **MEDIUM** | Overclock |
| **The Scout** | Lead generation & market research. | 🟡 **MEDIUM** | Overclock |

### 📂 Storage & Utility

| Feature | Description | Value | Tier / Limit |
| :--- | :--- | :--- | :--- |
| **Data Vault** | Asset & File Storage. | 🟡 **MEDIUM** | **Tiered Limits** |
| **Global Search** | Unified search. | 🟢 **LOW** | Free |
| **Onboarding** | Progressive guide (Skippable/Revisitable). | 🟢 **LOW** | Free |
| **Download Center** | *\[DEPRIORITIZED / FUTURE MIGRATION\]* | N/A | *Hold* |

---

## 2. Proposed Tier Structure & Limits

### 🚀 Initiate Tier (Free)

* **Authentication**: Secure Login (NextAuth).
* **Access**: Basic Dashboard, Profile, Settings.
* **Chat Limits**: 10 msgs/day (Text only, Basic models).
* **Data Vault**: 50MB Storage Limit.
* **Agents**: Access to **Aura** (Wellness) only.

### ⚡ Overclock Tier ($19/mo)

* **Agents**: Access to **Aura, Blaze, Glitch, Vex, Finn**.
* **Tools**: Validation Forge, Tactical Roadmap, The Scout.
* **Chat Limits**: 100 msgs/day (Standard models).
* **Data Vault**: 1GB Storage Limit.
* **Includes**: Priority Support.

### 👑 Singularity Tier ($29/mo)

* **Agents**: **FULL TEAM ACCESS** (Roxy, Lexi, Nova, Echo, Lumi, Blaze, Glitch, Vex, Aura, Finn).
* **Tools**: Strategy Nexus, Compliance Grid, Market Recon, Neural Syndicate.
* **Chat Limits**: **UNLIMITED** text generation. High limits for complex tasks.
* **Data Vault**: 100GB Storage Limit.
* **Includes**: Custom Agent Builder.

---

## 3. Implementation Plan

1. **Update `subscription-utils.ts`**:
    * Define `AGENT_ACCESS` map (Tier -> Allowed Agents).
    * Define `STORAGE_LIMITS` (Free: 50MB, Overclock: 1GB, Singularity: 100GB).
    * Define `CHAT_LIMITS` (Daily message caps).
2. **Enforce in UI**:
    * Hide/Lock Agents based on tier.
    * Show "Storage Full" warning in Data Vault.
    * Show "Upgrade to Chat" when limit reached.
