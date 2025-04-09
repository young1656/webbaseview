// Initialize supabase
const { createClient } = window.supabase;
const supabaseUrl = "https://xaviosikcqoajctjones.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const cityInput = document.getElementById('city');
const timezoneInput = document.getElementById('timezone');
const updateButton = document.getElementById('update-btn');
const errorMessage = document.getElementById('error-msg');

// Get the session
async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.log('Error fetching The session: ', error);
        return null;
    }
    return data.session;
}

// Update the user profile
async function getUserProfile(session) {
    const userEmail = session.user.email;

    const updates = {
        firstname: firstNameInput.value,
        lastname: lastNameInput.value,
        city: cityInput.value,
        timezone: timezoneInput.value,  // Update the timezone in the database
    };

    const { data, error } = await supabase
        .from('table2')
        .update(updates)
        .eq('email', userEmail);

    if (error) {
        console.log('Error updating user data: ', error);
        errorMessage.innerHTML = 'Error updating profile';
        return;
    }

    errorMessage.innerHTML = 'Profile updated successfully';
}

// Make the button work
updateButton.addEventListener('click', async () => {
    const session = await getSession();
    if (session) {
        await getUserProfile(session);
    } else {
        errorMessage.innerHTML = "No active session, log in pls";
    }
});
