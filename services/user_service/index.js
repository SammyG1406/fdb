import express from "express";
// import { producer } from './src/kafka.js';
import router from "./metrics/index.js";
import handleUserUpdated from "./src/handlers/userAttributesUpdated.js"

const app = express();

app.use(express.json());
app.use(router);

// await producer.connect();

app.get("/", (req, res) => {
  res.json({ service: "user_service running" });
});

app.put("/users/:user_id/profile", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { weight, height, age } = req.body;
    await userProfileUpdate(user_id, { weight, height, age });
    res.json({ success: true });
  } catch (error) {
    console.error("Error in profile update route:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

app.listen(4001, () => {
  console.log("User service running on port 4001");
});

async function userProfileUpdate(user_id, attributes) {
  await handleUserUpdated({ user_id, ...attributes });
console.log("Succesfully handled updating user and handling user goals")
}

