const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

async function testOrderSave() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find a test user to use as customer
    const customer = await User.findOne();
    if (!customer) {
      console.log("No users found in database. Please create a user first.");
      return;
    }

    // Find a test product to use in the order
    const product = await Product.findOne();
    if (!product) {
      console.log(
        "No products found in database. Please create a product first."
      );
      return;
    }

    // Create a test order
    const orderData = {
      customer: customer._id,
      seller: product.seller,
      items: [
        {
          product: product._id,
          quantity: 2,
          price: product.price || 10,
        },
      ],
      deliveryInfo: {
        type: "delivery",
        address: {
          street: "Test Street",
          buildingNumber: "123",
        },
      },
      payment: {
        method: "cash",
        status: "pending",
      },
      notes: {
        customer: "Test order for verification",
      },
    };

    console.log(
      "Creating test order with data:",
      JSON.stringify(orderData, null, 2)
    );

    // Create order with a temporary order number that will trigger generation of real number
    const order = new Order({ ...orderData, orderNumber: "ORD-" });
    const savedOrder = await order.save();

    console.log("Order saved successfully!");
    console.log("Order ID:", savedOrder._id);
    console.log("Order Number:", savedOrder.orderNumber);
    console.log("Customer:", savedOrder.customer);
    console.log("Seller:", savedOrder.seller);
    console.log("Items:", savedOrder.items);
    console.log("Status:", savedOrder.status);
    console.log("Total Amount:", savedOrder.totalAmount);

    // Verify the order was saved by finding it again
    const foundOrder = await Order.findById(savedOrder._id)
      .populate("customer", "name email")
      .populate("seller", "name email")
      .populate("items.product", "title price");

    console.log("\nVerified order from database:");
    console.log("Order ID:", foundOrder._id);
    console.log("Customer Name:", foundOrder.customer?.name);
    console.log("Seller Name:", foundOrder.seller?.name);
    console.log("Item Title:", foundOrder.items[0]?.product?.title);
    console.log("Item Price:", foundOrder.items[0]?.product?.price);

    // Close connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error testing order save:", error);

    // Close connection in case of error
    await mongoose.connection.close();
    console.log("Database connection closed due to error");
  }
}

// Run the test
testOrderSave();
