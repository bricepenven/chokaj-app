// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyAU3qmsD15JX6iwjloTjCPDd-2SuG6oM8w", // Exposed API Key - Restrict in Cloud Console!
  authDomain: "chokaj-4dcae.firebaseapp.com",
  projectId: "chokaj-4dcae",
  storageBucket: "chokaj-4dcae.firebasestorage.app",
  messagingSenderId: "516228224797",
  appId: "1:516228224797:web:6bdf08edb5962aad5633f4",
  measurementId: "G-9QVCF19J2W"
};

let auth;
let db; // db is declared but not used here, keep for consistency or remove if truly unused

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    // db = firebase.firestore(); // Initialize if needed
    console.log("Firebase Initialized for Login Page (Explicit Config).");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Firebase could not initialize. Auth will not work.");
    // Attempt to display error on page if possible
    document.addEventListener('DOMContentLoaded', () => { // Ensure elements exist
        const errorDiv = document.getElementById('authErrorMessage');
        if (errorDiv) {
            errorDiv.textContent = 'Core authentication service failed to load.';
            errorDiv.style.display = 'block';
        }
        // Hide the form container if auth failed
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) authContainer.style.visibility = 'hidden';
        return; // Stop execution
    }
    // Ensure auth is initialized before proceeding
    if (!auth) {
         const errorDiv = document.getElementById('authErrorMessage');
         if (errorDiv) {
             errorDiv.textContent = 'Authentication service failed to load.';
             errorDiv.style.display = 'block';
         }
         // Hide the form container if auth failed
         const authContainer = document.querySelector('.auth-container');
         if (authContainer) authContainer.style.visibility = 'hidden';
         return; // Stop execution if auth failed
    }

    // Get DOM elements
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const signInEmailInput = document.getElementById('signInEmail');
    const signInPasswordInput = document.getElementById('signInPassword');
    const signUpEmailInput = document.getElementById('signUpEmail');
    const signUpPasswordInput = document.getElementById('signUpPassword');
    const signUpConfirmPasswordInput = document.getElementById('signUpConfirmPassword');
    const errorMessageDiv = document.getElementById('authErrorMessage');
    const tabButtons = document.querySelectorAll('.tab-button');
    const authForms = document.querySelectorAll('.auth-form');
    const authContainer = document.querySelector('.auth-container');

    // Check if essential elements exist
    if (!signInForm || !signUpForm || !errorMessageDiv || !authContainer || tabButtons.length === 0 || authForms.length === 0) {
        console.error("Essential login form elements are missing from the DOM.");
        if (errorMessageDiv) {
            errorMessageDiv.textContent = 'Login form UI is broken.';
            errorMessageDiv.style.display = 'block';
        }
        if (authContainer) authContainer.style.visibility = 'hidden';
        return;
    }

    // Tab Switching Logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
            button.classList.add('active');
            const targetTabId = button.getAttribute('data-tab');
            const targetForm = document.getElementById(targetTabId);
            if (targetForm) {
                targetForm.classList.add('active');
            }
            // Clear error message when switching tabs
            errorMessageDiv.textContent = '';
            errorMessageDiv.style.display = 'none';
        });
    });

    // Error Display Function
    const showAuthError = (message) => {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    };

    // Handle Sign In Form Submission
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signInEmailInput.value;
        const password = signInPasswordInput.value;
        const button = signInForm.querySelector('button');

        // Basic validation
        if (!email || !password) {
            showAuthError("Please enter both email and password.");
            return;
        }

        errorMessageDiv.style.display = 'none'; // Hide previous errors
        button.disabled = true;
        button.textContent = 'Signing In...';
        console.log('Attempting sign in...');

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Sign in successful, redirecting to index...');
                window.location.replace('index.html'); // Use replace to avoid back button issues
            })
            .catch((error) => {
                console.error('Sign in error:', error);
                // Provide user-friendly error messages
                let friendlyMessage = `Sign in failed: ${error.message}`;
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    friendlyMessage = 'Incorrect email or password.';
                } else if (error.code === 'auth/invalid-email') {
                    friendlyMessage = 'Invalid email format.';
                }
                showAuthError(friendlyMessage);
            })
            .finally(() => {
                // Re-enable button regardless of success or failure
                button.disabled = false;
                button.textContent = 'Sign In';
            });
    });

    // Handle Sign Up Form Submission
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signUpEmailInput.value;
        const password = signUpPasswordInput.value;
        const confirmPassword = signUpConfirmPasswordInput.value;
        const button = signUpForm.querySelector('button');

        errorMessageDiv.style.display = 'none'; // Hide previous errors

        // Basic validation
        if (!email || !password || !confirmPassword) {
            showAuthError("Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            showAuthError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            showAuthError("Passwords do not match.");
            return;
        }

        button.disabled = true;
        button.textContent = 'Signing Up...';
        console.log('Attempting sign up...');

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Sign up successful, redirecting to index...');
                window.location.replace('index.html'); // Use replace
            })
            .catch((error) => {
                console.error('Sign up error:', error);
                // Provide user-friendly error messages
                let friendlyMessage = `Sign up failed: ${error.message}`;
                if (error.code === 'auth/email-already-in-use') {
                    friendlyMessage = 'This email address is already registered.';
                } else if (error.code === 'auth/invalid-email') {
                    friendlyMessage = 'Invalid email format.';
                } else if (error.code === 'auth/weak-password') {
                    friendlyMessage = 'Password is too weak.';
                }
                showAuthError(friendlyMessage);
            })
            .finally(() => {
                // Re-enable button regardless of success or failure
                button.disabled = false;
                button.textContent = 'Sign Up';
            });
    });

    // Auth State Change Listener: Redirect if already logged in
    // This listener should run once the DOM is ready and auth is potentially initialized.
    auth.onAuthStateChanged((user) => {
        console.log('Auth state changed on login page:', user ? `User ${user.uid} signed in` : 'Signed out');
        if (user) {
            // User is signed in when they load the login page.
            console.log('User already signed in, redirecting from login page to index...');
            window.location.replace('index.html'); // Redirect immediately
        } else {
            // User is signed out, make sure the login form is visible.
            console.log('User is signed out, ensuring login form is visible.');
            if (authContainer) {
                authContainer.style.visibility = 'visible'; // Make container visible
            }
        }
    });

}); // End DOMContentLoaded
