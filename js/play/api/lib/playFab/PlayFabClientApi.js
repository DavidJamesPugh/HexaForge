// PlayFab SDK is loaded via script tag in index.html
// Access the global PlayFab object
const PlayFab = window.PlayFab;

if (!PlayFab) {
    console.error("PlayFab SDK not loaded properly - PlayFab object not found");
}

export { PlayFab };