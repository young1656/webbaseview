// Initialize Supabase
const { createClient } = supabase;
const supabaseUrl = "https://xaviosikcqoajctjones.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Function to check and reset intake if needed
async function checkAndResetIntake(userId, timezone) {
    const { data: user, error } = await supabaseClient
        .from("table2")
        .select("last_reset, intake, intake_1_day_ago, intake_2_days_ago, intake_3_days_ago, intake_4_days_ago")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching user data:", error);
        return;
    }

    const nowUtc = new Date(); // Current UTC time from Supabase
    const nowLocal = new Date(nowUtc.toLocaleString("en-US", { timeZone: timezone })); // Convert to user’s timezone

    let lastResetLocal = null;
    if (user.last_reset) {
        const lastResetUtc = new Date(user.last_reset);
        lastResetLocal = new Date(lastResetUtc.toLocaleString("en-US", { timeZone: timezone })); // Convert last_reset to user’s timezone
    }

    // Check if the last reset was NOT today (prevents multiple resets in one day)
    if (!lastResetLocal || lastResetLocal.toDateString() !== nowLocal.toDateString()) {
        console.log(`Resetting intake for user ${userId} at midnight in ${timezone}`);

        // Shift intake history
        const updates = {
            intake_5_days_ago: user.intake_4_days_ago,
            intake_4_days_ago: user.intake_3_days_ago,
            intake_3_days_ago: user.intake_2_days_ago,
            intake_2_days_ago: user.intake_1_day_ago,
            intake_1_day_ago: user.intake,
            intake: 0, // Reset intake
            last_reset: nowUtc.toISOString() // Store the new reset timestamp in UTC
        };

        const { error: updateError } = await supabaseClient
            .from("table2")
            .update(updates)
            .eq("id", userId);

        if (updateError) {
            console.error("Error updating intake data:", updateError);
        } else {
            console.log(`Intake successfully reset for user ${userId}`);
        }
    }
}

// Call the function when the app loads (Assuming user is logged in)
async function initializeApp() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        const { data: userData, error } = await supabaseClient
            .from("table2")
            .select("timezone")
            .eq("id", user.id)
            .single();

        if (!error && userData) {
            await checkAndResetIntake(user.id, userData.timezone);
        }
    }
}

// Run the function when the page loads
initializeApp();