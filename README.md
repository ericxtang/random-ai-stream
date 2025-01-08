
# 24/7 AI Live Streams, Building Using Livepeer

This is a demo app for Livepeer real time video AI pipelines. See example at https://random-ai-stream.vercel.app/

## Getting Started

To run your own AI videos, you should:
1. Create AI stream: Create AI stream in the pipeline app (https://pipelines.livepeer.org/)
2. Ingest: Use a tool like ffmpeg to ingest into the stream
3. Add audio: Subscribe to the output of the AI stream, and add audio track
4. Monitor and restart: Make sure the video can be restarted when it's not working
5. Run the applications

### 1.Create AI Stream
You need an input video. Some people use personal videos, some people download videos from other platforms with tools like `yt-dlp`.  You are responsbile comply to usage license.

You can go to the pipleine app (https://pipelines.livepeer.org/) to create a stream by picking a pipeline. The stream should have an ingest URL and a output URL.

### 2.Ingest
Use a tool like `ffmpeg` to stream into the ingest URL. I also used systemd to make sure there is auto restart in case there is instability.

Example systemd file: /etc/systemd/system/ballet.service
```
[Unit]
Description=Ballet FFMPEG Stream
After=network.target

[Service]
# We'll assume ffmpeg is in /usr/bin/ffmpeg. 
# If it's elsewhere, use the absolute path to ffmpeg.

ExecStart=/usr/bin/ffmpeg -re -stream_loop 0 -fflags +genpts -f concat -safe 0 \
          -i /root/ballet/{video_playlist}.txt \
          -c:v copy \
          -flvflags no_duration_filesize \
          -f flv \
          {ingest_url}

# Restart the service on failure
Restart=always
# Wait 5 seconds before restarting
StandardOutput=file:/var/log/ballet.out
StandardError=file:/var/log/ballet.err

# (Optional) Run as root or another user
User=root

# systemd "simple" means we assume it runs in the foreground
Type=simple

[Install]
WantedBy=multi-user.target
```

### 3.Add audio (music)
Create a stream ingest URL for playback. You can use a developer tool like Livepeer Studio (https://livepeer.studio/). 

Use a tool like `ffmpeg` to take the output from the AI stream, and add an audio track to it. I used license free music from the internet.

This should give you a video output with music.
```
[Unit]
Description=Ballet Audio FFMPEG Stream
After=network.target

[Service]
# We'll assume ffmpeg is in /usr/bin/ffmpeg. 
# If it's elsewhere, use the absolute path to ffmpeg.

ExecStart=/usr/bin/ffmpeg -re -i {AI_Stream_Output_URL} \
           -re -stream_loop -1 -f concat -safe 0 -i /root/ballet/{Audio_Playlist}.txt \
           -filter_complex "[0:v:0]scale=720:720[v];[1:a:0]anull[a]" \
           -map "[v]" -map "[a]" \
           -c:v libx264 -preset veryfast \
           -c:a aac -b:a 128k -ar 44100 \
           -f flv {Stream_Ingest_URL}

# Restart the service on failure
Restart=always
# Wait 5 seconds before restarting
RestartSec=10
StandardOutput=file:/var/log/{stream_name}_audio.out
StandardError=file:/var/log/{stream_name}_audio.err

# (Optional) Run as root or another user
User=root

# systemd "simple" means we assume it runs in the foreground
Type=simple

[Install]
WantedBy=multi-user.target
```

There is a variable called `streamLinks` in `stream-status.js`.  This represents all of the available streams in the app.
* "musicLink": music stream playback URL
* "musicStreamID": Livepeer Studio stream ID for the music stream
* "name": any name
* "sourceStreamID": Livepeer Studio stream ID for the AI stream
I "sourceLink": AI stream playback URL

### 4. Monitor and restart: Make sure the video can be restarted when it's not working
Now that we've set up systemd for monitoring the ffmpeg processes, we need to setup monitoring script for the output, so we can restart the ffmepg commands if the stream silently dies.  Here is a monitoring script:
```
#!/bin/bash

SOURCE_PLAYBACK_ID={Livepeer_Studio_Playback_ID}
SOURCE_SERVICE={systemd_Service_Name_For_AI_Stream}
AUDIO_SERVICE={systemd_Service_Name_For_Audio_Stream}

# Check if service  and audio service are installed
if ! systemctl list-unit-files --type=service | grep -q "^$SOURCE_SERVICE.service"; then
  echo "Error: source service is not installed."
  exit 1
fi
if ! systemctl list-unit-files --type=service | grep -q "^$AUDIO_SERVICE.service"; then
  echo "Error: audio service is not installed."
  exit 1
fi

echo "Both 'ballet' and 'ballet_audio' services are installed. Continuing..."

function check_hls_playlist {
    local playback_id="$1"
    local url="https://livepeercdn.studio/hls/$playback_id/index.m3u8"

    for attempt in {1..5}; do
        echo "Checking $SOURCE_SERVICE HLS playlist (Attempt $attempt): $url"
        local response
        response=$(curl -L -s "$url")

        if echo "$response" | grep -q "#EXT-X-STREAM-INF"; then
            echo "Valid HLS playlist found."
            return 0
        fi

        (( attempt < 5 )) && echo "Retrying in 3 seconds..." && sleep 3
    done

    echo "No valid HLS playlist found after 5 attempts."
    return 1
}

while true; do
        if check_hls_playlist $SOURCE_PLAYBACK_ID; then
                echo "do nothing"
        else
                echo "restarting source service"
                systemctl restart $SOURCE_SERVICE
                sleep 90
                echo "restarting audio service"
                systemctl restart $AUDIO_SERVICE
        fi
        sleep 30
done
```

### 5. Run the applications
Make sure you set the following environment variables:
```
LP_API_TOKEN={Livepeer Studio API Token}
NEXT_PUBLIC_COVER_VIDEO_URL={Cover Video URL in HLS}
```

Run `npm install`
Run `npm run dev`