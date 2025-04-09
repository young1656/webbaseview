window.addEventListener("load", () => {
    let redirecting = false;

    function checkConnection() {
        if (!navigator.onLine && !redirecting && !window.location.pathname.includes("OfflinePage.html")) {
            console.log("Offline detected, redirecting...");
            redirecting = true;
            window.location.href = "OfflinePage.html";
        }
    }

    function returnOnline() {
        if (navigator.onLine && !redirecting && window.location.pathname.includes("OfflinePage.html")) {
            console.log("Online detected, returning to main page...");
            redirecting = true;
            window.location.href = "calorieViewAndAdd.html";
        }
    }

    checkConnection();
    window.addEventListener("offline", checkConnection);
    window.addEventListener("online", returnOnline);
});
