import { writable } from 'svelte/store';

// This store will hold the authenticated user's session
export const user = writable(null);

// This store will hold the employee profile associated with the user
export const employeeProfile = writable(null);

// This store will hold the state of the media modal
export const mediaModal = writable({
    isOpen: false,
    url: '',
    mediaType: 'image'
});

// NEW: This store will hold the temporary Forest River auth token
export const forestRiverToken = writable(null);