package com.foxboard.foxwidget;

import android.app.Activity;
import android.content.Intent;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Build;
import android.os.Bundle;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;

public class introActivity extends Activity {
    protected ImageView introimg;

    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.intro);
        this.introimg = (ImageView) findViewById(R.id.introimg);
        SoundManager soundManager;
        soundManager =new SoundManager(this);
        soundManager.addSound("intro",R.raw.intro);
        soundManager.playSound("intro");
    }

    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        Animation translate = AnimationUtils.loadAnimation(this, R.anim.alpha);
        translate.setAnimationListener(new Animation.AnimationListener() {
            /* class com.foxboard.foxwidget.introActivity.AnonymousClass1 */

            public void onAnimationStart(Animation arg0) {
                introActivity.this.introimg.setVisibility(0);
            }

            public void onAnimationRepeat(Animation arg0) {
            }

            public void onAnimationEnd(Animation arg0) {
                introActivity.this.startActivity(new Intent(introActivity.this, MainActivity.class));
                introActivity.this.onPause();
            }
        });
        this.introimg.startAnimation(translate);
    }

    public void onPause() {
        super.onPause();
        finish();
    }
}
