//initalize supabase
const{createClient} = window.supabase;
const supabaseUrl = "https://xaviosikcqoajctjones.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ"
supabase = createClient(supabaseUrl, supabaseAnonKey)


//Login
const loginBtn = document.getElementById("loginBtn");
loginBtn?.addEventListener("click", async ()  =>{
    const email =document.getElementById("email").value;
    const password =document.getElementById("password").value;
    const{error, session} = await supabase.auth.signInWithPassword({email,password});

    if(error){
        document.getElementById("error-msg").textContent = error.message;
    }else{
        window.location.href='calorieViewAndAdd.html';
    }
});
//Signup
const signupBtn = document.getElementById("signup-btn");
signupBtn?.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const city = document.getElementById("city").value;
    const timezone = document.getElementById("timezone").value; // Get the selected timezone

    // Sign up the user using Supabase authentication
    const { error: signupError, user } = await supabase.auth.signUp({ email, password });

    if (signupError) {
        document.getElementById("error-msg").textContent = signupError.message;
    } else {
        // Insert the user's profile data, including the selected timezone
        const { error: insertError } = await supabase.from('table2').insert([{
            firstname: firstName,
            lastname: lastName,
            city: city,
            email: email,
            timezone: timezone  // Store the selected timezone in the database
        }]);

        if (insertError) {
            document.getElementById("error-msg").textContent = insertError.message;
        } else {
            window.location.href = 'index.html'; // Redirect to login page or main page
        }
    }
});











