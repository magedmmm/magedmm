import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    const { priceId, customerEmail } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/pricing`,
        customer_email: customerEmail,
      });
      res.json({ id: session.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Auto-Reply
  app.post("/api/ai-reply", async (req, res) => {
    if (!genAI) return res.status(500).json({ error: "Gemini API not configured" });
    const { message, context } = req.body;

    try {
      const result = await genAI!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [{
            text: `You are a helpful customer support AI for a website. 
            Context about the website: ${context}
            Customer message: ${message}
            Provide a concise and helpful response.`
          }]
        }]
      });
      res.json({ reply: result.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Socket.io for Real-time Messaging
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on("send-message", (data) => {
      // Data should include conversationId, text, senderId, senderType
      io.to(data.conversationId).emit("new-message", data);
    });

    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("user-typing", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Serve the widget script
  app.get("/widget.js", (req, res) => {
    const apiKey = req.query.key;
    // In a real app, you'd generate this dynamically or serve a static file that fetches config
    res.setHeader("Content-Type", "application/javascript");
    res.send(`
      (function() {
        const apiKey = "${apiKey}";
        const container = document.createElement('div');
        container.id = 'anychat-widget-root';
        document.body.appendChild(container);

        const iframe = document.createElement('iframe');
        iframe.src = "${process.env.APP_URL}/widget?key=" + apiKey;
        iframe.style.position = 'fixed';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
        iframe.style.width = '400px';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.zIndex = '999999';
        iframe.style.borderRadius = '12px';
        iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        container.appendChild(iframe);
      })();
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
