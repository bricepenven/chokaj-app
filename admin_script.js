// --- Global Scope Definitions ---
// Define showImagePreview in global scope first so it's available when called from HTML
window.showImagePreview = function(imageUrl) {
    console.log('Opening image preview for:', imageUrl);
    const modal = document.createElement('div');
    modal.className = 'image-modal'; // Use class for styling

    const modalContent = document.createElement('div');
    modalContent.className = 'image-modal-content';

    const closeButton = document.createElement('button');
    closeButton.className = 'image-modal-close'; // Use class for styling
    closeButton.innerHTML = '×';
    closeButton.onclick = () => {
        modal.remove();
        document.removeEventListener('keydown', handleEsc); // Clean up listener
    };

    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = 'Image Preview'; // Add alt text

    modalContent.appendChild(closeButton);
    modalContent.appendChild(image);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking the background overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Only close if clicking the overlay itself
            modal.remove();
            document.removeEventListener('keydown', handleEsc); // Clean up listener
        }
    });

    // Close modal with ESC key
    const handleEsc = (event) => {
        if (event.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc); // Clean up listener
        }
    };
    document.addEventListener('keydown', handleEsc);
};

// Firebase services will be initialized by the reserved URLs
let db;
let auth;
let storage;
let firebaseInitialized = false; // Track if services were obtained

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase services from the global firebase object
    try {
        // Check if firebase object exists (it should if init.js loaded)
        if (typeof firebase === 'undefined') {
            throw new Error("Firebase core object not found. Ensure Firebase Hosting setup is correct.");
        }
        db = firebase.firestore();
        auth = firebase.auth();
        storage = firebase.storage();
        firebaseInitialized = true;
        console.log("Firebase services obtained for Admin Page.");
    } catch (error) {
        console.error("Failed to get Firebase services:", error);
        firebaseInitialized = false; // Ensure this is false
        alert("Firebase could not initialize. Admin features will not work.");
        const loadingMsg = document.getElementById('authLoadingMessage');
        if (loadingMsg) loadingMsg.textContent = `Error initializing Firebase: ${error.message}`;
        return; // Stop initialization
    }

    // Get common elements needed early (now safe to assume firebase object exists if initialized)
    const authLoadingMessage = document.getElementById('authLoadingMessage');
    const adminPageContent = document.getElementById('adminPageContent');
    const logoutButton = document.getElementById('logoutButton');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const outputLogDiv = document.getElementById('outputLog');

    // --- Utility Functions ---
    const logOutput = (message, type = 'info') => {
        console.log(message);
        if (!outputLogDiv) return;
        const p = document.createElement('p');
        p.textContent = typeof message === 'object' ? JSON.stringify(message, null, 2) : message; // Pretty print objects
        p.className = type; // Add class for styling (e.g., 'error', 'success')

        // Clear initial message if present
        const firstChildText = outputLogDiv.firstChild?.textContent?.trim();
        if (firstChildText && (firstChildText.startsWith('Waiting') || firstChildText.startsWith('Initializing'))) {
            outputLogDiv.innerHTML = '';
        }
        outputLogDiv.insertBefore(p, outputLogDiv.firstChild); // Prepend new messages
    };

    // Check if essential services and modal elements are available
    if (!db || !auth || !storage || !modalOverlay || !modalTitle || !modalMessage || !modalConfirmBtn || !modalCancelBtn) {
        console.error("Firebase services or Modal Elements not initialized correctly.");
        if (authLoadingMessage) authLoadingMessage.textContent = 'Error: Core components failed to load.';
        return; // Stop initialization
    }

    // --- Modal Logic ---
    let isModalCurrentlyVisible = false;
    let confirmCallback = null;

    const showModalBase = (makeVisible) => {
        if (!modalOverlay) return false;
        modalOverlay.classList.toggle('visible', makeVisible);
        isModalCurrentlyVisible = makeVisible;
        return true;
    };

    const showInfoModalWithFlag = (title, message) => {
        logOutput(`Show info modal: ${title}`);
        if (!showModalBase(true)) {
            alert(`Info: ${title}\n\n${message}`); // Fallback alert
            return;
        }
        modalTitle.textContent = title;
        modalMessage.innerHTML = message; // Allow HTML in message
        confirmCallback = null; // No action on confirm for info modal
        modalConfirmBtn.textContent = "OK";
        modalConfirmBtn.classList.add('ok-button');
        modalCancelBtn.classList.add('hidden'); // Hide cancel button
    };

    const showModalWithFlag = (title, message, onConfirm) => {
        logOutput(`Show confirm modal: ${title}`);
        if (!showModalBase(true)) {
            // Fallback confirmation
            if (confirm(`Modal Error. Proceed anyway? (${title})\n\n${message}`)) {
                if (typeof onConfirm === 'function') onConfirm();
            }
            return;
        }
        modalTitle.textContent = title;
        modalMessage.innerHTML = message; // Allow HTML in message
        confirmCallback = onConfirm; // Store the callback function
        modalConfirmBtn.textContent = "Confirm";
        modalConfirmBtn.classList.remove('ok-button');
        modalCancelBtn.classList.remove('hidden'); // Show cancel button
    };

    const hideModalWithFlag = () => {
        logOutput("Hide modal called");
        showModalBase(false);
        confirmCallback = null; // Clear callback
        // Reset modal buttons to default state
        if (modalCancelBtn) modalCancelBtn.classList.remove('hidden');
        if (modalConfirmBtn) {
            modalConfirmBtn.textContent = "Confirm";
            modalConfirmBtn.classList.remove('ok-button');
        }
    };

    // Add modal button listeners
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation(); // Prevent triggering overlay click
            if (typeof confirmCallback === 'function') {
                try {
                    confirmCallback(); // Execute the stored callback
                } catch (e) {
                    console.error("Error executing modal confirm callback:", e);
                    logOutput(`Error in confirm action: ${e.message}`, 'error');
                }
            }
            hideModalWithFlag(); // Close modal after action
        });
    }
    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            hideModalWithFlag(); // Just close the modal
        });
    }
    // Close modal if overlay is clicked
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideModalWithFlag();
        }
    });

    // --- Auth State Check ---
    auth.onAuthStateChanged(async (user) => {
        logOutput("[AUTH_CHECK] onAuthStateChanged triggered...");
        if (user) {
            logOutput(`[AUTH_CHECK] User logged in: UID=${user.uid}`);
            if (authLoadingMessage) authLoadingMessage.style.display = 'none';
            if (adminPageContent) adminPageContent.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'inline-block'; // Use inline-block or block as needed

            // Initialize the main admin page functionality AFTER auth is confirmed
            // Use a small delay if needed, but often direct call is fine if DOM is ready
            initializeAdminPage(logOutput);

        } else {
            logOutput("[AUTH_CHECK] User is null. Redirecting to login.");
            if (authLoadingMessage) authLoadingMessage.textContent = 'Redirecting to login...';
            // Redirect to login page if not authenticated
            window.location.href = '/login.html'; // Ensure this path is correct
        }
    });

    // --- Main Admin Page Initialization Function ---
    function initializeAdminPage(logOutput) {
        logOutput("Initializing admin page functionality...");

        // Get Element References needed for this scope
        const tabButtons = document.querySelectorAll('.menu-item');
        const mainContentSections = document.querySelectorAll('.main-content-section');
        const addVenueBtn = document.getElementById('addVenueBtn');
        const addVendorBtn = document.getElementById('addVendorBtn');
        const venueListContainer = document.getElementById('venueListContainer');
        const vendorListContainer = document.getElementById('vendorListContainer');
        const addEditVenueFormContainer = document.getElementById('addEditVenueFormContainer');
        const addEditVendorFormContainer = document.getElementById('addEditVendorFormContainer');
        const venueForm = document.getElementById('venueForm');
        const vendorForm = document.getElementById('vendorForm');
        const venuePreview = document.getElementById('venuePreview');
        const cateringPreview = document.getElementById('cateringPreview');
        const venuePhotosInput = document.getElementById('venuePhotos');
        const cateringPhotosInput = document.getElementById('cateringPhotos');
        const cancelVenueEditBtn = document.getElementById('cancelVenueEditBtn');
        const cancelVendorEditBtn = document.getElementById('cancelVendorEditBtn');
        const currentLogoutButton = document.getElementById('logoutButton'); // Re-fetch or use global

        // Check if crucial elements exist
        if (!venueForm || !vendorForm || !venueListContainer || !vendorListContainer || !addEditVenueFormContainer || !addEditVendorFormContainer || !addVenueBtn || !addVendorBtn || !tabButtons || tabButtons.length === 0 || !venuePreview || !cateringPreview || !venuePhotosInput || !cateringPhotosInput || !cancelVenueEditBtn || !cancelVendorEditBtn || !currentLogoutButton) {
            console.error("FATAL: Crucial admin UI elements missing! Check HTML IDs. Stopping initialization.");
            logOutput("Error: Critical UI components missing during admin init.", "error");
            if (adminPageContent) adminPageContent.innerHTML = '<h2>Error Loading Admin Interface. Check Console.</h2>';
            return;
        }
        logOutput("Admin UI elements found. Proceeding with setup...");

        // --- State Variables ---
        let selectedVenueFiles = []; // Holds File objects for new venue uploads
        let selectedCateringFiles = []; // Holds File objects for new vendor uploads
        let currentEditingVenue = null; // Stores data of venue being edited { id, ...data, originalImageRefs, imageRefs }
        let currentEditingVendor = null; // Stores data of vendor being edited { id, ...data, originalImageRefs, imageRefs }

        // --- Helper Functions ---
        const parseTags = (tagString) => tagString ? tagString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0) : [];
        const formatTags = (tagArray) => Array.isArray(tagArray) ? tagArray.join(', ') : '';

        const showForm = (formType) => {
            hideAllFormsAndLists(); // Hide others first
            if (formType === 'venue' && addEditVenueFormContainer) {
                addEditVenueFormContainer.style.display = 'block';
                addEditVenueFormContainer.classList.add('active'); // Use class for consistency
            } else if (formType === 'vendor' && addEditVendorFormContainer) {
                addEditVendorFormContainer.style.display = 'block';
                addEditVendorFormContainer.classList.add('active');
            }
        };

        const hideAllFormsAndLists = () => {
            if (addEditVenueFormContainer) {
                addEditVenueFormContainer.style.display = 'none';
                addEditVenueFormContainer.classList.remove('active');
            }
            if (addEditVendorFormContainer) {
                addEditVendorFormContainer.style.display = 'none';
                addEditVendorFormContainer.classList.remove('active');
            }
            // Optionally show list containers again, or handle visibility based on active tab
            // if (venueListContainer) venueListContainer.style.display = 'block';
            // if (vendorListContainer) vendorListContainer.style.display = 'block';
        };

        // --- Tab Switching Logic ---
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                if (!targetContent) {
                    console.error(`Target content section '${targetId}' not found.`);
                    return;
                }

                // Update button and section visibility/active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                mainContentSections.forEach(content => content.classList.remove('active')); // Use class for sections too
                button.classList.add('active');
                targetContent.classList.add('active');

                // Load data for the activated tab and hide any open forms
                if (targetId === 'manageVenuesContent') {
                    loadVenues();
                } else if (targetId === 'manageVendorsContent') {
                    loadVendors();
                }
                hideAllFormsAndLists(); // Ensure forms are hidden when switching tabs
            });
        });

        // --- Data Loading Functions ---
        const loadVenues = async () => {
            logOutput("Loading venues...");
            if (!venueListContainer) return;
            venueListContainer.innerHTML = "<p>Loading venues...</p>"; // Provide loading feedback
            try {
                const querySnapshot = await db.collection("venues").orderBy("name").get(); // Order by name
                const venuesHtml = [];
                querySnapshot.forEach(doc => {
                    const venue = doc.data();
                    const venueId = doc.id;
                    const costDisplay = venue.cost ? (venue.rateType === 'per_hour' ? `$${venue.cost}/hour` : `$${venue.cost}/day`) : 'N/A';

                    venuesHtml.push(`
                        <div class="list-item" data-id="${venueId}">
                            <div class="item-header">
                                <h3>${venue.name || 'Unnamed Venue'}</h3>
                                <div class="item-location">${venue.city || 'N/A'}, ${venue.country || 'N/A'}</div>
                            </div>
                            <div class="item-details">
                                <p><strong>Type:</strong> ${venue.venueType || 'N/A'}</p>
                                <p><strong>Capacity:</strong> ${venue.capacity || 'N/A'}</p>
                                <p><strong>Cost:</strong> ${costDisplay}</p>
                            </div>
                            <div class="item-tags">
                                ${venue.styleTags && venue.styleTags.length > 0 ? `<p><strong>Style:</strong> ${venue.styleTags.join(', ')}</p>` : ''}
                                ${venue.eventTypeTags && venue.eventTypeTags.length > 0 ? `<p><strong>Events:</strong> ${venue.eventTypeTags.join(', ')}</p>` : ''}
                            </div>
                            <div class="item-images">
                                ${(venue.imageRefs || []).map(img => `
                                    <img src="${img.url}" alt="Venue image for ${venue.name}" onclick="window.showImagePreview('${img.url}')" />
                                `).join('')}
                            </div>
                            <div class="item-actions">
                                <button class="edit-btn" data-id="${venueId}" data-type="venue">Edit</button>
                                <button class="delete-btn" data-id="${venueId}" data-type="venue">Delete</button>
                            </div>
                        </div>
                    `);
                });
                venueListContainer.innerHTML = venuesHtml.length > 0 ? venuesHtml.join('') : '<p>No venues found. Click "Add New Venue" to create one.</p>';
            } catch (error) {
                console.error("Error loading venues:", error);
                logOutput(`Error loading venues: ${error.message}`, 'error');
                venueListContainer.innerHTML = '<p>Error loading venues. Please try again later.</p>';
            }
        };

        const loadVendors = async () => {
            logOutput("Loading vendors...");
            if (!vendorListContainer) return;
            vendorListContainer.innerHTML = "<p>Loading vendors...</p>";
            try {
                const querySnapshot = await db.collection("vendors").orderBy("name").get(); // Order by name
                const vendorsHtml = [];
                querySnapshot.forEach(doc => {
                    const vendor = doc.data();
                    const vendorId = doc.id;
                    const priceDisplay = vendor.pricePerPerson ? (vendor.rateType === 'flat_rate' ? `$${vendor.pricePerPerson} flat rate` : `$${vendor.pricePerPerson}/person`) : 'N/A';

                    vendorsHtml.push(`
                        <div class="list-item" data-id="${vendorId}">
                             <div class="item-header">
                                <h3>${vendor.name || 'Unnamed Vendor'}</h3>
                                <div class="item-location">${vendor.city || 'N/A'}, ${vendor.country || 'N/A'}</div>
                            </div>
                            <div class="item-details">
                                <p><strong>Service:</strong> ${vendor.serviceType || 'N/A'}</p>
                                <p><strong>Price:</strong> ${priceDisplay}</p>
                                ${vendor.cuisineTags && vendor.cuisineTags.length > 0 ? `<p><strong>Cuisine:</strong> ${vendor.cuisineTags.join(', ')}</p>` : ''}
                                ${vendor.serviceStyles && vendor.serviceStyles.length > 0 ? `<p><strong>Styles:</strong> ${vendor.serviceStyles.join(', ')}</p>` : ''}
                            </div>
                             <div class="item-images">
                                ${(vendor.imageRefs || []).map(img => `
                                    <img src="${img.url}" alt="Vendor image for ${vendor.name}" onclick="window.showImagePreview('${img.url}')" />
                                `).join('')}
                            </div>
                            <div class="item-actions">
                                <button class="edit-btn" data-id="${vendorId}" data-type="vendor">Edit</button>
                                <button class="delete-btn" data-id="${vendorId}" data-type="vendor">Delete</button>
                            </div>
                        </div>
                    `);
                });
                vendorListContainer.innerHTML = vendorsHtml.length > 0 ? vendorsHtml.join('') : '<p>No vendors found. Click "Add New Vendor" to create one.</p>';
            } catch (error) {
                console.error("Error loading vendors:", error);
                logOutput(`Error loading vendors: ${error.message}`, 'error');
                vendorListContainer.innerHTML = '<p>Error loading vendors. Please try again later.</p>';
            }
        };

        // --- File Handling & Preview Functions ---
        const renderImagePreviewItem = (file, fileUrl, fileStorageArray, previewElement, isExisting = false, existingRef = null) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-preview-item';
            if (isExisting && existingRef) {
                imgContainer.dataset.imageUrl = existingRef.url; // Store URL for removal check
                imgContainer.dataset.imagePath = existingRef.path; // Store path for deletion
            }

            const img = document.createElement('img');
            img.src = fileUrl;
            img.alt = isExisting ? `Existing image` : `Preview of ${file.name}`;
            img.title = isExisting ? `Existing image (${existingRef.path})` : `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            img.style.cursor = 'pointer';
            img.onclick = () => window.showImagePreview(fileUrl); // Use global preview function

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Delete';
            removeBtn.type = 'button'; // Prevent form submission
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = (ev) => {
                ev.stopPropagation(); // Prevent clicks on image
                if (isExisting) {
                    // Mark existing image for deletion in the currentEditing object
                    if (previewElement.id === 'venuePreview' && currentEditingVenue) {
                        currentEditingVenue.imageRefs = currentEditingVenue.imageRefs.filter(ref => ref.url !== existingRef.url);
                        logOutput(`Marked existing venue image for deletion: ${existingRef.path}. Save to confirm.`, 'info');
                    } else if (previewElement.id === 'cateringPreview' && currentEditingVendor) {
                        currentEditingVendor.imageRefs = currentEditingVendor.imageRefs.filter(ref => ref.url !== existingRef.url);
                        logOutput(`Marked existing vendor image for deletion: ${existingRef.path}. Save to confirm.`, 'info');
                    }
                } else {
                    // Remove newly added file from the temporary storage array
                    const index = fileStorageArray.indexOf(file);
                    if (index > -1) {
                        fileStorageArray.splice(index, 1);
                        logOutput(`Removed new file from upload queue: ${file.name}`);
                    }
                }
                imgContainer.remove(); // Remove the preview item from the DOM
            };

            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            previewElement.appendChild(imgContainer);
        };

        const handleFileSelect = (event, previewElement, fileStorageArray) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            logOutput(`File(s) selected: ${files.length}. Displaying previews.`);
            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/')) {
                    logOutput(`Skipping non-image file: ${file.name}`, 'info');
                    return;
                }
                // Check for duplicates before adding
                if (fileStorageArray.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
                     logOutput(`Skipping duplicate file: ${file.name}`, 'info');
                     return;
                }

                fileStorageArray.push(file); // Add to the temporary array for new uploads
                const reader = new FileReader();
                reader.onload = (e) => {
                    renderImagePreviewItem(file, e.target.result, fileStorageArray, previewElement, false);
                };
                reader.readAsDataURL(file);
            });
            logOutput(`Total files queued for upload: ${fileStorageArray.length}.`);
            event.target.value = ''; // Reset file input to allow selecting the same file again
        };

        // Add file input event listeners
        venuePhotosInput.addEventListener('change', (e) => handleFileSelect(e, venuePreview, selectedVenueFiles));
        cateringPhotosInput.addEventListener('change', (e) => handleFileSelect(e, cateringPreview, selectedCateringFiles));

        // --- "Add New" Button Listeners ---
        addVenueBtn.addEventListener('click', () => {
            currentEditingVenue = null; // Clear editing state
            venueForm.reset(); // Clear form fields
            venuePreview.innerHTML = ''; // Clear image previews
            selectedVenueFiles = []; // Clear selected files array
            document.getElementById('venueEditId').value = ''; // Clear hidden ID field
            document.getElementById('venueFormTitle').textContent = "Add New Venue";
            document.getElementById('saveVenueBtn').textContent = "Save New Venue";
            showForm('venue'); // Show the venue form
        });

        addVendorBtn.addEventListener('click', () => {
            currentEditingVendor = null; // Clear editing state
            vendorForm.reset();
            cateringPreview.innerHTML = '';
            selectedCateringFiles = [];
            document.getElementById('vendorEditId').value = '';
            document.getElementById('vendorFormTitle').textContent = "Add New Vendor";
            document.getElementById('saveVendorBtn').textContent = "Save New Vendor";
            showForm('vendor');
        });

        // --- Cancel Edit Button Listeners ---
        cancelVenueEditBtn.addEventListener('click', hideAllFormsAndLists);
        cancelVendorEditBtn.addEventListener('click', hideAllFormsAndLists);

        // --- Form Submission Logic ---
        async function uploadFilesAndGetRefs(basePath, files) {
            const uploadPromises = files.map(async (file) => {
                const filePath = `${basePath}/${Date.now()}_${file.name}`;
                const fileRef = storage.ref(filePath);
                logOutput(`Uploading ${file.name} to ${filePath}...`);
                try {
                    const snapshot = await fileRef.put(file);
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    logOutput(`Uploaded ${file.name}, got URL.`);
                    return { url: downloadURL, path: filePath }; // Return ref object
                } catch (uploadError) {
                    console.error(`Error uploading ${file.name}:`, uploadError);
                    logOutput(`Error uploading ${file.name}: ${uploadError.message}`, 'error');
                    return null; // Indicate failure for this file
                }
            });
            // Wait for all uploads and filter out any null results from failures
            const results = await Promise.all(uploadPromises);
            return results.filter(ref => ref !== null);
        }

        // Venue Form Submit Handler (Add & Edit)
        venueForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('venueEditId').value;
            const isEditing = !!editId;
            const submitButton = document.getElementById('saveVenueBtn');

            submitButton.disabled = true;
            submitButton.textContent = isEditing ? 'Updating...' : 'Saving...';

            try {
                // Collect base data
                const venueData = {
                    name: document.getElementById('venueName').value.trim() || 'Unnamed Venue',
                    city: document.getElementById('venueCity').value.trim(),
                    country: document.getElementById('venueCountry').value.trim(),
                    venueType: document.getElementById('venueType').value,
                    styleTags: parseTags(document.getElementById('venueStyleTags').value),
                    eventTypeTags: parseTags(document.getElementById('venueEventTypeTags').value),
                    capacity: document.getElementById('venueCapacity').value ? parseInt(document.getElementById('venueCapacity').value, 10) : null,
                    cost: document.getElementById('venueCost').value ? parseFloat(document.getElementById('venueCost').value) : null,
                    rateType: document.getElementById('venueRateType').value,
                    notes: document.getElementById('venueNotes').value.trim(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                let finalImageRefs = [];
                let docRef;

                if (isEditing) {
                    docRef = db.collection("venues").doc(editId);
                    // Start with images marked to keep from the currentEditingVenue object
                    finalImageRefs = currentEditingVenue ? [...currentEditingVenue.imageRefs] : [];

                    // Delete images from storage that were marked for removal
                    if (currentEditingVenue && currentEditingVenue.originalImageRefs) {
                        const removedImages = currentEditingVenue.originalImageRefs
                            .filter(origRef => !finalImageRefs.some(keptRef => keptRef.url === origRef.url));

                        logOutput(`Attempting to delete ${removedImages.length} removed images from storage...`);
                        const deletePromises = removedImages.map(img => {
                            if (img.path) {
                                return storage.ref(img.path).delete()
                                    .then(() => logOutput(`Deleted from storage: ${img.path}`))
                                    .catch(err => logOutput(`Failed to delete ${img.path}: ${err.message}`, 'error'));
                            }
                            return Promise.resolve(); // No path, nothing to delete
                        });
                        await Promise.all(deletePromises);
                    }

                    // Upload NEW files
                    if (selectedVenueFiles.length > 0) {
                        submitButton.textContent = 'Uploading New Photos...';
                        const newImageRefs = await uploadFilesAndGetRefs(`venues/${editId}`, selectedVenueFiles);
                        finalImageRefs = [...finalImageRefs, ...newImageRefs]; // Add new refs
                    }

                    venueData.imageRefs = finalImageRefs; // Set the final array
                    await docRef.update(venueData);
                    logOutput(`Venue updated successfully (ID: ${editId}) with ${finalImageRefs.length} images.`, 'success');

                } else { // Adding new venue
                    venueData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    venueData.imageRefs = []; // Initialize empty array

                    // Add document first to get ID
                    docRef = await db.collection("venues").add(venueData);
                    const newId = docRef.id;
                    logOutput(`Venue document created (ID: ${newId}). Uploading photos...`);

                    // Upload photos if any were selected
                    if (selectedVenueFiles.length > 0) {
                        submitButton.textContent = 'Uploading Photos...';
                        const imageRefsArray = await uploadFilesAndGetRefs(`venues/${newId}`, selectedVenueFiles);
                        // Update the document with the image references
                        await docRef.update({ imageRefs: imageRefsArray });
                        logOutput(`Photos uploaded and venue updated with ${imageRefsArray.length} images.`, 'success');
                    } else {
                        logOutput(`New venue created without photos.`, 'success');
                    }
                }

                // Reset form and state, hide form, reload list
                currentEditingVenue = null;
                venueForm.reset();
                venuePreview.innerHTML = '';
                selectedVenueFiles = [];
                hideAllFormsAndLists();
                loadVenues(); // Refresh the list
                showInfoModalWithFlag("Success", `Venue ${isEditing ? 'updated' : 'created'} successfully!`);

            } catch (error) {
                console.error("Error saving venue:", error);
                logOutput(`Error saving venue: ${error.message}`, 'error');
                showInfoModalWithFlag("Error Saving Venue", `An error occurred: ${error.message}`);
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = isEditing ? 'Update Venue' : 'Save Venue';
            }
        });

        // Vendor Form Submit Handler (Add & Edit) - Similar logic to Venue
        vendorForm.addEventListener('submit', async (e) => {
             e.preventDefault();
             const editId = document.getElementById('vendorEditId').value;
             const isEditing = !!editId;
             const submitButton = document.getElementById('saveVendorBtn');

             submitButton.disabled = true;
             submitButton.textContent = isEditing ? 'Updating...' : 'Saving...';

             try {
                 const vendorData = {
                     name: document.getElementById('vendorName').value.trim() || 'Unnamed Vendor',
                     city: document.getElementById('vendorCity').value.trim(),
                     country: document.getElementById('vendorCountry').value.trim(),
                     serviceType: document.getElementById('vendorServiceType').value,
                     cuisineTags: parseTags(document.getElementById('vendorCuisineTags').value),
                     serviceStyles: parseTags(document.getElementById('vendorServiceStyles').value),
                     pricePerPerson: document.getElementById('vendorPricePerPerson').value ? parseFloat(document.getElementById('vendorPricePerPerson').value) : null,
                     rateType: document.getElementById('vendorRateType').value,
                     notes: document.getElementById('vendorNotes').value.trim(),
                     updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                 };

                 let finalImageRefs = [];
                 let docRef;

                 if (isEditing) {
                     docRef = db.collection("vendors").doc(editId);
                     finalImageRefs = currentEditingVendor ? [...currentEditingVendor.imageRefs] : [];

                     // Delete removed images from storage
                     if (currentEditingVendor && currentEditingVendor.originalImageRefs) {
                         const removedImages = currentEditingVendor.originalImageRefs
                             .filter(origRef => !finalImageRefs.some(keptRef => keptRef.url === origRef.url));
                         logOutput(`Attempting to delete ${removedImages.length} removed vendor images...`);
                         const deletePromises = removedImages.map(img => {
                             if (img.path) {
                                 return storage.ref(img.path).delete()
                                     .then(() => logOutput(`Deleted vendor image: ${img.path}`))
                                     .catch(err => logOutput(`Failed to delete ${img.path}: ${err.message}`, 'error'));
                             }
                             return Promise.resolve();
                         });
                         await Promise.all(deletePromises);
                     }

                     // Upload NEW files
                     if (selectedCateringFiles.length > 0) {
                         submitButton.textContent = 'Uploading New Photos...';
                         const newImageRefs = await uploadFilesAndGetRefs(`vendors/${editId}`, selectedCateringFiles);
                         finalImageRefs = [...finalImageRefs, ...newImageRefs];
                     }

                     vendorData.imageRefs = finalImageRefs;
                     await docRef.update(vendorData);
                     logOutput(`Vendor updated successfully (ID: ${editId}) with ${finalImageRefs.length} images.`, 'success');

                 } else { // Adding new vendor
                     vendorData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                     vendorData.imageRefs = [];
                     docRef = await db.collection("vendors").add(vendorData);
                     const newId = docRef.id;
                     logOutput(`Vendor document created (ID: ${newId}). Uploading photos...`);

                     if (selectedCateringFiles.length > 0) {
                         submitButton.textContent = 'Uploading Photos...';
                         const imageRefsArray = await uploadFilesAndGetRefs(`vendors/${newId}`, selectedCateringFiles);
                         await docRef.update({ imageRefs: imageRefsArray });
                         logOutput(`Photos uploaded and vendor updated with ${imageRefsArray.length} images.`, 'success');
                     } else {
                         logOutput(`New vendor created without photos.`, 'success');
                     }
                 }

                 // Reset form and state
                 currentEditingVendor = null;
                 vendorForm.reset();
                 cateringPreview.innerHTML = '';
                 selectedCateringFiles = [];
                 hideAllFormsAndLists();
                 loadVendors(); // Refresh list
                 showInfoModalWithFlag("Success", `Vendor ${isEditing ? 'updated' : 'created'} successfully!`);

             } catch (error) {
                 console.error("Error saving vendor:", error);
                 logOutput(`Error saving vendor: ${error.message}`, 'error');
                 showInfoModalWithFlag("Error Saving Vendor", `An error occurred: ${error.message}`);
             } finally {
                 submitButton.disabled = false;
                 submitButton.textContent = isEditing ? 'Update Vendor' : 'Save Vendor';
             }
        });


        // --- Event Delegation for Edit/Delete Buttons ---
        // Use event delegation on a parent container for dynamically loaded items
        const mainContentContainer = document.getElementById('adminMainContent'); // Or a closer parent if available
        if (mainContentContainer) {
            mainContentContainer.addEventListener('click', async (e) => {
                const target = e.target;

                // --- Handle Edit Button Clicks ---
                if (target.classList.contains('edit-btn')) {
                    const id = target.dataset.id;
                    const type = target.dataset.type;
                    logOutput(`Edit button clicked for ${type} ID: ${id}`);

                    if (!id || !type) {
                        logOutput("Edit button missing ID or type data.", "error");
                        return;
                    }

                    // Reset temporary file arrays for the new edit session
                    selectedVenueFiles = [];
                    selectedCateringFiles = [];

                    if (type === 'venue') {
                        try {
                            const docSnap = await db.collection('venues').doc(id).get();
                            if (!docSnap.exists()) {
                                throw new Error(`Venue with ID ${id} not found.`);
                            }
                            const venue = docSnap.data();
                            // Store current venue data including a copy of imageRefs for modification tracking
                            currentEditingVenue = {
                                ...venue,
                                id: id,
                                originalImageRefs: [...(venue.imageRefs || [])], // Store original state
                                imageRefs: [...(venue.imageRefs || [])] // This copy will be modified by remove clicks
                            };

                            // Populate form fields
                            document.getElementById('venueEditId').value = id;
                            document.getElementById('venueName').value = venue.name || '';
                            document.getElementById('venueCity').value = venue.city || '';
                            document.getElementById('venueCountry').value = venue.country || '';
                            document.getElementById('venueType').value = venue.venueType || '';
                            document.getElementById('venueStyleTags').value = formatTags(venue.styleTags);
                            document.getElementById('venueEventTypeTags').value = formatTags(venue.eventTypeTags);
                            document.getElementById('venueCapacity').value = venue.capacity || '';
                            document.getElementById('venueCost').value = venue.cost || '';
                            document.getElementById('venueRateType').value = venue.rateType || 'per_day';
                            document.getElementById('venueNotes').value = venue.notes || '';

                            // Populate image previews for existing images
                            venuePreview.innerHTML = ''; // Clear previous previews
                            if (currentEditingVenue.imageRefs.length > 0) {
                                logOutput(`Rendering ${currentEditingVenue.imageRefs.length} existing venue images.`);
                                currentEditingVenue.imageRefs.forEach(imgRef => {
                                    // Pass true for isExisting and the ref object
                                    renderImagePreviewItem(null, imgRef.url, selectedVenueFiles, venuePreview, true, imgRef);
                                });
                            } else {
                                logOutput("No existing venue images to preview.");
                            }

                            document.getElementById('venueFormTitle').textContent = 'Edit Venue';
                            document.getElementById('saveVenueBtn').textContent = 'Update Venue';
                            showForm('venue'); // Show the populated form

                        } catch (error) {
                            console.error("Error loading venue for edit:", error);
                            logOutput(`Error loading venue (ID: ${id}): ${error.message}`, 'error');
                            showInfoModalWithFlag("Error", `Could not load venue details: ${error.message}`);
                        }
                    } else if (type === 'vendor') {
                         try {
                            const docSnap = await db.collection('vendors').doc(id).get();
                             if (!docSnap.exists()) {
                                throw new Error(`Vendor with ID ${id} not found.`);
                            }
                            const vendor = docSnap.data();
                            currentEditingVendor = {
                                ...vendor,
                                id: id,
                                originalImageRefs: [...(vendor.imageRefs || [])],
                                imageRefs: [...(vendor.imageRefs || [])]
                            };

                            // Populate form
                            document.getElementById('vendorEditId').value = id;
                            document.getElementById('vendorName').value = vendor.name || '';
                            document.getElementById('vendorCity').value = vendor.city || '';
                            document.getElementById('vendorCountry').value = vendor.country || '';
                            document.getElementById('vendorServiceType').value = vendor.serviceType || '';
                            document.getElementById('vendorCuisineTags').value = formatTags(vendor.cuisineTags);
                            document.getElementById('vendorServiceStyles').value = formatTags(vendor.serviceStyles);
                            document.getElementById('vendorPricePerPerson').value = vendor.pricePerPerson || '';
                            document.getElementById('vendorRateType').value = vendor.rateType || 'per_person';
                            document.getElementById('vendorNotes').value = vendor.notes || '';

                            // Populate image previews
                            cateringPreview.innerHTML = '';
                            if (currentEditingVendor.imageRefs.length > 0) {
                                logOutput(`Rendering ${currentEditingVendor.imageRefs.length} existing vendor images.`);
                                currentEditingVendor.imageRefs.forEach(imgRef => {
                                    renderImagePreviewItem(null, imgRef.url, selectedCateringFiles, cateringPreview, true, imgRef);
                                });
                            } else {
                                 logOutput("No existing vendor images to preview.");
                            }

                            document.getElementById('vendorFormTitle').textContent = 'Edit Vendor';
                            document.getElementById('saveVendorBtn').textContent = 'Update Vendor';
                            showForm('vendor');

                        } catch (error) {
                            console.error("Error loading vendor for edit:", error);
                            logOutput(`Error loading vendor (ID: ${id}): ${error.message}`, 'error');
                            showInfoModalWithFlag("Error", `Could not load vendor details: ${error.message}`);
                        }
                    }
                }

                // --- Handle Delete Button Clicks ---
                if (target.classList.contains('delete-btn')) {
                    const id = target.dataset.id;
                    const type = target.dataset.type;
                    const collectionName = type === 'venue' ? 'venues' : 'vendors';
                    const itemName = type === 'venue' ? 'Venue' : 'Vendor';

                    if (!id || !type) {
                        logOutput("Delete button missing ID or type data.", "error");
                        return;
                    }

                    logOutput(`Delete button clicked for ${type} ID: ${id}. Showing confirmation...`);
                    showModalWithFlag(
                        `Delete ${itemName}`,
                        `Are you sure you want to delete this ${itemName.toLowerCase()} (ID: ${id})? Associated images in storage will also be deleted. This action cannot be undone.`,
                        async () => { // This is the confirmCallback
                            logOutput(`Confirmed deletion for ${type} ID: ${id}. Proceeding...`);
                            try {
                                // Get the document first to retrieve image references for deletion
                                const docSnap = await db.collection(collectionName).doc(id).get();
                                if (docSnap.exists()) {
                                    const data = docSnap.data();
                                    // Delete images from storage if they exist
                                    if (data.imageRefs && data.imageRefs.length > 0) {
                                        logOutput(`Found ${data.imageRefs.length} images associated with ${type} ${id}. Deleting from storage...`);
                                        const deletePromises = data.imageRefs.map(img => {
                                            if (img.path) {
                                                return storage.ref(img.path).delete()
                                                    .then(() => logOutput(`Deleted image from storage: ${img.path}`))
                                                    .catch(err => {
                                                        // Log error but continue trying to delete others and the document
                                                        console.error(`Error deleting image ${img.path}:`, err);
                                                        logOutput(`Failed to delete image ${img.path}: ${err.message}`, 'error');
                                                    });
                                            }
                                            return Promise.resolve(); // No path, nothing to delete
                                        });
                                        await Promise.all(deletePromises); // Wait for all deletions to attempt
                                    } else {
                                        logOutput(`No images found in storage for ${type} ${id}.`);
                                    }
                                } else {
                                     logOutput(`${itemName} document (ID: ${id}) not found, perhaps already deleted.`, 'info');
                                }

                                // Delete the Firestore document itself
                                await db.collection(collectionName).doc(id).delete();
                                logOutput(`${itemName} document (ID: ${id}) deleted successfully from Firestore.`, 'success');

                                // Refresh the list after deletion
                                if (type === 'venue') {
                                    loadVenues();
                                } else {
                                    loadVendors();
                                }
                                showInfoModalWithFlag("Deleted", `${itemName} deleted successfully.`);

                            } catch (error) {
                                console.error(`Error deleting ${itemName.toLowerCase()} (ID: ${id}):`, error);
                                logOutput(`Error deleting ${itemName.toLowerCase()} (ID: ${id}): ${error.message}`, 'error');
                                showInfoModalWithFlag("Deletion Error", `Failed to delete ${itemName.toLowerCase()}: ${error.message}`);
                            }
                        }
                    );
                }
            });
        } else {
             console.error("Main content container not found for event delegation.");
             logOutput("Error: Could not set up edit/delete listeners.", "error");
        }


        // --- Initial Load ---
        // Load data for the initially active tab (usually Venues)
        const activeMenuItem = document.querySelector('.menu-item.active');
        if (activeMenuItem) {
             const initialTargetId = activeMenuItem.getAttribute('data-target');
             if (initialTargetId === 'manageVenuesContent') {
                 loadVenues();
             } else if (initialTargetId === 'manageVendorsContent') {
                 loadVendors();
             }
        } else {
            loadVenues(); // Default to loading venues if no tab is marked active initially
        }


        // --- Logout Button Functionality ---
        if (currentLogoutButton) {
            currentLogoutButton.addEventListener('click', () => {
                logOutput("Logout button clicked. Showing confirmation...");
                showModalWithFlag(
                    "Confirm Logout",
                    "Are you sure you want to logout?",
                    async () => { // confirmCallback for logout
                        logOutput("Logout confirmed. Signing out...");
                        try {
                            await auth.signOut();
                            logOutput("Sign out successful. Redirecting...");
                            // Redirect is handled by onAuthStateChanged listener
                        } catch (error) {
                            console.error("Error signing out:", error);
                            logOutput(`Error signing out: ${error.message}`, 'error');
                            showInfoModalWithFlag("Logout Error", `Failed to sign out: ${error.message}`);
                        }
                    }
                );
            });
        }

        logOutput("Admin page initialization complete.");

    }; // --- End initializeAdminPage ---

}); // --- End DOMContentLoaded ---
