// Initialize Supabase
const { createClient } = window.supabase;
const supabaseUrl = "https://xaviosikcqoajctjones.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch and display user data
const profileDataDiv = document.getElementById("profile-data");

async function getSession() {
    return await supabase.auth.getSession();
}

async function getUserProfile(session) {
    if (!session || !session.data.session || !session.data.session.user) {
        console.log("No session or user found");
        return null;
    }

    const userEmail = session.data.session.user.email; // Get the email of the logged-in user

    // Fetch the profile of the currently logged-in user
    const { data: userProfile, error } = await supabase
        .from('table2')
        .select("*")
        .eq("email", userEmail); // Filter by email

    if (error) {
        console.log('Error fetching user data: ', error);
        return null;
    }

    if (userProfile.length === 0) {
        console.log("No user profile found for the logged-in user");
        return null;
    }

    return userProfile[0]; // Return the first match (should be unique by email)
}

async function fetchProfile() {
    try {
        const session = await getSession();
        const userProfile = await getUserProfile(session);

        if (userProfile) {
            console.log('User Profile: ', userProfile);
            profileDataDiv.innerHTML = `
                <p><strong>First Name:</strong> ${userProfile.firstname}</p>
                <p><strong>Last Name:</strong> ${userProfile.lastname}</p>
                <p><strong>City:</strong> ${userProfile.city}</p>
                <p><strong>Timezone:</strong> ${userProfile.timezone || "Not set"}</p>
                <p><strong>Email:</strong> ${userProfile.email}</p>
                
            `;
        } else {
            console.log("No profile found for the current user");
            profileDataDiv.innerHTML = "<p>No profile found</p>";
        }
    } catch (error) {
        console.log('Error:', error);
    }
}

fetchProfile();
