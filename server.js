const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('Connected to Mongodb');
})
.catch((err) =>{
    console.log(err);
});;

// Create a new order
app.post('/orders/create', async (req, res) => {
  try {
    const { order_id, item_name, cost, order_date, delivery_date } = req.body;

    // Validate for duplicate orders based on order_id
    const existingOrder = await Order.findOne({ order_id });
    if (existingOrder) {
      return res.status(400).json({ error: 'Order with the same order_id already exists.' });
    }

    const newOrder = new Order({ order_id, item_name, cost, order_date, delivery_date });
    await newOrder.save();
    console.log(newOrder);

    res.json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update an order
app.post('/orders/update/:order_id', async (req, res) => {
  try {
    const { delivery_date } = req.body;
    const { order_id } = req.params;

    const updatedOrder = await Order.findOneAndUpdate(
      { order_id },
      { $set: { delivery_date } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// List all orders for a given date
app.get('/orders/list/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const formattedDate = new Date(date);

    const orders = await Order.find({ order_date: formattedDate });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Query for a specific order with Order ID
app.get('/orders/search/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await Order.findOne({ order_id });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Delete an order
app.delete('/orders/delete/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;

    const deletedOrder = await Order.findOneAndDelete({ order_id });

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
