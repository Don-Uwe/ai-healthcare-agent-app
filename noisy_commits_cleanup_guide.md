# 🧹 Noisy Merge Commits Ko Clean Karne Ka Guide

Ye guide explain karta hai ki kaise ek feature branch ke messy/noisy commits ko
squash karke clean, readable history banate hain — bina kisi interactive editor ke.

---

## 🤔 Problem Kya Tha?

Feature branch `feat/deterministic-conflict-resolution` mein **10 commits** the,
jisme se kaafi noisy aur meaningless the:

```
4bc27ba fix(sync): remove duplicate...
91530c1 fix(core): update errors test...
fbbab44 merge: pull remote main...           ← noisy merge commit
4273190 fix(sync): resolve typescript...
a158865 Merge commit '1a17a4d...' of https:  ← noisy merge commit
be283ad --lock--file--deleted                ← meaningless commit
755514b Merge commit '7e03eb07...' of https  ← noisy merge commit
929efff feat: implement deterministic...
b1081c0 Merge branch 'main' into feat/...    ← noisy merge commit
5df1a42 feat: implement synchronization...
```

**Goal:** Inhe 1-2 clean, descriptive commits mein squash karna.

---

## ✅ Solution: `git reset --soft` Method

> **Kyun ye method?**
> `git rebase -i` ko ek interactive text editor chahiye (vim/nano),
> jo Windows PowerShell mein open nahi hota properly.
> `git reset --soft` zyada reliable aur simple hai Windows par.

---

## 📋 Step-by-Step Commands

### Step 1: Check kar current branch ka commit log

```bash
git log --oneline origin/main..HEAD
```

Ye dikhayega saare commits jo `origin/main` ke baad aaye hain tumhari branch mein.

---

### Step 2: Agar unstaged changes hain to stash kar lo

```bash
git status --short
```

Agar koi modified file dikhaye, stash kar lo:

```bash
git stash
```

> ⚠️ Agar working tree clean hai to ye step skip karo.

---

### Step 3: Soft reset to `origin/main`

```bash
git reset --soft origin/main
```

**Kya hota hai iske baad?**
- Saare commits undo ho jaate hain
- Lekin **saare changes staged rehte hain** (koi data loss nahi!)
- Working tree bilkul preserved rehta hai

Verify karo:
```bash
git status --short
```
Sab files `M` (modified, staged) dikhenge — ye correct hai.

---

### Step 4: Ek clean, logical commit banao

Ab poora squashed change ek commit mein karo:

```bash
git commit -m "feat(sync): implement deterministic P2P conflict resolution engine

Replaces Yjs-based sync with a state-based replication protocol built on
Vector Clocks and Lamport timestamps.

- Add SyncEngine with Inbox/Outbox queue pattern for offline-first support
- Implement Last-Writer-Wins (LWW) merge with Lamport + peer ID tiebreaker
- Implement CRDT-inspired merge for non-overlapping top-level keys
- Add logical tombstone deletes via _deleted: true for P2P replication
- Log conflicts deterministically to _sync_logs for replay debugging

Closes #589"
```

> 💡 **Tip:** Agar changes multiple concerns cover karte hain (feature + fixes + tests),
> to unhe alag-alag commits mein tod sakte ho by using `git add <specific-files>`
> before each `git commit`.

---

### Step 5: Stash pop (agar Step 2 mein stash kiya tha)

```bash
git stash pop
```

Agar stash pop ke baad koi additional change hai, use bhi commit karo:

```bash
git add .
git commit -m "chore: restore wasm-base64 and lockfile after rebase"
```

---

### Step 6: Verify clean history

```bash
git log --oneline origin/main..HEAD
```

Ab sirf 1-2 clean commits dikhne chahiye:

```
1cd2860 feat(sync): implement deterministic P2P conflict resolution engine
```

---

### Step 7: Force push to remote

> ⚠️ **`--force-with-lease` use karo, `--force` nahi!**
> `--force-with-lease` safe hai — ye push fail kar deta hai agar kisi
> aur ne bhi remote branch update kiya ho, preventing accidental overwrites.

```bash
git push origin feat/deterministic-conflict-resolution --force-with-lease
```

Output kuch aisa dikhega:
```
+ 91530c1...1cd2860 feat/deterministic-conflict-resolution -> feat/deterministic-conflict-resolution (forced update)
```

---

## 📊 Before vs After

| Before | After |
|---|---|
| 10 commits | 1 clean commit |
| Noisy messages like `--lock--file--deleted` | Descriptive conventional commit |
| Merge commits polluting history | Clean linear history |
| PR hard to review commit-by-commit | Single atomic unit — easy to review |

---

## ⚠️ Important Rules

> [!CAUTION]
> **Kabhi bhi `main` ya `develop` par `--force-with-lease` mat karo!**
> Ye sirf **apni feature branch** par karo jahan sirf tum kaam kar rahe ho.

> [!WARNING]
> Agar tumhare saath koi aur bhi us branch par kaam kar raha hai,
> to pehle unhe inform karo — force push unki local history corrupt kar sakta hai.

> [!TIP]
> Ye process PR merge se **pehle** karo, merge ke baad history rewrite possible nahi.

---

## 🔁 Quick Reference (TL;DR)

```bash
# 1. Check current state
git log --oneline origin/main..HEAD

# 2. Stash if needed
git stash

# 3. Squash all commits
git reset --soft origin/main

# 4. Re-commit cleanly
git commit -m "feat(...): your clean message"

# 5. Restore stash if needed
git stash pop

# 6. Verify
git log --oneline origin/main..HEAD

# 7. Force push (safely)
git push origin your-branch-name --force-with-lease
```
