import { parseGPX } from "./gpx.js";

// File upload handling
document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('upload');
    const fileInfo = document.getElementById('file-info');

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            // Display file information
            fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

            // Process the file
            handleFileUpload(file);
        } else {
            fileInfo.textContent = '';
        }
    });
});

function handleFileUpload(file) {
    // Check if it's a GPX file
    if (!file.name.toLowerCase().endsWith('.gpx')) {
        alert('Please select a GPX file.');
        return;
    }

    // Read the file content
    const reader = new FileReader();

    reader.onload = function (e) {
        const gpxContent = e.target.result;
        console.log('GPX file loaded:', file.name);
        console.log('Content preview:', gpxContent.substring(0, 200) + '...');

        // Here you can add your GPX processing logic
        parseGPX(gpxContent);

        // Example: Show success message
        const fileInfo = document.getElementById('file-info');
        fileInfo.innerHTML = `✅ GPX file loaded successfully! <small>(Check console for details)</small>`;
        fileInfo.style.color = '#28a745';
    };

    reader.onerror = function () {
        alert('Error reading the file.');
    };

    reader.readAsText(file);
}
