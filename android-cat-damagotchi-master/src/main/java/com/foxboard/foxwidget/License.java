package com.foxboard.foxwidget;

import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.MediaController;
import android.widget.VideoView;

public class License extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.license);

        final VideoView videoView = (VideoView)findViewById(R.id.videoView);
        Uri videourl = Uri.parse("android.resource://" + getPackageName()+"/"+R.raw.test_movie);
        videoView.setVideoURI(videourl);
        final MediaController mediaController = new MediaController(this);
        //mediaController.setAnchorView(videoView);
        videoView.setMediaController(mediaController);
        videoView.requestFocus();
        videoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            // 동영상 재생준비가 완료된후 호출되는 메서드
            @Override
            public void onPrepared(MediaPlayer mp) {
                //이부분을 하지않으면, 맨처음에 VideoPlayer 에 검은화면이 나오므로, 해주셔야합니다~
                videoView.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        mediaController.show(0);
                        videoView.start();
                    }
                }, 500);
            }
        });
        videoView.start();
    }
}
