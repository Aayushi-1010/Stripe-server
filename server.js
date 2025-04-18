require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser"); 
const cors = require("cors");

const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
app.use(cors());

app.use(bodyParser.json());

// Define a test route
app.get("/", (req, res) => {
  res.send("Stripe server is running");
});

// Create a payment route
app.post("/create-payment-intent", async (req, res) => {
  try {
    // console.log(req.body);

    const { amount, currency } = req.body;

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });  
  } catch (error) { 
    res.status(500).send({ error: error.message });
  }      
});

app.post("/create-refund", async (req, res) => {
  try {
    
    const { payment_intent } = req.body;
    
    if (!payment_intent) {
      throw new Error("Payment intent is required.");
    } 
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent,    
    });

    console.log("Refund created:", refund);

    // Send the response back to the client
    res.status(200).send({
      refund: refund,
    });
  } catch (error) {
    console.error("Error creating refund:", error);
    res.status(500).send({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
