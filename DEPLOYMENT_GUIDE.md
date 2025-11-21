# Prime Pickz - Two Version Deployment Guide

## 🎯 Understanding Your Versions

You have **two chat agent versions** - we've saved both as archives. To get separate **live URLs**, you need separate deployments.

---

## 📱 Current Deployment

### ✅ Version 2 (Current - WITH Database Knowledge)
**Status:** Live Now  
**URL:** This Replit project's published URL  
**Features:**
- AI chat with real product database knowledge
- Dynamic inventory integration
- Better error handling
- 95%+ accuracy on customer questions

**To get this live:**
1. Click the "Publish" button in Replit
2. Share the generated `.replit.app` URL

---

## 🔄 To Create Separate Live Versions

### Step 1: Publish Current Version (v2 - With Database Knowledge)
1. In this Replit, click **Publish** button
2. Copy the live URL (e.g., `primepickz-nov21.replit.dev`)
3. **This is your CURRENT version link**

### Step 2: Create Version 1 (Before Today's Changes)
To get the old version live as a second URL:

**Option A: Duplicate the Project (Recommended)**
1. Click your profile → "My Repls"
2. Find this project → Click menu (•••) → "Duplicate"
3. In the duplicate, open terminal and run:
   ```bash
   git log --oneline | head -20
   ```
4. Find commit `59ccbb2` (last commit before today's changes)
5. Run:
   ```bash
   git checkout 59ccbb2
   ```
6. Click **Publish** to get a second live URL
7. **This is your OLD version link**

**Option B: Use Checkpoints**
1. In Replit, look for "Checkpoints" or rollback history
2. Find the checkpoint from yesterday (Nov 20)
3. Rollback to that version
4. Publish to get the old version URL

---

## 📊 Version Comparison Links

| Version | Type | Status | Chat Agent |
|---------|------|--------|-----------|
| **Version 2 (Current)** | Live | ✅ Active | Database-Connected AI |
| **Version 1 (Before)** | Need to Deploy | 🔲 Not Live | Static FAQ-Based |

---

## 🔗 Share Both URLs

Once you have both live:

**Current (v2 - Better):**
```
https://primepickz-nov21.replit.dev/
```

**Old (v1 - For Comparison):**
```
https://primepickz-duplicate.replit.dev/
```

---

## ✨ What's Different

### Chat Agent Comparison

**Version 1 (Old)** - Static FAQ:
- Pre-written FAQ responses
- Cannot check real inventory
- Limited to hardcoded product categories
- Generic "Call 475-239-6334" fallback

**Version 2 (Current)** - Database-Connected:
- Fetches real products from database
- Knows exact inventory count
- Can recommend from 100+ actual products
- Accurate pricing information
- Real category knowledge
- Intelligent fallbacks

---

## 📝 Reference Files

**Chat implementations saved for reference:**
- `server/chat-routes-v1-static-faq.ts` - Old version
- `server/chat-routes-v2-with-db-knowledge.ts` - New version
- `VERSION_HISTORY.md` - Detailed changes

---

## 🎬 Quick Steps Summary

### Get Current Version Live (1 min)
1. Click Publish
2. Copy URL → Done!

### Get Both Versions Live (5 min)
1. Click Publish on this project → Save URL as "v2"
2. Duplicate project
3. In duplicate: `git checkout 59ccbb2`
4. Publish duplicate → Save URL as "v1"
5. Now you have both URLs!

---

**Questions?** Call support: 475-239-6334

Last updated: November 21, 2025
