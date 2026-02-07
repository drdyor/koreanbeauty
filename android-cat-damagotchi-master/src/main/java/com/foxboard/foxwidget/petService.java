package com.foxboard.foxwidget;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.drawable.AnimationDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.Random;

public class petService extends Service {
    ImageView charact;
    TextView chatV;
    Animation chatstart;
    private AnimationDrawable frameAnimation;
    View mView;
    int motion = 0;
    Random random = new Random();
    String whatchat = " ";
    WindowManager wm;
    WindowManager.LayoutParams wmparams;

    public IBinder onBind(Intent intent) {
        return null;
    }

    public void startOverlayWindowService(){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Toast.makeText(this,"오버레이 권한을 수락해주세요.", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); //Activity가 아닌곳에서 호출하려면 필요
            startActivity(intent);
            /**
             화면이 띄워진 상황에서 다른 액티비티를 호출하는 것은 문제가없으나,
             지금은 따로 띄워진 화면이 없는 상태에서 백그라운드에서 실행중인 서비스가 액티비티를 호출하는 상황이다.
             이러한 경우에는 FLAG_ACTIVITY_NEW_TASK 옵션(플래그)을 사용해줘야 한다.
             **/
            /**
            PendingIntent pendingintent = PendingIntent.getActivity(this,0,intent,0); //pendingIntent를 사용한 방법
            try{
                pendingintent.send();
            }catch(PendingIntent.CanceledException e){
                e.printStackTrace();
            }
            **/
            startActivity(intent);
        }
    }

    public void onCreate() {
        super.onCreate();
        startOverlayWindowService();
        this.wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        wmparams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,                PixelFormat.TRANSLUCENT);
        wmparams.gravity = Gravity.RIGHT| Gravity.TOP;
        wmparams.x = 100;
        wmparams.y = 200;
        //wm.updateViewLayout(mView,wmparams);
        this.mView = ((LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE)).inflate(R.layout.wmview, (ViewGroup) null);
        this.chatV = (TextView) this.mView.findViewById(R.id.chat);
        this.charact = (ImageView) this.mView.findViewById(R.id.charact);
        this.charact.setImageResource(R.drawable.pk_walk_anim);
        this.chatV.setText(this.whatchat);
        this.charact.setOnClickListener(new View.OnClickListener() {
            /* class com.foxboard.foxwidget.petService.AnonymousClass1 */

            public void onClick(View v) {
                petService.this.motion = petService.this.random.nextInt(3);
                switch (petService.this.motion) {
                    case 0:
                        petService.this.remotion(0, "영차영차..");
                        return;
                    case 1:
                        petService.this.remotion(1, ". . . !..");
                        return;
                    case 2:
                        petService.this.remotion(1, "밥줘..어..");
                        return;
                    case 3:
                        petService.this.remotion(1, "안녕! ");
                        return;
                    default:
                        return;
                }
            }
        });
        this.wm.addView(this.mView, wmparams);
        this.frameAnimation = (AnimationDrawable) this.charact.getDrawable();
        this.frameAnimation.start();
        this.chatstart = AnimationUtils.loadAnimation(this, R.anim.chatstart);
    }

    public void remotion(int motionnum, String whatchat2) throws RuntimeException {
        this.frameAnimation.stop();
        switch (motionnum) {
            case 0:
                this.charact.setImageResource(R.drawable.pk_walk_anim);
                break;
            case 1:
                this.charact.setImageResource(R.drawable.pk_wake_anim);
                break;
        }
        this.frameAnimation = (AnimationDrawable) this.charact.getDrawable();
        this.frameAnimation.start();
        if (whatchat2 != null) {
            this.chatV.setText(whatchat2);
            this.chatV.setVisibility(View.INVISIBLE);
            this.chatV.startAnimation(this.chatstart);
            this.chatstart.setAnimationListener(new Animation.AnimationListener() {
                /* class com.foxboard.foxwidget.petService.AnonymousClass2 */

                public void onAnimationStart(Animation arg0) {
                }

                public void onAnimationRepeat(Animation arg0) {
                }

                public void onAnimationEnd(Animation arg0) {
                    petService.this.chatV.setVisibility(View.VISIBLE);
                    petService.this.remotion(0, null);
                }
            });
            return;
        }
        this.chatV.setVisibility(View.INVISIBLE);
    }

    public void onDestroy() {
        super.onDestroy();
        if (this.wm != null) {
            if (this.mView != null) {
                this.wm.removeView(this.mView);
                this.mView = null;
            }
            this.wm = null;
        }
    }
}
