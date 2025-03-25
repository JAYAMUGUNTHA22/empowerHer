document.addEventListener("DOMContentLoaded", function () {
    
    // Navigate to different pages
    function navigateTo(page) {
        window.location.href = page;
    }
    window.navigateTo = navigateTo;

    /*** FRIENDS MANAGEMENT ***/
    let friendList = JSON.parse(localStorage.getItem("friends")) || [];

    function addFriend() {
        let name = document.getElementById("friendName").value;
        let phone = document.getElementById("friendPhone").value;

        if (name && phone) {
            friendList.push({ name, phone });
            localStorage.setItem("friends", JSON.stringify(friendList));
            alert("Friend added successfully!");
            document.getElementById("friendName").value = "";
            document.getElementById("friendPhone").value = "";
        } else {
            alert("Please enter both name and phone number.");
        }
    }
    window.addFriend = addFriend;

    if (document.getElementById("friendList")) {
        document.getElementById("friendList").innerHTML = friendList.map(f => `
            <div class="friend">
                <p><strong>${f.name}</strong></p>
                <p>${f.phone}</p>
            </div>
        `).join("");
    }

    /*** RECORDING FUNCTIONALITY ***/
    let mediaRecorder, audioChunks = [], audioBlob, audio, isRecording = false;
    let timerInterval, seconds = 0;

    const recordBtn = document.getElementById("recordBtn");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const timerElement = document.getElementById("timer");

    function updateTimer() {
        seconds++;
        let min = Math.floor(seconds / 60);
        let sec = seconds % 60;
        timerElement.textContent = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }

    async function startRecording() {
        let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        isRecording = true;
        recordBtn.textContent = "⏹ Stop";
        audioChunks = [];
        timerInterval = setInterval(updateTimer, 1000);

        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

        mediaRecorder.onstop = () => {
            clearInterval(timerInterval);
            recordBtn.textContent = "🎤 Record";
            audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
            let url = URL.createObjectURL(audioBlob);
            let recordings = JSON.parse(localStorage.getItem("recordings")) || [];
            recordings.push({ url, time: new Date().toLocaleString() });
            localStorage.setItem("recordings", JSON.stringify(recordings));

            playBtn.classList.remove("hidden");
        };
    }

    recordBtn?.addEventListener("click", function () {
        if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
        } else {
            startRecording();
        }
    });

    playBtn?.addEventListener("click", function () {
        if (audioBlob) {
            audio = new Audio(URL.createObjectURL(audioBlob));
            audio.play();
            playBtn.classList.add("hidden");
            pauseBtn.classList.remove("hidden");
        }
    });

    pauseBtn?.addEventListener("click", function () {
        if (audio) {
            audio.pause();
            playBtn.classList.remove("hidden");
            pauseBtn.classList.add("hidden");
        }
    });

    if (document.getElementById("recordingList")) {
        let recordings = JSON.parse(localStorage.getItem("recordings")) || [];
        document.getElementById("recordingList").innerHTML = recordings.map(r => `
            <div class="record-item">
                <p>${r.time}</p>
                <audio controls src="${r.url}"></audio>
            </div>
        `).join("");
    }

    /*** MAP FUNCTIONALITY ***/
    let map;

    function initMap() {
        const center = { lat: 11.1085, lng: 77.3411 }; // Tirupur, Tamil Nadu
        map = new google.maps.Map(document.getElementById("map"), {
            center: center,
            zoom: 15,
        });

        const safeAreaCoords = [
            { lat: 11.1088, lng: 77.3420 },
            { lat: 11.1100, lng: 77.3445 },
            { lat: 11.1115, lng: 77.3430 },
            { lat: 11.1095, lng: 77.3410 }
        ];

        const dangerAreaCoords = [
            { lat: 11.1060, lng: 77.3395 },
            { lat: 11.1075, lng: 77.3410 },
            { lat: 11.1085, lng: 77.3400 },
            { lat: 11.1070, lng: 77.3380 }
        ];

        const safeArea = new google.maps.Polygon({
            paths: safeAreaCoords,
            strokeColor: "#FFA500",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FFD700",
            fillOpacity: 0.35,
        });

        const dangerArea = new google.maps.Polygon({
            paths: dangerAreaCoords,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF4500",
            fillOpacity: 0.35,
        });

        safeArea.setMap(map);
        dangerArea.setMap(map);

        google.maps.event.addListener(safeArea, 'click', function () {
            alert("Safe Area: This place is generally safe.");
        });

        google.maps.event.addListener(dangerArea, 'click', function () {
            alert("⚠ Danger Area: This place is dark and unsafe.");
        });

    }
    window.initMap = initMap;
});
