# QLSV

A 9:16 Vietnamese student dashboard built with HTML, CSS and JavaScript. Open `index.html` or serve this directory with `python3 -m http.server 8000`. For home-screen installation, open the app over HTTPS and use your browser’s Add to Home Screen action.

Tap the QR code to open the profile. Tap a value to edit it, or tap the portrait to select a photo. The dashboard and profile share student details. Measurements save as you type. Tap the contact name or number on the dashboard to edit the contact.

**Vắng học** opens the attendance notice. **Đơn ra vào cổng** opens a local sample gate request. Hold the green bubble still for five seconds to edit its timestamp and text. Keyboard users can focus the bubble and press Enter. **Tạo đơn** adds another local entry.

Edits are stored in localStorage for the current browser and origin. The app has no server submission, school authentication or approval workflow. The password row stores only the length of its display mask. Clearing site data removes local edits.
