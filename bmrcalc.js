// Initialize Supabase
const { createClient } = window.supabase;
const supabaseUrl = "https://xaviosikcqoajctjones.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ";
let supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get DOM elements
const errorMessage = document.getElementById("error-msg");
const heightInput = document.querySelector('input[placeholder="Height (in cm)"]');
const weightInput = document.querySelector('input[placeholder="Weight (in Kg)"]');
const ageInput = document.querySelector('input[placeholder="Age"]');
const genderInput = document.querySelector('input[placeholder="Male or Female?"]');
const calorieInput = document.querySelector('input[placeholder="Calories"]');
const calculateButton = document.getElementById("calculate-bmr");
const setGoalButton = document.getElementById("set-goal");

// Add event listener to calculate button
calculateButton.addEventListener("click", async () => {
    // Retrieve input values
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    const age = parseInt(ageInput.value);
    const gender = genderInput.value.trim().toLowerCase();

    // Validate inputs
    if (isNaN(height) || isNaN(weight) || isNaN(age)) {
        errorMessage.textContent = "Please enter valid height, weight, and age values.";
        return;
    }
    if (gender !== "male" && gender !== "female") {
        errorMessage.textContent = "Please enter 'Male' or 'Female' for gender.";
        return;
    }

    // Calculate BMR and round up to the nearest integer
    const bmr =
        gender === "male"
            ? Math.ceil(10 * weight + 6.25 * height - 5 * age + 5)
            : Math.ceil(10 * weight + 6.25 * height - 5 * age - 161);

    try {
        // Get the currently logged-in user
        const { data: user, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.user) {
            errorMessage.textContent = "Error: No user is logged in.";
            return;
        }

        const userId = user.user.id; // Get the user's unique ID from Supabase Auth

        // Update the calorie_goal for the logged-in user
        const { error } = await supabase
            .from("table2")
            .update({ calorie_goal: bmr })
            .eq("id", userId)
            .select();

        if (error) {
            errorMessage.textContent = `Error updating BMR: ${error.message}`;
        } else {
            errorMessage.textContent = `BMR updated successfully! Your new BMR is ${bmr}.`;
        }

    } catch (err) {
        errorMessage.textContent = `Unexpected error: ${err.message}`;
    }
});


setGoalButton.addEventListener("click", async ()  => {

    const cals = parseInt(calorieInput.value)

    if(isNaN(cals)) {
        errorMessage.textContent = "Please enter valid calories.";
        return;
    }

    try {
        // Get the currently logged-in user
        const {data: user, error: authError} = await supabase.auth.getUser();

        if (authError || !user || !user.user) {
            errorMessage.textContent = "Error: No user is logged in.";
            return;
        }

        const userId = user.user.id; // Get the user's unique ID from Supabase Auth

        const { error } = await supabase
            .from("table2")
            .update({ calorie_goal: cals })
            .eq("id", userId)
            .select();

        if (error) {
            errorMessage.textContent = `Error updating Goal: ${error.message}`;
        } else {
            errorMessage.textContent = `Goal updated successfully! Your new Goal is ${cals}.`;
        }

    } catch (err) {
        errorMessage.textContent = `Unexpected error: ${err.message}`;
    }

    });