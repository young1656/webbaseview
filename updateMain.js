// Initialize Supabase
const { createClient } = supabase;
const supabaseUrl = "https://xaviosikcqoajctjones.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Select elements
const inputField = document.getElementById("calories-input");
const addButton = document.getElementById("add-calories-btn");
const errorMsg = document.getElementById("error-msg");
const caloriesRemaining = document.getElementById("calorie-display");

// Function to fetch the logged-in user
async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
        console.error("User not logged in:", error);
        errorMsg.textContent = "Error: Please log in.";
        return null;
    }
    return user.id;
}

// Function to check and reset intake if needed
async function checkAndResetIntake(userId, timezone) {
    const { data: user, error } = await supabaseClient
        .from("table2")
        .select("last_reset, intake, intake_1_day_ago, intake_2_days_ago, intake_3_days_ago, intake_4_days_ago, intake_5_days_ago, calorie_goal")
        .eq("id", userId)
        .single();

    if (error || !user) {
        console.error("Error fetching user data:", error);
        return;
    }

    const nowUtc = new Date(); // Current UTC time
    const nowLocal = new Date(nowUtc.toLocaleString("en-US", { timeZone: timezone })); // Convert to user's timezone

    let lastResetLocal = null;
    if (user.last_reset) {
        const lastResetUtc = new Date(user.last_reset);
        lastResetLocal = new Date(lastResetUtc.toLocaleString("en-US", { timeZone: timezone }));
    }

    if (!lastResetLocal || lastResetLocal.toDateString() !== nowLocal.toDateString()) {
        console.log(`Resetting intake for user ${userId} at midnight in ${timezone}`);

        const updates = {
            intake_5_days_ago: user.intake_4_days_ago,
            intake_4_days_ago: user.intake_3_days_ago,
            intake_3_days_ago: user.intake_2_days_ago,
            intake_2_days_ago: user.intake_1_day_ago,
            intake_1_day_ago: user.intake,
            intake: 0,
            last_reset: nowUtc.toISOString()
        };

        const { error: updateError } = await supabaseClient
            .from("table2")
            .update(updates)
            .eq("id", userId);

        if (updateError) {
            console.error("Error resetting intake:", updateError);
        }
    }
}

// Function to fetch and update the calorie display
async function updateCalorieDisplay(userId) {
    const { data, error } = await supabaseClient
        .from("table2")
        .select("calorie_goal, intake, timezone")
        .eq("id", userId)
        .single();

    if (error || !data) {
        console.error("Error fetching user data:", error);
        errorMsg.textContent = "Error fetching data.";
        return;
    }

    await checkAndResetIntake(userId, data.timezone); // Ensure intake is reset before displaying
    caloriesRemaining.textContent = data.calorie_goal - data.intake;
}

// Function to add calories to intake
async function addCalories() {
    const userId = await getCurrentUser();
    if (!userId) return;

    const calsToAdd = parseInt(inputField.value);
    if (isNaN(calsToAdd) || calsToAdd <= 0) {
        errorMsg.textContent = "Please enter a valid number!";
        return;
    }
    console.log("Calories to add:", inputField.value);


    const { data, error } = await supabaseClient
        .from("table2")
        .select("intake")
        .eq("id", userId)
        .single();

    if (error || !data) {
        errorMsg.textContent = "Error fetching intake!";
        console.error(error);
        return;
    }

    const newIntake = data.intake + calsToAdd;

    const { error: updateError } = await supabaseClient
        .from("table2")
        .update({ intake: newIntake })
        .eq("id", userId);

    if (updateError) {
        errorMsg.textContent = "Error updating intake!";
        console.error(updateError);
        return;
    }

    inputField.value = ""; // Clear input field
    await updateCalorieDisplay(userId); // Refresh displayed calories
}

// Initialize the app
(async () => {
    const userId = await getCurrentUser();
    if (userId) await updateCalorieDisplay(userId);
})();

// Event Listener for Button
addButton.addEventListener("click", addCalories);
