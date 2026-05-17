# Feature Inventory & Pricing Strategy

> **Reflecting Current Project State (`src/lib/subscription-utils.ts`)**

## 1. Feature Value Matrix

### 🤖 Core AI Agents (The Team)

| Agent Name | Role | Access Level |
| :--- | :--- | :--- |
| **Aura** | Wellness & Balance Subroutine | **All Tiers** |
| **Finn** | Financial Logistics Core | **All Tiers** |
| **Blaze** | Revenue Growth Processor | **Accelerator & Dominator** |
| **Glitch** | Systems Optimization Utility | **Accelerator & Dominator** |
| **Vex** | Operations Efficiency Unit | **Accelerator & Dominator** |
| **Roxy** | Strategic Operations Architect | **Dominator Only** |
| **Lexi** | Legal & Compliance Protocol | **Dominator Only** |
| **Nova** | Product Visionary System | **Dominator Only** |
| **Echo** | Viral Marketing Engine | **Dominator Only** |
| **Lumi** | Quality Assurance Sentinel | **Dominator Only** |

### 🛠️ High-Value Tools & Engines

| Feature / Component | Access Level |
| :--- | :--- |
| **Idea Incinerator** | Accelerator, Dominator |
| **Tactical Roadmap** | Accelerator, Dominator |
| **Custom Branding** | Accelerator, Dominator |
| **Priority Support** | Accelerator, Dominator |
| **War Room** | Dominator Only |
| **Ironclad** | Dominator Only |
| **Competitor Stalker** | Dominator Only |
| **Boardroom** | Dominator Only |
| **API Access** | Dominator Only |

---

## 2. Current Tier Structure & Limits

### 🚀 Free Tier
* **Agents**: Aura, Finn
* **Tools**: None
* **Chat Limits**: 10 msgs/day
* **Data Vault**: 50MB Storage Limit
* **Team Members**: 1

### 🌱 Launch Tier
* **Agents**: Aura, Finn
* **Tools**: None
* **Chat Limits**: 10 msgs/day
* **Data Vault**: 50MB Storage Limit
* **Team Members**: 1

### ⚡ Accelerator Tier
* **Agents**: Aura, Blaze, Glitch, Vex, Finn
* **Tools**: Idea Incinerator, Tactical Roadmap, Custom Branding, Priority Support
* **Chat Limits**: 100 msgs/day
* **Data Vault**: 1GB Storage Limit
* **Team Members**: 3

### 👑 Dominator Tier
* **Agents**: **FULL TEAM ACCESS** (All 10 Agents)
* **Tools**: FULL ACCESS (War Room, Ironclad, Competitor Stalker, Boardroom, API Access, etc.)
* **Chat Limits**: **UNLIMITED**
* **Data Vault**: 100GB Storage Limit
* **Team Members**: Unlimited

---

## 3. Implementation Details

*All limits and access controls are actively enforced via `src/lib/subscription-utils.ts` and the main database schema.*
