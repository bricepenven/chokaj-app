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
let db;
let storage;
let firebaseInitialized = false; // Track initialization success

// --- Main Form Logic (including Auth Button UI) ---
try {
    document.addEventListener('DOMContentLoaded', () => {

        // Initialize Firebase INSIDE DOMContentLoaded
        try {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            storage = firebase.storage();
            firebaseInitialized = true;
            console.log("Firebase Initialized for Main Form (Explicit Config).");
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            firebaseInitialized = false;
             // Display error now that DOM is ready
             const errorDiv = document.createElement('div');
             errorDiv.style.cssText = 'color: #f8d7da; background-color: #721c24; padding: 15px; margin: 20px auto; border: 1px solid #f5c6cb; border-radius: 8px; max-width: 560px; text-align: center; font-weight: bold; position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 2000;';
             errorDiv.textContent = `Fatal Error: Could not initialize Firebase services. Form cannot function.`;
             document.body.prepend(errorDiv);
             document.body.prepend(errorDiv);
             document.body.prepend(errorDiv);
             return; // Stop form initialization
        }

        // Explicitly check if firebase object exists before proceeding
        if (typeof firebase === 'undefined') {
            console.error("FATAL: Firebase SDK core object not found. Scripts may not have loaded correctly.");
            firebaseInitialized = false;
            alert("Core Firebase library failed to load. Please check your connection and refresh.");
             const errorDiv = document.createElement('div');
             errorDiv.style.cssText = 'color: #f8d7da; background-color: #721c24; padding: 15px; margin: 20px auto; border: 1px solid #f5c6cb; border-radius: 8px; max-width: 560px; text-align: center; font-weight: bold; position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 2000;';
             errorDiv.textContent = `Fatal Error: Core Firebase library failed to load. Form cannot function.`;
             document.body.prepend(errorDiv);
            return; // Stop execution
        }


        // Proceed only if Firebase initialized successfully
        if (!firebaseInitialized) {
             console.error("Firebase did not initialize successfully. Stopping script execution.");
             // Rely on the error message shown in the catch block
             return;
        }


        // --- Auth Button UI Logic (Moved inside main DOMContentLoaded) ---
        const authBtn = document.getElementById('authBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const authBtnContainer = document.getElementById('authBtnContainer');

        if (!auth) { // Redundant check, but safe
            console.error("Auth service not initialized, hiding buttons.");
            if(authBtnContainer) authBtnContainer.style.display = 'none';
        } else {
             // Initial check for auth state
             const initialUser = auth.currentUser;
             console.log('Initial user state on DOM load:', initialUser ? 'Signed in' : 'Signed out');
             if (initialUser) {
                  if (authBtn) authBtn.style.display = 'none';
                  if (logoutBtn) logoutBtn.style.display = 'block';
             } else {
                  if (authBtn) authBtn.style.display = 'block';
                  if (logoutBtn) logoutBtn.style.display = 'none';
             }

            // Listen for auth state changes
            auth.onAuthStateChanged((user) => {
                console.log('Auth state changed:', user ? 'Signed in' : 'Signed out');
                if (user) {
                    if (authBtn) authBtn.style.display = 'none';
                    if (logoutBtn) logoutBtn.style.display = 'block';
                } else {
                    if (authBtn) authBtn.style.display = 'block';
                    if (logoutBtn) logoutBtn.style.display = 'none';
                }
            });

            // Auth button directs to login page
            if (authBtn) {
                authBtn.addEventListener('click', () => {
                    console.log('Sign In button clicked, redirecting to login...');
                    // Use relative path which works correctly on subdirectories like GitHub Pages
                    window.location.href = 'login.html';
                });
            }

            // Logout button signs user out
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    console.log('Logout button clicked...');
                    try {
                        await auth.signOut();
                        console.log('Sign out successful');
                    } catch (error) {
                        console.error('Error signing out:', error);
                        alert('Error signing out. Please try again.');
                    }
                });
            }
        }
        // --- End Auth Button UI Logic ---


        // --- Main Form Element Refs and Logic ---
        // ... Make sure the generateAiPrompts function uses the correct date/duration fields ...
        console.log("DOM fully loaded. Initializing Chokaj Form script...");
        const form=document.getElementById('eventForm');const steps=Array.from(form.querySelectorAll('.form-step'));const TOTAL_STEPS=steps.length;const submitButton=document.getElementById('confirmPlanBtn');const getLocationButton=document.getElementById('getLocationBtn');const cityInput=document.getElementById('city');const countryInput=document.getElementById('country');const eventTypeSelect=document.getElementById('eventType');const otherEventTypeContainer=document.getElementById('otherEventTypeContainer');const otherEventTypeInput=document.getElementById('otherEventType');const eventStyleSelect=document.getElementById('eventStyle');const otherEventStyleContainer=document.getElementById('otherEventStyleContainer');const otherEventStyleInput=document.getElementById('otherEventStyle');const foodStyleSelect=document.getElementById('foodStyle');const otherFoodStyleContainer=document.getElementById('otherFoodStyleContainer');const otherFoodStyleInput=document.getElementById('otherFoodStyle');const modalOverlay=document.getElementById('modalOverlay');const modalTitle=document.getElementById('modalTitle');const modalMessage=document.getElementById('modalMessage');const modalConfirmBtn=document.getElementById('modalConfirmBtn');const modalCancelBtn=document.getElementById('modalCancelBtn');const locationStatusArea=document.getElementById('locationStatus');const inspirationPhotosInput=document.getElementById('inspirationPhotos');const inspirationPreview=document.getElementById('inspirationPreview');const inspirationNotesInput=document.getElementById('inspirationNotes');const citySuggestionsContainer=document.getElementById('citySuggestions');const eventDateInput=document.getElementById('eventStartDateTime');const eventDurationSelect=document.getElementById('eventDuration');const customDurationContainer=document.getElementById('customDurationContainer');const customDurationInput=document.getElementById('customDuration');const summaryContentDiv=document.getElementById('summaryContent');const inspirationUploadContainer=document.getElementById('inspirationUploadContainer');
        if(!form||!submitButton||!modalOverlay||!inspirationUploadContainer)throw new Error("Core form elements missing.");if(!modalTitle||!modalMessage||!modalConfirmBtn||!modalCancelBtn)console.error("Modal elements missing!");if(!eventDateInput||!eventDurationSelect||!customDurationContainer||!customDurationInput)console.error("Date/Duration step elements missing!");
        let currentStep=1;const initialFormData={firstName:'',lastName:'',age:null,projectName:'',eventStartDateTime:null,eventDuration:'',customDuration:'',city:'',country:'',eventType:'',otherEventType:'',eventStyle:'',otherEventStyle:'',numPeople:null,foodNeeded:null,foodStyle:'',otherFoodStyle:'',foodBudgetPerPerson:null,budget:null,inspirationNotes:'',inspirationPhotosInfo:[]};let formData={...initialFormData};const foodSteps=[9,10];let selectedInspirationFiles=[];let confirmCallback=null;let statusTimeout=null;let debounceTimer=null;const MAX_INSPIRATION_FILES=1;let isModalCurrentlyVisible=false;
        const formatDateField=(date)=>{if(!date)return null;return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
        const formatTimeField=(date)=>{if(!date)return null;const hours=date.getHours();const minutes=String(date.getMinutes()).padStart(2,'0');const ampm=hours>=12?'PM':'AM';const hours12=hours%12||12;return`${String(hours12).padStart(2,'0')}:${minutes} ${ampm}`;}
        if(eventDateInput&&typeof flatpickr==='function'){console.log("Initializing Flatpickr (Single + Time)...");flatpickr(eventDateInput,{enableTime:true,dateFormat:"Y-m-d H:i",altInput:true,altFormat:"M j, Y h:i K",minDate:"today",minuteIncrement:15,time_24hr:false,theme:"dark",onChange:function(selectedDates,dateStr,instance){if(selectedDates.length>0){formData.eventStartDateTime=dateStr;console.log("Flatpickr onChange - formData.eventStartDateTime set to:",dateStr);}else{formData.eventStartDateTime=null;}},onReady:function(selectedDates,dateStr,instance){if(instance.input.value&&!formData.eventStartDateTime){formData.eventStartDateTime=instance.input.value;}console.log("Flatpickr ready. Initial date/time:",formData.eventStartDateTime);}});console.log("Flatpickr initialized for #eventStartDateTime");}else{}
        const showStep=(stepNumber)=>{console.log(`Attempting show step: ${stepNumber}. Food: ${formData.foodNeeded}`);if(stepNumber<1||stepNumber>TOTAL_STEPS)return;if(formData.foodNeeded==='no'&&foodSteps.includes(stepNumber)){let nextStepNum=stepNumber;while(foodSteps.includes(nextStepNum)){nextStepNum++;}stepNumber=nextStepNum;if(stepNumber>TOTAL_STEPS)stepNumber=TOTAL_STEPS;console.log(`Skipped food, -> step: ${stepNumber}`);}steps.forEach((step)=>step.classList.remove('active-step'));const targetStepElement=steps.find(step=>parseInt(step.dataset.step,10)===stepNumber);if(targetStepElement){targetStepElement.classList.add('active-step');currentStep=stepNumber;const firstInput=targetStepElement.querySelector('input:not([type="radio"]):not([type="file"]):not([type="checkbox"]), select, textarea');if(firstInput&&firstInput.id!=='eventStartDateTime')setTimeout(()=>{try{firstInput.focus();}catch(e){}},50);else{const firstRadio=targetStepElement.querySelector('input[type="radio"]');if(firstRadio)setTimeout(()=>{try{firstRadio.focus();}catch(e){}},50);}console.log(`Showing Step: ${currentStep}`);}else{console.error(`Step element ${stepNumber} not found.`);showStep(1);}};
        const collectStepData=(stepNumToCollect)=>{console.log(`Collecting step ${stepNumToCollect}`);try{switch(stepNumToCollect){case 1:formData.firstName=document.getElementById('firstName')?.value.trim()??'';formData.lastName=document.getElementById('lastName')?.value.trim()??'';const ageInput=document.getElementById('age');formData.age=ageInput?.value?parseInt(ageInput.value,10):null;break;case 2:formData.projectName=document.getElementById('projectName')?.value.trim()??'';break;case 3:formData.eventDuration=eventDurationSelect?.value??'';formData.customDuration=(formData.eventDuration==='Other')?customDurationInput?.value.trim()??'':'';console.log(`Collected step 3: StartDateTime=${formData.eventStartDateTime}, Duration=${formData.eventDuration}, Custom=${formData.customDuration}`);break;case 4:formData.city=cityInput?.value.trim()??'';formData.country=countryInput?.value.trim()??'';break;case 5:formData.eventType=eventTypeSelect?.value??'';formData.otherEventType=(formData.eventType==='Other')?otherEventTypeInput?.value.trim()??'':'';break;case 6:formData.eventStyle=eventStyleSelect?.value??'';formData.otherEventStyle=(formData.eventStyle==='Other')?otherEventStyleInput?.value.trim()??'':'';break;case 7:const np=document.getElementById('numPeople');formData.numPeople=np?.value?parseInt(np.value,10):null;break;case 8:const sr=form.querySelector('input[name="foodNeeded"]:checked');formData.foodNeeded=sr?sr.value:null;if(formData.foodNeeded==='no'){formData.foodStyle='';formData.otherFoodStyle='';formData.foodBudgetPerPerson=null;if(foodStyleSelect)foodStyleSelect.value='';if(otherFoodStyleInput)otherFoodStyleInput.value='';const foodBudgetInput=document.getElementById('foodBudgetPerPerson');if(foodBudgetInput)foodBudgetInput.value='';handleOtherOption(foodStyleSelect,otherFoodStyleContainer);}break;case 9:if(formData.foodNeeded==='yes'){formData.foodStyle=foodStyleSelect?.value??'';formData.otherFoodStyle=(formData.foodStyle==='Other')?otherFoodStyleInput?.value.trim()??'':'';}break;case 10:if(formData.foodNeeded==='yes'){const fb=document.getElementById('foodBudgetPerPerson');formData.foodBudgetPerPerson=fb?.value?parseFloat(fb.value):null;}break;case 11:const b=document.getElementById('budget');formData.budget=b?.value?parseFloat(b.value):null;break;case 12:formData.inspirationNotes=inspirationNotesInput?.value.trim()??'';formData.inspirationPhotosInfo=selectedInspirationFiles.map(f=>({name:f.name,size:f.size,type:f.type}));break;}}catch(error){console.error(`Error collecting data step ${stepNumToCollect}:`,error);}};
        const handleOtherOption=(selectElement,containerElement)=>{if(selectElement&&containerElement){containerElement.style.display=(selectElement.value==='Other')?'block':'none';const customInput=containerElement.querySelector('input, textarea');if(customInput){customInput.required=(selectElement.value==='Other');}}};
        // Updated showLocationStatus to handle duration=0 or null correctly
        const showLocationStatus=(message,type='info',duration=4000)=>{if(!locationStatusArea)return;clearTimeout(statusTimeout);locationStatusArea.textContent=message;locationStatusArea.className=`status-${type}`;locationStatusArea.classList.add('visible');if(duration!==null&&duration>0){statusTimeout=setTimeout(()=>{locationStatusArea.classList.remove('visible');},duration);}else if(duration===null||duration===0){/* Keep visible indefinitely */}else{statusTimeout=setTimeout(()=>{locationStatusArea.classList.remove('visible');},4000);}};const hideLocationStatus=()=>{if(locationStatusArea){clearTimeout(statusTimeout);locationStatusArea.classList.remove('visible');}};

        // --- Implemented Geolocation ---
        const handleGetLocation = async () => {
            console.log("Attempting to get location...");
            if (!navigator.geolocation) {
                showLocationStatus("Geolocation is not supported by your browser.", 'error', 5000);
                return;
            }

            const cityInput = document.getElementById('city');
            const countryInput = document.getElementById('country');
            if (!cityInput || !countryInput) {
                 console.error("City or Country input not found");
                 showLocationStatus("Form error: Location fields missing.", 'error', 5000);
                 return;
            }

            showLocationStatus("Fetching your location...", 'info', null); // Keep message displayed until result

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false, // Lower accuracy is often faster and sufficient
                        timeout: 10000, // 10 seconds
                        maximumAge: 60000 // Allow cached position up to 1 minute old
                    });
                });

                const { latitude, longitude } = position.coords;
                console.log(`Location obtained: Lat ${latitude}, Lon ${longitude}`);
                showLocationStatus("Location found. Fetching address details...", 'info', null);

                // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`);

                if (!response.ok) {
                    throw new Error(`Nominatim API request failed: ${response.statusText} (Status: ${response.status})`);
                }

                const data = await response.json();
                console.log("Nominatim response:", data);

                if (data && data.address) {
                    // Prioritize city/town/village, fallback to county if needed
                    const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                    const country = data.address.country || '';

                    if (city) cityInput.value = city;
                    if (country) countryInput.value = country;

                    // Manually trigger input event if value changed, useful for validation/state updates
                    if (city) cityInput.dispatchEvent(new Event('input', { bubbles: true }));
                    if (country) countryInput.dispatchEvent(new Event('input', { bubbles: true }));


                    if (city || country) {
                         showLocationStatus(`Location set: ${city ? city + (country ? ', ' : '') : ''}${country}`, 'success', 5000);
                    } else {
                         showLocationStatus("Could not determine city/country from location.", 'warn', 5000);
                    }
                } else {
                    showLocationStatus("Could not parse address details from location.", 'warn', 5000);
                }

            } catch (error) {
                console.error("Geolocation or Reverse Geocoding Error:", error);
                let message = "Could not get location.";
                if (error.code === 1) { // PERMISSION_DENIED
                    message = "Location permission denied. Please enable it in your browser settings.";
                } else if (error.code === 2) { // POSITION_UNAVAILABLE
                    message = "Location information is unavailable.";
                } else if (error.code === 3) { // TIMEOUT
                    message = "Getting location timed out.";
                } else if (error.message && error.message.includes('Nominatim')) {
                    message = "Could not fetch address details. Please try again later or enter manually.";
                }
                showLocationStatus(message, 'error', 8000); // Show error longer
            }
        };
        // --- End Geolocation ---

        // ========================================================================
        // TODO: IMPLEMENT REMAINING MISSING HELPER FUNCTIONS HERE
        // ========================================================================
        const handleFileSelect = (event) => {
            const files = event.target.files;
            if (!inspirationPreview) {
                console.error("Inspiration preview container not found.");
                return;
            }
        
            inspirationPreview.innerHTML = ''; // Clear any existing preview
            selectedInspirationFiles = [];    // Clear stored files array
        
            if (files.length > 0) {
                const file = files[0]; // We only care about the first file due to MAX_INSPIRATION_FILES = 1
        
                if (!file.type.startsWith('image/')) {
                    showInfoModalWithFlag("Invalid File Type", "Please select an image file (e.g., JPG, PNG, GIF).");
                    if (inspirationPhotosInput) inspirationPhotosInput.value = null; // Reset file input
                    return;
                }
        
                // Add to selected files array
                selectedInspirationFiles.push(file);
        
                // Create preview element
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
        
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = "Inspiration preview"; // Accessibility
                img.onload = () => {
                    URL.revokeObjectURL(img.src); // Free memory once loaded
                };
        
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button'; // Prevent form submission
                removeBtn.className = 'remove-img-btn';
                removeBtn.innerHTML = '&times;'; // '×' character
                removeBtn.setAttribute('aria-label', 'Remove image'); // Accessibility
        
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                inspirationPreview.appendChild(previewItem);
                console.log("Inspiration image preview added:", file.name);
            } else {
                console.log("No file selected or selection cleared by browser.");
            }
        };

        const handleRemoveImage = (event) => {
            if (event.target.classList.contains('remove-img-btn')) {
                const previewItem = event.target.closest('.preview-item');
                if (previewItem) {
                    previewItem.remove();
                }
                selectedInspirationFiles = []; // Clear the stored file
                if (inspirationPhotosInput) {
                    inspirationPhotosInput.value = null; // Reset file input to allow re-selection
                }
                console.log("Inspiration image removed via handleRemoveImage.");
            }
        };

        function debounce(func,wait){ let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }
        const fetchSuggestions=async(query)=>{ console.warn("fetchSuggestions function not implemented."); /* ... Actual implementation needed ... */ return []; };
        const displaySuggestions=(suggestionsData)=>{ console.warn("displaySuggestions function not implemented."); /* ... Actual implementation needed ... */};
        const debouncedFetch=debounce(fetchSuggestions,400);

        // --- Modal Helper Functions ---
        const showModalBase = (makeVisible) => {
            if (!modalOverlay) {
                console.error("Modal overlay not found for showModalBase.");
                return false;
            }
            modalOverlay.classList.toggle('visible', makeVisible);
            isModalCurrentlyVisible = makeVisible;
            return true;
        };
        
        const hideModalWithFlag = () => {
            if (!modalOverlay) return; // Nothing to do if overlay isn't there
            showModalBase(false); // Hide the modal
            confirmCallback = null; // Clear any stored callback

            // Reset modal buttons to a default state
            if (modalCancelBtn) {
                modalCancelBtn.style.display = ''; // Or 'inline-block' or 'block' depending on CSS
            }
            if (modalConfirmBtn) {
                modalConfirmBtn.textContent = "Confirm"; // Default text
                // Remove specific listeners if they were added directly, though general one should be okay
            }
        };

        const showInfoModalWithFlag = (title, message) => {
            console.log(`Show info modal: ${title}`);
            if (!showModalBase(true)) {
                alert(`Info: ${title}\n\n${message}`); // Fallback alert
                return;
            }
            if (!modalTitle || !modalMessage || !modalConfirmBtn || !modalCancelBtn) {
                console.error("Modal content elements (title, message, buttons) not found for info modal.");
                showModalBase(false); // Hide overlay if content is missing
                alert(`Info: ${title}\n\n${message}`); // Fallback
                return;
            }
        
            modalTitle.textContent = title;
            modalMessage.innerHTML = message; // Allow HTML in message
        
            if (modalConfirmBtn) {
                modalConfirmBtn.textContent = "OK";
                // Clone and replace to manage listeners specifically for this "OK" button.
                const newConfirmBtn = modalConfirmBtn.cloneNode(true);
                modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
                document.getElementById('modalConfirmBtn').addEventListener('click', hideModalWithFlag, { once: true });
            }
            if (modalCancelBtn) {
                modalCancelBtn.style.display = 'none'; // Hide cancel for info modal
            }
        };
        
        const showModalWithFlag = (title, message, onConfirm) => {
            console.log(`Show confirm modal: ${title}`);
            if (!showModalBase(true)) {
                 // Fallback confirmation
                if (confirm(`${title}\n\n${message}`)) { // Standard browser confirm
                    if (typeof onConfirm === 'function') onConfirm();
                }
                return;
            }
            if (!modalTitle || !modalMessage || !modalConfirmBtn || !modalCancelBtn) {
                console.error("Modal content elements (title, message, buttons) not found for confirm modal.");
                showModalBase(false); // Hide overlay
                if (confirm(`${title}\n\n${message}`)) { // Fallback
                    if (typeof onConfirm === 'function') onConfirm();
                }
                return;
            }
        
            modalTitle.textContent = title;
            modalMessage.innerHTML = message;
            confirmCallback = onConfirm; // Store the callback for the main confirm button listener
        
            if (modalConfirmBtn) {
                modalConfirmBtn.textContent = "Confirm"; // Or make dynamic
                // The existing generic listener for modalConfirmBtn will call confirmCallback and hideModalWithFlag
            }
            if (modalCancelBtn) {
                modalCancelBtn.style.display = ''; // Ensure cancel is visible
            }
        };
        // --- End Modal Helper Functions ---

        const validateStepWithFlag = (stepNumToValidate) => {
            console.log(`Validating step ${stepNumToValidate}`);
            const stepElement = steps.find(s => parseInt(s.dataset.step, 10) === stepNumToValidate);
        
            if (!stepElement) {
                console.error(`Step element ${stepNumToValidate} not found for validation.`);
                showInfoModalWithFlag("Form Error", "A problem occurred with the form structure. Please refresh and try again.");
                return false;
            }
        
            // Fields in Mood Board (step 12) are not mandatory by default.
            // HTML for step 12 inputs (inspirationPhotos, inspirationNotes) does not have 'required'.
            // If any field in step 12 *were* marked 'required', checkValidity() would catch it.
            // This explicit skip is for the general case where step 12 fields are optional.
            if (stepNumToValidate === 12) {
                return true;
            }
        
            const inputsToValidate = stepElement.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea');
            let firstInvalidElement = null;
        
            // Clear previous invalid states for the current step
            stepElement.querySelectorAll('.invalid-input').forEach(el => {
                el.classList.remove('invalid-input');
                el.title = ''; // Clear previous tooltip
            });
        
            for (const input of inputsToValidate) {
                // `checkValidity()` respects the `required` attribute/property,
                // `type` (e.g., email, number), `min`, `max`, `pattern`, etc.
                // The `handleOtherOption` function correctly sets `.required` for conditional fields.
                if (!input.checkValidity()) {
                    firstInvalidElement = input;
                    break; 
                }
            }
        
            if (firstInvalidElement) {
                let fieldName = firstInvalidElement.name || firstInvalidElement.id;
                const label = stepElement.querySelector(`label[for="${firstInvalidElement.id}"]`);
                if (label && label.textContent) {
                    fieldName = label.textContent.replace(':', '').trim();
                }
        
                // Use the browser's validation message if available, otherwise a generic one.
                const message = firstInvalidElement.validationMessage || `The field "${fieldName}" is required or has an invalid value. Please correct it.`;
                
                const isInvalidElementVisible = firstInvalidElement.offsetWidth > 0 || firstInvalidElement.offsetHeight > 0 || firstInvalidElement.getClientRects().length > 0;
        
                if (isInvalidElementVisible && typeof firstInvalidElement.focus === 'function') {
                    firstInvalidElement.focus();
                } else if (!isInvalidElementVisible && firstInvalidElement.type !== 'hidden') {
                    // Log if a required field is hidden but invalid. This might indicate a form logic issue.
                    console.warn(`Field "${fieldName}" is hidden but failing validation.`);
                }
                
                firstInvalidElement.classList.add('invalid-input');
                firstInvalidElement.title = message; // Set tooltip message
                
                // Auto-remove class and tooltip on interaction
                const eventType = (firstInvalidElement.tagName === 'SELECT' || ['radio', 'checkbox'].includes(firstInvalidElement.type)) ? 'change' : 'input';
                firstInvalidElement.addEventListener(eventType, () => {
                    firstInvalidElement.classList.remove('invalid-input');
                    firstInvalidElement.title = ''; // Clear tooltip
                    // Optionally, if it becomes valid, one could hide the modal, but that's more complex.
                }, { once: true });
        
                // showInfoModalWithFlag("Missing or Invalid Information", message); // Modal removed
                return false;
            }
        
            return true; // All validated inputs in the step are valid
        };
        const generateAiPrompts=(data)=>{ console.warn("generateAiPrompts function not implemented."); /* ... Actual implementation needed ... */ return { prompt1: "Prompt 1 not generated.", prompt2: "Prompt 2 not generated." }; /* Placeholder */ };
        const generateSummary = () => {
            if (!summaryContentDiv) {
                console.error("Summary content div not found.");
                return;
            }
            console.log("Generating summary with formData:", formData);
        
            summaryContentDiv.innerHTML = ''; // Clear previous summary
        
            const createSummaryItem = (label, value, isHtml = false) => {
                if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                    return ''; // Don't display if value is empty
                }
                const p = document.createElement('p');
                const strong = document.createElement('strong');
                strong.textContent = `${label}: `;
                p.appendChild(strong);
                if (isHtml) {
                    const span = document.createElement('span');
                    span.innerHTML = value;
                    p.appendChild(span);
                } else {
                    p.appendChild(document.createTextNode(String(value)));
                }
                return p;
            };
        
            const appendIfExists = (element) => {
                if (element && element.textContent.includes(':') && !element.textContent.endsWith(': ')) { // Basic check to see if value was added
                    summaryContentDiv.appendChild(element);
                }
            };
            
            const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

            appendIfExists(createSummaryItem('Event Nickname', formData.projectName));
            appendIfExists(createSummaryItem('Your Name', `${formData.firstName || ''} ${formData.lastName || ''}`.trim()));
            if (formData.age) appendIfExists(createSummaryItem('Age', formData.age));
            
            if (formData.eventStartDateTime) {
                const dateObj = new Date(formData.eventStartDateTime);
                const formattedDateTime = !isNaN(dateObj.getTime()) ? 
                    `${dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} at ${dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`
                    : 'Not specified';
                appendIfExists(createSummaryItem('Event Date & Time', formattedDateTime));
            }
            
            let durationDisplay = formData.eventDuration;
            if (formData.eventDuration === 'Other' && formData.customDuration) {
                durationDisplay = formData.customDuration;
            }
            appendIfExists(createSummaryItem('Approx. Duration', durationDisplay));

            appendIfExists(createSummaryItem('Location', `${formData.city || ''}${formData.city && formData.country ? ', ' : ''}${formData.country || ''}`.trim()));
            
            let eventTypeDisplay = formData.eventType;
            if (formData.eventType === 'Other' && formData.otherEventType) {
                eventTypeDisplay = formData.otherEventType;
            }
            appendIfExists(createSummaryItem('Event Type', eventTypeDisplay));

            let eventStyleDisplay = formData.eventStyle;
            if (formData.eventStyle === 'Other' && formData.otherEventStyle) {
                eventStyleDisplay = formData.otherEventStyle;
            }
            appendIfExists(createSummaryItem('Event Style/Theme', eventStyleDisplay));

            if (formData.numPeople) appendIfExists(createSummaryItem('Number of People', formData.numPeople));
            
            appendIfExists(createSummaryItem('Catering Required', formData.foodNeeded === 'yes' ? 'Yes' : (formData.foodNeeded === 'no' ? 'No' : 'Not specified')));

            if (formData.foodNeeded === 'yes') {
                let foodStyleDisplay = formData.foodStyle;
                if (formData.foodStyle === 'Other' && formData.otherFoodStyle) {
                    foodStyleDisplay = formData.otherFoodStyle;
                }
                appendIfExists(createSummaryItem('Food Service Style', foodStyleDisplay));
                if (formData.foodBudgetPerPerson !== null && formData.foodBudgetPerPerson !== undefined) {
                     appendIfExists(createSummaryItem('Food Budget per Person', currencyFormatter.format(formData.foodBudgetPerPerson)));
                }
            }

            if (formData.budget !== null && formData.budget !== undefined) {
                appendIfExists(createSummaryItem('Total Event Budget', currencyFormatter.format(formData.budget)));
            }

            if (formData.inspirationNotes) {
                appendIfExists(createSummaryItem('Inspiration Notes', formData.inspirationNotes));
            }
            if (formData.inspirationPhotosInfo && formData.inspirationPhotosInfo.length > 0) {
                const photoNames = formData.inspirationPhotosInfo.map(photo => photo.name).join(', ');
                appendIfExists(createSummaryItem('Inspiration Photo(s)', photoNames));
            }

            if (summaryContentDiv.children.length === 0) {
                summaryContentDiv.innerHTML = '<p>No details provided yet, or an error occurred generating the summary.</p>';
            }
        };
        const resetForm=()=>{ console.warn("resetForm function not implemented."); /* ... Actual implementation needed ... */};
        // ========================================================================
        // END OF TODO SECTION
        // ========================================================================

        // ... [All the event listeners from the previous index.html script block need to be here] ...
        // Example: Add event listeners (ensure these are correctly placed after function definitions)
        form.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-btn')) {
                collectStepData(currentStep);
                if (validateStepWithFlag(currentStep)) {
                    if (currentStep === TOTAL_STEPS -1) { // Before summary step
                        generateSummary();
                    }
                    showStep(currentStep + 1);
                }
            } else if (e.target.classList.contains('prev-btn')) {
                collectStepData(currentStep); // Collect data even when going back
                showStep(currentStep - 1);
            } else if (e.target.classList.contains('start-over-btn')) {
                showModalWithFlag('Start Over?', 'Are you sure you want to clear the form and start over?', () => {
                    resetForm();
                    showStep(1);
                    hideModalWithFlag();
                });
            }
        });

        if (getLocationButton) {
            getLocationButton.addEventListener('click', handleGetLocation);
        }

        if (cityInput) {
            cityInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 2) {
                    debouncedFetch(query);
                } else {
                    if (citySuggestionsContainer) citySuggestionsContainer.classList.remove('visible');
                }
            });
            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!cityInput.contains(e.target) && !citySuggestionsContainer?.contains(e.target)) {
                    if (citySuggestionsContainer) citySuggestionsContainer.classList.remove('visible');
                }
            });
        }

        if (eventTypeSelect) eventTypeSelect.addEventListener('change', () => handleOtherOption(eventTypeSelect, otherEventTypeContainer));
        if (eventStyleSelect) eventStyleSelect.addEventListener('change', () => handleOtherOption(eventStyleSelect, otherEventStyleContainer));
        if (foodStyleSelect) foodStyleSelect.addEventListener('change', () => handleOtherOption(foodStyleSelect, otherFoodStyleContainer));
        if (eventDurationSelect) eventDurationSelect.addEventListener('change', () => handleOtherOption(eventDurationSelect, customDurationContainer));

        // Handle food step visibility based on radio button change
        form.querySelectorAll('input[name="foodNeeded"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                formData.foodNeeded = e.target.value;
                console.log("Food needed changed:", formData.foodNeeded);
                // No immediate step change needed here, just update state for validation/navigation
            });
        });

        if (inspirationPhotosInput) {
            inspirationPhotosInput.addEventListener('change', handleFileSelect);
        }
        if (inspirationPreview) {
            inspirationPreview.addEventListener('click', handleRemoveImage); // Delegate removal click
        }

        // Modal listeners
        if (modalConfirmBtn) {
            modalConfirmBtn.addEventListener('click', () => {
                if (confirmCallback) {
                    confirmCallback();
                }
                hideModalWithFlag();
            });
        }
        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', hideModalWithFlag);
        }
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) { // Only close if clicking the overlay itself
                    hideModalWithFlag();
                }
            });
        }

        // --- Enter Key Navigation ---
        form.addEventListener('keydown', (event) => {
            // Check if Enter key was pressed and the target is an input/select (but not a textarea or button)
            const targetTag = event.target.tagName.toUpperCase();
            const targetType = event.target.type ? event.target.type.toUpperCase() : '';

            if (event.key === 'Enter' &&
                (targetTag === 'INPUT' && targetType !== 'BUTTON' && targetType !== 'SUBMIT' && targetType !== 'RESET') ||
                 targetTag === 'SELECT')
            {
                event.preventDefault(); // Prevent default form submission or other Enter behavior

                const currentStepElement = event.target.closest('.form-step');
                if (currentStepElement) {
                    const nextButton = currentStepElement.querySelector('.next-btn');
                    if (nextButton) {
                        console.log("Enter pressed in input/select, triggering next button click.");
                        nextButton.click(); // Trigger click to use existing validation/navigation
                    } else {
                        // If no next button (e.g., last step), try submitting
                        const submitButton = currentStepElement.querySelector('button[type="submit"]');
                        if (submitButton) {
                            console.log("Enter pressed in input/select on last step, triggering submit.");
                            // Potentially validate before submitting if needed, though submit usually handles it
                            submitButton.click();
                        }
                    }
                }
            } else if (event.key === 'Enter' && targetTag === 'TEXTAREA') {
                // Allow default Enter behavior (new line) in textareas
                console.log("Enter pressed in textarea, allowing default.");
            }
        });
        // --- End Enter Key Navigation ---


        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Form submitted. Final Data:", formData);
            collectStepData(currentStep); // Collect final step data
            if (!validateStepWithFlag(currentStep)) {
                 // showInfoModalWithFlag("Incomplete Information", "Please ensure all required fields in the final step are filled."); // Modal removed, validateStepWithFlag handles UI
                 return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            try {
                // TODO: Implement actual submission logic here
                // 1. Check Auth state (redirect if not logged in?)
                // 2. Upload image if present (get URL)
                // 3. Generate AI prompts (if needed here, or maybe backend does this)
                // 4. Save data to Firestore
                console.log("Attempting to save data (Not implemented)...");
                const aiPrompts = generateAiPrompts(formData);
                console.log("Generated AI Prompts:", aiPrompts);

                // Placeholder for success
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request

                showInfoModalWithFlag("Plan Saved!", "Your event plan has been successfully saved.");
                // Optionally reset form or redirect after OK
                modalConfirmBtn.addEventListener('click', () => {
                    // resetForm(); // Or redirect: window.location.href = '/dashboard.html';
                    showStep(1); // Go back to start for now
                }, { once: true }); // Ensure this listener only runs once

            } catch (error) {
                console.error("Submission failed:", error);
                showInfoModalWithFlag("Submission Error", `Failed to save your plan: ${error.message}`);
            } finally {
                if(submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Confirm Plan';
                }
            }
        });

        // Initial setup
        showStep(1);
        handleOtherOption(eventTypeSelect, otherEventTypeContainer);
        handleOtherOption(eventStyleSelect, otherEventStyleContainer);
        handleOtherOption(foodStyleSelect, otherFoodStyleContainer);
        handleOtherOption(eventDurationSelect, customDurationContainer);
        hideLocationStatus(); // Ensure it's hidden initially

        console.log("Initialization Script Completed.");
    }); // End DOMContentLoaded
} catch (initError) {
     console.error("FATAL ERROR during script execution:", initError); alert(`Fatal Error: ${initError.message}. Form cannot function.`);
     const errorDiv = document.createElement('div'); errorDiv.style.cssText = 'color: #f8d7da; background-color: #721c24; padding: 15px; margin: 20px auto; border: 1px solid #f5c6cb; border-radius: 8px; max-width: 560px; text-align: center; font-weight: bold;'; errorDiv.textContent = `Fatal Script Error: ${initError.message}.`; document.body.prepend(errorDiv);
}
