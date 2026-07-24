
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const path = require('path');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/create-checkout-session', async (req, res) => {
  console.log('Received checkout request:', req.body);
  try {
    const { items } = req.body;

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/carte.html',
    });

    console.log('Stripe session created:', session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
