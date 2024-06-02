document.addEventListener('DOMContentLoaded', () => {
    let startTime;
    let timerInterval;
    const callTimingElement = document.getElementById('call-timing');
    const joinButton = document.getElementById('join-btn');
    const userCountElement = document.getElementById('user-count');
    let localUserId;
    let remoteUsers = {};

    const startCallTimer = () => {
        startTime = Date.now();
        timerInterval = setInterval(updateCallTime, 1000);
    };

    const updateCallTime = () => {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        callTimingElement.textContent = `${pad(minutes)}:${pad(seconds)}`;
    };

    const pad = (num) => {
        return num < 10 ? '0' + num : num;
    };

    const updateUserCount = () => {
        const totalUsers = Object.keys(remoteUsers).length + 1; // +1 for the local user
        if (totalUsers === 2) {
            userCountElement.textContent = `You and ${Object.keys(remoteUsers)[0]}`;
        } else if (totalUsers > 2) {
            userCountElement.textContent = `You and ${totalUsers - 1} others`;
        } else {
            userCountElement.textContent = `You`;
        }
    };

    const stopCallTimer = () => {
        clearInterval(timerInterval);
    };

    // Initialize Agora RTC client
    let client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Agora RTC configuration
    let config = {
        appid: "279b4ee2efca4b03ab11f369a80abfd9",
        token: "007eJxTYIhXSF+0qn/+twSlx25mjyRSLAr2JBnbl4ff136ZGDKxf4kCg5G5ZZJJaqpRalpyokmSgXFikqFhmrGZZaKFQWJSWorlr49RaQ2BjAy3D+awMDJAIIjPxZCTWZZaXFKUmpjLwAAAMdkjZQ==",
        uid: null,
        channel: "livestream"
    };

    let localTracks = {
        audioTrack: null,
        videoTrack: null
    };

    let localTrackState = {
        audioTrackMuted: false,
        videoTrackMuted: false
    };

    document.getElementById('join-btn').addEventListener('click', async () => {
        config.uid = document.getElementById('username').value;
        await joinStreams();
        document.getElementById('join-wrapper').style.display = 'none';
        document.getElementById('footer').style.display = 'flex';
        startCallTimer();
    });

    document.getElementById('mic-btn').addEventListener('click', async () => {
        if (!localTrackState.audioTrackMuted) {
            await localTracks.audioTrack.setMuted(true);
            localTrackState.audioTrackMuted = true;
            document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)';
        } else {
            await localTracks.audioTrack.setMuted(false);
            localTrackState.audioTrackMuted = false;
            document.getElementById('mic-btn').style.backgroundColor = '#1f1f1f8e';
        }
    });

    document.getElementById('camera-btn').addEventListener('click', async () => {
        if (!localTrackState.videoTrackMuted) {
            await localTracks.videoTrack.setMuted(true);
            localTrackState.videoTrackMuted = true;
            document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)';
        } else {
            await localTracks.videoTrack.setMuted(false);
            localTrackState.videoTrackMuted = false;
            document.getElementById('camera-btn').style.backgroundColor = '#1f1f1f8e';
        }
    });

    document.getElementById('leave-btn').addEventListener('click', async () => {
        for (let trackName in localTracks) {
            let track = localTracks[trackName];
            if (track) {
                track.stop();
                track.close();
                localTracks[trackName] = null;
            }
        }
        await client.leave();
        stopCallTimer();
        document.getElementById('footer').style.display = 'none';
        document.getElementById('user-streams').innerHTML = '';
        document.getElementById('join-wrapper').style.display = 'block';
        updateUserCount(); // Update user count on leave
    });

    const joinStreams = async () => {
        client.on("user-published", handleUserJoined);
        client.on("user-left", handleUserLeft);

        client.enableAudioVolumeIndicator();
        client.on("volume-indicator", function(evt) {
            for (let i = 0; evt.length > i; i++) {
                let speaker = evt[i].uid;
                let volume = evt[i].level;
                if (volume > 0) {
                    document.getElementById(`volume-${speaker}`).src = './assets/volume-on.svg';
                } else {
                    document.getElementById(`volume-${speaker}`).src = './assets/volume-off.svg';
                }
            }
        });

        [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
            client.join(config.appid, config.channel, config.token || null, config.uid || null),
            AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createCameraVideoTrack()
        ]);

        let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${config.uid}" src="./assets/volume-on.svg" /> ${config.uid}</p>
                        <div class="video-player player" id="stream-${config.uid}"></div>
                      </div>`;

        document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
        localTracks.videoTrack.play(`stream-${config.uid}`);
        await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
        updateUserCount(); // Update user count on join
    };

    const handleUserJoined = async (user, mediaType) => {
        remoteUsers[user.uid] = user;
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
            let player = document.getElementById(`video-wrapper-${user.uid}`);
            if (player != null) {
                player.remove();
            }

            player = `<div class="video-containers" id="video-wrapper-${user.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${user.uid}" src="./assets/volume-on.svg" /> ${user.uid}</p>
                        <div class="video-player player" id="stream-${user.uid}"></div>
                      </div>`;
            document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
            user.videoTrack.play(`stream-${user.uid}`);
        }

        if (mediaType === 'audio') {
            user.audioTrack.play();
        }
        updateUserCount(); // Update user count on user join
    };

    const handleUserLeft = (user) => {
        delete remoteUsers[user.uid];
        document.getElementById(`video-wrapper-${user.uid}`).remove();
        updateUserCount(); // Update user count on user leave
    };
});