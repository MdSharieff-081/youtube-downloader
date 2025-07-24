// // frontend/script.js
// function startDownload() {
//   const url = document.getElementById('urlInput').value;
//   const format = document.getElementById('formatSelect').value;
//   const status = document.getElementById('statusMessage');

//   if (!url) {
//     status.textContent = "Please enter a YouTube URL.";
//     status.style.color = "red";
//     return;
//   }

//   status.textContent = "Starting download...";
//   status.style.color = "blue";

//   fetch(`http://localhost:3000/download?url=${encodeURIComponent(url)}&format=${format}`)
//     .then(response => {
//       if (!response.ok) throw new Error('Network response was not ok');
//       status.textContent = "Downloading...";
//       return response.blob();
//     })
//     .then(blob => {
//       const blobUrl = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = blobUrl;
//       a.download = `${Date.now()}.${format === 'mp3' ? 'mp3' : 'mp4'}`;
//       a.click();
//       window.URL.revokeObjectURL(blobUrl);
//       status.textContent = "Download complete!";
//       status.style.color = "green";
//     })
//     .catch(error => {
//       console.log(error);
//       status.textContent = "Download failed. Please try again.";
//       status.style.color = "red";
//     });
// }
