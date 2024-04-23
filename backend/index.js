const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://yadavramesh9345:%4010072003@trial.9mksjhr.mongodb.net/?retryWrites=true&w=majority&appName=trial', {

  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define schema and model for user
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Define schema and model for motor
const motorSchema = new mongoose.Schema({
  status: { type: Boolean, required: true }
});

const Motor = mongoose.model('Motor', motorSchema);

app.use(bodyParser.json());
app.use(cors());

// Function to pre-add motor
async function preAddMotor() {
  try {
    // Check if motor already exists
    const existingMotor = await Motor.findOne();
    if (!existingMotor) {
      // If no motor exists, add it
      const motorToAdd = { status: false }; // Assuming the motor is initially off
      await Motor.create(motorToAdd);
      console.log('Pre-added motor successfully');
    }
  } catch (err) {
    console.error('Error pre-adding motor:', err);
  }
}

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if username and email are already in use
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // If user not found or password doesn't match, return error
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If authentication successful, return success message or user data
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Endpoint to get motor status
app.get('/motor-status', async (req, res) => {
  try {
    const motor = await Motor.findOne();
    if (!motor) {
      return res.status(404).json({ error: 'Motor not found' });
    }
    res.json({ status: motor.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch motor status' });
  }
});

// Endpoint to update motor status
app.post('/update-motor-status', async (req, res) => {
  const { status } = req.body;

  try {
    if (typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await Motor.updateOne({}, { status });
    res.status(200).json({ message: 'Motor status updated successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to update motor status' });
  }
});

// Start the server
app.listen(port, async () => {
  console.log(`Server is listening at http://localhost:${port}`);
  await preAddMotor(); // Pre-add motor when server starts
});
