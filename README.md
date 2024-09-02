# 🎟️ Cartesi Lottery DApp 🎰

> Roll the dice with blockchain technology!

## 🚀 Quick Start

```bash
git clone <repo-url>
cd lottery-dapp
npm install
```

## 🎭 What's This?

A decentralized lottery system powered by Cartesi Rollups. Buy tickets, draw winners, and reset for endless fun!

---

## 🛠 Features

- 🎫 Buy lottery tickets
- 🏆 Random winner selection
- 📊 Real-time lottery status
- 🔄 Reset for new rounds

---

## 🎮 How to Play

### 💼 Buy a Ticket

```json
{
  "action": "buyTicket",
  "address": "0x..."
}
```

### 🎭 Draw Winner

```json
{
  "action": "drawWinner"
}
```

### 📈 Check Status

```json
{
  "action": "getLotteryStatus"
}
```

### 🔁 New Game

```json
{
  "action": "resetLottery",
  "ticketPrice": 1000000000000000000
}
```

---

## 🕵️ Inspect Commands

- `"participants"`: Who's in?
- `"prizePool"`: How much can I win?
- `"winner"`: Who's the lucky one?

---
