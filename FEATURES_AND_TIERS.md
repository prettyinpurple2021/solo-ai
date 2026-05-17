# Feature Inventory & Pricing Strategy

> **Reflecting Current Project State (`src/lib/subscription-utils.ts`)**

## 1. Feature Value Matrix

### 🤖 Core AI Agents (The Team)

| Agent Name | Role | Access Level |
| :--- | :--- | :--- |
| **Aura** | Emotional Support Agent | **All Tiers** |
| **Finn** | Financial Operations Engine | **All Tiers** |
| **Blaze** | Growth Acceleration Engine | **Accelerator & Dominator** |
| **Glitch** | Technical Integration Hub (edge deployments) | **Accelerator & Dominator** |
| **Vex** | Executive Intelligence System | **Accelerator & Dominator** |
| **Roxy** | Strategic Foresight Engine | **Dominator Only** |
| **Lexi** | Compliance Intelligence Module | **Dominator Only** |
| **Nova** | Creative Intelligence Lab | **Dominator Only** |
| **Echo** | Signal Amplification Matrix (audience analytics) | **Dominator Only** |
| **Lumi** | Quality Assurance Network | **Dominator Only** |

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

### 🌱 Launch Tier
*(Note: Launch Tier is the free entry tier)*
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
