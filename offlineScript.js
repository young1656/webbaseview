document.addEventListener("DOMContentLoaded", () => {
    const calorieInput = document.querySelector("input");
    const addButton = document.querySelector("button");
    const calorieLabel = document.getElementById("calorieLabel");

    let storedCalories = JSON.parse(localStorage.getItem("offlineCalories")) || [];
    if (!Array.isArray(storedCalories)) storedCalories = [];

    updateCalorieLabel();

    addButton.addEventListener("click", () => {
        const calorieValue = parseInt(calorieInput.value);

        if (!isNaN(calorieValue) && calorieValue > 0) {
            storedCalories.push(calorieValue);
            localStorage.setItem("offlineCalories", JSON.stringify(storedCalories));
            updateCalorieLabel();
            calorieInput.value = "";
        } else {
            alert("Please enter a valid calorie amount.");
        }
    });

    function updateCalorieLabel() {
        const totalCalories = storedCalories.reduce((sum, val) => sum + val, 0);
        calorieLabel.textContent = `Total Calories Entered: ${totalCalories}`;
    }
});

// ✅ Run this only when the internet is back
window.addEventListener("online", syncOfflineCalories);

async function syncOfflineCalories() {
    console.log("Internet is back! Syncing offline calories...");

    const supabaseUrl = "https://xaviosikcqoajctjones.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ";
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        console.error("User not authenticated:", userError);
        return;
    }

    let storedCalories = JSON.parse(localStorage.getItem("offlineCalories")) || [];
    let offlineCalories = storedCalories.reduce((sum, val) => sum + val, 0);

    if (offlineCalories > 0) {
        const { data, error: fetchError } = await supabase
            .from("table2")
            .select("intake")
            .eq("id", userData.user.id)
            .single();

        if (fetchError) {
            console.error("Error fetching user intake:", fetchError);
            return;
        }

        const newTotalIntake = (data?.intake || 0) + offlineCalories;

        const { error: updateError } = await supabase
            .from("table2")
            .update({ intake: newTotalIntake })
            .eq("id", userData.user.id);

        if (!updateError) {
            localStorage.removeItem("offlineCalories");
            alert("Offline calories synced successfully!");
            window.location.href = "calorieViewAndAdd.html"; // Redirect back
        } else {
            console.error("Error syncing offline calories:", updateError);
        }
    }
}
